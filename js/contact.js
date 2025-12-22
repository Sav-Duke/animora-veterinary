// contact.js — Final Stable (Text-based + Fuzzy Vet Match)
console.log("✅ contact.js is running");

document.addEventListener("DOMContentLoaded", async function () {
    // PET LOGIC (Single source of truth)
    const petsContainer = document.getElementById('petsContainer');
    const petFields = document.getElementById('petFields');
    const addPetBtn = document.getElementById('addPetBtn');
    let petCount = 0;

    function addPetField(name = '', type = '') {
      petCount++;
      const div = document.createElement('div');
      div.className = 'pet-entry';
      div.style.marginBottom = '8px';
      div.innerHTML = `
        <input type="text" name="petName${petCount}" placeholder="Pet Name" value="${name}" required style="margin-right:6px;max-width:120px;">
        <input type="text" name="petType${petCount}" placeholder="Pet Type" value="${type}" required style="max-width:120px;">
        <button type="button" class="removePetBtn" style="margin-left:6px;">Remove</button>
      `;
      petFields.appendChild(div);
      div.querySelector('.removePetBtn').onclick = function() {
        div.remove();
      };
    }

    if (addPetBtn) {
      addPetBtn.onclick = function() {
        addPetField();
      };
    }

    // Expose for dynamic logic
    window.showPetsSection = function(show) {
      petsContainer.style.display = show ? 'block' : 'none';
      if (show) {
        if (petFields.children.length === 0) {
          // contact.js — Modern, robust, and reliable dynamic form logic
          console.log("✅ contact.js loaded");


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
  // Service options by animal category/type
  const serviceOptions = {
    Pet: [
      "General Check-up", "Vaccination", "Deworming", "Dental Care", "Grooming", "Microchipping", "Spay and Neuter", "Behavioral Consultation", "Emergency Services", "Consultation", "Follow-up Care"
    ],
    Livestock: [
      "General Check-up", "Vaccination", "Deworming", "Artificial Insemination", "Lab Test", "Breed Selection", "Surgery Consultation", "Dental Care", "Emergency Services", "Parasite Control", "Nutritional Planning", "Reproductive Health Monitoring", "Pregnancy Diagnosis", "Ultrasound Imaging", "X-ray Diagnostics", "Herd Health Management", "Farm Visits", "Biosecurity Assessment", "Housing and Hygiene Evaluation", "Neonatal Care", "Hoof Trimming", "Castration", "Dehorning", "Wound Care", "Chronic Disease Management", "Milk Testing", "Fecal Analysis", "Blood Tests", "Disease Screening", "Postmortem Examination", "Consultation", "Follow-up Care"
    ],
    Equine: [
      "General Check-up", "Vaccination", "Deworming", "Dental Care", "Emergency Services", "Consultation", "Hoof Trimming", "Surgery Consultation", "Ultrasound Imaging", "X-ray Diagnostics", "Wound Care", "Behavioral Consultation", "Follow-up Care"
    ]
  };

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
    const url = "/api/fetch-vets"; // Vercel serverless function

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
    // Step 1: Animal Category

    if (category) {
      animalTypeContainer.style.display = "block";
      animalSelect.innerHTML = "<option value=''>-- Select Animal --</option>";
      animals[category].forEach(a => {
        const opt = document.createElement("option");
        opt.value = a;
        opt.textContent = a;
        animalSelect.appendChild(opt);
      });
      // Show pets section for Pet category
      if (window.showPetsSection) window.showPetsSection(category === "Pet");
    } else {
      animalTypeContainer.style.display = "none";
      animalSelect.innerHTML = "";
      if (window.showPetsSection) window.showPetsSection(false);
      serviceSelect.style.display = "none";
      serviceLabel.style.display = "none";
      breedContainer.style.display = "none";
      breedSelect.innerHTML = "";
      updateVetNotice();
      return;
    }

    // Step 2: Animal Type
    if (animal) {
      // Step 3: Service Needed (filtered)
      serviceSelect.innerHTML = "<option value=''>-- Select a Service --</option>";
      (serviceOptions[category] || []).forEach(s => {
        const opt = document.createElement("option");
        opt.value = s;
        opt.textContent = s;
        serviceSelect.appendChild(opt);
      });
      serviceSelect.style.display = "block";
      serviceLabel.style.display = "block";
    } else {
      serviceSelect.style.display = "none";
      serviceLabel.style.display = "none";
      breedContainer.style.display = "none";
      breedSelect.innerHTML = "";
      updateVetNotice();
      return;
    }

    // Step 4: Breed (if needed)
    const service = serviceSelect.value;
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
  // Initial state
  updateForm();

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












