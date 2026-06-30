# CFL Lab — Courant–Friedrichs–Lewy Condition

**English** · [繁體中文](./README.zh-TW.md)

An interactive teaching page that solves the 1‑D **advection equation** in real time with the **finite‑difference method (FDM)**, letting you feel first‑hand how the **CFL stability condition** $\sigma = \dfrac{c\,\Delta t}{\Delta x} \le 1$ decides whether a numerical scheme survives or blows up.

🔗 **Live Demo:** <https://jason9075.github.io/courant-friedrichs-lewy-condition/>

> The analytic solution (green) always translates rightward perfectly; whether the numerical solution (blue) keeps up — or when it explodes — is entirely up to how you tune $c$, $\Delta t$ and $N$.

---

## ✨ Features

- **Live Wave (dual solution)** — analytic (exact) vs. explicit‑upwind FDM, with discrete grid nodes and $\Delta x$ ticks. Single shot: the pulse runs one pass and auto‑pauses.
- **Courant Dashboard** — three sliders (wave speed $c$, time step $\Delta t$, grid points $N$) compute $\sigma$ live with **traffic‑light** feedback: green (Stable) / yellow (Critical, $\sigma=1$) / blinking red (Unstable).
- **Auto‑fix Δt** — adaptively shrinks $\Delta t$ to keep the light green (adaptive time‑stepping).
- **Scenario Presets** — one click for $\sigma=1$ (perfect), $\sigma=0.1$ (numerical dissipation), $\sigma=1.05$ (accumulating blow‑up).
- **Time Stack (2.5D waterfall)** — stacks successive time slices via oblique projection, newest in front; adjustable *Slice step* (coarseness), with hover highlight + per‑slice info.
- **Timeline Scrubber** — a draggable time axis under the Live Wave (ticks tied to $\Delta t$ steps) to scrub the whole evolution.
- **💡 The Math & Physics** — a KaTeX explainer modal with real‑world analogies and an `Eng/中` language toggle.
- **🔬 Domain of Dependence** — a micro‑view modal explaining why the physical characteristic cone vs. the numerical stencil governs divergence.

---

## 📐 The Math

It solves the 1‑D linear advection equation:

$$\frac{\partial u}{\partial t} + c\,\frac{\partial u}{\partial x} = 0$$

This describes a quantity carried by a steady one‑way flow at speed $c$ (think dye in a river, smoke on the wind, or warm water swept along by a current). The **explicit upwind** scheme is used:

$$u_i^{\,n+1} = u_i^{\,n} - \sigma\left(u_i^{\,n} - u_{i-1}^{\,n}\right), \qquad \sigma = \frac{c\,\Delta t}{\Delta x}$$

**The CFL condition:** the scheme is stable only when $\sigma \le 1$. Physically, the distance a signal travels in one time step ($c\,\Delta t$) must not exceed one grid cell ($\Delta x$); otherwise the algorithm cannot reach the information it needs and the error amplifies every step until it diverges.

---

## 🛠 Tech Stack

- **Vite** — dev server / bundler
- **Vanilla JS + Canvas 2D** — all rendering (deliberately no 3D engine, kept lightweight)
- **KaTeX** — math typesetting
- **Prism.js** (Nord theme) — code highlighting
- **Nord** color palette

> Every dependency is installed via `npm install` — **no CDNs**.

---

## 🚀 Local Development

Requires [Nix](https://nixos.org/) (flakes) + [`direnv`](https://direnv.net/), or your own Node.js 22.

```bash
# Enter the dev shell (loads nodejs_22 / bun / just)
direnv allow      # or manually: nix develop

just install      # install npm deps (--ignore-scripts skips esbuild postinstall on NixOS noexec)
just dev          # start the Vite dev server → http://localhost:8080
```

> NixOS home partitions are often mounted `noexec`; `scripts/fix-noexec.cjs` copies esbuild / native binaries to `/tmp` at runtime before executing them.

---

## 📦 Build & Deploy

```bash
just build        # produce an optimized dist/
just preview      # preview the production build locally
```

Pushing to `main` triggers GitHub Actions (`.github/workflows/deploy.yml`) to build and deploy to GitHub Pages.

> `base` in `vite.config.js` is set to `/courant-friedrichs-lewy-condition/` (matching the repo name); update it if you fork and rename.

---

## 📂 Project Structure

```
.
├── flake.nix                  # Nix devShell (nodejs_22 / bun / just)
├── Justfile                   # install / dev / build / preview / clean
├── vite.config.js             # base path + dev server
├── scripts/fix-noexec.cjs     # NixOS noexec workaround
├── index.html                 # UI structure
├── src/main.js                # simulation + rendering + interaction
└── .github/workflows/deploy.yml
```

---

## 🎮 Controls

| Control | Description |
|---|---|
| `c` / `Δt` / `N` sliders | Adjust wave speed, time step, grid points; updates $\sigma$ and the traffic light live |
| Scenario 1 / 2 / 3 | One‑click $\sigma = 1$ / $0.1$ / $1.05$ presets |
| Pause / Resume / Reset / Replay | Playback controls |
| Timeline slider | Drag to scrub the wave at any moment |
| Time Stack | Toggle the 2.5D time waterfall; `Slice step` sets coarseness, hover inspects a slice |
| 💡 / 🔬 | Open the math explainer / domain‑of‑dependence view |

---

## 📄 License

[MIT](./LICENSE) © 2026 Jason Kuan ([jason9075](https://github.com/jason9075))
