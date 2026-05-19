import { UI } from '../core/ui.js';

const SAMPLE = 'https://example.com/\nhttps://example.com/blog/\nhttps://example.com/contact/';

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function isUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function urlsToSitemap(lines, changefreq, priority) {
  const entries = lines.map(line => line.trim()).filter(Boolean);
  const invalid = entries.filter(entry => !isUrl(entry));
  if (invalid.length) throw new Error(`Invalid URL: ${invalid[0]}`);

  const parts = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'];
  entries.forEach(url => {
    parts.push('  <url>');
    parts.push(`    <loc>${escapeXml(url)}</loc>`);
    if (changefreq) parts.push(`    <changefreq>${changefreq}</changefreq>`);
    if (priority !== '') parts.push(`    <priority>${Number(priority).toFixed(1)}</priority>`);
    parts.push('  </url>');
  });
  parts.push('</urlset>');
  return parts.join('\n');
}

function formatXml(xml) {
  const parser = new DOMParser();
  const parsed = parser.parseFromString(xml, 'application/xml');
  if (parsed.querySelector('parsererror')) throw new Error('Invalid XML.');

  const compact = new XMLSerializer().serializeToString(parsed).replace(/>\s+</g, '><');
  const tokens = compact.replace(/></g, '>\n<').split('\n');
  let depth = 0;
  return tokens.map(token => {
    if (/^<\//.test(token)) depth = Math.max(depth - 1, 0);
    const line = `${'  '.repeat(depth)}${token}`;
    if (/^<[^!?/][^>]*[^/]?>$/.test(token) && !token.includes('</')) depth += 1;
    return line;
  }).join('\n');
}

function countUrls(xml) {
  return (xml.match(/<loc>/g) || []).length;
}

export default {
  init() {
    const inputEl = document.getElementById('sf-input');
    const changefreqEl = document.getElementById('sf-changefreq');
    const priorityEl = document.getElementById('sf-priority');
    const outputEl = document.getElementById('sf-output');
    const countEl = document.getElementById('sf-count');
    const statusEl = document.getElementById('sf-status');

    const setOutput = (text, status = 'Ready') => {
      outputEl.value = text;
      countEl.textContent = countUrls(text).toLocaleString();
      statusEl.textContent = status;
    };

    const run = () => {
      const raw = inputEl.value.trim();
      if (!raw) return setOutput('');

      try {
        const output = raw.startsWith('<')
          ? formatXml(raw)
          : urlsToSitemap(raw.split(/\r?\n/), changefreqEl.value, priorityEl.value);
        setOutput(output, 'Valid');
      } catch (err) {
        outputEl.value = '';
        countEl.textContent = '0';
        statusEl.textContent = 'Error';
        UI.showError(err.message || 'Could not format sitemap.');
      }
    };

    document.getElementById('btn-sf-format').onclick = run;
    document.getElementById('btn-sf-sample').onclick = () => {
      inputEl.value = SAMPLE;
      run();
    };
    document.getElementById('btn-sf-clear').onclick = () => {
      inputEl.value = '';
      setOutput('');
    };
    document.getElementById('btn-sf-copy').onclick = () => {
      if (!outputEl.value) return UI.showError('Nothing to copy yet.');
      navigator.clipboard.writeText(outputEl.value)
        .then(() => UI.showToast('Copied!', 'success'))
        .catch(() => UI.showError('Copy failed.'));
    };

    [inputEl, changefreqEl, priorityEl].forEach(el => el.addEventListener('input', run));
    changefreqEl.addEventListener('change', run);
    setOutput('');
  },
};
