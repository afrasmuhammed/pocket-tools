import { UI } from '../core/ui.js';
import { FileHelper } from '../core/file.js';
import { consumeHandoff } from '../core/handoff.js';

const SAMPLE = `date,category,merchant,amount
2026-05-18,Meals,Northstar Cafe,22.68
2026-05-19,Travel,Metro Rail,14.50
2026-05-20,Software,CloudBase,49.00
2026-05-21,Supplies,Paper Supply Co,31.75
2026-05-22,Meals,Corner Deli,18.40`;

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

function csvEscape(value) {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function cleanHeader(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

function number(value) {
  const parsed = Number(String(value || '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function aggregate(values, mode) {
  if (mode === 'count') return values.length;
  if (!values.length) return 0;
  if (mode === 'avg') return values.reduce((sum, value) => sum + value, 0) / values.length;
  if (mode === 'min') return Math.min(...values);
  if (mode === 'max') return Math.max(...values);
  return values.reduce((sum, value) => sum + value, 0);
}

function renderResults(target, rows) {
  target.replaceChildren();
  rows.slice(0, 8).forEach(item => {
    const row = document.createElement('div');
    row.className = 'seo-result-row';
    const strong = document.createElement('strong');
    strong.textContent = item.group;
    const span = document.createElement('span');
    span.textContent = item.value.toFixed(2);
    row.append(strong, span);
    target.appendChild(row);
  });
}

function summarize(text, groupColumn, valueColumn, aggregation) {
  const rows = parseCsv(text);
  const headers = (rows[0] || []).map(cleanHeader);
  const groupKey = cleanHeader(groupColumn);
  const valueKey = cleanHeader(valueColumn);
  const groupIndex = headers.indexOf(groupKey);
  const valueIndex = headers.indexOf(valueKey);
  if (groupIndex === -1) throw new Error(`Group column not found: ${groupColumn}`);
  if (aggregation !== 'count' && valueIndex === -1) throw new Error(`Value column not found: ${valueColumn}`);
  const groups = new Map();
  rows.slice(1).forEach(row => {
    const group = row[groupIndex] || 'Blank';
    const values = groups.get(group) || [];
    values.push(aggregation === 'count' ? 1 : number(row[valueIndex]));
    groups.set(group, values);
  });
  return [...groups.entries()]
    .map(([group, values]) => ({ group, count: values.length, value: aggregate(values, aggregation) }))
    .sort((a, b) => b.value - a.value);
}

export default {
  init() {
    const input = document.getElementById('cps-input');
    const group = document.getElementById('cps-group');
    const value = document.getElementById('cps-value');
    const agg = document.getElementById('cps-agg');
    const output = document.getElementById('cps-output');
    const rowsMetric = document.getElementById('cps-rows');
    const groupsMetric = document.getElementById('cps-groups');
    const topMetric = document.getElementById('cps-top');
    const results = document.getElementById('cps-results');
    const handoff = consumeHandoff('csv-pivot-summary');
    if (handoff?.value) input.value = handoff.value;

    const run = () => {
      if (!input.value.trim()) return UI.showError('Paste CSV first.');
      try {
        const summary = summarize(input.value, group.value, value.value, agg.value);
        if (!summary.length) return UI.showError('No rows to summarize.');
        output.value = [
          `group,${agg.value},count`,
          ...summary.map(row => [csvEscape(row.group), row.value.toFixed(2), row.count].join(',')),
        ].join('\n');
        rowsMetric.textContent = String(parseCsv(input.value).length - 1);
        groupsMetric.textContent = String(summary.length);
        topMetric.textContent = summary[0].group.length > 12 ? `${summary[0].group.slice(0, 12)}...` : summary[0].group;
        renderResults(results, summary);
        UI.showSuccess('CSV summarized.');
      } catch (error) {
        UI.showError(error.message || 'Could not summarize this CSV.');
      }
    };

    document.getElementById('btn-cps-build').onclick = run;
    document.getElementById('btn-cps-sample').onclick = () => {
      input.value = SAMPLE;
      group.value = 'category';
      value.value = 'amount';
      agg.value = 'sum';
      run();
    };
    document.getElementById('btn-cps-clear').onclick = () => {
      input.value = '';
      group.value = '';
      value.value = '';
      output.value = '';
      results.replaceChildren();
      rowsMetric.textContent = '0';
      groupsMetric.textContent = '0';
      topMetric.textContent = '--';
    };
    document.getElementById('btn-cps-copy').onclick = () => {
      if (!output.value) return UI.showError('Summarize CSV first.');
      navigator.clipboard.writeText(output.value).then(() => UI.showSuccess('CSV copied.')).catch(() => UI.showError('Copy failed.'));
    };
    document.getElementById('btn-cps-download').onclick = () => {
      if (!output.value) return UI.showError('Summarize CSV first.');
      FileHelper.downloadText('csv-pivot-summary.csv', output.value, 'text/csv');
    };
    if (handoff?.value) run();
  },
};
