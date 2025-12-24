// Load and display services dynamically
let servicesData = {};

async function loadServices() {
  try {
    const response = await fetch('/api/resources?type=services');
    servicesData = await response.json();
    renderServices();
  } catch (error) {
    console.error('Error loading services:', error);
  }
}

function renderServices() {
  const categoryMap = {
    petCare: { title: 'Pet Care', container: null },
    livestock: { title: 'Livestock Services', container: null },
    laboratory: { title: 'Laboratory & Diagnostics', container: null },
    consultation: { title: 'Consultation & Advisory', container: null }
  };

  // Find all service sections
  const sections = document.querySelectorAll('.services-section');
  
  // Map sections to categories based on their title
  sections.forEach(section => {
    const titleElement = section.querySelector('.category-title');
    if (titleElement) {
      const title = titleElement.textContent.trim();
      Object.keys(categoryMap).forEach(key => {
        if (categoryMap[key].title === title) {
          categoryMap[key].container = section.querySelector('.services-grid');
        }
      });
    }
  });

  // Render each category
  Object.keys(categoryMap).forEach(catKey => {
    const category = categoryMap[catKey];
    const services = servicesData[catKey] || [];
    
    if (category.container && services.length > 0) {
      category.container.innerHTML = services.map(service => `
        <div class="service-card" data-service="${service.id}">
          <h3>${service.title}</h3>
          <p>${service.shortDesc}</p>
        </div>
      `).join('');
    }
  });

  // Update detail sections
  updateDetailSections();
}

function updateDetailSections() {
  // Remove existing detail sections
  const existingDetails = document.querySelectorAll('.service-detail');
  existingDetails.forEach(detail => detail.remove());

  // Create new detail sections
  const allServices = [
    ...(servicesData.petCare || []),
    ...(servicesData.livestock || []),
    ...(servicesData.laboratory || []),
    ...(servicesData.consultation || [])
  ];

  const footer = document.querySelector('footer');
  
  allServices.forEach(service => {
    const detailDiv = document.createElement('div');
    detailDiv.className = 'service-detail';
    detailDiv.id = service.id;
    detailDiv.innerHTML = `
      <h2>${service.title}</h2>
      <p>${service.fullDesc}</p>
      <button class="back-btn">← Back</button>
    `;
    
    if (footer) {
      footer.parentNode.insertBefore(detailDiv, footer);
    } else {
      document.body.appendChild(detailDiv);
    }
  });

  // Re-attach event listeners (if services.js handles this)
  if (typeof attachServiceCardListeners === 'function') {
    attachServiceCardListeners();
  }
}

// Load services when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadServices);
} else {
  loadServices();
}
