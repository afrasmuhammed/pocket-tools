import { UI } from '../core/ui.js';

const SAMPLE_JSON = `{
  "project": {
    "name": "PocketKit",
    "offline": true,
    "version": 62,
    "tags": ["utilities", "developer", "pwa"],
    "deploy": {
      "provider": "GitHub Pages",
      "branch": "main"
    }
  }
}`;

function isPlainObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

function shouldQuote(text) {
  return !text ||
    /^\s|\s$/.test(text) ||
    /[:#{}\[\],&*?|\-<>=!%@`"']/.test(text) ||
    /^(true|false|null|yes|no|on|off|~)$/i.test(text) ||
    /^-?\d+(\.\d+)?$/.test(text);
}

function scalarToYaml(value) {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'boolean' || typeof value === 'number') return String(value);
  const text = String(value);
  if (text.includes('\n')) {
    return `|\n${text.split('\n').map(line => `  ${line}`).join('\n')}`;
  }
  return shouldQuote(text) ? JSON.stringify(text) : text;
}

function valueToYaml(value, indent = 0) {
  const pad = '  '.repeat(indent);

  if (Array.isArray(value)) {
    if (!value.length) return `${pad}[]`;
    return value.map((item) => {
      if (isPlainObject(item) || Array.isArray(item)) {
        return `${pad}-\n${valueToYaml(item, indent + 1)}`;
      }
      return `${pad}- ${scalarToYaml(item)}`;
    }).join('\n');
  }

  if (isPlainObject(value)) {
    const entries = Object.entries(value);
    if (!entries.length) return `${pad}{}`;
    return entries.map(([key, nested]) => {
      const safeKey = shouldQuote(key) ? JSON.stringify(key) : key;
      if (isPlainObject(nested) || Array.isArray(nested)) {
        return `${pad}${safeKey}:\n${valueToYaml(nested, indent + 1)}`;
      }
      return `${pad}${safeKey}: ${scalarToYaml(nested)}`;
    }).join('\n');
  }

  return `${pad}${scalarToYaml(value)}`;
}

function countKeys(value) {
  if (Array.isArray(value)) return value.reduce((sum, item) => sum + countKeys(item), 0);
  if (isPlainObject(value)) {
    return Object.entries(value).reduce((sum, [, nested]) => sum + 1 + countKeys(nested), 0);
  }
  return 0;
}

export default {
  init() {
    const inputEl = document.getElementById('jyaml-input');
    const outputEl = document.getElementById('jyaml-output');
    const keysEl = document.getElementById('jyaml-keys');
    const linesEl = document.getElementById('jyaml-lines');
    const sizeEl = document.getElementById('jyaml-size');

    function updateStats(text = '', data = {}) {
      keysEl.textContent = countKeys(data).toLocaleString();
      linesEl.textContent = text ? text.split('\n').length.toLocaleString() : '0';
      sizeEl.textContent = text.length.toLocaleString();
    }

    function setOutput(text, data) {
      outputEl.value = text;
      outputEl.classList.remove('json-error');
      updateStats(text, data);
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
        setOutput('', {});
        return;
      }

      try {
        const data = JSON.parse(raw);
        setOutput(valueToYaml(data), data);
      } catch (error) {
        setError(error.message);
      }
    }

    document.getElementById('btn-jyaml-convert').onclick = convert;

    document.getElementById('btn-jyaml-sample').onclick = () => {
      inputEl.value = SAMPLE_JSON;
      convert();
    };

    document.getElementById('btn-jyaml-clear').onclick = () => {
      inputEl.value = '';
      outputEl.value = '';
      outputEl.classList.remove('json-error');
      updateStats();
    };

    document.getElementById('btn-jyaml-copy').onclick = () => {
      if (!outputEl.value || outputEl.classList.contains('json-error')) {
        return UI.showError('Nothing valid to copy.');
      }
      navigator.clipboard.writeText(outputEl.value)
        .then(() => UI.showToast('Copied!', 'success'))
        .catch(() => UI.showError('Copy failed.'));
    };
  },
};
