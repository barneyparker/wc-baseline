import { extractTokensFromUrl, storeToken, storeRefreshToken, fetchUser, getStoredUser, notifyAuthChanged } from '/lib/auth.js';

const tokens = extractTokensFromUrl();
console.log('[auth] init: tokens from URL:', tokens ? 'present' : 'none');
if (tokens) {
  console.log('[auth] init: storing tokens');
  storeToken(tokens.token);
  storeRefreshToken(tokens.refresh);
  console.log('[auth] init: fetching user...');
  const user = await fetchUser();
  console.log('[auth] init: user:', user);
  if (user) notifyAuthChanged();
  console.log('[auth] init: redirecting to /app');
  window.location.href = '/app';
} else {
  const currentUser = getStoredUser();
  console.log('[auth] init: no tokens, stored user:', currentUser);
  if (currentUser) notifyAuthChanged();

  const welcome = document.getElementById('welcome-message');
  if (currentUser) {
    welcome.textContent = 'Welcome back, ' + (currentUser.name || 'friend') + '!';
    welcome.style.display = '';
  }
}
