// Admin Authentication Check
// Include this file in all admin pages to protect them

(function() {
  // MUST MATCH THE PASSWORD IN index.html
  const ADMIN_PASSWORD = 'Animora@2025!';
  
  // Check if user is authenticated
  const isAuthenticated = sessionStorage.getItem('animoraAdminAuth');
  
  if (isAuthenticated !== ADMIN_PASSWORD) {
    // Not authenticated - redirect to admin index which will prompt for password
    alert('⚠️ Session expired. Please login again.');
    window.location.href = 'index.html';
  }
})();

// Logout function
function logoutAdmin() {
  if (confirm('Are you sure you want to logout?')) {
    sessionStorage.removeItem('animoraAdminAuth');
    window.location.href = '../index.html';
  }
}
