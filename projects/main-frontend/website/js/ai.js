document.addEventListener("DOMContentLoaded", function () {
  const input = document.getElementById("aiInput");
  const sendBtn = document.getElementById("aiSend");
  const chat = document.getElementById("aiChat");

  // Acronyms & synonyms dictionary
  const termMap = {
    "fmd": "foot and mouth disease",
    "rabies": "rabies in animals",
    "cpv": "canine parvovirus",
    "kennel cough": "canine infectious tracheobronchitis",
    "ai": "artificial insemination in animals",
    "bvd": "bovine viral diarrhea",
    "brucellosis": "brucellosis in cattle"
  };

  // Append message to chat
  function appendMessage(sender, text) {
    const msg = document.createElement("div");
    msg.className = sender;
    msg.innerHTML = `<strong>${sender === "user" ? "You" : "Animora AI"}:</strong> ${text}`;
    chat.appendChild(msg);
    chat.scrollTop = chat.scrollHeight;
  }

  // Levenshtein distance (typo tolerance)
  function levenshtein(a, b) {
    const matrix = Array.from({ length: a.length + 1 }, () => []);
    for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        if (a[i - 1] === b[j - 1]) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j - 1] + 1
          );
        }
      }
    }
    return matrix[a.length][b.length];
  }

  // Fuzzy match with dictionary
  function fuzzyMatch(query) {
    query = query.toLowerCase().trim();

    if (termMap[query]) return termMap[query];

    let closest = null;
    let minDistance = Infinity;

    for (let key in termMap) {
      const dist = levenshtein(query, key);
      if (dist < minDistance && dist <= 2) {
        minDistance = dist;
        closest = termMap[key];
      }
    }

    return closest || query;
  }

  // Fetch structured Wikipedia summary
  async function getSummary(query) {
    try {
      const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
      const res = await fetch(url);
      if (!res.ok) return null;
      const data = await res.json();

      let summary = `<strong>${data.title}</strong><br>`;
      if (data.description) {
        summary += `<em>Classification:</em> ${data.description}<br>`;
      }
      if (data.extract) {
        summary += `${data.extract}<br>`;
      }
      summary += `<a href="${data.content_urls.desktop.page}" target="_blank">Read more on Wikipedia</a>`;

      return summary;
    } catch (err) {
      return null;
    }
  }

  // AI search function
  async function search(query) {
    let finalQuery = fuzzyMatch(query);

    // Try summary first
    let summary = await getSummary(finalQuery);
    if (summary) return summary;

    // Fallback to snippet search
    try {
      const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(finalQuery)}&utf8=&format=json&origin=*`;
      const wikiRes = await fetch(wikiUrl);
      const wikiData = await wikiRes.json();

      if (wikiData.query.search.length > 0) {
        const pageTitle = wikiData.query.search[0].title;
        const pageSnippet = wikiData.query.search[0].snippet.replace(/<\/?[^>]+(>|$)/g, "");
        const pageUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(pageTitle)}`;
        return `${pageTitle}: ${pageSnippet}... <a href="${pageUrl}" target="_blank">Read more</a>`;
      }

      // Last fallback: YouTube
      const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(finalQuery)}`;
      return `I couldn’t find a detailed article, but you can explore videos here: <a href="${ytUrl}" target="_blank">YouTube results for ${finalQuery}</a>`;

    } catch (err) {
      return "Sorry, something went wrong while searching 🐾";
    }
  }

  // Handle send
  async function handleSend() {
    const query = input.value.trim();
    if (!query) return;

    appendMessage("user", query);
    input.value = "";

    appendMessage("ai", "Thinking... 🐾"); // ⏳ show loading state

    const result = await search(query);

    // Replace "thinking" with actual result
    chat.lastChild.innerHTML = `<strong>Animora AI:</strong> ${result}`;
  }

  // Events
  sendBtn.addEventListener("click", handleSend);
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") handleSend();
  });
});



