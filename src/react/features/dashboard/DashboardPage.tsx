import { CaseSummaryCard } from "./components/CaseSummaryCard.tsx";
import { HowToCard } from "./components/HowToCard.tsx";
import { RecentEvidenceList } from "./components/RecentEvidenceList.tsx";
import { RecentTimelineList } from "./components/RecentTimelineList.tsx";
import { ReviewProgress } from "./components/ReviewProgress.tsx";
import { StatCard } from "./components/StatCard.tsx";
import { computeDashboardStats } from "./dashboardStats.ts";
import { useCaseDataFromLayout } from "../../shared/data/caseDataOutlet.ts";

export function DashboardPage() {
  const data = useCaseDataFromLayout();

  // Derived values are recalculated from the current data on every render —
  // there is no cached HTML that could go stale.
  const stats = computeDashboardStats(data);

  return (
    <section className="view active">
      <h2>Case Dashboard</h2>
      <HowToCard />

      <CaseSummaryCard caseInfo={data.caseInfo} />

      <div className="stat-grid">
        <StatCard value={stats.evidenceCount} label="Evidence items" />
        <StatCard value={stats.peopleCount} label="People" />
        <StatCard value={stats.locationCount} label="Locations" />
        <StatCard value={stats.bookmarkCount} label="Bookmarked" />
        <StatCard value={stats.reviewedCount} label="Reviewed" />
      </div>

      <ReviewProgress percent={stats.reviewProgressPct} />

      <div className="dashboard-columns">
        <RecentEvidenceList items={stats.recentEvidence} />
        <RecentTimelineList events={stats.recentTimeline} />
      </div>
    </section>
  );
}
