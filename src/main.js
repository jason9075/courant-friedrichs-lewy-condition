import katex from 'katex';
import renderMathInElement from 'katex/dist/contrib/auto-render';
import 'katex/dist/katex.min.css';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript.js';
import 'prism-themes/themes/prism-nord.css';

/* ─── Nord palette + layout ───────────────────────────────────────── */
const style = document.createElement('style');
style.textContent = `
  :root {
    --nord0: #2E3440; --nord1: #3B4252; --nord2: #434C5E; --nord3: #4C566A;
    --nord4: #D8DEE9; --nord5: #E5E9F0; --nord6: #ECEFF4;
    --nord7: #8FBCBB; --nord8: #88C0D0; --nord9: #81A1C1; --nord10: #5E81AC;
    --nord11: #BF616A; --nord12: #D08770; --nord13: #EBCB8B;
    --nord14: #A3BE8C; --nord15: #B48EAD;
  }
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: var(--nord0); color: var(--nord4);
    font-family: 'JetBrains Mono', monospace, sans-serif;
    overflow: hidden; height: 100vh;
  }
  #info { position: fixed; top: 0.8rem; left: 1rem; color: var(--nord8); font-size: 0.8rem; z-index: 10; }
  #toolbar {
    position: fixed; top: 0.7rem; left: 50%; transform: translateX(-50%);
    display: flex; gap: 0.5rem; align-items: center;
    padding: 0.5rem 0.8rem; border: 1px solid var(--nord3); border-radius: 999px;
    background: rgba(59, 66, 82, 0.9); backdrop-filter: blur(10px); z-index: 30;
  }
  #toolbar button { font: inherit; }
  #toolbar button, .modal-toggle {
    border: 1px solid var(--nord3); border-radius: 999px;
    background: var(--nord1); color: var(--nord6);
    padding: 0.4rem 0.7rem; cursor: pointer; font-size: 0.78rem;
    transition: background 0.15s;
  }
  #toolbar button:hover, .modal-toggle:hover { background: var(--nord2); }
  #toolbar .preset { color: var(--nord8); }
  .icon-button { font-size: 1.05rem; line-height: 1; }
  #toolbar .divider { width: 1px; height: 1.4rem; background: var(--nord3); }

  #stage {
    display: grid; grid-template-columns: 1fr 320px; gap: 1rem;
    height: 100vh; padding: 4rem 1rem 1rem; align-items: stretch;
  }
  #plots { display: grid; grid-template-rows: 1.35fr 1fr; gap: 1rem; min-width: 0; }
  .panel {
    display: flex; flex-direction: column; gap: 0.5rem;
    background: var(--nord1); border: 1px solid var(--nord3); border-radius: 14px;
    padding: 0.7rem 0.9rem; min-height: 0;
  }
  .panel-title { color: var(--nord8); font-size: 0.78rem; letter-spacing: 0.02em; }
  .canvas-wrap { position: relative; flex: 1; min-height: 0; }
  .canvas-wrap canvas { width: 100%; height: 100%; display: block; }
  #legend {
    position: absolute; top: 0.4rem; right: 0.6rem; display: flex; gap: 0.9rem;
    font-size: 0.72rem; color: var(--nord4);
  }
  .swatch { display: inline-block; width: 0.85rem; height: 0.18rem; margin-right: 0.3rem; vertical-align: middle; border-radius: 2px; }
  .swatch-exact { background: var(--nord14); }
  .swatch-num { background: var(--nord8); }
  #warning {
    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
    background: rgba(191, 97, 106, 0.92); color: var(--nord6);
    padding: 0.8rem 1.2rem; border-radius: 10px; font-size: 0.95rem; font-weight: 700;
    text-align: center; animation: blink 0.7s steps(2, start) infinite; z-index: 5;
  }
  #warning[hidden] { display: none; }
  #micro-note { font-size: 0.72rem; color: var(--nord4); line-height: 1.5; }

  #dashboard {
    background: var(--nord1); border: 1px solid var(--nord3); border-radius: 14px;
    padding: 1rem; display: flex; flex-direction: column; gap: 0.9rem; overflow-y: auto;
  }
  #dashboard h2 { font-size: 0.95rem; color: var(--nord8); }
  .control { display: grid; grid-template-columns: 1fr auto; gap: 0.3rem 0.5rem; align-items: center; }
  .control label { font-size: 0.78rem; }
  .control label em { color: var(--nord13); font-style: normal; }
  .control output { font-size: 0.78rem; color: var(--nord6); text-align: right; }
  .control input[type="range"] { grid-column: 1 / -1; width: 100%; accent-color: var(--nord8); cursor: pointer; }
  .control input[type="range"]:disabled { accent-color: var(--nord3); cursor: not-allowed; opacity: 0.5; }
  #autofix-row { display: flex; gap: 0.5rem; align-items: center; font-size: 0.76rem; cursor: pointer; }
  #autofix-row input { accent-color: var(--nord8); }

  #sigma-box {
    border-radius: 12px; padding: 0.9rem; text-align: center;
    border: 1px solid var(--nord3); transition: background 0.2s, color 0.2s;
  }
  #sigma-box.stable { background: rgba(163, 190, 140, 0.18); border-color: var(--nord14); }
  #sigma-box.critical { background: rgba(235, 203, 139, 0.2); border-color: var(--nord13); }
  #sigma-box.unstable { background: rgba(191, 97, 106, 0.24); border-color: var(--nord11); animation: blink 0.7s steps(2, start) infinite; }
  #sigma-formula { color: var(--nord6); margin-bottom: 0.4rem; }
  #sigma-numeric { font-size: 1.5rem; font-weight: 700; }
  #sigma-box.stable #sigma-numeric { color: var(--nord14); }
  #sigma-box.critical #sigma-numeric { color: var(--nord13); }
  #sigma-box.unstable #sigma-numeric { color: var(--nord11); }
  #sigma-status { font-size: 0.78rem; margin-top: 0.2rem; letter-spacing: 0.05em; }
  .dx-note { font-size: 0.72rem; color: var(--nord4); line-height: 1.5; }
  .dx-note span { color: var(--nord7); }

  @keyframes blink { 50% { opacity: 0.35; } }

  #math-modal { position: fixed; inset: 0; display: grid; place-items: center; background: rgba(46, 52, 64, 0.78); z-index: 50; }
  #math-modal[hidden] { display: none; }
  .modal-panel {
    width: min(760px, calc(100vw - 2rem)); max-height: calc(100vh - 2rem); overflow: auto;
    background: var(--nord1); border: 1px solid var(--nord3); border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.35); padding: 1.4rem;
  }
  .modal-header { display: flex; justify-content: space-between; align-items: center; gap: 1rem; margin-bottom: 1rem; }
  .modal-header h2 { font-size: 1.05rem; color: var(--nord8); }
  .modal-actions { display: flex; gap: 0.5rem; align-items: center; }
  .modal-body { display: grid; gap: 0.85rem; line-height: 1.75; color: var(--nord5); font-size: 0.92rem; }
  .modal-body h3 { color: var(--nord8); font-size: 0.95rem; margin-top: 0.3rem; }
  .modal-body pre[class*="language-"] { border-radius: 8px; overflow-x: auto; font-size: 0.8rem; margin: 0; }
`;
document.head.appendChild(style);

/* ─── Constants ───────────────────────────────────────────────────── */
const L = 1; // domain length
const PULSE_LEFT = 0.15; // square pulse start (in domain units)
const PULSE_RIGHT = 0.35; // square pulse end
const DIVERGE_THRESHOLD = 6; // |u| beyond this counts as numerical blow-up
const TARGET_SIGMA = 0.9; // auto-fix keeps σ at this safe value
const U_MIN = -0.6; // plot vertical range
const U_MAX = 1.6;

/**
 * @typedef {Object} SimParams
 * @property {number} c   Wave speed.
 * @property {number} dt  Time step Δt.
 * @property {number} n   Grid point count N.
 */

/* ─── Simulation state ────────────────────────────────────────────── */
/** @type {SimParams} */
const params = { c: 1, dt: 0.008, n: 101 };
let u = new Float64Array(params.n); // numerical field, current step
let scratch = new Float64Array(params.n); // reused buffer for the next step
let simTime = 0; // accumulated physical time
let diverged = false;
let running = true;
let autofix = false;
let modalLanguage = 'en';

/* ─── DOM refs ────────────────────────────────────────────────────── */
const waveCanvas = /** @type {HTMLCanvasElement} */ (document.getElementById('wave-canvas'));
const microCanvas = /** @type {HTMLCanvasElement} */ (document.getElementById('micro-canvas'));
const waveCtx = waveCanvas.getContext('2d');
const microCtx = microCanvas.getContext('2d');

const cSlider = document.getElementById('c-slider');
const dtSlider = document.getElementById('dt-slider');
const nSlider = document.getElementById('n-slider');
const cValue = document.getElementById('c-value');
const dtValue = document.getElementById('dt-value');
const nValue = document.getElementById('n-value');
const autofixBox = document.getElementById('autofix');
const sigmaFormula = document.getElementById('sigma-formula');
const sigmaNumeric = document.getElementById('sigma-numeric');
const sigmaStatus = document.getElementById('sigma-status');
const sigmaBox = document.getElementById('sigma-box');
const dxValueEl = document.getElementById('dx-value');
const warningEl = document.getElementById('warning');
const microNote = document.getElementById('micro-note');

const pauseButton = document.getElementById('pause-button');
const resetButton = document.getElementById('reset-button');
const openMathButton = document.getElementById('open-math');
const closeMathButton = document.getElementById('close-math');
const languageToggle = document.getElementById('language-toggle');
const mathModal = document.getElementById('math-modal');
const mathContent = document.getElementById('math-content');

/* ─── Derived quantities ──────────────────────────────────────────── */
/** @returns {number} Grid spacing Δx = L / (N − 1). */
const dx = () => L / (params.n - 1);
/** @returns {number} Courant number σ = c·Δt/Δx. */
const sigma = () => (params.c * params.dt) / dx();

/* ─── Initial / exact solution ────────────────────────────────────── */
/**
 * Top-hat (square) pulse evaluated on the periodic domain.
 * @param {number} x  Position in [0, L).
 * @returns {number}
 */
function pulse(x) {
  const xm = ((x % L) + L) % L;
  return xm >= PULSE_LEFT && xm <= PULSE_RIGHT ? 1 : 0;
}

/** Reset the numerical field to the initial pulse and clear divergence. */
function resetField() {
  u = new Float64Array(params.n);
  scratch = new Float64Array(params.n);
  const step = L / (params.n - 1);
  for (let i = 0; i < params.n; i++) u[i] = pulse(i * step);
  simTime = 0;
  diverged = false;
  warningEl.hidden = true;
}

/* ─── Finite-difference step (explicit upwind, periodic BC) ───────────
 * Advection PDE:  ∂u/∂t + c ∂u/∂x = 0,  c > 0.
 * Upwind:  u_i^{n+1} = u_i^n − σ (u_i^n − u_{i-1}^n).
 * Stable for 0 < σ ≤ 1; unbounded growth for σ > 1.
 * ------------------------------------------------------------------- */
function stepOnce() {
  const s = sigma();
  const n = params.n;
  for (let i = 0; i < n; i++) {
    const left = u[(i - 1 + n) % n];
    scratch[i] = u[i] - s * (u[i] - left);
  }
  [u, scratch] = [scratch, u];
  simTime += params.dt;

  let peak = 0;
  for (let i = 0; i < n; i++) {
    const a = Math.abs(u[i]);
    if (a > peak) peak = a;
  }
  if (peak > DIVERGE_THRESHOLD) {
    diverged = true;
    warningEl.hidden = false;
  }
}

/** @returns {number} FDM steps to advance per animation frame (visual pacing). */
const stepsPerFrame = () => Math.max(1, Math.min(20, Math.round(0.006 / params.dt)));

/* ─── Rendering: dual-wave plot ───────────────────────────────────── */
/** @param {HTMLCanvasElement} canvas */
function fitCanvas(canvas, ctx) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.max(1, Math.round(rect.width * dpr));
  canvas.height = Math.max(1, Math.round(rect.height * dpr));
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return rect;
}

function drawWave() {
  const { width: w, height: h } = fitCanvas(waveCanvas, waveCtx);
  waveCtx.clearRect(0, 0, w, h);

  const pad = 14;
  const xToPx = (x) => (x / L) * w;
  const uToPy = (val) => h - pad - ((val - U_MIN) / (U_MAX - U_MIN)) * (h - 2 * pad);

  // baseline (u = 0)
  waveCtx.strokeStyle = 'rgba(76, 86, 106, 0.7)';
  waveCtx.lineWidth = 1;
  waveCtx.beginPath();
  waveCtx.moveTo(0, uToPy(0));
  waveCtx.lineTo(w, uToPy(0));
  waveCtx.stroke();

  // analytic / exact pulse, translated by c·t
  waveCtx.strokeStyle = '#A3BE8C';
  waveCtx.lineWidth = 2;
  waveCtx.beginPath();
  const samples = 600;
  for (let k = 0; k <= samples; k++) {
    const x = (k / samples) * L;
    const val = pulse(x - params.c * simTime);
    const py = uToPy(val);
    k === 0 ? waveCtx.moveTo(xToPx(x), py) : waveCtx.lineTo(xToPx(x), py);
  }
  waveCtx.stroke();

  // numerical solution (clipped so divergence visibly flies off-canvas)
  waveCtx.save();
  waveCtx.beginPath();
  waveCtx.rect(0, 0, w, h);
  waveCtx.clip();
  waveCtx.strokeStyle = diverged ? '#BF616A' : '#88C0D0';
  waveCtx.lineWidth = 2;
  waveCtx.beginPath();
  const step = L / (params.n - 1);
  for (let i = 0; i < params.n; i++) {
    const px = xToPx(i * step);
    const py = uToPy(u[i]);
    i === 0 ? waveCtx.moveTo(px, py) : waveCtx.lineTo(px, py);
  }
  waveCtx.stroke();
  waveCtx.restore();
}

/* ─── Rendering: domain-of-dependence micro view ──────────────────── */
function drawMicro() {
  const { width: w, height: h } = fitCanvas(microCanvas, microCtx);
  microCtx.clearRect(0, 0, w, h);

  const s = sigma();
  const cx = w / 2;
  const gap = Math.min(82, (w - 80) / 6); // px spacing standing in for Δx
  const topY = h * 0.34;
  const botY = h * 0.78;

  // time-level guide lines
  microCtx.strokeStyle = 'rgba(76, 86, 106, 0.6)';
  microCtx.setLineDash([4, 4]);
  microCtx.lineWidth = 1;
  for (const y of [topY, botY]) {
    microCtx.beginPath();
    microCtx.moveTo(40, y);
    microCtx.lineTo(w - 16, y);
    microCtx.stroke();
  }
  microCtx.setLineDash([]);
  microCtx.fillStyle = '#81A1C1';
  microCtx.font = '11px monospace';
  microCtx.fillText('tₙ', 12, topY + 4);
  microCtx.fillText('tₙ₊₁', 8, botY + 4);

  // grid points at level n
  const span = 3; // points on each side of centre
  const labels = { '-1': 'xᵢ₋₁', '0': 'xᵢ', '1': 'xᵢ₊₁' };
  for (let k = -span; k <= span; k++) {
    const px = cx + k * gap;
    microCtx.fillStyle = '#D8DEE9';
    microCtx.beginPath();
    microCtx.arc(px, topY, 4, 0, Math.PI * 2);
    microCtx.fill();
    if (labels[k]) {
      microCtx.fillStyle = '#E5E9F0';
      microCtx.font = '11px monospace';
      microCtx.textAlign = 'center';
      microCtx.fillText(labels[k], px, topY - 10);
      microCtx.textAlign = 'left';
    }
  }

  // updated point at level n+1 (xᵢ)
  microCtx.fillStyle = '#ECEFF4';
  microCtx.beginPath();
  microCtx.arc(cx, botY, 5, 0, Math.PI * 2);
  microCtx.fill();

  // RED — numerical stencil reach: upwind uses xᵢ and xᵢ₋₁
  microCtx.strokeStyle = '#BF616A';
  microCtx.lineWidth = 2;
  for (const k of [0, -1]) {
    microCtx.beginPath();
    microCtx.moveTo(cx + k * gap, topY);
    microCtx.lineTo(cx, botY);
    microCtx.stroke();
  }
  microCtx.fillStyle = '#BF616A';
  for (const k of [0, -1]) {
    microCtx.beginPath();
    microCtx.arc(cx + k * gap, topY, 5, 0, Math.PI * 2);
    microCtx.fill();
  }
  microCtx.font = '10px monospace';
  microCtx.fillText('Δx (stencil)', cx - gap, topY + 18);

  // BLUE — physical domain of dependence: characteristic foot at xᵢ − c·Δt
  const footX = cx - s * gap;
  microCtx.fillStyle = 'rgba(136, 192, 208, 0.22)';
  microCtx.beginPath();
  microCtx.moveTo(cx, botY);
  microCtx.lineTo(footX, topY);
  microCtx.lineTo(cx, topY);
  microCtx.closePath();
  microCtx.fill();
  microCtx.strokeStyle = '#88C0D0';
  microCtx.lineWidth = 2;
  microCtx.beginPath();
  microCtx.moveTo(cx, botY);
  microCtx.lineTo(footX, topY);
  microCtx.stroke();
  microCtx.fillStyle = '#88C0D0';
  microCtx.beginPath();
  microCtx.arc(footX, topY, 4, 0, Math.PI * 2);
  microCtx.fill();
  microCtx.font = '10px monospace';
  microCtx.fillText('c·Δt', footX - 8, topY - 8);

  // verdict caption (English, per UI rules)
  if (s > 1.0001) {
    microNote.textContent =
      'σ > 1 — the physical signal (blue) has already crossed past xᵢ₋₁, ' +
      'outside the numerical stencil (red). The scheme cannot "see" where the wave went, so it blows up.';
    microNote.style.color = '#BF616A';
  } else {
    microNote.textContent =
      'σ ≤ 1 — the physical signal (blue) stays inside the numerical stencil (red). ' +
      'The scheme has the information it needs, so it stays stable.';
    microNote.style.color = '#A3BE8C';
  }
}

/* ─── Dashboard: σ readout + traffic light ────────────────────────── */
function updateSigmaReadout() {
  const s = sigma();
  katex.render(`\\sigma = \\frac{c\\,\\Delta t}{\\Delta x}`, sigmaFormula, { throwOnError: false });
  sigmaNumeric.textContent = s.toFixed(3);
  dxValueEl.textContent = `Δx = ${dx().toFixed(4)}`;

  sigmaBox.classList.remove('stable', 'critical', 'unstable');
  if (s > 1.0001) {
    sigmaBox.classList.add('unstable');
    sigmaStatus.textContent = 'Unstable';
  } else if (s > 0.999) {
    sigmaBox.classList.add('critical');
    sigmaStatus.textContent = 'Critical';
  } else {
    sigmaBox.classList.add('stable');
    sigmaStatus.textContent = 'Stable';
  }
}

/** Sync slider <output> labels with the current params. */
function syncLabels() {
  cValue.textContent = params.c.toFixed(2);
  dtValue.textContent = params.dt.toFixed(4);
  nValue.textContent = String(params.n);
}

/** Auto-fix: shrink Δt so σ = TARGET_SIGMA, clamped to the slider range. */
function applyAutofix() {
  const ideal = (TARGET_SIGMA * dx()) / params.c;
  const min = Number(dtSlider.min);
  const max = Number(dtSlider.max);
  params.dt = Math.min(max, Math.max(min, ideal));
  dtSlider.value = String(params.dt);
}

/** Recompute everything that depends on params and restart the field. */
function refresh({ reinit = true } = {}) {
  if (reinit) resetField();
  syncLabels();
  updateSigmaReadout();
}

/* ─── Scenario presets ────────────────────────────────────────────── */
const SCENARIOS = {
  balanced: { c: 1, n: 101, dt: 0.01 }, // σ = 1.00
  dissipation: { c: 1, n: 101, dt: 0.001 }, // σ = 0.10
  collapse: { c: 1, n: 101, dt: 0.0105 }, // σ = 1.05
};

/** @param {keyof typeof SCENARIOS} key */
function applyScenario(key) {
  const preset = SCENARIOS[key];
  autofix = false;
  autofixBox.checked = false;
  dtSlider.disabled = false;
  Object.assign(params, preset);
  cSlider.value = String(params.c);
  nSlider.value = String(params.n);
  dtSlider.value = String(params.dt);
  refresh();
}

/* ─── Event wiring ────────────────────────────────────────────────── */
cSlider.addEventListener('input', () => {
  params.c = Number(cSlider.value);
  if (autofix) applyAutofix();
  refresh();
});

nSlider.addEventListener('input', () => {
  params.n = Number(nSlider.value);
  if (autofix) applyAutofix();
  refresh();
});

dtSlider.addEventListener('input', () => {
  params.dt = Number(dtSlider.value);
  refresh();
});

autofixBox.addEventListener('change', () => {
  autofix = autofixBox.checked;
  dtSlider.disabled = autofix;
  if (autofix) applyAutofix();
  refresh();
});

pauseButton.addEventListener('click', () => {
  running = !running;
  pauseButton.textContent = running ? 'Pause' : 'Resume';
});

resetButton.addEventListener('click', () => {
  running = true;
  pauseButton.textContent = 'Pause';
  refresh();
});

for (const btn of document.querySelectorAll('.preset')) {
  btn.addEventListener('click', () => applyScenario(btn.dataset.scenario));
}

window.addEventListener('resize', () => {
  drawWave();
  drawMicro();
});

/* ─── Math modal (bilingual) ──────────────────────────────────────── */
const modalCopy = {
  en: `
    <p>This lab solves the one-dimensional <strong>advection equation</strong>, which transports a profile to the right at a constant speed $c$ without changing its shape:</p>
    <p>$$ \\frac{\\partial u}{\\partial t} + c\\,\\frac{\\partial u}{\\partial x} = 0 $$</p>
    <h3>Explicit upwind scheme</h3>
    <p>Discretising on a grid with spacing $\\Delta x$ and time step $\\Delta t$, the upwind finite-difference update is:</p>
    <p>$$ u_i^{\\,n+1} = u_i^{\\,n} - \\sigma\\left(u_i^{\\,n} - u_{i-1}^{\\,n}\\right), \\qquad \\sigma = \\frac{c\\,\\Delta t}{\\Delta x} $$</p>
    <h3>The CFL condition</h3>
    <p>The dimensionless number $\\sigma$ is the <strong>Courant number</strong>. The Courant–Friedrichs–Lewy condition states that the scheme is stable only when</p>
    <p>$$ \\sigma = \\frac{c\\,\\Delta t}{\\Delta x} \\le 1. $$</p>
    <p>Physically: in one time step a real signal travels a distance $c\\,\\Delta t$. The numerical stencil can only reach back one cell, a distance $\\Delta x$. If $c\\,\\Delta t > \\Delta x$ the signal escapes the stencil's reach — the algorithm computes from data that no longer carries the information, and the error amplifies every step until it explodes.</p>
    <pre><code class="language-js">// One explicit upwind step (periodic boundary), c > 0
for (let i = 0; i &lt; n; i++) {
  const left = u[(i - 1 + n) % n];
  next[i] = u[i] - sigma * (u[i] - left);
}
// stable iff  sigma = c * dt / dx &lt;= 1</code></pre>
  `,
  zhTW: `
    <p>這個實驗求解一維<strong>平流方程式（advection equation）</strong>：它讓一個波形以固定速度 $c$ 向右傳播，理論上形狀不會改變：</p>
    <p>$$ \\frac{\\partial u}{\\partial t} + c\\,\\frac{\\partial u}{\\partial x} = 0 $$</p>
    <h3>顯式迎風格式（Explicit Upwind）</h3>
    <p>在間距為 $\\Delta x$、時間步長為 $\\Delta t$ 的網格上離散化，迎風有限差分的更新公式為：</p>
    <p>$$ u_i^{\\,n+1} = u_i^{\\,n} - \\sigma\\left(u_i^{\\,n} - u_{i-1}^{\\,n}\\right), \\qquad \\sigma = \\frac{c\\,\\Delta t}{\\Delta x} $$</p>
    <h3>CFL 條件</h3>
    <p>無因次量 $\\sigma$ 稱為 <strong>Courant 數</strong>。Courant–Friedrichs–Lewy 條件指出，此顯式格式唯有在下列情況才穩定：</p>
    <p>$$ \\sigma = \\frac{c\\,\\Delta t}{\\Delta x} \\le 1. $$</p>
    <p>從物理意義看：在一個時間步內，真實訊號會走 $c\\,\\Delta t$ 的距離；但數值格式只能往回抓一個網格、也就是 $\\Delta x$ 的範圍。若 $c\\,\\Delta t > \\Delta x$，訊號就跑出了格式能抓到的範圍——程式用的是已經不含正確資訊的舊資料，誤差於是每一步被放大，最終發散爆炸。</p>
    <pre><code class="language-js">// 單一顯式迎風步（週期邊界），c > 0
for (let i = 0; i &lt; n; i++) {
  const left = u[(i - 1 + n) % n];
  next[i] = u[i] - sigma * (u[i] - left);
}
// 穩定條件： sigma = c * dt / dx &lt;= 1</code></pre>
  `,
};

function renderModalContent() {
  mathContent.innerHTML = modalCopy[modalLanguage];
  renderMathInElement(mathContent, {
    delimiters: [
      { left: '$$', right: '$$', display: true },
      { left: '$', right: '$', display: false },
    ],
    throwOnError: false,
  });
  Prism.highlightAllUnder(mathContent);
}

openMathButton.addEventListener('click', () => {
  renderModalContent();
  mathModal.hidden = false;
});
closeMathButton.addEventListener('click', () => {
  mathModal.hidden = true;
});
languageToggle.addEventListener('click', () => {
  modalLanguage = modalLanguage === 'en' ? 'zhTW' : 'en';
  renderModalContent();
});
mathModal.addEventListener('click', (e) => {
  if (e.target === mathModal) mathModal.hidden = true;
});

/* ─── Animation loop ──────────────────────────────────────────────── */
function frame() {
  requestAnimationFrame(frame);
  if (running && !diverged) {
    const steps = stepsPerFrame();
    for (let k = 0; k < steps; k++) stepOnce();
  }
  drawWave();
  drawMicro();
}

/* ─── Boot ────────────────────────────────────────────────────────── */
refresh();
frame();
