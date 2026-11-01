import { createContext, useContext } from "react";
import type { EvidenceId } from "../../../types.ts";

export interface BookmarksValue {
  /** Bookmarked evidence ids — the single source of truth for bookmarks. */
  bookmarks: readonly EvidenceId[];
  isBookmarked: (id: EvidenceId) => boolean;
  toggleBookmark: (id: EvidenceId) => void;
}

/** null = no <BookmarksProvider> above the component (a programming error). */
export const BookmarksContext = createContext<BookmarksValue | null>(null);

/** Read the bookmark state from the nearest <BookmarksProvider>. */
export function useBookmarks(): BookmarksValue {
  const value = useContext(BookmarksContext);
  if (!value) {
    throw new Error("useBookmarks() must be used inside <BookmarksProvider>");
  }
  return value;
}
