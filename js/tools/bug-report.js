import { UI } from '../core/ui.js';

function listLines(text) {
  return text.split(/\r?\n/).map(line => line.trim()).filter(Boolean).map((line, i) => `${i + 1}. ${line}`).join('\n');
}

export default {
  init() {
    const fields = {
      title: document.getElementById('br-title'),
      severity: document.getElementById('br-severity'),
      env: document.getElementById('br-env'),
      steps: document.getElementById('br-steps'),
      expected: document.getElementById('br-expected'),
      actual: document.getElementById('br-actual'),
    };
    const output = document.getElementById('br-output');

    const render = () => {
      output.value = [
        `# ${fields.title.value.trim() || 'Bug title'}`,
        `Severity: ${fields.severity.value}`,
        `Environment: ${fields.env.value.trim() || 'Not specified'}`,
        '## Steps to Reproduce',
        listLines(fields.steps.value) || '1. Add steps here',
        '## Expected Result',
        fields.expected.value.trim() || 'Expected behavior',
        '## Actual Result',
        fields.actual.value.trim() || 'Actual behavior',
      ].join('\n\n');
    };

    document.getElementById('btn-br-sample').onclick = () => {
      fields.title.value = 'Checkout fails with saved card';
      fields.severity.value = 'High';
      fields.env.value = 'Chrome 125, macOS, staging';
      fields.steps.value = 'Log in as a returning customer\nAdd any product to cart\nChoose saved card\nClick Pay now';
      fields.expected.value = 'Payment succeeds and the order confirmation page opens.';
      fields.actual.value = 'Button shows loading for 20 seconds, then displays a generic error.';
      render();
    };
    document.getElementById('btn-br-copy').onclick = () => {
      navigator.clipboard.writeText(output.value)
        .then(() => UI.showToast('Copied!', 'success'))
        .catch(() => UI.showError('Copy failed.'));
    };
    Object.values(fields).forEach(el => {
      el.addEventListener('input', render);
      el.addEventListener('change', render);
    });
    render();
  },
};
