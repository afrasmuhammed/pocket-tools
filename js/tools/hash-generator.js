import { UI } from '../core/ui.js';

const SAMPLE_TEXT = 'Pocket Tools';

function toHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

function toBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

async function digest(text, algorithm, format) {
  const bytes = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest(algorithm, bytes);
  return {
    bytes: bytes.length,
    output: format === 'base64' ? toBase64(hash) : toHex(hash),
  };
}

export default {
  init() {
    const inputEl = document.getElementById('hash-input');
    const outputEl = document.getElementById('hash-output');
    const algorithmEl = document.getElementById('hash-algorithm');
    const formatEl = document.getElementById('hash-output-format');
    const bytesEl = document.getElementById('hash-bytes');
    const charsEl = document.getElementById('hash-chars');
    const usedEl = document.getElementById('hash-used');

    function updateStats(bytes = 0, chars = 0, algorithm = algorithmEl.value) {
      bytesEl.textContent = bytes.toLocaleString();
      charsEl.textContent = chars.toLocaleString();
      usedEl.textContent = algorithm;
    }

    function clearAll() {
      inputEl.value = '';
      outputEl.value = '';
      outputEl.classList.remove('json-error');
      updateStats();
    }

    async function generate() {
      const raw = inputEl.value;
      if (!raw) {
        outputEl.value = '';
        updateStats();
        return;
      }

      try {
        const algorithm = algorithmEl.value;
        const { bytes, output } = await digest(raw, algorithm, formatEl.value);
        outputEl.value = output;
        outputEl.classList.remove('json-error');
        updateStats(bytes, output.length, algorithm);
      } catch (error) {
        outputEl.value = error.message;
        outputEl.classList.add('json-error');
        updateStats();
        UI.showError('Could not generate hash.');
      }
    }

    document.getElementById('btn-hash-generate').onclick = generate;

    document.getElementById('btn-hash-sample').onclick = () => {
      inputEl.value = SAMPLE_TEXT;
      algorithmEl.value = 'SHA-256';
      formatEl.value = 'hex';
      generate();
    };

    document.getElementById('btn-hash-clear').onclick = clearAll;

    document.getElementById('btn-hash-copy').onclick = () => {
      if (!outputEl.value || outputEl.classList.contains('json-error')) {
        return UI.showError('Nothing valid to copy.');
      }
      navigator.clipboard.writeText(outputEl.value)
        .then(() => UI.showToast('Copied!', 'success'))
        .catch(() => UI.showError('Copy failed.'));
    };
  },
};
