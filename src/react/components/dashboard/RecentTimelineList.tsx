import type { TimelineEvent } from "../../../types.ts";
import { formatDate } from "../../../utils.ts";

interface RecentTimelineListProps {
  events: TimelineEvent[];
}

export function RecentTimelineList({ events }: RecentTimelineListProps) {
  return (
    <div className="dashboard-panel">
      <h3>Recent timeline events</h3>
      {events.length === 0 && <p>No timeline events loaded yet.</p>}
      {events.map((evt) => (
        <div key={evt.id} className="mini-list-item">
          <strong>{formatDate(evt.time)}</strong>
          <br />
          {evt.title}
        </div>
      ))}
    </div>
  );
}
