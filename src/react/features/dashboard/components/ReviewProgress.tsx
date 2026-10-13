interface ReviewProgressProps {
  /** 0–100 */
  percent: number;
}

export function ReviewProgress({ percent }: ReviewProgressProps) {
  return (
    <div className="dashboard-panel">
      <h3>Review progress</h3>
      <div className="progress-bar-outer">
        <div className="progress-bar-inner" style={{ width: `${percent}%` }} />
      </div>
      <p>{percent}% of evidence reviewed</p>
    </div>
  );
}
