import { useState } from "react";
import { Outlet, useNavigate, useParams } from "react-router";
import { useLayoutContext } from "../../shared/data/caseDataOutlet.ts";
import { EvidenceList } from "./components/EvidenceList.tsx";
import {
  EvidenceToolbar,
  type SelectFilter
} from "./components/EvidenceToolbar.tsx";
import {
  evidenceTypes,
  filterAndSortEvidence,
  INITIAL_FILTERS,
  isEvidenceSort,
  type EvidenceFilters,
  type EvidenceSort
} from "./evidenceFilters.ts";

/**
 * /evidence and /evidence/:evidenceId (the detail view renders in <Outlet />).
 *
 * Owns the filter/search/sort state. Because this component stays mounted
 * while a detail route opens and closes, the filters survive opening items.
 */
export function EvidencePage() {
  const layout = useLayoutContext();
  const { evidence, people, locations } = layout.data;
  const { evidenceId: selectedId } = useParams<{ evidenceId: string }>();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [person, setPerson] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("");
  const [relevance, setRelevance] = useState("");
  const [sort, setSort] = useState<EvidenceSort>(INITIAL_FILTERS.sort);

  const filters: EvidenceFilters = {
    search,
    type,
    person,
    location,
    status,
    relevance,
    sort
  };

  // Derived on every render from the full list + the current filters.
  const visible = filterAndSortEvidence(evidence, filters);

  function handleFilterChange(field: SelectFilter, value: string): void {
    if (field === "type") setType(value);
    if (field === "person") setPerson(value);
    if (field === "location") setLocation(value);
    if (field === "status") setStatus(value);
    if (field === "relevance") setRelevance(value);
  }

  function handleSortChange(value: string): void {
    if (isEvidenceSort(value)) setSort(value);
  }

  function handleClear(): void {
    setSearch("");
    setType("");
    setPerson("");
    setLocation("");
    setStatus("");
    setRelevance("");
    setSort(INITIAL_FILTERS.sort);
  }

  return (
    <section className="view active">
      <h2>Evidence Catalogue</h2>

      <EvidenceToolbar
        filters={filters}
        types={evidenceTypes(evidence)}
        people={people}
        locations={locations}
        onSearchChange={setSearch}
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        onClear={handleClear}
      />

      {/* Detail view of the selected item (child route), above the list. */}
      <Outlet context={layout} />

      <p className="evidence-meta">
        Showing {visible.length} of {evidence.length} evidence items
      </p>

      <EvidenceList
        items={visible}
        bookmarks={layout.bookmarks}
        selectedId={selectedId}
        onToggleBookmark={layout.onToggleBookmark}
        onOpen={(id) => void navigate(`/evidence/${encodeURIComponent(id)}`)}
      />
    </section>
  );
}
