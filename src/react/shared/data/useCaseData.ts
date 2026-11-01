import { useEffect, useState } from "react";
import { loadCaseData, type CaseData } from "./loadCaseData.ts";

/**
 * The three possible states of the request, as ONE value: exactly one of them
 * is true at any time, and the UI is chosen from it. There is no separate
 * "hide the spinner" step that a code path could forget.
 */
export type CaseDataState =
  | { status: "loading" }
  | { status: "error"; error: unknown }
  | { status: "ready"; data: CaseData };

export interface CaseDataResult {
  state: CaseDataState;
  /** Load again (e.g. after an error). */
  retry: () => void;
}

/**
 * Loads the case data when the component using it mounts (and again on
 * retry).
 *
 * Used by <AppLayout />, which never unmounts, so the data survives
 * navigation between views. This is read-only case data; what the
 * investigator changes (bookmarks, notes, review edits) is separate state
 * owned by AppLayout / BookmarksProvider.
 */
export function useCaseData(): CaseDataResult {
  const [state, setState] = useState<CaseDataState>({ status: "loading" });
  // Changing this number re-runs the effect below (it's a dependency).
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    // StrictMode runs effects twice in dev; ignore the result of a run whose
    // cleanup already happened.
    let cancelled = false;

    loadCaseData()
      .then((data) => {
        if (!cancelled) setState({ status: "ready", data });
      })
      .catch((error: unknown) => {
        console.error("Failed to load the case file", error);
        if (!cancelled) setState({ status: "error", error });
      });

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  function retry(): void {
    setState({ status: "loading" });
    setAttempt((n) => n + 1);
  }

  return { state, retry };
}
