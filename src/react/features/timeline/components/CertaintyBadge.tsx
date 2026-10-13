import type { Certainty } from "../../../../types.ts";
import { Badge, type BadgeVariant } from "../../../shared/components/Badge.tsx";

/** Lookup table instead of an if/else chain: one colour per certainty. */
const CERTAINTY_VARIANT: Record<Certainty, BadgeVariant> = {
  confirmed: "reviewed",
  reported: "flagged",
  contradictory: "critical"
};

interface CertaintyBadgeProps {
  certainty: Certainty;
}

export function CertaintyBadge({ certainty }: CertaintyBadgeProps) {
  return (
    <Badge variant={CERTAINTY_VARIANT[certainty] ?? "unreviewed"}>
      {certainty}
    </Badge>
  );
}
