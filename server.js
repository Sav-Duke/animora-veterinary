const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const formidable = require('formidable');

const PORT = process.env.PORT || 8080;

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Helper function for handling GET/POST data files
  const handleDataFile = (fileName, req, res, pathname) => {
    const dataFile = path.join(__dirname, 'data', fileName);
    
    if (req.method === 'GET') {
      fs.readFile(dataFile, 'utf8', (err, data) => {
        if (err) {
          res.writeHead(200, { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          });
          res.end('[]');
        } else {
          res.writeHead(200, { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          });
          res.end(data);
        }
      });
      return true;
    }
    
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          fs.writeFile(dataFile, JSON.stringify(data, null, 2), (err) => {
            if (err) {
              res.writeHead(500, { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              });
              res.end(JSON.stringify({ error: 'Failed to save' }));
            } else {
              res.writeHead(200, { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              });
              res.end(JSON.stringify({ success: true }));
            }
          });
        } catch (e) {
          res.writeHead(400, { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          });
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });
      return true;
    }
    
    if (req.method === 'OPTIONS') {
      res.writeHead(200, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
      res.end();
      return true;
    }
    
    return false;
  };

  // API Routes
  if (pathname === '/api/fetch-vets.php' || pathname === '/api/fetch-vets') {
    if (handleDataFile('vets.json', req, res, pathname)) return;
  }

  if (pathname === '/api/save-vet.php' || pathname === '/api/save-vet') {
    if (handleDataFile('vets.json', req, res, pathname)) return;
  }

  if (pathname === '/api/staff') {
    if (handleDataFile('staff.json', req, res, pathname)) return;
  }

  if (pathname === '/api/services') {
    if (handleDataFile('services.json', req, res, pathname)) return;
  }

  if (pathname === '/api/contact-info') {
    if (handleDataFile('contact-info.json', req, res, pathname)) return;
  }

  if (pathname === '/api/about-content') {
    if (handleDataFile('about-content.json', req, res, pathname)) return;
  }

  // Image upload endpoint
  if (pathname === '/api/upload-image' && req.method === 'POST') {
    const uploadDir = path.join(__dirname, 'images', 'team');
    
    // Create team directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const base64Data = data.image.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        
        // Generate filename
        const filename = `staff_${Date.now()}.jpg`;
        const filepath = path.join(uploadDir, filename);
        
        fs.writeFile(filepath, buffer, (err) => {
          if (err) {
            res.writeHead(500, { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify({ error: 'Failed to save image' }));
          } else {
            res.writeHead(200, { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify({ 
              success: true, 
              imagePath: `images/team/${filename}` 
            }));
          }
        });
      } catch (e) {
        res.writeHead(400, { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({ error: 'Invalid data' }));
      }
    });
    return;
  }

  if (pathname === '/api/upload-image' && req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  // Static file serving
  let filePath = '.' + pathname;
  if (filePath === './') {
    filePath = './index.html';
  }

  // First check if the path exists and if it's a directory
  fs.stat(filePath, (statErr, stats) => {
    if (statErr) {
      if (statErr.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 - File Not Found</h1>', 'utf-8');
      } else {
        res.writeHead(500);
        res.end('Server Error: ' + statErr.code);
      }
      return;
    }

    // If it's a directory, append index.html
    if (stats.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    // Determine content type AFTER resolving the final file path
    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    // Now read the file
    fs.readFile(filePath, (error, content) => {
      if (error) {
        if (error.code === 'ENOENT') {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end('<h1>404 - File Not Found</h1>', 'utf-8');
        } else {
          res.writeHead(500);
          res.end('Server Error: ' + error.code);
        }
      } else {
        res.writeHead(200, { 
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*'
        });
        res.end(content, 'utf-8');
      }
    });
  });
});

server.listen(PORT, () => {
  console.log(`✅ Web server running at http://localhost:${PORT}/`);
  console.log(`✅ Admin panel: http://localhost:${PORT}/admin/`);
  console.log(`✅ AI Chat: http://localhost:${PORT}/animora-ai/chat.html`);
});
