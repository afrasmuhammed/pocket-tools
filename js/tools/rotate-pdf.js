import { UI } from '../core/ui.js';
import { FileHelper } from '../core/file.js';
import { loadPdfLib } from '../core/lazy.js';

export default {
  async init() {
    const upload = document.getElementById('rp-upload');
    const controls = document.getElementById('rp-controls');
    const btnLeft = document.getElementById('rp-left');
    const btnRight = document.getElementById('rp-right');
    
    let currentFile = null;

    upload.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) { currentFile = null; controls.classList.add("hidden"); return; }
      const v = await FileHelper.validatePdf(file);
      if (!v.ok) { upload.value = ''; controls.classList.add('hidden'); return UI.showError(v.error); }
      currentFile = file;
      controls.classList.remove('hidden');
    };

    const rotatePdf = async (degrees) => {
      if (!currentFile) return;
      UI.showToast('Rotating...', 'info');
      
      try {
        const { PDFDocument, degrees: pDegrees } = await loadPdfLib();
        const arrayBuffer = await currentFile.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        
        const pages = pdf.getPages();
        for (const page of pages) {
          const currentRotation = page.getRotation().angle;
          page.setRotation(pDegrees(currentRotation + degrees));
        }
        
        const pdfBytes = await pdf.save();
        FileHelper.downloadBlob('rotated.pdf', new Blob([pdfBytes], { type: 'application/pdf' }));
        
        UI.showToast('PDF Rotated!', 'success');
      } catch (err) {
        console.error(err);
        UI.showError('Failed to rotate PDF.');
      }
    };

    btnLeft.onclick = () => rotatePdf(-90);
    btnRight.onclick = () => rotatePdf(90);
  }
};
