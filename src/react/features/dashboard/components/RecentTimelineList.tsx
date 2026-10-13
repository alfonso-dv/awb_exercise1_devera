import { Panel } from "../../../shared/components/Panel.tsx";
import type { TimelineEvent } from "../../../../types.ts";
import { formatDate } from "../../../../utils.ts";

interface RecentTimelineListProps {
  events: TimelineEvent[];
}

export function RecentTimelineList({ events }: RecentTimelineListProps) {
  return (
    <Panel title="Recent timeline events">
      {events.length === 0 && <p>No timeline events loaded yet.</p>}
      {events.map((evt) => (
        <div key={evt.id} className="mini-list-item">
          <strong>{formatDate(evt.time)}</strong>
          <br />
          {evt.title}
        </div>
      ))}
    </Panel>
  );
}
