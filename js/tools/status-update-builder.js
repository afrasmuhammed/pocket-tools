import { UI } from '../core/ui.js';
import { FileHelper } from '../core/file.js';
import { consumeHandoff } from '../core/handoff.js';

const SAMPLE = `Shipped Office pocket and five new tools
Fixed stale cache versions for live deploy
Metric: tool library now at 100 tools
Next: finish launch QA and homepage polish
Blocked: waiting on final pricing copy
Risk: cached service worker can hide changes for returning users`;

function lines(text) {
  return text.split(/\n+/).map(line => line.replace(/^[-*•\d.)\s]+/, '').trim()).filter(Boolean);
}

function classify(line) {
  const lower = line.toLowerCase();
  if (/\b(blocked|blocker|waiting|stuck|cannot|dependency)\b/.test(lower)) return 'blockers';
  if (/\b(risk|watch|concern|could|might|slip|cache)\b/.test(lower)) return 'risks';
  if (/\b(next|todo|plan|will|remaining|follow up)\b/.test(lower)) return 'next';
  if (/\b(metric|kpi|count|%|revenue|users|tools|passed|failed)\b/.test(lower)) return 'metrics';
  return 'done';
}

function bullet(items, fallback) {
  return items.length ? items.map(item => `- ${item}`).join('\n') : `- ${fallback}`;
}

function build(text, period, audience, tone) {
  const buckets = { done: [], next: [], blockers: [], risks: [], metrics: [] };
  lines(text).forEach(line => buckets[classify(line)].push(line));
  const opener = {
    leadership: 'Here is the concise status update.',
    client: 'Here is the latest project update.',
    team: 'Here is where things stand.',
    standup: 'Quick standup update:',
  }[audience] || 'Here is the update.';
  const toneNote = tone === 'warm' ? 'Thanks everyone for keeping momentum high.' : tone === 'direct' ? 'The important points are below.' : 'The key points are below.';
  return {
    buckets,
    output: [
      `# ${period.trim() || 'Status Update'}`,
      '',
      `${opener} ${toneNote}`,
      '',
      '## Done',
      bullet(buckets.done, 'No completed items captured.'),
      '',
      '## Metrics',
      bullet(buckets.metrics, 'No metrics captured.'),
      '',
      '## Next',
      bullet(buckets.next, 'No next steps captured.'),
      '',
      '## Blockers',
      bullet(buckets.blockers, 'No blockers called out.'),
      '',
      '## Risks / Watchouts',
      bullet(buckets.risks, 'No risks called out.'),
    ].join('\n'),
  };
}

export default {
  init() {
    const input = document.getElementById('sub-input');
    const period = document.getElementById('sub-period');
    const audience = document.getElementById('sub-audience');
    const tone = document.getElementById('sub-tone');
    const output = document.getElementById('sub-output');
    const done = document.getElementById('sub-done');
    const next = document.getElementById('sub-next');
    const risks = document.getElementById('sub-risks');
    const handoff = consumeHandoff('status-update-builder');
    if (handoff?.value) input.value = handoff.value;

    const run = () => {
      if (!input.value.trim()) return UI.showError('Add work notes first.');
      const result = build(input.value, period.value, audience.value, tone.value);
      output.value = result.output;
      done.textContent = String(result.buckets.done.length);
      next.textContent = String(result.buckets.next.length);
      risks.textContent = String(result.buckets.risks.length + result.buckets.blockers.length);
      UI.showSuccess('Status update built.');
    };

    document.getElementById('btn-sub-build').onclick = run;
    document.getElementById('btn-sub-sample').onclick = () => {
      input.value = SAMPLE;
      period.value = 'PocketKit Launch Prep';
      audience.value = 'leadership';
      run();
    };
    document.getElementById('btn-sub-clear').onclick = () => {
      input.value = '';
      period.value = '';
      output.value = '';
      done.textContent = '0';
      next.textContent = '0';
      risks.textContent = '0';
    };
    document.getElementById('btn-sub-copy').onclick = () => {
      if (!output.value) return UI.showError('Build an update first.');
      navigator.clipboard.writeText(output.value).then(() => UI.showSuccess('Update copied.')).catch(() => UI.showError('Copy failed.'));
    };
    document.getElementById('btn-sub-download').onclick = () => {
      if (!output.value) return UI.showError('Build an update first.');
      FileHelper.downloadText('status-update.md', output.value, 'text/markdown');
    };
    if (handoff?.value) run();
  },
};
