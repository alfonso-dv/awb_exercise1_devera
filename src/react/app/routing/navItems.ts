/** Main navigation, in display order. `to` is a route path (see App.tsx). */
export const NAV_ITEMS: ReadonlyArray<{ to: string; label: string }> = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/evidence", label: "Evidence" },
  { to: "/team", label: "People & Locations" },
  { to: "/timeline", label: "Timeline" },
  { to: "/workspace", label: "Workspace" }
];
