import { extractTokenFromUrl, storeToken, fetchUser, getStoredUser, notifyAuthChanged } from '/lib/auth.js';

const token = extractTokenFromUrl();
if (token) {
  storeToken(token);
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
