export default {
  interval: null,

  init() {
    const labelEl   = document.getElementById('cd-label');
    const targetEl  = document.getElementById('cd-target');
    const btnStart  = document.getElementById('btn-cd-start');
    const btnReset  = document.getElementById('btn-cd-reset');

    const displayPanel = document.getElementById('cd-display-panel');
    const donePanel    = document.getElementById('cd-done-panel');

    const daysEl   = document.getElementById('cd-days');
    const hoursEl  = document.getElementById('cd-hours');
    const minsEl   = document.getElementById('cd-mins');
    const secsEl   = document.getElementById('cd-secs');
    const nameEl   = document.getElementById('cd-event-name');
    const targetLbl= document.getElementById('cd-target-label');
    const doneMsgEl= document.getElementById('cd-done-msg');

    const pad = (n) => String(n).padStart(2, '0');

    const stop = () => {
      clearInterval(this.interval);
      this.interval = null;
    };

    const reset = () => {
      stop();
      displayPanel.style.display = 'none';
      donePanel.style.display    = 'none';
      [daysEl, hoursEl, minsEl, secsEl].forEach(el => el.textContent = '00');
    };

    const tick = (target, label) => {
      const diff = target - Date.now();

      if (diff <= 0) {
        stop();
        displayPanel.style.display = 'none';
        donePanel.style.display    = '';
        doneMsgEl.textContent = label ? `"${label}" has arrived!` : 'Time\'s up!';
        return;
      }

      const totalSecs = Math.floor(diff / 1000);
      const days  = Math.floor(totalSecs / 86400);
      const hours = Math.floor((totalSecs % 86400) / 3600);
      const mins  = Math.floor((totalSecs % 3600) / 60);
      const secs  = totalSecs % 60;

      daysEl.textContent  = String(days).padStart(2, '0');
      hoursEl.textContent = pad(hours);
      minsEl.textContent  = pad(mins);
      secsEl.textContent  = pad(secs);
    };

    btnStart.addEventListener('click', () => {
      const value = targetEl.value;
      if (!value) { targetEl.focus(); return; }

      const target = new Date(value).getTime();
      if (isNaN(target)) return;

      const label = labelEl.value.trim();

      stop();
      reset();

      // Show display
      displayPanel.style.display = '';
      donePanel.style.display    = 'none';
      nameEl.textContent = label || 'Counting down…';

      // Target label
      const fmtDate = new Intl.DateTimeFormat('de-DE', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      }).format(new Date(target));
      targetLbl.textContent = `Target: ${fmtDate}`;

      tick(target, label);
      this.interval = setInterval(() => tick(target, label), 1000);
    });

    btnReset.addEventListener('click', reset);

    // Default to tomorrow same time
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setSeconds(0, 0);
    const iso = new Date(tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60000)
      .toISOString().slice(0, 16);
    targetEl.value = iso;
  }
};
