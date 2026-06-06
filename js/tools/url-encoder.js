import { UI } from '../core/ui.js';
import { consumeHandoff, setHandoff } from '../core/handoff.js';

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
    const escapeCount = document.getElementById('url-escape-count');
    const spaceCount = document.getElementById('url-space-count');
    const modeSummary = document.getElementById('url-mode-summary');
    const handoff = consumeHandoff('url-encoder');
    if (handoff?.value) input.value = handoff.value;

    const updateCounts = () => {
      inputLength.textContent = input.value.length.toLocaleString();
      outputLength.textContent = output.value.length.toLocaleString();
      escapeCount.textContent = (output.value.match(/%[0-9a-f]{2}/gi) || []).length.toLocaleString();
      spaceCount.textContent = (input.value.match(/\s/g) || []).length.toLocaleString();
      modeSummary.textContent = mode.options[mode.selectedIndex]?.textContent || 'URL component';
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

    document.getElementById('btn-url-to-qr').onclick = () => {
      const text = output.value || input.value;
      if (!text) return UI.showError('Nothing to send yet.');
      setHandoff('qr-generator', text, 'URL encoder output');
      window.location.hash = '#/tool/qr-generator';
    };

    input.addEventListener('input', updateCounts);
    output.addEventListener('input', updateCounts);
    mode.addEventListener('change', updateCounts);
    updateCounts();
  },
};
