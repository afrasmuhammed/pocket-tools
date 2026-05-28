import { UI } from './core/ui.js';
import { TOOLS, getPrimaryPocketForTool, getTool, isValidToolId } from './registry.js?v=30';
import { PRO_PRICE_LABEL, hasProAccess } from './core/access.js';

const FAVORITE_KEY = 'pk-favorites';
const DRAFT_PREFIX = 'pk-draft:';
const DRAFT_DEBOUNCE_MS = 350;

const ACTION_ICONS = {
  sample: 'M4 4v16l14-8z',
  copy: 'M8 8h10v12H8z M6 16H4V4h10v2',
  save: 'M5 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-7-4-7 4z',
  saved: 'M5 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-7-4-7 4z M9 10l2 2 4-4',
  clear: 'M4 7h16 M10 11v6 M14 11v6 M6 7l1 14h10l1-14 M9 7V4h6v3',
};

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

function actionButton(icon, label, id, extra = '') {
  return `<button type="button" class="btn btn-secondary btn-small" id="${id}" ${extra}>${svgPath(ACTION_ICONS[icon], 'icon')}<span>${label}</span></button>`;
}

function draftKey(toolId) {
  return `${DRAFT_PREFIX}${toolId}`;
}

function getToolDraft(toolId) {
  try {
    const raw = localStorage.getItem(draftKey(toolId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function clearToolDraft(toolId) {
  try { localStorage.removeItem(draftKey(toolId)); } catch {}
}

function getDraftFields(container) {
  return [...container.querySelectorAll('input, select, textarea')]
    .filter(el => {
      const type = (el.getAttribute('type') || '').toLowerCase();
      return !el.readOnly && !el.disabled && !['file', 'button', 'submit', 'reset', 'hidden'].includes(type);
    })
    .filter(el => el.id || el.name);
}

function fieldKey(el) {
  return el.id || el.name;
}

function fieldValue(el) {
  const type = (el.getAttribute('type') || '').toLowerCase();
  if (type === 'checkbox') return el.checked;
  if (type === 'radio') return el.checked ? el.value : null;
  return el.value;
}

function setFieldValue(el, value) {
  const type = (el.getAttribute('type') || '').toLowerCase();
  if (type === 'checkbox') {
    el.checked = Boolean(value);
  } else if (type === 'radio') {
    el.checked = value === el.value;
  } else if (value !== null && value !== undefined) {
    el.value = value;
  }
}

function attachDraftMemory(toolId, container) {
  const fields = getDraftFields(container);
  if (!fields.length) return false;
  const draft = getToolDraft(toolId);

  if (draft?.fields) {
    fields.forEach(el => {
      const key = fieldKey(el);
      if (!(key in draft.fields)) return;
      const type = (el.getAttribute('type') || '').toLowerCase();
      const hasValue = type === 'checkbox' || type === 'radio' ? false : Boolean(el.value);
      if (!hasValue) {
        setFieldValue(el, draft.fields[key]);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
  }

  let timer = null;
  const save = () => {
    const values = {};
    fields.forEach(el => {
      const key = fieldKey(el);
      const value = fieldValue(el);
      if (value !== null) values[key] = value;
    });
    try {
      localStorage.setItem(draftKey(toolId), JSON.stringify({
        fields: values,
        updatedAt: Date.now(),
      }));
    } catch {}
  };
  const schedule = () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(save, DRAFT_DEBOUNCE_MS);
  };
  fields.forEach(el => {
    el.addEventListener('input', schedule);
    el.addEventListener('change', schedule);
  });
  return true;
}

function getToolCapabilities(tool, container, hasDraftFields) {
  const capabilities = [
    { icon: 'M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z', label: 'Private local tool' },
  ];
  if (container.querySelector('input[type="file"]')) {
    capabilities.push({ icon: 'M6 3h8l4 4v14H6z M14 3v5h5', label: 'Uses files' });
  }
  if (container.querySelector('[id*="download"], button[download], a[download]')) {
    capabilities.push({ icon: 'M12 3v12 M7 10l5 5 5-5 M5 21h14', label: 'Downloads result' });
  }
  if (container.querySelector('textarea[readonly], [data-output], .output, .result, pre, canvas')) {
    capabilities.push({ icon: ACTION_ICONS.copy, label: 'Copyable output' });
  }
  if (SAMPLE_ACTIONS[tool.id]) {
    capabilities.push({ icon: ACTION_ICONS.sample, label: 'Sample ready' });
  }
  if (hasDraftFields) {
    capabilities.push({ icon: 'M5 5h14v14H5z M8 9h8 M8 13h5', label: 'Draft autosaves' });
  }
  return capabilities.slice(0, 5);
}

const SAMPLE_ACTIONS = {
  'api-beautifier': container => container.querySelector('#btn-api-sample')?.click(),
  'bug-report': container => container.querySelector('#btn-br-sample')?.click(),
  'canonical-url': container => container.querySelector('#btn-cu-sample')?.click(),
  'json-formatter': container => container.querySelector('#btn-jf-sample')?.click(),
  'json-schema-validator': container => container.querySelector('#btn-jsv-sample')?.click(),
  'xml-formatter': container => container.querySelector('#btn-xml-sample')?.click(),
  'yaml-json': container => container.querySelector('#btn-yaml-sample')?.click(),
  'json-yaml': container => container.querySelector('#btn-jyaml-sample')?.click(),
  'csv-cleaner': container => container.querySelector('#btn-csvc-sample')?.click(),
  'utm-builder': container => container.querySelector('#btn-utm-sample')?.click(),
  'text-redactor': container => container.querySelector('#btn-redact-sample')?.click(),
  'hash-generator': container => container.querySelector('#btn-hash-sample')?.click(),
  'hmac-generator': container => container.querySelector('#btn-hmac-sample')?.click(),
  'color-contrast': container => container.querySelector('#btn-contrast-sample')?.click(),
  'safe-share-link': container => container.querySelector('#btn-ssl-sample')?.click(),
  'screenshot-privacy-blur': container => container.querySelector('#btn-spb-sample')?.click(),
  'quote-estimate-builder': container => container.querySelector('#btn-quote-sample')?.click(),
  'receipt-expense-extractor': container => container.querySelector('#btn-rex-sample')?.click(),
  'meeting-actions': container => container.querySelector('#btn-ma-sample')?.click(),
  'subscription-audit': container => container.querySelector('#btn-sa-sample')?.click(),
  'client-email-polisher': container => container.querySelector('#btn-cep-sample')?.click(),
  'scope-cleaner': container => container.querySelector('#btn-scope-sample')?.click(),
  'expense-report-builder': container => container.querySelector('#btn-erb-sample')?.click(),
  'contract-clause-highlighter': container => container.querySelector('#btn-cch-sample')?.click(),
  'table-cleaner': container => container.querySelector('#btn-tbl-sample')?.click(),
  'status-update-builder': container => container.querySelector('#btn-sub-sample')?.click(),
  'agenda-builder': container => container.querySelector('#btn-ag-sample')?.click(),
  'checklist-builder': container => container.querySelector('#btn-clb-sample')?.click(),
  'decision-matrix': container => container.querySelector('#btn-dm-sample')?.click(),
  'csv-pivot-summary': container => container.querySelector('#btn-cps-sample')?.click(),
  'regex-tester': container => container.querySelector('[data-pattern]')?.click(),
  'qr-generator': container => {
    const input = container.querySelector('#qr-input');
    if (input) input.value = 'https://pocketkit.app/#/all?q=private%20tools';
    container.querySelector('#btn-qr-generate')?.click();
  },
  'word-counter': container => {
    const input = container.querySelector('#wc-input');
    if (input) {
      input.value = 'PocketKit keeps useful tools close, private, and ready offline. Paste text here to count words, characters, paragraphs, sentences, and reading time.';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  },
  'slug-generator': container => container.querySelector('#btn-slug-sample')?.click(),
  'meta-tags': container => container.querySelector('#btn-meta-sample')?.click(),
  'og-preview': container => container.querySelector('#btn-og-sample')?.click(),
  'robots-txt': container => container.querySelector('#btn-robots-sample')?.click(),
  'sitemap-formatter': container => container.querySelector('#btn-sf-sample')?.click(),
  'test-case': container => container.querySelector('#btn-tc-sample')?.click(),
  'csv-json': container => container.querySelector('#btn-csv-sample')?.click(),
  'json-csv': container => container.querySelector('#btn-jcsv-sample')?.click(),
  'markdown-previewer': container => container.querySelector('#btn-md-sample')?.click(),
  'text-diff': container => {
    const original = container.querySelector('#diff-original');
    const modified = container.querySelector('#diff-modified');
    if (original) original.value = 'PocketKit Daily is free.\nTools run locally.\nSearch opens every utility.';
    if (modified) modified.value = 'PocketKit Daily stays free.\nTools run locally in your browser.\nQuick open finds every utility.';
    container.querySelector('#btn-diff')?.click();
  },
  'keyword-density': container => container.querySelector('#btn-kd-sample')?.click(),
};

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
    this.currentHash = window.location.hash || '#/';
    this.returnHash = '#/all';
    window.addEventListener('hashchange', () => {
      const nextHash = window.location.hash || '#/';
      const previousHash = this.currentHash || '#/';
      if (nextHash.startsWith('#/tool/') && !previousHash.startsWith('#/tool/')) {
        this.returnHash = previousHash;
      } else if (!nextHash.startsWith('#/tool/')) {
        this.returnHash = nextHash;
      }
      this.currentHash = nextHash;
      this.handleRoute();
    });
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
    if (!hash || hash === '#' || hash === '#/' || hash.startsWith('#/all') || hash.startsWith('#/pocket/') || hash.startsWith('#/account') || hash.startsWith('#/payment/')) {
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
      btnBack.onclick = () => { window.location.hash = this.returnHash || '#/all'; };

      const tool = getTool(toolId);
      setAppTitle(appTitle, tool.name, false);
      toolContainer.dataset.category = tool.category;
      toolContainer.replaceChildren();
      const pocket = getPrimaryPocketForTool(tool.id);
      if (pocket?.access === 'pro' && !hasProAccess()) {
        this.renderLockedTool(tool, pocket, toolContainer);
        window.scrollTo(0, 0);
        return;
      }
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

  renderLockedTool(tool, pocket, container) {
    container.innerHTML = `
      <section class="pk-paywall" style="--pocket-accent:${pocket.accent}">
        <div class="pk-breadcrumb">
          <a href="#/">Home</a><span>/</span>
          <a href="#/pocket/${pocket.id}">${pocket.shortName}</a><span>/</span>
          <span>${tool.name}</span>
        </div>
        <div class="pk-paywall-card">
          <span class="pk-mark" style="--pocket-accent:${pocket.accent}">${pocket.shortName.slice(0, 2)}</span>
          <p class="pk-section-title">Pro tool</p>
          <h2>${tool.name}</h2>
          <p>${tool.desc}. Unlock all Pro pockets for ${PRO_PRICE_LABEL}; Daily tools stay free.</p>
          <div class="pk-paywall-actions">
            <button type="button" class="btn pk-btn-primary" data-start-checkout>Unlock Pro</button>
            <a class="btn btn-secondary" href="#/pocket/${pocket.id}">Preview pocket</a>
          </div>
          <div class="pk-paywall-trust">
            <span>Stripe Checkout</span>
            <span>Apple Pay / Google Pay ready</span>
            <span>100 browser tools</span>
          </div>
        </div>
      </section>
    `;
    container.querySelector('[data-start-checkout]')?.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('pk-start-checkout', { detail: { source: tool.id } }));
    });
  }

  async loadTool(toolId, container) {
    let html = this.templateCache.get(toolId);
    if (!html) {
      const res = await fetch(`templates/${toolId}.html?v=19`);
      if (!res.ok) throw new Error(`Template not found: ${toolId}`);
      html = await res.text();
      this.templateCache.set(toolId, html);
    }
    container.innerHTML = html;

    let module = this.moduleCache.get(toolId);
    if (!module) {
      module = await import(`./tools/${toolId}.js?v=24`);
      this.moduleCache.set(toolId, module);
    }

    if (module.default && typeof module.default.init === 'function') {
      await module.default.init();
      this.currentToolId = toolId;
      hookDropZones(container);
      attachDraftMemory(toolId, container);
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
        ${SAMPLE_ACTIONS[tool.id] ? actionButton('sample', 'Try sample', 'btn-try-sample') : ''}
        ${getToolDraft(tool.id) ? actionButton('clear', 'Clear draft', 'btn-clear-tool-draft') : ''}
        ${actionButton('copy', 'Copy link', 'btn-copy-tool-link')}
        ${actionButton(isFavorite(tool.id) ? 'saved' : 'save', isFavorite(tool.id) ? 'Saved' : 'Save', 'btn-save-tool', `aria-pressed="${isFavorite(tool.id) ? 'true' : 'false'}"`)}
      </div>
    `;
    header.prepend(meta);

    const hasDraftFields = Boolean(getDraftFields(container).length);
    const assurance = document.createElement('div');
    assurance.className = 'tool-assurance';
    assurance.innerHTML = `
      <span>${svgPath('M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z')}Private on this device</span>
      <span>${svgPath('M7 17 17 7M8 7h9v9')}Works offline after load</span>
      <span>${svgPath('m9 12 2 2 4-4M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0')}Runs in your browser</span>
    `;
    header.after(assurance);

    const capabilities = document.createElement('div');
    capabilities.className = 'tool-capabilities';
    capabilities.innerHTML = getToolCapabilities(tool, container, hasDraftFields)
      .map(item => `<span>${svgPath(item.icon)}${item.label}</span>`)
      .join('');
    assurance.after(capabilities);

    const copy = container.querySelector('#btn-copy-tool-link');
    const save = container.querySelector('#btn-save-tool');
    const sample = container.querySelector('#btn-try-sample');
    const clearDraft = container.querySelector('#btn-clear-tool-draft');
    const copyLink = () => {
      navigator.clipboard.writeText(location.href)
        .then(() => UI.showSuccess('Tool link copied.'))
        .catch(() => UI.showError('Copy failed.'));
    };
    copy?.addEventListener('click', copyLink);
    sample?.addEventListener('click', () => {
      SAMPLE_ACTIONS[tool.id]?.(container);
      UI.showSuccess('Sample loaded.');
    });
    clearDraft?.addEventListener('click', () => {
      clearToolDraft(tool.id);
      UI.showSuccess('Draft cleared.');
      clearDraft.remove();
    });
    save?.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('pk-toggle-favorite', { detail: { toolId: tool.id } }));
      const next = isFavorite(tool.id);
      save.innerHTML = `${svgPath(ACTION_ICONS[next ? 'saved' : 'save'], 'icon')}<span>${next ? 'Saved' : 'Save'}</span>`;
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
