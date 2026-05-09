// Simple line-by-line LCS diff — no external dependencies.

function lcs(a, b) {
  const m = a.length, n = b.length;
  // Build DP table (space-optimised: only 2 rows needed)
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  // Backtrack
  const result = [];
  let i = m, j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      result.push({ type: 'equal', line: a[i - 1] });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.push({ type: 'added', line: b[j - 1] });
      j--;
    } else {
      result.push({ type: 'removed', line: a[i - 1] });
      i--;
    }
  }
  return result.reverse();
}

export default {
  init() {
    const origEl   = document.getElementById('diff-original');
    const modEl    = document.getElementById('diff-modified');
    const btnDiff  = document.getElementById('btn-diff');
    const panel    = document.getElementById('diff-result-panel');
    const output   = document.getElementById('diff-output');
    const stats    = document.getElementById('diff-stats');

    const escape = (s) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

    const runDiff = () => {
      const a = origEl.value.split('\n');
      const b = modEl.value.split('\n');

      if (!origEl.value && !modEl.value) {
        panel.style.display = 'none';
        return;
      }

      const diff = lcs(a, b);

      let added = 0, removed = 0, equal = 0;
      let html = '';

      diff.forEach(({ type, line }) => {
        if (type === 'added')   { added++;   html += `<div class="diff-line diff-added"><span class="diff-sym">+</span>${escape(line)}</div>`; }
        else if (type === 'removed') { removed++; html += `<div class="diff-line diff-removed"><span class="diff-sym">−</span>${escape(line)}</div>`; }
        else                    { equal++;   html += `<div class="diff-line diff-equal"><span class="diff-sym">&nbsp;</span>${escape(line)}</div>`; }
      });

      output.innerHTML = html || '<p style="color:var(--muted);font-size:14px">No differences found — texts are identical.</p>';
      stats.textContent = `+${added} added · −${removed} removed · ${equal} unchanged`;
      panel.style.display = '';
    };

    btnDiff.addEventListener('click', runDiff);

    // Also run on Ctrl/Cmd+Enter
    [origEl, modEl].forEach(el => {
      el.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') runDiff();
      });
    });
  }
};
