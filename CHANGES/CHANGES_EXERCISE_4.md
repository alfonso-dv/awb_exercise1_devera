# Exercise 4 — Change log & answers

React UI & component design: **People & Locations** and **Timeline** migrated to React, real
routes with React Router, route and query parameters, and a feature-oriented folder structure.
After this exercise **3 of 5 views** (Dashboard, People & Locations, Timeline) are fully React.

Step-by-step presentation instructions: **`CHANGES/EXERCISE_4_DEMO_GUIDE.md`**.
Architecture/folders/routes: **`docs/ARCHITECTURE.md`**.

## Commits

| Commit message | Demo |
|---|---|
| `EX4 DEMO 6: Reorganize React source into a feature-oriented structure` | 6 |
| `EX4 DEMO 8: Replace the hand-written hash router with React Router` | 8 |
| `EX4 DEMO 1/2/3/7: Migrate People & Locations to React components` | 1, 2, 3, 7 |
| `EX4 DEMO 5: Split PersonCard into presentational card + feature logic` | 5 |
| `EX4 DEMO 10: Migrate the Timeline view; initial list from query params` | 10 (+2, 3) |
| `EX4 DEMO 9: Add parameterized routes for people and locations` | 9 |
| `EX4 DEMO 4: Add throwaway key={index} vs key={id} demo (#/sandbox/keys)` | 4 |
| `EX4: Architecture doc, notes and demo guide` | docs |

## Hard rules: checked

- **No `innerHTML`** and **no manual DOM creation** in `src/react/`. Checked with
  `grep -rnE "innerHTML|createElement|appendChild|classList|querySelector" src/react`, which
  finds only `document.getElementById("root")` in `main.tsx` (the one place React is mounted).
- **No state beyond the initial render:** the only React state is the loading state in
  `shared/data/useCaseData.ts` (`useState` + `useEffect` that fetch the JSON once). Without it
  there is nothing to render at all. Timeline/Sandbox read the URL with `useSearchParams()` but
  never call its setter. Filter dropdowns are uncontrolled (`defaultValue`, no `onChange`).

## Verification (scripted browser checks, dev server and production build)

- **People cards** (6) and **location cards** (6): same text as the vanilla views, avatars load.
  The only addition is the new "View profile" / "View events" links.
- **Timeline:** default list (15 events, oldest first) identical to vanilla. `?person=nova-byte`
  (3 events) and `?order=desc&location=L04` identical to the vanilla app with the same filters
  selected. The dropdowns show the values from the URL. Changing a dropdown does *not* filter
  (expected).
- **Routes:** nav, tab routes, Back, direct links, reload on any route, unknown URL → "Page not
  found". `/team/people/not-a-person` → "Person not found".
- **Dashboard** still identical to vanilla. **Vanilla app** unchanged (same 23-point check as
  Exercise 2).
- **Found a vanilla bug along the way:** opening the vanilla app directly on People (`index.html#people`,
  i.e. a bookmark or reload) shows **"0 related evidence items" for everyone**. The view renders
  before `evidence.json` has loaded, and the `viewRendered` cache stops it from ever re-rendering.
  The React route `#/team/people` shows the real counts (3, 4, 5, 4, 4, 5) because it only renders
  once all data is there and recalculates on every render.

---

# DEMO 1 — JSX, function components, typed props, composition & children

**Built (all with typed `…Props` interfaces, no `any`):** `PersonCard`, `LocationCard`,
`TimelineEventItem`, `TimelineEventList`, `TimelineFiltersBar`, `CertaintyBadge`, plus shared
`Panel`, `Badge`, `BulletList`, `EmptyState`.

**`children` component: `shared/components/Panel.tsx`.** It's a white card frame with an optional
title, used in real places: Dashboard (`ReviewProgress`, `RecentEvidenceList`,
`RecentTimelineList`), person/location detail pages ("Background", "Timeline events involving…",
"Person not found"), and the sandbox.

## Answers

**A JSX expression that embeds a value, and what can go inside `{…}`.**
`features/team/components/PersonCard.tsx`:

```tsx
<p>
  {evidenceCount} related evidence item{evidenceCount === 1 ? "" : "s"}
</p>
```

and `alt={`Portrait of ${person.name}`}` (a template string as an attribute).
`{…}` takes **any JavaScript *expression***, meaning anything that produces a value: variables,
property access, function calls, ternaries, `&&`, template strings, `array.map(...)` returning
elements. It **can't** take *statements* (`if`, `for`, `const x = …`, `switch`). Those go above
the `return` or into a helper function. What the expression produces matters too: strings and
numbers render as text, elements and arrays of elements render, and `null`/`undefined`/`true`/`false`
render **nothing**. A plain object (e.g. `{person}`) **can't** be rendered and throws "Objects are
not valid as a React child". Text inside `{}` is always escaped (no HTML injection, unlike
`innerHTML`).

**What does TypeScript catch with typed props? (real errors)**
`PersonCardProps` is `{ person: Person; evidenceCount: number; showProfileLink?: boolean }`. In
`PeopleTab.tsx`:

- `evidenceCount="5"` → `error TS2322: Type 'string' is not assignable to type 'number'.`
- `person={locations[0]}` (a location instead of a person) →
  `error TS2740: Type 'CaseLocation' is missing the following properties from type 'Person': role,
  speciality, responsibilities, statement, and 2 more.`
- Forgetting `evidenceCount` → "Property 'evidenceCount' is missing"; a typo like
  `evidenceCuont=` → "Property 'evidenceCuont' does not exist".

`npm run build` and the dev overlay both show these, so the wrong data never reaches the browser.

**Named prop vs `children`; why `children` for `Panel`?**
A named prop (`person={…}`, `evidenceCount={…}`) passes **data** that the component knows how to
display. Its markup is decided *inside* the component. `children` passes **already-built UI**
that the component just places somewhere (the content between `<Panel>` and `</Panel>`), so the
*caller* decides what goes inside. `Panel` only provides the frame (white box, padding, optional
`<h3>`). Its content is completely different in each place: a progress bar, a list of mini
items, a paragraph of background text, a list of timeline events, a "not found" message with a
link. Data props for all of that would turn it into a special-cased component that knows about
every feature. With `children` it knows about none of them.

**Why does direct DOM manipulation conflict with React?**
React assumes **it owns the DOM inside `#root`**. It keeps its own picture of what it rendered
last time (the fiber tree) and on the next render only applies the *difference* between the new
JSX and that picture. If other code changes the DOM behind its back (`innerHTML = …`,
`classList.add("active")`, `appendChild`), React doesn't know:

- its next update is based on a stale picture, so it can **overwrite** your manual change
  (e.g. the next render removes your `active` class), or
- it tries to update/remove nodes that no longer exist or have moved, which leads to **errors**
  ("Failed to execute 'removeChild'…") or a mixed-up UI;
- `innerHTML` destroys the nodes React references, along with their event handlers and the state
  of uncontrolled inputs.

The vanilla app *is* that manual approach: `renderPeople()` rebuilds the whole panel with
`innerHTML`, `switchPeopleTab()` toggles `hidden`/`active` classes by hand. In React, the UI is a
function of data: to change what's shown, you change the data (or URL), never the DOM.

---

# DEMO 2 — Conditional rendering

**Real cases and techniques used:**

| Where | What | Technique |
|---|---|---|
| `TimelineEventList` | "No timeline events match the current filters." (e.g. `?person=signal-scholar&type=incident`) | **early return** of `<EmptyState>` |
| `PeopleTab`, `LocationsTab` | empty state if there's no data | early return |
| `PersonDetailPage`, `LocationDetailPage` | "Person/Location not found" for unknown ids | early return |
| `BulletList` | nothing at all for an empty list | early return **`null`** |
| `CertaintyBadge` | badge colour per certainty | **lookup table** `Record<Certainty, BadgeVariant>` |
| `StatusBadge` | colour per review status | lookup **function** `statusVariant()` |
| `TeamLayout`, `NavBar` | active tab / active nav button | **ternary** in `className={({isActive}) => isActive ? "tab-btn active" : "tab-btn"}` |
| `PersonCard` | "item" vs "items" | ternary |
| `Panel` | heading only if a `title` is given | **`&&`** |
| `TimelineEventItem` | "Location:" / "People:" lines and evidence chips only if there are any | `&&` with an explicit `length > 0` |
| `PersonCard` / `LocationCard` | profile link only in the list, not on the detail page | `&&` with a boolean prop |
| `TimelinePage` | "Showing events involving Nova Byte (from the link)" and the "Ignored unknown filter values" banner | `&&` |

Why which: **early return** when the *whole* component output changes (empty/not-found, which
keeps the main JSX un-nested); **ternary** when choosing between two values or two pieces of UI;
**`&&`** for "show this extra bit or nothing"; **lookup table** when a value maps to one of several
variants, because it's easier to read and extend than an `if/else` chain, and with
`Record<Certainty, …>` TypeScript complains if a certainty is missing.

## Answers

**A `cond && <X />` and the `0` problem.**
`TimelineEventItem.tsx`:

```tsx
{locations.length > 0 && (
  <p className="evidence-meta">Location: …</p>
)}
```

If I had written `{locations.length && …}`, then for an event without locations `locations.length`
is `0`. `0 && …` evaluates to **`0`**, and React renders numbers, so a stray **"0"** would
appear in the event card. (`false`, `null`, `undefined` and `""` render nothing; `0` and `NaN` do
render.) The risk applies to my code exactly where I test array lengths, so I always compare
explicitly (`length > 0`, `ignored.length > 0`). The other `&&`s use a boolean
(`showProfileLink`) or a string (`title`, where `""` renders nothing), so they're safe.

**Return `null` vs an empty `<div>`?**
`null` renders **nothing**: no element in the DOM. An empty `<div>` (or `<ul>`) is still a real
element that takes part in layout: it can pick up margins/padding from CSS, become an extra grid
or flex item that shifts the layout, and screen readers may announce an empty list. It also adds
pointless DOM nodes. I used **`null`** in `BulletList` when `items` is empty (no empty `<ul>` with
its default margin). Elsewhere I return an `EmptyState` message instead of nothing, because there
the user *should* see that the list is empty.

---

# DEMO 3 — Rendering collections

- People: `PeopleTab` → `people.map(person => <PersonCard key={person.id} … />)`
- Locations: `LocationsTab` → `locations.map(location => <LocationCard key={location.id} … />)`
- Timeline: `TimelineEventList` → `events.map(event => <TimelineEventItem key={event.id} … />)`
- Also: nav links (`key={to}`), dropdown options (`key={person.id}`, `key={location.id}`,
  `key={type}`), responsibilities/contains (`key={item}`), evidence chips (`key={id}`).

## Answer: what does React use `key` for?

To match each element in the new list to an element in the **previous** render during
reconciliation. Keys are an element's **identity** among its siblings. With keys, React can tell
"item with key `nova-byte` is still here, just moved to position 3" instead of comparing by
position. For each key it then **reuses** the existing component instance and DOM node (with its
state, focus, uncontrolled input value, scroll position), **moves** it if the order changed,
**creates** new ones for new keys and **removes** the ones whose key disappeared. Keys are only
compared among siblings of the same list and are not passed to the component as a prop.

---

# DEMO 4 — Stable keys and list identity

**Throwaway example:** `src/react/sandbox/KeyIdentityDemo.tsx`, route **`#/sandbox/keys`** (not in
the nav). Each row is a person's name plus an *uncontrolled* text input. Links switch between
`key={index}` and `key={person.id}` and reverse or filter the list, all through the URL
(`?keys=index|id&order=reversed&without=<id>`), with no `useState`.

Measured result (typing "suspect!" into **Nova Byte**'s field):

| Keys | Action | Afterwards the text is next to |
|---|---|---|
| `key={index}` | Reverse order | **Patch Vector** ❌ |
| `key={index}` | Remove first person | **Patch Vector** ❌ |
| `key={person.id}` | Reverse order | Nova Byte ✅ |
| `key={person.id}` | Remove first person | Nova Byte ✅ |

React printed **no warning** for `key={index}`. All real lists use stable ids (Demo 3).

## Answers

**What goes wrong with missing, duplicate or index keys in a list that reorders/filters?**

- **Index keys:** the key describes the *position*, not the item. After reversing, key `2` (Nova's
  old position) now belongs to Patch Vector, so React keeps the DOM node and component state that
  was at position 2 and just updates the name text. Anything not driven by props (uncontrolled
  input text, focus, checkbox state, component `useState`, an open/closed toggle, a running
  animation) **stays with the position and ends up on the wrong item**. When filtering (removing
  the first person), every later item shifts up one index: all the states shift onto the wrong
  people, and React does needless updates on every row instead of removing one.
- **Missing keys:** React falls back to the index (same bugs) and logs a console warning
  ("Each child in a list should have a unique 'key' prop").
- **Duplicate keys:** two siblings share an identity. React warns, and can show one item twice,
  drop one, or attach state to the wrong one, with unpredictable results on updates.

**The original vanilla index-as-identifier bug, ported to React as `key={index}`: visible or
not?**
In the original `app.js`, the Workspace notes list built each note's element id from its
**array index** in `allEvidence`: `'<div id="noteText-' + entry.index + '">'`. Because of the
Exercise 1 reference bug (`filteredEvidence = allEvidence`, so sorting the catalogue reordered
`allEvidence` too), the same note could get a different id after a sort. The id identified a
*position*, not a piece of evidence.
Ported directly to React as `key={index}` on that notes list: **the user would notice nothing, and
there wouldn't even be a console warning.** React only warns for *missing* or *duplicate* keys, not
index keys. Each note row only displays text from props (evidence id, title, note). After a
reorder, React reuses the row at each position and simply updates its text, so the screen
still shows the correct note next to the correct title. The cost is only invisible extra DOM
updates. It **would** become visible as soon as a row holds something not derived from props,
e.g. an inline note *editor* (uncontrolled input / local state), focus, or an expand/collapse
toggle. That's exactly what the sandbox shows with the input field.

**Is `key={index}` ever legitimate?**
Yes, when **all** of these hold: the list is **static** (never reordered, filtered or inserted
into except at the end), the items have **no stable id**, and the rows have **no state** of
their own (pure display). Examples: a fixed list of skeleton/loading placeholders, the lines of
a static text, the stars of a 5-star rating display, or a list of plain strings that may contain
duplicates (my `BulletList` uses the string itself as key, which is fine because responsibilities
are unique; for duplicate strings index would be the honest choice). Our real data always has ids,
so I always use them.

---

# DEMO 5 — Presentational vs. feature components

**Classification** (rule below):

| Feature / container (knows where data comes from, reads data/URL, derives) | Presentational (props in → JSX out) |
|---|---|
| `App` (route table), `AppLayout` (loads data, provides it via `<Outlet>`) | `AppHeader`, `NavBar`¹, `NotFoundPage`¹, `PlaceholderPage` |
| `DashboardPage` (reads data, `computeDashboardStats`) | `CaseSummaryCard`, `StatCard`, `ReviewProgress`, `RecentEvidenceList`, `RecentTimelineList`, `HowToCard` |
| `TeamLayout` (passes data to the tab routes), `PeopleTab`, `LocationsTab` | `PersonCard`, `LocationCard` |
| `PersonDetailPage`, `LocationDetailPage` (read `useParams`, look up, derive) | `TimelineEventList`, `TimelineEventItem`, `TimelineFiltersBar`, `CertaintyBadge` |
| `TimelinePage` (reads `useSearchParams`, `parseTimelineQuery`, `applyTimelineFilters`) | shared: `Panel`, `Badge`, `StatusBadge`, `BulletList`, `EmptyState`, `LoadingState` |
| sandbox `KeyIdentityDemo` (reads the URL) | sandbox `HelloCase` |

¹ `NavBar` (`NavLink`) and `NotFoundPage` (`useLocation`) read the *router* only to style a link /
show the URL. They contain no data logic, so I count them as presentational.

**Split component: `PersonCard`** (commit `EX4 DEMO 5`, compare with the commit before it).
Before, it did two jobs: it received **all evidence** (`allEvidence: Evidence[]`), **counted** the
items that mention the person (`filter(evidenceMentionsPerson)`), *and* rendered the card.
After the split:

- `PersonCard`: **only displays** a person; receives `evidenceCount: number`.
- `countEvidenceByPerson(people, evidence)` in `features/team/teamStats.ts`: **only computes**
  (pure function, no JSX).
- `PeopleTab` (feature component): wires them together (data → count → cards).

## Answers

**Single responsibility of each half; does a change in one affect the other?**
`PersonCard` is responsible for **how a person looks**. `countEvidenceByPerson` is responsible for
**what counts as "related evidence"**. The only thing connecting them is the contract "a number".
If the counting rule changes (e.g. also count timeline events, or the id/name matching changes),
only `teamStats.ts` changes and the card doesn't care. If the card's design changes (layout,
wording, adding a badge), the counting doesn't change. This also made reuse possible: the person
detail page shows the same card with a count computed for one person, and a test could check the
count without rendering anything. Before the split, the card would have needed *all* evidence just
to show one number, and changing the rule meant editing a UI component.

**Rule I used:**
> If a component needs to know **where data comes from** (calls `useCaseDataFromLayout`,
> `useParams`, `useSearchParams`, later state/stores) or **derives** data from raw collections, it's
> a **feature** component. If it only turns **ready-to-show props** into JSX, so you could render it
> in isolation with hard-coded props, it's **presentational**.

---

# DEMO 6 — Feature-oriented folder structure

See **`docs/ARCHITECTURE.md`** (full tree, routes, data flow, and the rule). Commit
`EX4 DEMO 6` is a pure move (no behaviour change) of the Exercise 3 code into
`app/`, `features/dashboard/`, `shared/`. The later commits add `features/team/` and `features/timeline/`.

## Answers

**By type vs by feature; why this one?**
*By type* groups files by **what kind of thing** they are: all components in `components/`, all
hooks in `hooks/`, all pages in `pages/` (my Exercise 3 layout was like that: `components/`,
`pages/`, `data/`, `routing/`). *By feature* groups by **what part of the app** they belong to:
everything for the timeline (page, its components, its URL parsing) in `features/timeline/`.
I chose by feature because this app is naturally made of **separate views** (Dashboard, People &
Locations, Timeline, later Evidence and Workspace) that are migrated **one feature per exercise**.
Each exercise adds one folder instead of touching four. A change to the timeline stays inside one
folder, it's obvious what can be deleted or moved together, and it scales when there are 50
components instead of 10. By-type would have put `PersonCard`, `TimelineEventItem` and `StatCard`
side by side in one big `components/` folder with no hint of which belongs where.

**Where's the line between feature-local and shared? (examples)**
Rule: **starts in the feature; moves to `shared/` only when a second feature uses it *and* it has
no feature-specific knowledge** (generic props).

- Feature-local: `features/team/components/PersonCard.tsx`. Only People & Locations shows person
  cards, and it's tied to the `Person` type.
- Shared: `shared/components/Badge.tsx`. Used by Dashboard and Timeline, it knows only `variant` +
  `children`. Also `Panel` and `EmptyState`.
- Deliberate exception: `TimelineEventList` lives in `timeline/` although the team detail pages
  use it. It's timeline UI, and `team → timeline` is the only cross-feature import. If more
  features needed it, it would move to `shared/`.

---

# DEMO 7 — Reusable UI elements

**`shared/components/Badge.tsx`** (`variant: BadgeVariant`, `children`), used in **three** places:

1. `features/dashboard/components/CaseSummaryCard.tsx`: case status **OPEN**
   (`<Badge variant="flagged">`).
2. `shared/components/StatusBadge.tsx` → Dashboard "Recent evidence": review status
   (`unreviewed`/`Reviewed`), with the variant chosen by `statusVariant()`.
3. `features/timeline/components/CertaintyBadge.tsx` → every timeline event: `confirmed` /
   `reported` / `contradictory`, with the variant from a lookup table.

Also reused: **`Panel`** (Dashboard ×3, detail pages, sandbox) and **`BulletList`** (person
responsibilities in `PersonCard`, location "Contains" in `LocationCard`).

## Answers

**What varies via props, what stays fixed, and how I chose.**
**Varies:** the colour (`variant`) and the text (`children`). **Fixed inside:** the element
(`<span>`), the base class `badge`, how the class name is built (`badge-${variant}`), and therefore
size, padding, rounded corners and font. The line: *everything that differs between the three
uses* is a prop, *everything that should look the same everywhere* is fixed. I deliberately did
**not** put domain knowledge into `Badge` (no `status` or `certainty` prop, no if/else for
"reviewed"): mapping a domain value to a colour is done by small wrappers (`StatusBadge`,
`CertaintyBadge`), so `Badge` doesn't become a special-cased mess. `variant` is a **union type**,
so a typo like `variant="flaged"` is a compile error and only colours that exist in the CSS can be
used.

**Compared to the vanilla copy-pasted template strings:**
In vanilla the same badge markup is written out separately in `renderDashboard()` (case status
and recent evidence), `renderEvidenceCardHTML()` (status, relevance, "Critical"),
and `renderTimeline()` (certainty, with a *different* class helper
`certaintyBadgeClass` returning names without the `badge-` prefix), e.g.
`'<span class="badge ' + getStatusBadgeClass(ev.status) + '">' + ev.status + '</span>'` vs
`'<span class="badge badge-' + certaintyBadgeClass(item.certainty) + '">' + item.certainty + '</span>'`.
Similarly the `<ul><li>` loop exists twice (`renderPeople` responsibilities, `renderLocations`
contains), and "id - name" location labels are built in two functions (`getEvidenceLocationNames()` and
`renderTimeline()`).
A reusable component gives me:

- **One source of truth**: change the badge once (add an icon, a tooltip, an `aria-label`), and all
  uses change. In vanilla you have to find every string and they drift apart (they already did:
  two different class-name helpers).
- **A typed contract**: wrong or missing props are compile errors. A typo in a string template is
  silently broken HTML.
- **Safety**: text is escaped automatically. Template strings pasted with `innerHTML` aren't (XSS).
- **Composability and readability**: `<Badge variant="flagged">OPEN</Badge>` says what it is; it
  can contain other elements; it shows up by name in React DevTools.

---

# DEMO 8 — Routing: real routes

**Library: React Router 8** (`react-router`), using **`HashRouter`**.
Why React Router: the de-facto standard for React SPAs, it covers everything this exercise needs
(nested routes and layout routes with `<Outlet>`, `NavLink` with active state, `useParams`,
`useSearchParams`, redirects with `<Navigate>`, a catch-all route), with great docs and wide use.
TanStack Router (fully type-safe params) was the alternative, but it's heavier to set up for this
size of app.
Why `HashRouter`: the app is static files on GitHub Pages inside `react.html`. A path URL like
`/awb_exercise1_devera/team/people` would 404 on reload. The part after `#` never reaches the
server, so every route can be reloaded and bookmarked without any server configuration.

- Routes: see the table in `docs/ARCHITECTURE.md`. Dashboard, `/team/people`, `/team/locations`,
  `/timeline`, placeholders for `/evidence` and `/workspace`, catch-all `*`.
- The hand-written `useHashRoute`/`parseRoute` from Exercise 3 is deleted. Nav buttons are
  `NavLink`s.
- **Tabs as routes:** `TeamLayout` renders two `NavLink`s (`/team/people`, `/team/locations`) and an
  `<Outlet>`. There's no tab state anywhere. The URL *is* the selected tab. `/team` redirects to
  `/team/people`.

## Answers

**Why does a real route for the tab matter for the user?**
The selected tab is now part of the URL (`react.html#/team/locations`), so the user can:
**bookmark** or **share a link** that opens directly on Locations, **reload** without being thrown
back to People, use the **Back button** to return from Locations to People, open a tab in a **new
browser tab** (middle-click), and see in the address bar where they are. In the vanilla app
`switchPeopleTab()` only toggled CSS classes, so a reload or shared link always showed People, and
Back left the whole view.
(Making views linkable also exposed a vanilla bug: opening `index.html#people` directly shows 0
related evidence for everyone; the React route doesn't have that problem.)

**What happens for a URL that doesn't match?**
The last child route is `<Route path="*" element={<NotFoundPage />} />`. React Router picks the
**most specific** match, so anything unknown (`#/nonsense`, `#/team/whatever`) renders
**"Page not found"** with the requested path and a link to the Dashboard, inside the normal layout
(header and nav still work, nothing highlighted). The URL stays as typed. Vanilla
`handleHashChange()` **silently showed the Dashboard** for an invalid hash while the URL still
said `#nonsense`, so the screen and URL disagreed and typos in links went unnoticed.
Unknown *ids* inside a valid route (`/team/people/not-a-person`) are handled by the page itself:
"Person not found".

---

# DEMO 9 — Route parameters

- Routes `team/people/:personId` → `PersonDetailPage`, `team/locations/:locationId` →
  `LocationDetailPage`.
- The page uses the param to decide what to render: the person's card, background, and *their*
  timeline events (reusing `PersonCard` and `TimelineEventList`), plus a link
  "Open these events in the Timeline view" → `/timeline?person=<id>`.
- **Links to it** (no typing URLs): "View profile and timeline →" on every person card,
  "View events at this location →" on every location card, and on **every timeline event** the
  people and the location are links (`People: Nova Byte, …` / `Location: L03 - …`).

## Answers

**How is the param read, what's its type, and how is it used safely?**

```tsx
const { personId } = useParams<{ personId: string }>();
```

`useParams` returns the params as **strings, each possibly `undefined`**
(`Readonly<Partial<{ personId: string }>>`). So `personId` is `string | undefined`, because
TypeScript can't know the component is only rendered by a route that has `:personId`. Even if it's
defined, it's **just text from the URL**, which anyone can edit.
Safe use: I never trust it. I look it up in the real data:
`const person = people.find((p) => p.id === personId)`. That gives `Person | undefined` and handles
both "missing" and "doesn't exist". If not found, the page **returns early** with a
"Person not found" panel and a link back. After that check TypeScript knows `person` is a
`Person`. When *building* links I use `encodeURIComponent(person.id)` so ids with special
characters can't break the URL.

**`/team/people/nova-byte` vs `/team/people?person=nova-byte`?**
A **route parameter** names *which resource the page is about*. `/team/people/nova-byte` **is**
Nova Byte's page: without the id there is no such page, and it's a clean, permanent, shareable
address for one person. A **query parameter** is an *optional modifier* of a page that also makes
sense without it, like filters, sorting or search: `/timeline` is complete on its own, and
`?person=nova-byte&order=desc` just narrows or orders it, and several can be combined.
For a person's profile the route param is right: it's an identity, required, one value, and it
reads well. `/team/people?person=nova-byte` would suggest "the people list, filtered to Nova",
and `/team/people` without the query would be a different page. For the timeline filter the
query param is right (that's how I used it).

---

# DEMO 10 — Query parameters as URL state + wrap-up

- `TimelinePage` reads `?order=`, `?person=`, `?location=`, `?type=` with `useSearchParams()`
  (**read only**, the setter is never used), validates them against the real data
  (`parseTimelineQuery`: unknown values are ignored and listed in a yellow banner), and computes
  the **initial** list with `applyTimelineFilters` (pure). The dropdowns start on those values
  (`defaultValue`), but changing them does nothing yet.
- Examples: `#/timeline?person=nova-byte` (3 events, "Showing events involving Nova Byte"),
  `#/timeline?order=desc&location=L04`, `#/timeline?person=signal-scholar&type=incident` (empty
  state), `#/timeline?person=bogus` (ignored with a warning).
- Links that use it: "Open these events in the Timeline view" on person and location pages.
- **Final pass:** Dashboard, People & Locations, Timeline are fully React. No `innerHTML` and no
  manual DOM creation anywhere in `src/react` (grep above). All three are real, bookmarkable,
  reloadable routes (`#/dashboard`, `#/team/people`, `#/team/locations`, `#/timeline`, plus the
  detail routes), verified in the dev server and the production build.

## Answers

**Why is reading a query param once still "no state beyond the initial render"?**
The query string isn't component state: it's **input**, like props or the loaded data. The page
is still a pure function of its inputs: *URL + data → list*. Nothing in the component changes after
the first render, and there's no `useState`, no setter call, no `onChange`. The URL is read, not
written. If the URL changes because the user follows a *link*, that's navigation (a new input),
not interactivity inside the component.
It **crosses the line** as soon as the component reacts to the user *on its own*: an `onChange`
on the dropdowns that stores the selection (`useState`) and re-filters, controlled `<select
value={…}>`s, writing the selection back to the URL with `setSearchParams`, a search box that
filters as you type, or the timeline's "View evidence" modal (open/closed state). That's
Exercise 5.

**What would make the filters actually filter? (concept)**
**State plus event handling, with controlled components.** The selected filter values must become
state (`useState`, or a `useReducer` for the four filters together) that the selects are bound to
(`value={filters.person}`) and updated from `onChange`. On each change React re-renders and
`applyTimelineFilters(timeline, filters)` (which already exists and is pure) produces the new list.
The nicer variant for this app is to use **the URL as the state**: `onChange` calls
`setSearchParams({ ...current, person: value })`. Then the existing read-from-URL code already does
the filtering, and every filter combination stays bookmarkable and works with Back.

**Duplicated logic or markup I noticed but didn't extract:**

1. **Route path strings**: `` `/team/people/${encodeURIComponent(id)}` `` appears in `PersonCard`,
   `TimelineEventItem` and the detail pages (same for locations and `/timeline?person=`). Better
   would be one `paths.ts` with `personPath(id)`, `locationPath(id)`, `timelinePath(filters)`, so a
   route change touches one file. I didn't, because it's only three places so far and the route
   structure was still changing during this exercise. Yes, I'd do it next, before Evidence adds
   more links.
2. The **"filters object for one person/location"** built by hand in both detail pages
   (`applyTimelineFilters(timeline, { order: "asc", person: id, location: "", type: "" })`). A
   tiny helper (`eventsForPerson(timeline, id)`) would remove it.
3. The **mini-list row** markup (`<div className="mini-list-item"><strong>…</strong> — …</div>`)
   in `RecentEvidenceList` and `RecentTimelineList`. The Exercise 3 plan has a `MiniListItem`, but
   the two rows differ (badge vs line break), and the Workspace (Exercise 5) will reuse it, so I'll
   extract it with that third use in mind, not guess the API now.
