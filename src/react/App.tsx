import type { ReactNode } from "react";
import type { ViewName } from "../state.ts";
import { AppHeader } from "./components/layout/AppHeader.tsx";
import { DashboardPage } from "./pages/DashboardPage.tsx";
import { NotFoundPage } from "./pages/NotFoundPage.tsx";
import { PlaceholderPage } from "./pages/PlaceholderPage.tsx";
import { useHashRoute, type Route } from "./routing/useHashRoute.ts";

function renderView(view: ViewName): ReactNode {
  switch (view) {
    case "dashboard":
      return <DashboardPage />;
    case "evidence":
      return <PlaceholderPage title="Evidence Catalogue" view="evidence" />;
    case "people":
      return <PlaceholderPage title="People & Locations" view="people" />;
    case "timeline":
      return <PlaceholderPage title="Timeline" view="timeline" />;
    case "workspace":
      return (
        <PlaceholderPage title="Investigator Workspace" view="workspace" />
      );
  }
}

function renderRoute(route: Route): ReactNode {
  return route.kind === "view" ? (
    renderView(route.view)
  ) : (
    <NotFoundPage requested={route.requested} />
  );
}

export function App() {
  const route = useHashRoute();

  return (
    <>
      <AppHeader activeView={route.kind === "view" ? route.view : null} />
      <main className="app-main">{renderRoute(route)}</main>
    </>
  );
}
