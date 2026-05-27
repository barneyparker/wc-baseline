import { extractCodeFromUrl, exchangeCode, storeToken, storeRefreshToken, fetchUser, getStoredUser, notifyAuthChanged } from '/lib/auth.js';

const code = extractCodeFromUrl();
console.log('[auth] init: code from URL:', code);
if (code) {
  try {
    console.log('[auth] init: exchanging code...');
    const { token, refreshToken } = await exchangeCode(code);
    console.log('[auth] init: exchange successful, storing tokens');
    storeToken(token);
    storeRefreshToken(refreshToken);
  } catch (err) {
    console.log('[auth] init: exchange failed:', err.message);
    window.location.href = '/';
    return;
  }
  console.log('[auth] init: fetching user...');
  const user = await fetchUser();
  console.log('[auth] init: user:', user);
  if (user) notifyAuthChanged();
  console.log('[auth] init: redirecting to /app');
  window.location.href = '/app';
} else {
  const currentUser = getStoredUser();
  console.log('[auth] init: no code, stored user:', currentUser);
  if (currentUser) notifyAuthChanged();

  const welcome = document.getElementById('welcome-message');
  if (currentUser) {
    welcome.textContent = 'Welcome back, ' + (currentUser.name || 'friend') + '!';
    welcome.style.display = '';
  }
}
