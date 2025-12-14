// contact.js — Final Stable (Text-based + Fuzzy Vet Match)
console.log("✅ contact.js is running");

document.addEventListener("DOMContentLoaded", async function () {
  // -----------------------------
  // DOM ELEMENTS
  // -----------------------------
  const form = document.getElementById("appointmentForm");
  const successMessage = document.getElementById("successMessage");
  const categorySelect = document.getElementById("animalCategory");
  const animalSelect = document.getElementById("animal");
  const animalTypeContainer = document.getElementById("animalTypeContainer");
  const serviceSelect = document.getElementById("service");
  const petServicesContainer = document.getElementById("petServicesContainer");
  const breedContainer = document.getElementById("breedContainer");
  const breedSelect = document.getElementById("breed");
  const locationInput = document.getElementById("location");
  const suggestions = document.getElementById("suggestions");
  const vetNotice = document.getElementById("vetNotice");

  if (!form || !locationInput) {
    console.error("❌ Required DOM elements missing — aborting contact.js init.");
    return;
  }

  // -----------------------------
  // STATIC ANIMAL CATEGORIES
  // -----------------------------
  const animals = {
    Pet: ["Dog", "Cat", "Rabbit"],
    Livestock: ["Cattle", "Goat", "Sheep", "Pig"],
    Equine: ["Horse", "Donkey", "Mule"]
  };

  const breeds = {
    Dog: ["German Shepherd", "Labrador", "Bulldog", "Beagle"],
    Cat: ["Siamese", "Persian", "Maine Coon"],
    Rabbit: ["Dutch", "Lionhead", "Mini Rex"],
    Cattle: ["Friesian", "Jersey", "Ayrshire"],
    Goat: ["Boer", "Saanen", "Alpine"],
    Sheep: ["Dorper", "Merino", "Suffolk"],
    Pig: ["Landrace", "Large White", "Duroc"],
    Horse: ["Thoroughbred", "Arabian", "Quarter Horse"],
    Donkey: ["Standard Donkey", "Miniature Donkey"],
    Mule: ["Draft Mule", "Riding Mule"]
  };

  // -----------------------------
  // STATE
  // -----------------------------
  let vets = [];
  let currentPlace = null;

  // -----------------------------
  // HELPERS
  // -----------------------------
  function normalizeText(s) {
    return s
      ? s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").trim()
      : "";
  }

  // Simple Levenshtein distance
  function levenshtein(a, b) {
    const m = [];
    const alen = a.length;
    const blen = b.length;

    if (!alen) return blen;
    if (!blen) return alen;

    for (let i = 0; i <= blen; i++) m[i] = [i];
    for (let j = 0; j <= alen; j++) m[0][j] = j;

    for (let i = 1; i <= blen; i++) {
      for (let j = 1; j <= alen; j++) {
        const cost = a[j - 1] === b[i - 1] ? 0 : 1;
        m[i][j] = Math.min(
          m[i - 1][j] + 1,
          m[i][j - 1] + 1,
          m[i - 1][j - 1] + cost
        );
      }
    }
    return m[blen][alen];
  }

  function similarity(a, b) {
    a = normalizeText(a);
    b = normalizeText(b);
    if (!a || !b) return 0;
    const dist = levenshtein(a, b);
    return 1 - dist / Math.max(a.length, b.length);
  }

  // -----------------------------
  // LOAD VETS FROM BACKEND
  // -----------------------------
  async function loadVets() {
    const url = "/api/fetch-vets.php"; // Local API endpoint

    try {
      const res = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" }
      });

      const text = await res.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("⚠️ Invalid JSON from backend:", text);
        vets = [];
        updateVetNotice();
        return;
      }

      if (!Array.isArray(data)) {
        console.warn("⚠️ Invalid vet array structure:", data);
        vets = [];
        updateVetNotice();
        return;
      }

      // Normalize vets
      vets = data.map(v => ({
        id: v.id || `vet_${Math.random().toString(36).slice(2, 9)}`,
        name: v.name || "",
        location: v.location || "",
        services: Array.isArray(v.services)
          ? v.services
          : String(v.services || "")
              .split(",")
              .map(s => s.trim())
              .filter(Boolean)
      }));

      console.log("✅ Vets loaded:", vets);
      updateVetNotice();
    } catch (err) {
      console.error("❌ Error loading vets:", err);
      vets = [];
      updateVetNotice();
    }
  }

  await loadVets();

  // -----------------------------
  // FORM SUBMISSION
  // -----------------------------
  form.addEventListener("submit", async e => {
    e.preventDefault();
    const data = new FormData(form);

    try {
      const res = await fetch(form.action, {
        method: form.method,
        body: data,
        headers: { Accept: "application/json" }
      });

      if (res.ok) {
        successMessage.style.display = "block";
        setTimeout(() => (successMessage.style.display = "none"), 5000);
        form.reset();
        await loadVets();
      } else {
        alert("❌ There was a problem submitting your form.");
      }
    } catch {
      alert("❌ Network error submitting your form.");
    }
  });

  // -----------------------------
  // DYNAMIC FORM LOGIC
  // -----------------------------
  function updateForm() {
    const category = categorySelect.value;
    const animal = animalSelect.value;
    const service = serviceSelect.value;

    if (animals[category]) {
      animalTypeContainer.style.display = "block";
      animalSelect.innerHTML = "<option value=''>-- Select Animal --</option>";
      animals[category].forEach(a => {
        const opt = document.createElement("option");
        opt.value = a;
        opt.textContent = a;
        animalSelect.appendChild(opt);
      });
      if (animals[category].includes(animal)) animalSelect.value = animal;
    } else {
      animalTypeContainer.style.display = "none";
      animalSelect.innerHTML = "";
    }

    petServicesContainer.style.display = category === "Pet" ? "block" : "none";

    if (service === "Artificial Insemination" && breeds[animal]) {
      breedContainer.style.display = "block";
      breedSelect.innerHTML = "";
      breeds[animal].forEach(b => {
        const opt = document.createElement("option");
        opt.value = b;
        opt.textContent = b;
        breedSelect.appendChild(opt);
      });
    } else {
      breedContainer.style.display = "none";
      breedSelect.innerHTML = "";
    }

    updateVetNotice();
  }

  categorySelect.addEventListener("change", updateForm);
  animalSelect.addEventListener("change", updateForm);
  serviceSelect.addEventListener("change", updateForm);

  // -----------------------------
  // LOCATION AUTOCOMPLETE
  // -----------------------------
  let debounceTimer;
  let selectedIndex = -1;

  locationInput.addEventListener("input", function () {
    const query = this.value.trim();
    clearTimeout(debounceTimer);
    selectedIndex = -1;
    currentPlace = null;

    if (query.length < 3) {
      suggestions.innerHTML = "";
      updateVetNotice();
      return;
    }

    debounceTimer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query
          )}&addressdetails=1&countrycodes=KE&limit=5`
        );
        const data = await res.json();
        suggestions.innerHTML = "";
        data.forEach(place => {
          const li = document.createElement("li");
          li.textContent = place.display_name;
          li.addEventListener("click", () => selectSuggestion(place));
          suggestions.appendChild(li);
        });
      } catch (err) {
        console.error("❌ Nominatim error:", err);
      }
    }, 400);
  });

  function selectSuggestion(place) {
    locationInput.value = place.display_name;
    suggestions.innerHTML = "";
    currentPlace = place;
    updateForm();
  }

  // -----------------------------
  // VET AVAILABILITY (FUZZY MATCH)
  // -----------------------------
  function updateVetNotice() {
    if (!vetNotice) return;

    const locationText = locationInput.value.trim();
    const location = normalizeText(locationText);
    const service = serviceSelect.value.trim().toLowerCase();

    vetNotice.textContent = "";
    vetNotice.className = "vet-notice";
    vetNotice.style.display = "none";

    if (!location) return;

    let matchedVets = vets.filter(v => {
      const vetLoc = normalizeText(v.location || "");
      const sim = similarity(location, vetLoc);
      return sim >= 0.4 || vetLoc.includes(location) || location.includes(vetLoc);
    });

    if (matchedVets.length) {
      if (!service) {
        vetNotice.textContent = `✅ Vets are available near ${locationInput.value}. Select a service to confirm availability.`;
        vetNotice.classList.add("success");
      } else {
        const providers = matchedVets.filter(v =>
          v.services.some(s => normalizeText(s).includes(normalizeText(service)))
        );

        if (providers.length) {
          const list = providers
            .map(v => `<li><strong>${v.name}</strong> — ${v.services.join(", ")}</li>`)
            .join("");
          vetNotice.innerHTML = `✅ The following vets provide <b>${service}</b> in ${locationInput.value}:<ul>${list}</ul>`;
          vetNotice.classList.add("success");
        } else {
          vetNotice.textContent = `❌ No vet provides ${service} in ${locationInput.value}.`;
          vetNotice.classList.add("error");
        }
      }
    } else {
      vetNotice.textContent = `❌ No vet found near ${locationInput.value}.`;
      vetNotice.classList.add("error");
    }

    vetNotice.style.display = "block";
  }

  document.addEventListener("click", e => {
    if (e.target !== locationInput && suggestions) suggestions.innerHTML = "";
  });
});












