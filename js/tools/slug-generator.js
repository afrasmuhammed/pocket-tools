import { UI } from '../core/ui.js';

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'for', 'from',
  'how', 'in', 'into', 'is', 'it', 'of', 'on', 'or', 'the', 'to', 'with',
  'your',
]);

const SAMPLE = '10 Tips for Better Web Design in 2026!';

function normalizeText(text) {
  return text
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/['’]/g, '');
}

function generateSlug(text, options) {
  const separator = options.separator;
  let words = normalizeText(text)
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (options.lowercase) {
    words = words.map(word => word.toLowerCase());
  }

  if (options.removeStopWords) {
    words = words.filter(word => !STOP_WORDS.has(word.toLowerCase()));
  }

  return words.join(separator);
}

function countWords(slug, separator) {
  if (!slug) return 0;
  return slug.split(separator).filter(Boolean).length;
}

export default {
  init() {
    const inputEl = document.getElementById('slug-input');
    const separatorEl = document.getElementById('slug-separator');
    const lowercaseEl = document.getElementById('slug-lowercase');
    const stopWordsEl = document.getElementById('slug-stopwords');
    const outputEl = document.getElementById('slug-output');
    const charsEl = document.getElementById('slug-chars');
    const wordsEl = document.getElementById('slug-words');

    const updateMetrics = () => {
      charsEl.textContent = outputEl.value.length.toLocaleString();
      wordsEl.textContent = countWords(outputEl.value, separatorEl.value).toLocaleString();
    };

    const run = () => {
      if (!inputEl.value.trim()) {
        outputEl.value = '';
        updateMetrics();
        return;
      }

      outputEl.value = generateSlug(inputEl.value, {
        separator: separatorEl.value,
        lowercase: lowercaseEl.checked,
        removeStopWords: stopWordsEl.checked,
      });
      updateMetrics();
    };

    document.getElementById('btn-slug-generate').onclick = run;

    document.getElementById('btn-slug-sample').onclick = () => {
      inputEl.value = SAMPLE;
      run();
    };

    document.getElementById('btn-slug-clear').onclick = () => {
      inputEl.value = '';
      outputEl.value = '';
      updateMetrics();
    };

    document.getElementById('btn-slug-copy').onclick = () => {
      if (!outputEl.value) return UI.showError('Nothing to copy yet.');
      navigator.clipboard.writeText(outputEl.value)
        .then(() => UI.showToast('Copied!', 'success'))
        .catch(() => UI.showError('Copy failed.'));
    };

    inputEl.addEventListener('input', run);
    separatorEl.addEventListener('change', run);
    lowercaseEl.addEventListener('change', run);
    stopWordsEl.addEventListener('change', run);
    updateMetrics();
  },
};
