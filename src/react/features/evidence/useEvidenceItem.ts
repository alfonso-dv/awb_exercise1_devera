import { normalizeEvidence } from "../../../data.ts";
import type { Evidence, Person } from "../../../types.ts";
import { getEvidenceItem } from "../../shared/api/caseApi.ts";
import { useFetch, type FetchResult } from "../../shared/hooks/useFetch.ts";

/**
 * One evidence item, fetched fresh from the server whenever the id changes,
 * already converted from the API's raw shape to the app's Evidence model
 * (person references resolved to ids).
 */
export function useEvidenceItem(
  id: string,
  people: readonly Person[]
): FetchResult<Evidence> {
  return useFetch(`evidence/${id}`, async (signal) =>
    normalizeEvidence(await getEvidenceItem(id, signal), [...people])
  );
}
