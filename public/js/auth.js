import { api, setToken } from './api.js';

// Renders the login / signup form. Calls onSuccess() once authenticated.
export function renderAuth(container, onSuccess) {
  let mode = 'login';
  container.innerHTML = '';

  const card = document.createElement('section');
  card.className = 'auth-card';

  const title = document.createElement('h1');
  title.textContent = 'PriorityFeed';

  const subtitle = document.createElement('p');
  subtitle.className = 'auth-subtitle';
  subtitle.textContent = 'Prioritize your course Slack messages.';

  const form = document.createElement('form');
  form.innerHTML = `
    <label>Email
      <input type="email" name="email" required autocomplete="email" />
    </label>
    <label>Password
      <input type="password" name="password" required minlength="6"
        autocomplete="current-password" />
    </label>
  `;

  const submit = document.createElement('button');
  submit.type = 'submit';

  const error = document.createElement('p');
  error.className = 'auth-error';
  error.setAttribute('role', 'alert');

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'link-btn';

  const render = () => {
    title.textContent = 'PriorityFeed';
    submit.textContent = mode === 'login' ? 'Log in' : 'Create account';
    toggle.textContent =
      mode === 'login'
        ? 'New here? Create an account'
        : 'Have an account? Log in';
    error.textContent = '';
  };

  toggle.addEventListener('click', () => {
    mode = mode === 'login' ? 'signup' : 'login';
    render();
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    error.textContent = '';
    const email = form.email.value.trim();
    const password = form.password.value;
    try {
      const data = await api(`/api/auth/${mode}`, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setToken(data.token);
      onSuccess();
    } catch (err) {
      error.textContent = err.message;
    }
  });

  form.append(submit);
  card.append(title, subtitle, form, error, toggle);
  container.append(card);
  render();
}
