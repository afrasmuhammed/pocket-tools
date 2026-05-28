import { UI } from '../core/ui.js';
import { FileHelper } from '../core/file.js';
import { consumeHandoff } from '../core/handoff.js';

const SAMPLE = `Need to tell Morgan:
- we finished the first pass of the landing page
- waiting on brand photos and final pricing
- timeline slips if we do not get assets by Thursday
- ask them to confirm who approves the copy`;

const TONE_COPY = {
  friendly: {
    subject: 'Quick update and next steps',
    intro: 'I hope you are doing well. I wanted to share a quick update and make the next step easy.',
    close: 'Thanks,',
  },
  concise: {
    subject: 'Update and next step',
    intro: 'Here is the current status and the next action needed.',
    close: 'Best,',
  },
  firm: {
    subject: 'Action needed to keep the timeline on track',
    intro: 'I wanted to flag the key items needed so we can keep the work moving on schedule.',
    close: 'Best,',
  },
  'follow-up': {
    subject: 'Following up on next steps',
    intro: 'I am following up with a clear summary of what is pending and what we need next.',
    close: 'Thanks,',
  },
  payment: {
    subject: 'Payment follow-up',
    intro: 'I am following up on the outstanding payment and wanted to keep the details clear.',
    close: 'Thank you,',
  },
};

function cleanLines(text) {
  return text
    .split(/\n+/)
    .map(line => line.replace(/^[-*•\d.)\s]+/, '').trim())
    .filter(Boolean);
}

function sentenceCase(line) {
  const clean = line.replace(/\s+/g, ' ').trim();
  if (!clean) return '';
  return clean.charAt(0).toUpperCase() + clean.slice(1).replace(/[.!?]*$/, '.');
}

function wordCount(text) {
  return (text.match(/\b[\w'-]+\b/g) || []).length;
}

function buildEmail(text, tone, name, ask) {
  const lines = cleanLines(text);
  const copy = TONE_COPY[tone] || TONE_COPY.friendly;
  const bodyLines = lines.map(sentenceCase);
  const askLine = ask.trim()
    ? `Could you please ${ask.trim().replace(/[.!?]*$/, '')}?`
    : '';
  const greeting = `Hi ${name.trim() || 'there'},`;
  const body = [
    `Subject: ${copy.subject}`,
    '',
    greeting,
    '',
    copy.intro,
    '',
    ...bodyLines.map(line => `- ${line}`),
    askLine ? '' : null,
    askLine,
    '',
    copy.close,
  ].filter(line => line !== null);
  return body.join('\n');
}

export default {
  init() {
    const input = document.getElementById('cep-input');
    const tone = document.getElementById('cep-tone');
    const name = document.getElementById('cep-name');
    const ask = document.getElementById('cep-ask');
    const output = document.getElementById('cep-output');
    const words = document.getElementById('cep-words');
    const toneMetric = document.getElementById('cep-tone-metric');
    const structure = document.getElementById('cep-structure');
    const handoff = consumeHandoff('client-email-polisher');
    if (handoff?.value) input.value = handoff.value;

    const run = () => {
      const text = input.value.trim();
      if (!text) return UI.showError('Add rough notes or a draft first.');
      output.value = buildEmail(text, tone.value, name.value, ask.value);
      words.textContent = String(wordCount(output.value));
      toneMetric.textContent = tone.options[tone.selectedIndex]?.textContent || 'Custom';
      structure.textContent = output.value.includes('- ') ? 'Bulleted' : 'Email';
      UI.showSuccess('Email polished.');
    };

    document.getElementById('btn-cep-polish').onclick = run;
    document.getElementById('btn-cep-sample').onclick = () => {
      input.value = SAMPLE;
      name.value = 'Taylor';
      ask.value = 'confirm who should approve the copy by Thursday';
      tone.value = 'firm';
      run();
    };
    document.getElementById('btn-cep-clear').onclick = () => {
      input.value = '';
      ask.value = '';
      name.value = '';
      output.value = '';
      words.textContent = '0';
      toneMetric.textContent = '--';
      structure.textContent = '--';
    };
    document.getElementById('btn-cep-copy').onclick = () => {
      if (!output.value) return UI.showError('Polish an email first.');
      navigator.clipboard.writeText(output.value).then(() => UI.showSuccess('Email copied.')).catch(() => UI.showError('Copy failed.'));
    };
    document.getElementById('btn-cep-download').onclick = () => {
      if (!output.value) return UI.showError('Polish an email first.');
      FileHelper.downloadText('client-email.txt', output.value);
    };
    if (handoff?.value) run();
  },
};
