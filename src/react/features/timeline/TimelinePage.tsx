import { useSearchParams } from "react-router";
import { useCaseDataFromLayout } from "../../shared/data/caseDataOutlet.ts";
import { TimelineEventList } from "./components/TimelineEventList.tsx";
import { TimelineFiltersBar } from "./components/TimelineFiltersBar.tsx";
import {
  applyTimelineFilters,
  eventTypes,
  parseTimelineQuery,
  type TimelineFilters
} from "./timelineQuery.ts";

/**
 * /timeline?order=desc&person=nova-byte&location=L03&type=access
 *
 * The filters live in the URL query string — the URL *is* the state. Links
 * (e.g. from a person's page) open the timeline pre-filtered, changing a
 * dropdown writes the new value into the URL (setSearchParams), and the list
 * is derived from the URL on every render. Every combination stays
 * bookmarkable and works with Back/Forward.
 */
export function TimelinePage() {
  const { timeline, people, locations } = useCaseDataFromLayout();
  const [searchParams, setSearchParams] = useSearchParams();

  const { filters, ignored } = parseTimelineQuery(
    searchParams,
    people,
    locations,
    timeline
  );
  const events = applyTimelineFilters(timeline, filters);
  const personName = people.find((p) => p.id === filters.person)?.name;

  function handleFilterChange(
    field: keyof TimelineFilters,
    value: string
  ): void {
    const next = new URLSearchParams(searchParams);
    // Defaults ("" = all, "asc" order) are left out to keep URLs short.
    if (value === "" || (field === "order" && value === "asc"))
      next.delete(field);
    else next.set(field, value);
    setSearchParams(next);
  }

  return (
    <section className="view active">
      <h2>Investigation Timeline</h2>
      <TimelineFiltersBar
        people={people}
        locations={locations}
        types={eventTypes(timeline)}
        filters={filters}
        onChange={handleFilterChange}
      />

      {personName && (
        <p className="evidence-meta">
          Showing events involving <strong>{personName}</strong>.
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
