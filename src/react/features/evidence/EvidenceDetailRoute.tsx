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

/** The last response that arrived (null = nothing has arrived yet). */
type ItemResult =
  { status: "error"; error: unknown } | { status: "ready"; item: RawEvidence };

/**
 * /evidence/:evidenceId — fetches the selected item fresh from the server
 * (GET /api/evidence/:id) whenever the id in the URL changes.
 *
 * ⚠️ NAIVE VERSION (Exercise 6, Demo 7 — before the fix): responses are used
 * in whatever order they arrive. Open E01 and then quickly E02 with
 * react.html?slow=E01&delay=3000#/evidence — E02 appears, then E01's late
 * response overwrites it while the URL still says E02.
 */
export function EvidenceDetailRoute() {
  const { evidenceId = "" } = useParams<{ evidenceId: string }>();
  const { data, notes, onSaveNote, onReviewChange, withReviewEdits } =
    useLayoutContext();
  const [result, setResult] = useState<ItemResult | null>(null);

  useEffect(() => {
    getEvidenceItem(evidenceId)
      .then((item) => setResult({ status: "ready", item }))
      .catch((error: unknown) => setResult({ status: "error", error }));
  }, [evidenceId]);

  if (result === null) {
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
