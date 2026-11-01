import type { Evidence, EvidenceId } from "../../../../types.ts";
import { formatDate } from "../../../../utils.ts";
import { Badge } from "../../../shared/components/Badge.tsx";
import { RelevanceBadge } from "../../../shared/components/RelevanceBadge.tsx";
import { StatusBadge } from "../../../shared/components/StatusBadge.tsx";
import { BookmarkButton } from "./BookmarkButton.tsx";

interface EvidenceCardProps {
  evidence: Evidence;
  /** Is this the item currently open in the detail view? */
  selected: boolean;
  onOpen: (id: EvidenceId) => void;
}

export function EvidenceCard({
  evidence: ev,
  selected,
  onOpen
}: EvidenceCardProps) {
  return (
    <div
      className={selected ? "evidence-card selected" : "evidence-card"}
      onClick={() => onOpen(ev.id)}
    >
      <BookmarkButton evidenceId={ev.id} title={ev.title} />
      <h3>{ev.title}</h3>
      <div className="evidence-meta">
        {ev.id} &middot; {ev.type} &middot; {formatDate(ev.timestamp)}
      </div>
      <div className="evidence-summary">{ev.summary}</div>
      {ev.tags.includes("critical") && (
        <Badge variant="critical">Critical</Badge>
      )}
      <StatusBadge status={ev.status} />
      <RelevanceBadge relevance={ev.relevance} />
      <div>
        {ev.tags.map((tag) => (
          <span key={tag} className="tag-chip">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
