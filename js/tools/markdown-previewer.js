import { UI } from '../core/ui.js';

const SAMPLE = `# Release notes

## Developer tools

- Added **Markdown Previewer**
- Kept the app working offline
- Used \`cache-busted\` assets for the registry

> Small tools should feel fast, focused, and predictable.

[Open Pocket Tools](https://afrasmuhammed.github.io/pocket-tools/)`;

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function renderInline(text) {
  let html = escapeHtml(text);
  const code = [];

  html = html.replace(/`([^`]+)`/g, (_, value) => {
    code.push(`<code>${value}</code>`);
    return `\u0000CODE${code.length - 1}\u0000`;
  });

  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  return html.replace(/\u0000CODE(\d+)\u0000/g, (_, index) => code[Number(index)]);
}

function closeList(state, html) {
  if (state.inList) {
    html.push('</ul>');
    state.inList = false;
  }
}

function renderMarkdown(markdown) {
  const html = [];
  const state = { inList: false, inCode: false, codeLines: [] };
  const lines = markdown.replace(/\r\n?/g, '\n').split('\n');

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      if (state.inCode) {
        html.push(`<pre><code>${escapeHtml(state.codeLines.join('\n'))}</code></pre>`);
        state.inCode = false;
        state.codeLines = [];
      } else {
        closeList(state, html);
        state.inCode = true;
      }
      continue;
    }

    if (state.inCode) {
      state.codeLines.push(line);
      continue;
    }

    if (!line.trim()) {
      closeList(state, html);
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      closeList(state, html);
      const level = heading[1].length;
      const content = renderInline(heading[2].trim());
      const id = slugify(content);
      html.push(`<h${level}${id ? ` id="${id}"` : ''}>${content}</h${level}>`);
      continue;
    }

    const listItem = line.match(/^\s*[-*]\s+(.+)$/);
    if (listItem) {
      if (!state.inList) {
        html.push('<ul>');
        state.inList = true;
      }
      html.push(`<li>${renderInline(listItem[1].trim())}</li>`);
      continue;
    }

    const quote = line.match(/^>\s?(.+)$/);
    if (quote) {
      closeList(state, html);
      html.push(`<blockquote>${renderInline(quote[1].trim())}</blockquote>`);
      continue;
    }

    closeList(state, html);
    html.push(`<p>${renderInline(line.trim())}</p>`);
  }

  closeList(state, html);
  if (state.inCode) {
    html.push(`<pre><code>${escapeHtml(state.codeLines.join('\n'))}</code></pre>`);
  }

  return html.join('\n');
}

function countWords(text) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

export default {
  init() {
    const input = document.getElementById('md-input');
    const preview = document.getElementById('md-preview');
    const words = document.getElementById('md-words');
    const chars = document.getElementById('md-chars');

    const render = () => {
      const html = renderMarkdown(input.value);
      preview.innerHTML = html || '<p class="muted">Rendered preview will appear here.</p>';
      words.textContent = countWords(input.value).toLocaleString();
      chars.textContent = input.value.length.toLocaleString();
    };

    document.getElementById('btn-md-render').onclick = render;

    document.getElementById('btn-md-sample').onclick = () => {
      input.value = SAMPLE;
      render();
    };

    document.getElementById('btn-md-clear').onclick = () => {
      input.value = '';
      render();
    };

    document.getElementById('btn-md-copy-html').onclick = () => {
      if (!input.value) return UI.showError('Render Markdown first.');
      navigator.clipboard.writeText(preview.innerHTML)
        .then(() => UI.showToast('HTML copied!', 'success'))
        .catch(() => UI.showError('Copy failed.'));
    };

    document.getElementById('btn-md-copy-text').onclick = () => {
      if (!preview.textContent.trim()) return UI.showError('Nothing to copy yet.');
      navigator.clipboard.writeText(preview.textContent)
        .then(() => UI.showToast('Text copied!', 'success'))
        .catch(() => UI.showError('Copy failed.'));
    };

    input.addEventListener('input', render);
    render();
  },
};
