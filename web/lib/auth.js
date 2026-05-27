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

export function storeRefreshToken(token) {
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
  console.log('[auth] exchangeCode: calling /auth/token');
  const res = await fetch(AUTH_ORIGIN + '/api/v1/auth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });

  if (!res.ok) {
    console.log('[auth] exchangeCode: failed with status', res.status);
    throw new Error('Code exchange failed');
  }

  const data = await res.json();
  console.log('[auth] exchangeCode: success, token received');
  return data;
}

async function tryRefresh() {
  const refreshToken = getRefreshToken();
  console.log('[auth] tryRefresh: refresh token present:', !!refreshToken);
  if (!refreshToken) {
    console.log('[auth] tryRefresh: no refresh token, redirecting to Google');
    clearUser();
    window.location.href = loginUrl();
    return false;
  }

  try {
    console.log('[auth] tryRefresh: calling /auth/refresh');
    const res = await fetch(AUTH_ORIGIN + '/api/v1/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      console.log('[auth] tryRefresh: refresh failed with status', res.status, ', redirecting to Google');
      clearUser();
      window.location.href = loginUrl();
      return false;
    }

    const { token, refreshToken: newRefresh } = await res.json();
    console.log('[auth] tryRefresh: success, storing new tokens');
    storeToken(token);
    storeRefreshToken(newRefresh);
    return true;
  } catch (err) {
    console.log('[auth] tryRefresh: fetch error:', err.message, ', redirecting to Google');
    clearUser();
    window.location.href = loginUrl();
    return false;
  }
}

export async function fetchUser() {
  let token = getToken();
  console.log('[auth] fetchUser: token present:', !!token);
  if (!token) return null;

  console.log('[auth] fetchUser: calling /auth/me');
  let res = await fetch(AUTH_ORIGIN + '/api/v1/auth/me', {
    headers: { 'Authorization': 'Bearer ' + token },
  });

  if (res.status === 401) {
    console.log('[auth] fetchUser: got 401, attempting refresh');
    const refreshed = await tryRefresh();
    if (refreshed) {
      token = getToken();
      console.log('[auth] fetchUser: retrying /auth/me with new token');
      res = await fetch(AUTH_ORIGIN + '/api/v1/auth/me', {
        headers: { 'Authorization': 'Bearer ' + token },
      });
    }
  }

  if (!res.ok) {
    console.log('[auth] fetchUser: failed with status', res.status, ', clearing user');
    clearUser();
    return null;
  }

  const user = await res.json();
  console.log('[auth] fetchUser: success, user:', user.email);
  storeUser(user);
  return user;
}

export async function authFetch(url, options = {}) {
  let token = getToken();
  console.log('[auth] authFetch:', url, 'token present:', !!token);
  if (!token) {
    return new Response(null, { status: 401 });
  }

  const headers = new Headers(options.headers || {});
  headers.set('Authorization', 'Bearer ' + token);

  let res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    console.log('[auth] authFetch: got 401, attempting refresh');
    const refreshed = await tryRefresh();
    if (refreshed) {
      token = getToken();
      headers.set('Authorization', 'Bearer ' + token);
      console.log('[auth] authFetch: retrying', url, 'with new token');
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
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  if (code) {
    history.replaceState(null, '', window.location.pathname);
  }
  return code;
}

export function extractTokensFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  const refresh = params.get('refresh');
  if (token && refresh) {
    history.replaceState(null, '', window.location.pathname);
    return { token, refresh };
  }
  return null;
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
