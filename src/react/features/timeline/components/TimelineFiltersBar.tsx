import type { CaseLocation, Person } from "../../../../types.ts";
import type { TimelineFilters } from "../timelineQuery.ts";

interface TimelineFiltersBarProps {
  people: readonly Person[];
  locations: readonly CaseLocation[];
  types: readonly string[];
  /** Values the dropdowns start with (taken from the URL). */
  initial: TimelineFilters;
}

/**
 * The filter controls, visually complete. Exercise 4 deliberately does NOT
 * wire them up: they are uncontrolled (defaultValue, no onChange), so changing
 * a dropdown doesn't filter anything yet. That needs state (Exercise 5).
 */
export function TimelineFiltersBar({
  people,
  locations,
  types,
  initial
}: TimelineFiltersBarProps) {
  return (
    <div className="toolbar">
      <div className="toolbar-row">
        <label htmlFor="timelineOrder" className="visually-hidden">
          Order
        </label>
        <select id="timelineOrder" defaultValue={initial.order}>
          <option value="asc">Oldest first</option>
          <option value="desc">Newest first</option>
        </select>

        <label htmlFor="timelinePersonFilter" className="visually-hidden">
          Filter by person
        </label>
        <select id="timelinePersonFilter" defaultValue={initial.person}>
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
        <select id="timelineLocationFilter" defaultValue={initial.location}>
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
        <select id="timelineTypeFilter" defaultValue={initial.type}>
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
