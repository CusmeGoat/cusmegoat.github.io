const LOCAL_KEY = 'bolsillo-claro-data-v1';
const CONFIG_KEY = 'bolsillo-claro-cloud-config-v1';
const SESSION_KEY = 'bolsillo-claro-session-v1';

export class LocalStore {
  constructor() { this.mode = 'local'; }
  async list() {
    const data = JSON.parse(localStorage.getItem(LOCAL_KEY) || '{"movements":[],"bills":[]}');
    return { movements: data.movements || [], bills: data.bills || [] };
  }
  async upsert(table, row) {
    const data = await this.list();
    const index = data[table].findIndex(item => item.id === row.id);
    if (index >= 0) data[table][index] = row;
    else data[table].push(row);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
  }
  async remove(table, id) {
    const data = await this.list();
    data[table] = data[table].filter(item => item.id !== id);
    if (table === 'bills') data.movements = data.movements.map(row => row.bill_id === id ? { ...row, bill_id: null } : row);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
  }
}

export function savedConfig() {
  try { return JSON.parse(localStorage.getItem(CONFIG_KEY) || 'null'); } catch { return null; }
}

export function saveConfig(config) {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  localStorage.removeItem(SESSION_KEY);
}

export async function deploymentConfig() {
  try {
    const response = await fetch('/api/config', { cache: 'no-store' });
    if (!response.ok) return null;
    const value = await response.json();
    return value.url && value.key ? value : null;
  } catch { return null; }
}

export class CloudStore {
  constructor(config) {
    this.mode = 'cloud';
    this.url = config.url.replace(/\/$/, '');
    this.key = config.key;
    this.session = null;
    this.refreshing = null;
  }

  async signIn(email, password) {
    const response = await fetch(`${this.url}/auth/v1/token?grant_type=password`, {
      method: 'POST', headers: { apikey: this.key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.msg || payload.error_description || 'No se pudo iniciar sesión.');
    this.session = { access_token: payload.access_token, refresh_token: payload.refresh_token,
      expires_at: Date.now() + payload.expires_in * 1000, user_id: payload.user.id };
    localStorage.setItem(SESSION_KEY, JSON.stringify(this.session));
    return this.session;
  }

  async restore() {
    try { this.session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch { this.session = null; }
    if (!this.session) return false;
    try { await this._validToken(); return true; }
    catch { this.signOut(); return false; }
  }

  signOut() {
    this.session = null;
    localStorage.removeItem(SESSION_KEY);
  }

  async _validToken() {
    if (!this.session) throw new Error('Inicia sesión para continuar.');
    if (Date.now() < this.session.expires_at - 60000) return this.session.access_token;
    if (!this.refreshing) this.refreshing = (async () => {
      const response = await fetch(`${this.url}/auth/v1/token?grant_type=refresh_token`, {
        method: 'POST', headers: { apikey: this.key, 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: this.session.refresh_token }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error('La sesión venció. Inicia sesión de nuevo.');
      this.session = { ...this.session, access_token: payload.access_token,
        refresh_token: payload.refresh_token, expires_at: Date.now() + payload.expires_in * 1000 };
      localStorage.setItem(SESSION_KEY, JSON.stringify(this.session));
      return this.session.access_token;
    })().finally(() => { this.refreshing = null; });
    return this.refreshing;
  }

  async _request(table, query = '', options = {}) {
    const token = await this._validToken();
    const response = await fetch(`${this.url}/rest/v1/${table}${query}`, {
      ...options,
      headers: { apikey: this.key, Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json', ...(options.headers || {}) },
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.message || `No se pudieron consultar los datos (${response.status}).`);
    }
    if (response.status === 204) return null;
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }

  async _all(table, order) {
    const rows = [];
    for (let offset = 0; ; offset += 500) {
      const page = await this._request(table, `?select=*&order=${order}`, {
        headers: { Range: `${offset}-${offset + 499}` },
      });
      rows.push(...page);
      if (page.length < 500) return rows;
    }
  }

  async list() {
    const [movements, bills] = await Promise.all([
      this._all('movements', 'occurred_on.desc'), this._all('bills', 'due_day.asc'),
    ]);
    return { movements, bills };
  }

  async upsert(table, row) {
    await this._request(table, '?on_conflict=id', {
      method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({ ...row, user_id: this.session.user_id }),
    });
  }

  async remove(table, id) {
    await this._request(table, `?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' });
  }
}
