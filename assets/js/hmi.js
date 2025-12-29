/**
 * HMI Shell Controller
 * ISA-101 Compliant Dock Layout
 * κ = 0.618
 */

class HMIShell {
  constructor() {
    this.tags = new Map();
    this.screens = new Map();
    this.activeScreen = null;
    this.clock = null;
  }

  init() {
    this.startClock();
    this.bindTags();
    this.setupNav();
  }

  startClock() {
    const el = document.getElementById('clock');
    if (!el) return;
    const update = () => {
      const now = new Date();
      el.textContent = now.toTimeString().slice(0, 8);
    };
    update();
    this.clock = setInterval(update, 1000);
  }

  bindTags() {
    document.querySelectorAll('[data-tag]').forEach(el => {
      const path = el.dataset.tag;
      this.tags.set(path, { element: el, value: null });
    });
  }

  updateTag(path, value) {
    const tag = this.tags.get(path);
    if (!tag) return;
    tag.value = value;
    const el = tag.element;

    if (el.classList.contains('bar-fill')) {
      el.style.width = (value * 100) + '%';
    } else if (el.classList.contains('led')) {
      el.className = 'led ' + this.getState(value);
    } else {
      el.textContent = typeof value === 'number' ? value.toFixed(4) : value;
    }
  }

  getState(kappa) {
    if (kappa < 0.382) return 'warning';
    if (kappa > 0.809) return 'alarm';
    if (Math.abs(kappa - 0.618) < 0.01) return 'running';
    return 'normal';
  }

  setupNav() {
    const current = window.location.pathname;
    document.querySelectorAll('.nav-item').forEach(a => {
      const href = a.getAttribute('href');
      if (current.endsWith(href) || (href === './' && current.endsWith('/'))) {
        a.classList.add('active');
      } else {
        a.classList.remove('active');
      }
    });
  }

  setTitle(title) {
    const el = document.getElementById('screen-title');
    if (el) el.textContent = title;
  }

  setAlarmCount(count) {
    const el = document.getElementById('alarm-count');
    if (!el) return;
    el.textContent = count;
    el.classList.toggle('zero', count === 0);
  }
}

// Tag Graphics Components
class Gauge {
  constructor(el, options = {}) {
    this.el = el;
    this.min = options.min ?? 0;
    this.max = options.max ?? 1;
    this.target = options.target ?? 0.618;
    this.render();
  }

  render() {
    this.el.innerHTML = `
      <svg viewBox="0 0 100 100" class="gauge">
        <path class="gauge-arc" d="M20,80 A40,40 0 1,1 80,80"/>
        <path class="gauge-value" d="M20,80 A40,40 0 1,1 80,80"
              stroke-dasharray="188" stroke-dashoffset="188"/>
      </svg>
      <div class="gauge-text">
        <span class="gauge-number">--</span>
        <span class="gauge-label"></span>
      </div>
    `;
  }

  setValue(val) {
    const pct = (val - this.min) / (this.max - this.min);
    const offset = 188 * (1 - pct);
    this.el.querySelector('.gauge-value').style.strokeDashoffset = offset;
    this.el.querySelector('.gauge-number').textContent = val.toFixed(3);
  }
}

// Faceplate Component
class Faceplate {
  constructor(el, config) {
    this.el = el;
    this.config = config;
    this.render();
  }

  render() {
    this.el.innerHTML = `
      <div class="faceplate">
        <div class="faceplate-header">
          <span class="faceplate-title">${this.config.title}</span>
          <span class="faceplate-mode auto">AUTO</span>
        </div>
        <div class="faceplate-pv">--</div>
        <div class="bar-graph">
          <div class="bar-fill" style="width:0%"></div>
          <div class="bar-target" style="left:61.8%"></div>
        </div>
        <div class="faceplate-commands">
          <button class="cmd-btn start">Start</button>
          <button class="cmd-btn stop">Stop</button>
        </div>
      </div>
    `;
  }

  setPV(val) {
    this.el.querySelector('.faceplate-pv').textContent = val.toFixed(4);
    this.el.querySelector('.bar-fill').style.width = (val * 100) + '%';
  }
}

window.HMIShell = HMIShell;
window.Gauge = Gauge;
window.Faceplate = Faceplate;
