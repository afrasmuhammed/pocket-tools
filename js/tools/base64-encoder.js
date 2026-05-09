import { UI } from '../core/ui.js';

// Unicode-safe encode: text → UTF-8 bytes → base64
function encodeBase64(text) {
  return btoa(encodeURIComponent(text).replace(/%([0-9A-F]{2})/g, (_, p1) =>
    String.fromCharCode(parseInt(p1, 16))
  ));
}

// Unicode-safe decode: base64 → UTF-8 bytes → text
function decodeBase64(b64) {
  return decodeURIComponent(
    atob(b64).split('').map(c =>
      '%' + c.charCodeAt(0).toString(16).padStart(2, '0')
    ).join('')
  );
}

export default {
  init() {
    const input  = document.getElementById('b64-input');
    const output = document.getElementById('b64-output');

    document.getElementById('btn-b64-encode').onclick = () => {
      const text = input.value;
      if (!text) return;
      try {
        output.value = encodeBase64(text);
      } catch {
        UI.showError('Encoding failed — unexpected error.');
      }
    };

    document.getElementById('btn-b64-decode').onclick = () => {
      const text = input.value.trim();
      if (!text) return;
      try {
        output.value = decodeBase64(text);
      } catch {
        UI.showError('Invalid Base64 — could not decode.');
      }
    };

    document.getElementById('btn-b64-clear').onclick = () => {
      input.value  = '';
      output.value = '';
    };

    document.getElementById('btn-b64-copy').onclick = () => {
      if (!output.value) return UI.showError('Nothing to copy yet.');
      navigator.clipboard.writeText(output.value)
        .then(() => UI.showToast('Copied!', 'success'))
        .catch(() => UI.showError('Copy failed.'));
    };
  }
};
