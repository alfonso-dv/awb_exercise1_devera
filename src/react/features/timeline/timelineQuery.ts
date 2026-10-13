import type { CaseLocation, Person, TimelineEvent } from "../../../types.ts";

export type TimelineOrder = "asc" | "desc";

/** The timeline's filter settings, as read from the URL query string. */
export interface TimelineFilters {
  order: TimelineOrder;
  /** Person id, or "" for all people. */
  person: string;
  /** Location id, or "" for all locations. */
  location: string;
  /** Event type, or "" for all types. */
  type: string;
}

export interface ParsedTimelineQuery {
  filters: TimelineFilters;
  /** Query parameters that were present but didn't match anything known. */
  ignored: string[];
}

/**
 * Reads ?order=&person=&location=&type= ONCE to decide the initial view.
 * Values are untrusted user input (anyone can edit a URL), so each one is
 * checked against the real data; unknown values are ignored and reported.
 */
export function parseTimelineQuery(
  params: URLSearchParams,
  people: readonly Person[],
  locations: readonly CaseLocation[],
  events: readonly TimelineEvent[]
): ParsedTimelineQuery {
  const ignored: string[] = [];

  function pick(name: string, allowed: readonly string[]): string {
    const value = params.get(name);
    if (value === null || value === "") return "";
    if (allowed.includes(value)) return value;
    ignored.push(`${name}=${value}`);
    return "";
  }

  const orderParam = pick("order", ["asc", "desc"]);

  return {
    filters: {
      order: orderParam === "desc" ? "desc" : "asc",
      person: pick(
        "person",
        people.map((p) => p.id)
      ),
      location: pick(
        "location",
        locations.map((l) => l.id)
      ),
      type: pick("type", eventTypes(events))
    },
    ignored
  };
}

/** Distinct event types, in order of first appearance. */
export function eventTypes(events: readonly TimelineEvent[]): string[] {
  return [...new Set(events.map((evt) => evt.type))];
}

/** Pure function: the events to show for the given filters. */
export function applyTimelineFilters(
  events: readonly TimelineEvent[],
  filters: TimelineFilters
): TimelineEvent[] {
  const matching = events.filter(
    (evt) =>
      (!filters.person || evt.personIds.includes(filters.person)) &&
      (!filters.location || evt.locationIds.includes(filters.location)) &&
      (!filters.type || evt.type === filters.type)
  );

  // Sort a copy (filter() already returned a new array, never the original).
  return matching.sort((a, b) => {
    const diff = new Date(a.time).getTime() - new Date(b.time).getTime();
    return filters.order === "desc" ? -diff : diff;
  });
}
