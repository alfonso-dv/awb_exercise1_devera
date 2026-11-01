# Exercise 5 — Change log & answers

React interactivity and state: the **Evidence Catalogue** and the **Workspace** are now React, so
**all 5 views** of `react.html` run on React state and props. Bookmarks, notes and review edits
are shared state with one owner each. The evidence filters use `useReducer`, bookmarks use
Context, and the Timeline filters from Exercise 4 now actually filter.

Step-by-step presentation instructions: **`CHANGES/EXERCISE_5_DEMO_GUIDE.md`**.
Who owns which state: **`docs/ARCHITECTURE.md`** → "State: who owns what".

## Commits (in order)

| Commit message | Demo |
|---|---|
| `EX5 DEMO 1/2/4/5/6: Evidence Catalogue and Workspace in React` | 1, 2, 4, 5, 6 |
| `EX5 DEMO 9: Fix duplicated bookmark state and stale note draft` | 9 |
| `EX5 DEMO 3: (broken on purpose) mutating bookmark toggle` | 3 (before) |
| `EX5 DEMO 3: Immutable bookmark toggle (new frozen array)` | 3 (after) |
| `EX5 DEMO 7: Evidence filters as one useReducer` | 7 |
| `EX5 DEMO 8: Provide bookmark state through React Context` | 8 |
| `EX5 DEMO 10: Final sweep — wire Timeline filters, remove leftovers` | 10 |
| `EX5: Notes, architecture update and demo guide` | docs |

## Verification (scripted browser checks, dev server and production build)

- Evidence: 18 cards, newest first. Search, every filter, sort and "Clear filters" work, and the
  inputs show the state (e.g. empty after clearing). Bookmark stars toggle immediately and are saved.
  Clicking a card opens `#/evidence/E01` and the filters are kept. Changing the review status updates
  the card badge *and* the Dashboard "Reviewed" count. Saving a note shows it in the preview and in
  the Workspace. `#/evidence/E99` → "Evidence not found".
- Workspace: bookmarked items and notes appear, and "Remove" un-bookmarks. The hypothesis form
  (select, select, multi-select, range, 2 textareas) saves, the "Saved at …" message appears, and
  after a reload every field is restored. The vanilla app reads the same `localStorage` entries.
- Dashboard: bookmark and reviewed counts follow the changes immediately.
- Timeline: changing a dropdown filters and updates the URL (`?person=…&order=…&type=…`), Back
  restores the previous filters, and results still match the vanilla app.
- Everything from Exercises 3–4 still passes (routes, people/locations, key demo, dashboard text),
  and the vanilla app is unchanged.

## Differences from the vanilla app (deliberate)

- **Sort applies from the start.** Vanilla shows "Newest first" but actually lists file order,
  and its sort is lost again on the next filter change. React always shows the list sorted by the
  selected order.
- **Search matches title, summary and tags, and combines with the filters.** Vanilla's search box
  matched titles only and ignored the dropdown filters; its filter dropdowns did search title,
  summary and tags. Two different searches.
- The evidence **detail opens above the list** (vanilla: below, with an auto-scroll; scrolling
  would need an effect, which is Exercise 6). The open item is in the URL (`#/evidence/E05`), so it
  survives a reload and can be linked.
- Review status/relevance edits are kept in memory only, **exactly like vanilla** (not persisted).

---

# DEMO 1 — Event handling

**Handlers migrated** (vanilla → React):

| Interaction | Vanilla | React |
|---|---|---|
| Bookmark star | one delegated `click` listener on `#evidenceList` (re-attached with `removeEventListener`/`addEventListener` after every render), checking `event.target.dataset.action === "bookmark"` | `onClick={handleClick}` on `BookmarkButton` (`stopPropagation()` so the card doesn't open) |
| Open a card | same delegated listener, `target.closest(".evidence-card")` | `onClick={() => onOpen(ev.id)}` on `EvidenceCard` → `navigate("/evidence/E01")` |
| Search box | `addEventListener("input", handleSearchInput)` + simulated async search | `onChange` → `dispatch({type: "SET_SEARCH"})` |
| Sort | inline `onchange="handleSortChange()"` in `index.html` | `onChange` on the sort `<select>` |
| Clear filters | `addEventListener("click", clearFilters)`, which set six `.value`s by hand | `onClick` → `dispatch({type: "CLEAR_FILTERS"})` |
| Review status / relevance | `addEventListener("change", …)` after every `innerHTML`; handler did `ev.status = e.target.value` | `onChange` → `onReviewChange("status", value)` |
| Save note | inline `onclick="saveCurrentNote()"` inside the HTML string; read the textarea via `getElementById` | `onClick={() => onSave(draft)}` |
| Close detail | inline `onclick="closeEvidenceDetail()"` | `<Link to="/evidence">` |
| Hypothesis save | inline `onclick="saveHypothesis()"`, then read 6 inputs from the DOM | `<form onSubmit={handleSubmit}>` reading the state |
| Confidence value | `addEventListener("input", …)` writing `output.textContent` | `<output>{draft.confidence}</output>`, derived from state, no listener |

In `src/react` there is **no** `addEventListener`, `onclick="…"` string or `getElementById`
except mounting the root (sweep in Demo 10). The vanilla `index.html` still has its inline handlers
because the vanilla app is kept unchanged for comparison.

## Answers

**React click handler vs vanilla; what receives the event, same kind of object?**
React: you pass a **function** as a prop in JSX, `onClick={handleClick}`. React attaches it; there
is no string and no lookup on `window`. Vanilla did it two ways: inline `onclick="saveCurrentNote()"`
in an HTML **string** (the browser evaluates the string in the global scope, which is why
`main.ts` had to put `navigateTo`, `saveCurrentNote` etc. on `window`), or
`element.addEventListener("click", fn)` on an element found with `getElementById` *after* the
HTML was inserted.
What arrives is different: vanilla handlers get the **native DOM event** (`MouseEvent`,
`InputEvent`). React handlers get a **`SyntheticEvent`** (`React.MouseEvent<HTMLButtonElement>`
in `BookmarkButton.tsx`), a React wrapper with the same interface (`target`, `currentTarget`,
`preventDefault()`, `stopPropagation()`) that behaves consistently across browsers. The native
event is still available as `event.nativeEvent`. React also types it: `e.target.value` in an
`onChange` on an `<input>` is known to be a string.

**Do we still need event delegation?**
No, not by hand. In vanilla, `renderEvidenceList()` replaced the cards with `innerHTML` on every
render, which destroyed their listeners. So one listener on the stable container plus
`event.target` checks was the workaround, and even that had to be removed and re-added to avoid
duplicates. In React, each card simply has its own `onClick`. Re-rendering doesn't stack up
listeners, because React updates the handler references itself, and you never see `target` /
`dataset` plumbing (the id is in the closure: `() => onOpen(ev.id)`). React **does delegation
internally**: it attaches one listener per event type at the root container (`#root`) and
dispatches to the right component handler. So we get the efficiency of delegation without writing
it.

---

# DEMO 2 — `useState` & controlled forms

- **Search box:** `value={filters.search}` + `onChange={(e) => onSearchChange(e.target.value)}`
  (`EvidenceToolbar.tsx` line 44). Started as `useState("")` in `EvidencePage`, and is now part of
  the reducer state (Demo 7).
- **Hypothesis form, fully controlled** (`features/workspace/components/HypothesisForm.tsx`):
  suspect `<select>`, nature `<select>`, evidence `<select multiple>` (`value={draft.evidenceIds}`,
  read with `Array.from(e.target.selectedOptions, o => o.value)`), confidence
  `<input type="range">`, two `<textarea>`s. All take their `value` from one `draft` state object
  and update it through `updateField(field, value)`.
- **Save:** `<form onSubmit={handleSubmit}>`: `preventDefault()`, build the draft **from state**
  plus `savedAt`, `writeStoredHypothesis()` (localStorage, same key and format as the vanilla app),
  then show "Saved at 9:13:45 PM". The initial state comes from localStorage once, through a
  lazy initialiser `useState(initialDraft)`.
- Also controlled: the 5 filter dropdowns + sort, the review selects, the note textarea, and the
  Timeline filters.

## Answers

**Controlled vs uncontrolled; what if `onChange` is missing?**
*Controlled:* React state is the source of truth. The input gets `value={state}`, and every change
goes through `onChange` → `setState` → re-render → the input shows the new state.
*Uncontrolled:* the DOM keeps the value itself (optionally `defaultValue` for the start), and you
read it when needed (e.g. `ref.current.value`). My Exercise 4 timeline dropdowns were like that.
**Live demo:** remove `onChange` from the search input (`EvidenceToolbar.tsx`) and type "camera".
**Nothing appears**, and the console shows:
`You provided a 'value' prop to a form field without an 'onChange' handler. This will render a
read-only field. If the field should be mutable use 'defaultValue'. Otherwise, set either
'onChange' or 'readOnly'.`
*Why:* the input renders `value={filters.search}`, which is `""`. When you press a key, the browser
puts the character into the DOM, but nothing updates the state, so state stays `""`. React then
makes the DOM match what the last render said (`value=""`) and puts the old value back. The UI is
a function of state: if state doesn't change, what's shown can't change either.

**One `useState` per field or one object?**
**One object** (`draft`) for the hypothesis form, with one generic `updateField`:

- The 6 fields are **one thing**: they're loaded together (one localStorage entry), saved
  together (one `JSON.stringify`) and have the same shape as the stored `HypothesisDraft` type.
  With 6 `useState`s I'd have to split the stored object into 6 on load and assemble it again on
  save.
- All updates are the same simple operation ("set field X to Y"), with no rule that touches
  several fields at once. So a single object with `setDraft(prev => ({...prev, [field]: value}))`
  is enough, and TypeScript checks the value type per field (`updateField<K>`).
- Trade-off: each update copies the object (trivial here), and you must not forget `...prev`.

(Revisited in Demo 7: the *evidence filters* have actions that change several fields together and
rules like "clear all", so there a reducer pays off. The hypothesis form only ever sets one field
at a time, so `useState` with an object stays the simpler choice.)

---

# DEMO 3 — Immutable updates

**Before/after commits:**

1. `EX5 DEMO 3: (broken on purpose)`: `toggleBookmarkId` does `list.push(id)` /
   `list.splice(i, 1)` on the state array and returns **the same array**. (TypeScript's
   `readonly EvidenceId[]` doesn't even allow `push`, so the broken version needs a cast
   `bookmarks as EvidenceId[]`. That cast alone is a warning sign.)
   **Measured:** click a star → `localStorage` says `["E01"]` but **the star doesn't appear**.
   Type one letter into the search box (an unrelated re-render) → now the star shows up.
2. `EX5 DEMO 3: Immutable bookmark toggle`: `src/react/shared/state/bookmarks.ts`:
   ```ts
   const next = bookmarks.includes(id)
     ? bookmarks.filter((b) => b !== id)   // new array without id
     : [...bookmarks, id];                   // new array with id
   return Object.freeze(next);
   ```
   **The case that exercises this:** the result (and the initial state) is **frozen**. If any code
   tries to mutate bookmark state again (`push`, `splice`, index assignment), it doesn't silently
   skip a render. It throws immediately: `TypeError: Cannot add property 1, object is not
   extensible`.

Other places where the first instinct would mutate, and what I did instead:

- Review status: vanilla did `ev.status = e.target.value`, mutating the shared evidence object.
  React: `setReviewEdits(prev => setReviewField(prev, id, field, value))` creates a new edits object,
  and `applyReviewEdits` creates *copies* of the edited items (`{...ev, ...edits}`). The loaded
  objects are never touched.
- Notes: `{ ...notes, [id]: text }` instead of `notes[id] = text`.
- Hypothesis form: `{ ...prev, [field]: value }` instead of `draft[field] = value`.
- Filters: every reducer branch returns a new object.

## Answers

**Why can mutation still seem to "work", and what does React compare?**
When you call `setState(next)`, React compares the new value with the current one using
**`Object.is`** (reference identity for arrays/objects). It does **not** look inside. If you
mutated the existing array and pass it back, it's the **same reference**, so React decides
"nothing changed" and skips the re-render. The data *has* changed, though, so:

- it **looks like it works** whenever something *else* triggers a render soon (a parent update,
  typing elsewhere, navigating). Then the component reads the mutated data and shows it. That's
  exactly the "star appears after typing in the search box" effect;
- it **breaks** wherever identity matters: `React.memo`/`useMemo`/effect dependencies that compare
  references keep stale results, children that receive the same array don't update, and anything
  that kept the "old" value (undo, previous-state comparisons, the vanilla code sharing the same
  object) sees it change behind its back. The bugs show up far from the mutation and only
  sometimes.

**The vanilla sort bug and how the React version avoids it.**
Vanilla: `filteredEvidence = allEvidence` made **two names for one array**, and
`filteredEvidence.sort(...)` (`sort` mutates in place) therefore reordered `allEvidence`, the master
list, permanently.
React (`features/evidence/evidenceFilters.ts`, `filterAndSortEvidence`):

1. `evidence.filter(...)` **always returns a new array**, even when every item matches. So the
   array that gets sorted is never the master list.
2. `.sort()` runs on that **new** array (`matching.sort(...)`). The master `evidence` array
   (owned by `AppLayout`) is only ever read.
3. The sorted result is **not stored anywhere**. It's computed during render, so there is no
   second long-lived variable that could alias the master list.
4. The master list is typed `readonly Evidence[]` in the function signature, so `evidence.sort()`
   on it would be a **compile error**.

Bookmark toggle, same idea: `filter` / spread return new arrays, the state array is never changed,
and freezing makes any slip throw.

---

# DEMO 4 — Derived values vs. stored state

- **Visible evidence list:** `const visible = filterAndSortEvidence(evidence, filters)` in
  `EvidencePage.tsx`, computed **every render** from the full list + the reducer state. There's no
  `filteredEvidence` state.
- **Dashboard bookmark count:** `computeDashboardStats(data, bookmarks)` → `bookmarks.length`.
- **Workspace bookmarked items:** `data.evidence.filter((ev) => bookmarks.includes(ev.id))`.
- Both read **the same `bookmarks`** from `useBookmarks()` (one `useState` in
  `BookmarksProvider`). Also derived: the notes list, the Dashboard "Reviewed" count and %, and the
  evidence with review edits (`applyReviewEdits`).

## Answers

**Rule: `useState` or compute during render?**
> Store only the **minimal source of truth**: things that can't be calculated from anything else
> (user input, loaded data, choices the user made). Everything that *can* be calculated from props
> or state is **computed during render**. Use `useMemo` only if the calculation is measurably
> expensive, and even then it's a cache of a derived value, not state.

The filtered list is fully determined by *(all evidence, search, 6 filters, sort)*, all of which
already exist as state or props, so it's derived. Storing it would create a second copy that has
to be updated in every place that changes evidence, bookmarks or filters, and the first time one
place forgets, it's out of sync. Filtering 18 items is microseconds, so no `useMemo` is needed.

**Why deriving makes both vanilla bugs structurally impossible:**

- **Stale dashboard count** (rendered once, cached by `viewRendered`): in vanilla the number was
  computed *once* and then lived in the DOM as HTML, and only some code paths remembered to
  re-render it. In React the count isn't stored anywhere: `bookmarks.length` is evaluated **each
  time the Dashboard renders**, and the Dashboard re-renders whenever `bookmarks` changes, because
  it reads it via `useBookmarks()`. There's no cached copy that *could* be stale and no
  "remember to refresh" code that could be forgotten.
- **`filteredEvidence === allEvidence`**: there is no `filteredEvidence` variable that persists
  between renders, so nothing can be assigned to alias the master list. Each render creates a
  **fresh** array with `filter()` (a new reference by definition) and sorts that. Aliasing would
  need a stored second reference, and deriving means there isn't one.

---

# DEMO 5 — Lifting state up

- Components that use bookmarks: `BookmarkButton` (Evidence, under `/evidence`), `DashboardPage`
  (`/dashboard`), `WorkspacePage` → `BookmarksList` (`/workspace`). They're in **three different
  route branches**, and their lowest common ancestor is **`AppLayout`** (the layout route that wraps
  every page).
- The bookmark `useState` lives there: first directly in `AppLayout` (commit `DEMO 1/2/4/5/6`), and
  since Demo 8 in `BookmarksProvider`, which is rendered *by* `AppLayout`, so it's still the same
  owner level. Notes (Evidence detail + Workspace) and review edits (Evidence + Dashboard) were
  lifted to `AppLayout` for the same reason.
- **Verified:** bookmark 2 items in Evidence → Dashboard immediately shows **2 Bookmarked**, and
  the Workspace lists both. "Remove" in the Workspace un-stars the item in Evidence.

## Answers

**What does lifting state up mean mechanically; where was it before, where is it now?**
Mechanically: **move the `useState` call** from a child into the closest parent that contains
every component needing it. Then pass the **value down** (props, outlet context, or later Context)
and pass a **function that calls the setter down** (`onToggleBookmark`), so children can *request*
changes but the parent stays the only one that makes them.
Before: in the vanilla app, bookmarks were a global mutable array `state.bookmarks` **plus** a
duplicated `ev.bookmarked` flag on every evidence object, and every view kept its own rendered HTML
copy (hence stale counts). In React's Exercise 3 Dashboard, the count came from `data.bookmarks`,
a snapshot loaded once with the JSON (Demo 9 found and removed that leftover).
Now: one `useState` in `BookmarksProvider`, rendered by `AppLayout`, the lowest common owner. All
three views read that one array and change it only through `toggleBookmark`.

**What if each of Dashboard, Evidence and Workspace had its own `useState` for bookmarks?**
Three independent copies, each initialised from localStorage when its component mounts:

- **Out of sync immediately:** starring E03 in Evidence updates only Evidence's copy. The
  Workspace copy doesn't know until the Workspace remounts and re-reads storage.
- **Lost updates through localStorage:** each copy writes *its whole array*. Evidence holds
  `[E01, E02]` and stars E03, so it writes `[E01, E02, E03]`. Workspace, still holding
  `[E01, E02]`, removes E01 and writes `[E02]`. **E03 is lost** (last writer wins). The reverse
  order would bring back E01.
- Toggling logic and persistence duplicated three times, so three places to get right.

It's the same "one fact in several places" problem as the vanilla stale count.

---

# DEMO 6 — Passing callbacks downward

- **Bookmarks:** `onToggleBookmark` was passed down from `AppLayout` (before Demo 8 replaced it with
  Context), and `BookmarksList` still receives `onToggleBookmark` as a prop from `WorkspacePage`.
- **Notes:** `AppLayout.handleSaveNote` (calls `setNotes`) → outlet context `onSaveNote` →
  `EvidenceDetailRoute` (binds the id) → `EvidenceDetail` prop `onSaveNote` → `NoteEditor` prop
  `onSave` → button `onClick`.
- **Review status:** `AppLayout.handleReviewChange` (calls `setReviewEdits`) → outlet context
  `onReviewChange` → `EvidenceDetailRoute` → `EvidenceDetail` prop → `<select onChange>`.

## Answers

**Why can't a deep child just modify the ancestor's state? What do callbacks give you?**
Technically it *can't*: state is private to the component that called `useState`. Only that
component holds the setter, and a child has no reference to it unless one is passed down. And it
*shouldn't*: if children reached up and changed shared data (as the vanilla code did with
`ev.status = …` on a global object), you couldn't tell who changes what, React wouldn't know to
re-render, and every change would bypass the owner's rules (persisting to localStorage, staying
immutable). Passing a callback down gives **one-way data flow**: data goes down, *requests* go up.
The owner decides how the change happens (new frozen array + write to storage), so the rules live
in one place, and the child stays reusable because it only knows "call `onSave(text)`".

**Trace one callback:** `onToggleBookmark` at commit `EX5 DEMO 7` (before Context):

1. **`AppLayout`** defines `handleToggleBookmark(id)`, which calls `setBookmarks(next)` and
   `writeStoredBookmarks(next)`, and puts it into the outlet context as `onToggleBookmark`;
2. **`EvidencePage`** (via `useLayoutContext()`) passes `onToggleBookmark={layout.onToggleBookmark}`
   to
3. **`EvidenceList`**, which passes it to every
4. **`EvidenceCard`**, which wraps it: `onToggle={() => onToggleBookmark(ev.id)}` for
5. **`BookmarkButton`**, which calls it in `onClick` (after `stopPropagation()`).

That's **5 components**: 1 hop through the outlet context and **3 prop hops**. `EvidencePage`,
`EvidenceList` and `EvidenceCard` don't use bookmarks themselves; they only forward
`bookmarks` + `onToggleBookmark`. It's mild prop drilling: noticeable (two extra props on two
components that don't care about them, and every new consumer means touching the chain), but
still readable and type-checked, so TypeScript flags a forgotten prop. I'd call it
**manageable, close to the threshold**. See Demo 8.

---

# DEMO 7 — `useReducer` for the filters

`features/evidence/evidenceFilters.ts`:

- State: `EvidenceFilters` = `{ search, type, person, location, status, relevance, sort }` (7
  values), `INITIAL_FILTERS`.
- Actions (`FilterAction` union): `SET_SEARCH`, `SET_FILTER` (with `field` + `value`), `SET_SORT`,
  `CLEAR_FILTERS`.
- `filtersReducer(state, action)`: a pure `switch` that always returns a new object.
- `EvidencePage.tsx` line 27: `const [filters, dispatch] = useReducer(filtersReducer,
  INITIAL_FILTERS);`, replacing the **7 `useState` calls** from the first commit (compare the two
  versions with `git show <EX5 DEMO 7 hash>`).

## Answers

**Why is this a better fit for `useReducer`?**
The 7 values are **one state domain**: they're always used together (one call to
`filterAndSortEvidence`), shown together (the toolbar), and some changes affect **several at
once** (clear). With 7 `useState`s:

- `EvidencePage` had 7 lines of state, then rebuilt the `filters` object by hand every render;
- `handleFilterChange` was an `if (field === "type") setType(...)` ladder;
- `handleClear` had to call **7 setters**, one per field, and it's easy to forget one when an 8th
  filter is added.

After switching: the component has one line of state and only *dispatches* what happened. **All
rules for how filters change live in one pure function**, next to `filterAndSortEvidence` and
testable without React (`filtersReducer(state, action)` → new state). `SET_FILTER` with a typed
`field` replaces the `if` ladder, and the action union documents every possible change.

**`CLEAR_FILTERS`:**

```ts
case "CLEAR_FILTERS":
  return INITIAL_FILTERS;
```

One return value replaces the whole state in **one update**. It can't half-reset (e.g. forgetting
`relevance`), the reset values are the same constant used for the initial state (so "cleared" ==
"fresh page"), and a new field added to `EvidenceFilters` is automatically included. TypeScript
forces it into `INITIAL_FILTERS`. With individual setters, consistency depends on remembering
every setter, every time.

**Is `useReducer` fundamentally different from `useState`?**
No. `useState` is essentially **a special case of `useReducer`**: a reducer whose "action" *is* the
next state (or an updater function). Conceptually,
`useState(init)` ≈ `useReducer((state, action) => typeof action === "function" ? action(state) : action, init)`,
and React's own implementation of `useState` is built on the same reducer-hook machinery. Both
store a value in the component, both trigger a re-render on change (same `Object.is` bail-out),
and both require immutable updates. The difference is **where the update logic lives**: with
`useState` it's spread across the handlers (`setX(...)`), with `useReducer` it's centralised in a
named, pure function, and handlers only describe *what happened*.

---

# DEMO 8 — Context, and when not to use it

**Implemented:** `src/react/shared/state/bookmarksContext.ts` (`BookmarksContext`, the
`useBookmarks()` hook, which throws if used outside the provider) and `BookmarksProvider.tsx` (owns
the `useState`, `toggleBookmark`, persistence). `AppLayout` renders `<BookmarksProvider>` around
the app. **Now** `BookmarkButton` calls `useBookmarks()` itself: `EvidencePage`, `EvidenceList`
and `EvidenceCard` lost their `bookmarks`/`onToggleBookmark` props. Dashboard and Workspace also
use `useBookmarks()`. Notes and review edits deliberately **stayed** on props / outlet context.

**My decision, honestly:** for this app at its current size, Context for bookmarks is
**justifiable but not necessary**. Prop drilling was 3 levels, which is manageable. I keep the
Context because bookmarks are the one piece of state that is genuinely **cross-cutting**: three
features in different route branches read it, the button that changes it sits 4 levels deep in
another feature, and every new place that shows "bookmarked" (e.g. a star in the timeline later)
would otherwise mean threading props through components that don't care. I did **not** move notes
and review edits into Context: each is used by one or two components close to the route level, so
props are clearer there.

## Answers

**What does Context solve, and what doesn't it?**
It solves **passing a value through many layers that don't use it**: any component below the
provider can read the nearest value with `useContext`, so the in-between components don't need
props. That's all it is: a **transport** mechanism, dependency injection for a subtree.
It doesn't:

- **manage state.** The state is still a normal `useState` in the provider component. If that
  unmounts, it's gone. There are no actions, no middleware, no devtools history like a store;
- **optimise re-renders.** When the provider's value changes, **every consumer re-renders**.
  `value={{...}}` creates a new object on each provider render, so all consumers re-render even if
  the part they use didn't change. There are no selectors (unlike Redux/Zustand) without extra work
  (`useMemo`, splitting contexts);
- **make things "global".** It's scoped to the provider's subtree, and a component using
  `useBookmarks()` only works inside a provider, so it's coupled and harder to reuse or test in
  isolation;
- **remove the need to think about ownership.** It only hides how data gets there, which makes
  data flow less visible when reading the code.

**Was the Demo 6 prop drilling a real problem? My threshold?**
Manageable: 3 prop hops, fully type-checked, and only one value + one callback. It would become a
real problem if more consumers appeared in unrelated places, or if more pass-through layers kept
being added. My threshold: **prop-drill until the same value has to pass through roughly 3+
components that don't use it, *and* it's needed in several separate branches of the tree.** Below
that, an explicit prop is clearer. Often restructuring (composition with `children`) removes the
drilling better than Context does.

**Could this be "unnecessary global state"?**
Yes, it could. Context *feels* global, and the danger is putting things into it just because it's
convenient: e.g. the evidence **filters** in Context would be wrong. Only `EvidencePage` and its
toolbar use them, so making them reachable from everywhere would invite hidden dependencies, make
every consumer re-render on each keystroke, and keep them alive longer than the page needs. For
bookmarks I think it's justified: they *are* app-wide data (shown in 3 views, persisted, one per
user), and the provider sits at their real lowest common owner (`AppLayout`), not above the whole
app "just in case". If only the Evidence view used bookmarks, the Context would be unnecessary
global state.

---

# DEMO 9 — Diagnose & fix common state problems

Found while building this exercise, both **visible bugs caught by my scripted browser check**, and
fixed in commit `EX5 DEMO 9`:

1. **Duplicated state, which led to stale state.** After bookmarking two items in Evidence, the
   Dashboard still said **"0 Bookmarked"**. Cause: bookmarks existed **twice**, the new lifted
   state *and* a `bookmarks` array still inside `CaseData` (loaded once with the JSON in
   Exercise 3), which `computeDashboardStats` kept reading. **Fix:** removed `bookmarks` from
   `CaseData` entirely, and the Dashboard now reads the single source (`useBookmarks()`), so the
   duplicate can't come back.
2. **Stale state.** Open E01, type a note, then open E02: E02's note field still showed **E01's
   text**. Cause: when the route changes from `/evidence/E01` to `/evidence/E02`, React renders the
   *same* `NoteEditor` component at the same position, so it **keeps its `useState` draft**, and
   `useState(savedNote)` only uses its argument on the first mount. **Fix:**
   `<NoteEditor key={ev.id} …/>`. A new key means a new component instance with a fresh draft.

Also checked (code re-read + `grep`):

- **Mutation:** none left. The deliberate one from Demo 3 was fixed, and bookmark arrays are frozen.
- **Prop drilling:** handled with Context for bookmarks (Demo 8). The rest is 1–2 levels.
- **Unnecessary global state:** none. Filters, note drafts and the hypothesis form are local.

## Answers

**Category and how I noticed:** (1) **duplicated state**, showing up as **stale state**, noticed
as a **visible bug** (wrong number on the Dashboard during my end-to-end browser test).
(2) **Stale state**, noticed as a **visible bug** in the same test (wrong text in the note
field). React DevTools would confirm it: the `NoteEditor` keeps its `draft` hook value across
items.

**Which category is the app's Exercise 1 history most clearly an example of?**
**Duplicated state.** Almost every Exercise 1 defect comes from one fact being stored in two
places that then drift apart:

- `filteredEvidence` was a stored second copy of something derivable from `allEvidence`. Worse, it
  *was* `allEvidence` (same reference), so sorting one changed the other. The mutation bug was a
  symptom of having the duplicate at all.
- Bookmarks lived in `state.bookmarks` **and** as `ev.bookmarked` on each evidence object.
- Every view's numbers were duplicated into rendered HTML and cached by `viewRendered`, which is
  why the Dashboard count went stale.

In React, each of these has one source of truth, and everything else is derived during render.

---

# DEMO 10 — Remove remaining DOM manipulation + wrap-up

- Sweep: `grep -rnE "innerHTML|outerHTML|insertAdjacent|createElement\(|appendChild|removeChild|classList|\.style\.|document\.|querySelector|addEventListener|getElementById" src/react`
  finds only `document.getElementById("root")` in `main.tsx`, the single place where React is
  mounted. Re-checked Dashboard, People & Locations and Timeline too.
- Removed the unused `PlaceholderPage`.
- **Timeline filters now work.** In Exercise 4 they were uncontrolled and not wired. Now they're
  controlled, with **the URL query string as their state** (`setSearchParams` on change), so every
  combination is bookmarkable and Back/Forward restore the previous filters.
- **All 5 views run on React state and props** (`react.html`). State is owned as listed in
  `docs/ARCHITECTURE.md`.

## Answers

**A decision I'm not 100% sure about: Evidence filters in `useReducer` vs Timeline filters in the
URL.** Two very similar features now store their filters differently.

- *For the reducer (Evidence):* it's the exercise's point, all update rules sit in one testable
  function, `CLEAR_FILTERS` is trivial, and typing in the search box doesn't create a browser
  history entry per keystroke.
- *Against it:* Evidence filters are **lost** when you leave the view or reload, and a filtered
  catalogue can't be bookmarked or shared, which is exactly what the Timeline now does well.
- *For the URL (Timeline):* bookmarkable, shareable, survives reload, and Back works as an "undo"
  for filters.
- *Against it:* everything is a string and must be validated (`parseTimelineQuery`), every change
  adds a history entry, and a search box in the URL would need debouncing or
  `replace: true`.

Honest conclusion: for a real app I'd probably put the Evidence *filters* in the URL too and keep
the reducer as the function that computes the next query. For this exercise the reducer was the
right teaching choice, and the inconsistency is a known trade-off.

**A vanilla bug category that's now structurally impossible: stale views from cached rendering.**
Vanilla rendered each view's HTML once and remembered that in `viewRendered`. Afterwards the DOM
was a snapshot that only refreshed if some code path remembered to call `render…()` again. That
produced the stale Dashboard bookmark count, the People page showing **0 related evidence** when
opened directly, and the empty Workspace lists on direct open. In React this **can't be expressed**:
there's no rendered snapshot I keep, and no "render now" call I can forget. Components are
functions of state and props. When the state they read changes, React re-renders them, and when a
view is opened it renders from the current data. The only way to get a stale view is to bypass
state (mutation or duplicated state), and Demos 3 and 9 closed those doors with immutable/frozen
updates and a single source of truth.
