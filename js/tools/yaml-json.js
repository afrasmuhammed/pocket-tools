import { UI } from '../core/ui.js';

const SAMPLE_YAML = `project:
  name: Pocket Tools
  offline: true
  version: 60
  tags:
    - utilities
    - developer
    - pwa
  deploy:
    provider: GitHub Pages
    branch: main`;

function stripComment(line) {
  let quote = '';
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if ((char === '"' || char === "'") && line[i - 1] !== '\\') {
      quote = quote === char ? '' : (quote || char);
    }
    if (char === '#' && !quote) return line.slice(0, i);
  }
  return line;
}

function parseScalar(value) {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  if (/^(true|false)$/i.test(trimmed)) return trimmed.toLowerCase() === 'true';
  if (/^(null|~)$/i.test(trimmed)) return null;
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);
  if (/^\[(.*)\]$/.test(trimmed)) {
    const inner = trimmed.slice(1, -1).trim();
    if (!inner) return [];
    return inner.split(',').map(item => parseScalar(item));
  }
  return trimmed;
}

function nextContent(lines, startIndex) {
  for (let i = startIndex; i < lines.length; i += 1) {
    const raw = stripComment(lines[i]).replace(/\s+$/, '');
    if (raw.trim()) return raw;
  }
  return '';
}

function ensureContainer(parent, key, value) {
  if (Array.isArray(parent)) {
    parent.push(value);
    return value;
  }
  parent[key] = value;
  return value;
}

function parseYaml(raw) {
  const lines = raw.replace(/\t/g, '  ').split(/\r?\n/);
  const root = {};
  const stack = [{ indent: -1, value: root }];

  for (let i = 0; i < lines.length; i += 1) {
    const cleaned = stripComment(lines[i]).replace(/\s+$/, '');
    if (!cleaned.trim()) continue;

    const indent = cleaned.match(/^ */)[0].length;
    const text = cleaned.trim();
    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) stack.pop();

    const parent = stack[stack.length - 1].value;

    if (text.startsWith('- ')) {
      if (!Array.isArray(parent)) throw new Error(`Line ${i + 1}: list item has no list parent.`);
      const item = text.slice(2).trim();
      if (!item) {
        const obj = {};
        parent.push(obj);
        stack.push({ indent, value: obj });
      } else if (/^[^:]+:\s*/.test(item)) {
        const [key, ...rest] = item.split(':');
        const obj = {};
        obj[key.trim()] = parseScalar(rest.join(':'));
        parent.push(obj);
        stack.push({ indent, value: obj });
      } else {
        parent.push(parseScalar(item));
      }
      continue;
    }

    const match = text.match(/^([^:]+):(.*)$/);
    if (!match) throw new Error(`Line ${i + 1}: expected "key: value".`);

    const key = match[1].trim();
    const rest = match[2].trim();
    if (!key) throw new Error(`Line ${i + 1}: empty key.`);

    if (rest) {
      ensureContainer(parent, key, parseScalar(rest));
      continue;
    }

    const next = nextContent(lines, i + 1);
    const value = next.trim().startsWith('- ') ? [] : {};
    ensureContainer(parent, key, value);
    stack.push({ indent, value });
  }

  return root;
}

function countKeys(value) {
  if (Array.isArray(value)) return value.reduce((sum, item) => sum + countKeys(item), 0);
  if (value && typeof value === 'object') {
    return Object.entries(value).reduce((sum, [, nested]) => sum + 1 + countKeys(nested), 0);
  }
  return 0;
}

export default {
  init() {
    const inputEl = document.getElementById('yaml-input');
    const outputEl = document.getElementById('yaml-output');
    const keysEl = document.getElementById('yaml-keys');
    const linesEl = document.getElementById('yaml-lines');
    const sizeEl = document.getElementById('yaml-size');

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
      UI.showError('Could not parse YAML.');
    }

    function convert(minify = false) {
      const raw = inputEl.value.trim();
      if (!raw) {
        setOutput('', {});
        return;
      }

      try {
        const data = parseYaml(raw);
        const output = JSON.stringify(data, null, minify ? 0 : 2);
        setOutput(output, data);
      } catch (error) {
        setError(error.message);
      }
    }

    document.getElementById('btn-yaml-convert').onclick = () => convert(false);
    document.getElementById('btn-yaml-minify').onclick = () => convert(true);

    document.getElementById('btn-yaml-sample').onclick = () => {
      inputEl.value = SAMPLE_YAML;
      convert(false);
    };

    document.getElementById('btn-yaml-clear').onclick = () => {
      inputEl.value = '';
      outputEl.value = '';
      outputEl.classList.remove('json-error');
      updateStats();
    };

    document.getElementById('btn-yaml-copy').onclick = () => {
      if (!outputEl.value || outputEl.classList.contains('json-error')) {
        return UI.showError('Nothing valid to copy.');
      }
      navigator.clipboard.writeText(outputEl.value)
        .then(() => UI.showToast('Copied!', 'success'))
        .catch(() => UI.showError('Copy failed.'));
    };
  },
};
