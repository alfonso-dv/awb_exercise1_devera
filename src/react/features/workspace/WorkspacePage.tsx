import { useLayoutContext } from "../../shared/data/caseDataOutlet.ts";
import { useBookmarks } from "../../shared/state/bookmarksContext.ts";
import { BookmarksList } from "./components/BookmarksList.tsx";
import { HypothesisForm } from "./components/HypothesisForm.tsx";
import { NotesList, type NoteEntry } from "./components/NotesList.tsx";

/** /workspace */
export function WorkspacePage() {
  const { data, notes } = useLayoutContext();
  const { bookmarks, toggleBookmark } = useBookmarks();

  // Both lists are derived from the single sources of truth (bookmarks,
  // notes) on every render — nothing here is stored separately.
  const bookmarkedItems = data.evidence.filter((ev) =>
    bookmarks.includes(ev.id)
  );
  const noteEntries: NoteEntry[] = data.evidence
    .filter((ev) => notes[ev.id])
    .map((ev) => ({ evidence: ev, text: notes[ev.id] ?? "" }));

  return (
    <section className="view active">
      <h2>Investigator Workspace</h2>
      <div className="workspace-grid">
        <div className="workspace-col">
          <h3>Bookmarked Evidence</h3>
          <BookmarksList
            items={bookmarkedItems}
            onToggleBookmark={toggleBookmark}
          />
        </div>
        <div className="workspace-col">
          <h3>Personal Notes</h3>
          <p className="hint-text">
            Notes are attached to whichever evidence item is currently open in
            the Evidence view.
          </p>
          <NotesList entries={noteEntries} />
        </div>
      </div>
      <HypothesisForm people={data.people} evidence={data.evidence} />
    </section>
  );
}
