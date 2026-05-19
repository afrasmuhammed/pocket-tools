const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'for', 'from', 'has',
  'he', 'in', 'is', 'it', 'its', 'of', 'on', 'or', 'our', 'she', 'that', 'the',
  'their', 'this', 'to', 'was', 'we', 'with', 'you', 'your',
]);

const SAMPLE = `Pocket Tools is a fast offline toolkit for creators, shop owners, students, and developers.
The toolkit includes PDF tools, image tools, SEO tools, writing tools, and useful calculators.
Offline tools are private because files and text stay inside your browser.`;

function wordsFrom(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .match(/[a-z0-9]+(?:'[a-z0-9]+)?/g) || [];
}

function phraseCounts(words, size) {
  const counts = new Map();
  for (let i = 0; i <= words.length - size; i += 1) {
    const phraseWords = words.slice(i, i + size);
    if (size === 1 && STOP_WORDS.has(phraseWords[0])) continue;
    const phrase = phraseWords.join(' ');
    counts.set(phrase, (counts.get(phrase) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 12);
}

export default {
  init() {
    const textEl = document.getElementById('kd-text');
    const targetEl = document.getElementById('kd-target');
    const phraseEl = document.getElementById('kd-phrase');
    const wordCountEl = document.getElementById('kd-word-count');
    const targetCountEl = document.getElementById('kd-target-count');
    const targetDensityEl = document.getElementById('kd-target-density');
    const resultsEl = document.getElementById('kd-results');

    const render = () => {
      const words = wordsFrom(textEl.value);
      const targetWords = wordsFrom(targetEl.value);
      const targetSize = targetWords.length || 1;
      const target = targetWords.join(' ');
      const phraseSize = Number(phraseEl.value) || 1;
      const total = words.length;
      let targetCount = 0;

      if (target) {
        for (let i = 0; i <= words.length - targetSize; i += 1) {
          if (words.slice(i, i + targetSize).join(' ') === target) targetCount += 1;
        }
      }

      wordCountEl.textContent = total.toLocaleString();
      targetCountEl.textContent = targetCount.toLocaleString();
      targetDensityEl.textContent = total ? `${((targetCount / total) * 100).toFixed(2)}%` : '0%';
      resultsEl.replaceChildren();

      const top = phraseCounts(words, phraseSize);
      if (!top.length) {
        const empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.textContent = 'Paste content to see keyword density.';
        resultsEl.appendChild(empty);
        return;
      }

      top.forEach(([phrase, count]) => {
        const row = document.createElement('div');
        row.className = 'seo-result-row';
        const label = document.createElement('strong');
        label.textContent = phrase;
        const meta = document.createElement('span');
        meta.textContent = `${count} uses · ${((count / total) * 100).toFixed(2)}%`;
        row.append(label, meta);
        resultsEl.appendChild(row);
      });
    };

    document.getElementById('btn-kd-sample').onclick = () => {
      textEl.value = SAMPLE;
      targetEl.value = 'offline tools';
      phraseEl.value = '2';
      render();
    };

    document.getElementById('btn-kd-clear').onclick = () => {
      textEl.value = '';
      targetEl.value = '';
      phraseEl.value = '1';
      render();
    };

    [textEl, targetEl, phraseEl].forEach(el => el.addEventListener('input', render));
    phraseEl.addEventListener('change', render);
    render();
  },
};
