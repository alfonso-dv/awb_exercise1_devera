import type { EvidenceId } from "../../../types.ts";

/**
 * Pure: returns a NEW array with `id` added or removed. The input array is
 * never changed, so React sees a different reference and re-renders.
 *
 * The result is frozen: if any code ever tries to mutate the bookmark state
 * (push, splice, sort, index assignment), it throws a TypeError right away
 * instead of silently skipping a re-render.
 */
export function toggleBookmarkId(
  bookmarks: readonly EvidenceId[],
  id: EvidenceId
): readonly EvidenceId[] {
  const next = bookmarks.includes(id)
    ? bookmarks.filter((b) => b !== id)
    : [...bookmarks, id];
  return Object.freeze(next);
}

/** Frozen copy for the initial state (same guarantee from the first render). */
export function frozenBookmarks(
  ids: readonly EvidenceId[]
): readonly EvidenceId[] {
  return Object.freeze([...ids]);
}
