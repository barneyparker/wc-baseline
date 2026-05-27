import { extractCodeFromUrl, exchangeCode, storeToken, storeRefreshToken, fetchUser, getStoredUser, notifyAuthChanged } from '/lib/auth.js';

const code = extractCodeFromUrl();
if (code) {
  try {
    const { token, refreshToken } = await exchangeCode(code);
    storeToken(token);
    storeRefreshToken(refreshToken);
  } catch {
    window.location.href = '/';
  }
  const user = await fetchUser();
  if (user) notifyAuthChanged();
  window.location.href = '/app';
} else {
  const currentUser = getStoredUser();
  if (currentUser) notifyAuthChanged();

  const welcome = document.getElementById('welcome-message');
  if (currentUser) {
    welcome.textContent = 'Welcome back, ' + (currentUser.name || 'friend') + '!';
    welcome.style.display = '';
  }
}
