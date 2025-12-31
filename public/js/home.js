console.log("Homepage Ready ✅");

// Reveal link cards on scroll
document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".link-card");

  cards.forEach(card => {
    card.style.opacity = "0";
    card.style.transform = "translateY(30px)";
    card.style.transition = "all 0.8s ease-out";
  });

  const revealOnScroll = () => {
    cards.forEach(card => {
      const rect = card.getBoundingClientRect();
      if (rect.top < window.innerHeight - 50) {
        card.style.opacity = "1";
        card.style.transform = "translateY(0)";
      }
    });
  };

  window.addEventListener("scroll", revealOnScroll);
  revealOnScroll();
});



