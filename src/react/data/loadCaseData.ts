import { fetchJson, normalizeEvidence } from "../../data.ts";
import { readStoredBookmarks } from "../../storage.ts";
import type {
  CaseInfo,
  CaseLocation,
  Evidence,
  Person,
  RawEvidence,
  TimelineEvent
} from "../../types.ts";

/** Everything the React views need, loaded once for the whole app. */
export interface CaseData {
  caseInfo: CaseInfo;
  people: Person[];
  locations: CaseLocation[];
  evidence: Evidence[];
  timeline: TimelineEvent[];
  /** Bookmarked evidence ids (shared with the vanilla app via localStorage). */
  bookmarks: string[];
}

/**
 * Reuses the typed loader helpers from Exercise 2 (fetchJson,
 * normalizeEvidence). Unlike the vanilla app, which loads in three stages and
 * re-renders after each, the files are requested in parallel and the views
 * render once everything is there.
 */
export async function loadCaseData(): Promise<CaseData> {
  const [caseInfo, people, locations, rawEvidence, timeline] =
    await Promise.all([
      fetchJson<CaseInfo>("data/case.json"),
      fetchJson<Person[]>("data/people.json"),
      fetchJson<CaseLocation[]>("data/locations.json"),
      fetchJson<RawEvidence[]>("data/evidence.json"),
      fetchJson<TimelineEvent[]>("data/timeline.json")
    ]);

  return {
    caseInfo,
    people,
    locations,
    evidence: rawEvidence.map((raw) => normalizeEvidence(raw, people)),
    timeline,
    bookmarks: readStoredBookmarks()
  };
}
