console.log("Services Page Ready ✅");

const serviceCards = document.querySelectorAll('.service-card');
const serviceDetails = document.querySelectorAll('.service-detail');
const grids = document.querySelectorAll('.services-section');

// Handle card click
serviceCards.forEach(card => {
  card.addEventListener('click', () => {
    const serviceId = card.getAttribute('data-service');

    // Hide all grids
    grids.forEach(g => g.style.display = "none");

    // Show the clicked detail
    document.getElementById(serviceId).style.display = "block";
  });
});

// Handle back buttons
document.querySelectorAll('.back-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    // Hide all details
    serviceDetails.forEach(detail => detail.style.display = "none");

    // Show grids back
    grids.forEach(g => g.style.display = "block");
  });
});



