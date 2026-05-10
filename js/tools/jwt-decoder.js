import { UI } from '../core/ui.js';

// JWT uses base64url: '-' instead of '+', '_' instead of '/', no '=' padding.
// Convert to standard base64 before calling atob(), then handle UTF-8 properly.
function b64urlToJson(segment, partName) {
  // Step 1: base64url → standard base64 with correct padding
  const b64 = segment
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    + '=='.slice(0, (4 - (segment.length % 4)) % 4);

  // Step 2: base64 → UTF-8 string (Unicode-safe via percent-encoding round-trip)
  let text;
  try {
    text = decodeURIComponent(
      atob(b64).split('').map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join('')
    );
  } catch {
    throw new Error(`${partName}: base64 decode failed — invalid characters`);
  }

  // Step 3: parse JSON
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error(`${partName}: decoded successfully but is not valid JSON — ${e.message}`);
  }
}

function decodeJWT(raw) {
  const parts = raw.trim().split('.');
  if (parts.length !== 3) {
    return { ok: false, error: `Invalid JWT: expected 3 segments separated by dots, found ${parts.length}` };
  }

  let header, payload;
  try {
    header = b64urlToJson(parts[0], 'Header');
  } catch (e) {
    return { ok: false, error: e.message };
  }
  try {
    payload = b64urlToJson(parts[1], 'Payload');
  } catch (e) {
    return { ok: false, error: e.message };
  }

  return {
    ok: true,
    header:    JSON.stringify(header,  null, 2),
    payload:   JSON.stringify(payload, null, 2),
    signature: parts[2],
  };
}

function debounce(fn, ms) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
}

export default {
  init() {
    const inputEl   = document.getElementById('jwt-input');
    const errorEl   = document.getElementById('jwt-error');
    const headerEl  = document.getElementById('jwt-header-out');
    const payloadEl = document.getElementById('jwt-payload-out');
    const sigEl     = document.getElementById('jwt-sig-out');

    function clearSections() {
      headerEl.textContent  = '';
      payloadEl.textContent = '';
      sigEl.textContent     = '';
    }

    function showError(msg) {
      clearSections();
      errorEl.textContent = msg;
      errorEl.classList.remove('hidden');
    }

    function hideError() {
      errorEl.textContent = '';
      errorEl.classList.add('hidden');
    }

    const run = debounce(() => {
      const raw = inputEl.value.trim();
      if (!raw) { clearSections(); hideError(); return; }

      const result = decodeJWT(raw);
      if (!result.ok) { showError(result.error); return; }

      hideError();
      headerEl.textContent  = result.header;
      payloadEl.textContent = result.payload;
      sigEl.textContent     = result.signature;
    }, 200);

    inputEl.addEventListener('input', run);

    function makeCopier(el, label) {
      return () => {
        const text = el.textContent;
        if (!text) return UI.showError(`No ${label} to copy yet.`);
        navigator.clipboard.writeText(text)
          .then(() => UI.showToast(`${label} copied!`, 'success'))
          .catch(() => UI.showError('Copy failed.'));
      };
    }

    document.getElementById('btn-jwt-copy-header').onclick  = makeCopier(headerEl,  'Header');
    document.getElementById('btn-jwt-copy-payload').onclick = makeCopier(payloadEl, 'Payload');
    document.getElementById('btn-jwt-copy-sig').onclick     = makeCopier(sigEl,     'Signature');

    document.getElementById('btn-jwt-clear').onclick = () => {
      inputEl.value = '';
      clearSections();
      hideError();
    };
  }
};
