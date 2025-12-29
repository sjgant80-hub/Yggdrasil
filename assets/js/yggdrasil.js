// Yggdrasil v1.0.0 | κ=0.618
const PHI = 1.618033988749895;
const KAPPA = 1 / PHI;
const ALPHA = 2.854;

class WorldTree {
  constructor(kappa = Math.random()) {
    this.kappa = kappa;
    this.age = 0;
    this.energy = 100;
  }

  step() {
    const push = -ALPHA * (this.kappa - KAPPA) * (1 - this.kappa) * this.kappa;
    const noise = (Math.random() - 0.5) * 0.02;
    this.kappa = Math.max(0.01, Math.min(0.99, this.kappa + 0.1 * (push + noise)));
    this.age++;
    return this.kappa;
  }

  get chaosPercent() { return (this.kappa * 100).toFixed(1); }
  get orderPercent() { return ((1 - this.kappa) * 100).toFixed(1); }
  get status() {
    if (this.kappa < 0.382) return 'ordered';
    if (this.kappa > 0.809) return 'chaotic';
    return 'optimal';
  }
}

window.WorldTree = WorldTree;
window.PHI = PHI;
window.KAPPA = KAPPA;

console.log('Yggdrasil loaded | κ* =', KAPPA.toFixed(6));
