import { UI } from '../core/ui.js';
import { consumeHandoff, setHandoff } from '../core/handoff.js';

// Attempt to parse and re-serialize JSON.
// Returns { ok: true, result } or { ok: false, error: string }.
function process(raw, indent) {
  try {
    const parsed = JSON.parse(raw);
    return { ok: true, result: JSON.stringify(parsed, null, indent) };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

function sortKeys(value) {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (!value || typeof value !== 'object') return value;
  return Object.keys(value).sort().reduce((acc, key) => {
    acc[key] = sortKeys(value[key]);
    return acc;
  }, {});
}

export default {
  init() {
    const inputEl  = document.getElementById('jf-input');
    const outputEl = document.getElementById('jf-output');
    const statsEl  = document.getElementById('jf-stats');
    const handoff = consumeHandoff('json-formatter');
    if (handoff?.value) inputEl.value = handoff.value;

    function setOutput(text, isError = false) {
      outputEl.textContent = text;
      outputEl.classList.toggle('json-error', isError);
      if (!isError && text) {
        const chars = text.length;
        const lines = text.split('\n').length;
        statsEl.textContent =
          `${chars.toLocaleString()} chars · ${lines.toLocaleString()} lines`;
      } else {
        statsEl.textContent = '';
      }
    }

    function clearAll() {
      inputEl.value = '';
      outputEl.textContent = '';
      outputEl.classList.remove('json-error');
      statsEl.textContent = '';
    }

    document.getElementById('btn-jf-format').onclick = () => {
      const raw = inputEl.value.trim();
      if (!raw) return;
      const { ok, result, error } = process(raw, 2);
      setOutput(ok ? result : error, !ok);
    };

    document.getElementById('btn-jf-minify').onclick = () => {
      const raw = inputEl.value.trim();
      if (!raw) return;
      const { ok, result, error } = process(raw, undefined);
      setOutput(ok ? result : error, !ok);
    };

    document.getElementById('btn-jf-sort').onclick = () => {
      const raw = inputEl.value.trim();
      if (!raw) return;
      try {
        const sorted = sortKeys(JSON.parse(raw));
        setOutput(JSON.stringify(sorted, null, 2));
      } catch (e) {
        setOutput(e.message, true);
      }
    };

    document.getElementById('btn-jf-sample').onclick = () => {
      inputEl.value = JSON.stringify({
        launch: 'PocketKit',
        private: true,
        pockets: ['Daily', 'Developer', 'PDF'],
        stats: { tools: 90, offline: true },
      });
      document.getElementById('btn-jf-format').click();
    };

    document.getElementById('btn-jf-clear').onclick = clearAll;

    document.getElementById('btn-jf-copy').onclick = () => {
      const text = outputEl.textContent;
      if (!text || outputEl.classList.contains('json-error')) {
        return UI.showError('Nothing valid to copy.');
      }
      navigator.clipboard.writeText(text)
        .then(() => UI.showToast('Copied!', 'success'))
        .catch(() => UI.showError('Copy failed.'));
    };

    document.getElementById('btn-jf-to-csv').onclick = () => {
      const text = outputEl.textContent || inputEl.value;
      if (!text || outputEl.classList.contains('json-error')) return UI.showError('Nothing valid to send.');
      setHandoff('json-csv', text, 'JSON from formatter');
      window.location.hash = '#/tool/json-csv';
    };

    document.getElementById('btn-jf-to-schema').onclick = () => {
      const text = outputEl.textContent || inputEl.value;
      if (!text || outputEl.classList.contains('json-error')) return UI.showError('Nothing valid to validate.');
      setHandoff('json-schema-validator', text, 'JSON from formatter');
      window.location.hash = '#/tool/json-schema-validator';
    };

    if (handoff?.value) document.getElementById('btn-jf-format').click();
  }
};
