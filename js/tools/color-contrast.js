import { UI } from '../core/ui.js';

function parseHex(hex) {
  const clean = hex.trim().replace(/^#/, '');
  if (!/^[0-9a-f]{6}$/i.test(clean)) return null;
  return [0, 2, 4].map(i => parseInt(clean.slice(i, i + 2), 16));
}

function luminance(rgb) {
  const channel = value => {
    const v = value / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const [r, g, b] = rgb.map(channel);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(fg, bg) {
  const a = luminance(fg);
  const b = luminance(bg);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

export default {
  init() {
    const fgEl = document.getElementById('contrast-fg');
    const bgEl = document.getElementById('contrast-bg');
    const fgText = document.getElementById('contrast-fg-text');
    const bgText = document.getElementById('contrast-bg-text');
    const preview = document.getElementById('contrast-preview');
    const ratioEl = document.getElementById('contrast-ratio');
    const aaEl = document.getElementById('contrast-aa');
    const largeEl = document.getElementById('contrast-large');

    const sync = (fromText = false) => {
      if (fromText) {
        if (parseHex(fgText.value)) fgEl.value = fgText.value;
        if (parseHex(bgText.value)) bgEl.value = bgText.value;
      } else {
        fgText.value = fgEl.value;
        bgText.value = bgEl.value;
      }
      const fg = parseHex(fgText.value);
      const bg = parseHex(bgText.value);
      if (!fg || !bg) return;
      const value = ratio(fg, bg);
      preview.style.color = fgText.value;
      preview.style.background = bgText.value;
      ratioEl.textContent = `${value.toFixed(2)}:1`;
      aaEl.textContent = value >= 4.5 ? 'AA Pass' : 'Fail';
      aaEl.className = value >= 4.5 ? '' : 'status-error';
      largeEl.textContent = value >= 3 ? 'AA Pass' : 'Fail';
      largeEl.className = value >= 3 ? '' : 'status-error';
    };

    [fgEl, bgEl].forEach(el => el.addEventListener('input', () => sync(false)));
    [fgText, bgText].forEach(el => el.addEventListener('input', () => sync(true)));
    document.getElementById('btn-contrast-swap').onclick = () => {
      [fgText.value, bgText.value] = [bgText.value, fgText.value];
      sync(true);
    };
    document.getElementById('btn-contrast-sample').onclick = () => {
      fgText.value = '#f8fafc';
      bgText.value = '#0f172a';
      sync(true);
    };
    document.getElementById('btn-contrast-copy').onclick = () => {
      navigator.clipboard.writeText(`color: ${fgText.value};\nbackground-color: ${bgText.value};`)
        .then(() => UI.showToast('Copied CSS!', 'success'))
        .catch(() => UI.showError('Copy failed.'));
    };
    sync();
  },
};
