import type { MouseEvent } from "react";
import type { EvidenceId } from "../../../../types.ts";
import { useBookmarks } from "../../../shared/state/bookmarksContext.ts";

interface BookmarkButtonProps {
  evidenceId: EvidenceId;
  /** Used for the accessible label. */
  title: string;
}

/**
 * The ☆/★ toggle on an evidence card. Reads and changes the bookmark state
 * directly from BookmarksContext — the components above it (EvidencePage,
 * EvidenceList, EvidenceCard) no longer pass bookmark props through.
 */
export function BookmarkButton({ evidenceId, title }: BookmarkButtonProps) {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const bookmarked = isBookmarked(evidenceId);

  function handleClick(event: MouseEvent<HTMLButtonElement>): void {
    // The card around this button opens the detail view on click; a click on
    // the star should only toggle the bookmark, so stop it from bubbling up.
    event.stopPropagation();
    toggleBookmark(evidenceId);
  }

  return (
    <button
      type="button"
      className={bookmarked ? "bookmark-btn active" : "bookmark-btn"}
      aria-label={`Toggle bookmark for ${title}`}
      aria-pressed={bookmarked}
      onClick={handleClick}
    >
      <span className="bookmark-icon">{bookmarked ? "★" : "☆"}</span>
    </button>
  );
}
