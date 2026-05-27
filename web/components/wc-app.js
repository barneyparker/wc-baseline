/**
 * @typedef {import('/lib/auth.js').User} User
 */

import { requireAuth, fetchUser, getStoredUser, logout, authFetch } from '/lib/auth.js';

const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host { display: block; }
    .profile {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      padding: 2rem 0;
      text-align: center;
    }
    .profile wc-card {
      width: 100%;
      max-width: 28rem;
    }
    .profile h1 { margin: 0; font-size: 1.5rem; }
    .profile pre {
      text-align: left;
      font-size: 0.75rem;
      overflow-x: auto;
      white-space: pre-wrap;
      word-break: break-all;
    }
    .btn {
      font: inherit;
      font-size: 0.875rem;
      font-weight: 600;
      padding: 0.35rem 0.8rem;
      border-radius: 0.375rem;
      cursor: pointer;
      border: none;
      background: #f1f5f9;
      color: #475569;
    }
    .btn:hover { background: #e2e8f0; }
    @media (min-width: 640px) {
      .profile { padding: 3rem 1.5rem; }
      .profile h1 { font-size: inherit; }
      .profile pre { font-size: 0.8rem; }
    }
  </style>
  <div class="profile">
    <wc-spinner id="spinner"></wc-spinner>
    <div id="content" style="display: none;">
      <h1>Dashboard</h1>
      <wc-card>
        <div slot="header">Your Profile</div>
        <p><strong>Name:</strong> <span id="name"></span></p>
        <p><strong>Email:</strong> <span id="email"></span></p>
        <p><strong>User ID:</strong> <code id="id"></code></p>
        <p><strong>Member since:</strong> <span id="created"></span></p>
      </wc-card>
      <wc-card id="api-card">
        <div slot="header">Protected API Response</div>
        <pre id="api-result">Loading...</pre>
      </wc-card>
      <button class="btn" id="logout-btn">Log out</button>
    </div>
  </div>
`;

/**
 * `<wc-app>` – authenticated dashboard page.
 *
 * Requires a valid JWT (redirects to `/` if missing).
 * Fetches the user profile and calls the protected API endpoint.
 */
class WCApp extends HTMLElement {
  /** @type {ShadowRoot | null} */
  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.appendChild(template.content.cloneNode(true));
    }

    if (!requireAuth()) return;

    this.#load();
  }

  /** Loads user profile and protected API data. */
  async #load() {
    const spinner = this.shadowRoot.getElementById('spinner');
    const content = this.shadowRoot.getElementById('content');

    let user = /** @type {User | null} */ (getStoredUser());

    if (!user) {
      user = await fetchUser();
    }

    if (!user) {
      requireAuth();
      return;
    }

    this.shadowRoot.getElementById('name').textContent = user.name || '—';
    this.shadowRoot.getElementById('email').textContent = user.email || '—';
    this.shadowRoot.getElementById('id').textContent = user.id;
    this.shadowRoot.getElementById('created').textContent =
      new Date(user.created_at).toLocaleDateString();

    this.shadowRoot.getElementById('logout-btn').addEventListener('click', () => logout());

    this.#fetchProtected();

    spinner.style.display = 'none';
    content.style.display = '';
  }

  /** Calls the JWT-protected API and displays the response. */
  async #fetchProtected() {
    const el = this.shadowRoot.getElementById('api-result');
    try {
      const res = await authFetch('/api/v1/protected');
      if (!res.ok) {
        el.textContent = `Error: ${res.status} ${res.statusText}`;
        return;
      }
      el.textContent = JSON.stringify(await res.json(), null, 2);
    } catch (err) {
      el.textContent = `Fetch failed: ${/** @type {Error} */ (err).message}`;
    }
  }
}

customElements.define('wc-app', WCApp);
