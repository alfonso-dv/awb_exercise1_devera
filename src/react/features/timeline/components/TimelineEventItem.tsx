import type { CaseLocation, TimelineEvent } from "../../../../types.ts";
import { formatDate } from "../../../../utils.ts";
import { CertaintyBadge } from "./CertaintyBadge.tsx";

interface TimelineEventItemProps {
  event: TimelineEvent;
  /** The event's locations, already resolved by the caller. */
  locations: readonly CaseLocation[];
}

export function TimelineEventItem({
  event,
  locations
}: TimelineEventItemProps) {
  return (
    <div className={`timeline-event certainty-${event.certainty}`}>
      <div className="timeline-time">
        {formatDate(event.time)}&nbsp;&middot;&nbsp;
        <CertaintyBadge certainty={event.certainty} />
      </div>
      <h3>{event.title}</h3>
      <p>{event.description}</p>

      {locations.length > 0 && (
        <p className="evidence-meta">
          Location:{" "}
          {locations.map((loc) => `${loc.id} - ${loc.name}`).join(", ")}
        </p>
      )}

      {event.evidenceIds.length > 0 && (
        <div>
          {event.evidenceIds.map((id) => (
            <span key={id} className="tag-chip">
              Evidence {id}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
