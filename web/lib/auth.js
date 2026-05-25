/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} name
 * @property {string} created_at
 */

const TOKEN_KEY = 'wc_token';
const USER_KEY = 'wc_user';
const AUTH_EVENT = 'wc-auth-changed';
const AUTH_ORIGIN = 'https://auth.barneyparker.com';

/** @type {User | null} */
let _currentUser = null;

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function storeToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Returns the cached user profile from sessionStorage, or `null`.
 *
 * @returns {User | null}
 */
export function getStoredUser() {
  if (_currentUser) return _currentUser;
  const raw = sessionStorage.getItem(USER_KEY);
  if (raw) {
    try {
      _currentUser = /** @type {User} */ (JSON.parse(raw));
      return _currentUser;
    } catch {
      sessionStorage.removeItem(USER_KEY);
    }
  }
  return null;
}

function storeUser(user) {
  _currentUser = user;
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearUser() {
  _currentUser = null;
  sessionStorage.removeItem(USER_KEY);
  clearToken();
}

/**
 * Fetches the current user profile from the auth service.
 *
 * Sends the JWT as an Authorization header (no credentialed CORS needed).
 *
 * @returns {Promise<User | null>}
 */
export async function fetchUser() {
  const token = getToken();
  if (!token) return null;

  const res = await fetch(AUTH_ORIGIN + '/api/v1/auth/me', {
    headers: { 'Authorization': 'Bearer ' + token },
  });

  if (!res.ok) {
    clearUser();
    return null;
  }

  const user = /** @type {User} */ (await res.json());
  storeUser(user);
  return user;
}

/**
 * Returns `true` when the user has a stored JWT.
 *
 * @returns {boolean}
 */
export function isAuthenticated() {
  return !!getStoredUser() || !!getToken();
}

export function notifyAuthChanged() {
  document.dispatchEvent(new CustomEvent(AUTH_EVENT));
}

/**
 * Extracts a JWT from the URL hash (set by the Google callback redirect)
 * and removes the hash from the address bar.
 *
 * @returns {string | null}
 */
export function extractTokenFromUrl() {
  const hash = window.location.hash;
  if (!hash) return null;
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  const token = params.get('token');
  if (token) {
    history.replaceState(null, '', window.location.pathname + window.location.search);
  }
  return token;
}

export function loginUrl() {
  const origin = encodeURIComponent(window.location.origin);
  return `${AUTH_ORIGIN}/api/v1/auth/google/login?redirect_uri=${origin}`;
}

export function logout() {
  clearUser();
  navigator.sendBeacon('/api/v1/auth/logout', '');
  window.location.href = '/';
}

export function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = '/';
    return false;
  }
  return true;
}
