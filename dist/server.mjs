import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { listCases } from './pagination.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const seed = JSON.parse(await readFile(path.join(root, 'inventory/seed-cases.json'), 'utf8'));
const port = Number(process.env.PORT || 4183);
const HOST = '127.0.0.1';
const staticFiles = new Map([
  ['/', ['public/index.html', 'text/html; charset=utf-8']],
  ['/styles.css', ['public/styles.css', 'text/css; charset=utf-8']],
  ['/app.js', ['public/app.js', 'text/javascript; charset=utf-8']]
]);

http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${HOST}:${port}`);
  res.setHeader('Cache-Control', 'no-store');
  if (url.pathname === '/api/cases') {
    const filter = url.searchParams.get('status') || 'all';
    const rawLimit = url.searchParams.get('limit') || '5';
    const limit = Number(rawLimit);
    if (!['all', 'open'].includes(filter) || !Number.isInteger(limit) || limit < 1 || limit > 20) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid status or limit' }));
      return;
    }
    try {
      const result = listCases(seed, {
        filter,
        limit,
        cursor: url.searchParams.get('cursor') || undefined
      });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid pagination cursor' }));
    }
    return;
  }
  const entry = staticFiles.get(url.pathname);
  if (!entry) { res.writeHead(404); res.end('Not found'); return; }
  try {
    const [filename, contentType] = entry;
    const body = await readFile(path.join(root, filename));
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(body);
  } catch {
    res.writeHead(500); res.end('Unable to load local fixture');
  }
}).listen(port, HOST, () => {
  console.log(`Caseflow review app: http://${HOST}:${port}`);
  console.log('Local synthetic data only. No external services.');
});
