import type { CaseLocation, Person } from "../../../../types.ts";
import type { EvidenceFilters } from "../evidenceFilters.ts";

/** The filter fields that are plain <select>s (everything except search & sort). */
export type SelectFilter =
  "type" | "person" | "location" | "status" | "relevance";

interface EvidenceToolbarProps {
  filters: EvidenceFilters;
  types: readonly string[];
  people: readonly Person[];
  locations: readonly CaseLocation[];
  onSearchChange: (value: string) => void;
  onFilterChange: (field: SelectFilter, value: string) => void;
  onSortChange: (value: string) => void;
  onClear: () => void;
}

/**
 * Fully controlled: every input shows the value it gets from `filters` and
 * reports changes through a callback. The toolbar owns no state itself.
 */
export function EvidenceToolbar({
  filters,
  types,
  people,
  locations,
  onSearchChange,
  onFilterChange,
  onSortChange,
  onClear
}: EvidenceToolbarProps) {
  return (
    <div className="toolbar">
      <div className="toolbar-row">
        <label htmlFor="evidenceSearch" className="visually-hidden">
          Search evidence
        </label>
        <input
          type="text"
          id="evidenceSearch"
          placeholder="Search evidence by title, summary, or tag…"
          autoComplete="off"
          value={filters.search}
          onChange={(e) => onSearchChange(e.target.value)}
        />

        <label htmlFor="filterType" className="visually-hidden">
          Filter by type
        </label>
        <select
          id="filterType"
          value={filters.type}
          onChange={(e) => onFilterChange("type", e.target.value)}
        >
          <option value="">All types</option>
          {types.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <label htmlFor="filterPerson" className="visually-hidden">
          Filter by person
        </label>
        <select
          id="filterPerson"
          value={filters.person}
          onChange={(e) => onFilterChange("person", e.target.value)}
        >
          <option value="">All people</option>
          {people.map((person) => (
            <option key={person.id} value={person.id}>
              {person.name}
            </option>
          ))}
        </select>

        <label htmlFor="filterLocation" className="visually-hidden">
          Filter by location
        </label>
        <select
          id="filterLocation"
          value={filters.location}
          onChange={(e) => onFilterChange("location", e.target.value)}
        >
          <option value="">All locations</option>
          {locations.map((location) => (
            <option key={location.id} value={location.id}>
              {location.id} - {location.name}
            </option>
          ))}
        </select>
      </div>

      <div className="toolbar-row">
        <label htmlFor="filterStatus" className="visually-hidden">
          Filter by status
        </label>
        <select
          id="filterStatus"
          value={filters.status}
          onChange={(e) => onFilterChange("status", e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="unreviewed">Unreviewed</option>
          <option value="reviewed">Reviewed</option>
          <option value="flagged">Flagged</option>
        </select>

        <label htmlFor="filterRelevance" className="visually-hidden">
          Filter by relevance
        </label>
        <select
          id="filterRelevance"
          value={filters.relevance}
          onChange={(e) => onFilterChange("relevance", e.target.value)}
        >
          <option value="">All relevance</option>
          <option value="unknown">Unknown</option>
          <option value="relevant">Relevant</option>
          <option value="irrelevant">Irrelevant</option>
        </select>

        <label htmlFor="sortEvidence" className="visually-hidden">
          Sort evidence
        </label>
        <select
          id="sortEvidence"
          value={filters.sort}
          onChange={(e) => onSortChange(e.target.value)}
        >
          <option value="date-desc">Newest first</option>
          <option value="date-asc">Oldest first</option>
          <option value="title-asc">Title (A–Z)</option>
          <option value="title-desc">Title (Z–A)</option>
        </select>

        <button type="button" className="btn btn-secondary" onClick={onClear}>
          Clear filters
        </button>
      </div>
    </div>
  );
}
