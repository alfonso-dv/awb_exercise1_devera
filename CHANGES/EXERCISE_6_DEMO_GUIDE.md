# Exercise 6 — Step-by-step demo guide

A presentation script for all 10 demos. For each demo: **have open**, **steps** and **say**. The
full answers are in `CHANGES/CHANGES_EXERCISE_6.md`, and the data-flow diagram is in
`docs/data-flow.md`.

---

## 0. Preparation (before class)

1. Terminal (Command Prompt) in the project folder:
   ```
   git checkout main
   git pull
   npm ci
   ```
   `npm ci` is needed: Express is a new dependency.
2. Start backend + frontend **in two terminals**, so you can stop the backend live in Demo 6:
   - Terminal 1: `npm run api` → "Case-data API (dev only) on http://localhost:3001/api"
   - Terminal 2: `npm run dev`

   (For everyday use, `npm run dev:all` starts both in one terminal.)
3. Browser: `http://localhost:5173/react.html#/dashboard`. Open DevTools (F12) and keep the
   **Console** and **Network** tabs handy. In Network, tick "Preserve log" and type `api` in the
   filter box.
4. `git log --oneline` → note the hashes of the `EX6 DEMO …` commits, especially both
   **`EX6 DEMO 7`** commits.
5. Bookmark these URLs (all on `http://localhost:5173/`):

| URL | For |
|---|---|
| `react.html#/sandbox/effects` | Demos 1–3 (effects lab) |
| `react.html?delay=2000#/evidence` | loading state |
| `react.html?fail=500#/evidence` | error state |
| `react.html?empty=1#/evidence` | empty state |
| `react.html?slow=E01&delay=2500#/evidence` | race (fixed) |
| `react.html?slow=E01&delay=2500&unsafeRace#/evidence` | race (unfixed, live) |
| `http://localhost:3001/api/evidence` | raw backend response |

---

## Demo 1 — Render logic vs. effects

**Have open:** `src/react/sandbox/EffectsLab.tsx` (line 24), browser on `#/sandbox/effects`,
Console.

**Steps**
1. In "Demo 1", read the number, click **Re-render** once → it jumps by **2**. The console shows
   two "render body ran" lines but only one "effect after commit".
2. Show line 24: `rendersCountedDuringRender++;`, a module variable changed during render.
3. Show the correct version below it: the `useEffect` + `useRef` counter.
4. Show the real borderline case: `src/react/shared/state/BookmarksProvider.tsx`, the lazy
   initialiser `useState(() => frozenBookmarks(readStoredBookmarks()))`, which reads localStorage
   once on the first render (explain why it's kept, see Say).

**Say**
- **Rule:** render only *calculates* JSX from props/state. Effects *synchronise with the outside*
  (network, `document.title`, subscriptions, timers). Event handlers do side effects caused by a
  *user action*.
- React may render more often than you think, and **twice in dev with StrictMode**, so a side
  effect in render happens twice (the counter doubles).
- **Derived values are not side effects:** `filterAndSortEvidence` only reads inputs and returns a
  new array, so it belongs in render.
- The localStorage read is an exception: it only happens once for the initial state and is
  idempotent, and doing it in an effect would flash "0 bookmarks" first.

---

## Demo 2 — `useEffect` & dependency arrays

**Have open:** `EffectsLab.tsx` lines 60–85, Console (clear it first), `shared/hooks/useDocumentTitle.ts`.

**Steps**
1. Click **Re-render without changing count** → only "effect with NO array" logs.
2. Click **Change count** → "NO array" **and** "[count]" log. "[]" never logs again.
3. Wait 3 s: "stale interval sees count = 0", even though count is higher. That's an omitted
   dependency (stale closure).
4. Real effect: navigate between views and watch the **browser tab title** change
   ("Evidence Catalogue – Project ReMotion", …). Show `useDocumentTitle.ts`.

**Say**
- React compares each dependency with the previous render using **`Object.is`**. If any changed:
  cleanup + run again.
- Omitting a used value → the effect keeps the old value and doesn't re-run (the lint rule
  `exhaustive-deps` warns; it's disabled only in the lab on purpose).
- `fn()` in the body runs **every render, during render, twice in dev, with no cleanup**.
  `useEffect(fn, [])` runs **after commit, once per mount**, with cleanup on unmount.

---

## Demo 3 — Cleanup

**Have open:** `EffectsLab.tsx` "Demo 3", `HypothesisForm.tsx` lines 56–60,
`BookmarksProvider.tsx` lines 30–39, Console.

**Steps**
1. With **"with cleanup function" ticked**: click **Change speed** twice → console:
   `cleanup: timer #1 stopped`, `timer #2 started`, … The counter grows normally. Click
   **Unmount ticker** → a cleanup log, then nothing more.
2. **Untick** "with cleanup", **Mount**, click **Change speed** a few times → only "started"
   logs, and the counter **speeds up** (old intervals keep running). Unmount: it keeps ticking in
   the console. Reload the page to stop it.
3. Real cleanups in the app:
   - **"Saved" timer:** Workspace → **Save hypothesis draft** → wait 3 s → save again → the
     message stays 4 s after the *second* save (show `clearTimeout` in the cleanup).
   - **Storage listener:** open `react.html#/dashboard` in a **second tab**, bookmark something in
     the first tab → the second tab's count updates without a reload (show `removeEventListener`).

**Say**
- **React** calls the cleanup: (1) before re-running the effect because dependencies changed,
  (2) on unmount, (3) in dev StrictMode right after the first mount.
- Concrete bug without cleanup: the first save's timer would hide the **second** "Saved"
  message after 1 s. Without `abort()`, an old detail request overwrites the new one (Demo 7).

---

## Demo 4 — The read-only Node backend

**Have open:** `server/index.mjs`, `vite.config.ts` (`server.proxy`), README section
"Development backend", terminal with `npm run api`.

**Steps**
1. Open `http://localhost:3001/api/evidence` in the browser → the same JSON as
   `public/data/evidence.json`. Also `/api/evidence/E05` and `/api/evidence/E99` (404).
2. Show the controls on the API directly:
   `http://localhost:3001/api/people?delay=2000` (slow), `…/api/people?fail=500`,
   `…/api/evidence?empty=1`.
3. Point at the **request log** in the API terminal (method, URL, status, ms).
4. Show `vite.config.ts` → `proxy: { "/api": "http://localhost:3001" }` and the README section
   (dev-only, not deployed).

**Say**
- Without delay/error controls, local files are **instant and never fail**, so loading, error,
  empty and race code could never be shown or tested.
- **CORS:** 5173 and 3001 are different origins, so direct calls would need
  `Access-Control-Allow-Origin`. **I avoided it with Vite's proxy**: the browser only talks to
  5173.

---

## Demo 5 — Consume the backend

**Have open:** `shared/api/caseApi.ts`, `shared/api/http.ts`, `shared/data/loadCaseData.ts`,
`shared/hooks/useFetch.ts`, Network tab (filter `api`).

**Steps**
1. Reload `react.html#/dashboard` → Network shows `api/case`, `api/people`, `api/locations`,
   `api/evidence`, `api/timeline`. The first batch is **aborted** (StrictMode), the second
   succeeds.
2. Click through all views: everything comes from the backend (the API terminal logs the
   requests). Open an evidence item → `api/evidence/E01`.
3. Walk through the code path: `AppLayout` → `useCaseData` → `useFetch` (effect, line 55) →
   `loadCaseData` → `caseApi` → `http.getJson` → `fetch`.

**Say**
- Order: first render = loading → commit → **effect runs** → requests → responses →
  **`setFinished(...)`** (state update) → re-render with data.
- New state compared to a static import: **status, error, which request the result belongs to,
  retry attempt**, plus an `AbortController` per request.
- Production (GitHub Pages) has no backend, so the same API layer reads `data/*.json` there
  (`DATA_SOURCE`).

---

## Demo 6 — Loading, error and empty states

**Have open:** `shared/components/ErrorState.tsx`, `describeLoadError.ts`, `EvidencePage.tsx`
(`evidence.length === 0`), the two terminals.

**Steps**
1. **Loading:** `react.html?delay=2000#/evidence` → spinner "Loading case file…" for 2 s, then
   content.
2. **Error:** `react.html?fail=500#/evidence` → red panel "Couldn't load the case file / The server
   ran into a problem (HTTP 500)" + **Try again**.
3. **Error, backend down (live):** remove `?fail=500`, press **Ctrl+C in the `npm run api`
   terminal**, reload → "The server could not be reached (HTTP 502). Is the backend running
   (npm run api)?" → run `npm run api` again → click **Try again** → content.
4. **Empty:** `react.html?empty=1#/evidence` → dashed box "The case file doesn't contain any
   evidence yet…". Compare: normal page + search "zzzz" → "No evidence matches the current
   filters".
5. Show the state type in `useFetch.ts`: `FetchState = loading | error | success`.

**Say**
- One union value, derived from the last finished request + key/attempt. **Empty = success with
  0 items**, decided by the view.
- Vanilla's stuck spinner needed a separate "hide" step that the error path skipped. In React the
  spinner shows **iff** status is loading, and both `.then` and `.catch` set a result, all in one
  hook.
- Found while testing: Vite's proxy answers **502** when the backend is down, so 502/504 are
  treated as "unreachable".

---

## Demo 7 — Request races & cancellation

**Have open:** `useFetch.ts` lines 55–72, Network tab, the API terminal.

**Steps**
1. **Unfixed (live):** open `react.html?slow=E01&delay=2500&unsafeRace#/evidence`. Click
   **"Morning calibration failure report"** (E01), then quickly **"Robot diagnostic log"** (E02).
   E02 shows. **After ~2.5 s the detail switches to E01**, while the URL says
   `#/evidence/E02` and the E02 card is highlighted.
   (Alternative without the switch: `git checkout <race commit> -- src/react/features/evidence/EvidenceDetailRoute.tsx`,
   then `git checkout HEAD -- …` afterwards. Note that the current file uses the hook, so the
   `?unsafeRace` switch is the easier way.)
2. **Fixed:** same steps with `react.html?slow=E01&delay=2500#/evidence` → E02 stays. Network shows
   **`api/evidence/E01` (canceled)** the moment you click E02.
3. Show `useFetch.ts`: `new AbortController()` (line 56), `signal` passed to the load function,
   `return () => controller.abort()` (line 70), and the aborted check in `.catch`.
4. Optional: `git show <hash of "EX6 DEMO 7: Cancel outdated…">` to show the diff of the fix.

**Say**
- Sequence: request E01 (slow) → request E02 (fast) → E02 answers → E01 answers **last** → its
  `setState` overwrites E02. The last *response* wins, not the last *request*.
- The **cleanup** (called by React when the id changes) is *when*. **`abort()`** inside it is
  *what*: it cancels the HTTP request and rejects the promise, so it never sets state. Results
  also carry their key as a second safety net.
- Bonus: StrictMode's duplicate requests are aborted too, which made loading faster.

---

## Demo 8 — Custom hook

**Have open:** `shared/hooks/useFetch.ts`, `shared/data/useCaseData.ts`,
`features/evidence/useEvidenceItem.ts`, `features/evidence/EvidenceDetailRoute.tsx`, `app/layout/AppLayout.tsx`.

**Steps**
1. Show `useFetch(key, load)` → `{ state, retry }`.
2. Show the two users: `useCaseData()` (in `AppLayout`) and `useEvidenceItem(id, people)` (in
   `EvidenceDetailRoute`).
3. Show what each call site does differently with the states: `AppLayout` (full-page spinner,
   error panel for the whole app) vs `EvidenceDetailRoute` (small loading panel, **404 → "Evidence
   not found"**, merging review edits).
4. Optional: break a hook rule. Put `useEvidenceItem(...)` inside an `if` → ESLint error
   "React Hook … is called conditionally". Undo.

**Say**
- A custom hook = a `use…` function that **calls other hooks**, so each component gets its own
  state and effect. A helper without hooks is just a function.
- **Rules of Hooks:** only at the top level of components or custom hooks (no conditions, loops,
  nested functions or early returns before them), same order every render.
- Shared: abort/cleanup, state union, stale-result check, retry. Specific: what to load + how to
  transform, the key, and how each state is displayed.

---

## Demo 9 — Layers

**Have open:** `docs/ARCHITECTURE.md` ("Data access: three layers"), `eslint.config.js`, terminal.

**Steps**
1. Show the three layers in the ARCHITECTURE table and the folders `shared/api/`,
   `shared/hooks/` (+ `useCaseData`, `useEvidenceItem`), components.
2. Terminal: `grep -rn "fetch(" src/react` → only `src/react/shared/api/http.ts`.
3. Show the ESLint rule (`no-restricted-globals` for `fetch` in `src/react` except `shared/api`).
   Optional: add `fetch("x")` in a component → `npm run lint` fails. Undo.

**Say**
- New URLs or response shape → **one file** (`caseApi.ts`), **no component**.
- Against: more files and indirection, overkill for one endpoint. Justified here because of the
  dev/prod data-source switch, simulation params, and cancellation that are all written once.

---

## Demo 10 — Data-flow wrap-up & UX decision

**Have open:** `docs/data-flow.md` on GitHub (the Mermaid diagram renders) or in VS Code.

**Steps**
1. Walk through the diagram: `evidence.json` → Express `GET /api/evidence/E05` → Vite proxy →
   `http.getJson` → `caseApi.getEvidenceItem` → `useEvidenceItem` (normalise) → `useFetch`
   (state, abort) → `EvidenceDetailRoute` (states, review edits) → `EvidenceDetail` → screen.
   Click E05 live while pointing at each step (Network tab + API terminal log).
2. Show the "What breaks if a step silently stops" table. Use the **normalise** example: E04
   would silently show **no related people** (open E04 to show that Nova Byte *is* listed now).
3. Present the **UX decision** (error panel wording + retry; three distinct visual states) and
   the **"with more time"** points: per-view loading instead of all-or-nothing `Promise.all`
   (show `?fail=500&failOnly=timeline` breaking the Evidence view too), and keeping the previous
   detail visible while the next loads.

**Say**
- Moving to a real server forced: loading/error/empty states, retry, cancellation and result
  matching, error classification, a data-source switch, and an API layer.
- **It was all needed conceptually before:** static fetches were already async and could fail
  (the vanilla stuck spinner), and the vanilla search already guarded a race with
  `latestSearchRequestId`. The backend just made these problems **visible and testable**.

---

## Quick checklist on the day

- [ ] `npm ci` done after the last pull; `npm run api` and `npm run dev` running in two terminals
- [ ] DevTools Network filter `api`, Console open
- [ ] Commit hashes noted (`git log --oneline`)
- [ ] After Demo 6, the backend is **running again**
- [ ] Undo every live edit (hook in an `if`, `fetch` in a component) before committing anything
