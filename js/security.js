function loadLogs() {
  fetch("security_actions.php?action=get_logs")
    .then(r => r.text())
    .then(data => {
      document.getElementById("logContent").textContent = data;
    });
}

function clearLogs() {
  if (confirm("Are you sure you want to clear all logs?")) {
    fetch("security_actions.php?action=clear_logs")
      .then(r => r.text())
      .then(alert)
      .then(loadLogs);
  }
}

function runQuickCheck() {
  fetch("security_actions.php?action=quick_check")
    .then(r => r.text())
    .then(alert)
    .then(loadLogs);
}

// Auto-load logs
loadLogs();
setInterval(loadLogs, 10000); // refresh every 10s


