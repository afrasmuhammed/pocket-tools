import { UI } from '../core/ui.js';

const FIRST = ['Ava', 'Noah', 'Mia', 'Leo', 'Sofia', 'Elias', 'Nora', 'Omar', 'Lina', 'Ivy', 'Adam', 'Zara'];
const LAST = ['Morgan', 'Patel', 'Khan', 'Reed', 'Silva', 'Nguyen', 'Miller', 'Fischer', 'Garcia', 'Brown', 'Ali', 'Weber'];
const COMPANIES = ['Northstar Labs', 'Blue Peak Studio', 'Orbit Retail', 'Bright Cart', 'Nova Systems', 'Fieldstone Co'];

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function number(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.+|\.+$/g, '');
}

function phoneFor(locale) {
  if (locale === 'eu') return `+49 ${number(150, 179)} ${number(1000000, 9999999)}`;
  if (locale === 'us') return `+1 ${number(201, 989)}-${number(200, 999)}-${number(1000, 9999)}`;
  return `+${number(20, 99)} ${number(100, 999)} ${number(100000, 999999)}`;
}

export default {
  init() {
    const countEl = document.getElementById('du-count');
    const localeEl = document.getElementById('du-locale');
    const phoneEl = document.getElementById('du-phone');
    const companyEl = document.getElementById('du-company');
    const outputEl = document.getElementById('du-output');

    const generate = () => {
      const count = Math.min(Math.max(Number(countEl.value) || 1, 1), 50);
      countEl.value = String(count);
      const users = Array.from({ length: count }, (_, index) => {
        const firstName = pick(FIRST);
        const lastName = pick(LAST);
        const name = `${firstName} ${lastName}`;
        const user = {
          id: crypto.randomUUID(),
          name,
          email: `${slug(firstName)}.${slug(lastName)}${number(10, 99)}@example.test`,
          username: `${slug(firstName)}_${slug(lastName)}_${number(100, 999)}`,
          role: pick(['Admin', 'Editor', 'Viewer', 'Customer', 'QA Tester']),
          active: index % 4 !== 0,
        };
        if (phoneEl.checked) user.phone = phoneFor(localeEl.value);
        if (companyEl.checked) user.company = pick(COMPANIES);
        return user;
      });
      outputEl.value = JSON.stringify(users, null, 2);
    };

    document.getElementById('btn-du-generate').onclick = generate;
    document.getElementById('btn-du-copy').onclick = () => {
      if (!outputEl.value) return UI.showError('Nothing to copy yet.');
      navigator.clipboard.writeText(outputEl.value)
        .then(() => UI.showToast('Copied!', 'success'))
        .catch(() => UI.showError('Copy failed.'));
    };
    generate();
  },
};
