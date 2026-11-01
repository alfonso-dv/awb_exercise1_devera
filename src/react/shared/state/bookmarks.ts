import type { EvidenceId } from "../../../types.ts";

/**
 * ❌ BROKEN ON PURPOSE (Exercise 5, Demo 3): the "first instinct" version.
 * It changes the array React already has and returns the SAME array.
 * (TypeScript's readonly type refuses push/splice, so it needs a cast —
 * that alone is a warning sign.)
 */
export function toggleBookmarkId(
  bookmarks: readonly EvidenceId[],
  id: EvidenceId
): EvidenceId[] {
  const list = bookmarks as EvidenceId[];
  const index = list.indexOf(id);
  if (index === -1) list.push(id);
  else list.splice(index, 1);
  return list;
}
