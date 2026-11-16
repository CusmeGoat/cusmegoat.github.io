import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('todos los controles usados por la interfaz existen una sola vez', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const source = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length, 'hay identificadores duplicados en la página');
  const referenced = [...source.matchAll(/\$\('([^']+)'\)/g)].map(match => match[1]);
  for (const id of referenced) assert.ok(ids.includes(id), `falta #${id} en index.html`);
});
