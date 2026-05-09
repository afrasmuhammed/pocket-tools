export default {
  startTime: 0,
  elapsedTime: 0,
  timerInterval: null,
  isRunning: false,
  laps: [],

  init() {
    this.display       = document.getElementById('sw-display');
    this.btnStart      = document.getElementById('btn-sw-start');
    this.btnPause      = document.getElementById('btn-sw-pause');
    this.btnLap        = document.getElementById('btn-sw-lap');
    this.btnReset      = document.getElementById('btn-sw-reset');
    this.lapsContainer = document.getElementById('sw-laps');
    this.emptyMsg      = document.querySelector('.sw-laps-empty');

    this.btnStart.onclick = () => this.start();
    this.btnPause.onclick = () => this.pause();
    this.btnLap.onclick   = () => this.lap();
    this.btnReset.onclick = () => this.reset();
  },

  start() {
    if (this.isRunning) return;
    this.startTime = Date.now() - this.elapsedTime;
    this.timerInterval = setInterval(() => {
      this.elapsedTime = Date.now() - this.startTime;
      this.updateDisplay(this.elapsedTime, this.display);
    }, 10);
    this.isRunning = true;
    this.btnStart.classList.add('hidden');
    this.btnPause.classList.remove('hidden');
    this.btnLap.disabled = false;
  },

  pause() {
    if (!this.isRunning) return;
    clearInterval(this.timerInterval);
    this.isRunning = false;
    this.btnStart.classList.remove('hidden');
    this.btnPause.classList.add('hidden');
    this.btnLap.disabled = true;
  },

  reset() {
    clearInterval(this.timerInterval);
    this.isRunning = false;
    this.elapsedTime = 0;
    this.laps = [];
    this.updateDisplay(0, this.display);
    this.renderLaps();
    this.btnStart.classList.remove('hidden');
    this.btnPause.classList.add('hidden');
    this.btnLap.disabled = true;
  },

  lap() {
    if (!this.isRunning) return;
    this.laps.unshift(this.elapsedTime);
    this.renderLaps();
  },

  updateDisplay(timeMs, element) {
    const totalSecs = Math.floor(timeMs / 1000);
    const m  = Math.floor(totalSecs / 60).toString().padStart(2, '0');
    const s  = (totalSecs % 60).toString().padStart(2, '0');
    const ms = Math.floor((timeMs % 1000) / 10).toString().padStart(2, '0');
    element.textContent = `${m}:${s}.${ms}`;
  },

  renderLaps() {
    this.lapsContainer.innerHTML = '';
    if (this.emptyMsg) {
      this.emptyMsg.style.display = this.laps.length ? 'none' : '';
    }
    this.laps.forEach((lapTime, index) => {
      const realIndex = this.laps.length - index;
      const el = document.createElement('div');
      el.className = 'lap-item';

      const idx  = document.createElement('span');
      idx.className = 'lap-index';
      idx.textContent = `Lap ${realIndex}`;

      const time = document.createElement('span');
      time.className = 'lap-time';
      this.updateDisplay(lapTime, time);

      el.appendChild(idx);
      el.appendChild(time);
      this.lapsContainer.appendChild(el);
    });
  }
};
