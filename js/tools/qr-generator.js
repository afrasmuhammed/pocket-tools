import { UI } from '../core/ui.js';

export default {
  async init() {
    if (!window.QRCode) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = './lib/qrcode.min.js';
        script.onload = resolve;
        script.onerror = () => reject(new Error('Failed to load QR library'));
        document.head.appendChild(script);
      }).catch(err => {
        UI.showError('Could not load QR module offline');
        console.error(err);
      });
    }

    const input = document.getElementById('qr-input');
    const btnGen = document.getElementById('btn-qr-generate');
    const container = document.getElementById('qr-result-container');
    const qrDiv = document.getElementById('qr-code');
    const btnDownload = document.getElementById('btn-qr-download');
    const presetButtons = Array.from(document.querySelectorAll('[data-qr-preset]'));
    const fieldSets = Array.from(document.querySelectorAll('[data-qr-fields]'));

    let qrcode = null;
    let activePreset = 'text';

    const val = id => document.getElementById(id)?.value.trim() || '';
    const enc = value => encodeURIComponent(value);
    const escapeWifi = value => value.replace(/[\\;,":]/g, '\\$&');

    function setPreset(preset) {
      activePreset = preset;
      presetButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.qrPreset === preset));
      fieldSets.forEach(set => set.classList.toggle('hidden', set.dataset.qrFields !== preset));
      input.closest('.input-group')?.classList.toggle('hidden', preset !== 'text');
    }

    function makePayload() {
      if (activePreset === 'wifi') {
        const ssid = val('qr-wifi-ssid');
        if (!ssid) return '';
        const type = val('qr-wifi-type') || 'WPA';
        const password = val('qr-wifi-password');
        const hidden = document.getElementById('qr-wifi-hidden')?.checked ? 'true' : 'false';
        return `WIFI:T:${type};S:${escapeWifi(ssid)};P:${escapeWifi(password)};H:${hidden};;`;
      }
      if (activePreset === 'contact') {
        const name = val('qr-contact-name');
        const phone = val('qr-contact-phone');
        const email = val('qr-contact-email');
        if (!name && !phone && !email) return '';
        return ['BEGIN:VCARD', 'VERSION:3.0', name && `FN:${name}`, phone && `TEL:${phone}`, email && `EMAIL:${email}`, 'END:VCARD']
          .filter(Boolean).join('\n');
      }
      if (activePreset === 'email') {
        const to = val('qr-email-to');
        if (!to) return '';
        const params = new URLSearchParams();
        if (val('qr-email-subject')) params.set('subject', val('qr-email-subject'));
        if (val('qr-email-body')) params.set('body', val('qr-email-body'));
        const qs = params.toString();
        return `mailto:${to}${qs ? `?${qs}` : ''}`;
      }
      if (activePreset === 'sms') {
        const phone = val('qr-sms-phone');
        if (!phone) return '';
        const message = val('qr-sms-message');
        return `sms:${phone}${message ? `?body=${enc(message)}` : ''}`;
      }
      return input.value.trim();
    }

    presetButtons.forEach(btn => {
      btn.addEventListener('click', () => setPreset(btn.dataset.qrPreset || 'text'));
    });

    btnGen.onclick = () => {
      const text = makePayload();
      if (!text) return UI.showError('Fill in the QR details first');

      if (!window.QRCode) return UI.showError('QR Library not available');

      qrDiv.innerHTML = '';
      container.classList.remove('hidden');

      qrcode = new QRCode(qrDiv, {
        text: text,
        width: 256,
        height: 256,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
      });
    };

    setPreset('text');

    btnDownload.onclick = () => {
      const img = qrDiv.querySelector('img');
      const canvas = qrDiv.querySelector('canvas');
      
      let dataUrl = '';
      if (img && img.src) {
        dataUrl = img.src;
      } else if (canvas) {
        dataUrl = canvas.toDataURL("image/png");
      }

      if (!dataUrl) return UI.showError('QR Code not generated yet');

      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'qrcode.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };
  }
};
