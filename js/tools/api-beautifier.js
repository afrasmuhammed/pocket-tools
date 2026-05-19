import { UI } from '../core/ui.js';

const SAMPLE_BODY = '{"user":{"id":42,"name":"Ava Morgan","active":true},"items":[{"sku":"PT-001","qty":2}]}';

function bytes(value) {
  const size = new Blob([value]).size;
  if (size < 1024) return `${size} B`;
  return `${(size / 1024).toFixed(1)} KB`;
}

function formatBody(body, mode) {
  if (!body.trim()) return '';
  if (mode === 'text') return body.trim();
  try {
    return JSON.stringify(JSON.parse(body), null, 2);
  } catch (err) {
    if (mode === 'json') throw err;
    return body.trim();
  }
}

export default {
  init() {
    const statusEl = document.getElementById('api-status');
    const modeEl = document.getElementById('api-mode');
    const headersEl = document.getElementById('api-headers');
    const bodyEl = document.getElementById('api-body');
    const outputEl = document.getElementById('api-output');
    const typeEl = document.getElementById('api-status-type');
    const sizeEl = document.getElementById('api-size');

    const run = () => {
      try {
        const body = formatBody(bodyEl.value, modeEl.value);
        const parts = [];
        if (statusEl.value.trim()) parts.push(`Status: ${statusEl.value.trim()}`);
        if (headersEl.value.trim()) parts.push(`Headers:\n${headersEl.value.trim()}`);
        if (body) parts.push(`Body:\n${body}`);
        outputEl.value = parts.join('\n\n');
        typeEl.textContent = body.startsWith('{') || body.startsWith('[') ? 'JSON' : 'Text';
        sizeEl.textContent = bytes(bodyEl.value);
      } catch {
        outputEl.value = '';
        typeEl.textContent = 'Invalid';
        sizeEl.textContent = bytes(bodyEl.value);
        UI.showError('Invalid JSON body.');
      }
    };

    document.getElementById('btn-api-format').onclick = run;
    document.getElementById('btn-api-sample').onclick = () => {
      statusEl.value = '200 OK';
      headersEl.value = 'content-type: application/json\ncache-control: no-store';
      bodyEl.value = SAMPLE_BODY;
      modeEl.value = 'json';
      run();
    };
    document.getElementById('btn-api-copy').onclick = () => {
      if (!outputEl.value) return UI.showError('Nothing to copy yet.');
      navigator.clipboard.writeText(outputEl.value)
        .then(() => UI.showToast('Copied!', 'success'))
        .catch(() => UI.showError('Copy failed.'));
    };
    [statusEl, modeEl, headersEl, bodyEl].forEach(el => el.addEventListener('input', run));
    modeEl.addEventListener('change', run);
    run();
  },
};
