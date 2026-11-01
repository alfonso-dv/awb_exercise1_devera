import { Badge } from "./Badge.tsx";

interface RelevanceBadgeProps {
  relevance: string;
}

/** "relevant" is highlighted, everything else is neutral (as in the vanilla app). */
export function RelevanceBadge({ relevance }: RelevanceBadgeProps) {
  return (
    <Badge
      variant={
        relevance.toLowerCase() === "relevant" ? "relevant" : "unreviewed"
      }
    >
      {relevance}
    </Badge>
  );
}
