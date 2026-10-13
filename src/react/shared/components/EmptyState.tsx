import type { ReactNode } from "react";

interface EmptyStateProps {
  children: ReactNode;
}

/** Message shown instead of a list that has no entries. */
export function EmptyState({ children }: EmptyStateProps) {
  return <p className="empty-state">{children}</p>;
}
