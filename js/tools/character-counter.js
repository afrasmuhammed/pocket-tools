import { UI } from '../core/ui.js';

const encoder = new TextEncoder();

function trimToBytes(text, limit) {
  let output = '';
  let used = 0;
  for (const char of text) {
    const size = encoder.encode(char).length;
    if (used + size > limit) break;
    output += char;
    used += size;
  }
  return output;
}

export default {
  init() {
    const textEl = document.getElementById('cc-text');
    const limitEl = document.getElementById('cc-limit');
    const modeEl = document.getElementById('cc-mode');
    const charsEl = document.getElementById('cc-chars');
    const bytesEl = document.getElementById('cc-bytes');
    const linesEl = document.getElementById('cc-lines');
    const remainingEl = document.getElementById('cc-remaining');
    const trimmedEl = document.getElementById('cc-trimmed');

    const render = () => {
      const text = textEl.value;
      const chars = [...text].length;
      const bytes = encoder.encode(text).length;
      const limit = Math.max(Number(limitEl.value) || 1, 1);
      const active = modeEl.value === 'bytes' ? bytes : chars;
      charsEl.textContent = chars.toLocaleString();
      bytesEl.textContent = bytes.toLocaleString();
      linesEl.textContent = text ? String(text.split(/\r?\n/).length) : '0';
      remainingEl.textContent = String(limit - active);
      remainingEl.style.color = active > limit ? 'var(--danger)' : '';
      trimmedEl.value = modeEl.value === 'bytes' ? trimToBytes(text, limit) : [...text].slice(0, limit).join('');
    };

    document.getElementById('btn-cc-copy').onclick = () => {
      if (!trimmedEl.value) return UI.showError('Nothing to copy yet.');
      navigator.clipboard.writeText(trimmedEl.value)
        .then(() => UI.showToast('Copied!', 'success'))
        .catch(() => UI.showError('Copy failed.'));
    };
    [textEl, limitEl, modeEl].forEach(el => {
      el.addEventListener('input', render);
      el.addEventListener('change', render);
    });
    render();
  },
};
