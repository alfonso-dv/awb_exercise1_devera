import type { ReactNode } from "react";

/** The badge colours defined in styles.css (.badge-<variant>). */
export type BadgeVariant =
  "reviewed" | "unreviewed" | "flagged" | "critical" | "relevant";

interface BadgeProps {
  variant: BadgeVariant;
  children: ReactNode;
}

/**
 * Small coloured label. Used for the case status, evidence review status and
 * timeline certainty — the colour is chosen by the caller via `variant`, the
 * markup and styling stay the same everywhere.
 */
export function Badge({ variant, children }: BadgeProps) {
  return <span className={`badge badge-${variant}`}>{children}</span>;
}
