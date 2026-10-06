import type { ViewName } from "../../state.ts";

/** One entry per view, in navigation order. */
export const NAV_ITEMS: ReadonlyArray<{ view: ViewName; label: string }> = [
  { view: "dashboard", label: "Dashboard" },
  { view: "evidence", label: "Evidence" },
  { view: "people", label: "People & Locations" },
  { view: "timeline", label: "Timeline" },
  { view: "workspace", label: "Workspace" }
];
