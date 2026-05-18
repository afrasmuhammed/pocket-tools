import { UI } from '../core/ui.js';

const NAMED_ENTITIES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
  '\u00a0': '&nbsp;',
};

function encodeNamed(text) {
  return text.replace(/[&<>"'\u00a0]/g, char => NAMED_ENTITIES[char]);
}

function encodeNumeric(text, radix) {
  return Array.from(text, char => {
    const code = char.codePointAt(0);
    return radix === 16
      ? `&#x${code.toString(16).toUpperCase()};`
      : `&#${code};`;
  }).join('');
}

function encodeEntities(text, mode) {
  if (mode === 'decimal') return encodeNumeric(text, 10);
  if (mode === 'hex') return encodeNumeric(text, 16);
  return encodeNamed(text);
}

function decodeEntities(text) {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

export default {
  init() {
    const input = document.getElementById('htmlent-input');
    const output = document.getElementById('htmlent-output');
    const mode = document.getElementById('htmlent-mode');
    const inputLength = document.getElementById('htmlent-input-length');
    const outputLength = document.getElementById('htmlent-output-length');

    const updateCounts = () => {
      inputLength.textContent = input.value.length.toLocaleString();
      outputLength.textContent = output.value.length.toLocaleString();
    };

    document.getElementById('btn-htmlent-encode').onclick = () => {
      if (!input.value) return UI.showError('Enter text first.');
      output.value = encodeEntities(input.value, mode.value);
      updateCounts();
    };

    document.getElementById('btn-htmlent-decode').onclick = () => {
      if (!input.value) return UI.showError('Enter HTML entities first.');
      output.value = decodeEntities(input.value);
      updateCounts();
    };

    document.getElementById('btn-htmlent-swap').onclick = () => {
      if (!output.value) return UI.showError('Nothing to swap yet.');
      input.value = output.value;
      output.value = '';
      updateCounts();
    };

    document.getElementById('btn-htmlent-clear').onclick = () => {
      input.value = '';
      output.value = '';
      updateCounts();
    };

    document.getElementById('btn-htmlent-copy').onclick = () => {
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
