import { Panel } from "../../../shared/components/Panel.tsx";
import type { Evidence } from "../../../../types.ts";
import { StatusBadge } from "../../../shared/components/StatusBadge.tsx";

interface RecentEvidenceListProps {
  items: Evidence[];
}

export function RecentEvidenceList({ items }: RecentEvidenceListProps) {
  return (
    <Panel title="Recent evidence">
      {items.length === 0 && <p>No evidence loaded yet.</p>}
      {items.map((ev) => (
        <div key={ev.id} className="mini-list-item">
          <strong>{ev.id}</strong> &mdash; {ev.title}{" "}
          <StatusBadge status={ev.status} />
        </div>
      ))}
    </Panel>
  );
}
