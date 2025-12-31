// Floating Blog Button Script
// Add this script to all pages to enable floating blog button

(function() {
  // Create the floating blog button
  const blogBtn = document.createElement('a');
  blogBtn.id = 'floatingBlogBtn';
  blogBtn.className = 'floating-blog-btn';
  blogBtn.style.display = 'none';
  blogBtn.innerHTML = `
    <div class="blog-content">
      <div class="blog-heading">Blog</div>
      <div class="blog-icon">📝</div>
      <div class="blog-text">Check out our blog for exciting stories on livestock production</div>
    </div>
  `;
  
  // Add styles
  const style = document.createElement('style');
  style.textContent = `
    .floating-blog-btn {
      position: fixed;
      bottom: 30px;
      right: 30px;
      background: linear-gradient(135deg, #16A34A 0%, #15803d 100%);
      color: white;
      padding: 20px 24px;
      border-radius: 16px;
      text-decoration: none;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      box-shadow: 0 8px 25px rgba(22, 163, 74, 0.4);
      transition: all 0.3s ease;
      z-index: 999;
      max-width: 280px;
      animation: floatBounce 3s ease-in-out infinite;
    }

    .blog-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      text-align: center;
    }

    .blog-heading {
      font-size: 0.85rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin-bottom: 4px;
      opacity: 0.95;
    }

    .floating-blog-btn:hover {
      transform: translateY(-5px) scale(1.02);
      box-shadow: 0 12px 35px rgba(22, 163, 74, 0.5);
    }

    .blog-icon {
      font-size: 2.5rem;
      animation: pulse 2s ease-in-out infinite;
      margin: 4px 0;
    }

    .blog-text {
      font-weight: 500;
      font-size: 0.9rem;
      line-height: 1.4;
      opacity: 0.95;
    }

    @keyframes floatBounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }

    @media (max-width: 768px) {
      .floating-blog-btn {
        bottom: 20px;
        right: 20px;
        padding: 16px 20px;
        max-width: 240px;
      }
      
      .blog-heading {
        font-size: 0.75rem;
      }
      
      .blog-text {
        font-size: 0.8rem;
      }
      
      .blog-icon {
        font-size: 2rem;
      }
    }
  `;
  
  // Load and display floating blog button
  function loadFloatingBlog() {
    const blogSettings = JSON.parse(localStorage.getItem('animoraFloatingBlog') || '{}');
    
    if (blogSettings.enabled && blogSettings.url) {
      blogBtn.href = blogSettings.url;
      blogBtn.target = blogSettings.newTab ? '_blank' : '_self';
      blogBtn.style.display = 'flex';
      
      // Update heading if set
      if (blogSettings.heading) {
        blogBtn.querySelector('.blog-heading').textContent = blogSettings.heading;
      }
      
      // Update text if custom text is set
      if (blogSettings.text) {
        blogBtn.querySelector('.blog-text').textContent = blogSettings.text;
      }
      
      // Update icon if custom icon is set
      if (blogSettings.icon) {
        blogBtn.querySelector('.blog-icon').textContent = blogSettings.icon;
      }
      
      // Update colors if custom gradient is set
      if (blogSettings.gradientStart && blogSettings.gradientEnd) {
        blogBtn.style.background = `linear-gradient(135deg, ${blogSettings.gradientStart} 0%, ${blogSettings.gradientEnd} 100%)`;
      } else if (blogSettings.bgColor) {
        blogBtn.style.background = blogSettings.bgColor;
      }
    }
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      document.head.appendChild(style);
      document.body.appendChild(blogBtn);
      loadFloatingBlog();
    });
  } else {
    document.head.appendChild(style);
    document.body.appendChild(blogBtn);
    loadFloatingBlog();
  }
})();
