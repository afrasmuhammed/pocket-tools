import { UI } from '../core/ui.js';
import { consumeHandoff } from '../core/handoff.js';

const SAMPLE = `Launch check-in
Decision: keep the new pricing page simple for Monday.
Mia to update screenshots by Friday.
Jon will verify mobile checkout tomorrow.
Risk: analytics events are still missing on the confirmation screen.
Follow up with legal about the terms copy next week.`;

const ACTION_RE = /\b(?:to|will|owner|todo|action|follow up|send|prepare|review|verify|update|share|confirm|fix)\b/i;
const DECISION_RE = /\b(?:decision|decided|approved|agreed|we will|final)\b/i;
const RISK_RE = /\b(?:risk|blocker|blocked|issue|concern|waiting|missing|delay)\b/i;
const DATE_RE = /\b(?:today|tomorrow|next week|monday|tuesday|wednesday|thursday|friday|saturday|sunday|\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?)\b/i;

function cleanLine(line) {
  return line.replace(/^[-*•\d.)\s]+/, '').trim();
}

function ownerFrom(line) {
  const match = line.match(/^([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\s+(?:to|will|owns|owner)/);
  return match ? match[1] : 'Unassigned';
}

function dueFrom(line) {
  return line.match(DATE_RE)?.[0] || 'No date';
}

function bullet(title, rows) {
  if (!rows.length) return `${title}\n- None found`;
  return `${title}\n${rows.map(row => `- ${row}`).join('\n')}`;
}

export default {
  init() {
    const input = document.getElementById('ma-input');
    const output = document.getElementById('ma-output');
    const actionCount = document.getElementById('ma-action-count');
    const decisionCount = document.getElementById('ma-decision-count');
    const riskCount = document.getElementById('ma-risk-count');
    const handoff = consumeHandoff('meeting-actions');
    if (handoff?.value) input.value = handoff.value;

    const run = () => {
      const lines = input.value.split(/\n+/).map(cleanLine).filter(Boolean);
      if (!lines.length) return UI.showError('Paste meeting notes first.');
      const actions = [];
      const decisions = [];
      const risks = [];

      lines.forEach(line => {
        if (DECISION_RE.test(line)) decisions.push(line.replace(/^decision:\s*/i, ''));
        if (RISK_RE.test(line)) risks.push(line.replace(/^risk:\s*/i, ''));
        if (ACTION_RE.test(line)) actions.push(`${line} (Owner: ${ownerFrom(line)}, Due: ${dueFrom(line)})`);
      });

      actionCount.textContent = actions.length.toLocaleString();
      decisionCount.textContent = decisions.length.toLocaleString();
      riskCount.textContent = risks.length.toLocaleString();
      output.value = [
        bullet('Actions', actions),
        bullet('Decisions', decisions),
        bullet('Risks / blockers', risks),
      ].join('\n\n');
    };

    document.getElementById('btn-ma-run').onclick = run;
    document.getElementById('btn-ma-sample').onclick = () => { input.value = SAMPLE; run(); };
    document.getElementById('btn-ma-clear').onclick = () => {
      input.value = '';
      output.value = '';
      actionCount.textContent = '0';
      decisionCount.textContent = '0';
      riskCount.textContent = '0';
    };
    document.getElementById('btn-ma-copy').onclick = () => {
      if (!output.value) return UI.showError('Extract actions first.');
      navigator.clipboard.writeText(output.value).then(() => UI.showSuccess('Summary copied.')).catch(() => UI.showError('Copy failed.'));
    };
    if (handoff?.value) run();
  },
};
