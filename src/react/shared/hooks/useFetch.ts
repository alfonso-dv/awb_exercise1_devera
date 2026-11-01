import { useEffect, useEffectEvent, useState } from "react";

/** One request's state — exactly one of these at a time. */
export type FetchState<T> =
  | { status: "loading" }
  | { status: "error"; error: unknown }
  | { status: "success"; data: T };

export interface FetchResult<T> {
  state: FetchState<T>;
  /** Load again (e.g. after an error). */
  retry: () => void;
}

/** A finished request, remembered with the key + attempt it was for. */
type Finished<T> = { key: string; attempt: number } & (
  { status: "error"; error: unknown } | { status: "success"; data: T }
);

/**
 * Teaching switch for Exercise 6, Demo 7 (dev only): add ?unsafeRace to the
 * page URL to turn cancellation OFF and see the request race again.
 */
function unsafeRaceMode(): boolean {
  return (
    import.meta.env.DEV &&
    new URLSearchParams(window.location.search).has("unsafeRace")
  );
}

/**
 * Reusable data loading: loading / error / success state, cancellation and
 * retry, for any async `load` function.
 *
 * - `key` identifies WHAT is loaded (e.g. "evidence/E01"). When it changes,
 *   the previous request is aborted and the new one starts.
 * - `load` gets an AbortSignal and must pass it on to fetch (the API layer
 *   functions do).
 *
 * The state is never set synchronously inside the effect: a result counts
 * only for the key/attempt it was requested for — anything else is "loading".
 */
export function useFetch<T>(
  key: string,
  load: (signal: AbortSignal) => Promise<T>
): FetchResult<T> {
  const [attempt, setAttempt] = useState(0);
  const [finished, setFinished] = useState<Finished<T> | null>(null);
  const unsafe = unsafeRaceMode();

  // Always calls the latest `load` passed in, without making `load` (a new
  // function on every render) a dependency of the effect below.
  const runLoad = useEffectEvent((signal: AbortSignal) => load(signal));

  useEffect(() => {
    const controller = new AbortController();

    runLoad(controller.signal)
      .then((data) => setFinished({ key, attempt, status: "success", data }))
      .catch((error: unknown) => {
        // Aborted on purpose (key changed, retry, unmount): not an error.
        if (controller.signal.aborted) return;
        console.error(`Loading ${key} failed`, error);
        setFinished({ key, attempt, status: "error", error });
      });

    // Cleanup — runs before the effect re-runs (new key / retry) and on
    // unmount: cancels the HTTP request, so an outdated response can never
    // be applied.
    return () => {
      if (!unsafe) controller.abort();
    };
  }, [key, attempt, unsafe]);

  const current =
    finished !== null &&
    (unsafe || (finished.key === key && finished.attempt === attempt));

  let state: FetchState<T> = { status: "loading" };
  if (current && finished.status === "success") {
    state = { status: "success", data: finished.data };
  } else if (current && finished.status === "error") {
    state = { status: "error", error: finished.error };
  }

  return { state, retry: () => setAttempt((n) => n + 1) };
}
