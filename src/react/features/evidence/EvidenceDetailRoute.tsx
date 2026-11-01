import { Link, useParams } from "react-router";
import { normalizeEvidence } from "../../../data.ts";
import { ApiError } from "../../shared/api/http.ts";
import { ErrorState } from "../../shared/components/ErrorState.tsx";
import { Panel } from "../../shared/components/Panel.tsx";
import { useLayoutContext } from "../../shared/data/caseDataOutlet.ts";
import { EvidenceDetail } from "./components/EvidenceDetail.tsx";
import { useEvidenceItem } from "./useEvidenceItem.ts";

/**
 * /evidence/:evidenceId — fetches the selected item fresh from the server
 * (GET /api/evidence/:id) whenever the id in the URL changes.
 *
 * Loading, errors and request races are handled by useFetch (via
 * useEvidenceItem): when the id changes, the request for the previous id is
 * aborted, so a slow, outdated response can never overwrite the current one.
 */
export function EvidenceDetailRoute() {
  const { evidenceId = "" } = useParams<{ evidenceId: string }>();
  const { data, notes, onSaveNote, onReviewChange, withReviewEdits } =
    useLayoutContext();
  const { state, retry } = useEvidenceItem(evidenceId);

  if (state.status === "loading") {
    return (
      <Panel title={`Loading ${evidenceId}…`}>
        <div className="spinner" />
      </Panel>
    );
  }

  if (state.status === "error") {
    if (state.error instanceof ApiError && state.error.status === 404) {
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
      <ErrorState
        what={`evidence ${evidenceId}`}
        error={state.error}
        onRetry={retry}
      />
    );
  }

  const ev = withReviewEdits(normalizeEvidence(state.data, data.people));

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
