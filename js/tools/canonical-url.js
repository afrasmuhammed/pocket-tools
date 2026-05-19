import { UI } from '../core/ui.js';

const SAMPLE = 'http://www.example.com/blog/post/?utm_source=newsletter&utm_campaign=spring#comments';

function canonicalize(raw, options) {
  if (!raw.trim()) return '';
  const input = /^https?:\/\//i.test(raw.trim()) ? raw.trim() : `https://${raw.trim()}`;
  const url = new URL(input);

  if (options.https) url.protocol = 'https:';
  url.hostname = url.hostname.toLowerCase();
  if (options.removeWww) url.hostname = url.hostname.replace(/^www\./, '');
  if (options.removeQuery) url.search = '';
  url.hash = '';

  let output = url.toString();
  if (options.removeSlash && url.pathname !== '/') {
    output = output.replace(/\/$/, '');
  }
  return output;
}

function tagFor(url) {
  return url ? `<link rel="canonical" href="${url}">` : '';
}

export default {
  init() {
    const urlEl = document.getElementById('cu-url');
    const httpsEl = document.getElementById('cu-https');
    const wwwEl = document.getElementById('cu-www');
    const queryEl = document.getElementById('cu-query');
    const slashEl = document.getElementById('cu-slash');
    const canonicalEl = document.getElementById('cu-canonical');
    const tagEl = document.getElementById('cu-tag');

    const render = () => {
      try {
        const canonical = canonicalize(urlEl.value, {
          https: httpsEl.checked,
          removeWww: wwwEl.checked,
          removeQuery: queryEl.checked,
          removeSlash: slashEl.checked,
        });
        canonicalEl.value = canonical;
        tagEl.value = tagFor(canonical);
      } catch {
        canonicalEl.value = '';
        tagEl.value = '';
      }
    };

    document.getElementById('btn-cu-sample').onclick = () => {
      urlEl.value = SAMPLE;
      render();
    };
    document.getElementById('btn-cu-clear').onclick = () => {
      urlEl.value = '';
      canonicalEl.value = '';
      tagEl.value = '';
    };
    document.getElementById('btn-cu-copy').onclick = () => {
      if (!tagEl.value) return UI.showError('Nothing to copy yet.');
      navigator.clipboard.writeText(tagEl.value)
        .then(() => UI.showToast('Copied!', 'success'))
        .catch(() => UI.showError('Copy failed.'));
    };

    [urlEl, httpsEl, wwwEl, queryEl, slashEl].forEach(el => {
      el.addEventListener('input', render);
      el.addEventListener('change', render);
    });
    render();
  },
};
