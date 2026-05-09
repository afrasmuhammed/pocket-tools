import { appRouter } from './router.js';
import { TOOLS, getTool } from './registry.js';

const CATEGORY_ORDER  = ['photos', 'documents', 'text', 'math', 'time', 'utilities'];
const CATEGORY_LABELS = { photos: 'Photos', documents: 'Documents', text: 'Text', math: 'Money & Math', time: 'Time', utilities: 'Utilities' };
const CATEGORY_COLORS = { photos: '#f59e0b', documents: '#3b82f6', text: '#8b5cf6', math: '#10b981', time: '#06b6d4', utilities: '#f43f5e' };

const RECENT_KEY = 'pt-recent';
const RECENT_MAX = 4;

let currentCategory = 'all';
let currentSearch   = '';

/* ── Recently Used ─────────────────────────────────────── */

function getRecent() {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY)) || []; }
  catch { return []; }
}

function saveRecent(toolId) {
  let list = getRecent().filter(id => id !== toolId);
  list.unshift(toolId);
  list = list.slice(0, RECENT_MAX);
  try { localStorage.setItem(RECENT_KEY, JSON.stringify(list)); } catch {}
}

function makeRecentCard(tool) {
  const a = document.createElement('a');
  a.className = 'recent-card';
  a.href = `#/tool/${encodeURIComponent(tool.id)}`;

  const wrap = document.createElement('div');
  wrap.className = 'recent-icon-wrap';

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'icon');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.8');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', tool.icon);
  svg.appendChild(path);
  wrap.appendChild(svg);

  const name = document.createElement('span');
  name.className = 'recent-name';
  name.textContent = tool.name;

  a.appendChild(wrap);
  a.appendChild(name);
  return a;
}

function renderRecentRow() {
  const existing = document.getElementById('recent-row');
  if (existing) existing.remove();

  const ids = getRecent().filter(id => getTool(id));
  if (!ids.length) return;

  const searchWrap = document.querySelector('.search-wrap');
  if (!searchWrap) return;

  const row = document.createElement('div');
  row.id = 'recent-row';
  row.className = 'recent-row';

  const label = document.createElement('p');
  label.className = 'recent-label';
  label.textContent = 'Recently used';
  row.appendChild(label);

  const scroll = document.createElement('div');
  scroll.className = 'recent-scroll';

  ids.forEach(id => {
    const tool = getTool(id);
    if (tool) scroll.appendChild(makeRecentCard(tool));
  });

  row.appendChild(scroll);
  searchWrap.insertAdjacentElement('beforebegin', row);
}

/* ── Tool grid ─────────────────────────────────────────── */

function makeCard(tool, index) {
  const a = document.createElement('a');
  a.className = 'tool-card';
  a.setAttribute('role', 'listitem');
  a.href = `#/tool/${encodeURIComponent(tool.id)}`;
  a.dataset.category = tool.category;
  a.style.setProperty('--i', index);

  const wrap = document.createElement('div');
  wrap.className = 'icon-wrap';

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'icon');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.8');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', tool.icon);
  svg.appendChild(path);
  wrap.appendChild(svg);

  const name = document.createElement('span');
  name.className = 'name';
  name.textContent = tool.name;

  const desc = document.createElement('span');
  desc.className = 'desc';
  desc.textContent = tool.desc;

  a.appendChild(wrap);
  a.appendChild(name);
  a.appendChild(desc);
  return a;
}

function makeLabel(category) {
  const div = document.createElement('div');
  div.className = 'category-label';
  const dot = document.createElement('span');
  dot.className = 'cat-dot';
  dot.style.background = CATEGORY_COLORS[category];
  div.appendChild(dot);
  div.appendChild(document.createTextNode(CATEGORY_LABELS[category]));
  return div;
}

function renderGrid() {
  const grid = document.getElementById('tool-grid');
  if (!grid) return;
  grid.replaceChildren();

  const q = currentSearch.trim().toLowerCase();

  if (q) {
    const results = TOOLS.filter(t => {
      const inCat = currentCategory === 'all' || t.category === currentCategory;
      return inCat && (t.name.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q));
    });
    if (!results.length) {
      const empty = document.createElement('p');
      empty.className = 'search-empty';
      empty.textContent = `No tools match "${currentSearch.trim()}"`;
      grid.appendChild(empty);
      return;
    }
    results.forEach((tool, i) => grid.appendChild(makeCard(tool, i)));
    return;
  }

  if (currentCategory === 'all') {
    let idx = 0;
    CATEGORY_ORDER.forEach(cat => {
      const catTools = TOOLS.filter(t => t.category === cat);
      if (!catTools.length) return;
      grid.appendChild(makeLabel(cat));
      catTools.forEach(tool => grid.appendChild(makeCard(tool, idx++)));
    });
  } else {
    TOOLS.filter(t => t.category === currentCategory)
         .forEach((tool, i) => grid.appendChild(makeCard(tool, i)));
  }
}

function renderHome() {
  renderRecentRow();
  renderGrid();

  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      chip.classList.remove('chip-tapped');
      void chip.offsetWidth; // force reflow to restart animation
      chip.classList.add('chip-tapped');
      chip.addEventListener('animationend', () => chip.classList.remove('chip-tapped'), { once: true });
      currentCategory = chip.dataset.category || 'all';
      renderGrid();
    });
  });

  const searchInput = document.getElementById('tool-search');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      currentSearch = searchInput.value;
      renderGrid();
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderHome();
  appRouter.handleRoute();

  // Track recently used tools via hash changes
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash || '';
    if (hash.startsWith('#/tool/')) {
      const toolId = decodeURIComponent(hash.replace('#/tool/', '')).trim();
      saveRecent(toolId);
    }
    // Re-render recent row when navigating home
    if (!hash || hash === '#' || hash === '#/') {
      renderRecentRow();
    }
  });

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js')
      .catch(err => console.warn('[sw] registration failed:', err));
  }
});
