import { useSyncExternalStore } from "react";
import { isViewName, type ViewName } from "../../state.ts";

/** What the shell should render for the current URL hash. */
export type Route =
  { kind: "view"; view: ViewName } | { kind: "notFound"; requested: string };

/** Pure function: URL hash -> Route. "" (no hash) means the dashboard. */
export function parseRoute(hash: string): Route {
  const requested = hash.replace(/^#/, "");

  if (requested === "") return { kind: "view", view: "dashboard" };
  if (isViewName(requested)) return { kind: "view", view: requested };

  return { kind: "notFound", requested };
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

function getHash(): string {
  return window.location.hash;
}

/**
 * The URL hash is the single source of truth for "which view is shown".
 * useSyncExternalStore subscribes to the browser's hashchange event and
 * re-renders the component whenever the hash changes — including changes made
 * by the back/forward buttons or by typing a URL.
 */
export function useHashRoute(): Route {
  const hash = useSyncExternalStore(subscribe, getHash);
  return parseRoute(hash);
}

/** Navigating = changing the hash; the hook above does the rest. */
export function navigate(view: ViewName): void {
  window.location.hash = view;
}
