# CFL Lab — Courant–Friedrichs–Lewy Condition

[English](./README.md) · **繁體中文**

一個互動式教學網頁,用**有限差分法 (FDM)** 即時模擬一維**平流方程式 (advection equation)**,讓你親手體驗 **CFL 穩定性條件** $\sigma = \dfrac{c\,\Delta t}{\Delta x} \le 1$ 是如何決定數值解的成敗。

🔗 **Live Demo:** <https://jason9075.github.io/courant-friedrichs-lewy-condition/>

> 解析解(綠線)永遠完美右移;數值解(藍線)是否跟得上、何時爆炸,全看你怎麼調 $c$、$\Delta t$、$N$。

---

## ✨ 功能 Features

- **Live Wave(雙解對比)** — 解析解(exact)vs 顯式迎風 FDM 數值解,含離散格點與 $\Delta x$ 刻度。單次發射、跑完一趟自動停。
- **Courant Dashboard** — 三個拉桿(波速 $c$、時間步長 $\Delta t$、格點數 $N$)即時計算 $\sigma$,並以**交通號誌**回饋:綠(Stable)/ 黃(Critical, $\sigma=1$)/ 紅閃(Unstable)。
- **Auto-fix Δt** — 勾選後自動縮小 $\Delta t$ 維持綠燈,體驗 adaptive time-stepping。
- **Scenario Presets** — 一鍵套用 $\sigma=1$(完美)、$\sigma=0.1$(數值耗散)、$\sigma=1.05$(累積崩潰)。
- **Time Stack(2.5D 瀑布圖)** — 把多個時間層的波形以斜向投影堆疊,最新在前;可調 *Slice step* 粗細、hover 線條 highlight 並顯示該時刻資訊。
- **時間軸 Scrubber** — Live Wave 下方可拖動的時間軸(刻度對應 $\Delta t$ 步),前後檢視整段演化。
- **💡 The Math & Physics** — KaTeX 數學推導 modal,含真實世界類比;右上角 `Eng/中` 雙語切換。
- **🔬 Domain of Dependence** — 微觀視圖 modal,解釋物理特徵錐 vs 數值 stencil 為何決定發散。

---

## 📐 背後的數學

模擬的是一維線性平流方程式:

$$\frac{\partial u}{\partial t} + c\,\frac{\partial u}{\partial x} = 0$$

它描述某個量被固定速度 $c$ 的單向流體載著走(例:染料隨河水、煙隨風、溫水隨水流)。採**顯式迎風格式 (explicit upwind)**:

$$u_i^{\,n+1} = u_i^{\,n} - \sigma\left(u_i^{\,n} - u_{i-1}^{\,n}\right), \qquad \sigma = \frac{c\,\Delta t}{\Delta x}$$

**CFL 條件**:唯有 $\sigma \le 1$ 時格式才穩定。物理意義是「一個時間步內訊號走的距離 $c\,\Delta t$ 不能超過一格網格 $\Delta x$」,否則演算法抓不到資訊,誤差逐步放大直至發散。

---

## 🛠 技術棧 Tech Stack

- **Vite** — dev server / bundler
- **Vanilla JS + Canvas 2D** — 所有繪圖(刻意不引入 3D 引擎,維持輕量)
- **KaTeX** — 數學式渲染
- **Prism.js**(Nord theme)— 程式碼高亮
- **Nord** 配色

> 所有套件皆透過 `npm install` 安裝,**不使用任何 CDN**。

---

## 🚀 本地開發 Local Development

需求:[Nix](https://nixos.org/)(flake)+ [`direnv`](https://direnv.net/),或自備 Node.js 22。

```bash
# 進入開發環境(載入 nodejs_22 / bun / just)
direnv allow      # 或手動:nix develop

just install      # 安裝 npm 相依(--ignore-scripts,跳過 NixOS noexec 上的 esbuild postinstall)
just dev          # 啟動 Vite dev server → http://localhost:8080
```

> NixOS 的 home partition 常掛載為 `noexec`,`scripts/fix-noexec.cjs` 會在執行期把 esbuild / native binary 複製到 `/tmp` 再執行。

---

## 📦 建構與部署 Build & Deploy

```bash
just build        # 產生優化後的 dist/
just preview      # 本地預覽 production build
```

push 到 `main` 後,GitHub Actions(`.github/workflows/deploy.yml`)會自動建構並部署至 GitHub Pages。

> `vite.config.js` 的 `base` 設為 `/courant-friedrichs-lewy-condition/`(對應 repo 名稱);若 fork 後改名,請同步修改。

---

## 📂 專案結構

```
.
├── flake.nix                  # Nix devShell(nodejs_22 / bun / just)
├── Justfile                   # install / dev / build / preview / clean
├── vite.config.js             # base path + dev server
├── scripts/fix-noexec.cjs     # NixOS noexec workaround
├── index.html                 # UI 結構
├── src/main.js                # 模擬 + 渲染 + 互動邏輯
└── .github/workflows/deploy.yml
```

---

## 🎮 操作 Controls

| 控制項 | 說明 |
|---|---|
| `c` / `Δt` / `N` 拉桿 | 調整波速、時間步長、格點數;即時更新 $\sigma$ 與交通號誌 |
| Scenario 1 / 2 / 3 | 一鍵套用 $\sigma = 1$ / $0.1$ / $1.05$ 情境 |
| Pause / Resume / Reset / Replay | 控制模擬播放 |
| 時間軸滑桿 | 拖動 scrub 任一時刻的波形 |
| Time Stack | 切換 2.5D 時間瀑布圖;`Slice step` 調粗細,hover 看單層資訊 |
| 💡 / 🔬 | 開啟數學原理 / domain of dependence 說明 |

---

## 📄 License

[MIT](./LICENSE) © 2026 Jason Kuan ([jason9075](https://github.com/jason9075))
