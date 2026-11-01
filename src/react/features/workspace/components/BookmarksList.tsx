import { Link } from "react-router";
import type { Evidence, EvidenceId } from "../../../../types.ts";
import { EmptyState } from "../../../shared/components/EmptyState.tsx";

interface BookmarksListProps {
  items: readonly Evidence[];
  onToggleBookmark: (id: EvidenceId) => void;
}

export function BookmarksList({ items, onToggleBookmark }: BookmarksListProps) {
  if (items.length === 0) {
    return (
      <EmptyState>
        No bookmarked evidence yet. Bookmark items from the Evidence view.
      </EmptyState>
    );
  }

  return (
    <div className="bookmarks-list">
      {items.map((ev) => (
        <div key={ev.id} className="mini-list-item">
          <strong>{ev.id}</strong> &mdash; {ev.title}{" "}
          <Link
            to={`/evidence/${encodeURIComponent(ev.id)}`}
            className="btn btn-small btn-secondary"
          >
            Open
          </Link>{" "}
          <button
            type="button"
            className="btn btn-small btn-secondary"
            onClick={() => onToggleBookmark(ev.id)}
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}
