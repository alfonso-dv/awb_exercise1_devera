import { Link, useParams } from "react-router";
import { Panel } from "../../shared/components/Panel.tsx";
import { useCaseDataFromLayout } from "../../shared/data/caseDataOutlet.ts";
import { TimelineEventList } from "../timeline/components/TimelineEventList.tsx";
import { applyTimelineFilters } from "../timeline/timelineQuery.ts";
import { LocationCard } from "./components/LocationCard.tsx";

/** /team/locations/:locationId */
export function LocationDetailPage() {
  const { locationId } = useParams<{ locationId: string }>();
  const { people, timeline, locations } = useCaseDataFromLayout();

  const location = locations.find((l) => l.id === locationId);

  if (!location) {
    return (
      <Panel title="Location not found">
        <p>
          There is no location with the id <code>{locationId}</code>.
        </p>
        <Link to="/team/locations">Back to all locations</Link>
      </Panel>
    );
  }

  const events = applyTimelineFilters(timeline, {
    order: "asc",
    person: "",
    location: location.id,
    type: ""
  });

  return (
    <div className="detail-stack">
      <p>
        <Link to="/team/locations">&larr; All locations</Link>
      </p>

      <LocationCard location={location} />

      <Panel title={`Timeline events at ${location.name}`}>
        <p>
          <Link to={`/timeline?location=${encodeURIComponent(location.id)}`}>
            Open these events in the Timeline view
          </Link>
        </p>
        <TimelineEventList
          events={events}
          people={people}
          locations={locations}
        />
      </Panel>
    </div>
  );
}
