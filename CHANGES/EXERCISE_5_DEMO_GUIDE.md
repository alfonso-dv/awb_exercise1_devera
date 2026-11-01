# Exercise 5 — Step-by-step demo guide

A presentation script for all 10 demos. For each demo: **have open**, **steps** and **say**. The
full answers are in `CHANGES/CHANGES_EXERCISE_5.md`, and who owns which state is in
`docs/ARCHITECTURE.md`.

---

## 0. Preparation (before class)

1. Terminal (Command Prompt) in the project folder:
   ```
   git checkout main
   git pull
   npm ci
   npm run dev
   ```
   Run `npm ci` after every pull that changes `package.json`. **Don't use Live Server.**
2. Tabs: React `http://localhost:5173/react.html#/evidence` and vanilla
   `http://localhost:5173/index.html`.
3. **Clear stored data** so you start clean: F12 → Application → Local Storage →
   `http://localhost:5173` → right-click → Clear. Reload.
4. React Developer Tools installed (Components tab).
5. `git log --oneline` → note the hashes of the `EX5 DEMO …` commits, especially both
   **`EX5 DEMO 3`** commits and **`EX5 DEMO 7`**, **`EX5 DEMO 8`** and **`EX5 DEMO 9`**.
6. Files to have open (all under `src/react/`):
   - `features/evidence/EvidencePage.tsx`, `evidenceFilters.ts`
   - `features/evidence/components/EvidenceToolbar.tsx`, `BookmarkButton.tsx`, `EvidenceCard.tsx`,
     `EvidenceDetail.tsx`, `NoteEditor.tsx`
   - `features/workspace/components/HypothesisForm.tsx`, `features/workspace/WorkspacePage.tsx`
   - `shared/state/bookmarks.ts`, `BookmarksProvider.tsx`, `bookmarksContext.ts`
   - `app/layout/AppLayout.tsx`, `features/dashboard/DashboardPage.tsx`

---

## Demo 1 — Event handling

**Have open:** `BookmarkButton.tsx`, `EvidenceCard.tsx`, `NoteEditor.tsx`, `HypothesisForm.tsx`.
In a terminal: `src/render.ts` (vanilla) or `index.html`.

**Steps**
1. In `react.html#/evidence`: click a ☆ (it becomes ★), click a card (the detail opens, URL
   `#/evidence/E01`), type in the search box, write a note and **Save note**.
2. Show the React handlers:
   - `BookmarkButton.tsx` line 33 `onClick={handleClick}`, line 23 `event.stopPropagation()`;
   - `EvidenceCard.tsx` line 23 `onClick={() => onOpen(ev.id)}`;
   - `EvidenceToolbar.tsx` line 45 `onChange={(e) => onSearchChange(e.target.value)}`;
   - `NoteEditor.tsx` line 31 `onClick={() => onSave(draft)}`;
   - `HypothesisForm.tsx` line 77 `<form onSubmit={handleSubmit}>`.
3. Show the vanilla versions for comparison:
   - `grep -n "onclick=\|onchange=" index.html src/render.ts` → inline `onclick="saveCurrentNote()"`,
     `onchange="handleSortChange()"`, `onclick="saveHypothesis()"`;
   - `grep -n "addEventListener" src/render.ts src/events.ts` → `handleEvidenceListClick` delegation
     with `removeEventListener`/`addEventListener`.
4. Show that the React app has none:
   `grep -rn "addEventListener\|onclick=" src/react` → no results.

**Say**
- React: pass a **function** as a prop (`onClick={fn}`). Vanilla: an inline **string** evaluated
  globally (that's why vanilla needed `window.navigateTo = …`), or `addEventListener` after
  `innerHTML`.
- React handlers get a **SyntheticEvent** (same API: `target`, `preventDefault`,
  `stopPropagation`; `nativeEvent` for the real one). Vanilla gets the native DOM event.
- **Delegation by hand isn't needed:** each card has its own `onClick`, React re-binds handlers
  on re-render without duplicates, and React already delegates internally (one listener per event
  type at `#root`).

---

## Demo 2 — `useState` & controlled forms

**Have open:** `EvidenceToolbar.tsx` (line 44–45), `HypothesisForm.tsx`.

**Steps**
1. Type in the search box, then click **Clear filters**. The box empties because its `value`
   comes from state.
2. **Live: break it.** In `EvidenceToolbar.tsx`, delete line 45
   (`onChange={(e) => onSearchChange(e.target.value)}`) and save. Type in the search box:
   **nothing appears**. Console (F12):
   *"You provided a `value` prop to a form field without an `onChange` handler…"*. **Undo** (Ctrl+Z,
   save).
3. Go to `#/workspace`. Fill the whole form: suspect, nature, **Ctrl+click** 2 evidence items,
   drag the confidence slider (the number next to it follows), type both textareas.
4. Click **Save hypothesis draft** → "Saved at …". Press **F5**: every field is restored.
5. Show `HypothesisForm.tsx`: line 45 `useState<DraftFields>(initialDraft)` (one object), line 49
   `updateField`, every input with `value={draft.…}` + `onChange`, line 77 `onSubmit`, line 58
   `preventDefault()`.
6. Optional: React DevTools → Components → `HypothesisForm` → the `draft` state changes as you type.

**Say**
- Controlled = React state is the source of truth (`value` + `onChange`). Uncontrolled = the DOM
  keeps the value (`defaultValue`).
- Without `onChange`: the keypress changes the DOM, but state stays `""`, so React re-renders and
  puts `""` back. The UI shows state.
- **One object** for the hypothesis form: it's loaded and saved as one unit, and every change is
  "set one field". (Demo 7 explains why filters are different.)

---

## Demo 3 — Immutable updates

**Have open:** `shared/state/bookmarks.ts`, terminal.

**Steps**
1. Show the broken version:
   `git show <hash of "EX5 DEMO 3: (broken on purpose)"> -- src/react/shared/state/bookmarks.ts`.
   Point at `list.push(id)` / `list.splice(...)` and the `as EvidenceId[]` cast.
2. *Optional live:* `git checkout <that hash> -- src/react/shared/state/bookmarks.ts`, save, reload
   `#/evidence`. Click a ☆ → **nothing happens**. Type a letter in the search box → now the ★
   appears. Restore with `git checkout HEAD -- src/react/shared/state/bookmarks.ts`.
3. Show the fixed version (`bookmarks.ts` lines 15–18): `filter` / `[...bookmarks, id]` +
   `Object.freeze`.
4. Show the frozen guard in the browser console:
   `Object.freeze(["E01"]).push("E02")` → `TypeError: Cannot add property 1, object is not
   extensible`.
5. Show the sort: `evidenceFilters.ts` line 93 `evidence.filter(...)` (new array) and lines 113–119
   `matching.sort(...)` (sorts the copy).

**Say**
- React compares old and new state with **`Object.is`** (reference). A mutated array is the same
  reference, so **no re-render**. It "works" only when something else happens to re-render, and
  memo/effects/other holders break.
- Vanilla bug: `filteredEvidence = allEvidence`, then `.sort()` reordered the master list. React:
  `filter()` always returns a **new** array, I sort that copy, the master list is `readonly` and
  only read, and the result isn't stored, so there's no alias.

---

## Demo 4 — Derived values vs stored state

**Have open:** `EvidencePage.tsx` line 30, `DashboardPage.tsx`, `WorkspacePage.tsx`.

**Steps**
1. Show `EvidencePage.tsx` line 30: `const visible = filterAndSortEvidence(evidence, filters);`,
   computed every render, with no `filteredEvidence` state.
2. Show `DashboardPage.tsx` lines 15/19: `useBookmarks()` → `computeDashboardStats(data, bookmarks)`.
3. Show `WorkspacePage.tsx`: `data.evidence.filter((ev) => bookmarks.includes(ev.id))`.
4. Live: bookmark 2 items in Evidence → **Dashboard: 2 Bookmarked**, **Workspace** lists both.
   Remove one in the Workspace → back in Evidence its star is empty again.
5. Contrast vanilla (`index.html`): bookmark 2 items, go to Dashboard → still **0** (stale).

**Say**
- **Rule:** store only what can't be calculated (user input, loaded data). Compute everything else
  during render (`useMemo` only if measurably slow). The filtered list is fully determined by
  evidence + filters, so it's derived.
- Both vanilla bugs are **impossible**: no cached count can go stale (it's computed on every
  render), and no stored `filteredEvidence` can alias the master list (each render creates a new
  array).

---

## Demo 5 — Lifting state up

**Have open:** `app/layout/AppLayout.tsx`, `shared/state/BookmarksProvider.tsx`, `docs/ARCHITECTURE.md`
("State: who owns what").

**Steps**
1. Show the route tree (`app/App.tsx`): Dashboard, Evidence and Workspace are all children of
   `AppLayout`, their **lowest common ancestor**.
2. Show where the bookmark `useState` lives: `BookmarksProvider.tsx` line 19, rendered by
   `AppLayout.tsx` line 78. Optionally show the first version, where it was directly in
   `AppLayout`: `git show <hash of "EX5 DEMO 1/2/4/5/6"> -- src/react/app/layout/AppLayout.tsx`.
3. Live: bookmark in Evidence → open the Dashboard → the count is correct immediately.

**Say**
- Lifting = **move the `useState` to the nearest parent of all users**, pass the **value down**
  and a **callback that calls the setter down**.
- Before: vanilla had a global `state.bookmarks` + an `ev.bookmarked` flag + cached HTML; my early
  React Dashboard read a `data.bookmarks` snapshot (Demo 9).
- With 3 separate `useState`s: three copies out of sync, and **lost updates**, since each writes
  its whole array to localStorage and the last writer wins.

---

## Demo 6 — Passing callbacks downward

**Have open:** `AppLayout.tsx` (`handleSaveNote`, `handleReviewChange`),
`features/evidence/EvidenceDetailRoute.tsx`, `EvidenceDetail.tsx`, `NoteEditor.tsx`.

**Steps**
1. Trace **save note** live: `AppLayout.handleSaveNote` (`setNotes`) → outlet context
   `onSaveNote` → `EvidenceDetailRoute` (`onSaveNote={(text) => onSaveNote(ev.id, text)}`) →
   `EvidenceDetail` → `NoteEditor` `onSave` → button `onClick`.
2. Trace **review status** the same way: `handleReviewChange` → … → `<select onChange>`. Change it
   to *Reviewed* in the UI → the card badge and Dashboard "Reviewed" count update.
3. Show the **bookmark** chain before Context:
   `git show <hash of "EX5 DEMO 7">:src/react/features/evidence/components/EvidenceList.tsx` →
   `bookmarks` + `onToggleBookmark` props just passed through (also `EvidenceCard.tsx`).

**Say**
- A child **can't** change another component's state (only the owner has the setter) and
  **shouldn't** (no one would know who changed what, and React wouldn't re-render). The callback
  keeps data flowing down and requests flowing up, with the rules in one place.
- The bookmark callback passed **5 components (1 outlet + 3 prop hops)**. `EvidencePage`,
  `EvidenceList` and `EvidenceCard` only forwarded it: manageable, but close to my threshold.

---

## Demo 7 — `useReducer` for filters

**Have open:** `evidenceFilters.ts` (lines 30–64), `EvidencePage.tsx` line 27, terminal.

**Steps**
1. Show the before: `git show <hash of "EX5 DEMO 7">` → the 7 `useState`s, the `if` ladder, and the
   7-setter `handleClear` were removed.
2. Show `FilterAction` (4 actions) and `filtersReducer`. Point at `CLEAR_FILTERS` →
   `return INITIAL_FILTERS;`.
3. Live: set search + person + status + sort, then **Clear filters** → all reset at once.
4. Optional: React DevTools → `EvidencePage` → the reducer state object changes with each action.

**Say**
- 7 related values, changed together, with a "reset all" rule → one reducer: all rules in one pure,
  testable function, and the component only dispatches *what happened*.
- `CLEAR_FILTERS` = one return value, one update, can't half-reset, and new fields are included
  automatically.
- `useState` **is a special case** of `useReducer` (the action *is* the next state). Same
  machinery, same `Object.is` check. The difference is where the update logic lives.

---

## Demo 8 — Context

**Have open:** `bookmarksContext.ts`, `BookmarksProvider.tsx`, `BookmarkButton.tsx`, terminal.

**Steps**
1. Show `bookmarksContext.ts`: `createContext`, `useBookmarks()` (throws outside the provider).
2. Show `BookmarksProvider.tsx` (owns `useState`, `toggleBookmark`, `<BookmarksContext value={…}>`)
   and `AppLayout.tsx` line 78 (`<BookmarksProvider>`).
3. Show `BookmarkButton.tsx`: `const { isBookmarked, toggleBookmark } = useBookmarks();`.
4. Show what disappeared: `git show <hash of "EX5 DEMO 8"> --stat` and the diff of
   `EvidenceList.tsx` / `EvidenceCard.tsx` (bookmark props removed).
5. Live: stars, Dashboard count and Workspace still work.

**Say**
- Context solves **transporting** a value past components that don't use it. It does **not**
  manage state (still a `useState` in the provider), doesn't optimise re-renders (all consumers
  re-render on change), and isn't a global store.
- **Decision:** justifiable, not necessary. Bookmarks are cross-cutting (3 views, a deep button),
  so I keep Context for them. Notes and review edits stay on props.
- Threshold: Context when a value passes through **~3+ uninterested components and is needed in
  several branches**. Putting the *filters* in Context would be unnecessary global state.

---

## Demo 9 — Diagnose & fix state problems

**Have open:** terminal, `EvidenceDetail.tsx` line 101, `DashboardPage.tsx`.

**Steps**
1. `git show <hash of "EX5 DEMO 9">` and walk through both fixes.
2. **Bug 1 (duplicated → stale):** before, the Dashboard read `data.bookmarks`, a copy loaded once.
   Bookmarking 2 items still showed **0**. Fixed by removing the copy and reading `useBookmarks()`.
3. **Bug 2 (stale):** before, opening E01, typing a note, then opening E02 showed E01's text. Fixed
   with `key={ev.id}` on `NoteEditor`.
   *Live demo of bug 2:* remove `key={ev.id}` in `EvidenceDetail.tsx` line 101, save. Open E01,
   type "test" (don't save), click the E02 card → "test" is still there. Undo.
4. Optional: React DevTools → `NoteEditor` keeps its `draft` hook value across items without the
   key.

**Say**
- (1) duplicated state that showed up as stale state; (2) stale state. Both noticed as visible
  bugs in my browser test.
- The rest was checked: no mutation left, drilling handled, no unnecessary global state.
- Exercise 1's history is mostly **duplicated state**: `filteredEvidence` as a copy (even the same
  reference), bookmarks stored twice, numbers cached in HTML.

---

## Demo 10 — Wrap-up

**Have open:** terminal, `#/timeline`.

**Steps**
1. Sweep:
   ```
   grep -rnE "innerHTML|classList|document\.|querySelector|addEventListener|createElement\(|appendChild" src/react
   ```
   → only `document.getElementById("root")` in `main.tsx` (mounting React).
2. Click through all 5 views in `react.html`: Dashboard, Evidence (+ detail), People & Locations,
   Timeline, Workspace.
3. **Timeline filters now work:** choose a person → the list filters and the URL becomes
   `#/timeline?person=…`. Press **Back** → the filter is undone.

**Say**
- **Unsure decision:** Evidence filters in a reducer (lost on reload, not shareable) vs Timeline
  filters in the URL (bookmarkable, but strings and history entries). In a real app I'd probably
  move the Evidence filters into the URL too.
- **Structurally impossible now:** stale views from cached rendering (vanilla's `viewRendered`:
  stale counts, People showing 0, empty Workspace on direct open). React re-renders from current
  state, and there's no render call I could forget.

---

## Quick checklist on the day

- [ ] `npm ci` done after the last pull, `npm run dev` running (not Live Server)
- [ ] localStorage cleared before starting
- [ ] Commit hashes noted (`git log --oneline`)
- [ ] Undo every live edit (Demo 2 `onChange`, Demo 3 broken file, Demo 9 `key`) before committing
