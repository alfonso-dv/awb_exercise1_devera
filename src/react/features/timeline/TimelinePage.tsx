import { useSearchParams } from "react-router";
import { useCaseDataFromLayout } from "../../shared/data/caseDataOutlet.ts";
import { TimelineEventList } from "./components/TimelineEventList.tsx";
import { TimelineFiltersBar } from "./components/TimelineFiltersBar.tsx";
import {
  applyTimelineFilters,
  eventTypes,
  parseTimelineQuery
} from "./timelineQuery.ts";

/**
 * /timeline?order=desc&person=nova-byte&location=L03&type=access
 *
 * The query string decides the INITIAL list (e.g. when the page is opened from
 * a link). Nothing here changes it afterwards: we only read the URL, never
 * write it, and there is no useState.
 */
export function TimelinePage() {
  const { timeline, people, locations } = useCaseDataFromLayout();
  const [searchParams] = useSearchParams();

  const { filters, ignored } = parseTimelineQuery(
    searchParams,
    people,
    locations,
    timeline
  );
  const events = applyTimelineFilters(timeline, filters);
  const personName = people.find((p) => p.id === filters.person)?.name;

  return (
    <section className="view active">
      <h2>Investigation Timeline</h2>

      {/* key: if a link changes the URL while this page is open, remount the
          uncontrolled dropdowns so their defaultValue matches the new URL. */}
      <TimelineFiltersBar
        key={searchParams.toString()}
        people={people}
        locations={locations}
        types={eventTypes(timeline)}
        initial={filters}
      />

      {personName && (
        <p className="evidence-meta">
          Showing events involving <strong>{personName}</strong> (from the
          link).
        </p>
      )}
      {ignored.length > 0 && (
        <div className="warning-banner">
          Ignored unknown filter value{ignored.length === 1 ? "" : "s"} in the
          link: {ignored.join(", ")}
        </div>
      )}

      <TimelineEventList
        events={events}
        people={people}
        locations={locations}
      />
    </section>
  );
}
