const path = require('path');
const fs = require('fs');

app.get(['/admin', '/admin/'], (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

app.get('/admin/:fileName.html', (req, res, next) => {
  // Prevent path traversal
  const fileName = req.params.fileName.replace(/[^a-zA-Z0-9_-]/g, '');
  const filePath = path.join(__dirname, 'admin', fileName + '.html');
  // Confirm the file exists within the /admin directory
  if (filePath.startsWith(path.join(__dirname, 'admin'))) {
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) return next();
      res.sendFile(filePath);
    });
  } else {
    next();
  }
});

// ... rest of the original server.js logic below ...
