import { UI } from '../core/ui.js';
import { FileHelper } from '../core/file.js';
import { consumeHandoff } from '../core/handoff.js';

const SAMPLE = `Confirm launch blockers
Review public metadata and sitemap
Decide final pricing copy
Assign QA owners
Discuss cache rollout risk
Agree go/no-go checklist`;

function items(text) {
  return text.split(/\n+/).map(line => line.replace(/^[-*•\d.)\s]+/, '').trim()).filter(Boolean);
}

function build(goal, duration, attendees, notes) {
  const topics = items(notes);
  const decisions = topics.filter(topic => /\b(decide|confirm|agree|go\/no-go|approve)\b/i.test(topic));
  const minutes = Number(duration) || 30;
  const intro = Math.max(3, Math.round(minutes * 0.12));
  const close = Math.max(3, Math.round(minutes * 0.12));
  const remaining = Math.max(5, minutes - intro - close);
  const perTopic = topics.length ? Math.max(3, Math.floor(remaining / topics.length)) : remaining;
  const agenda = topics.length
    ? topics.map((topic, index) => `- ${index === 0 ? intro : intro + perTopic * index} min: ${topic} (${perTopic} min)`).join('\n')
    : '- 0 min: Open discussion';
  return {
    topics,
    decisions,
    output: [
      `# Meeting Agenda: ${goal.trim() || 'Working Session'}`,
      attendees.trim() ? `Attendees: ${attendees.trim()}` : '',
      `Duration: ${minutes} minutes`,
      '',
      '## Goal',
      `- ${goal.trim() || 'Align on the next decision and owners.'}`,
      '',
      '## Agenda',
      `- 0 min: Context and desired outcome (${intro} min)`,
      agenda,
      `- ${Math.max(intro, minutes - close)} min: Owners, decisions, and next steps (${close} min)`,
      '',
      '## Decisions Needed',
      decisions.length ? decisions.map(item => `- ${item}`).join('\n') : '- Confirm next step and owner',
      '',
      '## Prep',
      '- Bring relevant notes, links, files, or numbers',
      '- Identify one decision you need from the group',
    ].filter(line => line !== '').join('\n'),
  };
}

export default {
  init() {
    const goal = document.getElementById('ag-goal');
    const duration = document.getElementById('ag-duration');
    const attendees = document.getElementById('ag-attendees');
    const input = document.getElementById('ag-input');
    const output = document.getElementById('ag-output');
    const topicsMetric = document.getElementById('ag-topics');
    const minutesMetric = document.getElementById('ag-minutes');
    const decisionsMetric = document.getElementById('ag-decisions');
    const handoff = consumeHandoff('agenda-builder');
    if (handoff?.value) input.value = handoff.value;

    const run = () => {
      if (!goal.value.trim() && !input.value.trim()) return UI.showError('Add a goal or topics first.');
      const result = build(goal.value, duration.value, attendees.value, input.value);
      output.value = result.output;
      topicsMetric.textContent = String(result.topics.length);
      minutesMetric.textContent = duration.value;
      decisionsMetric.textContent = String(result.decisions.length);
      UI.showSuccess('Agenda built.');
    };

    document.getElementById('btn-ag-build').onclick = run;
    document.getElementById('btn-ag-sample').onclick = () => {
      goal.value = 'Finalize PocketKit launch readiness';
      attendees.value = 'Product, QA, design, operations';
      duration.value = '30';
      input.value = SAMPLE;
      run();
    };
    document.getElementById('btn-ag-clear').onclick = () => {
      goal.value = '';
      attendees.value = '';
      input.value = '';
      output.value = '';
      topicsMetric.textContent = '0';
      minutesMetric.textContent = '0';
      decisionsMetric.textContent = '0';
    };
    document.getElementById('btn-ag-copy').onclick = () => {
      if (!output.value) return UI.showError('Build an agenda first.');
      navigator.clipboard.writeText(output.value).then(() => UI.showSuccess('Agenda copied.')).catch(() => UI.showError('Copy failed.'));
    };
    document.getElementById('btn-ag-download').onclick = () => {
      if (!output.value) return UI.showError('Build an agenda first.');
      FileHelper.downloadText('meeting-agenda.md', output.value, 'text/markdown');
    };
    if (handoff?.value) run();
  },
};
