import { UI } from '../core/ui.js';

const SAMPLE_MESSAGE = 'Pocket Tools';
const SAMPLE_SECRET = 'secret';

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

async function sign(message, secret, algorithm, format) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: algorithm },
    false,
    ['sign'],
  );
  const messageBytes = encoder.encode(message);
  const signature = await crypto.subtle.sign('HMAC', key, messageBytes);
  return {
    bytes: messageBytes.length,
    output: format === 'base64' ? toBase64(signature) : toHex(signature),
  };
}

export default {
  init() {
    const messageEl = document.getElementById('hmac-message');
    const secretEl = document.getElementById('hmac-secret');
    const outputEl = document.getElementById('hmac-output');
    const algorithmEl = document.getElementById('hmac-algorithm');
    const formatEl = document.getElementById('hmac-output-format');
    const bytesEl = document.getElementById('hmac-bytes');
    const charsEl = document.getElementById('hmac-chars');
    const usedEl = document.getElementById('hmac-used');

    function updateStats(bytes = 0, chars = 0, algorithm = algorithmEl.value) {
      bytesEl.textContent = bytes.toLocaleString();
      charsEl.textContent = chars.toLocaleString();
      usedEl.textContent = algorithm;
    }

    function clearAll() {
      messageEl.value = '';
      secretEl.value = '';
      outputEl.value = '';
      outputEl.classList.remove('json-error');
      updateStats();
    }

    async function generate() {
      const message = messageEl.value;
      const secret = secretEl.value;
      if (!message || !secret) {
        outputEl.value = '';
        updateStats();
        if (message || secret) UI.showError('Message and secret are required.');
        return;
      }

      try {
        const algorithm = algorithmEl.value;
        const { bytes, output } = await sign(message, secret, algorithm, formatEl.value);
        outputEl.value = output;
        outputEl.classList.remove('json-error');
        updateStats(bytes, output.length, algorithm);
      } catch (error) {
        outputEl.value = error.message;
        outputEl.classList.add('json-error');
        updateStats();
        UI.showError('Could not generate HMAC.');
      }
    }

    document.getElementById('btn-hmac-generate').onclick = generate;

    document.getElementById('btn-hmac-sample').onclick = () => {
      messageEl.value = SAMPLE_MESSAGE;
      secretEl.value = SAMPLE_SECRET;
      algorithmEl.value = 'SHA-256';
      formatEl.value = 'hex';
      generate();
    };

    document.getElementById('btn-hmac-clear').onclick = clearAll;

    document.getElementById('btn-hmac-copy').onclick = () => {
      if (!outputEl.value || outputEl.classList.contains('json-error')) {
        return UI.showError('Nothing valid to copy.');
      }
      navigator.clipboard.writeText(outputEl.value)
        .then(() => UI.showToast('Copied!', 'success'))
        .catch(() => UI.showError('Copy failed.'));
    };
  },
};
