# ADR 0001 — Keep the app a client-rendered SPA and migrate it to React

- **Status:** Accepted (Exercise 3)
- **Date:** 2026-10-06

## Context

Project ReMotion is an investigation portal for **one** case with a small, static data set
(5 JSON files, ~60 records in total). One investigator uses it at a time. It has no backend: the
data is static files on GitHub Pages, and user data (bookmarks, notes, hypothesis) lives in
`localStorage`.

It is highly interactive: filtering/searching/sorting evidence, toggling bookmarks, editing review
status and notes, filtering the timeline, a quick-view modal, and a hypothesis form. The same data
is shown in several views at once (e.g. the bookmark count on the dashboard, bookmark stars in
the catalogue, the bookmark list in the workspace).

The current vanilla TypeScript version is already a hand-written SPA (hash routing, `innerHTML`
templates). It has bugs that come straight from manual DOM syncing: the dashboard shows stale
bookmark counts because it only renders on the first visit, every bookmark click rebuilds the
whole evidence list (217 elements), and handlers rely on globals for `onclick="…"`.

Options considered:

1. **Server-rendered multi-page app** (e.g. a template engine per view).
2. **Keep vanilla TS SPA**, add a small router library.
3. **SPA with a lighter library** (Preact, Lit, Svelte, Alpine).
4. **SPA with React** (+ later a router and a state store).
5. **React meta-framework with SSR/SSG** (Next.js, Remix/React Router framework mode).

## Decision

Keep the **client-side rendered SPA** architecture and migrate the UI to **React + TypeScript**,
view by view, starting with the shell and the Dashboard. Keep static hosting on GitHub Pages.

## Reasons

- The app is **interaction-heavy, not content-heavy**: after the first load almost all work is
  re-rendering from in-memory state. That is exactly what a declarative UI (UI = f(state)) is
  good at, and it removes the class of "forgot to re-render X" bugs the vanilla app has.
- **No server and no SEO need:** the app is a private working tool with static data; SSR would
  need a server/runtime (or a static generation step) for no user-visible gain.
- **Shared state across views** (bookmarks, review status) is easier to keep consistent with one
  state tree + components than with hand-written DOM updates.
- **Course direction and ecosystem:** typed components with TS, React DevTools, testing
  libraries, and well-known patterns for routing/state that later exercises build on.

## Consequences / trade-offs (honest)

- **Bundle size:** the vanilla app is ~20 kB of JS (5.6 kB gzipped); the React page is
  ~228 kB (71 kB gzipped) for *less* functionality so far. On slow devices/connections the first
  paint gets later.
- **Blank page without JavaScript**, and nothing visible until the JS bundle is downloaded,
  parsed and executed (the vanilla app has the same problem, but its bundle is 10× smaller).
- **More concepts for the team:** components, props, hooks, effects, keys, StrictMode double
  effects, re-render rules.
- **Two apps during the migration** (`index.html` and `react.html`): duplicated logic for a while
  and data shared only through `localStorage`.
- **Dependency churn:** React, plugin and type packages need regular updates.

## Alternatives — why not

- **Server-rendered MPA:** loses instant view switching and all client state on every navigation
  (filters, open detail view); needs a server we don't have; every interaction would be a request.
  Gain: fast first paint, works without JS, simple. Not worth it for a single-user interactive tool.
- **Vanilla + router:** smallest bundle, no new concepts — but keeps the manual DOM syncing that
  caused the stale-dashboard bug and the "rebuild everything" updates.
- **Preact/Svelte/Lit:** similar benefits with a much smaller runtime (Preact ~4 kB). Would be the
  better pick if bundle size were a hard requirement. We lose React's ecosystem and the
  course's direction.
- **Next.js / SSR:** solves first paint and no-JS, but adds a server runtime or build-time
  rendering and much more complexity for a static, private, single-case tool.

## Revisit if…

…the app must work on very low-end devices / poor connections, must be indexable, or gains a real
backend with many cases — then consider SSR/SSG (or Preact to cut the bundle).
