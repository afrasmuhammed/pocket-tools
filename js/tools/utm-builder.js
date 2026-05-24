import { UI } from '../core/ui.js';
import { consumeHandoff, setHandoff } from '../core/handoff.js';

const FIELDS = ['source', 'medium', 'campaign', 'content', 'term'];

function slug(value) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export default {
  init() {
    const urlEl = document.getElementById('utm-url');
    const outputEl = document.getElementById('utm-output');
    const inputs = Object.fromEntries(FIELDS.map(key => [key, document.getElementById(`utm-${key}`)]));
    const handoff = consumeHandoff('utm-builder');
    if (handoff?.value) urlEl.value = handoff.value;

    const build = () => {
      if (!urlEl.value.trim()) return UI.showError('Add a landing URL.');
      try {
        const url = new URL(urlEl.value.trim());
        FIELDS.forEach(key => {
          const value = slug(inputs[key].value);
          const param = key === 'campaign' ? 'utm_campaign' : key === 'source' ? 'utm_source' : key === 'medium' ? 'utm_medium' : key === 'content' ? 'utm_content' : 'utm_term';
          if (value) url.searchParams.set(param, value);
        });
        outputEl.value = url.toString();
      } catch {
        UI.showError('Enter a valid URL.');
      }
    };

    document.getElementById('btn-utm-build').onclick = build;
    document.getElementById('btn-utm-sample').onclick = () => {
      urlEl.value = 'https://example.com/launch';
      inputs.source.value = 'newsletter';
      inputs.medium.value = 'email';
      inputs.campaign.value = 'PocketKit Spring Launch';
      inputs.content.value = 'hero button';
      inputs.term.value = '';
      build();
    };
    document.getElementById('btn-utm-clear').onclick = () => {
      urlEl.value = '';
      outputEl.value = '';
      FIELDS.forEach(key => { inputs[key].value = ''; });
    };
    document.getElementById('btn-utm-copy').onclick = () => {
      if (!outputEl.value) return UI.showError('Build a URL first.');
      navigator.clipboard.writeText(outputEl.value).then(() => UI.showToast('Copied!', 'success')).catch(() => UI.showError('Copy failed.'));
    };
    document.getElementById('btn-utm-qr').onclick = () => {
      if (!outputEl.value) return UI.showError('Build a URL first.');
      setHandoff('qr-generator', outputEl.value, 'UTM URL');
      window.location.hash = '#/tool/qr-generator';
    };
  },
};
