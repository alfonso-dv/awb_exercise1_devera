import type { MouseEvent } from "react";

interface BookmarkButtonProps {
  bookmarked: boolean;
  /** Used for the accessible label. */
  title: string;
  onToggle: () => void;
}

/** The ☆/★ toggle on an evidence card. */
export function BookmarkButton({
  bookmarked,
  title,
  onToggle
}: BookmarkButtonProps) {
  function handleClick(event: MouseEvent<HTMLButtonElement>): void {
    // The card around this button opens the detail view on click; a click on
    // the star should only toggle the bookmark, so stop it from bubbling up.
    event.stopPropagation();
    onToggle();
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
