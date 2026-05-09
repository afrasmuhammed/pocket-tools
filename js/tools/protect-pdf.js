import { UI } from '../core/ui.js';
import { FileHelper } from '../core/file.js';

let qpdfPromise = null;

const loadQpdf = () => {
  if (qpdfPromise) return qpdfPromise;
  qpdfPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = './lib/qpdf.js';
    script.onload = async () => {
      try {
        const qpdf = await window.Module({
          locateFile: (filename) => `./lib/${filename}`,
          noInitialRun: true,
          preRun: [(m) => {
            try { m.FS.mkdir('/work'); } catch (e) {}
          }],
        });
        resolve(qpdf);
      } catch (e) {
        qpdfPromise = null;
        reject(e);
      }
    };
    script.onerror = () => {
      qpdfPromise = null;
      reject(new Error('Failed to load qpdf engine.'));
    };
    document.head.appendChild(script);
  });
  return qpdfPromise;
};

export default {
  async init() {
    const upload     = document.getElementById('ppr-upload');
    const controls   = document.getElementById('ppr-controls');
    const passEl     = document.getElementById('ppr-pass');
    const suggestBtn = document.getElementById('ppr-suggest');
    const btnGen     = document.getElementById('ppr-generate');

    let currentFile = null;

    upload.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) { currentFile = null; controls.classList.add('hidden'); return; }
      const v = await FileHelper.validatePdf(file);
      if (!v.ok) {
        currentFile = null;
        upload.value = '';
        controls.classList.add('hidden');
        return UI.showError(v.error);
      }
      currentFile = file;
      controls.classList.remove('hidden');
    };

    suggestBtn.onclick = () => {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%*?';
      const bytes = new Uint8Array(18);
      crypto.getRandomValues(bytes);
      passEl.value = Array.from(bytes, b => chars[b % chars.length]).join('');
      UI.showSuccess('Strong password generated — save it somewhere safe!');
    };

    btnGen.onclick = async () => {
      if (!currentFile) return UI.showError('Select a PDF first.');
      const password = passEl.value.trim();
      if (!password) return UI.showError('Enter a password first.');

      btnGen.disabled = true;
      btnGen.textContent = 'Loading engine…';
      UI.showToast('Loading PDF engine…', 'info');

      try {
        const qpdf = await loadQpdf();

        btnGen.textContent = 'Protecting…';
        UI.showToast('Encrypting PDF…', 'info');

        const inputBytes  = new Uint8Array(await currentFile.arrayBuffer());
        const inputPath   = '/work/input.pdf';
        const outputPath  = '/work/output.pdf';

        qpdf.FS.writeFile(inputPath, inputBytes);

        // AES-256 encryption
        qpdf.callMain([
          '--encrypt', password, password, '256',
          '--', inputPath, outputPath,
        ]);

        const outputBytes = qpdf.FS.readFile(outputPath);

        try { qpdf.FS.unlink(inputPath);  } catch (e) {}
        try { qpdf.FS.unlink(outputPath); } catch (e) {}

        const blob = new Blob([outputBytes], { type: 'application/pdf' });
        const base = currentFile.name.replace(/\.pdf$/i, '');
        FileHelper.downloadBlob(`${base}-protected.pdf`, blob);

        UI.showSuccess('PDF protected and downloaded!');
      } catch (err) {
        console.error(err);
        qpdfPromise = null;
        UI.showError('Failed to protect PDF. The file may already be encrypted.');
      } finally {
        btnGen.disabled = false;
        btnGen.textContent = 'Protect PDF';
      }
    };
  },
};
