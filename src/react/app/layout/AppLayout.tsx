import { useState } from "react";
import { Outlet } from "react-router";
import type { EvidenceId } from "../../../types.ts";
import { readStoredNotes, writeStoredNotes } from "../../../storage.ts";
import { ErrorState } from "../../shared/components/ErrorState.tsx";
import { LoadingState } from "../../shared/components/LoadingState.tsx";
import type { LayoutContext } from "../../shared/data/caseDataOutlet.ts";
import { useCaseData } from "../../shared/data/useCaseData.ts";
import { BookmarksProvider } from "../../shared/state/BookmarksProvider.tsx";
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
 * notes (Evidence detail, Workspace) and review edits (Evidence, Dashboard)
 * live here and reach the pages — with the callbacks to change them — through
 * the outlet context. Bookmarks (Evidence cards, Dashboard count, Workspace
 * list) are owned by <BookmarksProvider>, also placed here, and read with
 * useBookmarks().
 */
export function AppLayout() {
  const { state: caseData, retry } = useCaseData();

  // Lazy initialisers: localStorage is read once, on the first render only.
  const [notes, setNotes] =
    useState<Readonly<Record<EvidenceId, string>>>(readStoredNotes);
  const [reviewEdits, setReviewEdits] = useState<ReviewEdits>({});

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
      <ErrorState what="the case file" error={caseData.error} onRetry={retry} />
    );
  }

  if (caseData.status === "success") {
    const context: LayoutContext = {
      data: {
        ...caseData.data,
        evidence: applyReviewEdits(caseData.data.evidence, reviewEdits)
      },
      notes,
      onSaveNote: handleSaveNote,
      onReviewChange: handleReviewChange,
      withReviewEdits: (ev) => applyReviewEdits([ev], reviewEdits)[0] ?? ev
    };
    content = <Outlet context={context} />;
  }

  return (
    // Bookmarks are provided through React Context (useBookmarks()); the
    // rest of the shared state goes through the outlet context.
    <BookmarksProvider>
      <AppHeader />
      <main className="app-main">{content}</main>
    </BookmarksProvider>
  );
}
