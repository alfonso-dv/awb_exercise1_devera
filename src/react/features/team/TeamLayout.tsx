import { NavLink, Outlet } from "react-router";
import { useLayoutContext } from "../../shared/data/caseDataOutlet.ts";
import { useDocumentTitle } from "../../shared/hooks/useDocumentTitle.ts";

function tabClass({ isActive }: { isActive: boolean }): string {
  return isActive ? "tab-btn active" : "tab-btn";
}

/**
 * People & Locations. The two tabs are real routes (/team/people and
 * /team/locations) instead of a click handler that toggles hidden panels, so
 * each tab has its own URL that can be bookmarked, shared and reached with
 * the back button.
 */
export function TeamLayout() {
  useDocumentTitle("People & Locations");
  const layout = useLayoutContext();

  return (
    <section className="view active">
      <h2>People &amp; Locations</h2>

      <div className="tab-bar">
        <NavLink to="/team/people" className={tabClass}>
          People
        </NavLink>
        <NavLink to="/team/locations" className={tabClass}>
          Locations
        </NavLink>
      </div>

      {/* Pass the layout context on to the nested tab routes. */}
      <Outlet context={layout} />
    </section>
  );
}
