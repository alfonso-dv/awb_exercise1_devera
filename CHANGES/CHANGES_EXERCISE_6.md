# Exercise 6 — Change log & answers

Effects, data fetching and a backend. The React app now reads its case data from a small
**read-only Node/Express API** in development, with real loading/error/empty states, request
cancellation (`AbortController`), a reusable `useFetch` hook, and separate API / logic / UI layers.
GitHub Pages still deploys only the static frontend, which reads the static JSON files.

Step-by-step presentation instructions: **`CHANGES/EXERCISE_6_DEMO_GUIDE.md`**.
End-to-end data-flow diagram: **`docs/data-flow.md`**. Layers: **`docs/ARCHITECTURE.md`**.
Backend usage: **README → "Development backend"**.

## Commits (in order)

| Commit message | Demo |
|---|---|
| `EX6 DEMO 1/2/3: Effects lab and first real effects` | 1, 2, 3 |
| `EX6 DEMO 4: Read-only dev backend (Express) with delay/error controls` | 4 |
| `EX6 DEMO 5: Read all case data from the backend` | 5 |
| `EX6 DEMO 6: Explicit loading, error and empty states` | 6 |
| `EX6 DEMO 6: Report 502/504 as 'server could not be reached'` | 6 (fix found while testing) |
| `EX6 DEMO 7: (race on purpose) evidence detail fetched per id, no cancellation` | 7 (before) |
| `EX6 DEMO 7: Cancel outdated detail requests with AbortController` | 7 (after) |
| `EX6 DEMO 8: Extract useFetch, used for case data and evidence detail` | 8 |
| `EX6 DEMO 9: Separate UI, application logic and API access` | 9 |
| `EX6: Notes, data-flow diagram and demo guide` | 10, docs |

## How to run

```
npm ci
npm run dev:all      # API on :3001 + Vite on :5173 (or: npm run api / npm run dev in two terminals)
```

Simulation (add to the page URL **before the `#`**):
- `react.html?delay=2000#/evidence`: slow responses.
- `?fail=500`: every request fails. `?fail=500&failOnly=evidence`: only the evidence requests fail.
- `?empty=1`: list endpoints return empty lists.
- `?slow=E01&delay=2500`: only the E01 detail request is slow.
- `?unsafeRace`: turns cancellation off, to show the race.

## Verification (scripted browser checks)

- Dev: requests go to `/api/case`, `/api/people`, …; simulation params are forwarded. Production
  build: requests go to `/data/*.json` once, and everything works without a backend.
- Loading (`?delay=1500`) → spinner → content. Error (`?fail=500`) → red error panel "The server
  ran into a problem (HTTP 500)" with **Try again** (a new request is sent, and the loading state
  shows in between). Backend stopped → "The server could not be reached. Is the backend running?"
  Empty (`?empty=1`) → dashed "doesn't contain any evidence yet" box, different from "No evidence
  matches the current filters".
- Race: `?slow=E01&delay=2500`, open E01 then E02. Without the fix, E01's content replaces E02
  after 2.5 s. With the fix, E01's request is **aborted** and E02 stays. `?unsafeRace` reproduces
  the bug again.
- Effects: tab title per view. A bookmark made in one tab shows up in another open tab without a
  reload. The "Saved at …" message hides after 4 s, and a second save restarts the timer. In the
  Effects lab, the ticker runs 4× too fast without cleanup.
- All Exercise 3–5 checks still pass, in dev and in the production build. Vanilla app unchanged.

---

# DEMO 1 — Render logic vs. effects

**Deliberate side effect during render:** `src/react/sandbox/EffectsLab.tsx`, route
`#/sandbox/effects`, section "Demo 1". The component body does `rendersCountedDuringRender++`
(a module variable *outside* React) and `console.log`. Clicking **Re-render** once makes the
number jump by **2** in development (measured: 2 → 4), because StrictMode calls the component
function twice. Next to it is the correct version: count committed renders in a `useEffect`
(and a `useRef`).

**A real borderline case in the app:** reading `localStorage` during render. `BookmarksProvider`,
`AppLayout` (notes) and `HypothesisForm` read `localStorage` in a **lazy `useState` initialiser**
(`useState(() => readStoredBookmarks())`). That's a read of the outside world during render. I
kept it deliberately: it only runs for the *initial* state (once per mount; a second call in
StrictMode just reads the same value again, so it's idempotent), and doing it in an effect would
first render "0 bookmarks" and then flash to the real number. Writes to `localStorage` happen only
in event handlers (`toggleBookmark`, save), never during render.

**My rule:**
> **Render** only *calculates*: from props + state to JSX (and derived values). Same inputs, same
> output, nothing outside changes.
> **Effects** are for *synchronising with something outside React* because the component is on
> screen: network requests, `document.title`, subscriptions (`window` events), timers, other DOM
> APIs. Each effect undoes itself in its cleanup.
> **Event handlers** are for side effects caused by *a specific user action* (save, toggle,
> submit). Those don't need an effect at all.

## Answers

**Why can React call render more than once, and what would go wrong with the example?**
Rendering is just "React asks the component what the UI should look like". React may ask more
than once: when a parent re-renders, when state or context changes, and in concurrent rendering it
can start a render, throw it away and start again. In **development with `<StrictMode>`** it calls
every component function **twice on purpose**, exactly to expose impure render code. Since the
result must not depend on how often it ran, render has to be pure.
With my example: the counter is **doubled** (shows 4 after 2 real renders), the log is printed
twice, and if it were a real side effect (sending an analytics event, appending to a list,
`localStorage.setItem` of a counter) it would happen **twice**, or happen for renders that never
reached the screen. It "seems to work" in production (no double render) and in simple cases,
which makes it easy to miss.

**Is computing a derived value (the filtered evidence list) a side effect?**
**No.** `filterAndSortEvidence(evidence, filters)` only *reads* its inputs and *returns* a new
array. It doesn't change the inputs (`filter` creates a new array, and the sort sorts that copy),
nothing outside, and it gives the same result however often it runs. That's why it belongs in
render. The distinction in my rule is **"does it change or depend on something outside the
component's inputs?"**, not "is it expensive" or "does it run often". If the same calculation
wrote its result to `localStorage` or sorted the master array in place, it would become a side
effect and couldn't stay in render.

---

# DEMO 2 — `useEffect` mental model & dependency arrays

**Throwaway examples:** `EffectsLab.tsx`, section "Demo 2" (watch the console):

| Effect | Runs… | Measured |
|---|---|---|
| no array | after **every** render | "Re-render without changing count" → only this one logs |
| `[]` | once after the first render (mount) | in dev: mount → cleanup → mount (StrictMode), then never again |
| `[count]` | after the first render and whenever `count` changes | "Change count" → this one + the no-array one log |
| `[]` but uses `count` (omitted dependency) | once | the interval keeps logging `count = 0` forever: a stale closure |

**Real, justified effect:** `shared/hooks/useDocumentTitle.ts`:
`useEffect(() => { document.title = `${title} – Project ReMotion`; }, [title]);`, used by every
page (Dashboard, Evidence, People & Locations, Timeline, Workspace, Not found). `document.title`
is outside React's JSX, so setting it is a side effect, synchronised with the current view. Other
real effects: the cross-tab `storage` listener (`BookmarksProvider`), the "Saved" timer
(`HypothesisForm`), and data fetching (`useFetch`).

## Answers

**What does React compare in the dependency array, and what if you omit a value?**
After each render React compares every dependency **with the value from the previous render
using `Object.is`**, item by item. If **any** differs, it runs the previous effect's cleanup and
then the effect again. If all are the same, it skips the effect. Only the identity of the values
counts: a new object or array literal created each render counts as "changed" every time, while a
mutated object counts as "unchanged".
If you **omit** a value the effect uses, the effect keeps the version of that value **from the
render in which it last ran** (a stale closure) and doesn't re-run when it changes. In the lab, the
interval with `[]` logs `count = 0` forever even after clicking "Change count" five times. In the
app it would mean e.g. the title not updating when navigating, or (in `useFetch`) the detail not
reloading when the id changes. `eslint-plugin-react-hooks` (`exhaustive-deps`) reports this. I
disabled that rule only in the lab file, on purpose.

**`useEffect(fn, [])` vs calling `fn()` in the body?**
`fn()` in the body runs **during every render** (and twice per render in dev), before React has
updated the DOM, with no way to clean up. If it sets state you get an infinite render loop, and if
it fetches you fire a request on every keystroke elsewhere in the component.
`useEffect(fn, [])` runs **after** the component has been committed to the screen, **once per
mount**, and its returned cleanup runs on unmount. "Run once" is about the component's
*lifetime*, which only React knows; the function body doesn't know whether it's the first render.
(In development StrictMode deliberately mounts, unmounts and mounts again, so `[]` effects run
twice there. A correct cleanup makes that harmless.)

---

# DEMO 3 — Cleanup: timers & subscriptions

**Effects with cleanup:**

- `HypothesisForm.tsx` lines 56–60: `setTimeout` hides "Saved at …" after 4 s;
  `return () => clearTimeout(timer)`.
- `BookmarksProvider.tsx` lines 30–39: `window.addEventListener("storage", …)` keeps bookmarks in
  sync across tabs; `return () => window.removeEventListener(…)`.
- `useFetch.ts` line 70: `return () => controller.abort()` (Demo 7).
- `EffectsLab.tsx` "Demo 3": a ticker with `setInterval` and a **"with cleanup function"** checkbox.

**Demonstration (lab):** console logs `timer #N started` and `cleanup: timer #N stopped`.
- With cleanup: "Change speed" logs *cleanup #1, started #2*, and the counter keeps growing by the
  set speed. "Unmount" logs the cleanup and the counter stops.
- Without cleanup: there are only "started" logs and **no cleanups**. Every speed change adds an
  interval while the old ones keep running. Measured: after 2 speed changes (back to 1/s) the
  counter grew by **8 in 2 s instead of 2**. After unmounting, the intervals keep running (and
  keep calling `setTicks` on a component that's gone).

## Answers

**Who calls the cleanup, and when?**
**React** calls it, never my code. Situations:

1. **Before the effect runs again** because a dependency changed (speed changed → cleanup of the
   old interval, then the new one starts; evidence id changed → abort the old request).
2. **When the component unmounts** (navigating away from the Workspace clears the "Saved" timer;
   "Unmount ticker").
3. **In development with StrictMode**, right after the first mount: React simulates
   unmount + remount to check that the cleanup really undoes the effect. That's why the dev
   network log shows the first batch of `/api/*` requests being aborted.

**A real bug in this app without the cleanup:**

- *"Saved" timer:* save the hypothesis, then save again 3 s later. Without `clearTimeout`, the
  first save's timer fires 1 s after the **second** save and **hides the new "Saved at …"
  message after 1 s instead of 4 s**. The user may think the second save didn't happen.
- *Detail fetch:* without `controller.abort()` in the cleanup, opening E01 then E02 shows **E01's
  content under E02's URL** when the slow response arrives (Demo 7).
- *Storage listener:* without `removeEventListener`, every mount adds another listener (StrictMode
  already mounts twice in dev). Each bookmark change in another tab then triggers several state
  updates, and if the provider were ever remounted (e.g. a logout/login flow), old listeners
  would keep calling `setBookmarks` on a dead component.

---

# DEMO 4 — Read-only Node backend

`server/index.mjs` (Express 5, run with `npm run api`, or `npm run dev:all` for API + Vite):

- `GET /api/case`, `/api/people`, `/api/locations`, `/api/evidence`, `/api/timeline`: the same
  data as `public/data/*.json` (the files are read on every request), plus
  `/api/evidence/:id`, `/api/people/:id` (404 if unknown), `/api/health`. **No write endpoints.**
- **Simulation:** `?delay=ms`, `?fail=<status>` (+ `failOnly=<resource>`), `?empty=1`,
  `?slow=<id>` (delay only that item); env `API_DELAY_MS`, `API_PORT`. Every request is logged with
  status and duration, so request order is visible in the terminal.
- The app forwards these params from the page URL (`react.html?delay=2000#/…`) to every API
  request (`shared/api/http.ts`, `SIMULATION_PARAMS`).
- **Dev-only:** documented in the README. The GitHub Pages workflow is unchanged and builds only
  the frontend. Production builds read `data/*.json` (`DATA_SOURCE = "static"`).

## Answers

**Why delay/error controls instead of the static files?**
Static files served by a local dev server answer in about 1 ms and essentially never fail. So the
loading state is never visible, the error branch never runs, and two requests never overlap. All
that code would be **untested and undemonstrable**: you can't show a spinner that's on screen for
1 ms, an error message that never appears, a retry button, an empty state, or a request race.
With the controls each condition can be produced **on demand and repeatably** (`?delay`, `?fail`,
`?empty`, `?slow`), which is what real networks produce randomly (slow mobile connections, server
errors, empty results, out-of-order responses).

**CORS: did I have to deal with it?**
CORS is the browser rule that a page may only **read responses from its own origin** (scheme +
host + port) unless the other server explicitly allows it with `Access-Control-Allow-Origin`
headers. The Vite app runs on `localhost:5173` and the API on `localhost:3001`, which are different
ports, so different origins. Calling `http://localhost:3001/api/…` directly from the page would
be blocked.
**I didn't need CORS headers** because Vite's dev server **proxies** `/api/*` to port 3001
(`vite.config.ts`, `server.proxy`). The browser only ever talks to `localhost:5173`, a same-origin
request, and the forwarding happens server-to-server where CORS doesn't apply. The alternative
would have been the `cors` middleware on the API, allowing `http://localhost:5173`.

---

# DEMO 5 — Consume the backend from React

- `shared/api/caseApi.ts`: `getCaseInfo`, `getPeople`, `getLocations`, `getEvidenceList`,
  `getTimeline`, `getEvidenceItem` → `http.ts` `getJson("evidence")` → `fetch("api/evidence")`.
- `shared/data/loadCaseData.ts`: requests the 5 resources in parallel through the API layer.
  `useCaseData()` loads them in an effect (since Demo 8 via `useFetch`). **Every view** (Dashboard,
  Evidence, People & Locations, Timeline, Workspace) reads from this data, and the evidence detail
  additionally fetches `GET /api/evidence/:id`.

## Answers

**From mount to data on screen, in order:**

1. `AppLayout` renders the first time and calls `useCaseData()` → `useFetch("case-data", loadCaseData)`.
   There's no result yet, so the state is **`loading`** and the layout renders `<LoadingState />`.
2. React commits that to the DOM and the browser paints the spinner.
3. **Then** React runs the effect (`useFetch.ts` line 55): it creates an `AbortController` and calls
   `loadCaseData(signal)` → 5 `fetch` calls through the API layer → Vite proxy → API.
   (In dev, StrictMode immediately runs the cleanup → `abort()` → the first 5 requests are
   cancelled → the effect runs again and starts 5 new ones.)
4. The responses arrive, `res.json()` parses them, `Promise.all` resolves, and the evidence is
   normalised.
5. The `.then` calls **`setFinished({ key, attempt, status: "success", data })`**. That **state
   update** is what makes React re-render `AppLayout`.
6. On that render `useFetch` returns `success`, `AppLayout` passes the data via
   `<Outlet context>`, and the current page renders the real content.

**What does the component track now that it didn't need before?**
With a static `import data from "./evidence.json"` the data would simply *be there* during the
first render: no state at all. With a network request it needs:

- **a status**: is it loading, did it fail, or did it succeed? (the `FetchState` union);
- **the error** to show a meaningful message;
- **which request the result belongs to** (`key` + `attempt`), so an old or aborted result is
  never shown for a new id;
- **an attempt counter** for retry;
- **an `AbortController` per request** (not state, but effect-scoped) to cancel outdated
  requests.

(Our Exercise 3–5 version already fetched the static files with `fetch` in an effect and had
basic loading/error. Exercise 6 made those states real, visible and complete.)

---

# DEMO 6 — Loading, error and empty states

All three, visually and structurally different:

| State | When | Looks like | Component |
|---|---|---|---|
| **Loading** | request pending | spinner + "Loading case file…" (detail: panel "Loading E05…" + spinner) | `LoadingState` |
| **Error** | request failed | red panel with a red left border, heading "Couldn't load the case file", reason, **Try again** button, `role="alert"` | `ErrorState` + `describeLoadError` |
| **Empty** | succeeded, but no data | dashed grey box: "The case file doesn't contain any evidence yet…" | `EmptyState` |

Wording of errors: HTTP 5xx → "The server ran into a problem (HTTP 500). Please try again."; 404 →
"does not exist"; backend stopped → "The server could not be reached (HTTP 502). Is the backend
running (npm run api)?" (production: "Check your internet connection").
Found while testing: with the backend stopped, the browser doesn't get a network error. **Vite's
proxy answers `502 Bad Gateway`**, so 502/504 are treated as "unreachable", and a real network
failure (`TypeError`) gets the same message.
The Evidence and Timeline views separate **"the case has no evidence/events at all"** (`?empty=1`)
from **"nothing matches the current filters"**. Those are two different messages.

## Answers

**Trigger the error live; what state distinguishes the three?**
Live: `react.html?fail=500#/evidence` → error panel. Then stop the backend (Ctrl+C on
`npm run api`) and click **Try again** → "could not be reached". Start it again and click
**Try again** → content.
State: **one discriminated union** in `useFetch`,
`FetchState<T> = { status: "loading" } | { status: "error"; error } | { status: "success"; data }`,
derived from the last finished request (`finished`, with its `key` and `attempt`). It's
`loading` whenever there's no finished result *for the current key/attempt*. **"Empty" is not a
separate stored state**: it's `status === "success"` **and** the list has length 0, decided by
the view (`if (evidence.length === 0) return <EmptyState>…`), because only the view knows what
"empty" means for it.

**The vanilla stuck-spinner bug: how does React make it harder?**
Vanilla showed the overlay at the start and needed a **separate imperative step to hide it**
(`hideLoadingStep()`, plus a `loadingStepsRemaining` counter). The error path of the core-data
load never reached that step (no `.catch`), so the spinner stayed forever (Exercise 2,
Demo 7). In React there **is no "hide the spinner" step that could be forgotten**: the spinner is
rendered *if and only if* `state.status === "loading"`. Settling the request in **either**
direction (`.then` **or** `.catch`) stores a result, and the very next render shows content or the
error. It's one value, so "loading" and "error" can't both be true or both be false. The logic
lives once in `useFetch`, so a new view can't get it wrong again.
Honestly, React doesn't make it *impossible*: if a hook forgot the `.catch`, the status would stay
`loading`. That's why `useFetch` handles both branches in one place, and aborts are the only
rejection deliberately ignored.

---

# DEMO 7 — Request races & cancellation

**Where:** the evidence detail fetches `GET /api/evidence/:id` whenever the id in the URL changes.
**Reproduce:** `react.html?slow=E01&delay=2500#/evidence` → click the E01 card → within 2.5 s click
the E02 card.

- Commit `EX6 DEMO 7: (race on purpose)` (or `?unsafeRace` in the current code): after 1 s, E02 is
  shown. **After 3.5 s the detail shows E01 ("Morning calibration failure report")** while the URL
  is `#/evidence/E02` and the E02 card is highlighted.
- Commit `EX6 DEMO 7: Cancel outdated detail requests`: the network log shows
  `ABORTED /api/evidence/E01` the moment E02 is opened. E02 stays.

## Answers

**What exact sequence makes the stale result win (without the fix)?**
1. URL → `/evidence/E01`. The effect starts **request A** (E01, slow: 2.5 s).
2. 0.3 s later the user clicks E02. URL → `/evidence/E02`. The effect runs again and starts
   **request B** (E02, fast). Nothing stops A.
3. B answers after ~10 ms → `setResult(E02)` → E02 is shown (correct, for now).
4. A answers at 2.5 s → its `.then` still runs → `setResult(E01)` → **overwrites** E02. The last
   *response* wins, not the last *request*, so the screen shows E01 under E02's URL.

**`AbortController` vs the cleanup: how do they connect?**
They are two parts of one mechanism. The **cleanup** is the *when*: React calls it before the
effect re-runs for a new id (and on unmount). **`controller.abort()`** is the *what*: it's the
thing I do inside the cleanup (`useFetch.ts` line 70). Each effect run creates its own controller
and passes `controller.signal` down through `getEvidenceItem` → `getJson` → `fetch(url, { signal })`.
When the id changes, React calls the cleanup → `abort()` → the browser **cancels the HTTP request**
and the `fetch` promise **rejects** with an `AbortError`. My `.catch` sees `signal.aborted` and
ignores it, so request A **never reaches `setFinished`**. As a second safety net, results remember
their `key` (`evidence/E01`), and a result for a different key renders as loading.
Bonus effect: in development StrictMode's duplicate first request is aborted too, which freed
browser connections. With `?delay=1500` the content now appears after ~2.1 s instead of ~3.4 s,
because before, the 10 parallel requests exceeded the browser's 6 connections per host.

---

# DEMO 8 — Reusable custom hook

`src/react/shared/hooks/useFetch.ts`: `useFetch<T>(key, load)` returns `{ state, retry }`.
It contains the loading/error/success union, the effect with `AbortController` + cleanup, the
key/attempt bookkeeping, retry, and error logging. `useEffectEvent` lets it always call the latest
`load` without re-running the effect on every render.

**Used in two places:**

1. `shared/data/useCaseData.ts`: `useFetch("case-data", loadCaseData)`, used by `AppLayout`
   (whole app).
2. `features/evidence/useEvidenceItem.ts`:
   `useFetch(`evidence/${id}`, async (signal) => normalizeEvidence(await getEvidenceItem(id, signal), people))`,
   used by `EvidenceDetailRoute`.

## Answers

**What makes it a legitimate custom hook? Rules?**
A custom hook is a function whose name starts with **`use`** and that **calls other hooks**
(`useState`, `useEffect`, `useEffectEvent`). Calling hooks is what a plain helper can't do:
each component that uses `useFetch` gets **its own** state and effect, tied to its lifetime. A
helper without hooks (like `describeLoadError` or `filterAndSortEvidence`) is just a function and
should *not* be named `use…`.
Rules of Hooks (enforced by `eslint-plugin-react-hooks`, `rules-of-hooks`):

- call hooks **only at the top level** of a function component or another custom hook: not inside
  conditions, loops, nested functions, event handlers, or after an early `return`;
- call them **in the same order on every render**. React identifies each hook's state by its call
  position.
- don't call them from regular functions or class components.

That's why `EvidencePage` calls `useReducer` *before* its `if (evidence.length === 0) return …`.

**What did extracting save, and what stayed specific?**
Shared, written once: the `AbortController` + cleanup, the `.then`/`.catch` handling that ignores
aborts, the three-state union, the "result belongs to key + attempt" check that prevents stale
results, the retry counter, and error logging. Without the hook, the detail route had its own
~20-line copy of half of that (commit `EX6 DEMO 7`), and the case-data hook a slightly different
copy without abort.
Specific to each call site:

- **what** is loaded and **how it's transformed**: `Promise.all` of 5 resources + normalisation,
  vs one item + normalisation with the current people list;
- **the key**: a constant `"case-data"` vs `evidence/<id>`, which changes with the route;
- **how each state is shown**: `AppLayout` shows a full-page spinner, an error panel that blocks
  the whole app, and the outlet. The detail shows a small loading panel, a **404 → "Evidence not
  found"** special case, and the detail view merged with the review edits (`withReviewEdits`).

---

# DEMO 9 — Separate UI, application logic and API access

| Layer | Files | Responsibility |
|---|---|---|
| API access | `shared/api/http.ts`, `shared/api/caseApi.ts` | URLs, `fetch`, static fallback, `ApiError`, forwarding simulation params |
| Application logic | `shared/hooks/useFetch.ts`, `shared/data/useCaseData.ts`, `shared/data/loadCaseData.ts`, `features/evidence/useEvidenceItem.ts` | loading/error/success, cancellation, retry, raw → app model |
| UI | components | render the states; no `fetch` |

`grep -rn "fetch(" src/react` → only `shared/api/http.ts`. This is **enforced**: an ESLint rule
(`no-restricted-globals`) makes `fetch` an error anywhere in `src/react` outside `shared/api/`.
In commit `EX6 DEMO 9` the normalisation moved from `EvidenceDetailRoute` into `useEvidenceItem`,
and the user-facing error wording moved from `shared/api` to `shared/components/describeLoadError.ts`.

## Answers

**If the endpoint URLs or response shape changed tomorrow, how many files?**
- **URLs** (e.g. `/api/evidence` → `/api/v2/items`): **one file**, `shared/api/caseApi.ts` (or
  `http.ts` if the base path changes). No hook, no component.
- **Response shape** (e.g. `{ items: [...] }` instead of a bare array, or renamed fields): the
  API layer (`caseApi.ts`) maps it back to the existing `RawEvidence`/`Person` types, so again
  **one file**. If the *domain model* itself changed (a new field the UI should show), then
  `types.ts` changes and the components that display that field. That's a feature change, not an
  API change.
- **No component needs to change** for a pure URL/shape change.

**The argument against this separation for a small app?**
More files and indirection: to understand "where does the detail data come from" you follow
`EvidenceDetailRoute → useEvidenceItem → useFetch → caseApi → http`, five files for what could
be one `useEffect` with a `fetch`. With one or two endpoints and one developer, that's overkill:
YAGNI. Abstractions made too early often have the wrong shape, and wrappers like
`useEvidenceItem` are thin.
**I think it's justified here** because there are concrete reasons beyond "best practice": two
data sources (API in dev, static files in production) chosen in **one** place; simulation params
added in **one** place; cancellation and stale-result protection written **once** and reused;
and the ESLint rule keeps it that way. Without the layering, each of those would be repeated or
forgotten in some component. I'd skip the thin per-resource hooks (`useEvidenceItem`) if there
were only one caller.

---

# DEMO 10 — Data-flow wrap-up & UX decision

**Diagram:** `docs/data-flow.md` (Mermaid sequence diagram, renders on GitHub): `evidence.json` →
`GET /api/evidence/E05` (Express) → Vite proxy → `http.getJson` → `caseApi.getEvidenceItem` →
`useEvidenceItem` (normalise) → `useFetch` (state, abort) → `EvidenceDetailRoute` (states, review
edits) → `EvidenceDetail` → screen. It includes a table of "what breaks if this step silently
stops".

**UX decision: the error state.** Errors are a **red panel that says what failed and why in plain
words, with a single "Try again" button**, and the reason depends on the failure: server error
(5xx, "try again"), not found (404 has its own "Evidence not found" panel with a Close link), or no
connection, which in development explicitly says *"Is the backend running (npm run api)?"*.
Reasoning: an investigator can't do anything with "Error" or a stack trace. They need to know
whether to wait, retry, or (as a developer) start the server, and retry is the only action that
can help. The three states look different on purpose (spinner, red panel, dashed grey box), so
"empty" is never mistaken for "broken" and an error never looks like "no data".
**With more time:** the whole app currently fails if **any** of the 5 resources fails
(`Promise.all`). E.g. `?fail=500&failOnly=timeline` blocks the Evidence view too. I'd load per
view/resource so the rest stays usable, and show the error only where the data is missing.
I'd also keep the previous detail visible (dimmed, "Updating…") while the next item loads,
instead of replacing it with a spinner, to avoid the layout jump.

## Answers

**Walk through the diagram; one step that silently stops.**
Walk through the diagram top to bottom (see `docs/data-flow.md`). Example of a silent failure:
if the **`normalizeEvidence` step in `useEvidenceItem`** silently stopped running, nothing would
crash and no error would appear. But for **E04**, whose data stores the person as the *name*
`"Nova Byte"` instead of the id, the detail's **"Related people" would just be empty**, because
the lookup by id finds no one. You'd only notice by opening E04 and knowing Nova should be there
(or with a test for E04), which is exactly why silent transformation steps are dangerous. Compare
a **loud** failure: if the proxy/backend step stopped, the error panel says "server could not be
reached" immediately.

**What did "static files → real server" force me to add, and was it needed before?**
Added: real **loading/error/empty** states with retry; **cancellation** of outdated requests
(`AbortController`) and **result-to-request matching** (key); **error classification**
(HTTP status vs network); a **data-source switch** (API in dev, static in production); handling of
StrictMode's double effects; an **API layer** so all of that lives in one place.
**Conceptually all of it was needed before**, just invisible: fetching `data/*.json` was *already*
asynchronous and *could* fail (offline, wrong path on GitHub Pages, a corrupt file). The vanilla
app's stuck spinner (Exercise 2) was an error-path bug that existed with static files, and
vanilla's search already had a **request race** it guarded with `latestSearchRequestId`, the same
concept as Demo 7's key check, written by hand. The server didn't create these problems; the delay
and error controls made them **visible and testable**.
