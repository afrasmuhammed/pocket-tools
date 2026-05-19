import { UI } from '../core/ui.js';
import { FileHelper } from '../core/file.js';
import { loadQpdf } from '../core/lazy.js';

function fmtBytes(bytes) {
  if (!Number.isFinite(bytes)) return '--';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(2)} MB`;
}

function fileStem(name) {
  return String(name || 'document').replace(/\.pdf$/i, '') || 'document';
}

export default {
  async init() {
    const upload = document.getElementById('cpdf-upload');
    const controls = document.getElementById('cpdf-controls');
    const linearizeEl = document.getElementById('cpdf-linearize');
    const metadataEl = document.getElementById('cpdf-metadata');
    const originalEl = document.getElementById('cpdf-original');
    const outputEl = document.getElementById('cpdf-output');
    const savingsEl = document.getElementById('cpdf-savings');
    const btnGen = document.getElementById('cpdf-generate');

    let currentFile = null;

    const resetMetrics = () => {
      originalEl.textContent = '--';
      outputEl.textContent = '--';
      savingsEl.textContent = '--';
    };

    upload.onchange = async (e) => {
      const file = e.target.files[0];
      resetMetrics();
      if (!file) {
        currentFile = null;
        controls.classList.add('hidden');
        return;
      }

      const v = await FileHelper.validatePdf(file);
      if (!v.ok) {
        currentFile = null;
        upload.value = '';
        controls.classList.add('hidden');
        return UI.showError(v.error);
      }

      currentFile = file;
      originalEl.textContent = fmtBytes(file.size);
      controls.classList.remove('hidden');
    };

    btnGen.onclick = async () => {
      if (!currentFile) return UI.showError('Select a PDF first.');

      btnGen.disabled = true;
      btnGen.textContent = 'Loading engine...';
      UI.showToast('Loading PDF engine...', 'info');

      const stamp = Date.now();
      const inputPath = `/work/input-${stamp}.pdf`;
      const outputPath = `/work/output-${stamp}.pdf`;
      let qpdf = null;

      try {
        qpdf = await loadQpdf();
        const inputBytes = new Uint8Array(await currentFile.arrayBuffer());
        qpdf.FS.writeFile(inputPath, inputBytes);

        btnGen.textContent = 'Compressing...';
        UI.showToast('Optimizing PDF...', 'info');

        const args = [
          '--object-streams=generate',
          '--stream-data=compress',
          '--compress-streams=y',
          '--recompress-flate',
          '--compression-level=9',
          '--remove-unreferenced-resources=yes',
        ];

        if (metadataEl.checked) {
          args.push('--remove-info', '--remove-metadata');
        }
        if (linearizeEl.checked) {
          args.push('--linearize');
        }

        qpdf.callMain([...args, inputPath, outputPath]);

        const outputBytes = qpdf.FS.readFile(outputPath);
        const blob = new Blob([outputBytes], { type: 'application/pdf' });
        const savedBytes = currentFile.size - outputBytes.length;
        const savedPct = currentFile.size > 0 ? (savedBytes / currentFile.size) * 100 : 0;

        originalEl.textContent = fmtBytes(currentFile.size);
        outputEl.textContent = fmtBytes(outputBytes.length);
        savingsEl.textContent = savedBytes > 0 ? `${savedPct.toFixed(1)}%` : '0%';

        FileHelper.downloadBlob(`${fileStem(currentFile.name)}-compressed.pdf`, blob);

        if (savedBytes > 0) {
          UI.showSuccess(`Compressed by ${fmtBytes(savedBytes)}.`);
        } else {
          UI.showToast('Optimized PDF downloaded. This file was already compact.', 'info');
        }
      } catch (err) {
        console.error(err);
        UI.showError('Failed to compress PDF. The file may be encrypted or unsupported.');
      } finally {
        if (qpdf) {
          try { qpdf.FS.unlink(inputPath); } catch (e) {}
          try { qpdf.FS.unlink(outputPath); } catch (e) {}
        }
        btnGen.disabled = false;
        btnGen.textContent = 'Compress PDF';
      }
    };
  },
};
