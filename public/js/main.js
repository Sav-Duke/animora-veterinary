document.addEventListener("DOMContentLoaded", () => {
  // Highlight active link
  const path = location.pathname.split("/").pop();
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (
      a.getAttribute('href') === path ||
      (path === '' && a.getAttribute('href') === 'index.html')
    ) {
      a.classList.add('active');
    }
  });

  // Mobile nav toggle (hamburger)
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('show');
    });
  }
});

