import { UI } from '../core/ui.js';

const WORDS = [
  'atlas', 'brisk', 'cider', 'delta', 'ember', 'fable', 'glint', 'harbor',
  'ivory', 'juno', 'kindle', 'lumen', 'mosaic', 'nova', 'onyx', 'pixel',
  'quartz', 'river', 'signal', 'tango', 'umbra', 'velvet', 'willow', 'zenith',
];

export default {
  init() {
    const lenEl = document.getElementById('pg-length');
    const lenVal = document.getElementById('pg-length-val');
    const outEl = document.getElementById('pg-output');
    const strengthEl = document.getElementById('pg-strength');
    
    const upperEl = document.getElementById('pg-upper');
    const lowerEl = document.getElementById('pg-lower');
    const numEl = document.getElementById('pg-numbers');
    const symEl = document.getElementById('pg-symbols');

    lenEl.addEventListener('input', () => {
      lenVal.textContent = lenEl.value;
    });

    const randomIndex = (max) => {
      const cryptoApi = window.crypto || window.msCrypto;
      const limit = 256 - (256 % max);
      const buf = new Uint8Array(1);
      do { cryptoApi.getRandomValues(buf); } while (buf[0] >= limit);
      return buf[0] % max;
    };

    const setStrength = (value, label = '') => {
      const unique = new Set(value).size;
      const variety = [/[a-z]/, /[A-Z]/, /\d/, /[^a-zA-Z0-9]/].filter(rx => rx.test(value)).length;
      const score = Math.min(100, Math.round(value.length * 3.2 + unique * 1.4 + variety * 8));
      const text = label || (score >= 90 ? 'Excellent' : score >= 70 ? 'Strong' : score >= 45 ? 'Usable' : 'Weak');
      strengthEl.innerHTML = `<span>Strength</span><strong>${text}</strong><i style="--score:${score}%"></i>`;
    };

    const generate = () => {
      const length = parseInt(lenEl.value);
      const hasUpper = upperEl.checked;
      const hasLower = lowerEl.checked;
      const hasNum = numEl.checked;
      const hasSym = symEl.checked;

      const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const lower = "abcdefghijklmnopqrstuvwxyz";
      const numbers = "0123456789";
      const symbols = "!@#$%^&*()_+~`|}{[]:;?><,./-=";

      let chars = "";
      if (hasUpper) chars += upper;
      if (hasLower) chars += lower;
      if (hasNum) chars += numbers;
      if (hasSym) chars += symbols;

      if (chars === "") {
        UI.showError("Select at least one character type");
        return;
      }

      // Cryptographically-secure: use crypto.getRandomValues + rejection
      // sampling so all characters are uniformly distributed (no modulo bias).
      const cryptoApi = window.crypto || window.msCrypto;
      if (!cryptoApi || !cryptoApi.getRandomValues) {
        UI.showError('Secure random not available in this browser.');
        return;
      }
      const limit = 256 - (256 % chars.length);
      const buf = new Uint8Array(64);
      let password = "";
      let idx = buf.length;
      while (password.length < length) {
        if (idx >= buf.length) { cryptoApi.getRandomValues(buf); idx = 0; }
        const b = buf[idx++];
        if (b < limit) password += chars.charAt(b % chars.length);
      }

      outEl.textContent = password;
      setStrength(password);
    };

    document.getElementById('btn-pg-generate').onclick = generate;

    document.getElementById('btn-pg-passphrase').onclick = () => {
      const cryptoApi = window.crypto || window.msCrypto;
      if (!cryptoApi || !cryptoApi.getRandomValues) {
        UI.showError('Secure random not available in this browser.');
        return;
      }
      const words = Array.from({ length: 4 }, () => WORDS[randomIndex(WORDS.length)]);
      const number = String(10 + randomIndex(90));
      const symbol = ['!', '#', '%', '+', '?'][randomIndex(5)];
      const passphrase = `${words.join('-')}-${number}${symbol}`;
      outEl.textContent = passphrase;
      setStrength(passphrase, 'Memorable');
    };

    document.getElementById('btn-pg-copy').onclick = () => {
      if (outEl.textContent === 'Click Generate') return UI.showError('Generate a password first');
      navigator.clipboard.writeText(outEl.textContent)
        .then(() => UI.showToast('Password copied!', 'success'))
        .catch(() => UI.showError('Failed to copy'));
    };
    
    generate();
  }
};
