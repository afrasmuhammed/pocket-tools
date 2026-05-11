import cronstrue from '../../lib/cronstrue-esm.js';

function debounce(fn, ms) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
}

export default {
  init() {
    const inputEl  = document.getElementById('cron-input');
    const resultEl = document.getElementById('cron-result');
    const errorEl  = document.getElementById('cron-error');

    function showResult(text) {
      resultEl.textContent = text;
      resultEl.classList.remove('hidden');
      errorEl.textContent = '';
      errorEl.classList.add('hidden');
    }

    function showError(msg) {
      resultEl.textContent = '';
      resultEl.classList.add('hidden');
      errorEl.textContent = msg;
      errorEl.classList.remove('hidden');
    }

    function clearAll() {
      resultEl.textContent = '';
      resultEl.classList.add('hidden');
      errorEl.textContent = '';
      errorEl.classList.add('hidden');
    }

    const run = debounce(() => {
      const raw = inputEl.value.trim();
      if (!raw) { clearAll(); return; }

      try {
        const description = cronstrue.toString(raw, { throwExceptionOnParseError: true });
        showResult(description);
      } catch (e) {
        showError('Invalid cron expression — check the format: minute hour day month weekday');
      }
    }, 300);

    inputEl.addEventListener('input', run);

    // Example chips — clicking loads the expression and triggers a decode
    document.querySelectorAll('.cron-chips .chip').forEach(chip => {
      chip.addEventListener('click', () => {
        inputEl.value = chip.dataset.cron;
        inputEl.dispatchEvent(new Event('input'));
      });
    });
  }
};
