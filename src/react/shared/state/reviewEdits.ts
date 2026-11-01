import type { Evidence, EvidenceId } from "../../../types.ts";

export type ReviewField = "status" | "relevance";

/** Review status / relevance changed by the investigator, per evidence item. */
export type ReviewEdits = Readonly<
  Record<EvidenceId, Readonly<Partial<Record<ReviewField, string>>>>
>;

/** Pure: a new edits object with one field of one item changed. */
export function setReviewField(
  edits: ReviewEdits,
  id: EvidenceId,
  field: ReviewField,
  value: string
): ReviewEdits {
  return { ...edits, [id]: { ...edits[id], [field]: value } };
}

/**
 * Derived, not stored: the evidence list as the app shows it = the loaded
 * evidence with the investigator's edits applied. The loaded objects are never
 * changed; edited items are replaced by copies.
 */
export function applyReviewEdits(
  evidence: readonly Evidence[],
  edits: ReviewEdits
): Evidence[] {
  return evidence.map((ev) => (edits[ev.id] ? { ...ev, ...edits[ev.id] } : ev));
}
