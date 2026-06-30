import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 8080;
const PUBLIC_DIR = path.join(__dirname, '../dist');

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);

  // Safe URL parsing with try/catch crash-proofing (handles malformed/double-slashed scanner URLs)
  let pathname = '/';
  try {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost:8080'}`);
    pathname = decodeURIComponent(parsedUrl.pathname);
    
    // Support Astro base URL by stripping it for local directory lookup
    if (pathname.startsWith('/ready_apologia')) {
      pathname = pathname.substring('/ready_apologia'.length) || '/';
    }
  } catch (err) {
    console.warn(`⚠️ Malformed URL requested: ${req.url}`);
    pathname = '/404.html'; // Route immediately to static 404 fallback
  }

  let filePath = path.join(PUBLIC_DIR, pathname);

  // If path is a directory, look for index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  // Fallback for clean URLs (e.g. /items/cosmological-argument -> /items/cosmological-argument/index.html)
  if (!fs.existsSync(filePath) && !path.extname(filePath)) {
    const cleanUrlPath = filePath + '/index.html';
    if (fs.existsSync(cleanUrlPath)) {
      filePath = cleanUrlPath;
    } else {
      // Try adding .html
      const htmlFallback = filePath + '.html';
      if (fs.existsSync(htmlFallback)) {
        filePath = htmlFallback;
      }
    }
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Serve 404 page if it exists, otherwise raw 404
        const page404 = path.join(PUBLIC_DIR, '404.html');
        if (fs.existsSync(page404)) {
          fs.readFile(page404, (err404, content404) => {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end(content404, 'utf-8');
          });
        } else {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 Not Found');
        }
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n🚀 Production Static Server running locally!`);
  console.log(`👉 http://localhost:${PORT}`);
  console.log(`Serving files from: ${PUBLIC_DIR}\n`);
  console.log('Press Ctrl+C to stop.\n');
});
