// Animora Appointment Form — Enhanced, Modern, and Maintainable
// Last updated: 2025-12-22

document.addEventListener("DOMContentLoaded", function () {
  // --- DOM Elements ---
  const form = document.getElementById("appointmentForm");
  const successMessage = document.getElementById("successMessage");
  const categorySelect = document.getElementById("animalCategory");
  const animalSelect = document.getElementById("animal");
  const animalTypeContainer = document.getElementById("animalTypeContainer");
  const serviceSelect = document.getElementById("service");
  const serviceLabel = document.getElementById("serviceLabel");
  const breedContainer = document.getElementById("breedContainer");
  const breedSelect = document.getElementById("breed");
  const petsContainer = document.getElementById("petsContainer");
  const petFields = document.getElementById("petFields");
  const addPetBtn = document.getElementById("addPetBtn");
  const locationInput = document.getElementById("location");
  const suggestions = document.getElementById("suggestions");
  const vetNotice = document.getElementById("vetNotice");
  const submitBtn = document.getElementById("submitBtn");

  // --- Data ---
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
  const vets = [
    {
      name: "Duke",
      county: "Kakamega",
      constituency: "Lurambi",
      services: ["Consultation", "Breed Selection", "Artificial Insemination"]
    },
    {
      name: "Mr Kolian",
      county: "Kajiado",
      constituency: "Oloitokitok",
      services: ["Consultation", "Artificial Insemination"]
    },
    {
      name: "Doc Jaybe",
      county: "Kisumu",
      constituency: "Kisumu Central",
      services: ["Consultation", "Surgery", "Artificial Insemination"]
    }
  ];

  // --- Pet Fields Logic ---
  let petCount = 0;
  function addPetField(name = '', type = '') {
    petCount++;
    const div = document.createElement('div');
    div.className = 'pet-entry';
    div.innerHTML = `
      <input type="text" name="petName${petCount}" placeholder="Pet Name" value="${name}" required style="margin-right:6px;max-width:120px;">
      <input type="text" name="petType${petCount}" placeholder="Pet Type" value="${type}" required style="max-width:120px;">
      <button type="button" class="removePetBtn" style="margin-left:6px;">Remove</button>
    `;
    petFields.appendChild(div);
    div.querySelector('.removePetBtn').onclick = function() {
      div.remove();
      if (petFields.children.length === 0) {
        addPetField(); // Always keep at least one pet field for Pet category
      }
    };
  }
  if (addPetBtn) {
    addPetBtn.onclick = function() {
      addPetField();
    };
  }

  // --- Central Form Update Logic ---
  function updateForm(triggeredBy) {
    const category = categorySelect.value;
    const animal = animalSelect.value;
    const service = serviceSelect.value;

    // 1. Animal dropdown
    if (animals[category]) {
      animalTypeContainer.style.display = "block";
      animalSelect.innerHTML = "<option value=''>-- Select Animal --</option>";
      animals[category].forEach(a => {
        const opt = document.createElement("option");
        opt.value = a;
        opt.textContent = a;
        animalSelect.appendChild(opt);
      });
      animalSelect.disabled = false;
      animalSelect.style.display = "block";
      // Reset animal if not valid for new category
      if (!animals[category].includes(animal)) {
        animalSelect.value = '';
      }
    } else {
      animalTypeContainer.style.display = "none";
      animalSelect.innerHTML = "";
      animalSelect.disabled = true;
      animalSelect.style.display = "none";
    }

    // 2. Pet fields
    if (category === "Pet") {
      petsContainer.style.display = "block";
      if (petFields.children.length === 0) addPetField();
    } else {
      petsContainer.style.display = "none";
      petFields.innerHTML = "";
      petCount = 0;
    }

    // 3. Service dropdown
    if (category && serviceOptions[category]) {
      serviceSelect.style.display = "block";
      serviceLabel.style.display = "block";
      serviceSelect.innerHTML = "<option value=''>-- Select a Service --</option>";
      serviceOptions[category].forEach(s => {
        const opt = document.createElement("option");
        opt.value = s;
        opt.textContent = s;
        serviceSelect.appendChild(opt);
      });
      serviceSelect.disabled = false;
      // Reset service if not valid for new category
      if (!serviceOptions[category].includes(service)) {
        serviceSelect.value = '';
      }
    } else {
      serviceSelect.style.display = "none";
      serviceLabel.style.display = "none";
      serviceSelect.innerHTML = "";
      serviceSelect.disabled = true;
    }

    // 4. Breed dropdown (only for AI)
    if (service === "Artificial Insemination" && breeds[animal]) {
      breedContainer.style.display = "block";
      breedSelect.innerHTML = "<option value=''>-- Select Breed --</option>";
      breeds[animal].forEach(b => {
        const opt = document.createElement("option");
        opt.value = b;
        opt.textContent = b;
        breedSelect.appendChild(opt);
      });
      breedSelect.disabled = false;
      breedSelect.style.display = "block";
    } else {
      breedContainer.style.display = "none";
      breedSelect.innerHTML = "";
      breedSelect.disabled = true;
      breedSelect.style.display = "none";
    }

    // 5. Ensure Preferred Date is always enabled
    const dateInput = document.getElementById("date");
    if (dateInput) dateInput.disabled = false;

    // 6. Vet availability (exact match)
    updateVetNotice();
  }

  // Defensive: Reset dependent fields on change
  categorySelect.addEventListener("change", function() { updateForm('category'); });
  animalSelect.addEventListener("change", function() { updateForm('animal'); });
  serviceSelect.addEventListener("change", function() { updateForm('service'); });

  // --- Accessibility: Keyboard Navigation for Suggestions ---
  let debounceTimer;
  let selectedIndex = -1;
  locationInput.addEventListener("input", function () {
    const query = this.value.trim();
    clearTimeout(debounceTimer);
    selectedIndex = -1;
    if (query.length < 3) {
      suggestions.innerHTML = "";
      return;
    }
    debounceTimer = setTimeout(() => {
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&countrycodes=KE&limit=5`)
        .then(res => res.json())
        .then(data => {
          suggestions.innerHTML = "";
          data.forEach(place => {
            const li = document.createElement("li");
            li.textContent = place.display_name;
            li.tabIndex = 0;
            li.addEventListener("click", () => selectSuggestion(place));
            li.addEventListener("keydown", e => {
              if (e.key === "Enter" || e.key === " ") {
                selectSuggestion(place);
              }
            });
            suggestions.appendChild(li);
          });
        });
    }, 400);
  });
  locationInput.addEventListener("keydown", function (e) {
    const items = suggestions.querySelectorAll("li");
    if (!items.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      selectedIndex = (selectedIndex + 1) % items.length;
      highlightSuggestion(items);
      items[selectedIndex].focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      selectedIndex = (selectedIndex - 1 + items.length) % items.length;
      highlightSuggestion(items);
      items[selectedIndex].focus();
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0) {
        items[selectedIndex].click();
      }
    }
  });
  function highlightSuggestion(items) {
    items.forEach((li, i) => {
      li.style.background = i === selectedIndex ? "#f0f7ff" : "#fff";
    });
  }
  function selectSuggestion(place) {
    locationInput.value = place.display_name;
    suggestions.innerHTML = "";
    updateForm();
  }
  document.addEventListener("click", function (e) {
    if (e.target !== locationInput) suggestions.innerHTML = "";
  });

  // --- Vet Availability Notice (Exact, No Fuzzy) ---
  function updateVetNotice() {
    if (!vetNotice) return;
    vetNotice.textContent = "";
    vetNotice.className = "vet-notice";
    vetNotice.style.display = "none";
    const locationText = locationInput.value.trim();
    const service = serviceSelect.value.trim();
    if (!locationText) return;
    const matchedVets = vets.filter(v =>
      locationText.includes(v.county) || locationText.includes(v.constituency)
    );
    if (matchedVets.length) {
      if (!service) {
        vetNotice.textContent = `✅ Vets are available in ${locationText}. Select a service to confirm availability.`;
        vetNotice.classList.add("success");
      } else {
        const providers = matchedVets.filter(v => v.services.includes(service));
        if (providers.length) {
          const names = providers.map(v => v.name).join(", ");
          vetNotice.textContent = `✅ ${names} provide ${service} in ${locationText}.`;
          vetNotice.classList.add("success");
        } else {
          vetNotice.textContent = `⚠️ None provides ${service} in ${locationText}.`;
          vetNotice.classList.add("error");
        }
      }
    } else {
      vetNotice.textContent = "❌ No vet found for the selected location.";
      vetNotice.classList.add("error");
    }
    vetNotice.style.display = "block";
  }

  // --- Dynamic Validation & Feedback ---
  form.addEventListener("input", function () {
    let valid = form.checkValidity();
    submitBtn.disabled = !valid;
  });

  // --- Form Submission (Formspree) ---
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    const data = new FormData(form);
    fetch(form.action, {
      method: form.method,
      body: data,
      headers: { 'Accept': 'application/json' }
    })
      .then(response => {
        if (response.ok) {
          successMessage.style.display = "block";
          setTimeout(() => {
            successMessage.style.display = "none";
          }, 5000);
          form.reset();
          petFields.innerHTML = "";
          petCount = 0;
          updateForm();
        } else {
          alert("Oops! There was a problem submitting your form.");
        }
      })
      .catch(() => {
        alert("Oops! There was a problem submitting your form.");
      })
      .finally(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Appointment';
      });
  });

  // --- Initial State ---
  updateForm();
  submitBtn.disabled = !form.checkValidity();

  // --- Robust Fallback: Always show and enable all fields if JS runs ---
  [animalTypeContainer, petsContainer, serviceSelect, serviceLabel, breedContainer, breedSelect].forEach(el => {
    if (el) {
      el.style.display = "block";
      if (el.removeAttribute) el.removeAttribute('disabled');
    }
  });
  const dateInput = document.getElementById("date");
  if (dateInput) dateInput.removeAttribute('disabled');
});












