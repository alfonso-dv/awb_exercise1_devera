# Exercise 4 — Step-by-step demo guide

A presentation script for all 10 demos. For each demo: **have open**, **steps** (do them in
order) and **say** (key talking points). The full written answers are in
`CHANGES/CHANGES_EXERCISE_4.md`, and the folder structure and routes are in `docs/ARCHITECTURE.md`.

---

## 0. One-time preparation (before class)

1. In VS Code, open a terminal (use **Command Prompt** if PowerShell blocks scripts) and run:
   ```
   git pull
   npm ci
   npm run dev
   ```
   **Don't use Live Server.**
2. Open these tabs:
   - React app: `http://localhost:5173/react.html`
   - Vanilla app: `http://localhost:5173/index.html`
3. Install **React Developer Tools** (Chrome/Edge extension) if you haven't already.
4. Run `git log --oneline` and note the hashes of the `EX4 DEMO …` commits.
5. Have these files ready in VS Code tabs:
   - `src/react/app/App.tsx`
   - `src/react/shared/components/Panel.tsx`, `Badge.tsx`, `BulletList.tsx`
   - `src/react/features/team/components/PersonCard.tsx`, `src/react/features/team/PeopleTab.tsx`
   - `src/react/features/team/TeamLayout.tsx`, `PersonDetailPage.tsx`
   - `src/react/features/timeline/TimelinePage.tsx`,
     `components/TimelineEventItem.tsx`, `components/CertaintyBadge.tsx`
   - `src/react/sandbox/KeyIdentityDemo.tsx`
   - `docs/ARCHITECTURE.md`

Useful URLs (all on `http://localhost:5173/react.html`):

| URL | Shows |
|---|---|
| `#/team/people` | People tab |
| `#/team/locations` | Locations tab |
| `#/team/people/nova-byte` | Nova Byte's page (route param) |
| `#/team/people/not-a-person` | "Person not found" |
| `#/timeline?person=nova-byte` | Timeline pre-filtered (query param) |
| `#/timeline?order=desc&location=L04` | Newest first, only L04 |
| `#/timeline?person=signal-scholar&type=incident` | Empty state |
| `#/timeline?person=bogus` | "Ignored unknown filter value" banner |
| `#/sandbox/keys` | key={index} demo |
| `#/nonsense` | "Page not found" |

---

## Demo 1 — JSX, typed props, composition & children

**Have open:** `PersonCard.tsx`, `Panel.tsx`, `PeopleTab.tsx`, React tab on `#/team/people`.

**Steps**
1. Show 3+ components with typed props: `PersonCard` (`PersonCardProps`), `LocationCard`,
   `TimelineEventItem`. Point at each `interface …Props`.
2. **JSX expression:** `PersonCard.tsx` line 45:
   `{evidenceCount} related evidence item{evidenceCount === 1 ? "" : "s"}`, and line 28:
   ``alt={`Portrait of ${person.name}`}``.
3. **Live type error:** in `PeopleTab.tsx` change
   `evidenceCount={evidenceCounts.get(person.id) ?? 0}` to `evidenceCount="5"` and save. The
   terminal and browser overlay show
   **`Type 'string' is not assignable to type 'number'`**. Undo.
   Optional second one: change `person={person}` to `person={locations[0]}` (also add `locations`
   to the destructuring), which gives
   `Type 'CaseLocation' is missing the following properties from type 'Person'…`. Undo.
4. **children:** open `Panel.tsx` (`children: ReactNode`, line 19 `{children}`). Show it used with
   different content: `features/dashboard/components/ReviewProgress.tsx` (progress bar) and
   `features/team/PersonDetailPage.tsx` ("Background" text, timeline list). In the browser, open
   `#/team/people/nova-byte` to show the panels.

**Say**
- `{…}` takes **expressions** (values, calls, ternaries, `.map`), not **statements** (`if`, `for`,
  `const`). Objects can't be rendered, and `null`/`false` render nothing.
- Typed props catch wrong data at compile time, before the browser.
- Named props pass **data** the component knows how to show. `children` passes **ready-made UI**
  the component only frames. `Panel` wraps completely different content in each place, so
  `children` keeps it generic.
- **DOM ownership:** React assumes it owns the DOM under `#root` and only applies differences to
  its own last picture. `innerHTML`/`classList` behind its back get overwritten or cause
  errors/mismatches.

---

## Demo 2 — Conditional rendering

**Have open:** `TimelineEventList.tsx`, `TimelineEventItem.tsx`, `CertaintyBadge.tsx`,
`BulletList.tsx`, `TeamLayout.tsx`.

**Steps**
1. **Empty state (early return):** open `#/timeline?person=signal-scholar&type=incident` → "No
   timeline events match the current filters." Show the `if (events.length === 0) return …` in
   `TimelineEventList.tsx`.
2. **State-dependent style (ternary):** click the People/Locations tabs. In `TeamLayout.tsx`
   line 5: `isActive ? "tab-btn active" : "tab-btn"`.
3. **Variant (lookup table):** on `#/timeline`, the certainty badges have different colours. In
   `CertaintyBadge.tsx` line 5 is the `CERTAINTY_VARIANT` table.
4. **`&&`:** `TimelineEventItem.tsx` line 29 `{locations.length > 0 && (…)}`.
5. **`null`:** `BulletList.tsx` line 9 `if (items.length === 0) return null;`.
6. Not found (early return): `#/team/people/not-a-person`.

**Say**
- Early return when the whole output changes; ternary for either/or; `&&` for "this or
  nothing"; lookup table for value → variant (TypeScript checks every certainty is covered).
- **The `0` trap:** `{locations.length && …}` would render a **"0"** when the list is empty. I
  always write `length > 0`, so it doesn't apply to my code.
- `null` renders **nothing**. An empty `<div>`/`<ul>` is still an element that takes space and
  margins and is announced by screen readers. That's why I used `null` in `BulletList`.

---

## Demo 3 — Rendering collections

**Have open:** `PeopleTab.tsx`, `LocationsTab.tsx`, `TimelineEventList.tsx`.

**Steps**
1. Show the three `.map(...)` calls with `key`: `PeopleTab.tsx` line 22 `key={person.id}`,
   `LocationsTab.tsx` line 16 `key={location.id}`, `TimelineEventList.tsx` line 26
   `key={event.id}`.
2. Show the three lists in the browser: `#/team/people`, `#/team/locations`, `#/timeline`.
3. Optional: React DevTools → Components → select a `PersonCard`. The key is shown next to its
   name.

**Say**
- React uses `key` to **match each item to the same item in the previous render**: keep and move
  it (with its DOM and state), create new ones, and remove the ones that are gone. It's the item's
  identity among its siblings, not a prop.

---

## Demo 4 — Stable keys and list identity

**Have open:** `KeyIdentityDemo.tsx` (line 90 is the `key`), browser on `#/sandbox/keys`.

**Steps**
1. Open `react.html#/sandbox/keys` ("Currently using: key={index} ❌").
2. Type **"suspect!"** into **Nova Byte's** input.
3. Click **Reverse order**. The text is now next to **Patch Vector** ❌.
4. Click **Original order**, then try **Remove first person**. Again the text jumps to Patch
   Vector.
5. Click **Switch to id keys (and reset)**, type "suspect!" into Nova's field again, and click
   **Reverse order**. The text stays with **Nova Byte** ✅.
6. Open the Console: **no warning** about index keys.
7. Show line 90: `key={keyMode === "index" ? index : person.id}`.

**Say**
- With index keys the key means "position 2", not "Nova". After reordering or filtering, React
  reuses the row at position 2 (with its DOM and input text) for someone else.
- Missing keys → falls back to index plus a warning. Duplicate keys → warning plus unpredictable
  rows.
- **Vanilla bug:** the original notes list used `noteText-<index>` as an id. Ported as
  `key={index}`, the user would see **nothing wrong and get no warning**, because the rows only
  show text from props. It becomes visible as soon as a row has its own state (an input, a
  toggle), like in this demo.
- Index keys are fine only for **static** lists with **no ids** and **no row state**.

---

## Demo 5 — Presentational vs. feature components

**Have open:** the classification table in `CHANGES_EXERCISE_4.md` (Demo 5), terminal.

**Steps**
1. Show the classification table and state the rule (below).
2. Show the split:
   ```
   git show <hash of "EX4 DEMO 5"> -- src/react/features/team
   ```
   Before: `PersonCard` took `allEvidence` and counted itself. After: it takes `evidenceCount`.
   The counting lives in `teamStats.ts` (`countEvidenceByPerson`), and `PeopleTab` connects them.
3. Show that the card is reused unchanged on `#/team/people/nova-byte`.

**Say**
- `PersonCard` = **how a person looks**; `countEvidenceByPerson` = **what counts as related
  evidence**. They only share "a number", so changing one doesn't affect the other.
- **Rule:** if it needs to know *where data comes from* (data hooks, `useParams`,
  `useSearchParams`) or *derives* from raw collections → **feature**. If it only turns
  ready-to-show props into JSX → **presentational**.

---

## Demo 6 — Feature-oriented folder structure

**Have open:** `docs/ARCHITECTURE.md`, the VS Code file explorer on `src/react/`.

**Steps**
1. Expand `src/react/`: `app/`, `features/dashboard|team|timeline/`, `shared/`, `sandbox/`.
2. Show the commit that moved the Exercise 3 code:
   `git show <hash of "EX4 DEMO 6"> --stat` (renames only).
3. Show `docs/ARCHITECTURE.md`: the tree, the **shared vs. feature-local rule**, the routes table.

**Say**
- By type = all components/hooks/pages together. By feature = everything for one part of the
  app together. This app *is* separate views migrated one per exercise, so each exercise adds a
  folder instead of touching four.
- **Rule:** a component starts in its feature and moves to `shared/` only when a second feature
  uses it and it has no feature-specific knowledge.
  - Local: `features/team/components/PersonCard.tsx`.
  - Shared: `shared/components/Badge.tsx` (used by Dashboard and Timeline).

---

## Demo 7 — Reusable UI elements

**Have open:** `Badge.tsx`, `CaseSummaryCard.tsx`, `StatusBadge.tsx`, `CertaintyBadge.tsx`.

**Steps**
1. Show `Badge.tsx`: props `variant` (union type) + `children`.
2. Show the 3 uses and point them out in the browser:
   - `CaseSummaryCard.tsx` line 13 → the **OPEN** badge on the Dashboard;
   - `StatusBadge.tsx` line 17 → the **UNREVIEWED** badges in "Recent evidence";
   - `CertaintyBadge.tsx` line 17 → **CONFIRMED / REPORTED / CONTRADICTORY** on `#/timeline`.
3. Type error: write `<Badge variant="flaged">` → TypeScript error. Undo.
4. Compare with vanilla: `git show 22cb2d8:app.js | grep -n 'class="badge'` shows the same span
   written out in several functions, with two different class helpers.
5. Bonus: `Panel` (Dashboard + detail pages) and `BulletList` (responsibilities + "Contains").

**Say**
- **Varies:** colour (`variant`) and text (`children`). **Fixed:** element, base class, how the
  class is built. Domain mapping (status → colour) stays in small wrappers, not in `Badge`.
- vs. copy-paste: one source of truth, typed contract, auto-escaping, readable and composable.

---

## Demo 8 — Routing: real routes

**Have open:** `App.tsx`, `TeamLayout.tsx`, `NavBar.tsx`, React tab.

**Steps**
1. Show `npm ls react-router` (or `package.json`) and `App.tsx`: `HashRouter`, the layout route
   `AppLayout`, child routes, `path="*"`.
2. Click through the nav: the URL changes to `#/dashboard`, `#/team/people`, `#/timeline`.
3. **Tabs as routes:** click Locations → URL `#/team/locations`. Press **Back** → People.
   **Reload** on Locations → still Locations. Copy the URL into a new tab → opens on Locations.
4. Compare with vanilla: in `index.html#people`, click Locations. The URL doesn't change, and a
   reload goes back to People.
5. **Unknown URL:** `react.html#/nonsense` → "Page not found" with the path; vanilla
   `index.html#nonsense` → silently shows the Dashboard.
6. Bonus: vanilla opened directly at `index.html#people` (reload it) shows **0 related evidence
   items** for everyone (a bug). React `#/team/people` shows the correct counts.

**Say**
- React Router: the standard, with nested and layout routes, `NavLink`, params and search params.
  `HashRouter` because GitHub Pages only serves real files, and the `#` part never reaches the
  server, so every route survives a reload.
- User gains: **bookmark, share, reload, Back button, open in new tab** for each tab.
- Catch-all route = explicit "not found". Vanilla silently fell back to the Dashboard.

---

## Demo 9 — Route parameters

**Have open:** `PersonDetailPage.tsx`, `PersonCard.tsx`, `TimelineEventItem.tsx`.

**Steps**
1. On `#/team/people`, click **"View profile and timeline →"** on Nova Byte → URL
   `#/team/people/nova-byte`, showing her card, background and timeline events.
2. On `#/timeline`, click a **person name** or a **location** link inside an event → the detail
   page.
3. Show `PersonDetailPage.tsx`: line 13
   `const { personId } = useParams<{ personId: string }>();` (hover in VS Code to see
   `string | undefined`), line 16 the lookup, line 18 the not-found early return.
4. Open `#/team/people/not-a-person` → "Person not found".

**Say**
- `useParams` gives **strings that may be `undefined`**, and any value can be typed in the URL.
  So I look it up in the real data and handle "not found". Links use `encodeURIComponent`.
- **Route param vs query param:** `/team/people/nova-byte` *is* Nova's page (identity, required).
  `?person=nova-byte` is an optional **filter** on a page that works without it (the timeline).

---

## Demo 10 — Query parameters + wrap-up

**Have open:** `TimelinePage.tsx`, `TimelineFiltersBar.tsx`, terminal.

**Steps**
1. Open `#/timeline?person=nova-byte` → 3 events, the person dropdown shows **Nova Byte**, and the
   note says "Showing events involving Nova Byte (from the link)".
2. Change a dropdown → **nothing filters** (expected in this exercise), and the URL doesn't change.
3. From `#/team/people/nova-byte`, click **"Open these events in the Timeline view"**. That's a
   link that uses the query param.
4. Show `TimelinePage.tsx`: line 20 `const [searchParams] = useSearchParams();` (setter never
   used), line 22 `parseTimelineQuery` (validates), line 28 `applyTimelineFilters` (pure).
   `TimelineFiltersBar.tsx`: `defaultValue`, no `onChange`.
5. Show `#/timeline?person=bogus` → the "Ignored unknown filter value" banner.
6. **Final pass**, in the terminal:
   ```
   grep -rnE "innerHTML|createElement|appendChild|classList" src/react
   ```
   No results. All three views are reachable via bookmarkable routes (reload each one).

**Say**
- Reading the URL once is **input**, like props: no `useState`, no setter, no `onChange`. The page
  is still "URL + data → list". Crossing the line = reacting to the user inside the component
  (`onChange` + state, controlled selects, `setSearchParams`).
- To make filters work: **state + controlled components** (`useState`/`useReducer` and
  `onChange`), or better, **the URL as state** via `setSearchParams`. `applyTimelineFilters` is
  already pure and ready.
- **Duplication not extracted yet:** route path strings like `` `/team/people/${id}` `` in 3 places
  (would add `paths.ts`), the per-person filter object in both detail pages, and mini-list rows.
  Not extracted because the routes were still changing; I'd do it before Exercise 5.

---

## Quick checklist on the day

- [ ] `npm run dev` running (not Live Server), React and vanilla tabs open
- [ ] React DevTools installed
- [ ] Commit hashes noted (`git log --oneline`)
- [ ] Undo every live edit (Demo 1 type errors, Demo 7 `flaged`) before committing anything
