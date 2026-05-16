import { FileHelper } from '../core/file.js';
import { UI } from '../core/ui.js';

// ── Constants ─────────────────────────────────────────────
const MAX_FILES     = 30;
const MAX_INPUT_MB  = 25;         // input file size cap
const SIZE          = 512;        // sticker canvas size in px
const MAX_BYTES     = 500 * 1024; // 500 KB — matches what WhatsApp sticker apps use in practice
const MIN_QUALITY   = 0.50;
const QUALITY_START = 0.85;
const QUALITY_STEP  = 0.05;

// ── Helpers ───────────────────────────────────────────────
function fmtBytes(bytes) {
  if (!bytes) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

function defaultEdits() {
  return {
    zoom: 1,            // 0.5 – 2.0 (maps to slider 50 – 200)
    offsetX: 0,         // canvas-space pixel offset
    offsetY: 0,
    brightness: 0,      // -100 – +100
    contrast: 0,        // -100 – +100
    flipH: false,
    flipV: false,
    border: false,
    borderColor: '#ffffff',
    borderWidth: 4,     // px
  };
}

// ── Core draw — works on any 512×512 canvas context ──────
function drawSticker(canvas, ctx, image, edits) {
  canvas.width  = SIZE;
  canvas.height = SIZE;
  ctx.clearRect(0, 0, SIZE, SIZE);

  ctx.save();

  // Brightness / contrast via ctx.filter (gracefully ignored on unsupported browsers)
  const bf = Math.max(0, 1 + edits.brightness / 100);
  const cf = Math.max(0, 1 + edits.contrast   / 100);
  ctx.filter = `brightness(${bf}) contrast(${cf})`;

  // Flip around canvas centre
  ctx.translate(SIZE / 2, SIZE / 2);
  if (edits.flipH) ctx.scale(-1,  1);
  if (edits.flipV) ctx.scale( 1, -1);
  ctx.translate(-SIZE / 2, -SIZE / 2);

  // Contain-fit, then zoom + offset
  const base  = Math.min(SIZE / image.width, SIZE / image.height);
  const sc    = base * edits.zoom;
  const w     = image.width  * sc;
  const h     = image.height * sc;
  const dx    = (SIZE - w) / 2 + edits.offsetX;
  const dy    = (SIZE - h) / 2 + edits.offsetY;
  ctx.drawImage(image, dx, dy, w, h);

  ctx.restore(); // removes filter + flip transforms

  // Border — drawn after restore so it's always at canvas edges regardless of flip
  if (edits.border) {
    const bw = edits.borderWidth;
    ctx.fillStyle = edits.borderColor;
    ctx.fillRect(0,        0,         SIZE, bw);          // top
    ctx.fillRect(0,        SIZE - bw,  SIZE, bw);          // bottom
    ctx.fillRect(0,        bw,        bw,   SIZE - bw * 2); // left
    ctx.fillRect(SIZE - bw, bw,       bw,   SIZE - bw * 2); // right
  }
}

// ── Tool ──────────────────────────────────────────────────
export default {
  init() {

    // ── DOM refs — main UI ────────────────────────────────
    const upload         = document.getElementById('ws-upload');
    const btnConvert     = document.getElementById('ws-convert');
    const btnClear       = document.getElementById('ws-clear');
    const btnDownload    = document.getElementById('ws-download-all');
    const fileCountEl    = document.getElementById('ws-file-count');
    const readyCountEl   = document.getElementById('ws-ready-count');
    const stickerCountEl = document.getElementById('ws-sticker-count');
    const emptyEl        = document.getElementById('ws-empty');
    const listEl         = document.getElementById('ws-list');
    const gridEl         = document.getElementById('ws-grid');
    const previewPanel   = document.getElementById('ws-preview-panel');
    const mainCanvas     = document.getElementById('ws-canvas');
    const mainCtx        = mainCanvas.getContext('2d');

    // ── DOM refs — editor modal ───────────────────────────
    const modalOverlay    = document.getElementById('ws-modal-overlay');
    const modalTitle      = document.getElementById('ws-modal-title');
    const editorCanvas    = document.getElementById('ws-editor-canvas');
    const editorCtx       = editorCanvas.getContext('2d');
    const btnModalClose   = document.getElementById('ws-modal-close');
    const btnModalReset   = document.getElementById('ws-modal-reset');
    const btnModalApply   = document.getElementById('ws-modal-apply');
    const zoomInput       = document.getElementById('ws-zoom');
    const zoomVal         = document.getElementById('ws-zoom-val');
    const brightnessInput = document.getElementById('ws-brightness');
    const brightnessVal   = document.getElementById('ws-brightness-val');
    const contrastInput   = document.getElementById('ws-contrast');
    const contrastVal     = document.getElementById('ws-contrast-val');
    const flipHBtn        = document.getElementById('ws-flip-h');
    const flipVBtn        = document.getElementById('ws-flip-v');
    const borderOnInput   = document.getElementById('ws-border-on');
    const borderColorInput = document.getElementById('ws-border-color');
    const borderWidthInput = document.getElementById('ws-border-width');
    const borderWidthVal  = document.getElementById('ws-border-width-val');

    // ── State ─────────────────────────────────────────────
    // items: { file, previewUrl, _image, edits, output:{blob,url,name}|null, error }
    let items = [];
    let editorItem  = null;  // item currently open in editor
    let editorEdits = null;  // working-copy edits while editing
    let isDragging  = false;
    let dragStart        = { x: 0, y: 0 };
    let dragStartOffset  = { x: 0, y: 0 };

    // ── Sticker render (uses main offscreen canvas) ───────

    const canvasToWebP = (q) => new Promise((resolve, reject) => {
      mainCanvas.toBlob(
        (b) => b ? resolve(b) : reject(new Error('Canvas conversion failed.')),
        'image/webp', q,
      );
    });

    const renderSticker = async (item) => {
      if (!item._image) item._image = await FileHelper.loadImage(item.file);
      drawSticker(mainCanvas, mainCtx, item._image, item.edits);

      let q    = QUALITY_START;
      let blob = await canvasToWebP(q);
      while (blob.size > MAX_BYTES && q > MIN_QUALITY) {
        q = Math.round((q - QUALITY_STEP) * 100) / 100;
        q = Math.max(MIN_QUALITY, q);
        blob = await canvasToWebP(q);
      }
      if (blob.size > MAX_BYTES) {
        throw new Error('Image too large to convert — try a simpler image or crop tighter.');
      }
      return blob;
    };

    // ── Editor preview ────────────────────────────────────

    const redrawEditor = () => {
      if (!editorItem?._image || !editorEdits) return;
      drawSticker(editorCanvas, editorCtx, editorItem._image, editorEdits);
    };

    const syncControls = (edits) => {
      const pct = Math.round(edits.zoom * 100);
      zoomInput.value       = pct;
      zoomVal.textContent   = `${pct}%`;
      brightnessInput.value = edits.brightness;
      brightnessVal.textContent = String(edits.brightness);
      contrastInput.value   = edits.contrast;
      contrastVal.textContent = String(edits.contrast);
      borderOnInput.checked = edits.border;
      borderColorInput.value = edits.borderColor;
      borderWidthInput.value = edits.borderWidth;
      borderWidthVal.textContent = `${edits.borderWidth}px`;
      setFlipActive(flipHBtn, edits.flipH);
      setFlipActive(flipVBtn, edits.flipV);
    };

    const setFlipActive = (btn, active) => {
      btn.style.background   = active ? 'var(--accent)' : '';
      btn.style.color        = active ? '#fff' : '';
      btn.style.borderColor  = active ? 'var(--accent)' : '';
    };

    const openEditor = async (item) => {
      editorItem  = item;
      editorEdits = { ...item.edits };
      modalTitle.textContent = item.file.name;
      modalOverlay.classList.remove('hidden');
      document.body.style.overflow = 'hidden';

      if (!item._image) {
        try {
          item._image = await FileHelper.loadImage(item.file);
        } catch (err) {
          closeEditor();
          UI.showError(err.message);
          return;
        }
      }

      syncControls(editorEdits);
      redrawEditor();
    };

    const closeEditor = () => {
      modalOverlay.classList.add('hidden');
      document.body.style.overflow = '';
      editorItem  = null;
      editorEdits = null;
      isDragging  = false;
    };

    const applyEdits = async () => {
      if (!editorItem) return;
      editorItem.edits = { ...editorEdits };
      UI.setLoading(btnModalApply, true, 'Apply');
      try {
        if (editorItem.output?.url) URL.revokeObjectURL(editorItem.output.url);
        const blob = await renderSticker(editorItem);
        const url  = URL.createObjectURL(blob);
        const name = editorItem.file.name.replace(/\.[^/.]+$/, '') + '.webp';
        editorItem.output = { blob, url, name };
        editorItem.error  = '';
        renderList();
        renderGrid();
        UI.showSuccess('Sticker updated.');
      } catch (err) {
        UI.showError(err.message || 'Could not apply edits.');
      } finally {
        UI.setLoading(btnModalApply, false, 'Apply');
      }
      closeEditor();
    };

    // ── Editor control wiring ─────────────────────────────

    zoomInput.oninput = () => {
      editorEdits.zoom = Number(zoomInput.value) / 100;
      zoomVal.textContent = `${zoomInput.value}%`;
      redrawEditor();
    };

    brightnessInput.oninput = () => {
      editorEdits.brightness = Number(brightnessInput.value);
      brightnessVal.textContent = String(editorEdits.brightness);
      redrawEditor();
    };

    contrastInput.oninput = () => {
      editorEdits.contrast = Number(contrastInput.value);
      contrastVal.textContent = String(editorEdits.contrast);
      redrawEditor();
    };

    flipHBtn.onclick = () => {
      editorEdits.flipH = !editorEdits.flipH;
      setFlipActive(flipHBtn, editorEdits.flipH);
      redrawEditor();
    };

    flipVBtn.onclick = () => {
      editorEdits.flipV = !editorEdits.flipV;
      setFlipActive(flipVBtn, editorEdits.flipV);
      redrawEditor();
    };

    borderOnInput.onchange = () => {
      editorEdits.border = borderOnInput.checked;
      redrawEditor();
    };

    borderColorInput.oninput = () => {
      editorEdits.borderColor = borderColorInput.value;
      if (editorEdits.border) redrawEditor();
    };

    borderWidthInput.oninput = () => {
      editorEdits.borderWidth = Number(borderWidthInput.value);
      borderWidthVal.textContent = `${editorEdits.borderWidth}px`;
      if (editorEdits.border) redrawEditor();
    };

    btnModalReset.onclick = () => {
      editorEdits = defaultEdits();
      syncControls(editorEdits);
      redrawEditor();
    };

    btnModalApply.onclick = applyEdits;
    btnModalClose.onclick = closeEditor;

    // Close on backdrop click
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeEditor();
    });

    // ── Drag to reposition ────────────────────────────────

    const startDrag = (clientX, clientY) => {
      isDragging = true;
      dragStart  = { x: clientX, y: clientY };
      dragStartOffset = { x: editorEdits.offsetX, y: editorEdits.offsetY };
      editorCanvas.style.cursor = 'grabbing';
    };

    const moveDrag = (clientX, clientY) => {
      if (!isDragging || !editorEdits) return;
      const rect   = editorCanvas.getBoundingClientRect();
      const scaleX = SIZE / rect.width;
      const scaleY = SIZE / rect.height;
      editorEdits.offsetX = dragStartOffset.x + (clientX - dragStart.x) * scaleX;
      editorEdits.offsetY = dragStartOffset.y + (clientY - dragStart.y) * scaleY;
      redrawEditor();
    };

    const endDrag = () => {
      isDragging = false;
      editorCanvas.style.cursor = 'grab';
    };

    // Mouse — mousemove/mouseup on document so drag continues outside canvas bounds
    editorCanvas.addEventListener('mousedown', (e) => {
      e.preventDefault();
      startDrag(e.clientX, e.clientY);
      const onMove = (e) => moveDrag(e.clientX, e.clientY);
      const onUp   = ()  => {
        endDrag();
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup',   onUp);
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup',   onUp);
    });

    // Touch — touchmove/touchend on document so drag continues outside canvas bounds
    editorCanvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      startDrag(e.touches[0].clientX, e.touches[0].clientY);
      const onMove = (e) => { e.preventDefault(); moveDrag(e.touches[0].clientX, e.touches[0].clientY); };
      const onEnd  = ()  => {
        endDrag();
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend',  onEnd);
        document.removeEventListener('touchcancel', onEnd);
      };
      document.addEventListener('touchmove',   onMove, { passive: false });
      document.addEventListener('touchend',    onEnd);
      document.addEventListener('touchcancel', onEnd);
    }, { passive: false });

    // ── Upload queue rendering ────────────────────────────

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

        const thumb = document.createElement('img');
        thumb.src    = item.previewUrl;
        thumb.alt    = '';
        thumb.width  = 48;
        thumb.height = 48;
        thumb.style.cssText = 'object-fit:cover;border-radius:4px;flex-shrink:0';

        const meta   = document.createElement('div');
        meta.className = 'image-row-meta';
        const title  = document.createElement('strong');
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

        const actions  = document.createElement('div');
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

        row.append(thumb, meta, actions);
        listEl.appendChild(row);
      }

      updateSummary();
    };

    // ── Preview grid (with edit/download overlay) ─────────

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

        const img  = document.createElement('img');
        img.src    = item.output.url;
        img.alt    = item.file.name;
        img.width  = 128;
        img.height = 128;

        // Hover overlay — Edit + Download buttons
        const overlay = document.createElement('div');
        overlay.className = 'ws-sticker-overlay';

        const editBtn = document.createElement('button');
        editBtn.className   = 'btn ws-overlay-btn';
        editBtn.textContent = 'Edit';
        editBtn.onclick = (e) => { e.stopPropagation(); openEditor(item); };

        const dlBtn = document.createElement('button');
        dlBtn.className   = 'btn btn-secondary ws-overlay-btn';
        dlBtn.textContent = '↓';
        dlBtn.title       = `Download ${item.output.name}`;
        dlBtn.onclick = (e) => {
          e.stopPropagation();
          FileHelper.downloadBlob(item.output.name, item.output.blob);
        };

        overlay.append(editBtn, dlBtn);

        const badge = document.createElement('span');
        badge.className   = 'ws-size-badge';
        badge.textContent = fmtBytes(item.output.blob.size);

        wrapper.append(img, overlay, badge);
        gridEl.appendChild(wrapper);
      }
    };

    // ── Main actions ──────────────────────────────────────

    const clearItems = () => {
      closeEditor();
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
      if (raw.length > MAX_FILES) UI.showError(`Only the first ${MAX_FILES} images were added.`);

      clearItems();
      for (const file of selected) {
        if (file.size > MAX_INPUT_MB * 1024 * 1024) {
          UI.showError(`${file.name}: File too large — please use an image under 25 MB.`);
          continue;
        }
        const v = FileHelper.validateImage(file, MAX_INPUT_MB);
        if (!v.ok) { UI.showError(`${file.name}: ${v.error}`); continue; }
        items.push({
          file,
          previewUrl: URL.createObjectURL(file),
          _image: null,
          edits: defaultEdits(),
          output: null,
          error: '',
        });
      }
      renderList();
      renderGrid();
    };

    btnConvert.onclick = async () => {
      if (!items.length) return UI.showError('Select one or more images first.');
      UI.setLoading(btnConvert, true, 'Convert to Stickers');

      for (const item of items) {
        if (item.output?.url) URL.revokeObjectURL(item.output.url);
        item.output = null;
        item.error  = '';
      }

      let ok = 0;
      for (const item of items) {
        try {
          const blob = await renderSticker(item);
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
      if (ok) UI.showSuccess(`${ok} sticker${ok !== 1 ? 's' : ''} ready. Click Edit to adjust any sticker.`);
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
