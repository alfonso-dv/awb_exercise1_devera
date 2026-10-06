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

---

# DEMO 3 — Production build & preview

`npm run build` (→ `vite build`) output:

```
dist/index.html                 11.04 kB │ gzip: 2.98 kB
dist/assets/index-ZAWMSz9M.css  11.44 kB │ gzip: 2.77 kB
dist/assets/index-Dm5yUGRh.js   24.26 kB │ gzip: 6.46 kB
```

`dist/` also contains `data/*.json` and `assets/people/*.png`, copied 1:1 from `public/`.

`npm run preview` (→ `vite preview`) serves `dist/`. The same scripted walkthrough as in Demo 2
gave identical results against the built output.

**Source vs. built output**

| | Dev (source) | Production (`dist/`) |
|---|---|---|
| JS | 7 files (`app.js` + `js/*.js`), 48,040 bytes, readable, comments | **1 file** `index-<hash>.js`, 24.26 kB, a single line |
| CSS | `styles.css`, 14,534 bytes, formatted | `index-<hash>.css`, 11.44 kB, a single line |
| Logo | `assets/logo/logo.svg` (separate request) | inlined into `index.html` as a `data:` URI (it is < 4 KB, Vite's `assetsInlineLimit`) |
| `index.html` | `<script type="module" src="app.js">` | `<script type="module" crossorigin src="./assets/index-<hash>.js">` + a `<link rel="stylesheet">` for the extracted CSS |

Example — `getStatusBadgeClass` in `js/utils.js` (11 lines with `if`s) becomes:

```js
...`badge-reviewed`:t===`flagged`?`badge-flagged`:`badge-unreviewed`},s=e=>(e||``).toLowerCase()===`relevant`?...
```

local names shortened (`status` → `t`), `if`/`return` turned into ternaries, whitespace and
comments removed, the export/import boundaries gone because everything is in one scope.

## Questions

### Three concrete transformations Vite applied

1. **Bundling:** 7 ES modules → one JS file; `import`/`export` between them are resolved at build
   time, so the browser makes 1 request instead of 7 (sequential) ones.
2. **Minification:** whitespace/comments removed, identifiers renamed, control flow rewritten
   (`if` → ternary, `true` → `!0`); 48 kB → 24 kB JS, CSS 14.5 kB → 11.4 kB.
3. **Content-hashed filenames:** `index-Dm5yUGRh.js`, `index-ZAWMSz9M.css`, and `index.html`
   rewritten to point to them.
4. **CSS extraction:** the CSS that was `import`ed from JS is pulled out into its own `.css` file
   and linked from `index.html` (in dev it was injected by JS).
5. **Asset inlining:** the small logo SVG was turned into a `data:` URI.

### Why do production filenames include a content hash?

So they can be cached **forever** (`Cache-Control: immutable`, long `max-age`). The hash is derived
from the file contents: when the code changes, the filename changes, `index.html` references the
new name and browsers fetch it; when it doesn't change, the cached copy keeps being used. Without
hashes you have to choose between short cache times (slow) and users running stale JS against new
HTML/data after a deployment (broken), or manually adding `?v=2` query strings.

### Why never deploy the dev server to users?

- It is not optimised: unbundled, unminified, one request per module, transforms on every request.
- It injects the HMR client and WebSocket — useless for users, extra attack surface.
- It exposes source files and its file system access is designed for a trusted local developer
  (there have been real CVEs where the dev server could be tricked into serving arbitrary files).
- It needs a Node process running permanently, while `dist/` is just static files any CDN or
  static host (GitHub Pages) can serve cheaply and reliably.

---

# DEMO 4 — `package.json` scripts: lint & format

**Tools:** ESLint 10 (flat config, `eslint.config.js`) with `@eslint/js` recommended rules plus
`eqeqeq`, `no-var`, `prefer-const`, `no-console` (warn, `console.warn/error` allowed);
Prettier 3 (`.prettierrc.json`, `.prettierignore`); `eslint-config-prettier` as the **last** config
entry so ESLint never reports formatting issues that Prettier owns.

**Scripts**

| Script | Command | What it does |
|---|---|---|
| `dev` | `vite` | dev server + HMR |
| `build` | `npm run typecheck && vite build` (type check added in Demo 5) | production build into `dist/` |
| `preview` | `vite preview` | serve `dist/` |
| `lint` | `eslint . --max-warnings 0` | report problems, **fail** on any (also warnings) |
| `lint:fix` | `eslint . --fix` | apply ESLint's automatic fixes |
| `format` | `prettier . --write` | rewrite files in Prettier style |
| `format:check` | `prettier . --check` | only report unformatted files (for CI) |

**Commits to show live**

1. `EX2 DEMO 4: Add ESLint and Prettier…` — `npm run lint` **fails**:
   ```
   app.js       192:7  warning  Unexpected console statement  no-console
   js/data.js   131:5  warning  Unexpected console statement  no-console
   js/events.js  13:7  warning  Unexpected console statement  no-console
   ESLint found too many warnings (maximum: 0).
   ```
   Real findings: debug `console.log`s left over from Exercise 1 (a nav click logger that did
   nothing else, the "First note preview" log, and a timeline load *error* logged with `log`).
2. `EX2 DEMO 4: Fix lint findings…` — removed the debug logs, timeline error → `console.error`.
3. `EX2 DEMO 4: Apply Prettier formatting` — `npm run format` changed 10 files
   (`render.js`: 1118 lines changed, e.g. the artificially wrapped
   `import {\n  state,\n  STORAGE_KEY_HYPOTHESIS\n} from "./state.js";` → one line).

**`lint:fix` live:** change `const s = (status || "")…` in `js/utils.js` to `let` → `npm run lint`
reports `'s' is never reassigned. Use 'const' instead  prefer-const` → `npm run lint:fix` rewrites
it back to `const`.

## Questions

### Linter vs formatter

A **formatter** only changes *how code looks* (whitespace, line breaks, quotes, trailing commas)
and never its meaning; it has no opinion on whether code is correct. A **linter** analyses *what
the code does* and finds likely bugs / bad practices (unused variables, `==` instead of `===`,
`var`, unreachable code, leftover `console.log`) — some auto-fixable, many not.
Concrete findings here: ESLint → `no-console` in `js/events.js` (debug logging left in);
`prefer-const` (see above). Prettier → `js/render.js` was reflowed (imports and expressions
artificially split over many lines were joined to fit the 80-column width), `index.html`
re-indented.

### Why `lint` and `lint:fix` separately?

Auto-fixing *modifies files*. In CI (Demo 8) we must only **check** — a CI job that fixed and then
passed would hide the problem and the fix would never reach the repository. Also locally, you
sometimes want to see the list of problems first (some "fixes" change behaviour, e.g. removing an
unused variable that was actually meant to be used), review them, and commit fixes deliberately.
The non-fixing version is also what a pre-commit hook or PR check should run.

### What does `npm run lint` actually do?

npm reads `scripts.lint` from `package.json` and runs that string in a shell, after **prepending
`node_modules/.bin` to `PATH`**. `eslint` there is a symlink installed by `npm install` that points
to the project's own ESLint version. So it uses exactly the version from the lockfile — not a
global one. If ESLint were only installed globally it would *still* run (the shell would find
the global binary on `PATH`), but: the version could differ between developers and CI,
`eslint.config.js` imports `@eslint/js`, `globals` and `eslint-config-prettier` which are resolved
from the project's `node_modules` and would be missing, and CI (fresh machine, `npm ci`) would not
have it at all. That's why linters belong in `devDependencies`.

---

# DEMO 5 — TypeScript setup & first conversions

**What I did**

- `npm install -D typescript@~6.0 typescript-eslint vite-plugin-checker`.
  I pinned TypeScript **6.0**, not the newest 7.x: `typescript-eslint` only supports
  `typescript >=4.8.4 <6.1.0`, so with 7.x `npm install` would have reported a peer-dependency
  conflict and the TS lint rules would be unsupported.
- Moved the modules from `js/` to `src/` (they are now sources for a build, not files served as-is).
- Converted the three smallest modules: **`src/state.ts`**, **`src/utils.ts`**,
  **`src/storage.ts`** — no `any` anywhere (also enforced by the ESLint rule
  `@typescript-eslint/no-explicit-any: error`). `src/types.ts` holds a *first-pass* domain model
  with only the fields these modules use (completed in Demo 6).
- Remaining `.js` modules keep working: `allowJs: true` lets TS/Vite import them, `checkJs: false`
  keeps them out of type checking until they are converted.
- Imports use explicit `.ts` extensions (`allowImportingTsExtensions`), which Vite resolves
  directly — also from the not-yet-converted `.js` files.

Before annotating, `tsc` reported 14 errors, all `TS7006: Parameter 'x' implicitly has an 'any'
type` (e.g. `formatDate(ts)`, `findEvidenceById(id)`, `saveNoteForEvidence(evidenceId, text)`).

**`tsconfig.json` choices**

| Setting | Value | Why |
|---|---|---|
| `strict` | **on** | New code base, no legacy TS to keep compiling — get every safety check from day one; turning it on later is much harder. |
| `noUnusedLocals` / `noUnusedParameters` | on | Dead code from Exercise 1 refactors shows up immediately. |
| `noImplicitReturns`, `noFallthroughCasesInSwitch` | on | Cheap, catch real logic mistakes. |
| `noUncheckedIndexedAccess` | **off** (deliberately) | Would type every `array[i]` / `record[key]` as `T \| undefined`. Most of our code is `for (let i = 0; i < arr.length; i++) arr[i]` where the index is in range, so it would force dozens of pointless checks during the migration. Revisit after converting loops to `for…of`. |
| `exactOptionalPropertyTypes` | off | Too pedantic for JSON-shaped data at this stage. |
| `noEmit`, `isolatedModules`, `verbatimModuleSyntax`, `erasableSyntaxOnly` | on | Vite (not `tsc`) produces the JS by stripping types file-by-file; these make sure every file *can* be transpiled in isolation (type-only imports must say `import type`, no `enum`/`namespace` which need real code generation). |
| `allowJs` / `checkJs` | on / off | Gradual migration. |

**Type errors in the tooling, not just the editor**

- `npm run typecheck` → `tsc -p tsconfig.json && tsc -p tsconfig.node.json` (app + `vite.config.ts`).
- `npm run build` → `npm run typecheck && vite build`: a type error **stops the build** (Vite on
  its own only strips types and would happily build broken code).
- `npm run dev` → `vite-plugin-checker` runs `tsc --watch` in the background and prints errors in
  the terminal + shows an overlay in the browser.

Demo: adding `const pageCount: number = state.currentPage;` to `navigateTo` →

```
src/utils.ts(92,9): error TS2322: Type 'string' is not assignable to type 'number'.
src/utils.ts(92,9): error TS6133: 'pageCount' is declared but its value is never read.
```

in `npm run build` (build aborted), and `ERROR(TypeScript)` + overlay in `npm run dev`.

## Questions

### What does `strict` turn on?

It is a shorthand for a family of flags (and any future strict flags): `noImplicitAny`,
`strictNullChecks`, `strictFunctionTypes`, `strictBindCallApply`, `strictPropertyInitialization`,
`noImplicitThis`, `useUnknownInCatchVariables`, `alwaysStrict`, `strictBuiltinIteratorReturn`.
The two that mattered most here:

- **`noImplicitAny`** — produced all 14 initial errors: an unannotated parameter is an error
  instead of silently becoming `any`.
- **`strictNullChecks`** — `null`/`undefined` are their own types. `findEvidenceById()` returns
  `Evidence | null`, so every caller must handle "not found"; `document.getElementById()` returns
  `HTMLElement | null` (this drives most of Demo 7).

I kept it on (see table above).

### Compile-time type errors vs the runtime bugs from Exercise 1 — could TS have caught them?

A type error is found by *reading the code* (static analysis) before it runs; a runtime bug only
shows up when a specific execution happens. Exercise 1 bugs:

- **Promise bug (Demo 3):** `const firstNote = loadNoteAsync("E01")` then using `firstNote` as a
  string — **yes**: `loadNoteAsync` returns `Promise<string>`, so passing it where a `string` is
  expected (e.g. `textarea.value = firstNote`) is a compile error.
- **Reference/mutation bug (Demo 2):** `filteredEvidence = allEvidence` then `.sort()` — **no**:
  both are `Evidence[]`, aliasing is perfectly well-typed. (Declaring `allEvidence` as
  `readonly Evidence[]` *would* make `.sort()` on it an error — but only if you think of it.)
- **Silent console-only bug:** depends on the bug; logic errors with correct types (wrong
  condition, wrong comparison value) are invisible to the type checker.

TypeScript catches *shape* mistakes (wrong type, missing property, possibly `null`, unawaited
Promise), not *logic* mistakes.

### What does `any` do, and why avoid it?

`any` switches type checking **off** for that value and everything derived from it: any property
access, call or assignment is allowed, and it spreads (`const x = anyValue.foo` is `any` too).
Using it to silence the 14 errors would have meant the converted modules give the rest of the app
*no* guarantees — the migration would just be renamed files. Where a value really is unknown
(`JSON.parse` of `localStorage`), I used **`unknown`** instead, which forces a check before use
(`isStringRecord()` in `storage.ts`).

---

# DEMO 6 — Typing the domain data

**What I did**

- `src/types.ts`: interfaces for every JSON file — `CaseInfo` (case.json), `Person`
  (people.json), `CaseLocation` (locations.json), `RawEvidence` / `Evidence` (evidence.json),
  `TimelineEvent` + `Certainty` union (timeline.json). Small aliases (`PersonId`, `LocationId`,
  `EvidenceId`, `IsoTimestamp`) document what each `string` means.
- `src/data.js` → **`src/data.ts`**: one generic `fetchJson<T>(url): Promise<T>` replaces the
  untyped `fetch().json()` calls, so `state.allPeople = await fetchJson<Person[]>(…)` is checked
  against `AppState`. It now also checks `res.ok` (before, a 404 page would have been passed to
  `.json()` and failed with a confusing parse error).
- Callback parameters of `loadAllData` are typed (`DataLoadCallbacks`).

I checked the real data first (script over all JSON files: which keys exist, which value types,
which distinct values) — all fields are always present, but several *values* are inconsistent:

| Field | Values found |
|---|---|
| `evidence.personIds` | ids like `"nova-byte"` **and** the display name `"Nova Byte"` (E04) |
| `evidence.status` | `"unreviewed"`, `"Reviewed"` |
| `evidence.relevance` | `"unknown"`, `"Unknown"` |
| `evidence.type` | `"test-report"` and `"Test-Report"` |
| `evidence.timestamp` | E08 is `2024-10-15…`, everything else 2026 |

**The ambiguous field: `evidence.personIds`**

The JS version never decided what an entry is. `evidenceMentionsPerson()` matched **both**
`person.id` and `person.name`, and the detail view fell back to printing the raw string when the
id lookup failed — so `"Nova Byte"` happened to work in both places.

When writing `personIds: PersonId[]` the type would have been a lie for E04, and writing
`personIds: string[] // id or name` would push the "which one is it?" check into every consumer
(filter, detail view, people counts, and any future code). I decided:

- **The app's model has exactly one meaning: a person *id*.** `RawEvidence.personIds` (the file
  format: "id or display name") is a separate type from `Evidence.personIds` (`PersonId[]`).
- The conversion happens in **one** place: `normalizeEvidence()` in `data.ts` resolves each
  reference by id, then by name, and warns about unknown references.
- `evidenceMentionsPerson()` became `ev.personIds.includes(person.id)`.

Behaviour is identical (Nova Byte's filter still shows 5 items incl. E04, E04's detail still lists
"Nova Byte"), but the "or name" case now exists in exactly one function instead of being an
implicit rule everywhere.

`status`/`relevance` are the second candidate: a union `"unreviewed" | "reviewed" | "flagged"`
would be the right model, but the UI currently *displays* the raw value (`Reviewed` with a
capital R), so normalising would change what users see. I kept them as `string` with a comment
("compared case-insensitively") and left that as a deliberate follow-up.

## Questions

### Walk through the ambiguous field

See above. JS "got away with it" because a `string` is a `string`: `indexOf(person.id) !== -1 ||
indexOf(person.name) !== -1` silently accepted both shapes, and the fallback `person ? person.name
: ev.personIds[p]` printed the raw value. Nobody had to write down what the field means.
TypeScript forced me to *name* the element type; there was no honest single type for the raw data,
so I had to choose: either model the union of meanings and handle it at every use, or convert once
at the boundary. I chose to convert once at the boundary (load time) and keep the in-app type
strict.

### A data-shape problem TypeScript can't catch on its own

Yes — everything that comes from `fetch()`: `fetchJson<Evidence[]>` is an *assertion*; TypeScript
cannot see the JSON file. If `evidence.json` had `"tags": "critical"` (string instead of array) or a
missing `locationIds`, it would compile fine and crash at runtime in `item.tags.join(" ")`.
The same for values: the E08 timestamp with year **2024** instead of 2026, `"Test-Report"` vs
`"test-report"` and `"Nova Byte"` are all valid `string`s. (`JSON.parse` of localStorage is the
same problem — that's why `storage.ts` treats it as `unknown`.)
To catch that you need **runtime validation** at the boundary: hand-written type guards
(`function isEvidence(x: unknown): x is RawEvidence`), or a schema library like **Zod/Valibot**
where you define the schema once, derive the TS type from it (`z.infer<typeof EvidenceSchema>`)
and `parse()` the fetched data. Plus tests / a JSON Schema check in CI for the data files.

### `interface` vs `type` alias

Both can describe an object shape and are interchangeable for most uses. Differences: `interface`
can be **extended** with `extends` and is **open** (declaration merging — declaring it twice adds
fields, used e.g. to extend `Window`); `type` can express things interfaces can't: unions
(`Certainty = "confirmed" | "reported" | "contradictory"`), mapped/conditional types, tuples,
aliases of primitives (`PersonId = string`). Error messages for interfaces are often shorter
because they're shown by name.
I used **`interface` for the object models** (`Person`, `Evidence extends Omit<RawEvidence,
"personIds">`, …) and **`type` for unions and aliases**. For this app it doesn't matter
functionally — it's a consistency convention.

---

# DEMO 7 — Full migration & resolving type errors

**What I did**

- Converted the rest: `src/render.js` → `render.ts`, `src/events.js` → `events.ts`,
  `app.js` → **`src/main.ts`** (`index.html` now loads `<script type="module" src="src/main.ts">`).
- Removed `allowJs` from `tsconfig.json` — there is no JavaScript left in `src/`.
- New `src/dom.ts`: `getElement(id, HTMLSelectElement)` / `findElement(...)` / `selectValue(id)`.
  They check at runtime that the element exists **and** has the expected type (`instanceof`), so
  callers get e.g. an `HTMLSelectElement` with `.value` — no `any`, no `!`, no blind `as` casts.
- Turned on **type-aware linting** (`tseslint.configs.recommendedTypeChecked`): rules such as
  `no-floating-promises` and `no-unsafe-*` need the type checker and catch things `tsc` alone
  does not.
- Result: `npm run typecheck` → **0 errors**, `npm run lint` → 0 problems, under the Demo 5
  strictness settings.

Just renaming the files produced **161 errors**:

| Code | Count | Meaning |
|---|---|---|
| TS2339 | 51 | property doesn't exist — `.value` on `HTMLElement`, `.getAttribute` on `EventTarget`, `window.navigateTo` |
| TS2531 / TS18047 | 76 | object is possibly `null` (`getElementById`, `e.target`) |
| TS7006 / TS7031 | 23 | implicit `any` parameters |
| TS2362 / TS2363 | 6 | arithmetic on `Date` objects |
| TS18046 | 1 | `resolvedTerm` is `unknown` |
| TS2322 / TS2345 | 2 | `string` not assignable to `ViewName`; `string \| null` passed as `string` |

**Behaviour check:** the scripted walkthrough (all views, filters, search, detail, notes, status,
bookmarks, people/locations, timeline + modal, workspace + hypothesis persistence) gives identical
results to the original JS version, both on `npm run dev` and on the built `npm run preview`.

**Spots I actually had to think about**

| # | Where | Compiler said | Verdict |
|---|---|---|---|
| 1 | `main.ts` startup: `loadAllData({...}).then(handleHashChange)` | `no-floating-promises` (type-aware lint) | **Real bug.** No `.catch`: if `case.json`/`people.json`/`locations.json` fail, the rejection is unhandled and the "Loading case file…" spinner stays **forever**. Verified in the browser by making `people.json` return HTTP 500: old JS → endless spinner + uncaught error; now → error logged and message "The case file could not be loaded. Please reload the page." |
| 2 | `loadHypothesisFromStorage()` | *nothing* at first — `JSON.parse()` returns `any`, so `draft.confidence` etc. were completely unchecked | **Real bug.** After typing the draft (`HypothesisDraft`) and parsing as `unknown`: `JSON.parse` of a corrupt `remotion_hypothesis` entry **threw** and broke the Workspace view (verified: 2 uncaught errors in the old version). Now `parseHypothesisDraft()` validates and falls back to an empty form. |
| 3 | same function: `hypConfidence.value = draft.confidence \|\| 50` | TS2322 `number` is not assignable to `string` | **Pedantic.** The DOM converts `50` to `"50"`. Fixed with `"50"` and documented that the stored value is a string. |
| 4 | `saveCurrentNote()`: `saveNoteForEvidence(textarea.getAttribute("data-evidence-id"), text)` | TS2345 `string \| null` not assignable to `string` | **Latent bug** (can't happen with today's markup): a missing attribute would save the note under the key `"null"`. Now returns early. |
| 5 | `handleHashChange()`: `if (validViews.indexOf(hash) === -1) hash = "dashboard"; state.currentPage = hash;` | TS2322 `string` not assignable to `ViewName` | **Pedantic but useful.** The JS logic was correct, but `indexOf` doesn't narrow types. Replaced with a type guard `isViewName(value): value is ViewName` derived from one `VIEW_NAMES` list. |
| 6 | sorting: `new Date(a.timestamp) - new Date(b.timestamp)` | TS2362/2363 arithmetic on `Date` | **Pedantic.** JS calls `valueOf()` implicitly. Made explicit with `.getTime()`. |
| 7 | `simulateAsyncSearch()` → `resolvedTerm` is `unknown` | TS18046 | **Pedantic/missing annotation.** `new Promise(resolve => …)` can't infer the value type; declared `Promise<string>`. |
| 8 | event handlers: `e.target.getAttribute(...)` | TS2339 / possibly `null` | **Mostly pedantic**, but it showed the fragility: `e.target` is the *innermost* element clicked (the bookmark button contains a `<span>` — it only works because of `pointer-events: none` in the CSS). I now use the button the listener was attached to (closure / `dataset`) or check `instanceof HTMLElement`. |

## Questions

### One type error I actually had to think about

`loadHypothesisFromStorage()` (#2/#3 above). Interestingly it showed **no error at all** until I
asked "what type is `draft`?" — `JSON.parse` returns `any`, which silently disabled checking for
the entire function. Typing it as `unknown` forced me to write down the real shape
(`HypothesisDraft`) and to handle "what if the stored value isn't that shape?" — which is exactly
the case that crashed the Workspace view for a corrupt localStorage entry. Plain JS review didn't
notice because the happy path always worked, and testing never used corrupt storage.

### When is `any` the right call during a migration?

Rarely, and only temporarily: e.g. for a huge legacy module you can't convert yet, at the boundary
to an untyped third-party library, or to get a first compile so the rest can be migrated — always
marked (`// TODO(types)`) and tracked. It's a smell when it's used to silence an error you don't
understand, for data you *could* describe (our JSON files), or for DOM elements (use the specific
element type). My line: **never `any` in this app** (`no-explicit-any` is an ESLint *error*); for
genuinely unknown input use `unknown` + a check; for "TypeScript can't know the HTML" use a
runtime-checked helper (`getElement`). The only assertions left are `fetchJson`'s `as T` (data
files we control, documented in Demo 6) and `parsed as Record<string, unknown>` right after an
`object`/`null` check.

### Did the migration reveal genuine bugs?

Yes, two real ones (both reproduced against the original JS in the browser, both fixed):
1. **Infinite loading spinner** when the core data fails to load (unhandled Promise rejection).
2. **Workspace crash** on a corrupt hypothesis draft in localStorage (`JSON.parse` throws).

Plus one latent one (note saved under `"null"` if the attribute were missing). The rest (Date
arithmetic, `ViewName`, `50` vs `"50"`, null checks on elements that always exist) were noise — I'm
confident because each of those spots behaves the same in JS at runtime (implicit conversion /
the elements are in `index.html`), which the identical before/after walkthrough confirms.

---

# DEMO 8 — GitHub Actions: development workflow

File: `.github/workflows/ci.yml`

- **Triggers:** `push` to any branch and `pull_request`.
- `actions/checkout@v5` → `actions/setup-node@v5` with `node-version-file: .nvmrc` (Node 22, same
  as locally) and **`cache: npm`** → `npm ci` → `npm run lint` → `npm run format:check` →
  `npm run typecheck`.
- `permissions: contents: read` (it never writes) and `concurrency` with `cancel-in-progress`
  (a newer push to the same branch cancels the outdated run).

**Failing → passing (Actions tab, workflow "CI"):**

1. `EX2 DEMO 8: Add CI workflow…` — run #1 ✅
2. `EX2 DEMO 8: Deliberately break lint and formatting` — added
   `var  debugView = viewName ;` + `console.log(...)` to `navigateTo()` → run #2 ❌, fails in the
   step **"Lint (ESLint)"**: `89:3 error Unexpected var, use let or const instead (no-var)`,
   `90:3 warning Unexpected console statement (no-console)`. Later steps are skipped.
3. `EX2 DEMO 8: Fix lint and formatting` — reverted → run #3 ✅

## Questions

### Workflow vs job vs step

- **Workflow** = the whole YAML file (`ci.yml`, `name: CI`): an automated process with its own
  triggers (`on:`).
- **Job** = a set of steps that runs on **one fresh runner VM** (`jobs: lint:` on
  `ubuntu-latest`). Jobs in a workflow run in parallel unless linked with `needs:` (see
  `deploy.yml`: `deploy` `needs: build`).
- **Step** = one command (`run: npm run lint`) or one reusable action
  (`uses: actions/setup-node@v5`) inside a job; steps run in order and share the job's file system.
  If one fails, the following steps are skipped and the job fails.

### Why run lint/format in CI if it runs locally too?

Because "could run locally" ≠ "did run": people forget, skip hooks (`--no-verify`), have a different
Node/ESLint version, or have uncommitted local config. CI is the single, neutral, reproducible
check (clean checkout + `npm ci` from the lockfile) that runs for *every* push and PR, so the main
branch can't silently accumulate problems, reviewers don't have to discuss formatting, and the
result is visible to everyone (green/red check on the commit/PR, can be required by branch
protection).

### What does dependency caching do?

`setup-node` with `cache: npm` saves npm's download cache (`~/.npm`) after a run, keyed on the hash
of `package-lock.json`, and restores it at the start of the next run. `npm ci` then installs from
the local cache instead of downloading every tarball again.
Without it: **correctness is unchanged** — `npm ci` still installs exactly the lockfile versions
(and still deletes/recreates `node_modules`), the cache only stores immutable tarballs verified by
their integrity hash. It is only **slower** (every run downloads all packages from the registry,
more network flakiness). When the lockfile changes, the key changes → cache miss → fresh download,
so it can't serve stale dependencies.

---

# DEMO 9 — GitHub Actions: deployment workflow

File: `.github/workflows/deploy.yml`

- **Triggers:** `push` to `main` (what is on `main` is what is live) + `workflow_dispatch`
  (manual redeploy button).
- **Job `build`:** checkout → setup Node 22 with npm cache → `npm ci` → `npm run lint` →
  `npm run format:check` → `npm run build` (= `tsc` type check + `vite build`) →
  `actions/upload-pages-artifact@v4` with `path: dist`.
- **Job `deploy`** (`needs: build`, environment `github-pages`): `actions/deploy-pages@v4`; the
  environment URL (shown in the run summary) is the live site.
- `vite.config.ts` uses `base: "./"`, so the built app works under the Pages sub-path
  `https://alfonso-dv.github.io/awb_exercise1_devera/` (relative URLs for JS/CSS and for
  `data/*.json`/avatars).

**One-time setup (repository settings):** *Settings → Pages → Build and deployment → Source:
**GitHub Actions***. (Without it `deploy-pages` fails with "Pages not enabled / Not Found".)

**Live demo:** merge to `main` → Actions tab: "Deploy to GitHub Pages" runs build → deploy → open
the URL and click through all views. Then make a visible change (e.g. a text in `index.html`),
push to `main`, wait for the run, reload the site → the change is live without any manual step.

## Questions

### Why does the deploy workflow re-run lint and build itself?

- What gets deployed must be built from **exactly this commit, in a clean environment** — not from
  someone's laptop with uncommitted files, a different Node version or a stale `node_modules`.
- A CI run on a feature branch checked a *different* commit; after merging, `main` is a new
  combination of changes (merge result) that has never been checked as a whole.
- Workflows don't share results by default; the Demo 8 run may also have been cancelled, may not
  have run at all (e.g. direct push), or may still be running. Making the deploy self-contained
  means a broken commit can never reach users, no matter what happened before. The extra minute
  of CI time is cheap compared to a broken production site.

### What is the mechanism used to publish to GitHub Pages?

The "artifact" based Pages deployment (no `gh-pages` branch):

1. `actions/upload-pages-artifact` packs `dist/` into a tar archive and uploads it as a workflow
   **artifact** named `github-pages`.
2. `actions/deploy-pages` requests a short-lived **OIDC token** from GitHub (that's why the
   workflow needs `id-token: write`), and calls the Pages API (`pages: write`) to create a
   deployment from that artifact. GitHub's Pages service then serves those files on
   `<user>.github.io/<repo>/`; the job is linked to the `github-pages` **environment**, which
   records the deployment history and URL.

No commit is made anywhere; `contents` stays read-only.

### What would change for a different static host?

**Stays the same:** trigger, checkout, Node setup, `npm ci`, lint, type check, `vite build`
producing `dist/` — the build is host-independent.
**Changes:** only the publish step(s) and the credentials:

- **Netlify / Vercel:** replace upload/deploy-pages with their CLI or action
  (`netlify deploy --prod --dir=dist`, `vercel deploy --prebuilt --prod`), authenticated with a
  token stored as an encrypted **repository secret** (`NETLIFY_AUTH_TOKEN`, `VERCEL_TOKEN`);
  `pages`/`id-token` permissions no longer needed. (Both can also build on their own servers from
  the Git repo, then the workflow only does CI.)
- **Plain server via SFTP/rsync:** an SSH key as a secret + a step like
  `rsync -avz --delete dist/ user@host:/var/www/app/` (or an SFTP action); configure the web server
  to cache hashed `assets/` long-term and not cache `index.html`.
- `base` in `vite.config.ts` may change if the app is served at the domain root (`/`).

---

# DEMO 10 — Triggers, permissions & failure modes

**A failure that blocks deployment (to run live on `main`):** commit e.g. a type error
(`const pageCount: number = state.currentPage;` in `navigateTo`) and push to `main` →
"Deploy to GitHub Pages" run fails in job **build**, step **"Build (type check + vite build)"**
with `error TS2322: Type 'string' is not assignable to type 'number'` → job **deploy** is
**skipped** (`needs: build`), the site keeps serving the previous version. Revert → green →
deployed. The same commit also turns "CI" red (step "Type check (tsc)").
(The lint variant was already shown in Demo 8, run #2: the job stops at the first failing step.)

**Reading a failed run's log:** Actions tab → the red run → job → the step with the red ✗ is
expanded; the error lines (file:line, rule/TS error code) are at the end; everything after it is
greyed out "skipped". GitHub also adds an annotation with the error to the run summary.

**Permissions/secrets the deploy needs** (all visible in `deploy.yml`):

| What | Where | Why |
|---|---|---|
| `contents: read` | `permissions:` in `deploy.yml` | checkout the code |
| `pages: write` | `permissions:` in `deploy.yml` | create the Pages deployment |
| `id-token: write` | `permissions:` in `deploy.yml` | OIDC token used by `deploy-pages` to authenticate |
| Pages source = GitHub Actions | Settings → Pages | allow artifact deployments |
| `github-pages` environment | Settings → Environments (auto-created) | deployment history; can restrict deploys to `main` (deployment branch rule) |

**No secrets** are needed: the job uses the automatic, short-lived `GITHUB_TOKEN` (scoped by
`permissions:`) and OIDC. `ci.yml` only gets `contents: read`.

## Questions

### When the build fails, what happens to the live app?

It **stays live, unchanged** — the last successful deployment keeps being served. The deploy job
never starts (`needs: build`), so nothing is uploaded or replaced. That's the desired behaviour:
users keep a working (slightly older) version instead of a broken one or no site at all, and the
red run tells the team to fix it. (`concurrency: pages` with `cancel-in-progress: false` also means
a deployment already in progress is never cut off halfway.)

### Which permissions/secrets, and the risk of over-granting?

See the table: `contents: read`, `pages: write`, `id-token: write`, no stored secrets. Granted in
the workflow's top-level `permissions:` key (which overrides the repository default for the
`GITHUB_TOKEN`), plus the Pages source setting.
Risk of over-granting (e.g. `permissions: write-all`, or a broad personal access token as a secret):
every step — including third-party actions and every npm package's install/build scripts — runs
with that token. A compromised dependency or action could then push commits (even to `main`),
change releases, modify workflow files, or deploy arbitrary content to the site under our
domain. Least privilege limits the blast radius: with `contents: read` it can't change the
repository at all.

### `on: push` vs `on: pull_request` vs `on: workflow_dispatch`

- **`push`** — runs on the pushed commit of a branch (optionally filtered by `branches:`).
- **`pull_request`** — runs when a PR is opened/updated, on the **merge result** of PR head + base
  branch, and shows the result on the PR. For PRs from forks it runs with a read-only token and no
  secrets.
- **`workflow_dispatch`** — runs only when someone clicks "Run workflow" (or calls the API); can
  take inputs.

**Dev workflow (Demo 8): `push` (all branches) + `pull_request`** — feedback on every change as
early as possible, and a check on the PR that reviewers/branch protection can rely on.
**Deploy workflow (Demo 9): `push` to `main` + `workflow_dispatch`** — only reviewed, merged code
on `main` may go live, never a work-in-progress branch or an unmerged PR (and PR runs must not get
`pages: write`); the manual trigger allows redeploying (e.g. after enabling Pages or a hosting
hiccup) without a dummy commit.

---

## Summary of the final setup

```
npm run dev           # Vite dev server + HMR + live type checking
npm run typecheck     # tsc (app + vite.config.ts)
npm run build         # typecheck + vite build → dist/
npm run preview       # serve dist/
npm run lint          # ESLint (type-aware), fails on any warning
npm run lint:fix      # ESLint autofix
npm run format        # Prettier write
npm run format:check  # Prettier check (CI)
```

Workflows: `.github/workflows/ci.yml` (every push/PR), `.github/workflows/deploy.yml` (push to
`main` / manual → GitHub Pages).

Note: the first CI runs used `actions/checkout@v4`/`setup-node@v4`, which printed a "Node.js 20
is deprecated" warning in the logs; both workflows now use `@v5` (Node 24 based).
