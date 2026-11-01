import { useEffect, useState, type FormEvent } from "react";
import type { Evidence, Person } from "../../../../types.ts";
import {
  readStoredHypothesis,
  writeStoredHypothesis,
  type HypothesisDraft
} from "../../../../storage.ts";

/** The editable fields (savedAt is set when saving). */
type DraftFields = Omit<HypothesisDraft, "savedAt">;

/** How long the "Saved at …" confirmation stays visible. */
const SAVED_MESSAGE_MS = 4000;

const EMPTY_DRAFT: DraftFields = {
  suspectId: "",
  nature: "",
  evidenceIds: [],
  confidence: "50",
  explanation: "",
  alternative: ""
};

/** Starts from the saved draft, falling back to defaults for missing fields. */
function initialDraft(): DraftFields {
  const stored = readStoredHypothesis();
  return {
    suspectId: stored.suspectId ?? EMPTY_DRAFT.suspectId,
    nature: stored.nature ?? EMPTY_DRAFT.nature,
    evidenceIds: stored.evidenceIds ?? EMPTY_DRAFT.evidenceIds,
    confidence: stored.confidence ?? EMPTY_DRAFT.confidence,
    explanation: stored.explanation ?? EMPTY_DRAFT.explanation,
    alternative: stored.alternative ?? EMPTY_DRAFT.alternative
  };
}

interface HypothesisFormProps {
  people: readonly Person[];
  evidence: readonly Evidence[];
}

/**
 * Fully controlled form: every field's value comes from the `draft` state
 * object and every change goes through `updateField`. Saving reads the state,
 * not the DOM.
 */
export function HypothesisForm({ people, evidence }: HypothesisFormProps) {
  const [draft, setDraft] = useState<DraftFields>(initialDraft);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [saveError, setSaveError] = useState(false);

  // Hide the "Saved at …" message again after a few seconds. The timer is a
  // side effect, so it lives in an effect; the cleanup cancels it when the
  // user saves again (savedAt changes) or leaves the page. Without the
  // cleanup, a timer from an earlier save would hide the NEW message early.
  useEffect(() => {
    if (savedAt === null) return;
    const timer = setTimeout(() => setSavedAt(null), SAVED_MESSAGE_MS);
    return () => clearTimeout(timer);
  }, [savedAt]);

  function updateField<K extends keyof DraftFields>(
    field: K,
    value: DraftFields[K]
  ): void {
    // New object with one field replaced — never draft[field] = value.
    setDraft((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault(); // stay on the page instead of a browser form submit

    const toSave: HypothesisDraft = {
      ...draft,
      savedAt: new Date().toISOString()
    };
    try {
      writeStoredHypothesis(toSave);
      setSaveError(false);
      setSavedAt(toSave.savedAt); // ISO timestamp: unique per save
    } catch (err) {
      console.error("Could not save hypothesis draft", err);
      setSaveError(true);
    }
  }

  return (
    <div className="hypothesis-card">
      <h3>Hypothesis Draft</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <label htmlFor="hypSuspect">Suspected responsible person</label>
          <select
            id="hypSuspect"
            value={draft.suspectId}
            onChange={(e) => updateField("suspectId", e.target.value)}
          >
            <option value="">Select a person…</option>
            {people.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <label htmlFor="hypNature">Accidental or deliberate incident</label>
          <select
            id="hypNature"
            value={draft.nature}
            onChange={(e) => updateField("nature", e.target.value)}
          >
            <option value="">Select…</option>
            <option value="accidental">Accidental</option>
            <option value="deliberate">Deliberate</option>
            <option value="unclear">Unclear</option>
          </select>
        </div>

        <div className="form-row">
          <label htmlFor="hypEvidence">Selected supporting evidence</label>
          <select
            id="hypEvidence"
            multiple
            size={6}
            value={draft.evidenceIds}
            onChange={(e) =>
              updateField(
                "evidenceIds",
                Array.from(e.target.selectedOptions, (option) => option.value)
              )
            }
          >
            {evidence.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.id} - {ev.title}
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <label htmlFor="hypConfidence">Confidence (0–100)</label>
          <input
            type="range"
            id="hypConfidence"
            min={0}
            max={100}
            value={draft.confidence}
            onChange={(e) => updateField("confidence", e.target.value)}
          />
          {/* Derived from state — no separate listener updating this text. */}
          <output htmlFor="hypConfidence">{draft.confidence}</output>
        </div>

        <div className="form-row">
          <label htmlFor="hypExplanation">Written explanation</label>
          <textarea
            id="hypExplanation"
            rows={4}
            placeholder="Explain your reasoning…"
            value={draft.explanation}
            onChange={(e) => updateField("explanation", e.target.value)}
          />
        </div>

        <div className="form-row">
          <label htmlFor="hypAlternative">Alternative explanation</label>
          <textarea
            id="hypAlternative"
            rows={3}
            placeholder="What else could explain the evidence?"
            value={draft.alternative}
            onChange={(e) => updateField("alternative", e.target.value)}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Save hypothesis draft
          </button>
          {savedAt && !saveError && (
            <span className="saved-msg">
              Saved at {new Date(savedAt).toLocaleTimeString()}
            </span>
          )}
          {saveError && (
            <span className="saved-msg">Could not save to local storage.</span>
          )}
        </div>
      </form>
    </div>
  );
}
