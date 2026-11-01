import { Link } from "react-router";
import type { CaseLocation, Evidence, Person } from "../../../../types.ts";
import { formatDate } from "../../../../utils.ts";
import type { ReviewField } from "../../../shared/state/reviewEdits.ts";
import { NoteEditor } from "./NoteEditor.tsx";

interface EvidenceDetailProps {
  evidence: Evidence;
  /** Resolved related people / locations. */
  people: readonly Person[];
  locations: readonly CaseLocation[];
  savedNote: string;
  onReviewChange: (field: ReviewField, value: string) => void;
  onSaveNote: (text: string) => void;
}

export function EvidenceDetail({
  evidence: ev,
  people,
  locations,
  savedNote,
  onReviewChange,
  onSaveNote
}: EvidenceDetailProps) {
  return (
    <section className="evidence-detail">
      <div className="evidence-detail-header">
        <div>
          <h2>{ev.title}</h2>
          <div className="evidence-meta">
            {ev.id} &middot; {ev.type} &middot; {formatDate(ev.timestamp)}
          </div>
        </div>
        <Link to="/evidence" className="btn btn-secondary btn-small">
          Close
        </Link>
      </div>

      {ev.tags.includes("critical") && (
        <div className="warning-banner">
          This item is tagged as critical evidence.
        </div>
      )}

      <div className="detail-field">
        <strong>Summary</strong>
        {ev.summary}
      </div>
      <div className="evidence-detail-content">{ev.content}</div>

      <div className="detail-field">
        <strong>Related people</strong>
        {people.map((person, i) => (
          <span key={person.id}>
            {i > 0 && ", "}
            <Link to={`/team/people/${encodeURIComponent(person.id)}`}>
              {person.name}
            </Link>
          </span>
        ))}
      </div>
      <div className="detail-field">
        <strong>Related locations</strong>
        {locations.map((loc) => `${loc.id} - ${loc.name}`).join(", ")}
      </div>
      <div className="detail-field">
        <strong>Tags</strong>
        {ev.tags.map((tag) => (
          <span key={tag} className="tag-chip">
            {tag}
          </span>
        ))}
      </div>

      <div className="detail-field">
        <strong>Review status</strong>
        <select
          value={ev.status.toLowerCase()}
          onChange={(e) => onReviewChange("status", e.target.value)}
        >
          <option value="unreviewed">Unreviewed</option>
          <option value="reviewed">Reviewed</option>
          <option value="flagged">Flagged</option>
        </select>
      </div>
      <div className="detail-field">
        <strong>Relevance</strong>
        <select
          value={ev.relevance.toLowerCase()}
          onChange={(e) => onReviewChange("relevance", e.target.value)}
        >
          <option value="unknown">Unknown</option>
          <option value="relevant">Relevant</option>
          <option value="irrelevant">Irrelevant</option>
        </select>
      </div>

      <NoteEditor savedNote={savedNote} onSave={onSaveNote} />
    </section>
  );
}
