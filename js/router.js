import { UI } from './core/ui.js';
import { TOOLS, getPrimaryPocketForTool, getTool, isValidToolId } from './registry.js?v=22';

const FAVORITE_KEY = 'pk-favorites';

function getFavorites() {
  try { return JSON.parse(localStorage.getItem(FAVORITE_KEY)) || []; }
  catch { return []; }
}

function isFavorite(toolId) {
  return getFavorites().includes(toolId);
}

function svgPath(path, className = 'icon') {
  return `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${path}"></path></svg>`;
}

function makePTLogo() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'app-logo');
  svg.setAttribute('viewBox', '0 0 28 28');
  svg.setAttribute('aria-hidden', 'true');
  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('width', '28'); rect.setAttribute('height', '28'); rect.setAttribute('rx', '7');
  rect.setAttribute('style', 'fill: var(--accent)');
  const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  text.setAttribute('x', '14'); text.setAttribute('y', '19.5');
  text.setAttribute('text-anchor', 'middle'); text.setAttribute('fill', 'white');
  text.setAttribute('font-family', 'Inter,-apple-system,BlinkMacSystemFont,sans-serif');
  text.setAttribute('font-size', '11.5'); text.setAttribute('font-weight', '800');
  text.textContent = 'PK';
  svg.appendChild(rect); svg.appendChild(text);
  return svg;
}

function setAppTitle(element, title, showLogo = false) {
  element.replaceChildren();
  if (showLogo) element.appendChild(makePTLogo());
  const span = document.createElement('span');
  span.textContent = title;
  element.appendChild(span);
}

class Router {
  constructor() {
    this.currentToolId = null;
    this.templateCache = new Map();
    this.moduleCache = new Map();
    window.addEventListener('hashchange', () => this.handleRoute());
  }

  async handleRoute() {
    const viewHome      = document.getElementById('view-home');
    const viewTool      = document.getElementById('view-tool');
    const toolContainer = document.getElementById('tool-container');
    const btnBack       = document.getElementById('btn-back');
    const btnQuickOpen  = document.getElementById('btn-quick-open');
    const appTitle      = document.getElementById('app-title');

    const hash = window.location.hash || '';

    // App pages rendered by app.js
    if (!hash || hash === '#' || hash === '#/' || hash.startsWith('#/all') || hash.startsWith('#/pocket/')) {
      viewTool.classList.add('hidden');
      viewHome.classList.remove('hidden');
      document.body.classList.remove('tool-open');
      btnBack.classList.add('hidden');
      btnQuickOpen?.classList.remove('hidden');
      setAppTitle(appTitle, 'PocketKit', true);
      this.currentToolId = null;

      if (this._homeScroll) {
        window.scrollTo({ top: this._homeScroll, behavior: 'instant' });
        this._homeScroll = null;
      } else {
        window.scrollTo(0, 0);
      }
      return;
    }

    // Tool route
    if (hash.startsWith('#/tool/')) {
      this._homeScroll = window.scrollY;
      // Strip animate-cards so cards don't re-animate when user presses back
      document.getElementById('tool-grid')?.classList.remove('animate-cards');
      const toolId = decodeURIComponent(hash.replace('#/tool/', '')).trim();

      if (!isValidToolId(toolId)) {
        UI.showError('Unknown tool.');
        window.location.hash = '#/';
        return;
      }

      viewHome.classList.add('hidden');
      viewHome.replaceChildren();
      viewTool.classList.remove('hidden');
      document.body.classList.add('tool-open');
      btnBack.classList.remove('hidden');
      btnQuickOpen?.classList.add('hidden');
      btnBack.onclick = () => { window.location.hash = '#/all'; };

      const tool = getTool(toolId);
      setAppTitle(appTitle, tool.name, false);
      toolContainer.dataset.category = tool.category;
      toolContainer.replaceChildren();
      const skeleton = document.createElement('div');
      skeleton.className = 'skeleton';
      skeleton.setAttribute('aria-hidden', 'true');
      toolContainer.appendChild(skeleton);

      try {
        await this.loadTool(toolId, toolContainer);
        this.decorateTool(tool, toolContainer);
        window.dispatchEvent(new CustomEvent('pk-tool-opened', { detail: { toolId } }));
        window.scrollTo(0, 0);
      } catch (err) {
        console.error('[router] loadTool failed:', err);
        UI.showError('Could not load this tool. Try again.');
        toolContainer.replaceChildren();
        const msg = document.createElement('p');
        msg.className = 'muted';
        msg.textContent = 'Failed to load. Go back and try again.';
        toolContainer.appendChild(msg);
      }
      return;
    }

    window.location.hash = '#/';
  }

  async loadTool(toolId, container) {
    let html = this.templateCache.get(toolId);
    if (!html) {
      const res = await fetch(`templates/${toolId}.html?v=8`);
      if (!res.ok) throw new Error(`Template not found: ${toolId}`);
      html = await res.text();
      this.templateCache.set(toolId, html);
    }
    container.innerHTML = html;

    let module = this.moduleCache.get(toolId);
    if (!module) {
      module = await import(`./tools/${toolId}.js?v=7`);
      this.moduleCache.set(toolId, module);
    }

    if (module.default && typeof module.default.init === 'function') {
      await module.default.init();
      this.currentToolId = toolId;
      hookDropZones(container);
    }
  }

  decorateTool(tool, container) {
    const header = container.querySelector('.tool-header');
    if (!header || header.dataset.decorated === 'true') return;
    header.dataset.decorated = 'true';
    const pocket = getPrimaryPocketForTool(tool.id);

    const meta = document.createElement('div');
    meta.className = 'tool-meta-bar';
    meta.innerHTML = `
      <div class="pk-breadcrumb">
        <a href="#/">Home</a><span>/</span>
        ${pocket ? `<a href="#/pocket/${pocket.id}">${pocket.shortName}</a><span>/</span>` : ''}
        <span>${tool.name}</span>
      </div>
      <div class="tool-meta-actions">
        ${pocket ? `<span class="pk-badge ${pocket.access === 'free' ? 'pk-badge-free' : 'pk-badge-pro'}">${pocket.access === 'free' ? 'Free' : 'Pro'}</span>` : ''}
        <span class="pk-badge">Works offline</span>
        <button type="button" class="btn btn-secondary btn-small" id="btn-copy-tool-link">Copy link</button>
        <button type="button" class="btn btn-secondary btn-small" id="btn-save-tool" aria-pressed="${isFavorite(tool.id) ? 'true' : 'false'}">${isFavorite(tool.id) ? 'Saved' : 'Save'}</button>
      </div>
    `;
    header.prepend(meta);

    const copy = container.querySelector('#btn-copy-tool-link');
    const save = container.querySelector('#btn-save-tool');
    const copyLink = () => {
      navigator.clipboard.writeText(location.href)
        .then(() => UI.showSuccess('Tool link copied.'))
        .catch(() => UI.showError('Copy failed.'));
    };
    copy?.addEventListener('click', copyLink);
    save?.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('pk-toggle-favorite', { detail: { toolId: tool.id } }));
      const next = isFavorite(tool.id);
      save.textContent = next ? 'Saved' : 'Save';
      save.setAttribute('aria-pressed', next ? 'true' : 'false');
    });

    this.addRelatedTools(tool, container);
  }

  addRelatedTools(tool, container) {
    if (container.querySelector('.related-tools')) return;
    const currentPocket = getPrimaryPocketForTool(tool.id);
    const related = TOOLS
      .filter(candidate => candidate.id !== tool.id)
      .map(candidate => {
        const pocket = getPrimaryPocketForTool(candidate.id);
        let score = 0;
        if (candidate.category === tool.category) score += 3;
        if (pocket?.id && pocket.id === currentPocket?.id) score += 4;
        if (pocket?.access === currentPocket?.access) score += 1;
        return { candidate, pocket, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score || a.candidate.name.localeCompare(b.candidate.name))
      .slice(0, 4);
    if (!related.length) return;

    const block = document.createElement('section');
    block.className = 'related-tools';
    block.innerHTML = `
      <div class="related-tools-head">
        <p class="pk-section-title">Related tools</p>
      </div>
      <div class="related-tools-grid">
        ${related.map(({ candidate, pocket }) => `
          <a class="related-tool-card" href="#/tool/${encodeURIComponent(candidate.id)}" style="${pocket ? `--pocket-accent:${pocket.accent}` : ''}">
            <span class="related-tool-icon">${svgPath(candidate.icon)}</span>
            <span>
              <strong>${candidate.name}</strong>
              <small>${pocket?.shortName || candidate.category}</small>
            </span>
          </a>
        `).join('')}
      </div>
    `;
    container.appendChild(block);
  }
}

function fmtBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

function hookDropZones(container) {
  container.querySelectorAll('.drop-zone input[type="file"]').forEach(input => {
    const zone = input.closest('.drop-zone');
    if (!zone) return;

    // Snapshot original label text before any interaction
    const origStrong = zone.querySelector('strong')?.textContent ?? 'Select File';
    const origSpan   = zone.querySelector('span')?.textContent   ?? '';

    // Inject a persistent clear button into the zone
    const clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.className = 'drop-zone-clear hidden';
    clearBtn.textContent = '✕ Clear';
    zone.appendChild(clearBtn);

    // Exposed reset helper — tool JS can call zone._reset() after clearing
    // programmatically (e.g. action-row Clear buttons that do input.value='')
    zone._reset = () => {
      input.value = '';
      zone.classList.remove('drop-zone--ready');
      clearBtn.classList.add('hidden');
      const strong = zone.querySelector('strong');
      const span   = zone.querySelector('span');
      if (strong) strong.textContent = origStrong;
      if (span)   span.textContent   = origSpan;
    };

    // Clear handler — resets input, UI, and notifies tool JS via change event
    clearBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      zone._reset();
      // Fire change so tool JS can react (reset metrics, hide result panels, etc.)
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });

    input.addEventListener('change', () => {
      const files = input.files;
      // Only update UI when files are actually present — don't revert on
      // programmatic input.value='' (some tools do this after processing)
      if (!files || files.length === 0) return;
      const strong = zone.querySelector('strong');
      const span   = zone.querySelector('span');
      if (files.length === 1) {
        if (strong) strong.textContent = files[0].name;
        if (span)   span.textContent   = fmtBytes(files[0].size);
      } else {
        if (strong) strong.textContent = `${files.length} files selected`;
        if (span) {
          const total = Array.from(files).reduce((s, f) => s + f.size, 0);
          span.textContent = fmtBytes(total) + ' total';
        }
      }
      zone.classList.add('drop-zone--ready');
      clearBtn.classList.remove('hidden');
    });
  });
}

export const appRouter = new Router();
