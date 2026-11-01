// Read-only REST backend for the case data — DEVELOPMENT ONLY.
//
// Serves the same JSON files the static frontend uses (public/data/*.json)
// as GET endpoints, plus controls to simulate a slow or failing network.
// Not deployed: GitHub Pages only hosts the static frontend, which falls back
// to the static JSON files in production builds.
//
//   npm run api            (or: npm run dev:all — API + Vite together)
//
// Endpoints (all GET, all read-only):
//   /api/health
//   /api/case  /api/people  /api/locations  /api/evidence  /api/timeline
//   /api/evidence/:id      /api/people/:id
//
// Simulation query parameters (on any endpoint):
//   ?delay=2000     wait 2000 ms before answering
//   ?fail=500       answer with that HTTP status instead (any 4xx/5xx; "1" = 500)
//   &failOnly=evidence   ...but only for that resource (e.g. evidence, people)
//   ?empty=1        list endpoints answer with []            (empty state)
//   ?slow=E01       item endpoints: only delay the item with that id
//                   (with ?delay=…) — used to provoke request races
// Environment: API_PORT (default 3001), API_DELAY_MS (default delay for every
// request, default 0).

import express from "express";
import { readFile } from "node:fs/promises";

const PORT = Number(process.env.API_PORT ?? 3001);
const DEFAULT_DELAY_MS = Number(process.env.API_DELAY_MS ?? 0);
const DATA_DIR = new URL("../public/data/", import.meta.url);

/** resource name in the URL -> file in public/data */
const RESOURCES = {
  case: "case.json",
  people: "people.json",
  locations: "locations.json",
  evidence: "evidence.json",
  timeline: "timeline.json"
};

/** Read the file on every request, so edits to the JSON show up immediately. */
async function readResource(name) {
  const text = await readFile(new URL(RESOURCES[name], DATA_DIR), "utf8");
  return JSON.parse(text);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function numberParam(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

const app = express();

// Request log, so request order (and races) are visible in the terminal.
app.use((req, res, next) => {
  const started = Date.now();
  res.on("finish", () => {
    console.log(
      `${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - started} ms)`
    );
  });
  next();
});

// Simulation middleware: ?delay and ?fail apply to every endpoint
// (?slow narrows the delay to one item id, see the item routes).
app.use("/api", async (req, res, next) => {
  const slowId = typeof req.query.slow === "string" ? req.query.slow : "";
  const delay = numberParam(req.query.delay, DEFAULT_DELAY_MS);
  if (delay > 0 && !slowId) await sleep(delay);

  // req.path is relative to /api, e.g. "/evidence" or "/evidence/E01".
  const resource = req.path.split("/")[1] ?? "";
  const failOnly =
    typeof req.query.failOnly === "string" ? req.query.failOnly : "";
  const shouldFail =
    req.query.fail !== undefined && (failOnly === "" || failOnly === resource);

  if (shouldFail) {
    const status = numberParam(req.query.fail, 500);
    const code = status >= 400 && status <= 599 ? status : 500;
    res.status(code).json({ error: `Simulated failure (HTTP ${code})` });
    return;
  }
  next();
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/api/:resource", async (req, res, next) => {
  const name = req.params.resource;
  if (!(name in RESOURCES)) return next();

  const data = await readResource(name);
  res.json(req.query.empty !== undefined && Array.isArray(data) ? [] : data);
});

// Single items: evidence and people.
for (const resource of ["evidence", "people"]) {
  app.get(`/api/${resource}/:id`, async (req, res) => {
    const { id } = req.params;
    if (req.query.slow === id) {
      await sleep(numberParam(req.query.delay, 3000));
    }
    const items = await readResource(resource);
    const item = items.find((x) => x.id === id);
    if (!item) {
      res.status(404).json({ error: `No ${resource} item with id ${id}` });
      return;
    }
    res.json(item);
  });
}

app.use("/api", (req, res) => {
  res.status(404).json({ error: `Unknown endpoint ${req.path}` });
});

app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Case-data API (dev only) on http://localhost:${PORT}/api`);
});
