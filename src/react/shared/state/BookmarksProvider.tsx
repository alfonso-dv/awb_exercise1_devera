import { useEffect, useState, type ReactNode } from "react";
import type { EvidenceId } from "../../../types.ts";
import { readStoredBookmarks, writeStoredBookmarks } from "../../../storage.ts";
import { STORAGE_KEY_BOOKMARKS } from "../../../state.ts";
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

  // Subscription: when ANOTHER tab (e.g. the vanilla app, or a second React
  // tab) changes the bookmarks in localStorage, the browser fires a "storage"
  // event in this tab. Re-read and update, so this tab never shows a stale
  // bookmark list. The cleanup removes the listener when the provider
  // unmounts (and before StrictMode's dev re-run), so there is never more
  // than one listener.
  useEffect(() => {
    function handleStorage(event: StorageEvent): void {
      if (event.key === STORAGE_KEY_BOOKMARKS || event.key === null) {
        setBookmarks(frozenBookmarks(readStoredBookmarks()));
      }
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

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
