import type { EvidenceId } from "../../../types.ts";

/**
 * Pure: returns a NEW array with `id` added or removed. The input array is
 * never changed, so React sees a different reference and re-renders.
 */
export function toggleBookmarkId(
  bookmarks: readonly EvidenceId[],
  id: EvidenceId
): EvidenceId[] {
  return bookmarks.includes(id)
    ? bookmarks.filter((b) => b !== id)
    : [...bookmarks, id];
}
