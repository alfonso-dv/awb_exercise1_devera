import type { CaseLocation, TimelineEvent } from "../../../../types.ts";
import { EmptyState } from "../../../shared/components/EmptyState.tsx";
import { TimelineEventItem } from "./TimelineEventItem.tsx";

interface TimelineEventListProps {
  events: readonly TimelineEvent[];
  locations: readonly CaseLocation[];
}

export function TimelineEventList({
  events,
  locations
}: TimelineEventListProps) {
  if (events.length === 0) {
    return (
      <EmptyState>No timeline events match the current filters.</EmptyState>
    );
  }

  return (
    <div className="timeline-container">
      {events.map((event) => (
        <TimelineEventItem
          key={event.id}
          event={event}
          locations={locations.filter((loc) =>
            event.locationIds.includes(loc.id)
          )}
        />
      ))}
    </div>
  );
}
