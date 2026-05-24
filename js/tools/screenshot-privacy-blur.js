import { FileHelper } from '../core/file.js';
import { UI } from '../core/ui.js';

const MAX_SIDE = 1800;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizeRect(a, b, width, height, style, strength) {
  const x1 = clamp(Math.min(a.x, b.x), 0, width);
  const y1 = clamp(Math.min(a.y, b.y), 0, height);
  const x2 = clamp(Math.max(a.x, b.x), 0, width);
  const y2 = clamp(Math.max(a.y, b.y), 0, height);
  return { x: x1, y: y1, w: x2 - x1, h: y2 - y1, style, strength };
}

function pixelate(ctx, box, size) {
  const data = ctx.getImageData(box.x, box.y, box.w, box.h);
  const pixels = data.data;
  const block = Math.max(4, Math.round(size));
  for (let y = 0; y < box.h; y += block) {
    for (let x = 0; x < box.w; x += block) {
      const i = (y * box.w + x) * 4;
      const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2], a = pixels[i + 3];
      for (let yy = y; yy < Math.min(y + block, box.h); yy++) {
        for (let xx = x; xx < Math.min(x + block, box.w); xx++) {
          const t = (yy * box.w + xx) * 4;
          pixels[t] = r; pixels[t + 1] = g; pixels[t + 2] = b; pixels[t + 3] = a;
        }
      }
    }
  }
  ctx.putImageData(data, box.x, box.y);
}

function blurBox(ctx, sourceCanvas, box) {
  const pad = Math.ceil(box.strength);
  const sx = clamp(box.x - pad, 0, sourceCanvas.width);
  const sy = clamp(box.y - pad, 0, sourceCanvas.height);
  const sw = clamp(box.w + pad * 2, 1, sourceCanvas.width - sx);
  const sh = clamp(box.h + pad * 2, 1, sourceCanvas.height - sy);
  ctx.save();
  ctx.beginPath();
  ctx.rect(box.x, box.y, box.w, box.h);
  ctx.clip();
  ctx.filter = `blur(${box.strength}px)`;
  ctx.drawImage(sourceCanvas, sx, sy, sw, sh, sx, sy, sw, sh);
  ctx.restore();
}

function drawBox(ctx, sourceCanvas, box) {
  if (box.style === 'black') {
    ctx.fillStyle = '#050505';
    ctx.fillRect(box.x, box.y, box.w, box.h);
  } else if (box.style === 'pixel') {
    pixelate(ctx, box, box.strength);
  } else {
    blurBox(ctx, sourceCanvas, box);
  }
}

function pointFrom(event, canvas) {
  const rect = canvas.getBoundingClientRect();
  const source = event.touches ? event.touches[0] : event;
  return {
    x: Math.round((source.clientX - rect.left) * (canvas.width / rect.width)),
    y: Math.round((source.clientY - rect.top) * (canvas.height / rect.height)),
  };
}

function addSample(sourceCanvas) {
  sourceCanvas.width = 1200;
  sourceCanvas.height = 760;
  const ctx = sourceCanvas.getContext('2d');
  ctx.fillStyle = '#f7f8fb';
  ctx.fillRect(0, 0, sourceCanvas.width, sourceCanvas.height);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(70, 70, 1060, 620);
  ctx.strokeStyle = '#d9dee8';
  ctx.lineWidth = 2;
  ctx.strokeRect(70, 70, 1060, 620);
  ctx.fillStyle = '#111827';
  ctx.font = '700 34px Inter, Arial, sans-serif';
  ctx.fillText('Account overview', 120, 140);
  ctx.font = '20px Inter, Arial, sans-serif';
  ctx.fillText('alex.carter@example.com', 120, 205);
  ctx.fillText('+1 555 018 2200', 120, 245);
  ctx.fillText('Card ending 4242 4242 4242 4242', 120, 285);
  ctx.fillText('https://internal.example.test/customer/AC-100293', 120, 325);
  ctx.fillStyle = '#e8eef9';
  ctx.fillRect(120, 390, 900, 54);
  ctx.fillRect(120, 462, 780, 54);
  ctx.fillRect(120, 534, 840, 54);
  ctx.fillStyle = '#374151';
  ctx.fillText('Order ID: PK-2026-004812', 150, 424);
  ctx.fillText('Address: 42 Market Street, Suite 8', 150, 496);
  ctx.fillText('Session token: sk_live_sample_redact_me', 150, 568);
}

function autoBoxes(sourceCanvas, style, strength) {
  const ctx = sourceCanvas.getContext('2d');
  const { width, height } = sourceCanvas;
  const data = ctx.getImageData(0, 0, width, height).data;
  const rowHits = [];
  const step = Math.max(2, Math.round(width / 650));

  for (let y = 0; y < height; y += step) {
    let minX = width;
    let maxX = 0;
    let hits = 0;
    for (let x = 0; x < width; x += step) {
      const i = (y * width + x) * 4;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const darkText = max < 120;
      const saturatedText = max - min > 60 && max < 210;
      if (darkText || saturatedText) {
        hits++;
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
      }
    }
    if (hits > 8 && maxX - minX > width * 0.12) rowHits.push({ y, minX, maxX });
  }

  const bands = [];
  rowHits.forEach(hit => {
    const last = bands[bands.length - 1];
    if (last && hit.y - last.y2 < 18) {
      last.y2 = hit.y;
      last.minX = Math.min(last.minX, hit.minX);
      last.maxX = Math.max(last.maxX, hit.maxX);
    } else {
      bands.push({ y1: hit.y, y2: hit.y, minX: hit.minX, maxX: hit.maxX });
    }
  });

  return bands
    .filter(band => band.y2 - band.y1 >= 6 && band.y2 - band.y1 <= 80)
    .map(band => ({
      x: clamp(band.minX - 18, 0, width),
      y: clamp(band.y1 - 10, 0, height),
      w: clamp(band.maxX - band.minX + 36, 8, width),
      h: clamp(band.y2 - band.y1 + 24, 8, height),
      style,
      strength,
    }))
    .filter(box => box.w > 80 && box.h > 14)
    .slice(0, 18);
}

export default {
  init() {
    const upload = document.getElementById('spb-upload');
    const controls = document.getElementById('spb-controls');
    const preview = document.getElementById('spb-preview');
    const canvas = document.getElementById('spb-canvas');
    const ctx = canvas.getContext('2d');
    const styleEl = document.getElementById('spb-style');
    const strengthEl = document.getElementById('spb-strength');
    const strengthLabel = document.getElementById('spb-strength-label');
    const boxCount = document.getElementById('spb-box-count');
    const modeLabel = document.getElementById('spb-mode-label');
    const sourceCanvas = document.createElement('canvas');

    let boxes = [];
    let drawing = false;
    let start = null;
    let current = null;
    let baseName = 'private-screenshot';

    const hasSource = () => sourceCanvas.width > 0 && sourceCanvas.height > 0;
    const showTool = visible => {
      controls.classList.toggle('hidden', !visible);
      preview.classList.toggle('hidden', !visible);
    };
    const updateStats = () => {
      boxCount.textContent = boxes.length.toLocaleString();
      modeLabel.textContent = styleEl.options[styleEl.selectedIndex].text;
      strengthLabel.textContent = strengthEl.value;
    };
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (hasSource()) ctx.drawImage(sourceCanvas, 0, 0);
      boxes.forEach(box => drawBox(ctx, sourceCanvas, box));
      if (current) {
        ctx.save();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = Math.max(2, Math.round(canvas.width / 700));
        ctx.setLineDash([12, 7]);
        ctx.strokeRect(current.x, current.y, current.w, current.h);
        ctx.restore();
      }
      updateStats();
    };

    const setSourceFromImage = async file => {
      const image = await FileHelper.loadImage(file);
      const scale = Math.min(1, MAX_SIDE / Math.max(image.width, image.height));
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);
      sourceCanvas.width = canvas.width;
      sourceCanvas.height = canvas.height;
      sourceCanvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
      if (image.close) image.close();
      boxes = [];
      render();
      showTool(true);
    };

    const loadSample = () => {
      addSample(sourceCanvas);
      canvas.width = sourceCanvas.width;
      canvas.height = sourceCanvas.height;
      baseName = 'sample-privacy';
      boxes = autoBoxes(sourceCanvas, styleEl.value, Number(strengthEl.value));
      render();
      showTool(true);
      UI.showSuccess('Sample loaded with suggested boxes.');
    };

    upload.onchange = async event => {
      const file = event.target.files?.[0];
      if (!file) return;
      const valid = FileHelper.validateImage(file);
      if (!valid.ok) {
        upload.value = '';
        return UI.showError(valid.error);
      }
      baseName = file.name.replace(/\.[^/.]+$/, '') || 'private-screenshot';
      try {
        await setSourceFromImage(file);
      } catch (error) {
        console.error(error);
        UI.showError('Could not load this image.');
      }
    };

    const begin = event => {
      if (!hasSource()) return;
      event.preventDefault();
      drawing = true;
      start = pointFrom(event, canvas);
    };
    const move = event => {
      if (!drawing) return;
      event.preventDefault();
      current = normalizeRect(start, pointFrom(event, canvas), canvas.width, canvas.height, styleEl.value, Number(strengthEl.value));
      render();
    };
    const end = () => {
      if (!drawing) return;
      drawing = false;
      if (current && current.w > 8 && current.h > 8) boxes.push(current);
      current = null;
      render();
    };

    canvas.addEventListener('mousedown', begin);
    canvas.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);
    canvas.addEventListener('touchstart', begin, { passive: false });
    canvas.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('touchend', end);

    styleEl.onchange = () => {
      boxes = boxes.map(box => ({ ...box, style: styleEl.value, strength: Number(strengthEl.value) }));
      render();
    };
    strengthEl.oninput = () => {
      boxes = boxes.map(box => ({ ...box, strength: Number(strengthEl.value) }));
      render();
    };
    document.getElementById('btn-spb-auto').onclick = () => {
      if (!hasSource()) return UI.showError('Select a screenshot first.');
      boxes = autoBoxes(sourceCanvas, styleEl.value, Number(strengthEl.value));
      render();
      if (boxes.length) UI.showSuccess(`${boxes.length} possible text areas marked.`);
      else UI.showError('No obvious text bands found. Draw boxes manually.');
    };
    document.getElementById('btn-spb-sample').onclick = loadSample;
    document.getElementById('btn-spb-undo').onclick = () => { boxes.pop(); render(); };
    document.getElementById('btn-spb-clear').onclick = () => { boxes = []; render(); };
    document.getElementById('btn-spb-download').onclick = () => {
      if (!hasSource()) return UI.showError('Select a screenshot first.');
      canvas.toBlob(blob => {
        if (!blob) return UI.showError('Could not export image.');
        FileHelper.downloadBlob(`${baseName}-private.png`, blob);
      }, 'image/png');
    };

    updateStats();
  },
};
