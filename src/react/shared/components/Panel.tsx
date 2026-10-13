import type { ReactNode } from "react";

interface PanelProps {
  /** Optional heading shown at the top of the panel. */
  title?: string;
  /** Whatever the panel should contain — the panel doesn't care what. */
  children: ReactNode;
}

/**
 * Generic white card/panel frame. Takes its content as `children`
 * (composition) instead of a data prop, so the same frame can wrap a progress
 * bar, a list, a profile or a message.
 */
export function Panel({ title, children }: PanelProps) {
  return (
    <div className="dashboard-panel">
      {title && <h3>{title}</h3>}
      {children}
    </div>
  );
}
