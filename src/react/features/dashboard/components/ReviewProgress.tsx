import { Panel } from "../../../shared/components/Panel.tsx";
interface ReviewProgressProps {
  /** 0–100 */
  percent: number;
}

export function ReviewProgress({ percent }: ReviewProgressProps) {
  return (
    <Panel title="Review progress">
      <div className="progress-bar-outer">
        <div className="progress-bar-inner" style={{ width: `${percent}%` }} />
      </div>
      <p>{percent}% of evidence reviewed</p>
    </Panel>
  );
}
