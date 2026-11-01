import type { Evidence, EvidenceId } from "../../../../types.ts";
import { EmptyState } from "../../../shared/components/EmptyState.tsx";
import { EvidenceCard } from "./EvidenceCard.tsx";

interface EvidenceListProps {
  items: readonly Evidence[];
  selectedId: EvidenceId | undefined;
  onOpen: (id: EvidenceId) => void;
}

export function EvidenceList({ items, selectedId, onOpen }: EvidenceListProps) {
  if (items.length === 0) {
    return <EmptyState>No evidence matches the current filters.</EmptyState>;
  }

  return (
    <div className="evidence-grid">
      {items.map((ev) => (
        <EvidenceCard
          key={ev.id}
          evidence={ev}
          selected={ev.id === selectedId}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
}
