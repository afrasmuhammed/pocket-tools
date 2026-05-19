import { UI } from '../core/ui.js';

function rows(text) {
  return text.split(/\r?\n/).map(line => line.trim()).filter(Boolean).map((line, i) => `| ${i + 1} | ${line} | |`).join('\n');
}

export default {
  init() {
    const fields = {
      title: document.getElementById('tc-title'),
      priority: document.getElementById('tc-priority'),
      type: document.getElementById('tc-type'),
      precondition: document.getElementById('tc-precondition'),
      steps: document.getElementById('tc-steps'),
      expected: document.getElementById('tc-expected'),
    };
    const output = document.getElementById('tc-output');

    const render = () => {
      output.value = [
        `# ${fields.title.value.trim() || 'Test case title'}`,
        `Priority: ${fields.priority.value}`,
        `Type: ${fields.type.value}`,
        `Precondition: ${fields.precondition.value.trim() || 'None'}`,
        '| Step | Action | Result |',
        '|---:|---|---|',
        rows(fields.steps.value) || '| 1 | Add action here | |',
        'Expected Result:',
        fields.expected.value.trim() || 'Expected result',
      ].join('\n\n');
    };

    document.getElementById('btn-tc-sample').onclick = () => {
      fields.title.value = 'User can reset password';
      fields.priority.value = 'High';
      fields.type.value = 'Regression';
      fields.precondition.value = 'User account exists and can receive email.';
      fields.steps.value = 'Open forgot password page\nEnter registered email\nSubmit form\nOpen reset link\nSet a new password';
      fields.expected.value = 'User can sign in with the new password.';
      render();
    };
    document.getElementById('btn-tc-copy').onclick = () => {
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
