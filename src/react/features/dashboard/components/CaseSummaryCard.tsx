import type { CaseInfo } from "../../../../types.ts";
import { Badge } from "../../../shared/components/Badge.tsx";

interface CaseSummaryCardProps {
  caseInfo: CaseInfo;
}

export function CaseSummaryCard({ caseInfo }: CaseSummaryCardProps) {
  return (
    <div className="case-summary-card">
      <h3>{caseInfo.title || "Case"}</h3>
      <p>
        <Badge variant="flagged">
          {(caseInfo.status || "unknown").toUpperCase()}
        </Badge>
      </p>
      <p>{caseInfo.summary || ""}</p>
    </div>
  );
}
