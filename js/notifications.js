// notifications.js - Handles admin notifications UI logic

document.addEventListener('DOMContentLoaded', () => {
  loadNotifications();

  // Filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (event) => {
      const type = btn.textContent.trim().toLowerCase();
      filterNotifications(type);
    });
  });
});

let notifications = [];

async function loadNotifications() {
  try {
    const res = await fetch('/api/util?action=notifications');
    notifications = await res.json();
    renderNotifications('all');
  } catch (err) {
    document.getElementById('notificationList').innerHTML = '<div style="color:red">Failed to load notifications.</div>';
  }
}

function renderNotifications(filterType) {
  let filtered = notifications;
  if (filterType === 'unread') {
    filtered = notifications.filter(n => n.unread);
  } else if (filterType === 'appointments') {
    filtered = notifications.filter(n => n.type === 'appointments');
  } else if (filterType === 'system') {
    filtered = notifications.filter(n => n.type === 'system');
  }
  const html = filtered.map(n => `
    <div class="notification-item${n.unread ? ' unread' : ''}${n.type === 'system' ? ' warning' : ''}">
      <div class="notification-icon">${n.icon || '🔔'}</div>
      <div class="notification-content">
        <div class="notification-title">${n.title}</div>
        <div class="notification-text">${n.text}</div>
        <div class="notification-time">${n.time}</div>
      </div>
    </div>
  `).join('');
  document.getElementById('notificationList').innerHTML = html || '<div>No notifications found.</div>';
}

function filterNotifications(type) {
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  const btn = Array.from(document.querySelectorAll('.filter-btn')).find(b => b.textContent.trim().toLowerCase() === type);
  if (btn) btn.classList.add('active');
  renderNotifications(type);
}
