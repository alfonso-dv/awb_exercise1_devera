# Exercise 3 — Step-by-step demo guide

A presentation script for all 10 demos. For each demo: **what to have open**, **steps** (do them
in order) and **say** (key talking points). The full written answers are in
`CHANGES/CHANGES_EXERCISE_3.md`. Read them once before class.

---

## 0. One-time preparation (before class)

1. Install the **React Developer Tools** extension in Chrome/Edge (adds "Components" tab to
   DevTools).
2. In VS Code, open a terminal in the project folder and run:
   ```
   git pull
   npm ci
   npm run dev
   ```
   **Do not use Live Server.** It can't run TypeScript, so the page breaks.
3. Open two browser tabs:
   - Vanilla app: `http://localhost:5173/index.html`
   - React app: `http://localhost:5173/react.html`
4. Clear stored data so numbers start at 0: DevTools (F12) → **Application** → **Local Storage**
   → `http://localhost:5173` → right-click → **Clear**. Reload both tabs.
5. Do the Wikipedia steps from Demo 2 at home and **take screenshots**, in case the classroom
   network is slow.
6. Have these files ready in VS Code tabs:
   `src/main.ts`, `src/react/main.tsx`, `src/react/App.tsx`,
   `src/react/routing/useHashRoute.ts`, `src/react/pages/DashboardPage.tsx`,
   `src/react/data/useCaseData.ts`, `src/react/data/dashboardStats.ts`,
   `docs/component-hierarchy.md`, `docs/adr/0001-spa-with-react.md`.
7. Run `git log --oneline` and note the hashes of the 4 `EX3 DEMO …` commits.

Live versions (no setup needed):
`https://alfonso-dv.github.io/awb_exercise1_devera/` and `…/react.html`

---

## Demo 1 — Historical view of the web

**Have open:** `CHANGES/CHANGES_EXERCISE_3.md` (Demo 1 table), a terminal.

**Steps**
1. Show the timeline table: static documents → server-generated pages (CGI/PHP) → AJAX/jQuery
   → early SPAs (Backbone/AngularJS, hash routing) → component era (React/Vue) → hybrid
   (SSR/SSG, Next.js).
2. In the terminal, show the original app:
   ```
   git show 22cb2d8:app.js | less
   ```
   Search (type `/`) for `handleHashChange`, then `fetch(`, then `innerHTML`.
3. Open `index.html` and scroll: all 5 views are hidden `<section>`s in one file.
4. Open `src/react/App.tsx` to show where the app is going now (component era).

**Say**
- The original app is an **early-SPA / late-AJAX style** app (~2010–2012): one HTML shell,
  `fetch` + `innerHTML` templating, hand-written hash routing, globals, no components.
- AJAX solved **full page reloads for every small change**. It introduced **manual DOM syncing,
  spaghetti code, broken back button/URLs**, which SPA frameworks then addressed.
- Hash routing belongs to the **early SPA era**: the fragment never hits the server and works
  without the History API (`pushState`), which wasn't widely supported until ~2012.

---

## Demo 2 — SSR vs. CSR

**Have open:** the comparison table in the notes, your Wikipedia screenshots, `react.html`.

**Steps**
1. Show the SSR vs CSR table (what the server sends, what the browser must do, navigation).
2. **Wikipedia (SSR):** open an article, e.g. `en.wikipedia.org/wiki/Single-page_application`.
   1. `Ctrl+U` (view source) → `Ctrl+F` a sentence from the article → it's in the HTML.
   2. F12 → **Network** → filter **Doc** → reload → click the document → **Preview** shows the
      article.
   3. F12 → ⚙ Settings → **Debugger → Disable JavaScript** → reload → article still readable.
   4. Click a link → a whole new document loads (full page navigation).
   5. Re-enable JavaScript.
3. **This app (CSR):** open `react.html`.
   1. `Ctrl+U` → the source is only `<div id="root"></div>` + a script tag.
   2. F12 → **Network** → reload → show the order: `react.html` (tiny) → JS bundle →
      **then** the 5 `data/*.json` files.
   3. Disable JavaScript → reload `react.html` (blank) and `index.html` (empty skeleton,
      endless spinner). Re-enable.
   4. Optional: Network → throttling **Slow 3G** → reload to show the white-page time.
4. Walk through the 6 steps in code: `react.html` → `src/react/main.tsx` (`createRoot`) →
   `App.tsx` (first render: header + spinner) → `useCaseData.ts` (`useEffect` → 5 fetches) →
   state update → `DashboardPage.tsx` renders.

**Say**
- This app is **CSR**: the server only sends a shell, all content is built by JavaScript in the
  browser.
- **Cost:** nothing visible without JS. On slow devices/networks the user waits for HTML → JS →
  data before seeing anything. Crawlers and link previews see no content.

---

## Demo 3 — The virtual DOM

**Have open:** terminal, vanilla tab `index.html#evidence`, React tab.

**Steps**
1. Explain the VDOM in your own words: a cheap JS object tree describing the UI. On a change,
   build a new tree, **diff** it with the old one, apply only the minimal real-DOM changes.
2. Show the original example:
   ```
   git show 22cb2d8:app.js | sed -n 369,449p
   ```
   `handleBookmarkClick` (line 434) → `renderEvidenceList()` (448) → rebuilds **every** card
   with `renderEvidenceCardHTML` (397) → `container.innerHTML = html` (390).
3. Live in the vanilla app (`index.html#evidence`): F12 → **Elements** → expand
   `#evidenceList` → click one bookmark star → all cards get highlighted/replaced.
4. Optional proof: paste into the **Console**, then click one star:
   ```js
   let n = 0; new MutationObserver(m => m.forEach(r => n += r.addedNodes.length))
     .observe(document.getElementById("evidenceList"), {childList: true, subtree: true});
   ```
   Then type `n` → **18** (all cards replaced, 217 elements, for one changed star).
5. React tab: React DevTools → ⚙ → enable **"Highlight updates when components render"**,
   navigate between views. Only the changed parts flash.

**Say**
- With a VDOM, unchanged cards produce identical descriptions → **no DOM work**. The clicked card
  needs 2 small changes (class + ☆→★) instead of recreating 217 elements.
- The VDOM is **not automatically faster** than `innerHTML`: it trades extra JS work (building +
  diffing trees) for fewer DOM operations. Targeted manual updates are faster still.
- React apps can still be slow: unnecessary re-renders, heavy work in render, huge lists without
  virtualization, bad keys, big bundles.

---

## Demo 4 — SPA vs. MPA: state & routing

**Have open:** the sequence diagram in the notes (Demo 4), vanilla tab, `src/main.ts`.

**Steps**
1. Show the sequence diagram: click → `navigateTo()` sets `location.hash` → `hashchange` event
   → `handleHashChange()` → toggle `active` classes → render the view on first visit.
2. Live: F12 → **Network** (tick "Preserve log") → click through the nav buttons → **no new
   document request**, only the URL hash changes, and the Console keeps its messages (no reload).
3. F12 → **Sources** → open `src/main.ts` → breakpoint inside `handleHashChange` → click a nav
   button → show the **Call Stack** (triggered by the hashchange event) → resume.
4. State test:
   1. Bookmark E01. Open E02, write a note and **Save note**, set its status to **Flagged**.
   2. Set an evidence filter and leave a detail open.
   3. F12 → **Application → Local Storage**: only `remotion_bookmarks`, `remotion_notes`
      (and `remotion_hypothesis` if saved).
   4. Press **F5**: bookmark + note survive, the **flag is gone**, filter and detail reset, and
      the view stays (hash is in the URL).
5. Back button: Evidence → Timeline → **Back** (returns to Evidence, no reload). Then open an
   evidence detail and press Back: the detail does **not** close, you leave the view.

**Say**
- MPA: page data lives **on the server and in the URL**, rebuilt per request. SPA: in **browser
  memory** (+ localStorage/URL). Fast and stateful, but lost on reload and not linkable.
- A router library adds: URL params (`/evidence/E05`), query strings, History API/clean URLs,
  nested layouts, not-found/redirects, scroll and focus restoration, per-route data loading, code
  splitting.
- Back works for **views** (each hash change is a history entry), not for anything not in the
  URL.

---

## Demo 5 — React introduction

**Have open:** `src/react/sandbox/HelloCase.tsx`, `src/react/App.tsx`, the React tab.

**Steps**
1. Show `HelloCase.tsx`: static data, no props, no state, JSX with `{}` and `.map()` + `key`.
2. Render it live: in `src/react/App.tsx` add at the top
   ```tsx
   import { HelloCase } from "./sandbox/HelloCase.tsx";
   ```
   and put `<HelloCase />` inside `<main className="app-main">` (above `{caseData.status …}`).
   Save → the React tab updates instantly (Fast Refresh). **Undo afterwards.**
3. Show what JSX compiles to: open
   `http://localhost:5173/src/react/sandbox/HelloCase.tsx` **in a new tab**. You see
   `_jsxDEV("section", { className: "dashboard-panel", children: [...] })` instead of tags.
4. Compare side by side:
   ```
   git show 22cb2d8:app.js | sed -n 397,420p
   ```
   (`renderEvidenceCardHTML`, string concatenation) vs
   `src/react/components/dashboard/RecentEvidenceList.tsx`.
5. React DevTools → **Components** tab: the live component tree (`App → AppHeader → NavBar …`).

**Say**
- A **component** is a function of props/state that returns a *description* of UI. React decides
  when to call it, keeps its state, and updates the DOM. An HTML-string function is just a
  template that you paste in with `innerHTML` (unescaped, no identity, events wired by hand).
- **JSX** compiles to `jsx(type, props)` calls that create plain objects (React elements).
- Components must be **pure**: React may call them many times (twice in StrictMode). A side
  effect in the body would run unpredictably and cause stale UI or infinite loops. Side effects
  go in event handlers or `useEffect`.

---

## Demo 6 — React + TypeScript entry point

**Have open:** terminal, `package.json`, `vite.config.ts`, `tsconfig.json`, `react.html`,
`src/react/main.tsx`.

**Steps**
1. Show the commit: `git show <hash of "EX3 DEMO 5/6"> --stat`.
2. Walk through:
   - `package.json`: `react`, `react-dom` (dependencies) and `@vitejs/plugin-react`,
     `@types/react`, `@types/react-dom` (devDependencies).
   - `vite.config.ts`: the `react()` plugin, plus two inputs (`index.html`, `react.html`).
   - `tsconfig.json`: `"jsx": "react-jsx"`.
   - `react.html`: only `<div id="root">` + `<script src="src/react/main.tsx">`.
   - `src/react/main.tsx`: `createRoot(...).render(<StrictMode><App /></StrictMode>)`.
3. Show both apps running side by side (vanilla fully working, React growing).
4. **Fast Refresh:** change the `<h2>` text in `src/react/pages/DashboardPage.tsx` → save →
   updates without reload. Undo.
5. **Type error in TSX:** in `DashboardPage.tsx` change one line to
   `<StatCard value="18" label="Evidence items" />` → error overlay/terminal:
   `Type 'string' is not assignable to type 'number'`. Undo.
6. Run `npm run build` → output lists `dist/index.html` **and** `dist/react.html`.
   (Stop the dev server first or use a second terminal.)

**Say**
- Each piece: react (component model) · react-dom (DOM renderer) · plugin-react (JSX compile +
  Fast Refresh) · @types (TS types) · `jsx` setting (tsc understands TSX).
- Path to the page: `react.html` → `main.tsx` → Vite compiles TSX → `createRoot(#root).render(<App/>)`
  → React calls components → react-dom creates DOM.
- **Coexistence:** two separate pages, so the vanilla app stays fully working and they can be
  compared. A full swap would break 4 views for weeks. React islands inside the vanilla page
  would mean two systems fighting over the same DOM and state.

---

## Demo 7 — Component hierarchy

**Have open:** `docs/component-hierarchy.md` on GitHub (the Mermaid diagram renders there),
React tab with React DevTools.

**Steps**
1. Show the diagram on GitHub: `github.com/alfonso-dv/awb_exercise1_devera/blob/main/docs/component-hierarchy.md`.
   ✅ = built now. The rest is planned for Exercises 4–5.
2. Show the **props/data table** and pick 5 rows: `NavBar`, `DashboardPage`, `CaseSummaryCard`,
   `StatCard`, `StatusBadge`.
3. For each, open the file in `src/react/components/…` and point at its `…Props` interface.
4. React DevTools → **Components**: the live tree matches the ✅ part of the diagram. Click
   `StatCard` to show its props.

**Say**
- Criteria: **reused** → component; **owns state/behaviour** → component; **named block** of
  the UI → component; one-off element with no logic → inline.
- `StatusBadge` is used on the dashboard, evidence cards and the detail view. In vanilla the same
  `<span class="badge …">` string was **copy-pasted** in several render functions.
- Designing the whole tree now shows **where shared state must live** (that's why data is loaded
  in `App`) and which pieces to build generically from the start.

---

## Demo 8 — Architecture Decision Record

**Have open:** `docs/adr/0001-spa-with-react.md`, terminal.

**Steps**
1. Present the ADR top to bottom: Context → Decision → Reasons → **Consequences/trade-offs** →
   Alternatives → Revisit if…
2. Prove the bundle-size downside: `npm run build` → `main-*.js` ≈ 20 kB (vanilla) vs
   `react-*.js` ≈ 228 kB / 71 kB gzip (React).
3. Point back to the stale-dashboard bug (Demo 10) as the argument for declarative UI.

**Say**
- Server-rendered vanilla would lose instant navigation and in-memory state and needs a server.
  Vanilla + router keeps the manual-DOM bugs. Lighter libraries (Preact) are smaller but have
  less ecosystem.
- **Low-end devices / poor connections as a hard requirement → change the architecture:**
  pre-render the static case data (SSG/SSR, e.g. Astro), add small interactive islands, or at
  least use Preact + code splitting.

---

## Demo 9 — Application shell

**Have open:** React tab, vanilla tab, `useHashRoute.ts`, `App.tsx`, `NavBar.tsx`.

**Steps**
1. In `react.html`, click all 5 nav buttons: content, URL hash and highlighted button change.
2. Press **Back** / **Forward**: the view follows (Network tab stays empty, no reload).
3. Address bar: `http://localhost:5173/react.html#nonsense` → **"View not found"** page, no nav
   button highlighted → click **Go to the Dashboard**.
4. Same in vanilla: `http://localhost:5173/index.html#nonsense` → silently shows the Dashboard
   while the URL still says `#nonsense`.
5. React DevTools → **Components** → select `App` → in the hooks panel the
   **SyncExternalStore** value (the hash) changes as you navigate.
6. Code walk: `useHashRoute.ts` (`parseRoute`, `useSyncExternalStore`, `navigate`) →
   `App.tsx` (`renderView` switch) → `NavBar.tsx` (`active` class, `aria-current`).

**Say**
- **Same concept:** the URL hash drives everything in both versions.
- **Real difference:** vanilla copies the hash into a global (`currentPage`) and mutates the DOM
  by hand (three things to keep in sync). React **derives** the view from the hash on every render,
  so header and page can't disagree. Pages mount/unmount, with no `viewRendered` cache.
- **Unknown view:** React shows an explicit "not found". Vanilla silently falls back to the
  Dashboard (URL and screen disagree).

---

## Demo 10 — Dashboard view

**Have open:** both tabs side by side, React DevTools, `useCaseData.ts`, `dashboardStats.ts`,
`DashboardPage.tsx`.

**Steps**
1. Show both Dashboards side by side: identical text and numbers (18 / 6 / 6 / 0 / 1, 6 %,
   same recent lists).
2. **Navigate away and back** in React: Evidence → Timeline → Dashboard, plus Back/Forward.
   Nothing changes, and F12 → **Network** shows **no new `data/*.json` requests**.
3. **Stale-numbers bug (vanilla) vs React:**
   1. Clear localStorage, reload both tabs.
   2. Vanilla: Dashboard shows **0 Bookmarked** → Evidence → bookmark 2 items → back to
      Dashboard → **still 0** (stale!) → press F5 → **2**.
   3. Reload the React tab → shows **2** immediately (same browser storage).
4. Live recalculation: React DevTools → Components → select `App` → in hooks, open the
   `State` of `useCaseData` → edit a value (e.g. change one evidence `status` to `"reviewed"`)
   → the Reviewed card and progress bar update instantly.
5. Code walk: `App.tsx` (`useCaseData()` called once at the top) → `DashboardPage.tsx`
   (`computeDashboardStats(data)` on every render) → `StatCard.tsx`, `RecentEvidenceList.tsx`,
   `StatusBadge.tsx`.
6. Optional: Network → **Offline** → reload `react.html` → the error banner appears instead of an
   endless spinner. Set back to "No throttling".

**Say**
- **Data flow:** `App` loads all 5 JSON files once (`useCaseData`, in parallel) and passes them as
  props down to `DashboardPage`, which passes small pieces to each child. It's a **placeholder**:
  when views start changing data (Exercises 4–5) it moves into a shared store with update
  functions.
- **Stale-number risk:** gone *as long as all changes go through React state*. React re-renders
  and recomputes when state changes. Remaining risks: mutating objects instead of setting new
  state, and two sources of truth (vanilla tab changing localStorage).
- **When derived values are computed:** vanilla only when `renderDashboard()` happens to be
  called. React on **every render** (pure function, never stored), and once with complete data
  instead of three partial renders.

---

## Quick checklist on the day

- [ ] `npm run dev` running (not Live Server), both tabs open, localStorage cleared
- [ ] React DevTools installed
- [ ] Wikipedia screenshots ready
- [ ] Commit hashes noted (`git log --oneline`)
- [ ] Undo any live edits (Demo 5 HelloCase, Demo 6 h2/StatCard) before committing anything
