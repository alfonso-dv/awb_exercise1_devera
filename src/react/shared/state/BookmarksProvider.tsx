import { useState, type ReactNode } from "react";
import type { EvidenceId } from "../../../types.ts";
import { readStoredBookmarks, writeStoredBookmarks } from "../../../storage.ts";
import { frozenBookmarks, toggleBookmarkId } from "./bookmarks.ts";
import { BookmarksContext, type BookmarksValue } from "./bookmarksContext.ts";

interface BookmarksProviderProps {
  children: ReactNode;
}

/**
 * Owns the bookmark state and makes it (plus the toggle function) available
 * to every component below it via useBookmarks() — no props needed on the way
 * down. Placed in AppLayout, i.e. still at the lowest common owner of all
 * components that use bookmarks.
 */
export function BookmarksProvider({ children }: BookmarksProviderProps) {
  // Lazy initialiser: localStorage is read once, on the first render only.
  const [bookmarks, setBookmarks] = useState<readonly EvidenceId[]>(() =>
    frozenBookmarks(readStoredBookmarks())
  );

  function toggleBookmark(id: EvidenceId): void {
    const next = toggleBookmarkId(bookmarks, id);
    setBookmarks(next);
    writeStoredBookmarks(next);
  }

  const value: BookmarksValue = {
    bookmarks,
    isBookmarked: (id) => bookmarks.includes(id),
    toggleBookmark
  };

  return <BookmarksContext value={value}>{children}</BookmarksContext>;
}
