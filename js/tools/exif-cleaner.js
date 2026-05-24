import { FileHelper } from '../core/file.js';
import { UI } from '../core/ui.js';

const TAGS = {
  0x010f: 'Camera make',
  0x0110: 'Camera model',
  0x0131: 'Software',
  0x0132: 'Modified',
  0x829a: 'Exposure time',
  0x829d: 'F number',
  0x8827: 'ISO',
  0x9003: 'Taken',
  0x9209: 'Flash',
  0xa002: 'Width',
  0xa003: 'Height',
};

function formatBytes(bytes) {
  if (!bytes) return '0 KB';
  const units = ['B', 'KB', 'MB'];
  let value = bytes;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index++;
  }
  return `${value.toFixed(index ? 1 : 0)} ${units[index]}`;
}

function readAscii(view, offset, count) {
  const chars = [];
  for (let i = 0; i < count; i++) {
    const code = view.getUint8(offset + i);
    if (code) chars.push(String.fromCharCode(code));
  }
  return chars.join('').trim();
}

function parseExif(buffer) {
  const view = new DataView(buffer);
  if (view.getUint16(0) !== 0xffd8) return [];
  let offset = 2;
  while (offset < view.byteLength) {
    if (view.getUint8(offset) !== 0xff) break;
    const marker = view.getUint8(offset + 1);
    const length = view.getUint16(offset + 2);
    if (marker === 0xe1 && readAscii(view, offset + 4, 6) === 'Exif') {
      const tiff = offset + 10;
      const little = readAscii(view, tiff, 2) === 'II';
      const ifd = tiff + view.getUint32(tiff + 4, little);
      const count = view.getUint16(ifd, little);
      const rows = [];
      for (let i = 0; i < count; i++) {
        const entry = ifd + 2 + i * 12;
        const tag = view.getUint16(entry, little);
        const type = view.getUint16(entry + 2, little);
        const size = view.getUint32(entry + 4, little);
        const valueOffset = entry + 8;
        const label = TAGS[tag];
        if (!label) continue;
        let value = '';
        if (type === 2) {
          const ptr = size <= 4 ? valueOffset : tiff + view.getUint32(valueOffset, little);
          value = readAscii(view, ptr, size);
        } else if (type === 3) {
          value = String(view.getUint16(valueOffset, little));
        } else if (type === 4) {
          value = String(view.getUint32(valueOffset, little));
        }
        if (value) rows.push([label, value]);
      }
      return rows;
    }
    offset += 2 + length;
  }
  return [];
}

function renderRows(container, rows) {
  container.replaceChildren();
  if (!rows.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = 'No readable EXIF metadata found.';
    container.appendChild(empty);
    return;
  }
  rows.forEach(([key, value]) => {
    const row = document.createElement('div');
    row.className = 'seo-result-row';
    const name = document.createElement('strong');
    name.textContent = key;
    const val = document.createElement('span');
    val.textContent = value;
    row.append(name, val);
    container.appendChild(row);
  });
}

export default {
  init() {
    const upload = document.getElementById('exif-upload');
    const list = document.getElementById('exif-list');
    const typeEl = document.getElementById('exif-file-type');
    const sizeEl = document.getElementById('exif-file-size');
    const countEl = document.getElementById('exif-meta-count');
    const download = document.getElementById('btn-exif-download');
    const canvas = document.getElementById('exif-canvas');
    const ctx = canvas.getContext('2d');
    let cleanBlob = null;
    let cleanName = 'clean-image.png';

    upload.onchange = async () => {
      const file = upload.files?.[0];
      cleanBlob = null;
      download.disabled = true;
      if (!file) return;
      const valid = FileHelper.validateImage(file);
      if (!valid.ok) return UI.showError(valid.error);

      typeEl.textContent = (file.type || file.name.split('.').pop() || 'image').replace('image/', '').toUpperCase();
      sizeEl.textContent = formatBytes(file.size);
      const buffer = await file.arrayBuffer();
      const rows = parseExif(buffer);
      countEl.textContent = rows.length.toLocaleString();
      renderRows(list, rows);

      try {
        const image = await FileHelper.loadImage(file);
        canvas.width = image.width;
        canvas.height = image.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0);
        cleanBlob = await new Promise((resolve, reject) => {
          canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Could not clean image.')), 'image/png');
        });
        cleanName = `${file.name.replace(/\.[^/.]+$/, '')}-clean.png`;
        download.disabled = false;
        if (image.close) image.close();
      } catch (err) {
        console.error(err);
        UI.showError('Could not render a clean copy in this browser.');
      }
    };

    download.onclick = () => {
      if (!cleanBlob) return UI.showError('Select an image first.');
      FileHelper.downloadBlob(cleanName, cleanBlob);
    };
  },
};
