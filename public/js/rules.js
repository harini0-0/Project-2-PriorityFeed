import { api } from './api.js';

const TYPES = ['channel', 'sender', 'keyword'];
const PRIORITIES = ['Critical', 'Important', 'Normal'];

// Renders the prioritization rules view: a create form and the rule list.
export async function renderRules(container) {
  container.innerHTML = '';

  const intro = document.createElement('section');
  intro.className = 'rules-intro';
  intro.innerHTML = `
    <h1>Prioritization Rules</h1>
    <p>Messages matching a rule are grouped as Critical, Important, or Normal.
       Add rules by channel, sender, or keyword.</p>
  `;

  const facets = await api('/api/messages/facets').catch(() => ({
    senders: [],
    channels: [],
  }));
  const form = buildForm(() => load(), facets);
  const list = document.createElement('section');
  list.className = 'rule-list';

  container.append(intro, form, list);

  async function load() {
    const rules = await api('/api/rules');
    renderList(list, rules, load);
  }

  await load();
}

function buildForm(onCreated, facets) {
  const form = document.createElement('form');
  form.className = 'rule-form';

  const type = optionSelect('type', TYPES);
  const value = document.createElement('input');
  value.name = 'value';
  value.required = true;

  // Suggest real channels / senders (from synced messages) based on the type.
  const datalist = document.createElement('datalist');
  datalist.id = 'rule-suggestions';
  value.setAttribute('list', datalist.id);

  const syncSuggestions = () => {
    const items =
      type.value === 'channel'
        ? facets.channels
        : type.value === 'sender'
          ? facets.senders.map((s) => s.name)
          : [];
    datalist.innerHTML = '';
    for (const item of items) {
      const opt = document.createElement('option');
      opt.value = item;
      datalist.append(opt);
    }
    value.placeholder =
      type.value === 'keyword' ? 'e.g. exam, deadline' : 'Pick or type…';
  };
  type.addEventListener('change', syncSuggestions);
  syncSuggestions();

  const priority = optionSelect('priority', PRIORITIES);

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'primary';
  submit.textContent = 'Add rule';

  const error = document.createElement('p');
  error.className = 'auth-error';
  error.setAttribute('role', 'alert');

  form.append(
    labeled('Match by', type),
    labeled('Value', value),
    labeled('Priority', priority),
    submit
  );

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    error.textContent = '';
    try {
      await api('/api/rules', {
        method: 'POST',
        body: JSON.stringify({
          type: type.value,
          value: value.value.trim(),
          priority: priority.value,
        }),
      });
      value.value = '';
      onCreated();
    } catch (err) {
      error.textContent = err.message;
    }
  });

  const wrapper = document.createElement('section');
  wrapper.append(form, datalist, error);
  return wrapper;
}

function renderList(list, rules, reload) {
  list.innerHTML = '';
  if (!rules.length) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = 'No rules yet. Add one above to start prioritizing.';
    list.append(empty);
    return;
  }
  for (const rule of rules) {
    const row = document.createElement('div');
    row.className = 'rule-row';

    const badge = document.createElement('span');
    badge.className = `chip ${rule.priority.toLowerCase()}`;
    badge.textContent = rule.priority;

    const text = document.createElement('span');
    text.className = 'rule-text';
    text.textContent = `${rule.type}: "${rule.value}"`;

    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'action';
    del.textContent = 'Delete';
    del.addEventListener('click', async () => {
      await api(`/api/rules/${rule._id}`, { method: 'DELETE' });
      reload();
    });

    row.append(badge, text, del);
    list.append(row);
  }
}

function optionSelect(name, options) {
  const select = document.createElement('select');
  select.name = name;
  for (const o of options) {
    const opt = document.createElement('option');
    opt.value = o;
    opt.textContent = o;
    select.append(opt);
  }
  return select;
}

function labeled(text, control) {
  const label = document.createElement('label');
  label.className = 'field';
  label.append(document.createTextNode(text), control);
  return label;
}
