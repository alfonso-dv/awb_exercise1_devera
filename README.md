# Project ReMotion – Investigation Portal

Investigate the failure of an AI-assisted rehabilitation robot.

## About

Project ReMotion is a browser-based investigation platform built around a fictional incident.
During a pre-demonstration calibration test, the AI-assisted rehabilitation robot **ReMotion**
loaded the wrong calibration profile and triggered its emergency stop. This application lets an
investigator review the evidence, people, locations, and timeline surrounding the incident, and
build up a working hypothesis about what happened.

This repository contains an existing vanilla-JavaScript (no frameworks used) investigation application. The system is
functional but has accumulated technical debt and inconsistent implementation decisions. Your task
during the course will be to analyse, maintain, refactor, migrate, and extend it.

## Running the application

The project is managed with **npm** and built with **Vite**. You need Node.js 22.12+ (see `.nvmrc`).

```bash
npm ci            # install exact versions from package-lock.json
npm run dev       # Vite dev server with HMR (http://localhost:5173)
npm run build     # type-check (tsc) + production build into dist/
npm run preview   # serve the built dist/ locally
```

During the React migration there are two pages: `index.html` is the complete vanilla TypeScript
app, and `react.html` is the React version (application shell + Dashboard so far; the other views
link back to the vanilla app).

Static files that are fetched at runtime (`data/*.json`, person avatars) live in `public/` and are
copied unchanged into `dist/`.

## Code quality & CI/CD

```bash
npm run lint          # ESLint (fails on any warning)  | npm run lint:fix
npm run format:check  # Prettier check                 | npm run format
npm run typecheck     # TypeScript (strict)
```

- `.github/workflows/ci.yml` runs lint, format check and type check on every push and pull request.
- `.github/workflows/deploy.yml` builds and deploys `dist/` to GitHub Pages on every push to `main`
  (requires *Settings → Pages → Source: GitHub Actions*).

## Features

- **Dashboard** — case summary and key statistics calculated from the loaded case data.
- **Evidence catalogue** — search, filter (by type, person, location, status, relevance), sort,
  bookmark, and open detailed evidence records.
- **People & Locations** — profile cards for the investigation team and the six key locations.
- **Timeline** — chronological view of case events with filtering and links to related evidence.
- **Investigator workspace** — bookmarked evidence, personal notes, and a hypothesis draft form.
  Workspace data is saved to your browser's local storage and will still be there when you reload
  the page.

## Browser requirements

A recent version of any evergreen desktop browser (Chrome, Firefox, Edge, Safari). JavaScript must
be enabled. The layout targets common desktop and tablet widths.

## Project status

This is an existing brownfield application, not a fresh scaffold. It works for everyday use, but
you should expect to find rough edges, inconsistent patterns, and a handful of bugs as you work
with it — that discovery process is part of the course.
