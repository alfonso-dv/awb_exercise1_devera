# Architecture — React app (`react.html`)

State after Exercise 5: **all 5 views are React.** The vanilla app (`index.html`, `src/*.ts`)
is kept unchanged for comparison.

## Folder structure: by feature

```
src/
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
    │   │                        evidenceFilters.ts (reducer + filterAndSortEvidence),
    │   │                        components/ (EvidenceToolbar, EvidenceList, EvidenceCard,
    │   │                        BookmarkButton, EvidenceDetail, NoteEditor)
    │   └── workspace/           WorkspacePage, components/ (BookmarksList, NotesList,
    │                            HypothesisForm)
    ├── shared/                  used by two or more features
    │   ├── components/          Panel, Badge, StatusBadge, RelevanceBadge, BulletList,
    │   │                        EmptyState, LoadingState
    │   ├── data/                loadCaseData, useCaseData, caseDataOutlet (LayoutContext,
    │   │                        useLayoutContext, useCaseDataFromLayout)
    │   └── state/               bookmarks.ts (toggleBookmarkId), BookmarksProvider +
    │                            bookmarksContext.ts (useBookmarks), reviewEdits.ts
    └── sandbox/                 throwaway teaching demos (HelloCase, KeyIdentityDemo)
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

## Data flow

1. `AppLayout` calls `useCaseData()` once → fetches the 5 JSON files in parallel
   (`loadCaseData`).
2. While loading: `LoadingState`; on failure: an error banner; when ready:
   `<Outlet context={data} />`.
3. Feature components (`DashboardPage`, `PeopleTab`, `TimelinePage`, …) read it with
   `useCaseDataFromLayout()`, plus route data (`useParams`, `useSearchParams`), derive what they
   need with pure functions (`computeDashboardStats`, `countEvidenceByPerson`,
   `parseTimelineQuery` + `applyTimelineFilters`) and pass plain props down.
4. Presentational components only render their props.

Changes flow back up through callbacks (`onSaveNote`, `onReviewChange`, `toggleBookmark`,
reducer `dispatch`, `setSearchParams`); no component changes state it doesn't own.
