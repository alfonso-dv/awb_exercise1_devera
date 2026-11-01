// Low-level HTTP access for the case-data API. Knows HOW to talk to the
// backend (base URL, data source, error handling) — nothing about React.

/** A request that reached the server but got an error status back. */
export class ApiError extends Error {
  readonly status: number;
  readonly url: string;

  constructor(status: number, url: string) {
    super(`Request to ${url} failed with HTTP ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.url = url;
  }
}

export type DataSource = "api" | "static";

/** "api" while developing (Vite proxies /api to the Node server), "static" on GitHub Pages. */
export const DATA_SOURCE: DataSource =
  import.meta.env.VITE_DATA_SOURCE ?? (import.meta.env.DEV ? "api" : "static");

/**
 * Dev-only simulation parameters that are copied from the page URL to every
 * API request, e.g. react.html?delay=2000#/evidence makes every request slow.
 * (Handled by the backend; see server/index.mjs.)
 */
const SIMULATION_PARAMS = [
  "delay",
  "fail",
  "failOnly",
  "empty",
  "slow"
] as const;

function simulationQuery(): string {
  if (DATA_SOURCE !== "api") return "";
  const page = new URLSearchParams(window.location.search);
  const forwarded = new URLSearchParams();
  for (const name of SIMULATION_PARAMS) {
    const value = page.get(name);
    if (value !== null) forwarded.set(name, value);
  }
  const query = forwarded.toString();
  return query ? `?${query}` : "";
}

/**
 * GET a JSON resource and return it as T.
 *
 * `path` is the API path without "/api", e.g. "evidence" or "evidence/E01".
 * Throws ApiError for HTTP error statuses, a TypeError for network failures
 * (e.g. backend not running), and an AbortError if `signal` is aborted.
 *
 * NOTE: `as T` trusts the server's response shape (see Exercise 2, Demo 6).
 */
export async function getJson<T>(
  path: string,
  signal?: AbortSignal
): Promise<T> {
  const url = `api/${path}${simulationQuery()}`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new ApiError(res.status, url);
  return (await res.json()) as T;
}

/** GET one of the static files in public/data (production fallback). */
export async function getStaticJson<T>(
  file: string,
  signal?: AbortSignal
): Promise<T> {
  const url = `data/${file}`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new ApiError(res.status, url);
  return (await res.json()) as T;
}
