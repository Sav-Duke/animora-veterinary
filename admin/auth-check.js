// Admin Authentication Check
// Include this file in all admin pages to protect them


(async function() {
  // Check if user is authenticated
  const isAuthenticated = sessionStorage.getItem('animoraAdminAuth');
  if (isAuthenticated !== 'true') {
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
