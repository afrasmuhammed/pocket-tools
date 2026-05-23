import { readFile, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { POCKETS, TOOLS } from '../js/registry.js';

const failures = [];

async function exists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function fail(message) {
  failures.push(message);
}

const ids = new Set();
for (const tool of TOOLS) {
  if (ids.has(tool.id)) fail(`Duplicate tool id: ${tool.id}`);
  ids.add(tool.id);
  if (!await exists(`templates/${tool.id}.html`)) fail(`Missing template: ${tool.id}`);
  if (!await exists(`js/tools/${tool.id}.js`)) fail(`Missing module: ${tool.id}`);
}

for (const pocket of POCKETS) {
  for (const id of pocket.tools) {
    if (!ids.has(id)) fail(`Pocket ${pocket.id} references unknown tool: ${id}`);
  }
}

const sw = await readFile('sw.js', 'utf8');
for (const tool of TOOLS) {
  if (!sw.includes(`js/tools/${tool.id}.js?v=`)) fail(`Service worker missing module cache entry: ${tool.id}`);
  if (!sw.includes(`templates/${tool.id}.html?v=`)) fail(`Service worker missing template cache entry: ${tool.id}`);
}

const sitemap = await readFile('sitemap.xml', 'utf8');
for (const tool of TOOLS) {
  if (!sitemap.includes(`https://pocketkit.app/#/tool/${tool.id}`)) fail(`Sitemap missing tool: ${tool.id}`);
}
for (const pocket of POCKETS) {
  if (!sitemap.includes(`https://pocketkit.app/#/pocket/${pocket.id}`)) fail(`Sitemap missing pocket: ${pocket.id}`);
}

const toolsJson = JSON.parse(await readFile('tools.json', 'utf8'));
if (toolsJson.counts?.tools !== TOOLS.length) fail('tools.json tool count mismatch');
if (toolsJson.counts?.pockets !== POCKETS.length) fail('tools.json pocket count mismatch');

if (failures.length) {
  console.error(`PocketKit QA failed with ${failures.length} issue(s):`);
  for (const item of failures) console.error(`- ${item}`);
  process.exit(1);
}

console.log(`PocketKit QA passed: ${TOOLS.length} tools, ${POCKETS.length} pockets.`);
