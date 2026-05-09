import { UI } from '../core/ui.js';

export default {
  init() {
    const upload   = document.getElementById('bw-upload');
    const result   = document.getElementById('bw-result');
    const canvas   = document.getElementById('bw-canvas');
    const btnDown  = document.getElementById('bw-download');
    const fileLabel = document.getElementById('bw-filename');
    const ctx      = canvas.getContext('2d');

    let baseName = 'image';

    const processFile = (file) => {
      if (!file) return;

      // Basic size check
      if (file.size > 10 * 1024 * 1024) {
        return UI.showError('Image too large — max 10 MB.');
      }

      baseName = file.name.replace(/\.[^/.]+$/, '');
      if (fileLabel) fileLabel.textContent = file.name;

      const url = URL.createObjectURL(file);
      const img = new Image();

      img.onload = () => {
        URL.revokeObjectURL(url);

        canvas.width  = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const d = imageData.data;

        for (let i = 0; i < d.length; i += 4) {
          const lum = d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114;
          d[i] = d[i + 1] = d[i + 2] = lum;
        }

        ctx.putImageData(imageData, 0, 0);
        result.classList.remove('hidden');
        result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        UI.showSuccess('Converted to black & white!');
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        UI.showError('Could not load this image. Try a JPG or PNG.');
      };

      img.src = url;
    };

    upload.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) {
        // Cleared — hide result panel and reset state
        result.classList.add('hidden');
        canvas.width = 0;
        baseName = 'image';
        return;
      }
      processFile(file);
      upload.value = ''; // allow re-selecting the same file
    });

    // Drag-and-drop support
    const drop = document.getElementById('bw-drop');
    if (drop) {
      drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.style.borderColor = 'var(--accent)'; });
      drop.addEventListener('dragleave', () => { drop.style.borderColor = ''; });
      drop.addEventListener('drop', (e) => {
        e.preventDefault();
        drop.style.borderColor = '';
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) processFile(file);
        else UI.showError('Please drop an image file.');
      });
    }

    btnDown.addEventListener('click', () => {
      if (!canvas.width) return;
      canvas.toBlob((blob) => {
        if (!blob) return UI.showError('Could not create download.');
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${baseName}-bw.jpg`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 1500);
      }, 'image/jpeg', 0.92);
    });
  }
};
