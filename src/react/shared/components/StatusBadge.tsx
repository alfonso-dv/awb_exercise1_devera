import { Badge, type BadgeVariant } from "./Badge.tsx";

interface StatusBadgeProps {
  status: string;
}

/** Maps a free-text review status ("Reviewed", "unreviewed", …) to a variant. */
export function statusVariant(status: string): BadgeVariant {
  const s = status.toLowerCase();
  if (s === "reviewed") return "reviewed";
  if (s === "flagged") return "flagged";
  return "unreviewed";
}

/** Review-status badge for an evidence item. */
export function StatusBadge({ status }: StatusBadgeProps) {
  return <Badge variant={statusVariant(status)}>{status}</Badge>;
}
