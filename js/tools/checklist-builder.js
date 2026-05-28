import { UI } from '../core/ui.js';
import { FileHelper } from '../core/file.js';
import { consumeHandoff } from '../core/handoff.js';

const SAMPLE = `Verify homepage and all pockets
Check sitemap.xml and tools.json
Run tool samples for new launch tools
Confirm service worker version changed
Review mobile layout
Share live link for final approval
After launch, monitor cache and broken routes`;

function cleanLines(text) {
  return text.split(/\n+/).map(line => line.replace(/^[-*•☐✅\d.)\s]+/, '').trim()).filter(Boolean);
}

function classify(line) {
  const lower = line.toLowerCase();
  if (/\b(before|prep|prepare|gather|collect|confirm)\b/.test(lower)) return 'prep';
  if (/\b(check|test|verify|run|review|inspect)\b/.test(lower)) return 'action';
  if (/\b(after|monitor|follow|handoff|share|send|publish)\b/.test(lower)) return 'follow';
  return 'action';
}

function section(title, rows) {
  return [`## ${title}`, ...(rows.length ? rows.map(row => `- [ ] ${row}`) : ['- [ ] Nothing captured'])].join('\n');
}

function build(text, title, style) {
  const rows = cleanLines(text);
  const buckets = { prep: [], action: [], follow: [] };
  rows.forEach(row => buckets[classify(row)].push(row));
  if (style === 'flat') {
    return {
      rows,
      sections: 1,
      output: [`# ${title.trim() || 'Checklist'}`, '', ...rows.map(row => `- [ ] ${row}`)].join('\n'),
    };
  }
  if (style === 'qa') {
    return {
      rows,
      sections: 3,
      output: [
        `# ${title.trim() || 'QA Checklist'}`,
        '',
        section('Smoke Pass', buckets.action),
        '',
        section('Regression Watch', buckets.prep),
        '',
        section('Launch Follow-up', buckets.follow),
      ].join('\n'),
    };
  }
  return {
    rows,
    sections: 3,
    output: [
      `# ${title.trim() || 'Checklist'}`,
      '',
      section('Prep', buckets.prep),
      '',
      section('Do', buckets.action),
      '',
      section('Follow-up', buckets.follow),
    ].join('\n'),
  };
}

export default {
  init() {
    const input = document.getElementById('clb-input');
    const title = document.getElementById('clb-title');
    const style = document.getElementById('clb-style');
    const output = document.getElementById('clb-output');
    const itemMetric = document.getElementById('clb-items');
    const sectionMetric = document.getElementById('clb-sections');
    const styleMetric = document.getElementById('clb-style-metric');
    const handoff = consumeHandoff('checklist-builder');
    if (handoff?.value) input.value = handoff.value;

    const run = () => {
      if (!input.value.trim()) return UI.showError('Add notes first.');
      const result = build(input.value, title.value, style.value);
      output.value = result.output;
      itemMetric.textContent = String(result.rows.length);
      sectionMetric.textContent = String(result.sections);
      styleMetric.textContent = style.options[style.selectedIndex]?.textContent || 'Grouped';
      UI.showSuccess('Checklist built.');
    };

    document.getElementById('btn-clb-build').onclick = run;
    document.getElementById('btn-clb-sample').onclick = () => {
      input.value = SAMPLE;
      title.value = 'PocketKit Launch Checklist';
      style.value = 'qa';
      run();
    };
    document.getElementById('btn-clb-clear').onclick = () => {
      input.value = '';
      title.value = '';
      output.value = '';
      itemMetric.textContent = '0';
      sectionMetric.textContent = '0';
      styleMetric.textContent = '--';
    };
    document.getElementById('btn-clb-copy').onclick = () => {
      if (!output.value) return UI.showError('Build a checklist first.');
      navigator.clipboard.writeText(output.value).then(() => UI.showSuccess('Checklist copied.')).catch(() => UI.showError('Copy failed.'));
    };
    document.getElementById('btn-clb-download').onclick = () => {
      if (!output.value) return UI.showError('Build a checklist first.');
      FileHelper.downloadText('checklist.md', output.value, 'text/markdown');
    };
    if (handoff?.value) run();
  },
};
