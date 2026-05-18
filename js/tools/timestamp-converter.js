import { UI } from '../core/ui.js';

function pad(value) {
  return String(value).padStart(2, '0');
}

function toDateTimeLocalValue(date) {
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

function parseTimestamp(raw, unit) {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const value = Number(trimmed);
  if (!Number.isFinite(value)) return null;

  if (unit === 'milliseconds') return value;
  if (unit === 'seconds') return value * 1000;

  return Math.abs(value) >= 100000000000 ? value : value * 1000;
}

function isValidDate(date) {
  return date instanceof Date && Number.isFinite(date.getTime());
}

export default {
  init() {
    const timestampEl = document.getElementById('ts-input');
    const unitEl = document.getElementById('ts-unit');
    const dateTimeEl = document.getElementById('ts-datetime');
    const secondsEl = document.getElementById('ts-seconds');
    const millisecondsEl = document.getElementById('ts-milliseconds');
    const localEl = document.getElementById('ts-local');
    const utcEl = document.getElementById('ts-utc');
    const isoEl = document.getElementById('ts-iso');

    const setResult = (date) => {
      if (!isValidDate(date)) {
        UI.showError('Enter a valid timestamp or date.');
        return;
      }

      const ms = date.getTime();
      const seconds = Math.floor(ms / 1000);

      timestampEl.value = String(seconds);
      dateTimeEl.value = toDateTimeLocalValue(date);
      secondsEl.textContent = seconds.toLocaleString();
      millisecondsEl.textContent = ms.toLocaleString();
      localEl.textContent = date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short',
      });
      utcEl.textContent = date.toUTCString();
      isoEl.textContent = date.toISOString();
    };

    document.getElementById('btn-ts-now').onclick = () => {
      unitEl.value = 'seconds';
      setResult(new Date());
    };

    document.getElementById('btn-ts-convert').onclick = () => {
      const ms = parseTimestamp(timestampEl.value, unitEl.value);
      if (ms === null) return UI.showError('Enter a timestamp first.');
      setResult(new Date(ms));
    };

    document.getElementById('btn-ts-date-convert').onclick = () => {
      const date = new Date(dateTimeEl.value);
      setResult(date);
    };

    document.getElementById('btn-ts-copy').onclick = () => {
      const text = [
        `Unix seconds: ${secondsEl.textContent}`,
        `Milliseconds: ${millisecondsEl.textContent}`,
        `Local time: ${localEl.textContent}`,
        `UTC: ${utcEl.textContent}`,
        `ISO 8601: ${isoEl.textContent}`,
      ].join('\n');

      navigator.clipboard.writeText(text)
        .then(() => UI.showToast('Results copied!', 'success'))
        .catch(() => UI.showError('Copy failed.'));
    };

    setResult(new Date());
  },
};
