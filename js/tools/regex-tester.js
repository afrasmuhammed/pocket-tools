// Escape special HTML characters — must be done BEFORE inserting <mark> tags
// to prevent XSS when the test string contains angle brackets or ampersands.
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Build highlighted HTML using position-based approach:
//   1. Find match indices from the already-executed matches array.
//   2. Slice the raw text into segments (between / outside matches).
//   3. HTML-escape each segment BEFORE wrapping matched segments in <mark>.
// This guarantees angle brackets in both matched and unmatched text are
// rendered as text entities, never parsed as HTML.
function buildHighlight(text, matches) {
  if (!matches.length) return escapeHtml(text);
  let html = '';
  let cursor = 0;
  for (const m of matches) {
    const start = m.index;
    const end   = m.index + m[0].length;
    html += escapeHtml(text.slice(cursor, start));
    html += '<mark>' + escapeHtml(m[0]) + '</mark>';
    cursor = end;
  }
  html += escapeHtml(text.slice(cursor));
  return html;
}

// Collect all matches. Always adds 'g' internally so exec() loops correctly
// even if the user omitted it — other user flags (i, m, s, …) are preserved.
function findMatches(pattern, userFlags, text) {
  const flags = userFlags.includes('g') ? userFlags : userFlags + 'g';
  const re = new RegExp(pattern, flags);
  const matches = [];
  let m;
  while ((m = re.exec(text)) !== null) {
    matches.push(m);
    if (m[0].length === 0) re.lastIndex++; // guard: skip zero-length matches to avoid infinite loop
  }
  return matches;
}

function debounce(fn, ms) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
}

export default {
  init() {
    const patternEl   = document.getElementById('regex-pattern');
    const flagsEl     = document.getElementById('regex-flags');
    const testEl      = document.getElementById('regex-test');
    const errorEl     = document.getElementById('regex-error');
    const matchesEl   = document.getElementById('regex-matches');
    const highlightEl = document.getElementById('regex-highlight');
    const countEl     = document.getElementById('regex-match-count');

    function clearResults() {
      matchesEl.innerHTML   = '';
      highlightEl.innerHTML = '';
      countEl.textContent   = '';
    }

    function showError(msg) {
      errorEl.textContent = msg;
      errorEl.classList.remove('hidden');
      clearResults();
    }

    function hideError() {
      errorEl.textContent = '';
      errorEl.classList.add('hidden');
    }

    const run = debounce(() => {
      const pattern = patternEl.value;
      const flags   = flagsEl.value.trim();
      const text    = testEl.value;

      // Empty pattern → clear everything silently
      if (!pattern) { hideError(); clearResults(); return; }

      // Validate: attempt to compile the regex
      let matches;
      try {
        matches = findMatches(pattern, flags, text);
      } catch (e) {
        showError('Invalid regex — ' + e.message.replace(/^Invalid regular expression: \/.*\/[gimsuy]*: /, ''));
        return;
      }

      hideError();

      // ── Match count ───────────────────────────────────────────────────────
      countEl.textContent = matches.length === 0 ? '0 matches'
        : matches.length === 1 ? '1 match'
        : `${matches.length} matches`;

      // ── Matches list ──────────────────────────────────────────────────────
      if (matches.length === 0 || !text) {
        matchesEl.innerHTML = matches.length === 0 && text
          ? '<p class="regex-no-matches">No matches found.</p>'
          : '';
      } else {
        matchesEl.innerHTML = matches.map((m, i) => {
          const hasGroups = m.length > 1;
          const groups = hasGroups
            ? m.slice(1).map((g, gi) =>
                `<span class="regex-group">group ${gi + 1}: <code>${g === undefined ? '<em>undefined</em>' : escapeHtml(g)}</code></span>`
              ).join('')
            : '';
          return `<div class="regex-match-item">
            <span class="regex-match-num">#${i + 1}</span>
            <span class="regex-match-index">index ${m.index}</span>
            <code class="regex-match-text">${escapeHtml(m[0])}</code>
            ${groups ? `<div class="regex-groups">${groups}</div>` : ''}
          </div>`;
        }).join('');
      }

      // ── Highlighted view ──────────────────────────────────────────────────
      if (!text) {
        highlightEl.innerHTML = '';
      } else {
        // buildHighlight escapes all text before inserting <mark> — XSS-safe.
        highlightEl.innerHTML = buildHighlight(text, matches);
      }
    }, 200);

    patternEl.addEventListener('input', run);
    flagsEl.addEventListener('input', run);
    testEl.addEventListener('input', run);

    // Example chips — load pattern, flags, and test string together
    document.querySelectorAll('.cron-chips .chip[data-pattern]').forEach(chip => {
      chip.addEventListener('click', () => {
        patternEl.value = chip.dataset.pattern;
        flagsEl.value   = chip.dataset.flags || 'g';
        testEl.value    = chip.dataset.test   || '';
        patternEl.dispatchEvent(new Event('input'));
      });
    });
  }
};
