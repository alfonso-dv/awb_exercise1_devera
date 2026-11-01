# Architecture — React app (`react.html`)

State after Exercise 6: **all 5 views are React**, and in development the data comes from a
read-only Node backend (`server/`). The vanilla app (`index.html`, `src/*.ts`) is kept unchanged
for comparison.

## Folder structure: by feature

```
server/index.mjs                 dev-only Express API (read-only, delay/fail/empty/slow controls)
scripts/dev-all.mjs              starts API + Vite together (npm run dev:all)
src/
├── vite-env.d.ts                typed VITE_DATA_SOURCE
├── types.ts, utils.ts, data.ts, storage.ts, state.ts   shared with the vanilla app (domain types,
│                                                       formatting, typed JSON loading, localStorage)
└── react/
    ├── main.tsx                 entry: createRoot(#root).render(<App />)
    ├── app/                     the application shell — things every page sits inside
    │   ├── App.tsx              route table (React Router, HashRouter)
    │   ├── layout/              AppLayout (header + <Outlet>, loads case data once),
    │   │                        AppHeader, NavBar
    │   ├── routing/navItems.ts  main navigation entries
    │   └── NotFoundPage.tsx     catch-all route
    ├── features/                one folder per area of the app
    │   ├── dashboard/           DashboardPage, dashboardStats.ts, components/ (CaseSummaryCard,
    │   │                        StatCard, ReviewProgress, RecentEvidenceList, RecentTimelineList,
    │   │                        HowToCard)
    │   ├── team/                People & Locations: TeamLayout (tab routes), PeopleTab,
    │   │                        LocationsTab, PersonDetailPage, LocationDetailPage,
    │   │                        teamStats.ts, components/ (PersonCard, LocationCard)
    │   ├── timeline/            TimelinePage, timelineQuery.ts, components/ (TimelineEventList,
    │   │                        TimelineEventItem, TimelineFiltersBar, CertaintyBadge)
    │   ├── evidence/            EvidencePage (filters useReducer), EvidenceDetailRoute,
    │   │                        useEvidenceItem (fetches one item),
    │   │                        evidenceFilters.ts (reducer + filterAndSortEvidence),
    │   │                        components/ (EvidenceToolbar, EvidenceList, EvidenceCard,
    │   │                        BookmarkButton, EvidenceDetail, NoteEditor)
    │   └── workspace/           WorkspacePage, components/ (BookmarksList, NotesList,
    │                            HypothesisForm)
    ├── shared/                  used by two or more features
    │   ├── components/          Panel, Badge, StatusBadge, RelevanceBadge, BulletList,
    │   │                        EmptyState, LoadingState, ErrorState, describeLoadError
    │   ├── api/                 API-access layer: http.ts (getJson, ApiError, DATA_SOURCE),
    │   │                        caseApi.ts (one function per endpoint) — the only fetch() calls
    │   ├── hooks/               useFetch (loading/error/success, abort, retry), useDocumentTitle
    │   ├── data/                loadCaseData, useCaseData, caseDataOutlet (LayoutContext,
    │   │                        useLayoutContext, useCaseDataFromLayout)
    │   └── state/               bookmarks.ts (toggleBookmarkId), BookmarksProvider +
    │                            bookmarksContext.ts (useBookmarks), reviewEdits.ts
    └── sandbox/                 throwaway teaching demos (HelloCase, KeyIdentityDemo, EffectsLab)
```

Inside a feature: the **page/feature components** sit at the top of the folder, its
**presentational components** in `components/`, and its **pure logic** (derivations, URL parsing)
in plain `.ts` files next to them.

### Rule: shared vs. feature-local

> A component or helper starts **inside the feature that needs it**. It moves to `shared/` only
> when a **second feature** actually uses it, and only if it contains **no knowledge of a single
> feature's data** (it takes generic props like `title`, `variant`, `items`, `children`).

- Feature-local example: `features/team/components/PersonCard.tsx` — only People & Locations
  shows person cards (the person detail page is in the same feature).
- Shared example: `shared/components/Badge.tsx` — used by the Dashboard (case status, evidence
  status) and the Timeline (certainty); it knows nothing about either, only `variant` + `children`.
- Borderline: `features/timeline/components/TimelineEventList.tsx` is also used by the person and
  location detail pages (team feature). It stays in `timeline/` because it *is* timeline UI;
  `team` imports from `timeline` (one direction only). If a third feature needed it, or `timeline`
  needed something from `team`, it would move to `shared/`.

## Routes

| URL (after `react.html#`) | Component | Notes |
|---|---|---|
| `/` | → redirect to `/dashboard` | |
| `/dashboard` | `DashboardPage` | |
| `/team` | → redirect to `/team/people` | |
| `/team/people` | `TeamLayout` › `PeopleTab` | tab = real route |
| `/team/people/:personId` | `TeamLayout` › `PersonDetailPage` | route parameter |
| `/team/locations` | `TeamLayout` › `LocationsTab` | tab = real route |
| `/team/locations/:locationId` | `TeamLayout` › `LocationDetailPage` | route parameter |
| `/timeline?order=&person=&location=&type=` | `TimelinePage` | filters live in the query string (URL = state) |
| `/evidence` | `EvidencePage` | filters/search/sort in a `useReducer` |
| `/evidence/:evidenceId` | `EvidencePage` › `EvidenceDetailRoute` | open item = route param |
| `/workspace` | `WorkspacePage` | |
| `/sandbox/keys?keys=index\|id&order=reversed&without=<id>` | `KeyIdentityDemo` | teaching demo |
| `/sandbox/effects` | `EffectsLab` | teaching demo (effects) |
| anything else | `NotFoundPage` | catch-all `path="*"` |

All routes are children of the layout route `AppLayout`, so the header and the loaded case data
are shared by every page.

**Why `HashRouter`:** the app is static files on GitHub Pages, and the React app lives in
`react.html`. With path URLs (`/team/people`) a reload would ask GitHub Pages for a file that
doesn't exist → 404. Everything after `#` never reaches the server, so every route survives a
reload and can be bookmarked.

## State: who owns what

| State | Owner | How it reaches components | Persisted |
|---|---|---|---|
| Case data (read-only) | `useCaseData()` in `AppLayout` | outlet context → `useCaseDataFromLayout()` | – (fetched JSON) |
| Bookmarks | `BookmarksProvider` (inside `AppLayout`) | React Context → `useBookmarks()` | localStorage |
| Notes | `AppLayout` (`useState`) | outlet context: `notes`, `onSaveNote` → props | localStorage |
| Review status / relevance edits | `AppLayout` (`useState`) | outlet context: `onReviewChange`; evidence passed down already merged (`applyReviewEdits`) | – (in memory, like the vanilla app) |
| Evidence filters / search / sort | `EvidencePage` (`useReducer`) | props to `EvidenceToolbar` | – |
| Open evidence item | URL (`/evidence/:evidenceId`) | `useParams` | URL |
| Timeline filters | URL query string | `useSearchParams` / `setSearchParams` | URL |
| Note draft | `NoteEditor` (`useState`, `key={ev.id}`) | local | – |
| Hypothesis form draft | `HypothesisForm` (one `useState` object) | local; saved on submit | localStorage |

**Derived, never stored:** the visible evidence list (`filterAndSortEvidence`), Dashboard numbers
(`computeDashboardStats`), Workspace bookmark and note lists, evidence with review edits applied,
the visible timeline events.

## Data access: three layers (Exercise 6)

| Layer | Files | Knows about | Must not |
|---|---|---|---|
| **API access** | `shared/api/http.ts`, `shared/api/caseApi.ts` | URLs, `fetch`, the static-file fallback, HTTP errors (`ApiError`), forwarding the dev simulation params | know about React or state |
| **Application logic (hooks)** | `shared/hooks/useFetch.ts`, `shared/data/useCaseData.ts` + `loadCaseData.ts`, `features/evidence/useEvidenceItem.ts` | loading / error / success, cancellation (`AbortController`), retry, turning API shapes into app models | build URLs or call `fetch` |
| **UI** | components | rendering the states (`LoadingState`, `ErrorState`, `EmptyState`) | call `fetch` (enforced by ESLint `no-restricted-globals` in `src/react`) |

**Data source:** `DATA_SOURCE` is `"api"` in `npm run dev` (Vite proxies `/api/*` to
`localhost:3001`) and `"static"` in production builds (GitHub Pages has no backend, so
`public/data/*.json` is read). `VITE_DATA_SOURCE=api|static` overrides it.

Full end-to-end diagram: [`data-flow.md`](data-flow.md).

## Data flow

1. `AppLayout` calls `useCaseData()` once → `useFetch` → `loadCaseData` requests the 5
   resources in parallel through the API layer (backend in dev, static files in production).
2. While loading: `LoadingState`; on failure: an error banner; when ready:
   `<Outlet context={data} />`.
3. Feature components (`DashboardPage`, `PeopleTab`, `TimelinePage`, …) read it with
   `useCaseDataFromLayout()`, plus route data (`useParams`, `useSearchParams`), derive what they
   need with pure functions (`computeDashboardStats`, `countEvidenceByPerson`,
   `parseTimelineQuery` + `applyTimelineFilters`) and pass plain props down.
4. Presentational components only render their props.

Changes flow back up through callbacks (`onSaveNote`, `onReviewChange`, `toggleBookmark`,
reducer `dispatch`, `setSearchParams`); no component changes state it doesn't own.
