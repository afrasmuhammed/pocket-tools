import { UI } from '../core/ui.js';
import { setHandoff } from '../core/handoff.js';

const SAMPLE = 'https://www.example.com/guide?utm_source=newsletter&utm_medium=email&utm_campaign=spring&fbclid=abc123&gclid=xyz789&ref=homepage&id=42#comments';
const TRACKING_PREFIXES = ['utm_', 'pk_', 'mc_', 'ga_'];
const TRACKING_KEYS = new Set([
  'fbclid', 'gclid', 'dclid', 'gbraid', 'wbraid', 'msclkid', 'yclid', 'igshid',
  'si', 'spm', 'vero_id', 'mkt_tok', 'trk', 'trkemail', 'scid', 'ncid',
  'cmpid', 'campaignid', 'adgroupid', 'creative', 'gad_source', 'ref_src',
]);
const COMMERCE_KEYS = new Set(['tag', 'ascsubtag', 'camp', 'creativeasin', 'linkcode']);

function shouldRemove(key, keepCommerce) {
  const lower = key.toLowerCase();
  if (keepCommerce && COMMERCE_KEYS.has(lower)) return false;
  return TRACKING_KEYS.has(lower) || TRACKING_PREFIXES.some(prefix => lower.startsWith(prefix));
}

function renderRemoved(listEl, removed) {
  listEl.replaceChildren();
  removed.slice(0, 12).forEach(key => {
    const row = document.createElement('div');
    row.className = 'seo-result-row';
    const name = document.createElement('strong');
    name.textContent = key;
    const label = document.createElement('span');
    label.textContent = 'removed';
    row.append(name, label);
    listEl.appendChild(row);
  });
}

export default {
  init() {
    const input = document.getElementById('ssl-input');
    const output = document.getElementById('ssl-output');
    const removedCount = document.getElementById('ssl-removed-count');
    const savedCount = document.getElementById('ssl-saved-count');
    const removedList = document.getElementById('ssl-removed-list');

    const clean = () => {
      const raw = input.value.trim();
      if (!raw) return UI.showError('Paste a link first.');
      let url;
      try {
        url = new URL(raw.includes('://') ? raw : `https://${raw}`);
      } catch {
        return UI.showError('That does not look like a valid URL.');
      }

      const removed = [];
      const keepCommerce = document.getElementById('ssl-keep-commerce').checked;
      for (const key of [...url.searchParams.keys()]) {
        if (shouldRemove(key, keepCommerce)) {
          removed.push(key);
          url.searchParams.delete(key);
        }
      }
      if (document.getElementById('ssl-force-https').checked && url.protocol === 'http:') url.protocol = 'https:';
      if (document.getElementById('ssl-drop-fragment').checked) url.hash = '';

      output.value = url.toString();
      removedCount.textContent = removed.length.toLocaleString();
      savedCount.textContent = Math.max(0, raw.length - output.value.length).toLocaleString();
      renderRemoved(removedList, removed);
      UI.showSuccess(removed.length ? 'Tracking cleaned.' : 'No tracking parameters found.');
    };

    document.getElementById('btn-ssl-clean').onclick = clean;
    document.getElementById('btn-ssl-sample').onclick = () => { input.value = SAMPLE; clean(); };
    document.getElementById('btn-ssl-clear').onclick = () => {
      input.value = '';
      output.value = '';
      removedCount.textContent = '0';
      savedCount.textContent = '0';
      removedList.replaceChildren();
    };
    document.getElementById('btn-ssl-copy').onclick = () => {
      if (!output.value) return UI.showError('Clean a link first.');
      navigator.clipboard.writeText(output.value).then(() => UI.showSuccess('Link copied.')).catch(() => UI.showError('Copy failed.'));
    };
    document.getElementById('btn-ssl-qr').onclick = () => {
      if (!output.value) return UI.showError('Clean a link first.');
      setHandoff('qr-generator', { value: output.value });
      window.location.hash = '#/tool/qr-generator';
    };
  },
};
