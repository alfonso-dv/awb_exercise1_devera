import { useState } from "react";
import { Outlet } from "react-router";
import type { EvidenceId } from "../../../types.ts";
import {
  readStoredBookmarks,
  readStoredNotes,
  writeStoredBookmarks,
  writeStoredNotes
} from "../../../storage.ts";
import { LoadingState } from "../../shared/components/LoadingState.tsx";
import type { LayoutContext } from "../../shared/data/caseDataOutlet.ts";
import { useCaseData } from "../../shared/data/useCaseData.ts";
import { toggleBookmarkId } from "../../shared/state/bookmarks.ts";
import {
  applyReviewEdits,
  setReviewField,
  type ReviewEdits,
  type ReviewField
} from "../../shared/state/reviewEdits.ts";
import { AppHeader } from "./AppHeader.tsx";

/**
 * Layout route: the header stays on screen for every page, the matched child
 * route renders where <Outlet /> is.
 *
 * It is also the lowest common owner of the state that several pages share:
 * bookmarks (Evidence cards, Dashboard count, Workspace list), notes
 * (Evidence detail, Workspace) and review edits (Evidence, Dashboard). The
 * state lives here, once; pages get it — and the callbacks to change it —
 * through the outlet context.
 */
export function AppLayout() {
  const caseData = useCaseData();

  // Lazy initialisers: localStorage is read once, on the first render only.
  const [bookmarks, setBookmarks] =
    useState<readonly EvidenceId[]>(readStoredBookmarks);
  const [notes, setNotes] =
    useState<Readonly<Record<EvidenceId, string>>>(readStoredNotes);
  const [reviewEdits, setReviewEdits] = useState<ReviewEdits>({});

  function handleToggleBookmark(id: EvidenceId): void {
    const next = toggleBookmarkId(bookmarks, id);
    setBookmarks(next);
    writeStoredBookmarks(next);
  }

  function handleSaveNote(id: EvidenceId, text: string): void {
    const next = { ...notes, [id]: text };
    setNotes(next);
    writeStoredNotes(next);
  }

  function handleReviewChange(
    id: EvidenceId,
    field: ReviewField,
    value: string
  ): void {
    setReviewEdits((prev) => setReviewField(prev, id, field, value));
  }

  let content = null;

  if (caseData.status === "loading") content = <LoadingState />;

  if (caseData.status === "error") {
    content = (
      <div className="warning-banner">
        The case file could not be loaded. Please reload the page.
      </div>
    );
  }

  if (caseData.status === "ready") {
    const context: LayoutContext = {
      data: {
        ...caseData.data,
        evidence: applyReviewEdits(caseData.data.evidence, reviewEdits)
      },
      bookmarks,
      onToggleBookmark: handleToggleBookmark,
      notes,
      onSaveNote: handleSaveNote,
      onReviewChange: handleReviewChange
    };
    content = <Outlet context={context} />;
  }

  return (
    <>
      <AppHeader />
      <main className="app-main">{content}</main>
    </>
  );
}
