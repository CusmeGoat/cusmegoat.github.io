import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

const root = import.meta.dirname;
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };
const allowed = new Set(['/','/index.html','/app.js','/data.js','/domain.js','/styles.css','/sw.js','/manifest.webmanifest','/icon.svg']);
const port = Number(process.env.PORT) || 4173;

createServer(async (request, response) => {
  const path = new URL(request.url, `http://${request.headers.host}`).pathname;
  if (!allowed.has(path)) { response.writeHead(404); response.end('Not found'); return; }
  const name = path === '/' ? '/index.html' : path;
  try {
    const body = await readFile(join(root, name.slice(1)));
    response.writeHead(200, { 'Content-Type': mime[extname(name)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    response.end(body);
  } catch { response.writeHead(500); response.end('Could not load file'); }
}).listen(port, '0.0.0.0', () => console.log(`Bolsillo Claro: http://localhost:${port}`));
