import { UI } from '../core/ui.js';

const SAMPLE_JSON = `[
  {
    "name": "Afras",
    "email": "afras@example.com",
    "role": "Owner",
    "active": true
  },
  {
    "name": "Maya",
    "email": "maya@example.com",
    "role": "Editor",
    "active": true
  },
  {
    "name": "Jon",
    "email": "jon, qa@example.com",
    "role": "Reviewer",
    "active": false
  }
]`;

function flatten(value, prefix = '', output = {}) {
  if (Array.isArray(value)) {
    output[prefix || 'value'] = value.map(item => stringifyValue(item)).join('; ');
    return output;
  }

  if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, nested]) => {
      const nextKey = prefix ? `${prefix}.${key}` : key;
      flatten(nested, nextKey, output);
    });
    return output;
  }

  output[prefix || 'value'] = value;
  return output;
}

function stringifyValue(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function collectColumns(rows) {
  const columns = [];
  const seen = new Set();
  rows.forEach((row) => {
    Object.keys(row).forEach((key) => {
      if (!seen.has(key)) {
        seen.add(key);
        columns.push(key);
      }
    });
  });
  return columns;
}

function escapeCsv(value, delimiter) {
  const text = stringifyValue(value);
  const mustQuote = text.includes(delimiter) || /["\r\n]/.test(text);
  const escaped = text.replace(/"/g, '""');
  return mustQuote ? `"${escaped}"` : escaped;
}

function toCsv(data, delimiter, includeHeaders) {
  const rows = data.map(item => flatten(item));
  const columns = collectColumns(rows);
  const lines = [];

  if (includeHeaders) {
    lines.push(columns.map(column => escapeCsv(column, delimiter)).join(delimiter));
  }

  rows.forEach((row) => {
    lines.push(columns.map(column => escapeCsv(row[column], delimiter)).join(delimiter));
  });

  return { output: lines.join('\n'), rows, columns };
}

function normalizeData(parsed) {
  if (!Array.isArray(parsed)) {
    throw new Error('Top-level JSON must be an array.');
  }
  if (!parsed.length) return [];
  return parsed;
}

export default {
  init() {
    const inputEl = document.getElementById('jcsv-input');
    const outputEl = document.getElementById('jcsv-output');
    const delimiterEl = document.getElementById('jcsv-delimiter');
    const headersEl = document.getElementById('jcsv-headers');
    const rowsEl = document.getElementById('jcsv-rows');
    const columnsEl = document.getElementById('jcsv-columns');
    const sizeEl = document.getElementById('jcsv-size');

    function getDelimiter() {
      return delimiterEl.value === 'tab' ? '\t' : delimiterEl.value;
    }

    function updateStats(stats = { rows: 0, columns: 0, size: 0 }) {
      rowsEl.textContent = stats.rows.toLocaleString();
      columnsEl.textContent = stats.columns.toLocaleString();
      sizeEl.textContent = stats.size.toLocaleString();
    }

    function setOutput(text, rows = [], columns = []) {
      outputEl.value = text;
      outputEl.classList.remove('json-error');
      updateStats({ rows: rows.length, columns: columns.length, size: text.length });
    }

    function setError(message) {
      outputEl.value = message;
      outputEl.classList.add('json-error');
      updateStats();
      UI.showError('Could not parse JSON.');
    }

    function convert() {
      const raw = inputEl.value.trim();
      if (!raw) {
        setOutput('');
        return;
      }

      try {
        const parsed = normalizeData(JSON.parse(raw));
        const delimiter = getDelimiter();
        const includeHeaders = headersEl.value === 'yes';
        const { output, rows, columns } = toCsv(parsed, delimiter, includeHeaders);
        setOutput(output, rows, columns);
      } catch (error) {
        setError(error.message);
      }
    }

    document.getElementById('btn-jcsv-convert').onclick = convert;

    document.getElementById('btn-jcsv-sample').onclick = () => {
      delimiterEl.value = ',';
      headersEl.value = 'yes';
      inputEl.value = SAMPLE_JSON;
      convert();
    };

    document.getElementById('btn-jcsv-clear').onclick = () => {
      inputEl.value = '';
      outputEl.value = '';
      outputEl.classList.remove('json-error');
      updateStats();
    };

    document.getElementById('btn-jcsv-copy').onclick = () => {
      if (!outputEl.value || outputEl.classList.contains('json-error')) {
        return UI.showError('Nothing valid to copy.');
      }
      navigator.clipboard.writeText(outputEl.value)
        .then(() => UI.showToast('Copied!', 'success'))
        .catch(() => UI.showError('Copy failed.'));
    };
  },
};
