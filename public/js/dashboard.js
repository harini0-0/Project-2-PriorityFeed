import { api } from './api.js';

const PRIORITIES = ['Critical', 'Important', 'Normal'];

// Renders the message dashboard: summary, filters, sync, and message cards.
export async function renderDashboard(container) {
  container.innerHTML = '';
  const filters = {};

  const summary = document.createElement('section');
  summary.className = 'summary';

  const toolbar = buildToolbar(filters, () => refresh());
  const list = document.createElement('section');
  list.className = 'message-list';

  container.append(summary, toolbar.el, list);

  async function refresh() {
    const [messages, counts] = await Promise.all([
      api('/api/messages?' + new URLSearchParams(cleanFilters(filters))),
      api('/api/messages/summary'),
    ]);
    renderSummary(summary, counts);
    toolbar.populateChannels(messages);
    renderMessages(list, messages, refresh);
  }

  toolbar.onSync(async (btn) => {
    btn.disabled = true;
    btn.textContent = 'Syncing…';
    try {
      const { synced } = await api('/api/slack/sync', { method: 'POST' });
      btn.textContent = `Synced ${synced}`;
    } catch (err) {
      btn.textContent = 'Sync failed';
      console.error(err);
    }
    setTimeout(() => {
      btn.textContent = 'Sync Slack';
      btn.disabled = false;
    }, 1500);
    await refresh();
  });

  await refresh();
}

function cleanFilters(filters) {
  return Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
}

function renderSummary(el, counts) {
  el.innerHTML = '<h2>Unread</h2>';
  const row = document.createElement('div');
  row.className = 'summary-row';
  for (const p of PRIORITIES) {
    const chip = document.createElement('span');
    chip.className = `chip ${p.toLowerCase()}`;
    chip.textContent = `${p}: ${counts[p] || 0}`;
    row.append(chip);
  }
  el.append(row);
}

function buildToolbar(filters, onChange) {
  const el = document.createElement('section');
  el.className = 'toolbar';

  const sync = document.createElement('button');
  sync.type = 'button';
  sync.textContent = 'Sync Slack';
  sync.className = 'primary';

  const priority = selectField('Priority', ['', ...PRIORITIES], (v) => {
    filters.priority = v;
    onChange();
  });

  const channel = selectField('Channel', [''], (v) => {
    filters.channelName = v;
    onChange();
  });

  const bookmarked = document.createElement('label');
  bookmarked.className = 'check';
  bookmarked.innerHTML = '<input type="checkbox" /> Bookmarked only';
  bookmarked.querySelector('input').addEventListener('change', (e) => {
    filters.bookmarked = e.target.checked ? 'true' : '';
    onChange();
  });

  el.append(sync, priority.field, channel.field, bookmarked);

  return {
    el,
    onSync: (handler) => sync.addEventListener('click', () => handler(sync)),
    populateChannels: (messages) => {
      const names = [...new Set(messages.map((m) => m.channelName))].sort();
      channel.setOptions(['', ...names]);
    },
  };
}

function selectField(label, options, onChange) {
  const field = document.createElement('label');
  field.className = 'field';
  field.append(document.createTextNode(label));
  const select = document.createElement('select');
  const setOptions = (opts) => {
    const current = select.value;
    select.innerHTML = '';
    for (const o of opts) {
      const opt = document.createElement('option');
      opt.value = o;
      opt.textContent = o || 'All';
      select.append(opt);
    }
    select.value = current;
  };
  setOptions(options);
  select.addEventListener('change', () => onChange(select.value));
  field.append(select);
  return { field, setOptions };
}

function renderMessages(list, messages, refresh) {
  list.innerHTML = '';
  if (!messages.length) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = 'No messages yet. Click "Sync Slack" to pull them in.';
    list.append(empty);
    return;
  }
  for (const m of messages) list.append(messageCard(m, refresh));
}

function messageCard(m, refresh) {
  const card = document.createElement('article');
  card.className = `card ${m.priority.toLowerCase()}${m.read ? ' read' : ''}`;

  const head = document.createElement('div');
  head.className = 'card-head';

  const badge = document.createElement('span');
  badge.className = `chip ${m.priority.toLowerCase()}`;
  badge.textContent = m.priority;

  const meta = document.createElement('span');
  meta.className = 'meta';
  meta.textContent = `#${m.channelName} · ${m.senderName} · ${formatTime(m.tsDate)}`;

  head.append(badge, meta);

  const body = document.createElement('p');
  body.className = 'card-text';
  body.textContent = m.text;

  const actions = document.createElement('div');
  actions.className = 'card-actions';

  const bookmark = actionButton(m.bookmarked ? '★ Bookmarked' : '☆ Bookmark');
  bookmark.addEventListener('click', async () => {
    await api(`/api/messages/${m._id}`, {
      method: 'PATCH',
      body: JSON.stringify({ bookmarked: !m.bookmarked }),
    });
    refresh();
  });

  const read = actionButton(m.read ? 'Mark unread' : 'Mark read');
  read.addEventListener('click', async () => {
    await api(`/api/messages/${m._id}`, {
      method: 'PATCH',
      body: JSON.stringify({ read: !m.read }),
    });
    refresh();
  });

  actions.append(bookmark, read);
  card.append(head, body, actions);
  return card;
}

function actionButton(text) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'action';
  btn.textContent = text;
  return btn;
}

function formatTime(value) {
  const d = new Date(value);
  return d.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
