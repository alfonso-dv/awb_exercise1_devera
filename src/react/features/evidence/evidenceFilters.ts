import type { Evidence } from "../../../types.ts";

export type EvidenceSort =
  "date-desc" | "date-asc" | "title-asc" | "title-desc";

/** Everything the Evidence Catalogue's toolbar controls. */
export interface EvidenceFilters {
  search: string;
  /** Lower-cased evidence type, "" = all. */
  type: string;
  /** Person id, "" = all. */
  person: string;
  /** Location id, "" = all. */
  location: string;
  /** "unreviewed" | "reviewed" | "flagged", "" = all. */
  status: string;
  /** "unknown" | "relevant" | "irrelevant", "" = all. */
  relevance: string;
  sort: EvidenceSort;
}

export const INITIAL_FILTERS: EvidenceFilters = {
  search: "",
  type: "",
  person: "",
  location: "",
  status: "",
  relevance: "",
  sort: "date-desc"
};

/** The filter fields that are plain <select>s (everything except search & sort). */
export type SelectFilter =
  "type" | "person" | "location" | "status" | "relevance";

/** Everything that can happen to the filters. */
export type FilterAction =
  | { type: "SET_SEARCH"; value: string }
  | { type: "SET_FILTER"; field: SelectFilter; value: string }
  | { type: "SET_SORT"; sort: EvidenceSort }
  | { type: "CLEAR_FILTERS" };

/**
 * Reducer: (current filters, action) -> next filters. Pure — always returns
 * a new object (or the initial one), never changes `state`. All the rules
 * for how the filters change live here, in one place.
 */
export function filtersReducer(
  state: EvidenceFilters,
  action: FilterAction
): EvidenceFilters {
  switch (action.type) {
    case "SET_SEARCH":
      return { ...state, search: action.value };
    case "SET_FILTER":
      return { ...state, [action.field]: action.value };
    case "SET_SORT":
      return { ...state, sort: action.sort };
    case "CLEAR_FILTERS":
      // Every field back to its initial value in one step — a new field added
      // to EvidenceFilters is reset automatically (it's in INITIAL_FILTERS).
      return INITIAL_FILTERS;
  }
}

export function isEvidenceSort(value: string): value is EvidenceSort {
  return ["date-desc", "date-asc", "title-asc", "title-desc"].includes(value);
}

/** Distinct lower-cased evidence types ("Test-Report" and "test-report" are one). */
export function evidenceTypes(evidence: readonly Evidence[]): string[] {
  return [...new Set(evidence.map((ev) => ev.type.toLowerCase()))];
}

function time(ev: Evidence): number {
  return new Date(ev.timestamp).getTime();
}

/**
 * Derived data: the list to show is COMPUTED from the full evidence list and
 * the current filters on every render — it is never stored as state.
 *
 * filter() always returns a new array, and sort() then sorts that copy, so
 * the full list passed in is never reordered (cf. the Exercise 1 bug where
 * filteredEvidence === allEvidence and sorting scrambled the master list).
 */
export function filterAndSortEvidence(
  evidence: readonly Evidence[],
  filters: EvidenceFilters
): Evidence[] {
  const term = filters.search.trim().toLowerCase();

  const matching = evidence.filter((ev) => {
    if (term) {
      const haystack =
        `${ev.title} ${ev.summary} ${ev.tags.join(" ")}`.toLowerCase();
      if (!haystack.includes(term)) return false;
    }
    if (filters.type && ev.type.toLowerCase() !== filters.type) return false;
    if (filters.person && !ev.personIds.includes(filters.person)) return false;
    if (filters.location && !ev.locationIds.includes(filters.location))
      return false;
    if (filters.status && ev.status.toLowerCase() !== filters.status)
      return false;
    if (filters.relevance && ev.relevance.toLowerCase() !== filters.relevance) {
      return false;
    }
    return true;
  });

  switch (filters.sort) {
    case "date-asc":
      return matching.sort((a, b) => time(a) - time(b));
    case "date-desc":
      return matching.sort((a, b) => time(b) - time(a));
    case "title-asc":
      return matching.sort((a, b) => a.title.localeCompare(b.title));
    case "title-desc":
      return matching.sort((a, b) => b.title.localeCompare(a.title));
  }
}
