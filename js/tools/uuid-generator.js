import { UI } from '../core/ui.js';

function newUUID() {
  return crypto.randomUUID();
}

function clampCount(raw) {
  const n = parseInt(raw, 10);
  if (!Number.isFinite(n)) return 10;
  return Math.min(100, Math.max(1, n));
}

function makeBatchItem(uuid) {
  const li = document.createElement('li');
  li.className = 'uuid-batch-item';

  const code = document.createElement('code');
  code.className = 'uuid-display';
  code.textContent = uuid;

  const btn = document.createElement('button');
  btn.className = 'btn btn-secondary btn-sm';
  btn.textContent = 'Copy';
  btn.onclick = () => {
    navigator.clipboard.writeText(uuid)
      .then(() => UI.showToast('Copied!', 'success'))
      .catch(() => UI.showError('Copy failed.'));
  };

  li.appendChild(code);
  li.appendChild(btn);
  return li;
}

export default {
  init() {
    const singleEl   = document.getElementById('uuid-single');
    const countEl    = document.getElementById('uuid-count');
    const batchWrap  = document.getElementById('uuid-batch-wrap');
    const batchList  = document.getElementById('uuid-batch-list');

    // Generate one UUID on load
    singleEl.textContent = newUUID();

    document.getElementById('btn-uuid-generate').onclick = () => {
      singleEl.textContent = newUUID();
    };

    document.getElementById('btn-uuid-copy-single').onclick = () => {
      const val = singleEl.textContent;
      if (val === '—') return UI.showError('Generate a UUID first.');
      navigator.clipboard.writeText(val)
        .then(() => UI.showToast('Copied!', 'success'))
        .catch(() => UI.showError('Copy failed.'));
    };

    document.getElementById('btn-uuid-batch').onclick = () => {
      const count = clampCount(countEl.value);
      // Write back clamped value so user sees the correction
      countEl.value = count;

      const uuids = Array.from({ length: count }, newUUID);
      batchList.replaceChildren(...uuids.map(makeBatchItem));
      batchWrap.classList.remove('hidden');
    };

    document.getElementById('btn-uuid-copy-all').onclick = () => {
      const uuids = [...batchList.querySelectorAll('.uuid-display')]
        .map(el => el.textContent)
        .join('\n');
      if (!uuids) return;
      navigator.clipboard.writeText(uuids)
        .then(() => UI.showToast('All UUIDs copied!', 'success'))
        .catch(() => UI.showError('Copy failed.'));
    };
  }
};
