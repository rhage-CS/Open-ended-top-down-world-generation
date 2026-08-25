const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8000;
const SCREENSHOTS_DIR = path.join(__dirname, '..', 'screenshots');
const PROJECT_ROOT = path.join(__dirname, '..');

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.css': 'text/css'
};

function getNextScreenshotNumber() {
  const files = fs.readdirSync(SCREENSHOTS_DIR);
  const pngFiles = files.filter(f => f.endsWith('.png'));
  return pngFiles.length + 1;
}

function serveStaticFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const pathname = req.url.split('?')[0];
  // POST /capture
  if (req.method === 'POST' && req.url === '/capture') {
    let body = [];
    req.on('data', chunk => body.push(chunk));
    req.on('end', () => {
      try {
        const pngData = Buffer.concat(body);
        const number = getNextScreenshotNumber();
        const timestamp = new Date().toISOString();
        const filename = `screenshot_${String(number).padStart(3, '0')}.png`;
        const jsonFilename = `screenshot_${String(number).padStart(3, '0')}.json`;

        const pngPath = path.join(SCREENSHOTS_DIR, filename);
        const jsonPath = path.join(SCREENSHOTS_DIR, jsonFilename);

        // Write PNG
        fs.writeFileSync(pngPath, pngData);

        // Read current level.json for sidecar
        let levelData = null;
        try {
          const levelPath = path.join(PROJECT_ROOT, 'levels', 'test.json');
          levelData = JSON.parse(fs.readFileSync(levelPath, 'utf8'));
        } catch (e) {
          console.error('Could not read level.json:', e.message);
        }

        // Write JSON sidecar
        const sidecar = {
          timestamp,
          filename,
          level: levelData
        };
        fs.writeFileSync(jsonPath, JSON.stringify(sidecar, null, 2));

        console.log(`Saved screenshot: ${filename}`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, filename }));
      } catch (err) {
        console.error('Error saving screenshot:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // GET — serve static files from project root
  if (req.method === 'GET') {
    let filePath = path.join(PROJECT_ROOT, pathname === '/' ? 'index.html' : pathname);

    // Security: prevent directory traversal
    if (!filePath.startsWith(PROJECT_ROOT)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      serveStaticFile(res, filePath);
    });
    return;
  }

  res.writeHead(405);
  res.end('Method not allowed');
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Screenshots saved to: ${SCREENSHOTS_DIR}`);
});
