import { TOOLS } from '../js/registry.js';

const base = process.argv[2] || 'http://127.0.0.1:4174';
const required = [
  '/',
  '/manifest.json',
  '/sw.js',
  '/opensearch.xml',
  '/robots.txt',
  '/sitemap.xml',
  '/tools.json',
  '/css/styles.css?v=49',
  '/js/app.js?v=74',
  '/js/router.js?v=55',
  '/js/core/access.js',
];

for (const path of required) {
  const res = await fetch(`${base}${path}`);
  if (!res.ok) throw new Error(`${path} returned ${res.status}`);
}

for (const tool of TOOLS) {
  const [template, module] = await Promise.all([
    fetch(`${base}/templates/${tool.id}.html?v=20`),
    fetch(`${base}/js/tools/${tool.id}.js?v=25`),
  ]);
  if (!template.ok) throw new Error(`Template failed: ${tool.id} (${template.status})`);
  if (!module.ok) throw new Error(`Module failed: ${tool.id} (${module.status})`);
}

console.log(`Static smoke passed for ${TOOLS.length} tools at ${base}`);
