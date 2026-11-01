import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { normalizeEvidence } from "../../../data.ts";
import type { RawEvidence } from "../../../types.ts";
import { getEvidenceItem } from "../../shared/api/caseApi.ts";
import { ApiError } from "../../shared/api/http.ts";
import { ErrorState } from "../../shared/components/ErrorState.tsx";
import { Panel } from "../../shared/components/Panel.tsx";
import { useLayoutContext } from "../../shared/data/caseDataOutlet.ts";
import { EvidenceDetail } from "./components/EvidenceDetail.tsx";

/** A finished request, remembered together with the id it was for. */
type ItemResult =
  | { forId: string; status: "error"; error: unknown }
  | { forId: string; status: "ready"; item: RawEvidence };

/**
 * /evidence/:evidenceId — fetches the selected item fresh from the server
 * (GET /api/evidence/:id) whenever the id in the URL changes.
 *
 * Request races: when the id changes, the effect's cleanup aborts the
 * request for the previous id (AbortController), so a slow, outdated response
 * can never overwrite the current one. Each result also remembers which id it
 * belongs to; anything else counts as "still loading".
 */
export function EvidenceDetailRoute() {
  const { evidenceId = "" } = useParams<{ evidenceId: string }>();
  const { data, notes, onSaveNote, onReviewChange, withReviewEdits } =
    useLayoutContext();
  const [result, setResult] = useState<ItemResult | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    getEvidenceItem(evidenceId, controller.signal)
      .then((item) => setResult({ forId: evidenceId, status: "ready", item }))
      .catch((error: unknown) => {
        // Aborted on purpose (id changed / unmounted): not an error to show.
        if (controller.signal.aborted) return;
        setResult({ forId: evidenceId, status: "error", error });
      });

    // Cleanup: runs before the effect runs again for a new id, and on
    // unmount. Aborting cancels the HTTP request AND makes its promise
    // reject, so the .then above never sets state for an old id.
    return () => controller.abort();
  }, [evidenceId]);

  // No result yet for THIS id (first load, or the id just changed).
  if (result === null || result.forId !== evidenceId) {
    return (
      <Panel title={`Loading ${evidenceId}…`}>
        <div className="spinner" />
      </Panel>
    );
  }

  if (result.status === "error") {
    if (result.error instanceof ApiError && result.error.status === 404) {
      return (
        <Panel title="Evidence not found">
          <p>
            There is no evidence item <code>{evidenceId}</code>.
          </p>
          <Link to="/evidence">Close</Link>
        </Panel>
      );
    }
    return <ErrorState what={`evidence ${evidenceId}`} error={result.error} />;
  }

  const ev = withReviewEdits(normalizeEvidence(result.item, data.people));

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
