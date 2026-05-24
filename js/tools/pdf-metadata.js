import { UI } from '../core/ui.js';
import { FileHelper } from '../core/file.js';
import { loadPdfJs } from '../core/lazy.js';

function fmtBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function fmtDate(value) {
  if (!value) return '--';
  const match = String(value).match(/D:(\d{4})(\d{2})?(\d{2})?(\d{2})?(\d{2})?/);
  if (!match) return String(value);
  const [, y, m = '01', d = '01', h = '00', min = '00'] = match;
  return new Date(`${y}-${m}-${d}T${h}:${min}:00`).toLocaleString();
}

export default {
  async init() {
    const upload = document.getElementById('pdfmeta-upload');
    const button = document.getElementById('btn-pdfmeta-read');
    const pagesEl = document.getElementById('pdfmeta-pages');
    const sizeEl = document.getElementById('pdfmeta-size');
    const resultsEl = document.getElementById('pdfmeta-results');
    let currentFile = null;

    upload.onchange = async event => {
      const file = event.target.files[0];
      if (!file) { currentFile = null; button.disabled = true; return; }
      const valid = await FileHelper.validatePdf(file);
      if (!valid.ok) { upload.value = ''; button.disabled = true; return UI.showError(valid.error); }
      currentFile = file;
      button.disabled = false;
      pagesEl.textContent = '0';
      sizeEl.textContent = fmtBytes(file.size);
      resultsEl.innerHTML = '';
    };

    button.onclick = async () => {
      if (!currentFile) return;
      button.disabled = true;
      button.textContent = 'Reading...';
      try {
        const pdfjsLib = await loadPdfJs();
        const pdf = await pdfjsLib.getDocument({ data: await currentFile.arrayBuffer() }).promise;
        const meta = await pdf.getMetadata().catch(() => ({ info: {}, metadata: null }));
        const info = meta.info || {};
        pagesEl.textContent = pdf.numPages.toLocaleString();
        const rows = [
          ['File', currentFile.name],
          ['Title', info.Title || '--'],
          ['Author', info.Author || '--'],
          ['Subject', info.Subject || '--'],
          ['Creator', info.Creator || '--'],
          ['Producer', info.Producer || '--'],
          ['Created', fmtDate(info.CreationDate)],
          ['Modified', fmtDate(info.ModDate)],
          ['PDF Version', pdf._pdfInfo?.pdfFormatVersion || '--'],
        ];
        resultsEl.innerHTML = rows.map(([key, value]) => `<div class="seo-result-row"><strong>${key}</strong><span>${value}</span></div>`).join('');
      } catch (error) {
        UI.showError('Could not read this PDF. It may be encrypted or damaged.');
      } finally {
        button.disabled = false;
        button.textContent = 'Read Metadata';
      }
    };
  },
};
