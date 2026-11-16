export const categories = ['Comida', 'Servicios', 'Vivienda', 'Transporte', 'Salud', 'Ocio', 'Compras', 'Otros'];
export const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

export function today() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function parseMoney(raw) {
  let value = String(raw).trim().replace(/[^\d.,]/g, '');
  if (!value) return null;
  if (value.includes('.') && value.includes(',')) {
    const decimal = value.lastIndexOf(',') > value.lastIndexOf('.') ? ',' : '.';
    const group = decimal === ',' ? '.' : ',';
    value = value.replaceAll(group, '').replace(decimal, '.');
  } else if (/^\d{1,3}([.,]\d{3})+$/.test(value)) {
    value = value.replaceAll(/[.,]/g, '');
  } else if (/^\d+[.,]\d{1,2}$/.test(value)) {
    value = value.replace(',', '.');
  } else if (!/^\d+$/.test(value)) {
    return null;
  }
  const number = Number(value);
  const cents = Math.round(number * 100);
  return Number.isSafeInteger(cents) && cents > 0 ? cents : null;
}

export function money(cents) {
  return new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(cents / 100);
}

export function monthKey(date) { return String(date).slice(0, 7); }

export function summarize(movements, period) {
  const rows = movements.filter(row => period === 'all' || (period.length === 4 ? row.occurred_on.startsWith(period) : monthKey(row.occurred_on) === period));
  const result = { income: 0, expense: 0, optional: 0, categories: {} };
  for (const row of rows) {
    if (row.kind === 'income') result.income += row.amount_cents;
    else {
      result.expense += row.amount_cents;
      if (!row.essential) result.optional += row.amount_cents;
      result.categories[row.category] = (result.categories[row.category] || 0) + row.amount_cents;
    }
  }
  result.balance = result.income - result.expense;
  return result;
}

export function billPaid(bill, movements, period) {
  return movements.some(row => row.bill_id === bill.id && row.kind === 'expense' && monthKey(row.occurred_on) === period);
}

export function recommendation(current, previous) {
  if (!current.income && !current.expense) return 'Registra tus movimientos para recibir una sugerencia basada en tus cifras.';
  if (current.balance < 0) return `Tus gastos superan tus ingresos por ${money(-current.balance)}. Revisa primero los gastos opcionales.`;
  if (previous.optional && current.optional > previous.optional) return `Tus gastos opcionales subieron ${money(current.optional - previous.optional)} frente al mes anterior. Puedes considerar reservar esa diferencia.`;
  if (current.balance > 0) return `Te quedan ${money(current.balance)} en este período. Puedes asignar una parte a tu meta de ahorro.`;
  return 'Tus ingresos y gastos están equilibrados. Considera fijar una meta de ahorro para el próximo mes.';
}

function normalize(text) {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function categoryFor(text) {
  if (/\b(internet|telefono|celular|luz|electricidad|agua|gas)\b/.test(text)) return 'Servicios';
  if (/\b(alquiler|arriendo|renta)\b/.test(text)) return 'Vivienda';
  if (/\b(torta|pastel|cafe|restaurante|comida|almuerzo|desayuno)\b/.test(text)) return 'Comida';
  if (/\b(bus|taxi|gasolina|transporte)\b/.test(text)) return 'Transporte';
  if (/\b(medicina|farmacia|medico)\b/.test(text)) return 'Salud';
  return 'Otros';
}

const amountPattern = /(?<![\d.,])(?:US\$\s*|\$\s*|usd\s*)?(?:\d{1,3}(?:[.,]\d{3})+(?:[.,]\d{1,2})?|\d+(?:[.,]\d{1,2})?)(?![\d.,])/i;
const splitPattern = /\s*(?:,|;|\by\b|\btambien\b|\bademas\b)\s*(?=(?:me\s+)?(?:pague|compre|gaste|recibi|cobre|gane|ingrese))/i;

export function parseVoice(text, bills = [], date = today()) {
  const normalized = normalize(text);
  return normalized.split(splitPattern).map(part => part.trim()).filter(Boolean).map(part => {
    const amountMatch = part.match(amountPattern);
    const income = /\b(recibi|cobre|gane|ingrese|sueldo|salario)\b/.test(part);
    const bill = bills.find(item => part.includes(normalize(item.title)));
    const title = part.replace(amountPattern, ' ')
      .replace(/\b(hoy|ayer|el dia de|me|pague|compre|gaste|recibi|cobre|gane|ingrese|en|de|por|una|un|la|el|los|las|dolares|dolar|usd)\b/g, ' ')
      .replace(/\s+/g, ' ').trim();
    const occurredOn = part.includes('ayer')
      ? (() => { const d = new Date(`${date}T12:00:00`); d.setDate(d.getDate() - 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })()
      : date;
    return {
      kind: income ? 'income' : 'expense',
      title: title ? title[0].toUpperCase() + title.slice(1) : (income ? 'Ingreso' : 'Gasto'),
      amount_cents: amountMatch ? parseMoney(amountMatch[0]) : null,
      category: income ? 'Ingresos' : (bill?.category || categoryFor(part)),
      essential: !income && Boolean(bill || /\b(internet|luz|electricidad|agua|alquiler|arriendo|renta|medicina|farmacia|transporte)\b/.test(part)),
      bill_id: bill?.id || null,
      occurred_on: occurredOn,
    };
  });
}
