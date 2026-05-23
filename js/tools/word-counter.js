import { UI } from '../core/ui.js';

const WordCounter = {
  inputEl: null,
  wordsEl: null,
  charsEl: null,
  charsNoSpacesEl: null,
  paragraphsEl: null,
  sentencesEl: null,
  readingTimeEl: null,
  btnCopy: null,
  btnClear: null,

  init() {
    this.inputEl = document.getElementById('wc-input');
    this.wordsEl = document.getElementById('wc-words');
    this.charsEl = document.getElementById('wc-chars');
    this.charsNoSpacesEl = document.getElementById('wc-chars-no-spaces');
    this.paragraphsEl = document.getElementById('wc-paragraphs');
    this.sentencesEl = document.getElementById('wc-sentences');
    this.readingTimeEl = document.getElementById('wc-reading-time');
    this.btnCopy = document.getElementById('wc-copy');
    this.btnClear = document.getElementById('wc-clear');

    if (!this.inputEl) return;

    // Attach Event Listeners
    this.inputEl.addEventListener('input', () => this.analyzeText());
    
    this.btnClear.addEventListener('click', () => {
      this.inputEl.value = '';
      this.analyzeText();
    });

    this.btnCopy.addEventListener('click', () => {
      if (!this.inputEl.value) {
        UI.showError('No text to copy');
        return;
      }
      navigator.clipboard.writeText(this.inputEl.value)
        .then(() => UI.showToast('Copied to clipboard!', 'success'))
        .catch(() => UI.showError('Failed to copy'));
    });
  },

  analyzeText() {
    const text = this.inputEl.value || '';
    
    // Characters
    const chars = text.length;
    this.charsEl.textContent = chars;
    
    // Characters without spaces
    const charsNoSpaces = text.replace(/\s+/g, '').length;
    this.charsNoSpacesEl.textContent = charsNoSpaces;
    
    // Words
    const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    this.wordsEl.textContent = words;
    
    // Paragraphs
    const paragraphs = text.trim() === '' ? 0 : text.split(/\n+/).filter(p => p.trim().length > 0).length;
    this.paragraphsEl.textContent = paragraphs;

    const sentences = text.trim() === '' ? 0 : (text.match(/[^.!?]+[.!?]+(\s|$)/g) || []).length;
    this.sentencesEl.textContent = sentences;

    const minutes = Math.max(0, Math.ceil(words / 225));
    this.readingTimeEl.textContent = minutes ? `${minutes}m` : '0m';
  }
};

export default WordCounter;
