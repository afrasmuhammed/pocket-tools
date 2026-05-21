import { UI } from '../core/ui.js';

const SAMPLE = {
  title: 'PocketKit - Private everyday tools',
  description: 'A focused workspace for images, documents, text, dates, and everyday calculations.',
  url: 'https://pocketkit.app/',
  image: 'https://pocketkit.app/assets/og-image.png',
  site: 'PocketKit',
  type: 'website',
};

function escapeAttr(value) {
  return value
    .trim()
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function tag(name, content) {
  if (!content.trim()) return null;
  return `<meta name="${name}" content="${escapeAttr(content)}">`;
}

function propertyTag(property, content) {
  if (!content.trim()) return null;
  return `<meta property="${property}" content="${escapeAttr(content)}">`;
}

function generateTags(values) {
  const lines = [
    values.title.trim() ? `<title>${escapeAttr(values.title)}</title>` : null,
    tag('description', values.description),
    values.url.trim() ? `<link rel="canonical" href="${escapeAttr(values.url)}">` : null,
    tag('robots', 'index, follow'),
    '',
    propertyTag('og:type', values.type),
    propertyTag('og:title', values.title),
    propertyTag('og:description', values.description),
    propertyTag('og:url', values.url),
    propertyTag('og:site_name', values.site),
    propertyTag('og:image', values.image),
    '',
    tag('twitter:card', values.image.trim() ? 'summary_large_image' : 'summary'),
    tag('twitter:title', values.title),
    tag('twitter:description', values.description),
    tag('twitter:image', values.image),
  ];

  return lines.filter(line => line !== null).join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

function countTags(output) {
  return output ? output.split('\n').filter(line => line.trim().startsWith('<')).length : 0;
}

export default {
  init() {
    const fields = {
      title: document.getElementById('meta-title'),
      description: document.getElementById('meta-description'),
      url: document.getElementById('meta-url'),
      image: document.getElementById('meta-image'),
      site: document.getElementById('meta-site'),
      type: document.getElementById('meta-type'),
    };
    const outputEl = document.getElementById('meta-output');
    const countEl = document.getElementById('meta-count');
    const charsEl = document.getElementById('meta-chars');

    const readValues = () => ({
      title: fields.title.value,
      description: fields.description.value,
      url: fields.url.value,
      image: fields.image.value,
      site: fields.site.value,
      type: fields.type.value,
    });

    const updateMetrics = () => {
      countEl.textContent = countTags(outputEl.value).toLocaleString();
      charsEl.textContent = outputEl.value.length.toLocaleString();
    };

    const run = () => {
      outputEl.value = generateTags(readValues());
      updateMetrics();
    };

    document.getElementById('btn-meta-generate').onclick = run;

    document.getElementById('btn-meta-sample').onclick = () => {
      fields.title.value = SAMPLE.title;
      fields.description.value = SAMPLE.description;
      fields.url.value = SAMPLE.url;
      fields.image.value = SAMPLE.image;
      fields.site.value = SAMPLE.site;
      fields.type.value = SAMPLE.type;
      run();
    };

    document.getElementById('btn-meta-clear').onclick = () => {
      Object.values(fields).forEach(field => {
        field.value = field.tagName === 'SELECT' ? 'website' : '';
      });
      outputEl.value = '';
      updateMetrics();
    };

    document.getElementById('btn-meta-copy').onclick = () => {
      if (!outputEl.value) return UI.showError('Nothing to copy yet.');
      navigator.clipboard.writeText(outputEl.value)
        .then(() => UI.showToast('Copied!', 'success'))
        .catch(() => UI.showError('Copy failed.'));
    };

    Object.values(fields).forEach(field => {
      field.addEventListener('input', run);
      field.addEventListener('change', run);
    });

    updateMetrics();
  },
};
