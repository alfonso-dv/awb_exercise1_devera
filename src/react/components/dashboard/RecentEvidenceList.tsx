import type { Evidence } from "../../../types.ts";
import { StatusBadge } from "../common/StatusBadge.tsx";

interface RecentEvidenceListProps {
  items: Evidence[];
}

export function RecentEvidenceList({ items }: RecentEvidenceListProps) {
  return (
    <div className="dashboard-panel">
      <h3>Recent evidence</h3>
      {items.length === 0 && <p>No evidence loaded yet.</p>}
      {items.map((ev) => (
        <div key={ev.id} className="mini-list-item">
          <strong>{ev.id}</strong> &mdash; {ev.title}{" "}
          <StatusBadge status={ev.status} />
        </div>
      ))}
    </div>
  );
}
