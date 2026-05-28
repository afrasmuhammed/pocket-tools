import { UI } from '../core/ui.js';
import { FileHelper } from '../core/file.js';
import { consumeHandoff, setHandoff } from '../core/handoff.js';

const SAMPLE = `Date        Client        Item              Amount
2026-05-18  Acme Labs     Design review     $450.00
2026-05-19  Northwind     Copy edits        $180.00
2026-05-20  Blue Peak     Workshop prep     $320.00`;

function splitLine(line) {
  if (line.includes('\t')) return line.split('\t');
  if (line.includes('|')) return line.split('|').filter((cell, index, cells) => cell.trim() || index > 0 && index < cells.length - 1);
  if (line.includes(',')) return line.split(',');
  return line.split(/\s{2,}/);
}

function normalizeHeader(value) {
  return String(value || '')
    .trim()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}

function parseTable(text, normalizeHeaders, removeEmpty) {
  let rows = text.split(/\n/).map(line => splitLine(line).map(cell => cell.trim()));
  if (removeEmpty) rows = rows.filter(row => row.some(Boolean));
  const width = Math.max(0, ...rows.map(row => row.length));
  rows = rows.map(row => Array.from({ length: width }, (_, index) => row[index] || ''));
  if (normalizeHeaders && rows[0]) rows[0] = rows[0].map(normalizeHeader);
  return rows;
}

function csvEscape(value) {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function markdownEscape(value) {
  return String(value ?? '').replaceAll('|', '\\|');
}

function formatRows(rows, format) {
  if (format === 'tsv') return rows.map(row => row.join('\t')).join('\n');
  if (format === 'markdown') {
    if (!rows.length) return '';
    const header = rows[0].map(markdownEscape);
    const divider = header.map(() => '---');
    const body = rows.slice(1).map(row => `| ${row.map(markdownEscape).join(' | ')} |`);
    return [`| ${header.join(' | ')} |`, `| ${divider.join(' | ')} |`, ...body].join('\n');
  }
  return rows.map(row => row.map(csvEscape).join(',')).join('\n');
}

export default {
  init() {
    const input = document.getElementById('tbl-input');
    const format = document.getElementById('tbl-format');
    const headers = document.getElementById('tbl-headers');
    const empty = document.getElementById('tbl-empty');
    const output = document.getElementById('tbl-output');
    const rowMetric = document.getElementById('tbl-rows');
    const colMetric = document.getElementById('tbl-cols');
    const formatMetric = document.getElementById('tbl-format-metric');
    const handoff = consumeHandoff('table-cleaner');
    if (handoff?.value) input.value = handoff.value;

    const run = () => {
      const text = input.value.trim();
      if (!text) return UI.showError('Paste a table first.');
      const rows = parseTable(text, headers.checked, empty.checked);
      if (!rows.length || !rows[0].length) return UI.showError('Could not detect table rows.');
      output.value = formatRows(rows, format.value);
      rowMetric.textContent = String(Math.max(0, rows.length - 1));
      colMetric.textContent = String(rows[0].length);
      formatMetric.textContent = format.options[format.selectedIndex]?.textContent || 'CSV';
      UI.showSuccess('Table cleaned.');
    };

    document.getElementById('btn-tbl-clean').onclick = run;
    document.getElementById('btn-tbl-sample').onclick = () => {
      input.value = SAMPLE;
      format.value = 'csv';
      run();
    };
    document.getElementById('btn-tbl-clear').onclick = () => {
      input.value = '';
      output.value = '';
      rowMetric.textContent = '0';
      colMetric.textContent = '0';
      formatMetric.textContent = 'CSV';
    };
    document.getElementById('btn-tbl-copy').onclick = () => {
      if (!output.value) return UI.showError('Clean a table first.');
      navigator.clipboard.writeText(output.value).then(() => UI.showSuccess('Output copied.')).catch(() => UI.showError('Copy failed.'));
    };
    document.getElementById('btn-tbl-csv-cleaner').onclick = () => {
      if (!output.value) return UI.showError('Clean a table first.');
      const rows = parseTable(input.value.trim(), headers.checked, empty.checked);
      setHandoff('csv-cleaner', formatRows(rows, 'csv'), 'Clean table');
      window.location.hash = '#/tool/csv-cleaner';
    };
    document.getElementById('btn-tbl-download').onclick = () => {
      if (!output.value) return UI.showError('Clean a table first.');
      const ext = format.value === 'markdown' ? 'md' : format.value;
      const mime = format.value === 'markdown' ? 'text/markdown' : 'text/plain';
      FileHelper.downloadText(`clean-table.${ext}`, output.value, mime);
    };
    format.addEventListener('change', () => {
      if (output.value) run();
    });
    if (handoff?.value) run();
  },
};
