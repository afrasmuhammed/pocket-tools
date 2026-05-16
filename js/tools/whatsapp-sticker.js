import { FileHelper } from '../core/file.js';
import { UI } from '../core/ui.js';

const MAX_FILES   = 30;
const SIZE        = 512;          // sticker dimensions in px
const MAX_BYTES   = 100 * 1024;   // 100 KB WhatsApp limit
const MIN_QUALITY = 0.50;
const QUALITY_START = 0.85;
const QUALITY_STEP  = 0.05;

function fmtBytes(bytes) {
  if (!bytes) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

export default {
  init() {
    const upload       = document.getElementById('ws-upload');
    const btnConvert   = document.getElementById('ws-convert');
    const btnClear     = document.getElementById('ws-clear');
    const btnDownload  = document.getElementById('ws-download-all');
    const fileCountEl  = document.getElementById('ws-file-count');
    const readyCountEl = document.getElementById('ws-ready-count');
    const stickerCountEl = document.getElementById('ws-sticker-count');
    const emptyEl      = document.getElementById('ws-empty');
    const listEl       = document.getElementById('ws-list');
    const gridEl       = document.getElementById('ws-grid');
    const previewPanel = document.getElementById('ws-preview-panel');
    const canvas       = document.getElementById('ws-canvas');
    const ctx          = canvas.getContext('2d');

    let items = []; // { file, previewUrl, output: {blob,url,name} | null, error }

    // ── Canvas helpers ────────────────────────────────────

    const canvasToWebP = (quality) => new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error('Canvas conversion failed.')),
        'image/webp',
        quality,
      );
    });

    // Draw image contained within 512×512 with transparent padding, then
    // iterate quality down until the blob fits under 100 KB.
    const makeSticker = async (file) => {
      const image = await FileHelper.loadImage(file);

      canvas.width  = SIZE;
      canvas.height = SIZE;
      ctx.clearRect(0, 0, SIZE, SIZE);

      // Contain: scale to fit, center, transparent letterbox/pillarbox
      const scale = Math.min(SIZE / image.width, SIZE / image.height);
      const w  = Math.round(image.width  * scale);
      const h  = Math.round(image.height * scale);
      const dx = Math.round((SIZE - w) / 2);
      const dy = Math.round((SIZE - h) / 2);
      ctx.drawImage(image, dx, dy, w, h);
      if (image.close) image.close();

      // Quality reduction loop
      let q    = QUALITY_START;
      let blob = await canvasToWebP(q);
      while (blob.size > MAX_BYTES && q > MIN_QUALITY) {
        q = Math.round((q - QUALITY_STEP) * 100) / 100;
        q = Math.max(MIN_QUALITY, q);
        blob = await canvasToWebP(q);
      }

      if (blob.size > MAX_BYTES) {
        throw new Error(
          `Still ${fmtBytes(blob.size)} at minimum quality — image too complex to compress under 100 KB.`,
        );
      }

      return blob;
    };

    // ── UI rendering ──────────────────────────────────────

    const updateSummary = () => {
      fileCountEl.textContent  = String(items.length);
      readyCountEl.textContent = String(items.filter(i => i.output).length);
      emptyEl.classList.toggle('hidden', items.length > 0);
    };

    const renderList = () => {
      listEl.replaceChildren();

      for (const item of items) {
        const row = document.createElement('article');
        row.className = 'image-row';

        const img = document.createElement('img');
        img.src    = item.previewUrl;
        img.alt    = '';
        img.width  = 48;
        img.height = 48;
        img.style.cssText = 'object-fit:cover;border-radius:4px;flex-shrink:0';

        const meta = document.createElement('div');
        meta.className = 'image-row-meta';

        const title = document.createElement('strong');
        title.textContent = item.file.name;

        const status = document.createElement('span');
        if (item.error) {
          status.className   = 'status-error';
          status.textContent = item.error;
        } else if (item.output) {
          status.textContent = `✓ ${fmtBytes(item.output.blob.size)} · WebP 512×512`;
        } else {
          status.textContent = `${fmtBytes(item.file.size)} · waiting`;
        }

        meta.append(title, status);

        const actions = document.createElement('div');
        actions.className = 'image-row-actions';

        const removeBtn = document.createElement('button');
        removeBtn.className   = 'btn btn-secondary';
        removeBtn.textContent = 'Remove';
        removeBtn.onclick = () => {
          URL.revokeObjectURL(item.previewUrl);
          if (item.output?.url) URL.revokeObjectURL(item.output.url);
          items = items.filter(i => i !== item);
          renderList();
          renderGrid();
          updateSummary();
        };
        actions.appendChild(removeBtn);

        row.append(img, meta, actions);
        listEl.appendChild(row);
      }

      updateSummary();
    };

    const renderGrid = () => {
      const done = items.filter(i => i.output);
      gridEl.replaceChildren();
      previewPanel.classList.toggle('hidden', done.length === 0);
      btnDownload.disabled = done.length === 0;

      if (!done.length) return;

      stickerCountEl.textContent = `(${done.length})`;

      for (const item of done) {
        const wrapper = document.createElement('div');
        wrapper.className = 'ws-sticker-item';
        wrapper.setAttribute('role', 'button');
        wrapper.setAttribute('tabindex', '0');
        wrapper.title = `Download ${item.output.name}`;

        const img  = document.createElement('img');
        img.src    = item.output.url;
        img.alt    = item.file.name;
        img.width  = 128;
        img.height = 128;

        const badge = document.createElement('span');
        badge.className   = 'ws-size-badge';
        badge.textContent = fmtBytes(item.output.blob.size);

        wrapper.append(img, badge);
        wrapper.onclick = () => FileHelper.downloadBlob(item.output.name, item.output.blob);
        wrapper.onkeydown = (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            FileHelper.downloadBlob(item.output.name, item.output.blob);
          }
        };
        gridEl.appendChild(wrapper);
      }
    };

    // ── Actions ───────────────────────────────────────────

    const clearItems = () => {
      for (const item of items) {
        URL.revokeObjectURL(item.previewUrl);
        if (item.output?.url) URL.revokeObjectURL(item.output.url);
      }
      items = [];
      upload.value = '';
      upload.closest('.drop-zone')?._reset?.();
      renderList();
      renderGrid();
    };

    upload.onchange = (e) => {
      const raw      = Array.from(e.target.files || []);
      const selected = raw.slice(0, MAX_FILES);
      if (!selected.length) { clearItems(); return; }
      if (raw.length > MAX_FILES) {
        UI.showError(`Only the first ${MAX_FILES} images were added.`);
      }

      clearItems();

      for (const file of selected) {
        const v = FileHelper.validateImage(file);
        if (!v.ok) { UI.showError(`${file.name}: ${v.error}`); continue; }
        items.push({ file, previewUrl: URL.createObjectURL(file), output: null, error: '' });
      }

      renderList();
      renderGrid();
    };

    btnConvert.onclick = async () => {
      if (!items.length) return UI.showError('Select one or more images first.');

      UI.setLoading(btnConvert, true, 'Convert to Stickers');

      // Reset previous results
      for (const item of items) {
        if (item.output?.url) URL.revokeObjectURL(item.output.url);
        item.output = null;
        item.error  = '';
      }

      let ok = 0;
      for (const item of items) {
        try {
          const blob = await makeSticker(item.file);
          const url  = URL.createObjectURL(blob);
          const name = item.file.name.replace(/\.[^/.]+$/, '') + '.webp';
          item.output = { blob, url, name };
          ok++;
        } catch (err) {
          item.error = err.message || 'Could not process this image.';
        }
      }

      renderList();
      renderGrid();
      UI.setLoading(btnConvert, false, 'Convert to Stickers');

      if (ok)              UI.showSuccess(`${ok} sticker${ok !== 1 ? 's' : ''} ready.`);
      if (ok < items.length) UI.showError(`${items.length - ok} image${items.length - ok !== 1 ? 's' : ''} could not be converted.`);
    };

    btnDownload.onclick = async () => {
      const ready = items.filter(i => i.output);
      if (!ready.length) return;

      UI.setLoading(btnDownload, true, 'Download ZIP');
      try {
        await FileHelper.downloadZip('stickers.zip', ready.map((item, idx) => ({
          name: `sticker-${String(idx + 1).padStart(2, '0')}.webp`,
          blob: item.output.blob,
        })));
      } catch {
        UI.showError('Could not create ZIP file.');
      } finally {
        UI.setLoading(btnDownload, false, 'Download ZIP');
      }
    };

    btnClear.onclick = clearItems;

    updateSummary();
  },
};
