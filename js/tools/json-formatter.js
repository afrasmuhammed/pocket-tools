import { UI } from '../core/ui.js';

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

export default {
  init() {
    const inputEl  = document.getElementById('jf-input');
    const outputEl = document.getElementById('jf-output');
    const statsEl  = document.getElementById('jf-stats');

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
  }
};
