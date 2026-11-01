import { useFetch, type FetchResult } from "../hooks/useFetch.ts";
import { loadCaseData, type CaseData } from "./loadCaseData.ts";

/**
 * All case data for the app (used once, by <AppLayout />, which never
 * unmounts — so the data survives navigation between views).
 */
export function useCaseData(): FetchResult<CaseData> {
  return useFetch("case-data", loadCaseData);
}
