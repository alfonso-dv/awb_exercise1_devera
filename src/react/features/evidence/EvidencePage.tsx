import { useReducer } from "react";
import { Outlet, useNavigate, useParams } from "react-router";
import { useLayoutContext } from "../../shared/data/caseDataOutlet.ts";
import { EvidenceList } from "./components/EvidenceList.tsx";
import { EvidenceToolbar } from "./components/EvidenceToolbar.tsx";
import {
  evidenceTypes,
  filterAndSortEvidence,
  filtersReducer,
  INITIAL_FILTERS,
  isEvidenceSort
} from "./evidenceFilters.ts";
import { useDocumentTitle } from "../../shared/hooks/useDocumentTitle.ts";

/**
 * /evidence and /evidence/:evidenceId (the detail view renders in <Outlet />).
 *
 * Owns the filter/search/sort state — one useReducer for the 7 related values.
 * Because this component stays mounted while a detail route opens and closes,
 * the filters survive opening items.
 */
export function EvidencePage() {
  useDocumentTitle("Evidence Catalogue");
  const layout = useLayoutContext();
  const { evidence, people, locations } = layout.data;
  const { evidenceId: selectedId } = useParams<{ evidenceId: string }>();
  const navigate = useNavigate();

  const [filters, dispatch] = useReducer(filtersReducer, INITIAL_FILTERS);

  // Derived on every render from the full list + the current filters.
  const visible = filterAndSortEvidence(evidence, filters);

  return (
    <section className="view active">
      <h2>Evidence Catalogue</h2>

      <EvidenceToolbar
        filters={filters}
        types={evidenceTypes(evidence)}
        people={people}
        locations={locations}
        onSearchChange={(value) => dispatch({ type: "SET_SEARCH", value })}
        onFilterChange={(field, value) =>
          dispatch({ type: "SET_FILTER", field, value })
        }
        onSortChange={(value) => {
          if (isEvidenceSort(value))
            dispatch({ type: "SET_SORT", sort: value });
        }}
        onClear={() => dispatch({ type: "CLEAR_FILTERS" })}
      />

      {/* Detail view of the selected item (child route), above the list. */}
      <Outlet context={layout} />

      <p className="evidence-meta">
        Showing {visible.length} of {evidence.length} evidence items
      </p>

      <EvidenceList
        items={visible}
        selectedId={selectedId}
        onOpen={(id) => void navigate(`/evidence/${encodeURIComponent(id)}`)}
      />
    </section>
  );
}
