import { Outlet } from "react-router";
import { LoadingState } from "../../shared/components/LoadingState.tsx";
import { useCaseData } from "../../shared/data/useCaseData.ts";
import { AppHeader } from "./AppHeader.tsx";

/**
 * Layout route: the header stays on screen for every page, the matched child
 * route renders where <Outlet /> is. The case data is loaded here, once, so it
 * survives navigation between pages.
 */
export function AppLayout() {
  const caseData = useCaseData();

  return (
    <>
      <AppHeader />
      <main className="app-main">
        {caseData.status === "loading" && <LoadingState />}
        {caseData.status === "error" && (
          <div className="warning-banner">
            The case file could not be loaded. Please reload the page.
          </div>
        )}
        {caseData.status === "ready" && <Outlet context={caseData.data} />}
      </main>
    </>
  );
}
