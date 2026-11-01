import { useState } from "react";

interface NoteEditorProps {
  /** The note as currently saved. */
  savedNote: string;
  onSave: (text: string) => void;
}

/**
 * Controlled textarea with a local draft: typing changes only the draft, and
 * "Save note" hands it to the owner of the notes state.
 */
export function NoteEditor({ savedNote, onSave }: NoteEditorProps) {
  const [draft, setDraft] = useState(savedNote);

  return (
    <>
      <div className="detail-field">
        <strong>Investigator note</strong>
        <textarea
          className="note-textarea"
          rows={3}
          placeholder="Add a private note about this evidence..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button
          type="button"
          className="btn btn-primary btn-small"
          style={{ marginTop: 6 }}
          onClick={() => onSave(draft)}
        >
          Save note
        </button>
      </div>
      <div className="detail-field">
        <strong>Note preview</strong>
        <div>{savedNote}</div>
      </div>
    </>
  );
}
