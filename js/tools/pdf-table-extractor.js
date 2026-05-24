import { UI } from '../core/ui.js';
import { FileHelper } from '../core/file.js';
import { loadPdfJs } from '../core/lazy.js';

function csvEscape(value) {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function textItem(item) {
  const [, , , , x, y] = item.transform || [0, 0, 0, 0, 0, 0];
  const width = item.width || Math.max(8, String(item.str || '').length * 5);
  return { text: String(item.str || '').trim(), x, y, width };
}

function groupRows(items) {
  const rows = [];
  const sorted = items.filter(item => item.text).sort((a, b) => b.y - a.y || a.x - b.x);
  sorted.forEach(item => {
    let row = rows.find(candidate => Math.abs(candidate.y - item.y) <= 3);
    if (!row) {
      row = { y: item.y, items: [] };
      rows.push(row);
    }
    row.items.push(item);
  });
  return rows.map(row => row.items.sort((a, b) => a.x - b.x));
}

function rowToCells(row, mode) {
  const gapByMode = { loose: 28, auto: 18, strict: 10 };
  const minGap = gapByMode[mode] || gapByMode.auto;
  const cells = [];
  let current = '';
  let lastEnd = null;

  row.forEach(item => {
    const gap = lastEnd === null ? 0 : item.x - lastEnd;
    if (lastEnd !== null && gap > minGap) {
      cells.push(current.trim());
      current = item.text;
    } else {
      current = current ? `${current} ${item.text}` : item.text;
    }
    lastEnd = item.x + item.width;
  });

  if (current.trim()) cells.push(current.trim());
  return cells;
}

function normalizeRows(rows) {
  const width = Math.max(...rows.map(row => row.length), 0);
  return rows.map(row => [...row, ...Array(Math.max(0, width - row.length)).fill('')]);
}

function renderPreview(container, rows) {
  container.replaceChildren();
  rows.slice(0, 8).forEach((row, index) => {
    const el = document.createElement('div');
    el.className = 'seo-result-row';
    const label = document.createElement('strong');
    label.textContent = `Row ${index + 1}`;
    const value = document.createElement('span');
    value.textContent = row.join(' | ');
    el.append(label, value);
    container.appendChild(el);
  });
}

export default {
  async init() {
    const upload = document.getElementById('pte-upload');
    const modeEl = document.getElementById('pte-mode');
    const minColsEl = document.getElementById('pte-min-cols');
    const extractBtn = document.getElementById('btn-pte-extract');
    const clearBtn = document.getElementById('btn-pte-clear');
    const copyBtn = document.getElementById('btn-pte-copy');
    const downloadBtn = document.getElementById('btn-pte-download');
    const output = document.getElementById('pte-output');
    const preview = document.getElementById('pte-preview');
    const pagesEl = document.getElementById('pte-pages');
    const rowsEl = document.getElementById('pte-rows');
    const colsEl = document.getElementById('pte-cols');
    let currentFile = null;

    const reset = () => {
      currentFile = null;
      upload.value = '';
      extractBtn.disabled = true;
      output.value = '';
      preview.replaceChildren();
      pagesEl.textContent = '0';
      rowsEl.textContent = '0';
      colsEl.textContent = '0';
      upload.closest('.drop-zone')?._reset?.();
    };

    upload.onchange = async event => {
      const file = event.target.files?.[0];
      if (!file) return reset();
      const valid = await FileHelper.validatePdf(file);
      if (!valid.ok) {
        reset();
        return UI.showError(valid.error);
      }
      currentFile = file;
      extractBtn.disabled = false;
      output.value = '';
      preview.replaceChildren();
      rowsEl.textContent = '0';
      colsEl.textContent = '0';
    };

    extractBtn.onclick = async () => {
      if (!currentFile) return UI.showError('Select a PDF first.');
      UI.setLoading(extractBtn, true, 'Extract Tables');
      try {
        const pdfjsLib = await loadPdfJs();
        const pdf = await pdfjsLib.getDocument({ data: await currentFile.arrayBuffer() }).promise;
        const minCols = Math.max(2, Number(minColsEl.value) || 2);
        const extracted = [];

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const content = await page.getTextContent();
          const pageRows = groupRows(content.items.map(textItem))
            .map(row => rowToCells(row, modeEl.value))
            .filter(row => row.length >= minCols);
          if (pageRows.length) {
            if (extracted.length) extracted.push([]);
            extracted.push([`Page ${pageNum}`]);
            extracted.push(...pageRows);
          }
        }

        const normalized = normalizeRows(extracted);
        const csv = normalized.map(row => row.map(csvEscape).join(',')).join('\n');
        output.value = csv;
        pagesEl.textContent = pdf.numPages.toLocaleString();
        rowsEl.textContent = normalized.filter(row => row.length > 1).length.toLocaleString();
        colsEl.textContent = Math.max(...normalized.map(row => row.length), 0).toLocaleString();
        renderPreview(preview, normalized.filter(row => row.length > 1));
        if (csv) UI.showSuccess('Table-like rows extracted.');
        else UI.showError('No table-like rows found. Try loose spacing or a lower column count.');
      } catch (error) {
        console.error(error);
        UI.showError('Could not extract tables. The PDF may be scanned, encrypted, or damaged.');
      } finally {
        UI.setLoading(extractBtn, false, 'Extract Tables');
      }
    };

    copyBtn.onclick = () => {
      if (!output.value) return UI.showError('Extract a table first.');
      navigator.clipboard.writeText(output.value).then(() => UI.showSuccess('CSV copied.')).catch(() => UI.showError('Copy failed.'));
    };

    downloadBtn.onclick = () => {
      if (!output.value) return UI.showError('Extract a table first.');
      const name = `${(currentFile?.name || 'pdf-table').replace(/\.pdf$/i, '')}-tables.csv`;
      FileHelper.downloadText(name, output.value, 'text/csv');
    };

    clearBtn.onclick = reset;
  },
};
