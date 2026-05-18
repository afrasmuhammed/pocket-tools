import { UI } from '../core/ui.js';

const WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing',
  'elit', 'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore',
  'et', 'dolore', 'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam',
  'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip',
  'ex', 'ea', 'commodo', 'consequat', 'duis', 'aute', 'irure', 'reprehenderit',
  'voluptate', 'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur',
  'excepteur', 'sint', 'occaecat', 'cupidatat', 'non', 'proident', 'sunt',
  'culpa', 'qui', 'officia', 'deserunt', 'mollit', 'anim', 'id', 'est',
  'laborum',
];

const LENGTHS = {
  short: { min: 2, max: 3 },
  medium: { min: 4, max: 5 },
  long: { min: 6, max: 8 },
};

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickWord() {
  return WORDS[randomInt(0, WORDS.length - 1)];
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function makeWords(count, startWithLorem) {
  const words = [];
  if (startWithLorem && count > 0) words.push('lorem');
  if (startWithLorem && count > 1) words.push('ipsum');

  while (words.length < count) {
    words.push(pickWord());
  }

  return words;
}

function makeSentence(wordCount, startWithLorem) {
  const words = makeWords(wordCount, startWithLorem);
  return `${capitalize(words.join(' '))}.`;
}

function makeParagraph(length, startWithLorem) {
  const range = LENGTHS[length] || LENGTHS.medium;
  const sentenceCount = randomInt(range.min, range.max);
  const sentences = [];

  for (let i = 0; i < sentenceCount; i += 1) {
    sentences.push(makeSentence(randomInt(8, 16), startWithLorem && i === 0));
  }

  return sentences.join(' ');
}

function generateText(type, count, length, startWithLorem) {
  if (type === 'words') {
    return makeWords(count, startWithLorem).join(' ');
  }

  if (type === 'sentences') {
    return Array.from({ length: count }, (_, index) =>
      makeSentence(randomInt(8, 16), startWithLorem && index === 0)
    ).join(' ');
  }

  return Array.from({ length: count }, (_, index) =>
    makeParagraph(length, startWithLorem && index === 0)
  ).join('\n\n');
}

function countWords(text) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

export default {
  init() {
    const typeEl = document.getElementById('lorem-type');
    const countEl = document.getElementById('lorem-count');
    const lengthEl = document.getElementById('lorem-length');
    const startEl = document.getElementById('lorem-start');
    const outputEl = document.getElementById('lorem-output');
    const wordsEl = document.getElementById('lorem-words');
    const charsEl = document.getElementById('lorem-chars');

    const updateMetrics = () => {
      wordsEl.textContent = countWords(outputEl.value).toLocaleString();
      charsEl.textContent = outputEl.value.length.toLocaleString();
    };

    const syncOptions = () => {
      const isParagraphs = typeEl.value === 'paragraphs';
      lengthEl.disabled = !isParagraphs;
      countEl.max = typeEl.value === 'words' ? '500' : '100';
    };

    document.getElementById('btn-lorem-generate').onclick = () => {
      const max = Number(countEl.max);
      const count = Math.min(Math.max(Number(countEl.value) || 1, 1), max);
      countEl.value = String(count);
      outputEl.value = generateText(typeEl.value, count, lengthEl.value, startEl.checked);
      updateMetrics();
    };

    document.getElementById('btn-lorem-clear').onclick = () => {
      outputEl.value = '';
      updateMetrics();
    };

    document.getElementById('btn-lorem-copy').onclick = () => {
      if (!outputEl.value) return UI.showError('Nothing to copy yet.');
      navigator.clipboard.writeText(outputEl.value)
        .then(() => UI.showToast('Copied!', 'success'))
        .catch(() => UI.showError('Copy failed.'));
    };

    typeEl.addEventListener('change', syncOptions);
    outputEl.addEventListener('input', updateMetrics);
    syncOptions();
    updateMetrics();
  },
};
