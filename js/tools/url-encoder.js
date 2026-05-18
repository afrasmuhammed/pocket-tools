import { UI } from '../core/ui.js';

function encodeValue(text, mode) {
  if (mode === 'full') return encodeURI(text);
  if (mode === 'form') return encodeURIComponent(text).replace(/%20/g, '+');
  return encodeURIComponent(text);
}

function decodeValue(text, mode) {
  const value = mode === 'form' ? text.replace(/\+/g, ' ') : text;
  return mode === 'full' ? decodeURI(value) : decodeURIComponent(value);
}

export default {
  init() {
    const input = document.getElementById('url-input');
    const output = document.getElementById('url-output');
    const mode = document.getElementById('url-mode');
    const inputLength = document.getElementById('url-input-length');
    const outputLength = document.getElementById('url-output-length');

    const updateCounts = () => {
      inputLength.textContent = input.value.length.toLocaleString();
      outputLength.textContent = output.value.length.toLocaleString();
    };

    const run = (operation) => {
      if (!input.value) return UI.showError('Enter text or a URL first.');

      try {
        output.value = operation === 'encode'
          ? encodeValue(input.value, mode.value)
          : decodeValue(input.value.trim(), mode.value);
        updateCounts();
      } catch {
        const message = operation === 'encode'
          ? 'Could not encode this value.'
          : 'Could not decode this value. Check the percent encoding.';
        UI.showError(message);
      }
    };

    document.getElementById('btn-url-encode').onclick = () => run('encode');
    document.getElementById('btn-url-decode').onclick = () => run('decode');

    document.getElementById('btn-url-swap').onclick = () => {
      if (!output.value) return UI.showError('Nothing to swap yet.');
      input.value = output.value;
      output.value = '';
      updateCounts();
    };

    document.getElementById('btn-url-clear').onclick = () => {
      input.value = '';
      output.value = '';
      updateCounts();
    };

    document.getElementById('btn-url-copy').onclick = () => {
      if (!output.value) return UI.showError('Nothing to copy yet.');
      navigator.clipboard.writeText(output.value)
        .then(() => UI.showToast('Copied!', 'success'))
        .catch(() => UI.showError('Copy failed.'));
    };

    input.addEventListener('input', updateCounts);
    output.addEventListener('input', updateCounts);
    updateCounts();
  },
};
