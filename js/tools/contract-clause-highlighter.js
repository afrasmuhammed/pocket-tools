import { UI } from '../core/ui.js';
import { FileHelper } from '../core/file.js';
import { consumeHandoff } from '../core/handoff.js';

const SAMPLE = `Service Agreement
The initial term begins on June 1, 2026 and renews automatically for successive 12-month periods unless either party gives 45 days written notice before renewal.
Client shall pay $4,800 per month plus applicable taxes. Late payments accrue interest at 1.5% per month.
Vendor must maintain confidentiality and may not disclose client data except as required to provide services.
Either party may terminate for material breach if the breach is not cured within 30 days.
Vendor's liability is limited to fees paid in the three months before the claim. Client indemnifies Vendor for third-party claims arising from supplied materials.`;

const CLAUSE_RULES = [
  ['Renewal', /\b(auto(?:matic)? renew|renews?|renewal|successive term|evergreen)\b/i],
  ['Termination', /\b(terminat|cancel|notice|material breach|cure period)\b/i],
  ['Payment', /\b(payment|pay|invoice|fee|late|interest|tax|deposit|refund)\b/i],
  ['Liability', /\b(liability|limitation|cap|damages|indemnif|warranty)\b/i],
  ['Confidentiality', /\b(confidential|non-disclosure|disclose|data|privacy)\b/i],
  ['Exclusivity', /\b(exclusive|non-compete|non-solicit|restriction)\b/i],
  ['IP / Ownership', /\b(intellectual property|ownership|license|work product|copyright)\b/i],
];

function uniqueMatches(text, regex) {
  return [...new Set((text.match(regex) || []).map(item => item.trim()))];
}

function sentences(text) {
  return text.replace(/\s+/g, ' ').split(/(?<=[.!?])\s+/).map(line => line.trim()).filter(Boolean);
}

function renderFindings(target, rows) {
  target.replaceChildren();
  rows.forEach(([label, value]) => {
    const row = document.createElement('div');
    row.className = 'seo-result-row';
    const strong = document.createElement('strong');
    strong.textContent = label;
    const span = document.createElement('span');
    span.textContent = value;
    row.append(strong, span);
    target.appendChild(row);
  });
}

function analyze(text, focus) {
  const dateMatches = uniqueMatches(text, /\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s+\d{1,2},?\s+20\d{2}|\b\d{1,2}[/-]\d{1,2}[/-]20\d{2}\b|\b20\d{2}\b/g);
  const moneyMatches = uniqueMatches(text, /(?:[$€£]\s?\d[\d,]*(?:\.\d{2})?|\b\d+(?:\.\d+)?\s?%)/g);
  const allSentences = sentences(text);
  const clauses = CLAUSE_RULES
    .map(([label, regex]) => [label, allSentences.filter(sentence => regex.test(sentence)).slice(0, 3)])
    .filter(([, matches]) => matches.length);
  const obligations = allSentences.filter(sentence => /\b(shall|must|required to|responsible for|agrees to|may not)\b/i.test(sentence)).slice(0, 8);
  const focusHint = {
    balanced: 'Review renewal, termination, payment, liability, and ownership together.',
    renewal: 'Pay closest attention to renewal notice windows and cancellation mechanics.',
    money: 'Check fees, taxes, late charges, refunds, and payment timing.',
    risk: 'Review liability caps, indemnities, warranties, restrictions, and confidentiality duties.',
  }[focus] || '';
  const report = [
    '# Contract Clause Review',
    '',
    'Extraction helper only. This is not legal advice.',
    '',
    '## Key Dates / Terms',
    dateMatches.length ? dateMatches.map(item => `- ${item}`).join('\n') : '- No clear dates found',
    '',
    '## Money / Percentages',
    moneyMatches.length ? moneyMatches.map(item => `- ${item}`).join('\n') : '- No clear amounts found',
    '',
    '## Obligations',
    obligations.length ? obligations.map(item => `- ${item}`).join('\n') : '- No obligation language found',
    '',
    '## Clauses to Review',
    clauses.length ? clauses.map(([label, matches]) => `### ${label}\n${matches.map(item => `- ${item}`).join('\n')}`).join('\n\n') : '- No common review clauses found',
    '',
    '## Suggested Focus',
    `- ${focusHint}`,
  ].join('\n');
  return { dateMatches, moneyMatches, clauses, obligations, report };
}

export default {
  init() {
    const input = document.getElementById('cch-input');
    const focus = document.getElementById('cch-focus');
    const output = document.getElementById('cch-output');
    const dateMetric = document.getElementById('cch-dates');
    const moneyMetric = document.getElementById('cch-money');
    const riskMetric = document.getElementById('cch-risk');
    const findings = document.getElementById('cch-findings');
    const handoff = consumeHandoff('contract-clause-highlighter');
    if (handoff?.value) input.value = handoff.value;

    const run = () => {
      const text = input.value.trim();
      if (!text) return UI.showError('Paste contract text first.');
      const result = analyze(text, focus.value);
      output.value = result.report;
      dateMetric.textContent = String(result.dateMatches.length);
      moneyMetric.textContent = String(result.moneyMatches.length);
      riskMetric.textContent = String(result.clauses.length);
      renderFindings(findings, [
        ['Dates / terms', result.dateMatches.slice(0, 4).join(', ') || 'None found'],
        ['Money / rates', result.moneyMatches.slice(0, 4).join(', ') || 'None found'],
        ['Obligations', result.obligations.length ? `${result.obligations.length} sentence(s)` : 'None found'],
        ['Review clauses', result.clauses.map(([label]) => label).join(', ') || 'None found'],
      ]);
      UI.showSuccess('Clauses highlighted.');
    };

    document.getElementById('btn-cch-highlight').onclick = run;
    document.getElementById('btn-cch-sample').onclick = () => {
      input.value = SAMPLE;
      focus.value = 'balanced';
      run();
    };
    document.getElementById('btn-cch-clear').onclick = () => {
      input.value = '';
      output.value = '';
      findings.replaceChildren();
      dateMetric.textContent = '0';
      moneyMetric.textContent = '0';
      riskMetric.textContent = '0';
    };
    document.getElementById('btn-cch-copy').onclick = () => {
      if (!output.value) return UI.showError('Highlight clauses first.');
      navigator.clipboard.writeText(output.value).then(() => UI.showSuccess('Summary copied.')).catch(() => UI.showError('Copy failed.'));
    };
    document.getElementById('btn-cch-download').onclick = () => {
      if (!output.value) return UI.showError('Highlight clauses first.');
      FileHelper.downloadText('contract-clause-review.md', output.value, 'text/markdown');
    };
    if (handoff?.value) run();
  },
};
