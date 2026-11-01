import { HashRouter, Navigate, Route, Routes } from "react-router";
import { DashboardPage } from "../features/dashboard/DashboardPage.tsx";
import { EvidenceDetailRoute } from "../features/evidence/EvidenceDetailRoute.tsx";
import { EvidencePage } from "../features/evidence/EvidencePage.tsx";
import { WorkspacePage } from "../features/workspace/WorkspacePage.tsx";
import { LocationDetailPage } from "../features/team/LocationDetailPage.tsx";
import { LocationsTab } from "../features/team/LocationsTab.tsx";
import { PeopleTab } from "../features/team/PeopleTab.tsx";
import { PersonDetailPage } from "../features/team/PersonDetailPage.tsx";
import { TeamLayout } from "../features/team/TeamLayout.tsx";
import { TimelinePage } from "../features/timeline/TimelinePage.tsx";
import { EffectsLab } from "../sandbox/EffectsLab.tsx";
import { KeyIdentityDemo } from "../sandbox/KeyIdentityDemo.tsx";
import { AppLayout } from "./layout/AppLayout.tsx";
import { NotFoundPage } from "./NotFoundPage.tsx";

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
            <Route path="people/:personId" element={<PersonDetailPage />} />
            <Route path="locations" element={<LocationsTab />} />
            <Route
              path="locations/:locationId"
              element={<LocationDetailPage />}
            />
          </Route>

          <Route path="timeline" element={<TimelinePage />} />
          <Route path="evidence" element={<EvidencePage />}>
            <Route path=":evidenceId" element={<EvidenceDetailRoute />} />
          </Route>
          <Route path="workspace" element={<WorkspacePage />} />

          {/* Throwaway demo for Exercise 4, Demo 4 (not linked in the nav). */}
          <Route path="sandbox/keys" element={<KeyIdentityDemo />} />
          {/* Exercise 6, Demos 1–3: effects lab (not linked in the nav). */}
          <Route path="sandbox/effects" element={<EffectsLab />} />

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
