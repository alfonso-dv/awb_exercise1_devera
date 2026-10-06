import type { CaseData } from "./loadCaseData.ts";
import type { Evidence, TimelineEvent } from "../../types.ts";

export interface DashboardStats {
  evidenceCount: number;
  peopleCount: number;
  locationCount: number;
  bookmarkCount: number;
  reviewedCount: number;
  /** 0–100, rounded like the vanilla dashboard. */
  reviewProgressPct: number;
  /** Last five evidence items in file order, newest-listed first. */
  recentEvidence: Evidence[];
  /** Last five timeline events in file order, newest-listed first. */
  recentTimeline: TimelineEvent[];
}

/** Pure function: same input -> same numbers. Computed on every render. */
export function computeDashboardStats(data: CaseData): DashboardStats {
  const reviewedCount = data.evidence.filter(
    (ev) => (ev.status || "").toLowerCase() === "reviewed"
  ).length;

  const evidenceCount = data.evidence.length;

  return {
    evidenceCount,
    peopleCount: data.people.length,
    locationCount: data.locations.length,
    bookmarkCount: data.bookmarks.length,
    reviewedCount,
    reviewProgressPct:
      evidenceCount === 0
        ? 0
        : Math.round((reviewedCount / evidenceCount) * 100),
    recentEvidence: data.evidence.slice(-5).reverse(),
    recentTimeline: data.timeline.slice(-5).reverse()
  };
}
