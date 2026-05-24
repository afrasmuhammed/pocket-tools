import { appRouter } from './router.js?v=39';
import {
  CATEGORIES,
  POCKETS,
  TOOLS,
  getPocket,
  getPrimaryPocketForTool,
  getTool,
  getToolsForPocket,
} from './registry.js?v=24';

const RECENT_KEY = 'pt-recent';
const FAVORITE_KEY = 'pk-favorites';
const USAGE_KEY = 'pk-usage';
const RECENT_MAX = 4;
const FAVORITE_MAX = 12;
const CATEGORY_LABELS = Object.fromEntries(CATEGORIES.map(cat => [cat.id, cat.label]));
const DEFAULT_META = {
  title: 'PocketKit',
  desc: 'PocketKit — private everyday tools, installed like an app.',
};
const TOOL_ALIASES = {
  'image-compressor': 'compress image shrink photo reduce jpg png webp optimize resize',
  'format-converter': 'convert image jpg png webp heic format',
  'qr-generator': 'qr code barcode wifi link url share',
  'password-generator': 'password passphrase secure random login credential',
  'json-formatter': 'json beautify pretty print validate minify lint developer',
  'json-schema-validator': 'schema validate ajv required properties types json',
  'csv-cleaner': 'csv clean trim normalize headers rows columns spreadsheet',
  'utm-builder': 'utm campaign url builder marketing qr source medium campaign',
  'text-redactor': 'redact hide mask pii email phone card ip privacy',
  'color-contrast': 'wcag contrast checker accessibility colors aa aaa',
  'pdf-metadata': 'pdf metadata title author pages size created modified',
  'safe-share-link': 'clean url link tracking remove safe share privacy utm fbclid gclid',
  'exif-cleaner': 'exif metadata remove photo image privacy camera location clean',
  'meeting-actions': 'meeting notes action items decisions owners due dates summary',
  'subscription-audit': 'subscriptions recurring charges monthly yearly spend audit cancel',
  'jwt-decoder': 'jwt token decode auth bearer claims header payload',
  'base64-encoder': 'base64 encode decode atob btoa',
  'url-encoder': 'url encode decode uri percent escape',
  'hash-generator': 'hash sha md5 checksum digest',
  'hmac-generator': 'hmac signature sha secret',
  'regex-tester': 'regex regexp regular expression pattern match',
  'text-diff': 'diff compare text changes',
  'slug-generator': 'slug url title permalink seo kebab case',
  'word-counter': 'word count character sentence paragraph writing',
  'character-counter': 'character count letters length',
  'reading-time': 'reading time words minutes article',
  'merge-pdf': 'combine pdf join documents',
  'compress-pdf': 'shrink pdf reduce size optimize',
  'split-pdf': 'extract pages split pdf separate',
  'protect-pdf': 'password protect encrypt lock pdf',
  'unprotect-pdf': 'unlock decrypt remove password pdf',
  'page-numbers': 'number pages paginate pdf footer',
  'photo-pdf': 'images to pdf photo document scan',
  'meta-tags': 'seo title description social tags',
  'og-preview': 'open graph preview social share card',
  'keyword-density': 'seo keywords content analysis',
  'robots-txt': 'robots crawl disallow sitemap',
  'sitemap-formatter': 'sitemap xml urls seo',
  'canonical-url': 'canonical link seo duplicate',
  'timestamp-converter': 'unix epoch time date',
  'timezone': 'timezone world clock convert time',
  'pomodoro': 'focus timer productivity work break',
  'stopwatch': 'timer laps clock',
};

let allCategory = 'all';
let allSearch = '';
let pocketSearch = '';
let commandOpen = false;
let commandActiveIndex = 0;
let commandItems = [];
let deferredInstallPrompt = null;

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

function getUsage() {
  try { return JSON.parse(localStorage.getItem(USAGE_KEY)) || {}; }
  catch { return {}; }
}

function recordUsage(toolId) {
  const usage = getUsage();
  usage[toolId] = {
    count: (usage[toolId]?.count || 0) + 1,
    lastUsed: Date.now(),
  };
  try { localStorage.setItem(USAGE_KEY, JSON.stringify(usage)); } catch {}
}

function getMostUsed(limit = 6) {
  const usage = getUsage();
  return Object.entries(usage)
    .filter(([id, meta]) => getTool(id) && meta?.count > 1)
    .sort((a, b) => (b[1].count - a[1].count) || (b[1].lastUsed - a[1].lastUsed))
    .slice(0, limit)
    .map(([id]) => id);
}

function getFavorites() {
  try { return JSON.parse(localStorage.getItem(FAVORITE_KEY)) || []; }
  catch { return []; }
}

function saveFavorites(ids) {
  const clean = [...new Set(ids)].filter(id => getTool(id)).slice(0, FAVORITE_MAX);
  try { localStorage.setItem(FAVORITE_KEY, JSON.stringify(clean)); } catch {}
  return clean;
}

function isFavorite(toolId) {
  return getFavorites().includes(toolId);
}

function toggleFavorite(toolId) {
  const list = getFavorites();
  const next = list.includes(toolId)
    ? list.filter(id => id !== toolId)
    : [toolId, ...list].slice(0, FAVORITE_MAX);
  saveFavorites(next);
  window.dispatchEvent(new CustomEvent('pt-toast', {
    detail: next.includes(toolId) ? 'Saved to your kit.' : 'Removed from your kit.',
  }));
  renderPersonalRows();
}

function svgPath(path, className = 'icon') {
  return `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${path}"></path></svg>`;
}

function toolSearchText(tool) {
  const pocket = getPrimaryPocketForTool(tool.id);
  return [
    tool.name,
    tool.desc,
    tool.id,
    tool.category,
    CATEGORY_LABELS[tool.category],
    pocket?.name,
    pocket?.shortName,
    TOOL_ALIASES[tool.id],
  ].filter(Boolean).join(' ').toLowerCase();
}

function matchesTool(tool, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const hay = toolSearchText(tool);
  return q.split(/\s+/).every(part => hay.includes(part));
}

function setMeta(title, desc, path = '/') {
  document.title = title;
  const description = document.querySelector('meta[name="description"]');
  const ogTitle = document.querySelector('meta[property="og:title"]');
  const ogDesc = document.querySelector('meta[property="og:description"]');
  const ogUrl = document.querySelector('meta[property="og:url"]');
  const twTitle = document.querySelector('meta[name="twitter:title"]');
  const twDesc = document.querySelector('meta[name="twitter:description"]');
  description?.setAttribute('content', desc);
  ogTitle?.setAttribute('content', title);
  ogDesc?.setAttribute('content', desc);
  ogUrl?.setAttribute('content', `https://pocketkit.app/${path}`);
  twTitle?.setAttribute('content', title);
  twDesc?.setAttribute('content', desc);
}

function updateRouteMeta(hash = window.location.hash || '#/') {
  if (!hash || hash === '#' || hash === '#/') {
    setMeta(DEFAULT_META.title, DEFAULT_META.desc, '');
    return;
  }
  if (hash.startsWith('#/all')) {
    const q = getAllRouteQuery();
    const suffix = q ? ` matching "${q}"` : '';
    setMeta('All PocketKit Tools', `${TOOLS.length} private browser tools${suffix} across ${POCKETS.length} organized pockets.`, hash);
    return;
  }
  if (hash.startsWith('#/pocket/')) {
    const pocket = getPocket(decodeURIComponent(hash.replace('#/pocket/', '')).trim());
    if (pocket) {
      setMeta(pocket.name, `${pocket.desc} ${pocket.tools.length} tools in this PocketKit pocket.`, `#/pocket/${pocket.id}`);
      return;
    }
  }
  if (hash.startsWith('#/tool/')) {
    const tool = getTool(decodeURIComponent(hash.replace('#/tool/', '')).trim());
    if (tool) {
      setMeta(`${tool.name} — PocketKit`, `${tool.desc}. Private, browser-based, and installable.`, `#/tool/${tool.id}`);
    }
  }
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
  if (isFavorite(tool.id)) classes.push('pk-tool-saved');

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
    ${isFavorite(tool.id) ? '<span class="pk-saved-corner" aria-label="Saved">Saved</span>' : ''}
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
        ${proPockets.map(pocket => `
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

function makeToolRail(ids, label, emptyText = '', options = {}) {
  const valid = ids.filter(id => getTool(id));
  if (!valid.length && !emptyText) return '';
  return `
    <div class="pk-personal-block">
      <div class="pk-recent-header">
        <p class="pk-section-title" style="margin:0">${label}</p>
        ${valid.length && options.action ? `<button type="button" class="pk-rail-action" data-pk-action="${options.action}">${options.actionLabel || 'Clear'}</button>` : ''}
      </div>
      ${valid.length ? `
        <div class="pk-recent-rail">
          ${valid.map(id => {
            const tool = getTool(id);
            const pocket = getPrimaryPocketForTool(tool.id);
            return `
              <a class="pk-recent-pill" href="#/tool/${encodeURIComponent(tool.id)}" style="${pocket ? `--pocket-accent:${pocket.accent}` : ''}">
                <span class="pk-recent-pill-icon">${svgPath(tool.icon)}</span>
                <span class="pk-recent-pill-name">${tool.name}</span>
                ${pocket ? `<span class="pk-recent-pill-pocket">${pocket.shortName}</span>` : ''}
              </a>
            `;
          }).join('')}
        </div>
      ` : `<p class="pk-personal-empty">${emptyText}</p>`}
    </div>
  `;
}

function makeQuickStart(toolId, title, desc) {
  const tool = getTool(toolId);
  const pocket = tool ? getPrimaryPocketForTool(tool.id) : null;
  if (!tool) return '';
  return `
    <a class="pk-quick-start" href="#/tool/${encodeURIComponent(tool.id)}" style="${pocket ? `--pocket-accent:${pocket.accent}` : ''}">
      <span class="pk-quick-icon">${svgPath(tool.icon)}</span>
      <span>
        <strong>${title}</strong>
        <small>${desc}</small>
      </span>
    </a>
  `;
}

function renderPersonalRows() {
  const target = document.getElementById('pk-personal-target');
  if (!target) return;
  const favorites = getFavorites();
  const recent = getRecent();
  target.innerHTML = [
    makeToolRail(favorites, 'Saved tools', '', { action: 'clear-saved', actionLabel: 'Clear saved' }),
    makeToolRail(getMostUsed(), 'Most used', '', { action: 'clear-usage', actionLabel: 'Reset usage' }),
    makeToolRail(recent, 'Recently used', '', { action: 'clear-recent', actionLabel: 'Clear recent' }),
  ].filter(Boolean).join('');
}

function renderLanding() {
  const view = setHomeContent(`
    <section class="pk-landing">
      <div class="pk-hero">
        <p class="pk-kicker">${POCKETS.length} pockets · ${TOOLS.length} tools · Installable app</p>
        <h2>Small tools,<br><em>neatly packed.</em></h2>
        <p>PocketKit is a private utility app, organized into pockets you can actually find later. Daily tools stay free. Preview Pro pockets while paid access is being prepared.</p>
        <div class="pk-hero-actions">
          <a class="btn pk-btn-primary" href="#/pocket/daily">Open PocketKit Daily</a>
          <button class="btn btn-secondary" type="button" data-open-command>Quick open</button>
          <a class="btn btn-secondary" href="#/all">Browse all tools</a>
        </div>
        <div class="pk-trust-row">
          <span>Private by default</span>
          <span>Works offline</span>
          <span>Installs in a click</span>
        </div>
      </div>
      <div class="pk-launch-board" aria-label="Fast starts">
        <div class="pk-launch-board-head">
          <p class="pk-section-title">Fast starts</p>
          <span>Jump straight into the most common jobs.</span>
        </div>
        <div class="pk-quick-grid">
          ${makeQuickStart('json-formatter', 'Clean data', 'Format JSON instantly')}
          ${makeQuickStart('image-compressor', 'Shrink images', 'Compress before sharing')}
          ${makeQuickStart('merge-pdf', 'Work with PDFs', 'Merge, split, protect')}
          ${makeQuickStart('word-counter', 'Check text', 'Count words and reading time')}
          ${makeQuickStart('qr-generator', 'Share something', 'Make QR codes fast')}
        </div>
      </div>
      <div id="pk-personal-target" class="pk-personal-target"></div>
      ${makeMobilePockets()}
    </section>

    <section id="pockets" class="pk-section pk-desktop-section">
      <div class="pk-section-head">
        <div>
          <p class="pk-section-title">Pockets</p>
          <h2>Open the pocket you need.</h2>
          <p>Daily is ready for everyone. Pro pockets stay visible so you can see what's coming next.</p>
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
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="m9 12 2 2 4-4"/></svg>
            <strong>Works offline</strong>
          </div>
          <span>PocketKit is installable. Most tools keep working on planes, trains, and without a connection.</span>
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
        <button class="btn btn-secondary" type="button" id="btn-install-app">Install app</button>
      </div>
    </section>

    <section class="pk-section">
      <p class="pk-section-title">Free and Pro</p>
      <div class="pk-pricing-grid">
        <div class="pk-price-card">
          ${badge('free')}
          <h3>PocketKit Daily</h3>
          <strong class="pk-price">Free <span>forever</span></strong>
          <p>Everyday tools available without an account. Install to your device and use offline. Always.</p>
          <ul class="pk-feature-list">
            <li>${POCKETS.find(p => p.id === 'daily')?.tools.length || 0} Daily tools</li>
            <li>Install as PWA</li>
            <li>Works offline</li>
            <li>No uploads for local tools</li>
          </ul>
          <a class="btn btn-secondary" href="#/pocket/daily">Open Daily</a>
        </div>
        <div class="pk-price-card pk-price-card-featured">
          ${badge('pro')}
          <h3>All Pro pockets</h3>
          <strong class="pk-price">$24 <span>/year · planned launch price</span></strong>
          <p>Preview seven specialized pockets — PDF, Designer, Student, Developer, QA, SEO, and Shop. Paid access will open when payments are ready.</p>
          <div class="pk-pro-pocket-list">${POCKETS.filter(pocket => pocket.access === 'pro').map(pocket => `<span style="--pocket-accent:${pocket.accent}">${pocket.shortName}</span>`).join('')}</div>
          <a class="btn btn-secondary" href="#/pocket/developer">Preview Pro</a>
        </div>
      </div>
      <p class="pk-pricing-note">Pro pricing is a launch preview. Daily stays free while paid access is being prepared.</p>
    </section>
  `);

  const grid = view.querySelector('#pocket-grid');
  POCKETS.forEach(pocket => grid.appendChild(makePocketCard(pocket)));
  renderPersonalRows();
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
          <p><strong>${pocket.name} is a Pro pocket.</strong> Preview the tools below. Daily stays free; paid access will open when payments are ready.</p>
          <button class="btn pk-btn-primary" id="btn-preview-pocket">Preview tools</button>
        </div>
      ` : ''}
      <div class="pk-starting-points">
        <div>
          <p class="pk-section-title">Good starting points</p>
          <span>${pocket.access === 'free' ? 'Fast daily picks' : 'Useful preview tools'} from this pocket.</span>
        </div>
        <div class="pk-starting-links">
          ${tools.slice(0, 4).map(tool => `<a href="#/tool/${encodeURIComponent(tool.id)}">${tool.name}</a>`).join('')}
        </div>
      </div>
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
      .filter(tool => matchesTool(tool, q))
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
  view.querySelector('#btn-preview-pocket')?.addEventListener('click', () => {
    grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  pocketSearch = '';
  renderTools();
}

function renderAllTools() {
  const routeQuery = getAllRouteQuery();
  if (routeQuery !== null) allSearch = routeQuery;

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
      <div id="saved-row-target"></div>
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
  renderSaved(view);
  renderMostUsed(view);
  renderRecent(view);
  renderAllGrid();
}

function renderSaved(view) {
  const target = view.querySelector('#saved-row-target');
  if (!target) return;
  const html = makeToolRail(getFavorites(), 'Saved tools', '', { action: 'clear-saved', actionLabel: 'Clear saved' });
  if (html) target.innerHTML = html;
}

function renderMostUsed(view) {
  const recentTarget = view.querySelector('#recent-row-target');
  if (!recentTarget) return;
  const wrapper = document.createElement('div');
  wrapper.innerHTML = makeToolRail(getMostUsed(), 'Most used', '', { action: 'clear-usage', actionLabel: 'Reset usage' });
  if (wrapper.firstElementChild) recentTarget.before(wrapper.firstElementChild);
}

function renderRecent(view) {
  const target = view.querySelector('#recent-row-target');
  const ids = getRecent().filter(id => getTool(id));
  if (!target || !ids.length) return;

  const block = document.createElement('div');
  block.className = 'pk-recent-block-v2';

  const header = document.createElement('div');
  header.className = 'pk-recent-header';
  header.innerHTML = '<p class="pk-section-title" style="margin:0">Recently used</p><button type="button" class="pk-rail-action" data-pk-action="clear-recent">Clear recent</button>';
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
    return inCat && matchesTool(tool, q);
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

function refreshActivePage() {
  const hash = window.location.hash || '#/';
  if (hash.startsWith('#/tool/')) return;
  renderRoute();
}

function initPersonalActions() {
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-pk-action]');
    if (!button) return;
    const action = button.dataset.pkAction;
    if (action === 'clear-saved') {
      localStorage.removeItem(FAVORITE_KEY);
      window.dispatchEvent(new CustomEvent('pt-toast', { detail: 'Saved tools cleared.' }));
      refreshActivePage();
    } else if (action === 'clear-recent') {
      localStorage.removeItem(RECENT_KEY);
      window.dispatchEvent(new CustomEvent('pt-toast', { detail: 'Recent tools cleared.' }));
      refreshActivePage();
    } else if (action === 'clear-usage') {
      localStorage.removeItem(USAGE_KEY);
      window.dispatchEvent(new CustomEvent('pt-toast', { detail: 'Usage stats reset.' }));
      refreshActivePage();
    }
  });
}

function getAllRouteQuery() {
  const hash = window.location.hash || '';
  if (!hash.startsWith('#/all?')) return null;
  try {
    return new URLSearchParams(hash.slice(hash.indexOf('?') + 1)).get('q') || '';
  } catch {
    return '';
  }
}

function showUpdateNotice(registration) {
  if (document.getElementById('pk-update-notice')) return;
  const notice = document.createElement('div');
  notice.id = 'pk-update-notice';
  notice.className = 'pk-update-notice';
  notice.innerHTML = `
    <span>Fresh PocketKit is ready.</span>
    <button type="button">Update now</button>
  `;
  notice.querySelector('button')?.addEventListener('click', () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    } else {
      window.location.reload();
    }
  });
  document.body.appendChild(notice);
}

function initInstallPrompt() {
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredInstallPrompt = event;
    document.documentElement.classList.add('can-install');
  });

  document.addEventListener('click', async event => {
    const button = event.target.closest('#btn-install-app');
    if (!button) return;
    if (!deferredInstallPrompt) {
      window.dispatchEvent(new CustomEvent('pt-toast', { detail: 'Use your browser menu to install PocketKit.' }));
      return;
    }
    deferredInstallPrompt.prompt();
    const result = await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    document.documentElement.classList.remove('can-install');
    window.dispatchEvent(new CustomEvent('pt-toast', {
      detail: result.outcome === 'accepted' ? 'PocketKit install started.' : 'Install skipped.',
    }));
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    document.documentElement.classList.remove('can-install');
    window.dispatchEvent(new CustomEvent('pt-toast', { detail: 'PocketKit installed.' }));
  });
}

function scoreCommandItem(item, query) {
  if (!query) return item.weight || 0;
  const hay = `${item.title} ${item.subtitle || ''} ${item.keywords || ''}`.toLowerCase();
  if (hay.includes(query)) return 100 + (item.weight || 0) - hay.indexOf(query);
  const chars = query.split('');
  let pos = -1;
  let score = item.weight || 0;
  for (const ch of chars) {
    const next = hay.indexOf(ch, pos + 1);
    if (next === -1) return -1;
    score += Math.max(1, 12 - (next - pos));
    pos = next;
  }
  return score;
}

function buildCommandItems() {
  const favorites = new Set(getFavorites());
  const recent = new Set(getRecent());
  const mostUsed = new Set(getMostUsed(8));
  const actionItems = [
    {
      type: 'action',
      section: 'Actions',
      title: 'Browse all tools',
      subtitle: `${TOOLS.length} tools in one searchable library`,
      href: '#/all',
      accent: 'var(--accent)',
      mark: 'All',
      keywords: 'all library browse search tools',
      weight: 16,
    },
    {
      type: 'action',
      section: 'Actions',
      title: 'Toggle theme',
      subtitle: 'Switch light and dark mode',
      action: 'theme',
      accent: 'var(--accent)',
      mark: 'UI',
      keywords: 'dark light theme appearance',
      weight: 10,
    },
    {
      type: 'action',
      section: 'Actions',
      title: 'Install PocketKit',
      subtitle: 'Add the app to this device',
      action: 'install',
      accent: 'var(--accent)',
      mark: 'App',
      keywords: 'install app pwa home screen dock',
      weight: 9,
    },
  ];
  const pocketItems = POCKETS.map(pocket => ({
    type: 'pocket',
    section: 'Pockets',
    title: pocket.name,
    subtitle: `${pocket.tools.length} tools · ${pocket.access === 'free' ? 'Free' : 'Pro preview'}`,
    href: `#/pocket/${encodeURIComponent(pocket.id)}`,
    accent: pocket.accent,
    mark: pocket.shortName.slice(0, 2),
    keywords: `${pocket.shortName} ${pocket.desc}`,
    weight: pocket.id === 'daily' ? 18 : 8,
  }));
  const toolItems = TOOLS.map(tool => {
    const pocket = getPrimaryPocketForTool(tool.id);
    return {
      type: 'tool',
      section: favorites.has(tool.id) ? 'Saved' : mostUsed.has(tool.id) ? 'Most Used' : recent.has(tool.id) ? 'Recent' : 'Tools',
      title: tool.name,
      subtitle: `${pocket?.shortName || CATEGORY_LABELS[tool.category]} · ${tool.desc}`,
      href: `#/tool/${encodeURIComponent(tool.id)}`,
      accent: pocket?.accent || 'var(--accent)',
      icon: svgPath(tool.icon),
      keywords: `${tool.id} ${tool.category} ${pocket?.name || ''} ${TOOL_ALIASES[tool.id] || ''}`,
      weight: (favorites.has(tool.id) ? 30 : 0) + (recent.has(tool.id) ? 18 : 0),
    };
  });
  return [...actionItems, ...toolItems, ...pocketItems];
}

function groupCommandItems(items) {
  const order = ['Actions', 'Saved', 'Most Used', 'Recent', 'Pockets', 'Tools'];
  return order
    .map(section => ({ section, items: items.filter(item => item.section === section) }))
    .filter(group => group.items.length);
}

function renderCommandResults() {
  const input = document.getElementById('command-input');
  const results = document.getElementById('command-results');
  if (!input || !results) return;
  const query = input.value.trim().toLowerCase();
  const allItems = buildCommandItems();
  commandItems = query
    ? allItems
      .map(item => ({ item, score: scoreCommandItem(item, query) }))
      .filter(entry => entry.score >= 0)
      .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title))
      .slice(0, 9)
      .map(entry => entry.item)
    : [
      ...allItems.filter(item => item.section === 'Actions').slice(0, 3),
      ...allItems.filter(item => item.section === 'Saved').slice(0, 3),
      ...allItems.filter(item => item.section === 'Most Used').slice(0, 3),
      ...allItems.filter(item => item.section === 'Recent').slice(0, 3),
      ...allItems.filter(item => item.section === 'Pockets').slice(0, 4),
      ...allItems.filter(item => item.section === 'Tools').slice(0, 5),
    ].slice(0, 14);
  commandActiveIndex = Math.min(commandActiveIndex, Math.max(0, commandItems.length - 1));

  if (!commandItems.length) {
    results.innerHTML = '<p class="command-empty">No tools found.</p>';
    return;
  }

  let cursor = 0;
  results.innerHTML = groupCommandItems(commandItems).map(group => {
    const html = `
      <div class="command-section">
        <p>${group.section}</p>
        ${group.items.map(item => {
          const index = cursor++;
          return `
            <button type="button" class="command-item${index === commandActiveIndex ? ' active' : ''}" data-command-index="${index}" style="--pocket-accent:${item.accent}">
              <span class="command-item-icon">${item.icon || item.mark}</span>
              <span class="command-item-copy">
                <strong>${item.title}</strong>
                <span>${item.subtitle}</span>
              </span>
              <span class="command-item-type">${item.type}</span>
            </button>
          `;
        }).join('')}
      </div>
    `;
    return html;
  }).join('');
}

function openCommandPalette() {
  const palette = document.getElementById('command-palette');
  const input = document.getElementById('command-input');
  if (!palette || !input) return;
  commandOpen = true;
  commandActiveIndex = 0;
  palette.classList.remove('hidden');
  document.body.classList.add('command-open');
  input.value = '';
  renderCommandResults();
  requestAnimationFrame(() => input.focus());
}

function closeCommandPalette() {
  const palette = document.getElementById('command-palette');
  if (!palette) return;
  commandOpen = false;
  palette.classList.add('hidden');
  document.body.classList.remove('command-open');
}

function runCommand(index = commandActiveIndex) {
  const item = commandItems[index];
  if (!item) return;
  closeCommandPalette();
  if (item.action === 'theme') {
    document.getElementById('btn-theme')?.click();
    return;
  }
  if (item.action === 'install') {
    document.getElementById('btn-install-app')?.click();
    return;
  }
  window.location.hash = item.href;
}

function initCommandPalette() {
  const palette = document.getElementById('command-palette');
  const input = document.getElementById('command-input');
  const results = document.getElementById('command-results');
  document.getElementById('btn-quick-open')?.addEventListener('click', openCommandPalette);
  document.addEventListener('click', event => {
    if (event.target.closest('[data-open-command]')) openCommandPalette();
  });
  input?.addEventListener('input', () => {
    commandActiveIndex = 0;
    renderCommandResults();
  });
  results?.addEventListener('click', event => {
    const button = event.target.closest('[data-command-index]');
    if (!button) return;
    runCommand(Number(button.dataset.commandIndex || 0));
  });
  palette?.addEventListener('click', event => {
    if (event.target === palette) closeCommandPalette();
  });
  document.addEventListener('keydown', event => {
    const isShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
    if (isShortcut) {
      event.preventDefault();
      openCommandPalette();
      return;
    }
    if (!commandOpen) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeCommandPalette();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      commandActiveIndex = Math.min(commandActiveIndex + 1, commandItems.length - 1);
      renderCommandResults();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      commandActiveIndex = Math.max(commandActiveIndex - 1, 0);
      renderCommandResults();
    } else if (event.key === 'Enter') {
      event.preventDefault();
      runCommand();
    }
  });
}

function renderRoute() {
  const hash = window.location.hash || '#/';
  if (!hash || hash === '#' || hash === '#/') {
    renderLanding();
    return;
  }
  if (hash.startsWith('#/all')) {
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
  updateMobileTabs();
}

function updateNetworkStatus() {
  const status = document.getElementById('network-status');
  if (!status) return;
  const online = navigator.onLine !== false;
  status.textContent = online ? 'Online' : 'Offline ready';
  status.classList.toggle('hidden', online);
  status.classList.toggle('network-status-offline', !online);
}

function updateMobileTabs() {
  const hash = window.location.hash || '#/';
  document.querySelectorAll('[data-mobile-route]').forEach(btn => {
    const route = btn.dataset.mobileRoute;
    const active = route === '#/'
      ? (!hash || hash === '#' || hash === '#/')
      : hash === route || (route === '#/all' && (hash.startsWith('#/all') || hash.startsWith('#/tool/')));
    btn.classList.toggle('active', active);
    if (active) btn.setAttribute('aria-current', 'page');
    else btn.removeAttribute('aria-current');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  updateRouteMeta();
  renderRoute();
  appRouter.handleRoute();
  initTheme();
  initCommandPalette();
  initMobileTabs();
  initInstallPrompt();
  initPersonalActions();
  updateNetworkStatus();

  window.addEventListener('hashchange', () => {
    const hash = window.location.hash || '';
    if (hash.startsWith('#/tool/')) {
      const toolId = decodeURIComponent(hash.replace('#/tool/', '')).trim();
      saveRecent(toolId);
      recordUsage(toolId);
    } else {
      renderRoute();
    }
    updateRouteMeta(hash);
    updateMobileTabs();
  });

  window.addEventListener('online', updateNetworkStatus);
  window.addEventListener('offline', updateNetworkStatus);

  window.addEventListener('pk-toggle-favorite', (event) => {
    const toolId = event.detail?.toolId;
    if (toolId && getTool(toolId)) toggleFavorite(toolId);
  });

  window.addEventListener('pk-tool-opened', (event) => {
    const toolId = event.detail?.toolId;
    if (!toolId || !getTool(toolId)) return;
    saveRecent(toolId);
    recordUsage(toolId);
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
    const hadController = Boolean(navigator.serviceWorker.controller);
    let refreshedForController = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!hadController) return;
      if (refreshedForController) return;
      refreshedForController = true;
      window.location.reload();
    });

    navigator.serviceWorker.register('sw.js')
      .then(reg => {
        reg.update();
        reg.addEventListener('updatefound', () => {
          const installing = reg.installing;
          installing?.addEventListener('statechange', () => {
            if (installing.state === 'installed' && navigator.serviceWorker.controller) {
              showUpdateNotice(reg);
            }
          });
        });
        if (reg.waiting && navigator.serviceWorker.controller) showUpdateNotice(reg);
      })
      .catch(err => console.warn('[sw] registration failed:', err));
  }
});
