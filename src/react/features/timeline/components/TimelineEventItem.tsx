import { Fragment } from "react";
import { Link } from "react-router";
import type { CaseLocation, Person, TimelineEvent } from "../../../../types.ts";
import { formatDate } from "../../../../utils.ts";
import { CertaintyBadge } from "./CertaintyBadge.tsx";

interface TimelineEventItemProps {
  event: TimelineEvent;
  /** The event's locations, already resolved by the caller. */
  locations: readonly CaseLocation[];
  /** The people involved, already resolved by the caller. */
  people: readonly Person[];
}

export function TimelineEventItem({
  event,
  locations,
  people
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
          {locations.map((loc, i) => (
            <Fragment key={loc.id}>
              {i > 0 && ", "}
              <Link to={`/team/locations/${encodeURIComponent(loc.id)}`}>
                {loc.id} - {loc.name}
              </Link>
            </Fragment>
          ))}
        </p>
      )}

      {people.length > 0 && (
        <p className="evidence-meta">
          People:{" "}
          {people.map((person, i) => (
            <Fragment key={person.id}>
              {i > 0 && ", "}
              <Link to={`/team/people/${encodeURIComponent(person.id)}`}>
                {person.name}
              </Link>
            </Fragment>
          ))}
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
