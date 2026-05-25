import { UI } from '../core/ui.js';
import { FileHelper } from '../core/file.js';
import { loadPdfJs } from '../core/lazy.js';

const SAMPLE = `NORTHSTAR CAFE
42 Market Street
2026-05-18  13:42

Latte                 4.80
Lunch bowl           13.50
Sparkling water       2.90
Subtotal             21.20
Tax                   1.48
TOTAL                22.68
Paid Visa **** 4242`;

function csvEscape(value) {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function amount(value) {
  const matches = [...String(value).matchAll(/(?:[$€£]\s*)?(\d{1,5}(?:[.,]\d{2}))/g)];
  return matches.map(match => Number(match[1].replace(',', '.'))).filter(Number.isFinite);
}

function money(value, currency) {
  if (!Number.isFinite(value)) return '--';
  return `${currency}${value.toFixed(2)}`;
}

function normalizeDate(value) {
  const text = String(value);
  const iso = text.match(/\b(20\d{2})[-/](\d{1,2})[-/](\d{1,2})\b/);
  if (iso) return `${iso[1]}-${iso[2].padStart(2, '0')}-${iso[3].padStart(2, '0')}`;
  const eu = text.match(/\b(\d{1,2})[-/](\d{1,2})[-/](20\d{2})\b/);
  if (eu) return `${eu[3]}-${eu[2].padStart(2, '0')}-${eu[1].padStart(2, '0')}`;
  return '';
}

function merchant(lines) {
  return lines.find(line =>
    line.length > 2 &&
    !amount(line).length &&
    !/\b(receipt|invoice|tax|total|subtotal|date|paid|visa|mastercard|cash)\b/i.test(line)
  ) || '';
}

function parseReceipt(text) {
  const lines = text.split(/\n+/).map(line => line.trim()).filter(Boolean);
  const amounts = amount(text);
  const totalLine = [...lines].reverse().find(line => /\b(total|amount due|balance)\b/i.test(line) && amount(line).length);
  const taxLine = [...lines].reverse().find(line => /\b(tax|vat|gst)\b/i.test(line) && amount(line).length);
  const totalValues = totalLine ? amount(totalLine) : [];
  const total = totalValues.at(-1) ?? Math.max(...amounts, NaN);
  const tax = taxLine ? amount(taxLine).at(-1) : NaN;
  const date = normalizeDate(text);
  let score = 0;
  if (merchant(lines)) score += 25;
  if (date) score += 25;
  if (Number.isFinite(total)) score += 35;
  if (Number.isFinite(tax)) score += 15;
  return {
    merchant: merchant(lines),
    date,
    total,
    tax,
    score,
    candidates: [
      ['Merchant', merchant(lines) || 'Not found'],
      ['Date', date || 'Not found'],
      ['Total line', totalLine || 'Largest amount used'],
      ['Tax line', taxLine || 'Not found'],
    ],
  };
}

function expenseCsv(row) {
  const header = ['date', 'merchant', 'category', 'total', 'tax', 'currency', 'paid_by', 'notes'];
  const values = header.map(key => csvEscape(row[key]));
  return `${header.join(',')}\n${values.join(',')}`;
}

function renderCandidates(container, rows) {
  container.replaceChildren();
  rows.forEach(([key, value]) => {
    const row = document.createElement('div');
    row.className = 'seo-result-row';
    const label = document.createElement('strong');
    label.textContent = key;
    const val = document.createElement('span');
    val.textContent = value;
    row.append(label, val);
    container.appendChild(row);
  });
}

export default {
  init() {
    const upload = document.getElementById('rex-upload');
    const input = document.getElementById('rex-input');
    const category = document.getElementById('rex-category');
    const currency = document.getElementById('rex-currency');
    const paidBy = document.getElementById('rex-paid-by');
    const merchantEl = document.getElementById('rex-merchant');
    const dateEl = document.getElementById('rex-date');
    const totalInput = document.getElementById('rex-total-input');
    const taxInput = document.getElementById('rex-tax-input');
    const totalMetric = document.getElementById('rex-total');
    const taxMetric = document.getElementById('rex-tax');
    const confidence = document.getElementById('rex-confidence');
    const candidates = document.getElementById('rex-candidates');
    const output = document.getElementById('rex-output');

    const fieldAmount = el => el.value === '' ? NaN : Number(el.value);

    const writeCsv = () => {
      const total = fieldAmount(totalInput);
      const tax = fieldAmount(taxInput);
      const row = {
        date: dateEl.value,
        merchant: merchantEl.value.trim(),
        category: category.value,
        total: Number.isFinite(total) ? total.toFixed(2) : '',
        tax: Number.isFinite(tax) ? tax.toFixed(2) : '',
        currency: currency.value,
        paid_by: paidBy.value.trim(),
        notes: 'Imported with PocketKit Receipt / Expense Extractor',
      };
      output.value = expenseCsv(row);
      totalMetric.textContent = Number.isFinite(total) ? money(total, currency.value) : '--';
      taxMetric.textContent = Number.isFinite(tax) ? money(tax, currency.value) : '--';
    };

    const run = () => {
      const text = input.value.trim();
      if (!text) return UI.showError('Paste receipt text or import a PDF first.');
      const parsed = parseReceipt(text);
      merchantEl.value = parsed.merchant;
      dateEl.value = parsed.date;
      totalInput.value = Number.isFinite(parsed.total) ? parsed.total.toFixed(2) : '';
      taxInput.value = Number.isFinite(parsed.tax) ? parsed.tax.toFixed(2) : '';
      confidence.textContent = `${parsed.score}%`;
      renderCandidates(candidates, parsed.candidates);
      writeCsv();
      UI.showSuccess('Expense row extracted.');
    };

    upload.onchange = async event => {
      const file = event.target.files?.[0];
      if (!file) return;
      const valid = await FileHelper.validatePdf(file);
      if (!valid.ok) {
        upload.value = '';
        return UI.showError(valid.error);
      }
      try {
        const pdfjsLib = await loadPdfJs();
        const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
        const pages = [];
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const content = await page.getTextContent();
          pages.push(content.items.map(item => item.str).join('\n'));
        }
        input.value = pages.join('\n\n');
        run();
      } catch (error) {
        console.error(error);
        UI.showError('Could not read this PDF. It may be scanned or protected.');
      }
    };

    document.getElementById('btn-rex-extract').onclick = run;
    document.getElementById('btn-rex-sample').onclick = () => { input.value = SAMPLE; paidBy.value = 'Visa 4242'; run(); };
    document.getElementById('btn-rex-clear').onclick = () => {
      upload.value = '';
      input.value = '';
      merchantEl.value = '';
      dateEl.value = '';
      totalInput.value = '';
      taxInput.value = '';
      paidBy.value = '';
      output.value = '';
      candidates.replaceChildren();
      totalMetric.textContent = '--';
      taxMetric.textContent = '--';
      confidence.textContent = '0%';
      upload.closest('.drop-zone')?._reset?.();
    };
    document.getElementById('btn-rex-copy').onclick = () => {
      if (!output.value) return UI.showError('Extract an expense first.');
      navigator.clipboard.writeText(output.value).then(() => UI.showSuccess('CSV copied.')).catch(() => UI.showError('Copy failed.'));
    };
    document.getElementById('btn-rex-download').onclick = () => {
      if (!output.value) return UI.showError('Extract an expense first.');
      FileHelper.downloadText('expense-row.csv', output.value, 'text/csv');
    };
    [merchantEl, dateEl, totalInput, taxInput, category, currency, paidBy].forEach(el => el.addEventListener('input', writeCsv));
  },
};
