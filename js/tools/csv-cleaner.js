import { UI } from '../core/ui.js';
import { consumeHandoff, setHandoff } from '../core/handoff.js';

const SAMPLE = ` Name , Email , Role , Active
 Alex Carter , alex.carter@example.com , Owner , true

 Emma Reed , emma.reed@example.com , Editor , true
 Noah Brooks , noah.brooks@example.com , Reviewer , false`;

function parseCsv(raw, delimiter) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < raw.length; i += 1) {
    const char = raw[i];
    const next = raw[i + 1];
    if (char === '"') {
      if (quoted && next === '"') { field += '"'; i += 1; }
      else quoted = !quoted;
    } else if (char === delimiter && !quoted) {
      row.push(field);
      field = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') i += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }
  row.push(field);
  rows.push(row);
  return rows;
}

function escapeCsv(value, delimiter) {
  const text = String(value ?? '');
  const escaped = text.replace(/"/g, '""');
  return escaped.includes(delimiter) || /["\r\n]/.test(escaped) ? `"${escaped}"` : escaped;
}

function normalizeHeader(header, index) {
  const clean = header.trim().toLowerCase().replace(/[^\w]+/g, '_').replace(/^_+|_+$/g, '');
  return clean || `column_${index + 1}`;
}

export default {
  init() {
    const inputEl = document.getElementById('csvc-input');
    const outputEl = document.getElementById('csvc-output');
    const delimiterEl = document.getElementById('csvc-delimiter');
    const headersEl = document.getElementById('csvc-headers');
    const emptyEl = document.getElementById('csvc-empty');
    const rowsEl = document.getElementById('csvc-rows');
    const colsEl = document.getElementById('csvc-cols');
    const handoff = consumeHandoff('csv-cleaner');
    if (handoff?.value) inputEl.value = handoff.value;

    const delimiter = () => delimiterEl.value === 'tab' ? '\t' : delimiterEl.value;
    const run = () => {
      const sep = delimiter();
      let rows = parseCsv(inputEl.value.trim(), sep).map(row => row.map(cell => cell.trim()));
      if (emptyEl.checked) rows = rows.filter(row => row.some(Boolean));
      if (headersEl.checked && rows.length) rows[0] = rows[0].map(normalizeHeader);
      const width = Math.max(0, ...rows.map(row => row.length));
      rows = rows.map(row => [...row, ...Array(Math.max(0, width - row.length)).fill('')]);
      outputEl.value = rows.map(row => row.map(cell => escapeCsv(cell, sep)).join(sep)).join('\n');
      rowsEl.textContent = Math.max(0, rows.length - 1).toLocaleString();
      colsEl.textContent = width.toLocaleString();
    };

    document.getElementById('btn-csvc-clean').onclick = run;
    document.getElementById('btn-csvc-sample').onclick = () => { inputEl.value = SAMPLE; run(); };
    document.getElementById('btn-csvc-clear').onclick = () => {
      inputEl.value = '';
      outputEl.value = '';
      rowsEl.textContent = '0';
      colsEl.textContent = '0';
    };
    document.getElementById('btn-csvc-copy').onclick = () => {
      if (!outputEl.value) return UI.showError('Nothing to copy yet.');
      navigator.clipboard.writeText(outputEl.value).then(() => UI.showToast('Copied!', 'success')).catch(() => UI.showError('Copy failed.'));
    };
    document.getElementById('btn-csvc-json').onclick = () => {
      if (!outputEl.value) return UI.showError('Clean CSV first.');
      setHandoff('csv-json', outputEl.value, 'Clean CSV');
      window.location.hash = '#/tool/csv-json';
    };
    if (handoff?.value) run();
  },
};
