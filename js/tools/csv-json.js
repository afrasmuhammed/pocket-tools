import { UI } from '../core/ui.js';

const SAMPLE_CSV = `name,email,role,active
Afras,afras@example.com,Owner,true
Maya,maya@example.com,Editor,true
Jon,"jon, qa@example.com",Reviewer,false`;

function normalizeHeader(header, index) {
  const cleaned = header.trim()
    .replace(/^\uFEFF/, '')
    .replace(/\s+/g, '_')
    .replace(/[^\w$]/g, '')
    .replace(/^(\d)/, '_$1');
  return cleaned || `column_${index + 1}`;
}

function makeUniqueHeaders(headers) {
  const seen = new Map();
  return headers.map((header, index) => {
    const base = normalizeHeader(header, index);
    const count = seen.get(base) || 0;
    seen.set(base, count + 1);
    return count ? `${base}_${count + 1}` : base;
  });
}

function parseCsv(raw, delimiter) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < raw.length; i += 1) {
    const char = raw[i];
    const next = raw[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === delimiter && !inQuotes) {
      row.push(field);
      field = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      continue;
    }

    field += char;
  }

  if (inQuotes) throw new Error('A quoted field is missing its closing quote.');

  row.push(field);
  rows.push(row);

  return rows
    .map(cells => cells.map(cell => cell.trim()))
    .filter(cells => cells.some(cell => cell.length > 0));
}

function toObjects(rows) {
  if (rows.length < 2) return [];
  const headers = makeUniqueHeaders(rows[0]);
  return rows.slice(1).map((cells) => {
    const item = {};
    headers.forEach((header, index) => {
      item[header] = cells[index] ?? '';
    });
    return item;
  });
}

function summarize(rows, output, mode) {
  return {
    rows: mode === 'objects' ? Math.max(rows.length - 1, 0) : rows.length,
    columns: rows.reduce((max, row) => Math.max(max, row.length), 0),
    size: output.length,
  };
}

export default {
  init() {
    const inputEl = document.getElementById('csv-input');
    const outputEl = document.getElementById('csv-output');
    const delimiterEl = document.getElementById('csv-delimiter');
    const modeEl = document.getElementById('csv-mode');
    const rowsEl = document.getElementById('csv-rows');
    const columnsEl = document.getElementById('csv-columns');
    const sizeEl = document.getElementById('csv-size');

    function getDelimiter() {
      return delimiterEl.value === 'tab' ? '\t' : delimiterEl.value;
    }

    function updateStats(stats = { rows: 0, columns: 0, size: 0 }) {
      rowsEl.textContent = stats.rows.toLocaleString();
      columnsEl.textContent = stats.columns.toLocaleString();
      sizeEl.textContent = stats.size.toLocaleString();
    }

    function setOutput(text, stats) {
      outputEl.value = text;
      outputEl.classList.remove('json-error');
      updateStats(stats);
    }

    function setError(message) {
      outputEl.value = message;
      outputEl.classList.add('json-error');
      updateStats();
      UI.showError('Could not parse CSV.');
    }

    function convert() {
      const raw = inputEl.value.trim();
      if (!raw) {
        setOutput('', { rows: 0, columns: 0, size: 0 });
        return;
      }

      try {
        const rows = parseCsv(raw, getDelimiter());
        const mode = modeEl.value;
        const data = mode === 'objects' ? toObjects(rows) : rows;
        const output = JSON.stringify(data, null, 2);
        setOutput(output, summarize(rows, output, mode));
      } catch (error) {
        setError(error.message);
      }
    }

    document.getElementById('btn-csv-convert').onclick = convert;

    document.getElementById('btn-csv-sample').onclick = () => {
      delimiterEl.value = ',';
      modeEl.value = 'objects';
      inputEl.value = SAMPLE_CSV;
      convert();
    };

    document.getElementById('btn-csv-clear').onclick = () => {
      inputEl.value = '';
      outputEl.value = '';
      outputEl.classList.remove('json-error');
      updateStats();
    };

    document.getElementById('btn-csv-copy').onclick = () => {
      if (!outputEl.value || outputEl.classList.contains('json-error')) {
        return UI.showError('Nothing valid to copy.');
      }
      navigator.clipboard.writeText(outputEl.value)
        .then(() => UI.showToast('Copied!', 'success'))
        .catch(() => UI.showError('Copy failed.'));
    };
  },
};
