import { UI } from '../core/ui.js';

const SAMPLE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<catalog>
  <book id="pt-101">
    <title>PocketKit Handbook</title>
    <author>Afras Muhammed</author>
    <tags>
      <tag>utilities</tag>
      <tag>offline</tag>
    </tags>
  </book>
</catalog>`;

function getParseError(doc) {
  const error = doc.getElementsByTagName('parsererror')[0];
  if (!error) return '';
  return error.textContent.trim().replace(/\s+/g, ' ');
}

function parseXml(raw) {
  const doc = new DOMParser().parseFromString(raw, 'application/xml');
  const error = getParseError(doc);
  if (error) return { ok: false, error };
  return { ok: true, doc };
}

function tokenize(xml) {
  return xml
    .replace(/>\s*</g, '><')
    .match(/<!\[CDATA\[[\s\S]*?\]\]>|<!--[\s\S]*?-->|<\?[\s\S]*?\?>|<[^>]+>|[^<]+/g) || [];
}

function formatXml(xml) {
  const tokens = tokenize(xml);
  const lines = [];
  let depth = 0;

  tokens.forEach((token) => {
    const value = token.trim();
    if (!value) return;

    const isClosing = /^<\//.test(value);
    const isDeclaration = /^<\?/.test(value);
    const isComment = /^<!--/.test(value);
    const isCdata = /^<!\[CDATA\[/.test(value);
    const isDoctype = /^<!DOCTYPE/i.test(value);
    const isSelfClosing = /\/>$/.test(value);
    const isOpening = /^<[^!?/][^>]*>$/.test(value) && !isSelfClosing;

    if (isClosing) depth = Math.max(depth - 1, 0);
    lines.push(`${'  '.repeat(depth)}${value}`);

    if (isOpening && !isDeclaration && !isComment && !isCdata && !isDoctype) depth += 1;
  });

  return lines.join('\n');
}

function minifyXml(xml) {
  return tokenize(xml).map(token => token.trim()).filter(Boolean).join('');
}

function summarize(doc, output) {
  return {
    elements: doc.getElementsByTagName('*').length,
    lines: output ? output.split('\n').length : 0,
    size: output.length,
  };
}

export default {
  init() {
    const inputEl = document.getElementById('xml-input');
    const outputEl = document.getElementById('xml-output');
    const elementsEl = document.getElementById('xml-elements');
    const linesEl = document.getElementById('xml-lines');
    const sizeEl = document.getElementById('xml-size');

    function updateStats(stats = { elements: 0, lines: 0, size: 0 }) {
      elementsEl.textContent = stats.elements.toLocaleString();
      linesEl.textContent = stats.lines.toLocaleString();
      sizeEl.textContent = stats.size.toLocaleString();
    }

    function setOutput(text, stats) {
      outputEl.value = text;
      outputEl.classList.remove('json-error');
      updateStats(stats);
    }

    function setError(message) {
      outputEl.value = message;
      outputEl.classList.add('json-error');
      updateStats();
      UI.showError('Invalid XML.');
    }

    function process(mode) {
      const raw = inputEl.value.trim();
      if (!raw) {
        setOutput('', { elements: 0, lines: 0, size: 0 });
        return;
      }

      const parsed = parseXml(raw);
      if (!parsed.ok) {
        setError(parsed.error);
        return;
      }

      const serialized = new XMLSerializer().serializeToString(parsed.doc);
      const output = mode === 'minify' ? minifyXml(serialized) : formatXml(serialized);
      setOutput(output, summarize(parsed.doc, output));
    }

    document.getElementById('btn-xml-format').onclick = () => process('format');
    document.getElementById('btn-xml-minify').onclick = () => process('minify');

    document.getElementById('btn-xml-sample').onclick = () => {
      inputEl.value = SAMPLE_XML;
      process('format');
    };

    document.getElementById('btn-xml-clear').onclick = () => {
      inputEl.value = '';
      outputEl.value = '';
      outputEl.classList.remove('json-error');
      updateStats();
    };

    document.getElementById('btn-xml-copy').onclick = () => {
      if (!outputEl.value || outputEl.classList.contains('json-error')) {
        return UI.showError('Nothing valid to copy.');
      }
      navigator.clipboard.writeText(outputEl.value)
        .then(() => UI.showToast('Copied!', 'success'))
        .catch(() => UI.showError('Copy failed.'));
    };
  },
};
