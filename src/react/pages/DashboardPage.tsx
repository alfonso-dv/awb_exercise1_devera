import { CaseSummaryCard } from "../components/dashboard/CaseSummaryCard.tsx";
import { HowToCard } from "../components/dashboard/HowToCard.tsx";
import { RecentEvidenceList } from "../components/dashboard/RecentEvidenceList.tsx";
import { RecentTimelineList } from "../components/dashboard/RecentTimelineList.tsx";
import { ReviewProgress } from "../components/dashboard/ReviewProgress.tsx";
import { StatCard } from "../components/dashboard/StatCard.tsx";
import { computeDashboardStats } from "../data/dashboardStats.ts";
import type { CaseData } from "../data/loadCaseData.ts";

interface DashboardPageProps {
  data: CaseData;
}

export function DashboardPage({ data }: DashboardPageProps) {
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
