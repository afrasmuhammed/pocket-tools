import { UI } from '../core/ui.js';

const SAMPLE = {
  agent: '*',
  allow: '/\n/blog/',
  disallow: '/admin/\n/private/\n/tmp/',
  sitemap: 'https://example.com/sitemap.xml',
  delay: '5',
};

function splitPaths(value) {
  return value
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);
}

function normalizePath(path) {
  if (path === '/') return path;
  return path.startsWith('/') ? path : `/${path}`;
}

function generateRobots(values) {
  const lines = [`User-agent: ${values.agent.trim() || '*'}`];
  const allow = splitPaths(values.allow).map(normalizePath);
  const disallow = splitPaths(values.disallow).map(normalizePath);
  const delay = Number(values.delay);

  allow.forEach(path => lines.push(`Allow: ${path}`));
  disallow.forEach(path => lines.push(`Disallow: ${path}`));

  if (Number.isFinite(delay) && delay > 0) {
    lines.push(`Crawl-delay: ${Math.min(Math.floor(delay), 120)}`);
  }

  if (values.sitemap.trim()) {
    lines.push('', `Sitemap: ${values.sitemap.trim()}`);
  }

  return lines.join('\n');
}

function countRules(output) {
  return output
    .split('\n')
    .filter(line => /^(Allow|Disallow|Crawl-delay|Sitemap):/.test(line.trim()))
    .length;
}

export default {
  init() {
    const agentEl = document.getElementById('robots-agent');
    const allowEl = document.getElementById('robots-allow');
    const disallowEl = document.getElementById('robots-disallow');
    const sitemapEl = document.getElementById('robots-sitemap');
    const delayEl = document.getElementById('robots-delay');
    const outputEl = document.getElementById('robots-output');
    const rulesEl = document.getElementById('robots-rules');
    const charsEl = document.getElementById('robots-chars');

    const readValues = () => ({
      agent: agentEl.value,
      allow: allowEl.value,
      disallow: disallowEl.value,
      sitemap: sitemapEl.value,
      delay: delayEl.value,
    });

    const updateMetrics = () => {
      rulesEl.textContent = countRules(outputEl.value).toLocaleString();
      charsEl.textContent = outputEl.value.length.toLocaleString();
    };

    const run = () => {
      outputEl.value = generateRobots(readValues());
      updateMetrics();
    };

    document.getElementById('btn-robots-generate').onclick = run;

    document.getElementById('btn-robots-sample').onclick = () => {
      agentEl.value = SAMPLE.agent;
      allowEl.value = SAMPLE.allow;
      disallowEl.value = SAMPLE.disallow;
      sitemapEl.value = SAMPLE.sitemap;
      delayEl.value = SAMPLE.delay;
      run();
    };

    document.getElementById('btn-robots-clear').onclick = () => {
      agentEl.value = '*';
      allowEl.value = '';
      disallowEl.value = '';
      sitemapEl.value = '';
      delayEl.value = '';
      outputEl.value = '';
      updateMetrics();
    };

    document.getElementById('btn-robots-copy').onclick = () => {
      if (!outputEl.value) return UI.showError('Nothing to copy yet.');
      navigator.clipboard.writeText(outputEl.value)
        .then(() => UI.showToast('Copied!', 'success'))
        .catch(() => UI.showError('Copy failed.'));
    };

    [agentEl, allowEl, disallowEl, sitemapEl, delayEl].forEach(field => {
      field.addEventListener('input', run);
    });

    updateMetrics();
  },
};
