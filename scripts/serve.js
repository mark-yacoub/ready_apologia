import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 8080;
const PUBLIC_DIR = process.env.DIST_DIR
  ? path.resolve(process.env.DIST_DIR)
  : path.join(__dirname, '../dist');

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
  '.webp': 'image/webp',
  '.m4a': 'audio/mp4',
  '.mp3': 'audio/mpeg',
};

// Media is streamed with HTTP Range support (206), like R2/Cloudflare in production;
// browsers need it to seek, and Safari refuses to play audio without it.
const RANGE_EXTS = new Set(['.m4a', '.mp3']);
function serveRange(req, res, filePath, contentType) {
  const { size } = fs.statSync(filePath);
  const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
  if (!m) {
    res.writeHead(200, { 'Content-Type': contentType, 'Content-Length': size, 'Accept-Ranges': 'bytes' });
    fs.createReadStream(filePath).pipe(res);
    return;
  }
  let start = m[1] === '' ? size - Number(m[2]) : Number(m[1]);
  let end = m[1] !== '' && m[2] !== '' ? Number(m[2]) : size - 1;
  end = Math.min(end, size - 1);
  if (!(start >= 0) || start > end) {
    res.writeHead(416, { 'Content-Range': `bytes */${size}` });
    res.end();
    return;
  }
  res.writeHead(206, { 'Content-Type': contentType, 'Content-Length': end - start + 1, 'Content-Range': `bytes ${start}-${end}/${size}`, 'Accept-Ranges': 'bytes' });
  fs.createReadStream(filePath, { start, end }).pipe(res);
}

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);

  // Safe URL parsing with try/catch crash-proofing (handles malformed/double-slashed scanner URLs)
  let pathname = '/';
  try {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost:8080'}`);
    pathname = decodeURIComponent(parsedUrl.pathname);
    if (pathname.includes('\0')) {
      throw new Error('Null byte in URL');
    }

    // Support Astro base URL by stripping it for local directory lookup
    if (pathname.startsWith('/ready_apologia')) {
      pathname = pathname.substring('/ready_apologia'.length) || '/';
    }
  } catch (err) {
    console.warn(`⚠️ Malformed URL requested: ${req.url}`);
    pathname = '/404.html'; // Route immediately to static 404 fallback
  }

  let filePath = path.resolve(PUBLIC_DIR, '.' + pathname);
  if (filePath !== PUBLIC_DIR && !filePath.startsWith(PUBLIC_DIR + path.sep)) {
    filePath = path.join(PUBLIC_DIR, '404.html');
  }

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

  const reqExt = path.extname(filePath).toLowerCase();
  if (RANGE_EXTS.has(reqExt) && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    serveRange(req, res, filePath, MIME_TYPES[reqExt]);
    return;
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
