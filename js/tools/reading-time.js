import { consumeHandoff } from '../core/handoff.js';

export default {
  init() {
    const input   = document.getElementById('rt-input');
    const timeEl  = document.getElementById('rt-time');
    const wordsEl = document.getElementById('rt-words');
    const speakEl = document.getElementById('rt-speak');
    const handoff = consumeHandoff('reading-time');
    if (handoff?.value) input.value = handoff.value;

    const fmtMin = (mins) => {
      if (mins < 1)  return '< 1 min';
      if (mins >= 60) {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return m ? `${h}h ${m}m` : `${h}h`;
      }
      return `${mins} min`;
    };

    const calculate = () => {
      const text = input.value.trim();
      if (!text) {
        if (wordsEl) wordsEl.textContent = '0';
        timeEl.textContent  = '0 min';
        if (speakEl) speakEl.textContent = '0 min';
        return;
      }

      const words    = text.split(/\s+/).length;
      const readMins = Math.ceil(words / 225);
      const speakMins = Math.ceil(words / 130);

      if (wordsEl) wordsEl.textContent = words.toLocaleString();
      timeEl.textContent  = fmtMin(readMins);
      if (speakEl) speakEl.textContent = fmtMin(speakMins);
    };

    input.addEventListener('input', calculate);
    calculate();
  }
};
