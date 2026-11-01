import type { CaseLocation, Person } from "../../../../types.ts";
import type { TimelineFilters } from "../timelineQuery.ts";

interface TimelineFiltersBarProps {
  people: readonly Person[];
  locations: readonly CaseLocation[];
  types: readonly string[];
  /** Current filter values (they live in the URL query string). */
  filters: TimelineFilters;
  onChange: (field: keyof TimelineFilters, value: string) => void;
}

/**
 * Controlled filter controls: each dropdown shows the current value from
 * `filters` and reports changes through `onChange`. (In Exercise 4 they were
 * uncontrolled and not wired up.)
 */
export function TimelineFiltersBar({
  people,
  locations,
  types,
  filters,
  onChange
}: TimelineFiltersBarProps) {
  return (
    <div className="toolbar">
      <div className="toolbar-row">
        <label htmlFor="timelineOrder" className="visually-hidden">
          Order
        </label>
        <select
          id="timelineOrder"
          value={filters.order}
          onChange={(e) => onChange("order", e.target.value)}
        >
          <option value="asc">Oldest first</option>
          <option value="desc">Newest first</option>
        </select>

        <label htmlFor="timelinePersonFilter" className="visually-hidden">
          Filter by person
        </label>
        <select
          id="timelinePersonFilter"
          value={filters.person}
          onChange={(e) => onChange("person", e.target.value)}
        >
          <option value="">All people</option>
          {people.map((person) => (
            <option key={person.id} value={person.id}>
              {person.name}
            </option>
          ))}
        </select>

        <label htmlFor="timelineLocationFilter" className="visually-hidden">
          Filter by location
        </label>
        <select
          id="timelineLocationFilter"
          value={filters.location}
          onChange={(e) => onChange("location", e.target.value)}
        >
          <option value="">All locations</option>
          {locations.map((location) => (
            <option key={location.id} value={location.id}>
              {location.id}
            </option>
          ))}
        </select>

        <label htmlFor="timelineTypeFilter" className="visually-hidden">
          Filter by event type
        </label>
        <select
          id="timelineTypeFilter"
          value={filters.type}
          onChange={(e) => onChange("type", e.target.value)}
        >
          <option value="">All event types</option>
          {types.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
