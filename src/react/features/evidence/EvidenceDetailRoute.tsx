import { Link, useParams } from "react-router";
import { Panel } from "../../shared/components/Panel.tsx";
import { useLayoutContext } from "../../shared/data/caseDataOutlet.ts";
import { EvidenceDetail } from "./components/EvidenceDetail.tsx";

/** /evidence/:evidenceId — which item is open is URL state, not React state. */
export function EvidenceDetailRoute() {
  const { evidenceId } = useParams<{ evidenceId: string }>();
  const { data, notes, onSaveNote, onReviewChange } = useLayoutContext();

  const ev = data.evidence.find((item) => item.id === evidenceId);

  if (!ev) {
    return (
      <Panel title="Evidence not found">
        <p>
          There is no evidence item <code>{evidenceId}</code>.
        </p>
        <Link to="/evidence">Close</Link>
      </Panel>
    );
  }

  return (
    <EvidenceDetail
      evidence={ev}
      people={data.people.filter((p) => ev.personIds.includes(p.id))}
      locations={data.locations.filter((l) => ev.locationIds.includes(l.id))}
      savedNote={notes[ev.id] ?? ""}
      onReviewChange={(field, value) => onReviewChange(ev.id, field, value)}
      onSaveNote={(text) => onSaveNote(ev.id, text)}
    />
  );
}
