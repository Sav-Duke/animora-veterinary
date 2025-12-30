async function watchActivityLog() {
  let res = await fetch('/api/system/activity');
  let logs = await res.json();
  logs.events.forEach(e => {
    if (e.action === "delete" || /fail/i.test(e.details))
      alert("AI Watch Alert: Review event - " + e.action);
  });
}
window.setInterval(watchActivityLog, 60000);
