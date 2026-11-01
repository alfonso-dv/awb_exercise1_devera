import type { RawEvidence } from "../../../types.ts";
import { getEvidenceItem } from "../../shared/api/caseApi.ts";
import { useFetch, type FetchResult } from "../../shared/hooks/useFetch.ts";

/** One evidence item, fetched fresh from the server whenever the id changes. */
export function useEvidenceItem(id: string): FetchResult<RawEvidence> {
  return useFetch(`evidence/${id}`, (signal) => getEvidenceItem(id, signal));
}
