import { categories, months, today, parseMoney, money, summarize, billPaid, recommendation, parseVoice } from './domain.js';
import { LocalStore, CloudStore, savedConfig, saveConfig, deploymentConfig } from './data.js';

const $ = id => document.getElementById(id);
const state = { store: new LocalStore(), movements: [], bills: [], month: new Date().getMonth(), year: new Date().getFullYear(), tab: 'summary', cloudConfig: null, recognition: null };
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const period = () => `${state.year}-${String(state.month + 1).padStart(2, '0')}`;
const previousPeriod = () => { const date = new Date(state.year, state.month - 1, 1); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; };
const formatDate = date => { const [year, month, day] = date.split('-'); return `${day}/${month}/${year}`; };
const defaultDate = () => today().startsWith(period()) ? today() : `${period()}-01`;

function toast(message) {
  const element = $('toast'); element.textContent = message; element.classList.add('show');
  clearTimeout(toast.timer); toast.timer = setTimeout(() => element.classList.remove('show'), 4200);
}

function showAuth() {
  $('auth-screen').hidden = false; $('app-shell').hidden = true;
  $('auth-message').textContent = state.cloudConfig ? '' : 'La sincronización aún no está configurada. Puedes probar el modo local.';
  $('login-form').querySelector('button[type=submit]').disabled = !state.cloudConfig;
}

async function showApp() {
  $('auth-screen').hidden = true; $('app-shell').hidden = false;
  $('mode-badge').textContent = state.store.mode === 'cloud' ? 'Sincronizado' : 'Solo este dispositivo';
  $('mode-badge').classList.toggle('local', state.store.mode === 'local');
  $('local-notice').hidden = state.store.mode === 'cloud';
  await refresh();
}

async function refresh() {
  try {
    const data = await state.store.list();
    state.movements = data.movements;
    state.bills = data.bills;
    render();
  } catch (error) { toast(error.message || 'No se pudieron cargar los datos.'); }
}

function render() {
  const month = period();
  const current = summarize(state.movements, month);
  const previous = summarize(state.movements, previousPeriod());
  const annual = summarize(state.movements, String(state.year));
  $('month-label').textContent = `${months[state.month]} ${state.year}`;
  $('balance-value').textContent = money(current.balance);
  $('income-value').textContent = money(current.income);
  $('expense-value').textContent = money(current.expense);
  $('balance-value').style.color = current.balance < 0 ? '#ffd2c4' : '#fff';
  $('optional-value').textContent = money(current.optional);
  $('recommendation-text').textContent = recommendation(current, previous);
  $('annual-title').textContent = `Balance de ${state.year}`;
  $('annual-income').textContent = money(annual.income);
  $('annual-expense').textContent = money(annual.expense);
  $('annual-balance').textContent = money(annual.balance);
  $('category-total').textContent = money(current.expense);
  const categoryEntries = Object.entries(current.categories).sort((a, b) => b[1] - a[1]);
  $('category-list').innerHTML = categoryEntries.length ? categoryEntries.map(([name, cents]) => `<div class="category-row"><span>${escapeHtml(name)}</span><strong>${escapeHtml(money(cents))}</strong><div class="bar-track"><div class="bar-fill" style="width:${current.expense ? Math.round(cents * 100 / current.expense) : 0}%"></div></div></div>`).join('') : '<div class="empty-state">Aún no hay gastos en este mes. Añade el primero para ver tus categorías.</div>';

  const monthly = state.movements.filter(row => row.occurred_on.startsWith(month)).sort((a, b) => b.occurred_on.localeCompare(a.occurred_on));
  $('movement-count').textContent = `${monthly.length} ${monthly.length === 1 ? 'registro' : 'registros'}`;
  $('movement-list').innerHTML = monthly.length ? monthly.map(row => `<article class="record"><div class="record-icon ${row.kind === 'income' ? 'income' : ''}">${row.kind === 'income' ? '↙' : '↗'}</div><div class="record-main"><strong>${escapeHtml(row.title)}</strong><span>${escapeHtml(row.category)} · ${formatDate(row.occurred_on)}${row.kind === 'expense' ? ` · ${row.essential ? 'Necesario' : 'Opcional'}` : ''}</span></div><div class="record-actions"><span class="record-amount ${row.kind === 'income' ? 'income' : ''}">${row.kind === 'income' ? '+' : '−'}${escapeHtml(money(row.amount_cents))}</span><button class="delete-button" type="button" data-delete-movement="${escapeHtml(row.id)}" aria-label="Eliminar ${escapeHtml(row.title)}">×</button></div></article>`).join('') : '<div class="empty-state">No hay movimientos en este mes. Puedes registrarlos con el botón superior o dictar una frase.</div>';

  $('bill-list').innerHTML = state.bills.length ? [...state.bills].sort((a, b) => a.due_day - b.due_day).map(bill => {
    const paid = billPaid(bill, state.movements, month);
    return `<article class="record"><div class="record-icon ${paid ? 'income' : ''}">${paid ? '✓' : '○'}</div><div class="record-main"><strong>${escapeHtml(bill.title)}</strong><span>Día ${bill.due_day} · ${escapeHtml(bill.category)}${bill.expected_cents ? ` · Previsto ${escapeHtml(money(bill.expected_cents))}` : ''}</span></div><div class="record-actions">${paid ? '<span class="paid-pill">Pagado</span>' : `<button class="small-button" type="button" data-pay-bill="${escapeHtml(bill.id)}">Registrar</button>`}<button class="delete-button" type="button" data-delete-bill="${escapeHtml(bill.id)}" aria-label="Eliminar ${escapeHtml(bill.title)}">×</button></div></article>`;
  }).join('') : '<div class="empty-state">Añade internet, luz u otros pagos que se repiten cada mes.</div>';
}

function switchTab(tab) {
  state.tab = tab;
  for (const name of ['summary', 'movements', 'bills']) $(`${name}-section`).hidden = name !== tab;
  document.querySelectorAll('[data-tab]').forEach(button => button.classList.toggle('active', button.dataset.tab === tab));
  $('section-title').textContent = ({ summary: 'Resumen', movements: 'Movimientos', bills: 'Pagos mensuales' })[tab];
}

function shiftMonth(delta) {
  const date = new Date(state.year, state.month + delta, 1);
  state.year = date.getFullYear(); state.month = date.getMonth(); render();
}

function closeDialog(id) { $(id).close(); }

function openMovement(draft = {}) {
  const form = $('movement-form'); form.reset();
  const kind = draft.kind || 'expense';
  form.elements.kind.value = kind;
  form.elements.title.value = draft.title || '';
  form.elements.amount.value = draft.amount_cents ? (draft.amount_cents / 100).toFixed(2) : '';
  form.elements.date.value = draft.occurred_on || defaultDate();
  form.elements.category.value = categories.includes(draft.category) ? draft.category : 'Otros';
  form.elements.essential.checked = Boolean(draft.essential);
  form.dataset.billId = draft.bill_id || '';
  $('movement-dialog-title').textContent = draft.title ? 'Revisar movimiento' : 'Nuevo movimiento';
  $('movement-error').textContent = draft.amount_cents === null ? 'Falta el importe. Escríbelo antes de guardar.' : '';
  updateMovementFields();
  $('movement-dialog').showModal();
  return new Promise(resolve => $('movement-dialog').addEventListener('close', () => resolve($('movement-dialog').returnValue), { once: true }));
}

function updateMovementFields() {
  const income = $('movement-form').elements.kind.value === 'income';
  $('category-field').hidden = income;
  $('essential-field').hidden = income;
}

function openBill() {
  $('bill-form').reset(); $('bill-form').elements.dueDay.value = 1;
  $('bill-form').elements.category.value = 'Servicios';
  $('bill-error').textContent = '';
  $('bill-dialog').showModal();
}

async function saveMovement(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const cents = parseMoney(form.elements.amount.value);
  if (!cents || !form.elements.title.value.trim()) { $('movement-error').textContent = 'Escribe una descripción y un importe mayor que cero.'; return; }
  const kind = form.elements.kind.value;
  const row = { id: crypto.randomUUID(), kind, title: form.elements.title.value.trim(),
    amount_cents: cents, occurred_on: form.elements.date.value,
    category: kind === 'income' ? 'Ingresos' : form.elements.category.value,
    essential: kind === 'expense' && form.elements.essential.checked,
    bill_id: kind === 'expense' ? (form.dataset.billId || null) : null };
  if (row.bill_id) {
    const bill = state.bills.find(item => item.id === row.bill_id);
    if (bill && billPaid(bill, state.movements, row.occurred_on.slice(0, 7)) && !confirm(`«${bill.title}» ya figura como pagado en este mes. ¿Registrar otro gasto?`)) return;
  }
  try { await state.store.upsert('movements', row); $('movement-dialog').close('saved'); await refresh(); toast('Movimiento guardado.'); }
  catch (error) { $('movement-error').textContent = error.message || 'No se pudo guardar.'; }
}

async function saveBill(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const dueDay = Number(form.elements.dueDay.value);
  const expected = form.elements.expected.value.trim() ? parseMoney(form.elements.expected.value) : null;
  if (!form.elements.title.value.trim() || !Number.isInteger(dueDay) || dueDay < 1 || dueDay > 31 || (form.elements.expected.value.trim() && !expected)) {
    $('bill-error').textContent = 'Completa el nombre, un día del 1 al 31 y un importe positivo si lo indicas.'; return;
  }
  const row = { id: crypto.randomUUID(), title: form.elements.title.value.trim(), due_day: dueDay,
    expected_cents: expected, category: form.elements.category.value };
  try { await state.store.upsert('bills', row); closeDialog('bill-dialog'); await refresh(); toast('Pago mensual guardado.'); }
  catch (error) { $('bill-error').textContent = error.message || 'No se pudo guardar.'; }
}

async function handleRecordClick(event) {
  const pay = event.target.closest('[data-pay-bill]');
  if (pay) {
    const bill = state.bills.find(item => item.id === pay.dataset.payBill);
    if (!bill) return;
    const date = defaultDate();
    openMovement({ kind: 'expense', title: bill.title, category: bill.category,
      amount_cents: bill.expected_cents, essential: true, bill_id: bill.id, occurred_on: date });
    return;
  }
  const movement = event.target.closest('[data-delete-movement]');
  if (movement) {
    const row = state.movements.find(item => item.id === movement.dataset.deleteMovement);
    if (!row || !confirm(`¿Eliminar «${row.title}»?`)) return;
    try { await state.store.remove('movements', row.id); await refresh(); toast('Movimiento eliminado.'); }
    catch (error) { toast(error.message); }
  }
  const billButton = event.target.closest('[data-delete-bill]');
  if (billButton) {
    const bill = state.bills.find(item => item.id === billButton.dataset.deleteBill);
    if (!bill || !confirm(`¿Eliminar «${bill.title}»? Los gastos registrados se conservarán.`)) return;
    try { await state.store.remove('bills', bill.id); await refresh(); toast('Pago mensual eliminado.'); }
    catch (error) { toast(error.message); }
  }
}

function openVoice() {
  $('voice-text').value = ''; $('voice-message').textContent = '';
  $('voice-dialog').showModal();
}

function toggleVoice() {
  if (state.recognition) { state.recognition.stop(); return; }
  const Engine = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Engine) { $('voice-message').textContent = 'Este navegador no ofrece reconocimiento de voz local. Puedes escribir la frase.'; return; }
  const recognition = new Engine();
  if (!('processLocally' in recognition)) { $('voice-message').textContent = 'Este navegador no garantiza voz local. Puedes escribir la frase.'; return; }
  recognition.processLocally = true;
  recognition.lang = 'es-EC';
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.onresult = event => { $('voice-text').value = [...event.results].map(result => result[0].transcript).join(' '); };
  recognition.onerror = () => { $('voice-message').textContent = 'No se pudo reconocer la voz localmente. Comprueba los permisos y el idioma, o escribe la frase.'; };
  recognition.onend = () => { state.recognition = null; $('listen-button').classList.remove('listening'); $('listen-button').querySelector('strong').textContent = 'Hablar'; };
  try { recognition.start(); state.recognition = recognition; $('listen-button').classList.add('listening'); $('listen-button').querySelector('strong').textContent = 'Detener'; }
  catch { $('voice-message').textContent = 'No se pudo iniciar el micrófono. Puedes escribir la frase.'; }
}

async function reviewVoice() {
  const text = $('voice-text').value.trim();
  if (!text) { $('voice-message').textContent = 'Habla o escribe una frase primero.'; return; }
  const drafts = parseVoice(text, state.bills);
  closeDialog('voice-dialog');
  for (const draft of drafts) {
    const result = await openMovement(draft);
    if (result !== 'saved') toast('Movimiento omitido.');
  }
}

function openSettings() {
  const config = state.cloudConfig || savedConfig() || {};
  $('config-form').elements.url.value = config.url || '';
  $('config-form').elements.key.value = config.key || '';
  $('settings-message').textContent = '';
  $('settings-dialog').showModal();
}

function exportData() {
  const payload = { format: 'bolsillo-claro-v1', exported_at: new Date().toISOString(),
    movements: state.movements, bills: state.bills };
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a'); link.href = url; link.download = `bolsillo-claro-${today()}.json`; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast('Copia exportada. Guárdala en un lugar privado.');
}

async function importData(event) {
  const file = event.target.files?.[0]; if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    if (data.format !== 'bolsillo-claro-v1' || !Array.isArray(data.movements) || !Array.isArray(data.bills)) throw new Error('El archivo no es una copia válida de Bolsillo Claro.');
    if (!data.bills.every(row => /^[\da-f-]{36}$/i.test(row.id) && row.title && Number.isInteger(row.due_day)) ||
        !data.movements.every(row => /^[\da-f-]{36}$/i.test(row.id) && ['income', 'expense'].includes(row.kind) && Number.isSafeInteger(row.amount_cents) && row.amount_cents > 0 && /^\d{4}-\d{2}-\d{2}$/.test(row.occurred_on))) throw new Error('La copia contiene registros inválidos.');
    if (!confirm(`¿Importar ${data.movements.length} movimientos y ${data.bills.length} pagos? Los ID repetidos se actualizarán.`)) return;
    const availableBills = new Set([...state.bills, ...data.bills].map(bill => bill.id));
    for (const bill of data.bills) await state.store.upsert('bills', { id: bill.id, title: bill.title, due_day: bill.due_day, category: bill.category, expected_cents: bill.expected_cents });
    for (const row of data.movements) await state.store.upsert('movements', { id: row.id, kind: row.kind, title: row.title, category: row.category, amount_cents: row.amount_cents, occurred_on: row.occurred_on, essential: Boolean(row.essential), bill_id: availableBills.has(row.bill_id) ? row.bill_id : null });
    await refresh(); $('settings-message').textContent = 'Copia importada correctamente.';
  } catch (error) { $('settings-message').textContent = error.message || 'No se pudo importar la copia.'; }
  finally { event.target.value = ''; }
}

async function boot() {
  for (const form of [$('movement-form'), $('bill-form')]) {
    form.elements.category.innerHTML = categories.map(category => `<option value="${category}">${category}</option>`).join('');
  }
  document.querySelectorAll('[data-tab]').forEach(button => button.addEventListener('click', () => switchTab(button.dataset.tab)));
  document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => closeDialog(button.dataset.close)));
  $('month-prev').addEventListener('click', () => shiftMonth(-1));
  $('month-next').addEventListener('click', () => shiftMonth(1));
  $('add-button').addEventListener('click', () => openMovement());
  $('add-bill-button').addEventListener('click', openBill);
  $('voice-button').addEventListener('click', openVoice);
  $('voice-dialog').addEventListener('close', () => { if (state.recognition) state.recognition.stop(); });
  $('listen-button').addEventListener('click', toggleVoice);
  $('parse-voice-button').addEventListener('click', reviewVoice);
  $('movement-form').addEventListener('submit', saveMovement);
  $('bill-form').addEventListener('submit', saveBill);
  $('movement-form').querySelectorAll('input[name=kind]').forEach(input => input.addEventListener('change', updateMovementFields));
  $('movement-list').addEventListener('click', handleRecordClick);
  $('bill-list').addEventListener('click', handleRecordClick);
  for (const id of ['settings-button', 'mobile-settings-button', 'auth-settings-button']) $(id).addEventListener('click', openSettings);
  $('export-button').addEventListener('click', exportData);
  $('import-input').addEventListener('change', importData);
  $('local-button').addEventListener('click', async () => { state.store = new LocalStore(); await showApp(); });
  $('logout-button').addEventListener('click', () => { if (state.store.mode === 'cloud') state.store.signOut(); showAuth(); });
  $('login-form').addEventListener('submit', async event => {
    event.preventDefault();
    if (!state.cloudConfig) return;
    const form = event.currentTarget;
    const button = form.querySelector('button[type=submit]'); button.disabled = true;
    $('auth-message').textContent = 'Iniciando sesión…';
    try { const cloud = new CloudStore(state.cloudConfig); await cloud.signIn(form.elements.email.value, form.elements.password.value); state.store = cloud; form.elements.password.value = ''; await showApp(); }
    catch (error) { $('auth-message').textContent = error.message || 'No se pudo iniciar sesión.'; }
    finally { button.disabled = false; }
  });
  $('config-form').addEventListener('submit', event => {
    event.preventDefault();
    const form = event.currentTarget;
    const url = form.elements.url.value.trim().replace(/\/$/, '');
    const key = form.elements.key.value.trim();
    if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url) || !key.startsWith('sb_publishable_')) { $('settings-message').textContent = 'Usa la URL de Supabase y una publishable key válida.'; return; }
    saveConfig({ url, key }); state.cloudConfig = { url, key };
    closeDialog('settings-dialog');
    if (state.store.mode === 'cloud') state.store.signOut();
    showAuth(); toast('Sincronización configurada. Inicia sesión.');
  });
  state.cloudConfig = await deploymentConfig() || savedConfig();
  if (state.cloudConfig) {
    const cloud = new CloudStore(state.cloudConfig);
    if (await cloud.restore()) { state.store = cloud; await showApp(); }
    else showAuth();
  } else await showApp();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
}

boot();
