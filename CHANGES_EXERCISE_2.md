# Exercise 2 — Change log & answers

Running notes for Exercise 2 (build tooling, TypeScript, CI/CD). Each demo has its own commit(s)
prefixed with `EX2 DEMO n`, so every step can be diffed live with
`git log --oneline` / `git show <hash>`.

---

# DEMO 1 — Package manager & project metadata

**What I did**

- Chose **npm**.
- `npm init` → filled in `name`, `version`, `description`, `repository`, `author`, `license`.
  Later additions: `"private": true` (this is an app, it must never be published to the npm
  registry by accident), `"type": "module"` (all our code is ES modules), `"engines"` and
  `.nvmrc` (Node 22, the same version CI uses).
- `.gitignore` contains `node_modules/` and `dist/` (Vite's build output, Demo 3).
- Installed the first real dependency: `npm install -D vite`. `package-lock.json` is committed.

**Why npm over pnpm**

npm ships with Node.js, so every teammate, the lecturer's machine and the GitHub Actions runner
already have it — zero extra setup. The project is tiny (a handful of dev dependencies), so
pnpm's disk-space and speed advantages are not noticeable here, while an extra tool would be
one more thing that can differ between machines.

## Questions

### What problem does a package manager solve that "download it into a folder" doesn't?

- **Transitive dependencies:** Vite alone pulls in ~15 other packages (rolldown, postcss,
  esbuild-style native binaries per OS/CPU…). Doing that by hand means finding every one of them in
  a compatible version.
- **Version resolution:** `package.json` states a *range* (`^8.3.0`), the package manager finds a
  set of versions that satisfies every package's ranges at once.
- **Reproducibility:** the lockfile records the exact resolved tree, so `npm ci` recreates it
  byte-for-byte on another machine/CI.
- **Updates & security:** `npm outdated`, `npm update`, `npm audit` instead of re-downloading and
  diffing folders manually.
- **Scripts:** a standard place (`npm run …`) to define how to build/lint/test the project.
- **Integrity:** every tarball is checked against a hash stored in the lockfile.

### `dependencies` vs `devDependencies`

`dependencies` are needed **at runtime** by the shipped code; `devDependencies` are only needed to
**develop/build** it. Vite, ESLint, Prettier and TypeScript are all `devDependencies`: they run on
the developer's machine or in CI and produce `dist/`, but none of their code ends up in the
browser bundle. This app currently has **no** runtime `dependencies` at all — it is vanilla
TS/DOM code. (For an app that is bundled, the split mostly documents intent; for a published
library it decides what consumers have to install.)

### What is a lockfile for, and what could go wrong without it?

`package-lock.json` pins the exact version (and integrity hash) of every package in the whole
tree. Without it, `npm install` resolves `^8.3.0` to "whatever is newest today", so:

- a teammate cloning next week could get Vite 8.4 / a new ESLint minor with different rules →
  "works on my machine" bugs and lint results that differ between people;
- CI could silently start failing (or worse, passing with a different build) when an upstream
  package publishes a new version;
- a compromised new release of some transitive package would be pulled in automatically.

CI uses `npm ci`, which *requires* the lockfile and fails if it doesn't match `package.json`.

### npm chosen: what would I gain/lose by switching to pnpm on a larger project?

Gain: pnpm stores each package version once in a global content-addressable store and hard-links
it into projects → much less disk usage and faster installs across many projects; its strict,
non-flat `node_modules` prevents code from importing packages that are not declared in
`package.json` ("phantom dependencies"); good monorepo/workspace support.
Lose: one more tool to install (or enable via corepack) on every machine and CI; some older tools
assume npm's flat `node_modules` layout and break under pnpm's strictness; the team needs to learn
slightly different commands.

---

# DEMO 2 — Vite as the dev server

**What I changed**

- `public/data/*.json` and `public/assets/people/*.png` (moved from `data/` and `assets/people/`):
  these files are **fetched at runtime** by path (`fetch("data/case.json")`, avatar `src` values
  inside `people.json`). Vite cannot see such paths at build time, so they must go into `public/`,
  which Vite serves as-is in dev and copies unchanged into `dist/`.
- `assets/logo/logo.svg` stays where it is: it is referenced directly in `index.html`, so Vite
  *can* see it and will process it (hash its filename) during the build.
- `vite.config.js` with `base: "./"` so the built app uses relative URLs and works both at `/` and
  under the GitHub Pages sub-path `/awb_exercise1_devera/` (Demo 9).
- `styles.css` is now imported from the entry module (`import "./styles.css"` in `app.js`) instead
  of a `<link>` tag, so Vite manages it (CSS HMR in dev, bundling/minification in build).
- Scripts: `npm run dev` → `vite`.

**Verifying every view** — I ran the same scripted walkthrough (headless browser) against the old
static-server version and the Vite dev server: dashboard stats, evidence list/filters/search/sort,
detail view with notes + status change + bookmark, people & locations tabs (avatars load), timeline
+ quick-view modal + "open full evidence", workspace bookmarks/notes/hypothesis, and persistence
after reload. The results were identical, with no console errors or 404s.

**HMR** — with the app open on the evidence detail view and unsaved text typed into the note
textarea, I changed a rule in `styles.css`:

- the console showed `[vite] hot updated: /styles.css`, the new style appeared immediately,
- the page was **not** reloaded: the typed (unsaved) note text, the open detail panel and a test
  variable I put on `window` were all still there.

Changing a **JS** module (`js/utils.js`) instead caused a **full page reload** (state gone): our
modules don't declare `import.meta.hot.accept()`, so there is no HMR boundary and Vite falls back
to reloading.

## Questions

### Plain static server vs Vite dev server

A static server (`python -m http.server`, Live Server) just returns files from disk. Vite's dev
server additionally:

- **transforms files on request** — e.g. TypeScript → JS (Demo 5), `import "./styles.css"` → a JS
  module that injects the CSS, bare imports like `import "vite/client"` rewritten to real URLs;
- runs a **WebSocket HMR channel** to push updates to the browser without reloading;
- shows compile errors as an **overlay** in the page;
- serves `public/` at the root and resolves `index.html` as the entry of a module graph it
  understands (the same graph it later bundles for production).

### What is HMR and what did I observe?

Hot Module Replacement swaps a changed module in the *running* page instead of reloading it. For
the CSS change the new styles appeared instantly and app state (open detail view, unsaved
textarea text, JS variables) survived. For a JS change without an accept handler, Vite could not
safely swap the module and did a full reload, which reset the state.

### Why do ES modules (Exercise 1) integrate naturally with Vite?

Vite's dev server *is* a native-ESM server: the browser requests each `import`ed file and Vite
transforms it individually. With explicit `import`/`export`, Vite knows the exact dependency graph
→ it knows which modules a change affects (HMR) and what to bundle/tree-shake in production. The
original single `<script>` relied on globals and implicit load order, which a bundler cannot
analyse (it would have to treat the whole file as one opaque blob, and nothing could be swapped
independently).
