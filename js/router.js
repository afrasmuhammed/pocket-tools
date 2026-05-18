import { UI } from './core/ui.js';
import { getTool, isValidToolId } from './registry.js?v=9';

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
  text.textContent = 'PT';
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
    const appTitle      = document.getElementById('app-title');

    const hash = window.location.hash || '';

    // Home
    if (!hash || hash === '#' || hash === '#/') {
      viewTool.classList.add('hidden');
      viewHome.classList.remove('hidden');
      btnBack.classList.add('hidden');
      setAppTitle(appTitle, 'Pocket Tools', true);
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
      viewTool.classList.remove('hidden');
      btnBack.classList.remove('hidden');
      btnBack.onclick = () => { window.location.hash = '#/'; };

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
      const res = await fetch(`templates/${toolId}.html?v=3`);
      if (!res.ok) throw new Error(`Template not found: ${toolId}`);
      html = await res.text();
      this.templateCache.set(toolId, html);
    }
    container.innerHTML = html;

    let module = this.moduleCache.get(toolId);
    if (!module) {
      module = await import(`./tools/${toolId}.js?v=2`);
      this.moduleCache.set(toolId, module);
    }

    if (module.default && typeof module.default.init === 'function') {
      module.default.init();
      this.currentToolId = toolId;
      hookDropZones(container);
    }
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
