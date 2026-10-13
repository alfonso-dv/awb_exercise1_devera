import { useEffect, useState } from "react";
import { loadCaseData, type CaseData } from "./loadCaseData.ts";

export type CaseDataState =
  | { status: "loading" }
  | { status: "error"; error: unknown }
  | { status: "ready"; data: CaseData };

/**
 * Loads the case data once when the component using it mounts.
 *
 * Used by <App />, which never unmounts, so the data survives navigation
 * between views. Placeholder architecture for Exercise 3: once views can
 * *change* data (bookmarks, review status, notes), this will move into a
 * shared store/context with update functions.
 */
export function useCaseData(): CaseDataState {
  const [state, setState] = useState<CaseDataState>({ status: "loading" });

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
  }, []);

  return state;
}
