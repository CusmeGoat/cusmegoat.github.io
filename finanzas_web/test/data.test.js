import test from 'node:test';
import assert from 'node:assert/strict';
import { CloudStore, LocalStore } from '../data.js';

function memoryStorage() {
  const values = new Map();
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
}

test('el modo local conserva movimientos y pagos por separado', async () => {
  globalThis.localStorage = memoryStorage();
  const store = new LocalStore();
  await store.upsert('bills', { id: 'bill-1', title: 'Internet' });
  await store.upsert('movements', { id: 'move-1', bill_id: 'bill-1', amount_cents: 3000 });
  assert.equal((await store.list()).movements.length, 1);
  await store.remove('bills', 'bill-1');
  assert.equal((await store.list()).movements[0].bill_id, null);
});

test('la nube usa el token personal y acepta una escritura sin cuerpo de respuesta', async () => {
  globalThis.localStorage = memoryStorage();
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    if (url.includes('/auth/v1/token')) return Response.json({ access_token: 'access', refresh_token: 'refresh', expires_in: 3600, user: { id: 'user-1' } });
    if (options.method === 'POST') return new Response(null, { status: 201 });
    return Response.json([]);
  };
  const store = new CloudStore({ url: 'https://demo.supabase.co', key: 'sb_publishable_demo' });
  await store.signIn('test@example.com', 'test-password');
  await store.upsert('movements', { id: 'move-1', amount_cents: 3000 });
  const write = calls.find(call => call.url.includes('/rest/v1/movements'));
  assert.equal(write.options.headers.Authorization, 'Bearer access');
  assert.equal(JSON.parse(write.options.body).user_id, 'user-1');
  assert.deepEqual(await store.list(), { movements: [], bills: [] });
});
