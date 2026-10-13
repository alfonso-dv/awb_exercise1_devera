import { getStatusBadgeClass } from "../../../utils.ts";

interface StatusBadgeProps {
  status: string;
}

/** Review-status badge; reused by the dashboard, evidence cards and detail view. */
export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`badge ${getStatusBadgeClass(status)}`}>{status}</span>
  );
}
