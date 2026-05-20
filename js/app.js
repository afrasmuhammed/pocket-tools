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

function pocketMarkSvgStr(pocketId, size = 18) {
  const sw = 1.7;
  const a = `width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"`;
  switch (pocketId) {
    case 'daily':
      return `<svg ${a}><circle cx="12" cy="12" r="3" fill="currentColor"/><circle cx="12" cy="4" r="1.4"/><circle cx="12" cy="20" r="1.4"/><circle cx="4" cy="12" r="1.4"/><circle cx="20" cy="12" r="1.4"/><circle cx="6" cy="6" r="1.1"/><circle cx="18" cy="6" r="1.1"/><circle cx="6" cy="18" r="1.1"/><circle cx="18" cy="18" r="1.1"/></svg>`;
    case 'developer':
      return `<svg ${a}><path d="M8 4 3 12l5 8M16 4l5 8-5 8"/><path d="M14 4l-4 16" stroke-opacity=".55"/></svg>`;
    case 'designer':
      return `<svg ${a}><circle cx="9" cy="9" r="5" fill="currentColor" fill-opacity=".22"/><circle cx="15" cy="11" r="5" fill="currentColor" fill-opacity=".22"/><circle cx="12" cy="16" r="5" fill="currentColor" fill-opacity=".22"/></svg>`;
    case 'qa':
      return `<svg ${a}><rect x="3" y="4" width="18" height="16" rx="3"/><path d="m7 12 3 3 7-7"/></svg>`;
    case 'student':
      return `<svg ${a}><path d="M3 6a2 2 0 0 1 2-2h6v17H5a2 2 0 0 1-2-2zM21 6a2 2 0 0 0-2-2h-6v17h6a2 2 0 0 0 2-2z"/><path d="M6 8h2M6 11h2M16 8h2M16 11h2"/></svg>`;
    case 'shop':
      return `<svg ${a}><path d="M5 8h14l-1.5 12h-11zM8 8V6a4 4 0 0 1 8 0v2"/><circle cx="10" cy="13" r="1" fill="currentColor" stroke="none"/><circle cx="14" cy="13" r="1" fill="currentColor" stroke="none"/></svg>`;
    case 'seo':
      return `<svg ${a}><circle cx="10" cy="10" r="6"/><path d="m20 20-5-5"/></svg>`;
    case 'pdf':
      return `<svg ${a}><path d="M6 3h9l3 3v15H6z"/><path d="M15 3v3h3"/><path d="M9 12h6M9 16h4"/></svg>`;
    default:
      return `<svg ${a}><circle cx="12" cy="12" r="4"/></svg>`;
  }
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
    <div class="pk-pocket-chips">${pocket.tools.slice(0, 4).map(toolIconChip).join('')}<span>+${Math.max(0, pocket.tools.length - 4)}</span></div>
    <div class="pk-pocket-foot">
      <span>${pocket.access === 'free' ? 'Ready now' : 'Pro pocket'}</span>
      <span>Open →</span>
    </div>
  `;
  return card;
}

function makeHeroStack() {
  const daily = getPocket('daily');
  const CONTAINER_W = 400;
  const WIDTH_FRONT = 360;
  const WIDTH_STEP  = 16;
  const STAGGER_Y   = 40;
  const CARD_H      = 46;

  // Back-to-front order (shop = bottom, designer = just behind Daily)
  const backPocketIds = ['shop', 'student', 'qa', 'designer'];
  const backPockets = backPocketIds.map(id => getPocket(id)).filter(Boolean);

  const backCards = backPockets.map((pocket, i) => {
    const w   = WIDTH_FRONT - (backPockets.length - i) * WIDTH_STEP;
    const x   = (CONTAINER_W - w) / 2;
    const top = i * STAGGER_Y;
    return `
      <div class="pk-stack-card pk-stack-peek" style="
        position:absolute;left:${x}px;width:${w}px;top:${top}px;height:${CARD_H}px;
        z-index:${i + 1};--pocket-accent:${pocket.accent};
        padding:0 14px;border-radius:12px;
        background:linear-gradient(180deg,color-mix(in srgb,white 4%,transparent),transparent 32%),color-mix(in srgb,var(--card) 94%,var(--pocket-accent) 6%);
        border:1px solid color-mix(in srgb,var(--pocket-accent) 28%,var(--border));
        box-shadow:inset 0 1px 0 color-mix(in srgb,white 7%,transparent),0 6px 18px -10px rgba(0,0,0,0.45);
      ">
        <span class="pk-mark" style="--pocket-accent:${pocket.accent};width:22px;height:22px;border-radius:6px;flex-shrink:0">${pocketMarkSvgStr(pocket.id, 13)}</span>
        <strong>${pocket.shortName}</strong>
        ${badge('pro')}
      </div>`;
  }).join('');

  const frontLeft = (CONTAINER_W - WIDTH_FRONT) / 2;
  const frontTop  = backPockets.length * STAGGER_Y;
  const toolChips = daily.tools.slice(0, 3).map(id => {
    const tool = getTool(id);
    return tool ? `<span class="pk-icon-chip">${svgPath(tool.icon)}</span>` : '';
  }).join('');
  const moreCount = daily.tools.length - 3;

  return `
    <div class="pk-stack" aria-hidden="true">
      ${backCards}
      <div class="pk-stack-card pk-stack-front" style="
        position:absolute;left:${frontLeft}px;width:${WIDTH_FRONT}px;top:${frontTop}px;
        z-index:10;--pocket-accent:${daily.accent};
        padding:18px 20px 16px;border-radius:16px;
        box-shadow:inset 0 1px 0 rgba(255,255,255,0.07),0 18px 36px -18px rgba(0,0,0,0.55);
      ">
        <div class="pk-pocket-head" style="margin-bottom:14px">
          <span class="pk-mark" style="--pocket-accent:${daily.accent};width:32px;height:32px;border-radius:9px">${pocketMarkSvgStr('daily', 18)}</span>
          ${badge('free')}
        </div>
        <div class="pk-stack-daily-title">Daily</div>
        <div class="pk-stack-daily-desc" style="font-family:var(--font-mono-ui);font-size:10.5px;letter-spacing:0.06em;text-transform:uppercase;color:var(--muted);margin:2px 0 14px">${daily.tools.length} TOOLS · FREE</div>
        <div class="pk-stack-icon-chips">
          ${toolChips}
          <span class="pk-chips-more">+${moreCount} MORE</span>
        </div>
        <div class="pk-pocket-foot" style="margin-top:14px">
          <span></span>
          <span>Open →</span>
        </div>
      </div>
    </div>
  `;
}

function makeMobilePockets() {
  const daily = getPocket('daily');
  const proPockets = POCKETS.filter(p => p.access === 'pro');
  return `
    <div class="pk-mobile-pockets">
      <a class="pk-pocket-card" href="#/pocket/daily" style="--pocket-accent:${daily.accent}">
        <span class="pk-pocket-aura" aria-hidden="true"></span>
        <div class="pk-pocket-head">
          <div class="pk-pocket-identity">
            ${pocketMark(daily)}
            <div>
              <h3>${daily.name}</h3>
              <span>FREE FOREVER · NO ACCOUNT</span>
            </div>
          </div>
          ${badge('free')}
        </div>
        <div class="pk-pocket-chips">${daily.tools.slice(0, 4).map(toolIconChip).join('')}<span>+${Math.max(0, daily.tools.length - 4)}</span></div>
        <div class="pk-pocket-foot">
          <span style="font-family:var(--font-mono-ui);font-size:11px;letter-spacing:.05em;text-transform:uppercase">${daily.tools.length} TOOLS</span>
          <span>Open Daily →</span>
        </div>
      </a>
      <p class="pk-section-title" style="margin-top:20px;margin-bottom:10px">Pro pockets</p>
      <div class="pk-mobile-pro-rows">
        ${proPockets.slice(0, 4).map(pocket => `
          <a class="pk-mobile-pro-row" href="#/pocket/${encodeURIComponent(pocket.id)}" style="--pocket-accent:${pocket.accent}">
            <span class="pk-pocket-aura" aria-hidden="true"></span>
            ${pocketMark(pocket)}
            <div class="pk-mobile-pro-row-body">
              <div class="pk-mobile-pro-row-name">${pocket.name}</div>
              <div class="pk-mobile-pro-row-desc">${pocket.desc}</div>
            </div>
            ${badge('pro')}
          </a>
        `).join('')}
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
          <h2>Small tools,<br><em>neatly packed.</em></h2>
          <p>PocketKit is a private utility app, organized into pockets you can actually find later. Daily tools stay free. Open a Pro pocket when the day demands one.</p>
          <div class="pk-hero-actions">
            <a class="btn pk-btn-primary" href="#/pocket/daily">Open PocketKit Daily</a>
            <a class="btn btn-secondary" href="#/all">Browse all tools</a>
          </div>
          <div class="pk-trust-row">
            <span>Private by default</span>
            <span>Works offline</span>
            <span>Installs in a click</span>
          </div>
        </div>
        ${makeHeroStack()}
      </div>
      ${makeMobilePockets()}
    </section>

    <section id="pockets" class="pk-section pk-desktop-section">
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
      <div class="pk-why-card">
        <div class="pk-value-v2">
          <div class="pk-value-v2-head">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z"></path></svg>
            <strong>Private by default</strong>
          </div>
          <span>Local tools run in your browser. Nothing uploads. No account needed for Daily.</span>
        </div>
        <div class="pk-value-v2 pk-value-v2-sep">
          <div class="pk-value-v2-head">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 0 1 18 0M7 16a5 5 0 0 1 10 0M11 20h2"></path></svg>
            <strong>Works offline</strong>
          </div>
          <span>PocketKit is installable. Most tools keep working on planes, trains, and bad WiFi.</span>
        </div>
        <div class="pk-value-v2 pk-value-v2-sep">
          <div class="pk-value-v2-head">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12h6l2 3h2l2-3h6M3 12l3-8h12l3 8v8H3z"></path></svg>
            <strong>Organized in pockets</strong>
          </div>
          <span>No wall of ${TOOLS.length} tools. Open the pocket that matches the work in front of you.</span>
        </div>
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

  const block = document.createElement('div');
  block.className = 'pk-recent-block-v2';

  const header = document.createElement('div');
  header.className = 'pk-recent-header';
  header.innerHTML = '<p class="pk-section-title" style="margin:0">Recently used</p>';
  block.appendChild(header);

  const rail = document.createElement('div');
  rail.className = 'pk-recent-rail';

  ids.forEach(id => {
    const tool = getTool(id);
    if (!tool) return;
    const pocket = getPrimaryPocketForTool(tool.id);
    const pill = document.createElement('a');
    pill.className = 'pk-recent-pill';
    pill.href = `#/tool/${encodeURIComponent(tool.id)}`;
    if (pocket) pill.style.setProperty('--pocket-accent', pocket.accent);
    pill.innerHTML = `
      <span class="pk-recent-pill-icon">${svgPath(tool.icon)}</span>
      <span class="pk-recent-pill-name">${tool.name}</span>
      ${pocket ? `<span class="pk-recent-pill-pocket">${pocket.shortName}</span>` : ''}
    `;
    rail.appendChild(pill);
  });

  block.appendChild(rail);
  target.appendChild(block);
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
