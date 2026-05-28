import { UI } from '../core/ui.js';
import { FileHelper } from '../core/file.js';
import { consumeHandoff } from '../core/handoff.js';

const SAMPLE = `Website refresh for Acme Labs
Need homepage, pricing page, FAQ, and contact form
Out of scope: custom CRM integration and paid ads
Deliver brand-ready copy deck
Client provides product screenshots and final pricing
Risk: pricing is not approved yet
Question: who signs off on legal copy?
Timeline depends on feedback within two business days`;

const HEADINGS = {
  proposal: 'Proposal Scope',
  delivery: 'Delivery Handoff',
  review: 'Scope Review',
};

function cleanItems(text) {
  return text
    .split(/\n+/)
    .map(line => line.replace(/^[-*•\d.)\s]+/, '').trim())
    .filter(Boolean);
}

function classify(line) {
  const lower = line.toLowerCase();
  if (/\?|\b(question|confirm|tbd|unknown|decide|clarify)\b/.test(lower)) return 'questions';
  if (/\b(risk|block|dependency|depends|delay|slip|waiting|not approved)\b/.test(lower)) return 'risks';
  if (/\b(out of scope|exclude|not included|later|phase 2|separate)\b/.test(lower)) return 'out';
  if (/\b(deliver|handoff|provide|send|create|build|design|write|setup|implement)\b/.test(lower)) return 'deliverables';
  if (/\b(assume|client provides|provided by|requires|must have)\b/.test(lower)) return 'assumptions';
  return 'in';
}

function bullet(lines) {
  return lines.length ? lines.map(line => `- ${line}`).join('\n') : '- None captured';
}

function buildScope(text, project, mode) {
  const buckets = { in: [], out: [], deliverables: [], assumptions: [], questions: [], risks: [] };
  cleanItems(text).forEach(line => buckets[classify(line)].push(line));
  return {
    buckets,
    text: [
      `# ${project.trim() || 'Untitled Project'} - ${HEADINGS[mode] || HEADINGS.proposal}`,
      '',
      '## Objective',
      bullet(buckets.in.slice(0, 3)),
      '',
      '## In Scope',
      bullet([...buckets.in, ...buckets.deliverables]),
      '',
      '## Out of Scope',
      bullet(buckets.out),
      '',
      '## Deliverables',
      bullet(buckets.deliverables),
      '',
      '## Assumptions',
      bullet(buckets.assumptions),
      '',
      '## Open Questions',
      bullet(buckets.questions),
      '',
      '## Risks / Dependencies',
      bullet(buckets.risks),
      '',
      '## Next Steps',
      '- Confirm owner for approvals',
      '- Confirm timeline and feedback windows',
      '- Lock scope before production starts',
    ].join('\n'),
  };
}

export default {
  init() {
    const input = document.getElementById('scope-input');
    const project = document.getElementById('scope-project');
    const mode = document.getElementById('scope-mode');
    const output = document.getElementById('scope-output');
    const inCount = document.getElementById('scope-in-count');
    const questionCount = document.getElementById('scope-question-count');
    const riskCount = document.getElementById('scope-risk-count');
    const handoff = consumeHandoff('scope-cleaner');
    if (handoff?.value) input.value = handoff.value;

    const run = () => {
      const text = input.value.trim();
      if (!text) return UI.showError('Add scope notes first.');
      const result = buildScope(text, project.value, mode.value);
      output.value = result.text;
      inCount.textContent = String(result.buckets.in.length + result.buckets.deliverables.length);
      questionCount.textContent = String(result.buckets.questions.length);
      riskCount.textContent = String(result.buckets.risks.length);
      UI.showSuccess('Scope cleaned.');
    };

    document.getElementById('btn-scope-clean').onclick = run;
    document.getElementById('btn-scope-sample').onclick = () => {
      input.value = SAMPLE;
      project.value = 'Acme Labs Website Refresh';
      mode.value = 'proposal';
      run();
    };
    document.getElementById('btn-scope-clear').onclick = () => {
      input.value = '';
      project.value = '';
      output.value = '';
      inCount.textContent = '0';
      questionCount.textContent = '0';
      riskCount.textContent = '0';
    };
    document.getElementById('btn-scope-copy').onclick = () => {
      if (!output.value) return UI.showError('Clean a scope first.');
      navigator.clipboard.writeText(output.value).then(() => UI.showSuccess('Scope copied.')).catch(() => UI.showError('Copy failed.'));
    };
    document.getElementById('btn-scope-download').onclick = () => {
      if (!output.value) return UI.showError('Clean a scope first.');
      FileHelper.downloadText('scope-outline.md', output.value, 'text/markdown');
    };
    if (handoff?.value) run();
  },
};
