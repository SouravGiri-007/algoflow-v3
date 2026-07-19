# AlgoFlow v3

**Interactive, step-by-step visualizations for Data Structures & Algorithms — built with React and rendered as pure SVG/CSS, entirely in the browser.**



## Why this project?

Most visualizers either hide the code or show it without connecting it to what's on screen. AlgoFlow ties the two together on every page: the exact executing line is highlighted the moment the visualization updates, narrated by a synced explanation feed. You can scrub through history, replay at seven speeds, feed in your own input, and switch languages — without leaving the page.

<p align="center">
  <img alt="React" src="https://badgen.net/badge/React/18.3/blue">
  <img alt="Vite" src="https://badgen.net/badge/Vite/7.0/purple">
  <img alt="Tailwind CSS" src="https://badgen.net/badge/Tailwind%20CSS/4.1/cyan">
  <img alt="React Router" src="https://badgen.net/badge/React%20Router/7.6/red">
  <img alt="License" src="https://badgen.net/badge/license/MIT/green">
  <img alt="Deployed on Vercel" src="https://badgen.net/badge/deployed/Vercel/black">
</p>

**[Live demo →](https://algoflow-v3.vercel.app)**

### Table of Contents
[Features](#-features) · [Screenshots](#-screenshots)   · [Project Structure](#-project-structure) · [Tech Stack](#-tech-stack) · [Installation](#-installation) · [Usage](#-usage) ·



---

## ✨ Features

- **41 interactive visualizations across 11 categories** — Array & LinkedList, Searching, Recursion, Stack & Queue, Sorting, Tree, Graph, Dynamic Programming, String, Greedy, Backtracking — all driven from one registry (`src/assets/data/navLinks.js`) that feeds the header, sidebar, and homepage automatically.
- **Step-array playback engine** — each page precomputes its full run as an array of state snapshots, then plays them back with a simple `setInterval`. No animation library, no physics — just CSS transitions between real algorithm states.
- **Synced multi-language code panel** — toggle Pseudocode ↔ Python/JS/C++, with the executing line auto-highlighted and auto-scrolled at every step.
- **Live, scrubbable explanations** — one plain-English sentence per step, with a "History" mode to review the full transcript.
- **Custom input, not canned demos** — array-based pages accept your own comma-separated values and re-run the real algorithm on them live, plus a one-click shuffle.
- **7-speed playback** (Super Slow → Instant), with manual Prev/Next stepping on graph algorithms.
- **Complexity badges** — every page shows color-coded Time/Space complexity.
- **Real SVG-rendered graphs, trees, and tries** — not just bar charts: computed node layouts, live distance tables, and shortest-path summaries (Dijkstra), a growing prefix-tree diagram (Trie), and genuine rotation/recoloring logic (Red-Black Tree).
- **Code-split, lazy-loaded routes** and a **PWA manifest** (installable; no service worker yet, so not offline-capable).

---

## 📸 Screenshots



| Homepage | Sorting Visualizer | Graph Visualizer |
|---|---|---|
| [![home.png](https://i.postimg.cc/BbmCVNnp/home.png)](https://postimg.cc/jnJNWHNn) | [![sorting.png](https://i.postimg.cc/6qMhmzp0/sorting.png)](https://postimg.cc/RJnf37f6) | [![graph.png](https://i.postimg.cc/FzTxBGHS/graph.png)](https://postimg.cc/kRt8VQ8M) |

---


## 🏗 Architecture

A pure client-side SPA — no backend, no API, no database. All "data" (demo graphs, tries) is hard-coded JavaScript inside the page components.


There is no network communication at runtime — `fetch`, `axios`, and `localStorage` do not appear anywhere in `src/`. Every algorithm page is a self-contained island of `useState`/`useRef`.

---

## 📂 Project Structure

```
algoflow-v3/
├── index.html / vite.config.js / vercel.json / eslint.config.js
├── public/                    
└── src/
    ├── main.jsx, App.jsx      # entry point + all 43 routes 
    ├── index.css              
    ├── assets/data/navLinks.js   drives all nav UI
    ├── lib/utils.ts           # cn() class-merge helper
    ├── components/
    │   ├── AlgoPageLayout.jsx    # shared shell: sidebar + sticky header + complexity badges
    │   ├── Sidebar.jsx, Header/, Footer/, TopicsList.jsx, SEO.jsx, Logo.jsx
    │   ├── ui/                   
    │   └── utils/                # CodePanel, ExplanationPanel, SpeedControl, Description
    └── pages/
        ├── home/Home.jsx, NotFound.jsx
        └── arrayLinkedList/, searching/, recursion/, stackQueue/, sorting/,
            tree/, graph/, dp/, string/, backtracking/   # 41 algorithm visualizers
```

---



## 🚀 Installation

```bash
git clone https://github.com/SouravGiri-007/algoflow-v3.git
cd algoflow-v3
npm install
npm run dev        # starts Vite dev server (vite --host)
```

No environment variables are required — the codebase has zero `import.meta.env`/`process.env` usage.

```bash
npm run build       # production build → dist/
npm run preview     # preview the production build locally
npm run lint         # ESLint
```

**Deployment:** the repo ships a `vercel.json` with the SPA rewrite Vercel needs for client-side routing; connecting the repo with default Vite build settings (`npm run build`, output `dist`) is enough. Deploying elsewhere requires adding that host's equivalent rewrite/redirect rule yourself.

---


## 🤝 Contributing

1. Add a new page under `src/pages/<category>/`, following an existing file's pattern (step generator + `AlgoPageLayout` + `CodePanel` + `ExplanationPanel`).
2. Register it in `src/assets/data/navLinks.js` (nav UI) **and** `src/App.jsx` (route + lazy import).
3. Run `npm run lint` before opening a PR.
 

Built  by **[Sourav Giri](https://github.com/SouravGiri-007)**.
