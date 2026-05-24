import { UI } from '../core/ui.js';
import { consumeHandoff } from '../core/handoff.js';

const SAMPLE = 'Contact Alex at alex.carter@example.com or +1 555 018 2200. Test card: 4242 4242 4242 4242.';

const RULES = [
  ['email', /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[email]'],
  ['card', /\b(?:\d[ -]*?){13,19}\b/g, '[card]'],
  ['ip', /\b(?:\d{1,3}\.){3}\d{1,3}\b/g, '[ip]'],
  ['phone', /(?:\+?\d[\d\s().-]{7,}\d)/g, '[phone]'],
];

export default {
  init() {
    const inputEl = document.getElementById('redact-input');
    const outputEl = document.getElementById('redact-output');
    const countEl = document.getElementById('redact-count');
    const handoff = consumeHandoff('text-redactor');
    if (handoff?.value) inputEl.value = handoff.value;

    const run = () => {
      let count = 0;
      let text = inputEl.value;
      RULES.forEach(([key, regex, replacement]) => {
        if (!document.getElementById(`redact-${key}`).checked) return;
        text = text.replace(regex, match => {
          if (key === 'phone' && /^(?:\d{1,3}\.){3}\d{1,3}$/.test(match.trim())) return match;
          count += 1;
          return replacement;
        });
      });
      outputEl.value = text;
      countEl.textContent = count.toLocaleString();
    };
    document.getElementById('btn-redact-run').onclick = run;
    document.getElementById('btn-redact-sample').onclick = () => { inputEl.value = SAMPLE; run(); };
    document.getElementById('btn-redact-clear').onclick = () => { inputEl.value = ''; outputEl.value = ''; countEl.textContent = '0'; };
    document.getElementById('btn-redact-copy').onclick = () => {
      if (!outputEl.value) return UI.showError('Nothing to copy yet.');
      navigator.clipboard.writeText(outputEl.value).then(() => UI.showToast('Copied!', 'success')).catch(() => UI.showError('Copy failed.'));
    };
    if (handoff?.value) run();
  },
};
