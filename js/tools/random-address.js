import { UI } from '../core/ui.js';

const STREETS = ['Market Street', 'Oak Avenue', 'River Road', 'Station Lane', 'Maple Drive', 'King Street', 'Cedar Way'];
const US = [
  { city: 'Austin', state: 'TX', country: 'United States' },
  { city: 'Seattle', state: 'WA', country: 'United States' },
  { city: 'Denver', state: 'CO', country: 'United States' },
  { city: 'Boston', state: 'MA', country: 'United States' },
  { city: 'Phoenix', state: 'AZ', country: 'United States' },
];
const EU = [
  { city: 'Berlin', state: 'BE', country: 'Germany' },
  { city: 'Amsterdam', state: 'NH', country: 'Netherlands' },
  { city: 'Madrid', state: 'MD', country: 'Spain' },
  { city: 'Vienna', state: 'WI', country: 'Austria' },
  { city: 'Dublin', state: 'DN', country: 'Ireland' },
];

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function number(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeAddress(region) {
  const source = pick(region === 'eu' ? EU : region === 'global' && Math.random() > 0.5 ? EU : US);
  return {
    line1: `${number(10, 999)} ${pick(STREETS)}`,
    line2: Math.random() > 0.65 ? `Apt ${number(1, 40)}` : '',
    city: source.city,
    state: source.state,
    postalCode: US.includes(source) ? String(number(10000, 99999)) : `${number(10000, 99999)}`,
    country: source.country,
  };
}

export default {
  init() {
    const countEl = document.getElementById('ra-count');
    const regionEl = document.getElementById('ra-region');
    const outputEl = document.getElementById('ra-output');

    const generate = () => {
      const count = Math.min(Math.max(Number(countEl.value) || 1, 1), 50);
      countEl.value = String(count);
      outputEl.value = JSON.stringify(Array.from({ length: count }, () => makeAddress(regionEl.value)), null, 2);
    };

    document.getElementById('btn-ra-generate').onclick = generate;
    document.getElementById('btn-ra-copy').onclick = () => {
      if (!outputEl.value) return UI.showError('Nothing to copy yet.');
      navigator.clipboard.writeText(outputEl.value)
        .then(() => UI.showToast('Copied!', 'success'))
        .catch(() => UI.showError('Copy failed.'));
    };
    generate();
  },
};
