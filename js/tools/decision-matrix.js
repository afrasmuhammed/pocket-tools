import { UI } from '../core/ui.js';
import { FileHelper } from '../core/file.js';

const SAMPLE = `option,impact,confidence,effort,risk
Launch with Office pocket,5,4,2,2
Wait for more tools,3,3,4,3
Launch with beta badge,4,5,1,1`;

function parseCsv(text) {
  return text.trim().split(/\n+/).map(line => line.split(',').map(cell => cell.trim())).filter(row => row.some(Boolean));
}

function number(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function renderRows(target, rows) {
  target.replaceChildren();
  rows.forEach(rowData => {
    const row = document.createElement('div');
    row.className = 'seo-result-row';
    const strong = document.createElement('strong');
    strong.textContent = rowData.option;
    const span = document.createElement('span');
    span.textContent = rowData.score.toFixed(1);
    row.append(strong, span);
    target.appendChild(row);
  });
}

function score(text, weights) {
  const rows = parseCsv(text);
  const headers = rows[0]?.map(header => header.toLowerCase()) || [];
  const records = rows.slice(1).map(values => Object.fromEntries(headers.map((header, index) => [header, values[index] || ''])));
  return records.map(record => {
    const impact = number(record.impact);
    const confidence = number(record.confidence);
    const effort = number(record.effort);
    const risk = number(record.risk);
    return {
      option: record.option || record.name || 'Untitled option',
      impact,
      confidence,
      effort,
      risk,
      score: impact * weights.impact + confidence * weights.confidence - effort * weights.effort - risk * weights.risk,
    };
  }).sort((a, b) => b.score - a.score);
}

export default {
  init() {
    const input = document.getElementById('dm-input');
    const impact = document.getElementById('dm-impact');
    const confidence = document.getElementById('dm-confidence');
    const effort = document.getElementById('dm-effort');
    const risk = document.getElementById('dm-risk');
    const output = document.getElementById('dm-output');
    const optionsMetric = document.getElementById('dm-options');
    const winnerMetric = document.getElementById('dm-winner');
    const scoreMetric = document.getElementById('dm-score');
    const results = document.getElementById('dm-results');

    const run = () => {
      if (!input.value.trim()) return UI.showError('Paste score CSV first.');
      const rows = score(input.value, {
        impact: number(impact.value),
        confidence: number(confidence.value),
        effort: number(effort.value),
        risk: number(risk.value),
      });
      if (!rows.length) return UI.showError('Add at least one option row.');
      const winner = rows[0];
      output.value = [
        '# Decision Matrix Recommendation',
        '',
        `Recommended option: ${winner.option}`,
        `Score: ${winner.score.toFixed(1)}`,
        '',
        '## Ranked Options',
        ...rows.map((row, index) => `${index + 1}. ${row.option} - ${row.score.toFixed(1)} (impact ${row.impact}, confidence ${row.confidence}, effort ${row.effort}, risk ${row.risk})`),
        '',
        '## Readout',
        '- Higher impact and confidence improve the score.',
        '- Higher effort and risk reduce the score.',
      ].join('\n');
      optionsMetric.textContent = String(rows.length);
      winnerMetric.textContent = winner.option.length > 12 ? `${winner.option.slice(0, 12)}...` : winner.option;
      scoreMetric.textContent = winner.score.toFixed(1);
      renderRows(results, rows);
      UI.showSuccess('Options scored.');
    };

    document.getElementById('btn-dm-score').onclick = run;
    document.getElementById('btn-dm-sample').onclick = () => { input.value = SAMPLE; run(); };
    document.getElementById('btn-dm-clear').onclick = () => {
      input.value = '';
      output.value = '';
      results.replaceChildren();
      optionsMetric.textContent = '0';
      winnerMetric.textContent = '--';
      scoreMetric.textContent = '--';
    };
    document.getElementById('btn-dm-copy').onclick = () => {
      if (!output.value) return UI.showError('Score options first.');
      navigator.clipboard.writeText(output.value).then(() => UI.showSuccess('Recommendation copied.')).catch(() => UI.showError('Copy failed.'));
    };
    document.getElementById('btn-dm-download').onclick = () => {
      if (!output.value) return UI.showError('Score options first.');
      FileHelper.downloadText('decision-matrix.md', output.value, 'text/markdown');
    };
  },
};
