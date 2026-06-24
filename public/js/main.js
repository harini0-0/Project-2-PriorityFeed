import { getToken, clearToken } from './api.js';
import { renderAuth } from './auth.js';
import { renderDashboard } from './dashboard.js';
import { renderRules } from './rules.js';

const app = document.getElementById('app');
const topbar = document.getElementById('topbar');

// Client-side router: picks a view based on auth state and the URL hash.
function route() {
  if (!getToken()) {
    topbar.hidden = true;
    renderAuth(app, () => {
      location.hash = '#/dashboard';
      route();
    });
    return;
  }

  topbar.hidden = false;
  const view = location.hash.replace('#/', '') || 'dashboard';
  if (view === 'rules') renderRules(app);
  else renderDashboard(app);
}

topbar.querySelectorAll('[data-route]').forEach((btn) => {
  btn.addEventListener('click', () => {
    location.hash = `#/${btn.dataset.route}`;
  });
});

document.getElementById('logout-btn').addEventListener('click', () => {
  clearToken();
  location.hash = '';
  route();
});

window.addEventListener('hashchange', route);
route();
