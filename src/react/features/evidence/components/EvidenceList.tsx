import type { Evidence, EvidenceId } from "../../../../types.ts";
import { EmptyState } from "../../../shared/components/EmptyState.tsx";
import { EvidenceCard } from "./EvidenceCard.tsx";

interface EvidenceListProps {
  items: readonly Evidence[];
  bookmarks: readonly EvidenceId[];
  selectedId: EvidenceId | undefined;
  onToggleBookmark: (id: EvidenceId) => void;
  onOpen: (id: EvidenceId) => void;
}

export function EvidenceList({
  items,
  bookmarks,
  selectedId,
  onToggleBookmark,
  onOpen
}: EvidenceListProps) {
  if (items.length === 0) {
    return <EmptyState>No evidence matches the current filters.</EmptyState>;
  }

  return (
    <div className="evidence-grid">
      {items.map((ev) => (
        <EvidenceCard
          key={ev.id}
          evidence={ev}
          bookmarked={bookmarks.includes(ev.id)}
          selected={ev.id === selectedId}
          onToggleBookmark={onToggleBookmark}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
}
