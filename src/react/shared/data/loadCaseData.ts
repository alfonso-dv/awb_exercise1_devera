import { normalizeEvidence } from "../../../data.ts";
import {
  getCaseInfo,
  getEvidenceList,
  getLocations,
  getPeople,
  getTimeline
} from "../api/caseApi.ts";
import type {
  CaseInfo,
  CaseLocation,
  Evidence,
  Person,
  TimelineEvent
} from "../../../types.ts";

/** Everything the React views need, loaded once for the whole app. */
export interface CaseData {
  caseInfo: CaseInfo;
  people: Person[];
  locations: CaseLocation[];
  evidence: Evidence[];
  timeline: TimelineEvent[];
}

/**
 * Loads all case data through the API layer (the dev backend, or the static
 * files in production). The 5 requests run in parallel; `signal` cancels all
 * of them at once.
 */
export async function loadCaseData(signal?: AbortSignal): Promise<CaseData> {
  const [caseInfo, people, locations, rawEvidence, timeline] =
    await Promise.all([
      getCaseInfo(signal),
      getPeople(signal),
      getLocations(signal),
      getEvidenceList(signal),
      getTimeline(signal)
    ]);

  return {
    caseInfo,
    people,
    locations,
    evidence: rawEvidence.map((raw) => normalizeEvidence(raw, people)),
    timeline
  };
}
