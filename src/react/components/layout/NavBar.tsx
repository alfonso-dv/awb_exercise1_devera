import type { ViewName } from "../../../state.ts";
import { navigate } from "../../routing/useHashRoute.ts";
import { NAV_ITEMS } from "../../routing/views.ts";

interface NavBarProps {
  /** Highlighted view; null when the URL doesn't match any view. */
  activeView: ViewName | null;
}

export function NavBar({ activeView }: NavBarProps) {
  return (
    <nav className="main-nav" aria-label="Main navigation">
      {NAV_ITEMS.map(({ view, label }) => (
        <button
          key={view}
          type="button"
          className={view === activeView ? "nav-btn active" : "nav-btn"}
          aria-current={view === activeView ? "page" : undefined}
          onClick={() => navigate(view)}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}
