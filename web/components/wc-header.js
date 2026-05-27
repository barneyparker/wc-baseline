/**
 * @typedef {import('/lib/auth.js').User} User
 */

import { isAuthenticated, getStoredUser, loginUrl, logout } from '/lib/auth.js';

/**
 * `<wc-header>` – site navigation bar with auth-aware login/logout.
 *
 * Listens to the `wc-auth-changed` custom event to re-render when the
 * authentication state changes.
 */
class WCHeader extends HTMLElement {
  /** @type {ShadowRoot | null} */
  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.render();
    document.addEventListener('wc-auth-changed', () => this.render());
  }

  /** Re-renders the header based on current auth state. */
  render() {
    const authed = isAuthenticated();
    const user = authed ? getStoredUser() : null;

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        header {
          border-bottom: 1px solid #e2e8f0;
          background: #fff;
          padding: 0 1rem;
        }
        nav {
          max-width: 48rem;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 3.5rem;
          gap: 0.5rem;
        }
        .logo {
          font-weight: 700;
          font-size: 1rem;
          text-decoration: none;
          color: #2563eb;
          white-space: nowrap;
        }
        .nav-links {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .nav-links a {
          text-decoration: none;
          color: #475569;
          font-weight: 600;
          font-size: 0.8125rem;
        }
        .nav-links a:hover { color: #2563eb; }
        .user-name {
          font-size: 0.8125rem;
          color: #64748b;
          max-width: 6rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .btn {
          font: inherit;
          font-size: 0.8125rem;
          font-weight: 600;
          padding: 0.3rem 0.6rem;
          border-radius: 0.375rem;
          cursor: pointer;
          border: none;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          transition: background 0.15s;
          white-space: nowrap;
        }
        .btn:disabled {
          cursor: default;
          opacity: 0.7;
        }
        .btn-login {
          background: #2563eb;
          color: #fff;
        }
        .btn-login:hover:not(:disabled) { background: #1d4ed8; }
        .btn-logout {
          background: #f1f5f9;
          color: #475569;
        }
        .btn-logout:hover { background: #e2e8f0; }
        .google-icon {
          flex-shrink: 0;
        }
        .btn-label { display: none; }
        .btn-spinner {
          display: inline-block;
          width: 1rem;
          height: 1rem;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: btn-spin 0.6s linear infinite;
        }
        @keyframes btn-spin { to { transform: rotate(360deg); } }
        @media (min-width: 480px) {
          .btn-label { display: inline; }
        }
        @media (min-width: 640px) {
          header { padding: 0 1.5rem; }
          .logo { font-size: 1.1rem; }
          .nav-links { gap: 1.25rem; }
          .nav-links a { font-size: 0.875rem; }
          .user-name { font-size: 0.875rem; max-width: none; }
          .btn { font-size: 0.875rem; padding: 0.35rem 0.8rem; gap: 0.4rem; }
        }
      </style>
      <header>
        <nav>
          <a href="/" class="logo">WC Baseline</a>
          <div class="nav-links">
            <a href="/">Home</a>
            ${authed ? '<a href="/app">App</a>' : ''}
            ${authed && user
              ? `<span class="user-name">${user.name || 'User'}</span>`
              : ''
            }
            ${authed
              ? '<button class="btn btn-logout" id="logout-btn">Log out</button>'
              : `<button class="btn btn-login" id="login-btn">
                  <svg class="google-icon" viewBox="0 0 48 48" width="18" height="18">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.54 28.59A14.5 14.5 0 0 1 9.5 24c0-1.59.28-3.14.76-4.59l-7.98-6.19A23.99 23.99 0 0 0 0 24c0 3.77.87 7.35 2.56 10.56l7.98-5.97z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 5.97C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  <span class="btn-label">Log in with Google</span>
                </button>`
            }
          </div>
        </nav>
      </header>
    `;

    this.shadowRoot.getElementById('login-btn')?.addEventListener('click', (e) => {
      const btn = /** @type {HTMLButtonElement} */ (e.currentTarget);
      btn.disabled = true;
      btn.innerHTML = '<span class="btn-spinner"></span>';
      window.location.href = loginUrl();
    });

    this.shadowRoot.getElementById('logout-btn')?.addEventListener('click', () => logout());
  }
}

customElements.define('wc-header', WCHeader);
