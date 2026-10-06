import type { CaseInfo } from "../../../types.ts";

interface CaseSummaryCardProps {
  caseInfo: CaseInfo;
}

export function CaseSummaryCard({ caseInfo }: CaseSummaryCardProps) {
  return (
    <div className="case-summary-card">
      <h3>{caseInfo.title || "Case"}</h3>
      <p>
        <span className="badge badge-flagged">
          {(caseInfo.status || "unknown").toUpperCase()}
        </span>
      </p>
      <p>{caseInfo.summary || ""}</p>
    </div>
  );
}
