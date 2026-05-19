import { UI } from '../core/ui.js';
import { FileHelper } from '../core/file.js';
import { loadQpdf } from '../core/lazy.js';

export default {
  async init() {
    const upload     = document.getElementById('ppr-upload');
    const controls   = document.getElementById('ppr-controls');
    const passEl     = document.getElementById('ppr-pass');
    const suggestBtn = document.getElementById('ppr-suggest');
    const btnGen     = document.getElementById('ppr-generate');
    const toggleBtn  = document.getElementById('ppr-toggle');
    const eyeIcon    = document.getElementById('ppr-eye');
    const eyeOffIcon = document.getElementById('ppr-eye-off');

    const setPasswordVisible = (visible) => {
      passEl.type = visible ? 'text' : 'password';
      eyeIcon.classList.toggle('hidden', visible);
      eyeOffIcon.classList.toggle('hidden', !visible);
    };

    toggleBtn.onclick = () => setPasswordVisible(passEl.type === 'password');

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
      setPasswordVisible(true);
      UI.showSuccess('Strong password generated — copy it before closing!');
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
        UI.showError('Failed to protect PDF. The file may already be encrypted.');
      } finally {
        btnGen.disabled = false;
        btnGen.textContent = 'Protect PDF';
      }
    };
  },
};
