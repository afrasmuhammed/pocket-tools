import { writeFile } from 'node:fs/promises';
import { POCKETS, TOOLS, getPrimaryPocketForTool } from '../js/registry.js';

const site = 'https://pocketkit.app';

function xmlEscape(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

const urls = [
  { loc: `${site}/`, changefreq: 'weekly', priority: '1.0' },
  { loc: `${site}/#/all`, changefreq: 'weekly', priority: '0.9' },
  ...POCKETS.map(pocket => ({
    loc: `${site}/#/pocket/${pocket.id}`,
    changefreq: 'weekly',
    priority: pocket.access === 'free' ? '0.9' : '0.7',
  })),
  ...TOOLS.map(tool => ({
    loc: `${site}/#/tool/${tool.id}`,
    changefreq: 'monthly',
    priority: getPrimaryPocketForTool(tool.id)?.access === 'free' ? '0.8' : '0.6',
  })),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${xmlEscape(url.loc)}</loc>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;

const tools = {
  generatedAt: new Date().toISOString(),
  site,
  counts: {
    pockets: POCKETS.length,
    tools: TOOLS.length,
  },
  pockets: POCKETS.map(pocket => ({
    id: pocket.id,
    name: pocket.name,
    shortName: pocket.shortName,
    access: pocket.access,
    description: pocket.desc,
    url: `${site}/#/pocket/${pocket.id}`,
    tools: pocket.tools,
  })),
  tools: TOOLS.map(tool => {
    const pocket = getPrimaryPocketForTool(tool.id);
    return {
      id: tool.id,
      name: tool.name,
      category: tool.category,
      description: tool.desc,
      pocket: pocket?.id || null,
      access: pocket?.access || 'free',
      url: `${site}/#/tool/${tool.id}`,
    };
  }),
};

await writeFile('sitemap.xml', sitemap);
await writeFile('tools.json', `${JSON.stringify(tools, null, 2)}\n`);

console.log(`Synced ${urls.length} sitemap URLs and ${TOOLS.length} tool records.`);
