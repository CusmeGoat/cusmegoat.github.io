import test from 'node:test';
import assert from 'node:assert/strict';
import { parseMoney, summarize, billPaid, parseVoice } from '../domain.js';

test('los importes con separadores se guardan en centavos sin confundir miles', () => {
  assert.equal(parseMoney('1.000,50'), 100050);
  assert.equal(parseMoney('1,000.50'), 100050);
  assert.equal(parseMoney('30'), 3000);
  assert.equal(parseMoney('0'), null);
});

test('el balance separa ingresos y gastos del mes', () => {
  const rows = [
    { kind: 'income', amount_cents: 100000, occurred_on: '2026-11-01' },
    { kind: 'expense', amount_cents: 3000, occurred_on: '2026-11-02', category: 'Servicios', essential: true },
    { kind: 'expense', amount_cents: 500, occurred_on: '2026-11-03', category: 'Comida', essential: false },
    { kind: 'expense', amount_cents: 1000, occurred_on: '2026-10-30', category: 'Otros', essential: false },
  ];
  const result = summarize(rows, '2026-11');
  assert.equal(result.income, 100000);
  assert.equal(result.expense, 3500);
  assert.equal(result.balance, 96500);
  assert.equal(result.optional, 500);
});

test('el checklist solo marca el mes realmente pagado', () => {
  const bill = { id: 'bill-1' };
  const rows = [{ bill_id: 'bill-1', kind: 'expense', occurred_on: '2026-11-03' }];
  assert.equal(billPaid(bill, rows, '2026-11'), true);
  assert.equal(billPaid(bill, rows, '2026-12'), false);
});

test('la frase produce dos propuestas y deja incompleto un importe ausente', () => {
  const bills = [{ id: 'bill-1', title: 'Internet', category: 'Servicios' }];
  const drafts = parseVoice('Hoy pagué 30 dólares de internet y compré una torta de 5 dólares', bills, '2026-11-07');
  assert.equal(drafts.length, 2);
  assert.equal(drafts[0].amount_cents, 3000);
  assert.equal(drafts[0].bill_id, 'bill-1');
  assert.equal(drafts[1].amount_cents, 500);
  assert.equal(drafts[1].essential, false);
  assert.equal(parseVoice('Pagué la luz', [], '2026-11-07')[0].amount_cents, null);
});
