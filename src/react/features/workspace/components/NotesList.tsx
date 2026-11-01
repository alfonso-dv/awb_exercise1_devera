import type { Evidence } from "../../../../types.ts";
import { EmptyState } from "../../../shared/components/EmptyState.tsx";

export interface NoteEntry {
  evidence: Evidence;
  text: string;
}

interface NotesListProps {
  entries: readonly NoteEntry[];
}

export function NotesList({ entries }: NotesListProps) {
  if (entries.length === 0) {
    return (
      <EmptyState>
        No notes yet. Add one from an evidence item&apos;s detail view.
      </EmptyState>
    );
  }

  return (
    <div className="notes-list">
      {entries.map(({ evidence, text }) => (
        <div key={evidence.id} className="mini-list-item">
          <strong>{evidence.id}</strong> &mdash; {evidence.title}
          <div>{text}</div>
        </div>
      ))}
    </div>
  );
}
