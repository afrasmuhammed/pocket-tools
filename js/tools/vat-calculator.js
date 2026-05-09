export default {
  init() {
    const modeEl   = document.getElementById('vat-mode');
    const rateEl   = document.getElementById('vat-rate');
    const amountEl = document.getElementById('vat-amount');
    const labelEl  = document.getElementById('vat-amount-label');

    const netOut   = document.getElementById('vat-net');
    const taxOut   = document.getElementById('vat-tax');
    const grossOut = document.getElementById('vat-gross');
    const taxLabel = document.getElementById('vat-label-amount');

    const fmt = (n) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

    const calculate = () => {
      const mode  = modeEl.value;
      const rate  = parseFloat(rateEl.value) / 100;
      const value = parseFloat(amountEl.value);

      // Update label
      labelEl.textContent = mode === 'add' ? 'Net Price (€)' : 'Gross Price (€)';
      taxLabel.textContent = `VAT ${rateEl.value} %`;

      if (!value || isNaN(value) || value < 0) {
        netOut.textContent = grossOut.textContent = taxOut.textContent = '—';
        return;
      }

      let net, gross, tax;

      if (mode === 'add') {
        net   = value;
        gross = net * (1 + rate);
        tax   = gross - net;
      } else {
        gross = value;
        net   = gross / (1 + rate);
        tax   = gross - net;
      }

      netOut.textContent   = fmt(net);
      taxOut.textContent   = fmt(tax);
      grossOut.textContent = fmt(gross);
    };

    modeEl.addEventListener('change', calculate);
    rateEl.addEventListener('change', calculate);
    amountEl.addEventListener('input', calculate);

    // Trigger once with empty state
    calculate();
  }
};
