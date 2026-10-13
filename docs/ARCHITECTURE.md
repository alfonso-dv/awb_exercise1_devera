# Architecture — React app (`react.html`)

State after Exercise 4. The vanilla app (`index.html`, `src/*.ts`) is unchanged and still
implements Evidence and Workspace.

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
    │   ├── NotFoundPage.tsx     catch-all route
    │   └── PlaceholderPage.tsx  stub for views not migrated yet (Evidence, Workspace)
    ├── features/                one folder per area of the app
    │   ├── dashboard/           DashboardPage, dashboardStats.ts, components/ (CaseSummaryCard,
    │   │                        StatCard, ReviewProgress, RecentEvidenceList, RecentTimelineList,
    │   │                        HowToCard)
    │   ├── team/                People & Locations: TeamLayout (tab routes), PeopleTab,
    │   │                        LocationsTab, PersonDetailPage, LocationDetailPage,
    │   │                        teamStats.ts, components/ (PersonCard, LocationCard)
    │   └── timeline/            TimelinePage, timelineQuery.ts, components/ (TimelineEventList,
    │                            TimelineEventItem, TimelineFiltersBar, CertaintyBadge)
    ├── shared/                  used by two or more features
    │   ├── components/          Panel, Badge, StatusBadge, BulletList, EmptyState, LoadingState
    │   └── data/                loadCaseData, useCaseData, caseDataOutlet (useCaseDataFromLayout)
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
| `/timeline?order=&person=&location=&type=` | `TimelinePage` | query params set the initial list |
| `/evidence`, `/workspace` | `PlaceholderPage` | link to the vanilla views |
| `/sandbox/keys?keys=index\|id&order=reversed&without=<id>` | `KeyIdentityDemo` | teaching demo |
| anything else | `NotFoundPage` | catch-all `path="*"` |

All routes are children of the layout route `AppLayout`, so the header and the loaded case data
are shared by every page.

**Why `HashRouter`:** the app is static files on GitHub Pages, and the React app lives in
`react.html`. With path URLs (`/team/people`) a reload would ask GitHub Pages for a file that
doesn't exist → 404. Everything after `#` never reaches the server, so every route survives a
reload and can be bookmarked.

## Data flow

1. `AppLayout` calls `useCaseData()` once → fetches the 5 JSON files in parallel
   (`loadCaseData`) and reads bookmarks from `localStorage`.
2. While loading: `LoadingState`; on failure: an error banner; when ready:
   `<Outlet context={data} />`.
3. Feature components (`DashboardPage`, `PeopleTab`, `TimelinePage`, …) read it with
   `useCaseDataFromLayout()`, plus route data (`useParams`, `useSearchParams`), derive what they
   need with pure functions (`computeDashboardStats`, `countEvidenceByPerson`,
   `parseTimelineQuery` + `applyTimelineFilters`) and pass plain props down.
4. Presentational components only render their props.

The only React state in the app is the loading state inside `useCaseData`. Interactive state
(filters that actually filter, bookmarks, forms) arrives in Exercise 5.
