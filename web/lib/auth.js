const TOKEN_KEY = 'wc_token';
const REFRESH_TOKEN_KEY = 'wc_refresh_token';
const USER_KEY = 'wc_user';
const AUTH_EVENT = 'wc-auth-changed';
const AUTH_ORIGIN = 'https://auth.barneyparker.com';

let _currentUser = null;

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function storeToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

function storeRefreshToken(token) {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function clearRefreshToken() {
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function getStoredUser() {
  if (_currentUser) return _currentUser;
  const raw = sessionStorage.getItem(USER_KEY);
  if (raw) {
    try {
      _currentUser = JSON.parse(raw);
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
  clearRefreshToken();
}

export async function exchangeCode(code) {
  const res = await fetch(AUTH_ORIGIN + '/api/v1/auth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });

  if (!res.ok) {
    throw new Error('Code exchange failed');
  }

  return res.json();
}

async function tryRefresh() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearUser();
    window.location.href = loginUrl();
    return false;
  }

  try {
    const res = await fetch(AUTH_ORIGIN + '/api/v1/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      clearUser();
      window.location.href = loginUrl();
      return false;
    }

    const { token, refreshToken: newRefresh } = await res.json();
    storeToken(token);
    storeRefreshToken(newRefresh);
    return true;
  } catch {
    clearUser();
    window.location.href = loginUrl();
    return false;
  }
}

export async function fetchUser() {
  let token = getToken();
  if (!token) return null;

  let res = await fetch(AUTH_ORIGIN + '/api/v1/auth/me', {
    headers: { 'Authorization': 'Bearer ' + token },
  });

  if (res.status === 401) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      token = getToken();
      res = await fetch(AUTH_ORIGIN + '/api/v1/auth/me', {
        headers: { 'Authorization': 'Bearer ' + token },
      });
    }
  }

  if (!res.ok) {
    clearUser();
    return null;
  }

  const user = await res.json();
  storeUser(user);
  return user;
}

export async function authFetch(url, options = {}) {
  let token = getToken();
  if (!token) {
    return new Response(null, { status: 401 });
  }

  const headers = new Headers(options.headers || {});
  headers.set('Authorization', 'Bearer ' + token);

  let res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      token = getToken();
      headers.set('Authorization', 'Bearer ' + token);
      res = await fetch(url, { ...options, headers });
    }
  }

  return res;
}

export function isAuthenticated() {
  return !!getStoredUser() || !!getToken();
}

export function notifyAuthChanged() {
  document.dispatchEvent(new CustomEvent(AUTH_EVENT));
}

export function extractCodeFromUrl() {
  const hash = window.location.hash;
  if (!hash) return null;
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  const code = params.get('code');
  if (code) {
    history.replaceState(null, '', window.location.pathname + window.location.search);
  }
  return code;
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
