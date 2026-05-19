import { appRouter } from './router.js?v=22';
import {
  CATEGORIES,
  POCKETS,
  TOOLS,
  getPocket,
  getPrimaryPocketForTool,
  getTool,
  getToolsForPocket,
} from './registry.js?v=21';

const RECENT_KEY = 'pt-recent';
const RECENT_MAX = 4;
const CATEGORY_LABELS = Object.fromEntries(CATEGORIES.map(cat => [cat.id, cat.label]));

let allCategory = 'all';
let allSearch = '';
let pocketSearch = '';

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

function svgPath(path, className = 'icon') {
  return `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${path}"></path></svg>`;
}

function badge(access) {
  return `<span class="pk-badge ${access === 'free' ? 'pk-badge-free' : 'pk-badge-pro'}">${access === 'free' ? 'Free' : 'Pro'}</span>`;
}

function pocketMark(pocket) {
  if (!pocket) return '';
  return `<span class="pk-mark" style="--pocket-accent:${pocket.accent}">${pocket.shortName.slice(0, 2)}</span>`;
}

function toolIconChip(toolId) {
  const tool = getTool(toolId);
  if (!tool) return '';
  return `<span class="pk-tool-chip" title="${tool.name}">${svgPath(tool.icon)}</span>`;
}

function makePocketMeta(pocket) {
  const toolsLabel = `${pocket.tools.length} ${pocket.tools.length === 1 ? 'tool' : 'tools'}`;
  const accessLabel = pocket.access === 'free' ? 'No account' : 'Preview now';
  return `${toolsLabel} · ${accessLabel}`;
}

function makeToolCard(tool, index = 0, options = {}) {
  const pocket = getPrimaryPocketForTool(tool.id);
  const isLocked = options.locked && pocket?.access === 'pro';
  const classes = ['tool-card', 'pk-tool-card'];
  if (isLocked) classes.push('pk-tool-locked');

  const a = document.createElement('a');
  a.className = classes.join(' ');
  a.setAttribute('role', 'listitem');
  a.href = `#/tool/${encodeURIComponent(tool.id)}`;
  a.dataset.category = tool.category;
  a.dataset.pocket = pocket?.id || '';
  a.style.setProperty('--i', index);
  a.innerHTML = `
    <div class="icon-wrap">${svgPath(tool.icon)}</div>
    <span class="name">${tool.name}</span>
    <span class="desc">${tool.desc}</span>
    <span class="pk-tool-meta">
      ${pocket ? `<span class="pk-pocket-dot" style="background:${pocket.accent}"></span>${pocket.shortName}` : CATEGORY_LABELS[tool.category] || tool.category}
      ${pocket?.access === 'pro' ? '<span class="pk-meta-pro">Pro</span>' : ''}
    </span>
  `;
  return a;
}

function makePocketCard(pocket) {
  const card = document.createElement('a');
  card.className = 'pk-pocket-card';
  card.href = `#/pocket/${encodeURIComponent(pocket.id)}`;
  card.style.setProperty('--pocket-accent', pocket.accent);
  card.innerHTML = `
    <span class="pk-pocket-aura" aria-hidden="true"></span>
    <div class="pk-pocket-head">
      <div class="pk-pocket-identity">
        ${pocketMark(pocket)}
        <div>
          <h3>${pocket.name}</h3>
          <span>${makePocketMeta(pocket)}</span>
        </div>
      </div>
      ${badge(pocket.access)}
    </div>
    <p>${pocket.desc}</p>
    <div class="pk-pocket-chips">${pocket.tools.slice(0, 5).map(toolIconChip).join('')}<span>+${Math.max(0, pocket.tools.length - 5)}</span></div>
    <div class="pk-pocket-tools">${pocket.featured.map(item => `<span>${item}</span>`).join('')}</div>
    <div class="pk-pocket-foot">
      <span>${pocket.access === 'free' ? 'Ready now' : 'Pro pocket'}</span>
      <span>Open →</span>
    </div>
  `;
  return card;
}

function makeHeroStack() {
  const daily = getPocket('daily');
  const stackPockets = ['shop', 'designer', 'developer'].map(getPocket).filter(Boolean);
  return `
    <div class="pk-stack" aria-hidden="true">
      ${stackPockets.map((pocket, index) => `
        <div class="pk-stack-card pk-stack-card-${index + 1}" style="--pocket-accent:${pocket.accent}">
          ${pocketMark(pocket)}
          <div>
            <strong>${pocket.shortName}</strong>
            <span>${pocket.tools.length} tools · Pro</span>
          </div>
          ${badge('pro')}
        </div>
      `).join('')}
      <div class="pk-stack-card pk-stack-front" style="--pocket-accent:${daily.accent}">
        <div class="pk-pocket-head">
          ${pocketMark(daily)}
          ${badge('free')}
        </div>
        <strong>Daily</strong>
        <p>Quick everyday tools. Open and use.</p>
        <div class="pk-stack-tools">
          ${daily.tools.slice(0, 3).map(id => {
            const tool = getTool(id);
            return tool ? `<span>${tool.name}</span>` : '';
          }).join('')}
        </div>
        <div class="pk-pocket-foot"><span>${daily.tools.length} tools</span><span>Open →</span></div>
      </div>
    </div>
  `;
}

function setHomeContent(html) {
  const viewHome = document.getElementById('view-home');
  if (!viewHome) return null;
  viewHome.innerHTML = html;
  return viewHome;
}

function renderLanding() {
  const view = setHomeContent(`
    <section class="pk-landing">
      <div class="pk-hero-shell">
        <div class="pk-hero">
          <p class="pk-kicker">${POCKETS.length} pockets · ${TOOLS.length} tools · Installable app</p>
          <h2>Small tools, neatly packed.</h2>
          <p>PocketKit is a private utility app organized into focused pockets. Daily tools stay free. Open a Pro pocket when the day demands deeper work.</p>
          <div class="pk-hero-actions">
            <a class="btn pk-btn-primary" href="#/pocket/daily">Open PocketKit Daily</a>
            <a class="btn btn-secondary" href="#/all">Browse all pockets</a>
          </div>
          <div class="pk-trust-row">
            <span>Private by default</span>
            <span>Works offline</span>
            <span>Installs in a click</span>
          </div>
        </div>
        ${makeHeroStack()}
      </div>
    </section>

    <section id="pockets" class="pk-section">
      <div class="pk-section-head">
        <div>
          <p class="pk-section-title">Pockets</p>
          <h2>Open the pocket you need.</h2>
          <p>Daily is ready for everyone. Pro pockets stay visible so people understand what they can unlock later.</p>
        </div>
        <a class="btn btn-secondary" href="#/all">Browse all tools</a>
      </div>
      <div id="pocket-grid" class="pk-pocket-grid"></div>
    </section>

    <section class="pk-section">
      <p class="pk-section-title">Why PocketKit</p>
      <div class="pk-value-grid">
        <div class="pk-value"><span class="pk-value-icon">01</span><strong>Private by default</strong><span>Local tools never upload your files. Your work stays on your device.</span></div>
        <div class="pk-value"><span class="pk-value-icon">02</span><strong>Installable PWA</strong><span>Add to Dock, taskbar, or home screen. Opens like any other app.</span></div>
        <div class="pk-value"><span class="pk-value-icon">03</span><strong>Works offline</strong><span>Most tools keep working without a connection.</span></div>
        <div class="pk-value"><span class="pk-value-icon">04</span><strong>Organized in pockets</strong><span>No wall of tools. Open the pocket for the job at hand.</span></div>
      </div>
    </section>

    <section class="pk-section">
      <div class="pk-install-strip">
        <div class="pk-mark pk-mark-large">PK</div>
        <div>
          <strong>Install PocketKit on this device</strong>
          <span>Add to Dock, taskbar, or home screen. Some platforms support direct pocket shortcuts.</span>
        </div>
        <a class="btn btn-secondary" href="#/pocket/daily">Open Daily</a>
      </div>
    </section>

    <section class="pk-section">
      <p class="pk-section-title">Free and Pro</p>
      <div class="pk-pricing-grid">
        <div class="pk-price-card">
          ${badge('free')}
          <h3>PocketKit Daily</h3>
          <strong class="pk-price">Free <span>forever</span></strong>
          <p>Everyday tools: QR codes, image compression, passwords, PDFs, timers, and calculators. Open and use immediately.</p>
          <a class="btn btn-secondary" href="#/pocket/daily">Open Daily</a>
        </div>
        <div class="pk-price-card">
          ${badge('pro')}
          <h3>Pro pockets</h3>
          <strong class="pk-price">$24 <span>/year launch idea</span></strong>
          <p>PDF, Designer, Developer, QA, SEO, Student, and Shop workflows. Unlock when you need deeper tools for a specific kind of work.</p>
          <div class="pk-pro-pocket-list">${POCKETS.filter(pocket => pocket.access === 'pro').map(pocket => `<span style="--pocket-accent:${pocket.accent}">${pocket.shortName}</span>`).join('')}</div>
          <a class="btn btn-secondary" href="#/pocket/developer">Preview Pro</a>
        </div>
      </div>
    </section>
  `);

  const grid = view.querySelector('#pocket-grid');
  POCKETS.forEach(pocket => grid.appendChild(makePocketCard(pocket)));
}

function renderPocket(pocketId) {
  const pocket = getPocket(pocketId);
  if (!pocket) {
    window.location.hash = '#/';
    return;
  }

  const tools = getToolsForPocket(pocket.id);
  const isPro = pocket.access === 'pro';
  const view = setHomeContent(`
    <section class="pk-pocket-page">
      <div class="pk-breadcrumb"><a href="#/">Home</a><span>/</span><span>${pocket.shortName}</span></div>
      <div class="pk-pocket-hero">
        ${pocketMark(pocket)}
        <div>
          <div class="pk-title-row">
            <h2>${pocket.name}</h2>
            ${badge(pocket.access)}
            <span class="pk-badge">Works offline</span>
          </div>
          <p>${pocket.desc}</p>
        </div>
        <button class="btn btn-secondary" id="btn-pin-pocket">Copy pocket link</button>
      </div>
      ${isPro ? `
        <div class="pk-pro-banner">
          <div class="pk-mark">Pro</div>
          <p><strong>${pocket.name} is a Pro pocket.</strong> Preview the tools below. Daily stays free; specialized pockets will unlock when payments are ready.</p>
          <button class="btn pk-btn-primary">Unlock ${pocket.shortName}</button>
        </div>
      ` : ''}
      <div class="pk-pocket-controls">
        <div class="search-wrap pk-pocket-search">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input type="search" id="pocket-search" class="search-input" placeholder="Search in ${pocket.shortName}" autocomplete="off" spellcheck="false">
        </div>
        <a class="btn btn-secondary" href="#/all">All tools</a>
      </div>
      <div id="pocket-tool-grid" class="tool-grid pk-compact-grid" role="list"></div>
    </section>
  `);

  const input = view.querySelector('#pocket-search');
  const grid = view.querySelector('#pocket-tool-grid');
  const renderTools = () => {
    const q = pocketSearch.trim().toLowerCase();
    grid.replaceChildren();
    tools
      .filter(tool => !q || tool.name.toLowerCase().includes(q) || tool.desc.toLowerCase().includes(q))
      .forEach((tool, index) => grid.appendChild(makeToolCard(tool, index, { locked: isPro })));
    if (!grid.children.length) {
      const empty = document.createElement('p');
      empty.className = 'search-empty';
      empty.textContent = `No tools match "${pocketSearch.trim()}"`;
      grid.appendChild(empty);
    }
  };

  input.addEventListener('input', () => {
    pocketSearch = input.value;
    renderTools();
  });
  view.querySelector('#btn-pin-pocket').addEventListener('click', () => copyLink(location.href, 'Pocket link copied.'));
  pocketSearch = '';
  renderTools();
}

function renderAllTools() {
  const view = setHomeContent(`
    <section class="pk-all-page">
      <div class="pk-breadcrumb"><a href="#/">Home</a><span>/</span><span>All tools</span></div>
      <div class="pk-section-head">
        <div>
          <p class="pk-section-title">Library</p>
          <h2>All tools</h2>
          <p>${TOOLS.length} tools across ${POCKETS.length} pockets. Search or filter by category.</p>
        </div>
      </div>
      <div class="search-wrap">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
        <input type="search" id="tool-search" class="search-input" placeholder="Search ${TOOLS.length} tools..." autocomplete="off" spellcheck="false">
      </div>
      <nav id="all-categories" class="categories" aria-label="Tool categories"></nav>
      <div id="recent-row-target"></div>
      <div id="tool-grid" class="tool-grid" role="list"></div>
    </section>
  `);

  const nav = view.querySelector('#all-categories');
  [{ id: 'all', label: 'All' }, ...CATEGORIES].forEach(cat => {
    const button = document.createElement('button');
    button.className = `chip${cat.id === allCategory ? ' active' : ''}`;
    button.dataset.category = cat.id;
    button.textContent = cat.label;
    nav.appendChild(button);
  });

  view.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      allCategory = chip.dataset.category || 'all';
      view.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', c === chip));
      renderAllGrid();
    });
  });

  const searchInput = view.querySelector('#tool-search');
  searchInput.value = allSearch;
  searchInput.addEventListener('input', () => {
    allSearch = searchInput.value;
    renderAllGrid();
  });
  renderRecent(view);
  renderAllGrid();
}

function renderRecent(view) {
  const target = view.querySelector('#recent-row-target');
  const ids = getRecent().filter(id => getTool(id));
  if (!target || !ids.length) return;
  const row = document.createElement('div');
  row.className = 'pk-recent-block';
  row.innerHTML = '<p class="pk-section-title">Recently used</p>';
  const grid = document.createElement('div');
  grid.className = 'tool-grid pk-compact-grid';
  ids.forEach((id, index) => {
    const tool = getTool(id);
    if (tool) grid.appendChild(makeToolCard(tool, index));
  });
  row.appendChild(grid);
  target.appendChild(row);
}

function renderAllGrid() {
  const grid = document.getElementById('tool-grid');
  if (!grid) return;
  grid.replaceChildren();
  grid.classList.remove('animate-cards');
  void grid.offsetWidth;
  grid.classList.add('animate-cards');

  const q = allSearch.trim().toLowerCase();
  const results = TOOLS.filter(tool => {
    const inCat = allCategory === 'all' || tool.category === allCategory;
    return inCat && (!q || tool.name.toLowerCase().includes(q) || tool.desc.toLowerCase().includes(q));
  });

  if (!results.length) {
    const empty = document.createElement('p');
    empty.className = 'search-empty';
    empty.textContent = q ? `No tools match "${allSearch.trim()}"` : 'No tools in this category.';
    grid.appendChild(empty);
    return;
  }
  results.forEach((tool, index) => grid.appendChild(makeToolCard(tool, index)));
}

function copyLink(value, message) {
  navigator.clipboard.writeText(value)
    .then(() => {
      const evt = new CustomEvent('pt-toast', { detail: message });
      window.dispatchEvent(evt);
    })
    .catch(() => window.dispatchEvent(new CustomEvent('pt-toast', { detail: 'Copy failed.' })));
}

function renderRoute() {
  const hash = window.location.hash || '#/';
  if (!hash || hash === '#' || hash === '#/') {
    renderLanding();
    return;
  }
  if (hash === '#/all') {
    renderAllTools();
    return;
  }
  if (hash.startsWith('#/pocket/')) {
    const pocketId = decodeURIComponent(hash.replace('#/pocket/', '')).trim();
    renderPocket(pocketId);
  }
}

function initTheme() {
  const btn = document.getElementById('btn-theme');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme') ||
      (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const next = current === 'dark' ? 'light' : 'dark';
    const r = btn.getBoundingClientRect();
    const x = Math.round(r.left + r.width / 2);
    const y = Math.round(r.top + r.height / 2);
    const maxR = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    html.style.setProperty('--theme-x', `${x}px`);
    html.style.setProperty('--theme-y', `${y}px`);
    html.style.setProperty('--theme-r', `${Math.ceil(maxR)}px`);
    const apply = () => {
      html.setAttribute('data-theme', next);
      localStorage.setItem('pt-theme', next);
    };
    if (!document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      apply();
      return;
    }
    document.startViewTransition(apply);
  });
}

function initMobileTabs() {
  document.querySelectorAll('[data-mobile-route]').forEach(btn => {
    btn.addEventListener('click', () => {
      window.location.hash = btn.dataset.mobileRoute;
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderRoute();
  appRouter.handleRoute();
  initTheme();
  initMobileTabs();

  window.addEventListener('hashchange', () => {
    const hash = window.location.hash || '';
    if (hash.startsWith('#/tool/')) {
      const toolId = decodeURIComponent(hash.replace('#/tool/', '')).trim();
      saveRecent(toolId);
    } else {
      renderRoute();
    }
  });

  window.addEventListener('pt-toast', (event) => {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast success';
    toast.textContent = event.detail || 'Done.';
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 1800);
  });

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js')
      .catch(err => console.warn('[sw] registration failed:', err));
  }
});
