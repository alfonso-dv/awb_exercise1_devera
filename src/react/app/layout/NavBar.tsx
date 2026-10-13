import { NavLink } from "react-router";
import { NAV_ITEMS } from "../routing/navItems.ts";

export function NavBar() {
  return (
    <nav className="main-nav" aria-label="Main navigation">
      {NAV_ITEMS.map(({ to, label }) => (
        // NavLink knows the current URL and marks itself active (it also
        // sets aria-current="page"). "/team" stays active for /team/people,
        // /team/locations and /team/people/:personId.
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            isActive ? "nav-btn active" : "nav-btn"
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
