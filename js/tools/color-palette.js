import { FileHelper } from '../core/file.js';
import { UI } from '../core/ui.js';

// ── Palette extraction ────────────────────────────────────────────────────
// Algorithm:
//   1. Draw the image scaled to ≤200×200 on an offscreen canvas.
//   2. Read every pixel via getImageData().
//   3. Quantise each channel to the nearest 32 (8 buckets per channel → 512 max keys).
//   4. Tally pixel counts per bucket key.
//   5. Sort buckets by count descending; take top 6.
//   6. For each top bucket, compute the actual average RGB of its member pixels
//      (not the bucket centroid) for more faithful colours.

const MAX_DIM    = 200; // max canvas side before downscaling
const BUCKETS    = 6;
const QUANT_STEP = 32;  // 256 / 32 = 8 levels per channel → 8³ = 512 buckets

function extractPalette(imageSource) {
  // Draw scaled-down copy to offscreen canvas
  const scale  = Math.min(1, MAX_DIM / Math.max(imageSource.width, imageSource.height));
  const width  = Math.max(1, Math.round(imageSource.width  * scale));
  const height = Math.max(1, Math.round(imageSource.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width  = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(imageSource, 0, 0, width, height);

  const { data } = ctx.getImageData(0, 0, width, height);

  // Bucket accumulation: key → { count, rSum, gSum, bSum }
  const buckets = new Map();
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a < 128) continue; // skip mostly-transparent pixels

    const r = data[i], g = data[i + 1], b = data[i + 2];
    // Quantise: round each channel to the nearest bucket boundary
    const qr = Math.round(r / QUANT_STEP) * QUANT_STEP;
    const qg = Math.round(g / QUANT_STEP) * QUANT_STEP;
    const qb = Math.round(b / QUANT_STEP) * QUANT_STEP;
    const key = (qr << 16) | (qg << 8) | qb;

    const bucket = buckets.get(key);
    if (bucket) {
      bucket.count++;
      bucket.rSum += r;
      bucket.gSum += g;
      bucket.bSum += b;
    } else {
      buckets.set(key, { count: 1, rSum: r, gSum: g, bSum: b });
    }
  }

  // Sort by pixel count, take top N, compute per-bucket average
  return [...buckets.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, BUCKETS)
    .map(({ count, rSum, gSum, bSum }) => ({
      r: Math.round(rSum / count),
      g: Math.round(gSum / count),
      b: Math.round(bSum / count),
    }));
}

// ── Colour formatting ─────────────────────────────────────────────────────
function toHex(r, g, b) {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

function toRgb(r, g, b) {
  return `rgb(${r}, ${g}, ${b})`;
}

// ── Tool ──────────────────────────────────────────────────────────────────
export default {
  init() {
    const uploadEl   = document.getElementById('cp2-upload');
    const previewWrap = document.getElementById('cp2-preview-wrap');
    const previewImg = document.getElementById('cp2-preview');
    const emptyEl    = document.getElementById('cp2-empty');
    const resultsEl  = document.getElementById('cp2-results');
    const swatchesEl = document.getElementById('cp2-swatches');
    const copyAllBtn = document.getElementById('cp2-copy-all');
    const clearBtn   = document.getElementById('cp2-clear');

    let palette = []; // current [{r, g, b}]

    function showResults(colors) {
      palette = colors;
      emptyEl.classList.add('hidden');
      resultsEl.classList.remove('hidden');

      swatchesEl.replaceChildren();
      for (const { r, g, b } of colors) {
        const hex = toHex(r, g, b);
        const rgb = toRgb(r, g, b);

        const swatch = document.createElement('button');
        swatch.className = 'cp2-swatch';
        swatch.title = `Copy ${hex}`;
        swatch.setAttribute('aria-label', `Copy colour ${hex}`);
        swatch.innerHTML = `
          <span class="cp2-swatch-color" style="background:${hex}"></span>
          <span class="cp2-swatch-hex">${hex}</span>
          <span class="cp2-swatch-rgb">${rgb}</span>`;
        swatch.addEventListener('click', () => {
          navigator.clipboard.writeText(hex)
            .then(() => UI.showToast(`Copied ${hex}`, 'success'))
            .catch(() => UI.showError('Copy failed.'));
        });
        swatchesEl.appendChild(swatch);
      }
    }

    function reset() {
      palette = [];
      previewWrap.classList.add('hidden');
      previewImg.src = '';
      emptyEl.classList.remove('hidden');
      resultsEl.classList.add('hidden');
      swatchesEl.replaceChildren();
    }

    uploadEl.addEventListener('change', async () => {
      const file = uploadEl.files[0];
      if (!file) { reset(); return; }

      const v = FileHelper.validateImage(file);
      if (!v.ok) { UI.showError(v.error); uploadEl.closest('.drop-zone')?._reset?.(); return; }

      try {
        const image = await FileHelper.loadImage(file);

        // Show thumbnail preview
        const objUrl = URL.createObjectURL(file);
        previewImg.src = objUrl;
        previewImg.onload = () => URL.revokeObjectURL(objUrl);
        previewWrap.classList.remove('hidden');

        const colors = extractPalette(image);
        showResults(colors);
      } catch (err) {
        UI.showError(err.message || 'Could not process image.');
        uploadEl.closest('.drop-zone')?._reset?.();
        reset();
      }
    });

    copyAllBtn.addEventListener('click', () => {
      if (!palette.length) return;
      const css = palette.map(({ r, g, b }, i) => `--color-${i + 1}: ${toHex(r, g, b)};`).join('\n');
      navigator.clipboard.writeText(css)
        .then(() => UI.showToast('Copied CSS variables!', 'success'))
        .catch(() => UI.showError('Copy failed.'));
    });

    clearBtn.addEventListener('click', () => {
      uploadEl.closest('.drop-zone')?._reset?.();
      uploadEl.dispatchEvent(new Event('change'));
    });
  }
};
