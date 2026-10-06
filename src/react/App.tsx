import type { ReactNode } from "react";
import type { ViewName } from "../state.ts";
import { LoadingState } from "./components/common/LoadingState.tsx";
import { AppHeader } from "./components/layout/AppHeader.tsx";
import type { CaseData } from "./data/loadCaseData.ts";
import { useCaseData } from "./data/useCaseData.ts";
import { DashboardPage } from "./pages/DashboardPage.tsx";
import { NotFoundPage } from "./pages/NotFoundPage.tsx";
import { PlaceholderPage } from "./pages/PlaceholderPage.tsx";
import { useHashRoute, type Route } from "./routing/useHashRoute.ts";

function renderView(view: ViewName, data: CaseData): ReactNode {
  switch (view) {
    case "dashboard":
      return <DashboardPage data={data} />;
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

function renderRoute(route: Route, data: CaseData): ReactNode {
  return route.kind === "view" ? (
    renderView(route.view, data)
  ) : (
    <NotFoundPage requested={route.requested} />
  );
}

export function App() {
  const route = useHashRoute();
  // Loaded once here, at the top of the tree, so it survives navigation:
  // pages unmount when you leave them, <App /> never does.
  const caseData = useCaseData();

  return (
    <>
      <AppHeader activeView={route.kind === "view" ? route.view : null} />
      <main className="app-main">
        {caseData.status === "loading" && <LoadingState />}
        {caseData.status === "error" && (
          <div className="warning-banner">
            The case file could not be loaded. Please reload the page.
          </div>
        )}
        {caseData.status === "ready" && renderRoute(route, caseData.data)}
      </main>
    </>
  );
}
