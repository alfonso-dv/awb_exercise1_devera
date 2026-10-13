import { HashRouter, Navigate, Route, Routes } from "react-router";
import { DashboardPage } from "../features/dashboard/DashboardPage.tsx";
import { LocationsTab } from "../features/team/LocationsTab.tsx";
import { PeopleTab } from "../features/team/PeopleTab.tsx";
import { TeamLayout } from "../features/team/TeamLayout.tsx";
import { TimelinePage } from "../features/timeline/TimelinePage.tsx";
import { AppLayout } from "./layout/AppLayout.tsx";
import { NotFoundPage } from "./NotFoundPage.tsx";
import { PlaceholderPage } from "./PlaceholderPage.tsx";

/**
 * Route table.
 *
 * HashRouter keeps the route after the "#" (react.html#/team/people): GitHub
 * Pages only serves real files, so a path-based URL like /team/people would
 * 404 on reload, while the hash part never reaches the server.
 */
export function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />

          <Route path="team" element={<TeamLayout />}>
            <Route index element={<Navigate to="people" replace />} />
            <Route path="people" element={<PeopleTab />} />
            <Route path="locations" element={<LocationsTab />} />
          </Route>

          <Route path="timeline" element={<TimelinePage />} />

          <Route
            path="evidence"
            element={
              <PlaceholderPage
                title="Evidence Catalogue"
                vanillaView="evidence"
              />
            }
          />
          <Route
            path="workspace"
            element={
              <PlaceholderPage
                title="Investigator Workspace"
                vanillaView="workspace"
              />
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
