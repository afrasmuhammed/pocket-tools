import { UI } from '../core/ui.js';
import { FileHelper } from '../core/file.js';
import { consumeHandoff } from '../core/handoff.js';

const SAMPLE = `date,merchant,category,total,tax,currency,paid_by,notes
2026-05-18,Northstar Cafe,Meals,22.68,1.48,$,Card 4242,Client lunch
2026-05-19,Metro Rail,Travel,14.50,0.00,$,Card 4242,Onsite meeting
2026-05-20,CloudBase,Software,49.00,0.00,$,Corporate card,Monthly tool
2026-05-21,Paper Supply Co,Supplies,31.75,2.08,$,Card 4242,Workshop materials`;

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];
    if (quoted && char === '"' && next === '"') {
      cell += '"';
      i++;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (!quoted && char === ',') {
      row.push(cell.trim());
      cell = '';
    } else if (!quoted && /\r|\n/.test(char)) {
      if (char === '\r' && next === '\n') i++;
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }
  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function normalizeHeaders(headers) {
  return headers.map(header => header.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''));
}

function parseAmount(value) {
  const number = String(value || '').replace(/[^0-9.-]/g, '');
  const parsed = Number(number);
  return Number.isFinite(parsed) ? parsed : 0;
}

function money(value, symbol) {
  return `${symbol}${value.toFixed(2)}`;
}

function renderBreakdown(target, totals, currency) {
  target.replaceChildren();
  [...totals.entries()].sort((a, b) => b[1] - a[1]).forEach(([category, total]) => {
    const row = document.createElement('div');
    row.className = 'seo-result-row';
    const strong = document.createElement('strong');
    strong.textContent = category || 'Uncategorized';
    const span = document.createElement('span');
    span.textContent = money(total, currency);
    row.append(strong, span);
    target.appendChild(row);
  });
}

function buildReport(rows, title, owner, fallbackCurrency) {
  const headers = normalizeHeaders(rows[0] || []);
  const records = rows.slice(1).map(values => Object.fromEntries(headers.map((header, index) => [header, values[index] || ''])));
  const categoryTotals = new Map();
  let total = 0;
  let tax = 0;
  records.forEach(record => {
    const amount = parseAmount(record.total || record.amount || record.cost);
    const taxAmount = parseAmount(record.tax || record.vat);
    const category = record.category || 'Other';
    total += amount;
    tax += taxAmount;
    categoryTotals.set(category, (categoryTotals.get(category) || 0) + amount);
  });
  const currency = records.find(record => record.currency)?.currency || fallbackCurrency;
  const report = [
    `# ${title || 'Expense Report'}`,
    owner ? `Submitted by: ${owner}` : '',
    `Rows reviewed: ${records.length}`,
    `Total: ${money(total, currency)}`,
    `Tax: ${money(tax, currency)}`,
    '',
    '## Category Totals',
    ...[...categoryTotals.entries()].sort((a, b) => b[1] - a[1]).map(([category, value]) => `- ${category}: ${money(value, currency)}`),
    '',
    '## Expense Lines',
    ...records.map(record => `- ${record.date || 'No date'} - ${record.merchant || 'Unknown merchant'} - ${record.category || 'Other'} - ${money(parseAmount(record.total || record.amount || record.cost), currency)}${record.notes ? ` - ${record.notes}` : ''}`),
    '',
    '## Review Notes',
    '- Confirm receipts are attached for reimbursable expenses.',
    '- Check policy limits for meals, travel, software, and supplies.',
  ].filter(line => line !== '').join('\n');
  return { records, categoryTotals, total, tax, currency, report };
}

export default {
  init() {
    const input = document.getElementById('erb-input');
    const title = document.getElementById('erb-title');
    const owner = document.getElementById('erb-owner');
    const currency = document.getElementById('erb-currency');
    const output = document.getElementById('erb-output');
    const totalMetric = document.getElementById('erb-total');
    const rowMetric = document.getElementById('erb-rows');
    const taxMetric = document.getElementById('erb-tax');
    const breakdown = document.getElementById('erb-breakdown');
    const handoff = consumeHandoff('expense-report-builder');
    if (handoff?.value) input.value = handoff.value;

    const run = () => {
      const rows = parseCsv(input.value.trim());
      if (rows.length < 2) return UI.showError('Paste CSV with a header and at least one expense row.');
      const result = buildReport(rows, title.value.trim(), owner.value.trim(), currency.value);
      output.value = result.report;
      totalMetric.textContent = money(result.total, result.currency);
      rowMetric.textContent = String(result.records.length);
      taxMetric.textContent = money(result.tax, result.currency);
      renderBreakdown(breakdown, result.categoryTotals, result.currency);
      UI.showSuccess('Expense report built.');
    };

    document.getElementById('btn-erb-build').onclick = run;
    document.getElementById('btn-erb-sample').onclick = () => {
      input.value = SAMPLE;
      title.value = 'May Client Visit Expenses';
      owner.value = 'Operations Team';
      run();
    };
    document.getElementById('btn-erb-clear').onclick = () => {
      input.value = '';
      title.value = 'Expense Report';
      owner.value = '';
      output.value = '';
      totalMetric.textContent = '--';
      rowMetric.textContent = '0';
      taxMetric.textContent = '--';
      breakdown.replaceChildren();
    };
    document.getElementById('btn-erb-copy').onclick = () => {
      if (!output.value) return UI.showError('Build a report first.');
      navigator.clipboard.writeText(output.value).then(() => UI.showSuccess('Report copied.')).catch(() => UI.showError('Copy failed.'));
    };
    document.getElementById('btn-erb-download').onclick = () => {
      if (!output.value) return UI.showError('Build a report first.');
      FileHelper.downloadText('expense-report.md', output.value, 'text/markdown');
    };
    if (handoff?.value) run();
  },
};
