// Admin Floating Button Script
// Add this script to all public pages to enable admin quick access button

(function() {
  // Create the admin floating button
  const adminBtn = document.createElement('a');
  adminBtn.id = 'floatingAdminBtn';
  adminBtn.className = 'floating-admin-btn';
  adminBtn.style.display = 'none';
  adminBtn.href = '/admin';
  adminBtn.innerHTML = '<span class="admin-icon">⚙️</span>';
  
  // Add styles
  const style = document.createElement('style');
  style.textContent = `
    .floating-admin-btn {
      position: fixed;
      bottom: 30px;
      left: 30px;
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
      color: white;
      border-radius: 50%;
      text-decoration: none;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 15px rgba(220, 38, 38, 0.4);
      transition: all 0.3s ease;
      z-index: 998;
      font-size: 1.8rem;
    }

    .floating-admin-btn:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 20px rgba(220, 38, 38, 0.5);
    }

    @media (max-width: 768px) {
      .floating-admin-btn {
        width: 50px;
        height: 50px;
        font-size: 1.5rem;
        bottom: 20px;
        left: 20px;
      }
    }
  `;
  
  // Load and display admin floating button
  function loadAdminFloatingBtn() {
    const adminSettings = JSON.parse(localStorage.getItem('animoraAdminFloatingBtn') || '{}');
    
    if (adminSettings.enabled) {
      adminBtn.style.display = 'flex';
      
      // Update icon if set
      if (adminSettings.icon) {
        adminBtn.querySelector('.admin-icon').textContent = adminSettings.icon;
      }
      
      // Update gradient colors if set
      if (adminSettings.gradientStart && adminSettings.gradientEnd) {
        adminBtn.style.background = `linear-gradient(135deg, ${adminSettings.gradientStart} 0%, ${adminSettings.gradientEnd} 100%)`;
      }
      
      // Update position if set
      if (adminSettings.position) {
        adminBtn.style.top = 'auto';
        adminBtn.style.bottom = 'auto';
        adminBtn.style.left = 'auto';
        adminBtn.style.right = 'auto';
        
        if (adminSettings.position === 'bottom-left') {
          adminBtn.style.bottom = '30px';
          adminBtn.style.left = '30px';
        } else if (adminSettings.position === 'bottom-right') {
          adminBtn.style.bottom = '30px';
          adminBtn.style.right = '30px';
        } else if (adminSettings.position === 'top-left') {
          adminBtn.style.top = '30px';
          adminBtn.style.left = '30px';
        } else if (adminSettings.position === 'top-right') {
          adminBtn.style.top = '30px';
          adminBtn.style.right = '30px';
        }
      }
    }
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      document.head.appendChild(style);
      document.body.appendChild(adminBtn);
      loadAdminFloatingBtn();
    });
  } else {
    document.head.appendChild(style);
    document.body.appendChild(adminBtn);
    loadAdminFloatingBtn();
  }
})();
