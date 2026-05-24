import { UI } from '../core/ui.js';

const SAMPLE = `StreamBox 15.49 monthly
Design Suite 59.99/mo
Cloud backup 9.99 per month
Domain renewal 18 yearly
Gym app 12.99 monthly
Music Family 16.99 monthly`;

function money(value) {
  return `$${value.toFixed(2).replace(/\.00$/, '')}`;
}

function parseAmount(line) {
  const matches = [...line.matchAll(/([$€£]\s*)?(\d+(?:[.,]\d{1,2})?)/g)];
  const prices = matches.filter(match => match[1] || /[.,]\d{1,2}$/.test(match[2]));
  const match = (prices.length ? prices : matches).at(-1);
  return match ? Number(match[2].replace(',', '.')) : 0;
}

function cadence(line) {
  const lower = line.toLowerCase();
  if (/\b(yearly|annual|annually|\/yr|per year|year)\b/.test(lower)) return 'yearly';
  if (/\b(weekly|\/wk|per week|week)\b/.test(lower)) return 'weekly';
  if (/\b(daily|per day|day)\b/.test(lower)) return 'daily';
  return 'monthly';
}

function monthlyValue(amount, period) {
  if (period === 'yearly') return amount / 12;
  if (period === 'weekly') return amount * 52 / 12;
  if (period === 'daily') return amount * 365 / 12;
  return amount;
}

function nameFrom(line) {
  return line
    .replace(/^\s*(?:\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}[-/]\d{1,2}(?:[-/]\d{2,4})?)\s+/, '')
    .replace(/(?:[$€£]\s*)?\d+(?:[.,]\d{1,2})?.*$/i, '')
    .replace(/[-–:]+$/, '')
    .trim() || 'Subscription';
}

function renderList(container, items) {
  container.replaceChildren();
  items.slice(0, 12).forEach(item => {
    const row = document.createElement('div');
    row.className = 'seo-result-row';
    const name = document.createElement('strong');
    name.textContent = item.name;
    const cost = document.createElement('span');
    cost.textContent = `${money(item.monthly)}/mo`;
    row.append(name, cost);
    container.appendChild(row);
  });
}

export default {
  init() {
    const input = document.getElementById('sa-input');
    const output = document.getElementById('sa-output');
    const list = document.getElementById('sa-list');
    const monthlyEl = document.getElementById('sa-monthly');
    const yearlyEl = document.getElementById('sa-yearly');
    const countEl = document.getElementById('sa-count');

    const run = () => {
      const items = input.value.split(/\n+/).map(line => line.trim()).filter(Boolean)
        .map(line => {
          const amount = parseAmount(line);
          const period = cadence(line);
          return { line, name: nameFrom(line), amount, period, monthly: monthlyValue(amount, period) };
        })
        .filter(item => item.amount > 0)
        .sort((a, b) => b.monthly - a.monthly);

      if (!items.length) return UI.showError('Add at least one line with a price.');
      const monthly = items.reduce((sum, item) => sum + item.monthly, 0);
      const yearly = monthly * 12;
      monthlyEl.textContent = money(monthly);
      yearlyEl.textContent = money(yearly);
      countEl.textContent = String(items.length);
      renderList(list, items);
      const top = items.slice(0, 3).map(item => `${item.name}: ${money(item.monthly)}/mo`).join('\n');
      output.value = `Monthly total: ${money(monthly)}
Yearly total: ${money(yearly)}

Top cancellation targets:
${top || 'None'}

Cut the top item and save about ${money(items[0].monthly * 12)} per year.`;
    };

    document.getElementById('btn-sa-run').onclick = run;
    document.getElementById('btn-sa-sample').onclick = () => { input.value = SAMPLE; run(); };
    document.getElementById('btn-sa-clear').onclick = () => {
      input.value = '';
      output.value = '';
      list.replaceChildren();
      monthlyEl.textContent = '$0';
      yearlyEl.textContent = '$0';
      countEl.textContent = '0';
    };
    document.getElementById('btn-sa-copy').onclick = () => {
      if (!output.value) return UI.showError('Run the audit first.');
      navigator.clipboard.writeText(output.value).then(() => UI.showSuccess('Audit copied.')).catch(() => UI.showError('Copy failed.'));
    };
  },
};
