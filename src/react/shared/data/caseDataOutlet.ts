import { useOutletContext } from "react-router";
import type { EvidenceId } from "../../../types.ts";
import type { ReviewField } from "../state/reviewEdits.ts";
import type { CaseData } from "./loadCaseData.ts";

/**
 * Everything <AppLayout /> hands to the pages through React Router's
 * <Outlet context={...} />: the loaded case data, the state it owns, and the
 * callbacks that change that state.
 */
export interface LayoutContext {
  /** Case data; `evidence` already includes the investigator's review edits. */
  data: CaseData;
  /** Saved notes, evidence id -> text. */
  notes: Readonly<Record<EvidenceId, string>>;
  onSaveNote: (id: EvidenceId, text: string) => void;
  onReviewChange: (id: EvidenceId, field: ReviewField, value: string) => void;
}

/** The whole layout context (state + callbacks). */
export function useLayoutContext(): LayoutContext {
  return useOutletContext<LayoutContext>();
}

/** Shortcut for pages that only need to read the case data. */
export function useCaseDataFromLayout(): CaseData {
  return useLayoutContext().data;
}
