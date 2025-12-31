console.log("About Page Ready ✅");

// Fade-in effect on scroll
document.addEventListener("DOMContentLoaded", () => {
  const elements = document.querySelectorAll(".page-section h2, .page-section h3, .page-section p");

  elements.forEach(el => el.classList.add("fade-in"));

  const revealOnScroll = () => {
    elements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 50) {
        el.classList.add("visible");
      }
    });
  };

  window.addEventListener("scroll", revealOnScroll);
  revealOnScroll(); // run once on load
});


