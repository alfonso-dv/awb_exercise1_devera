import type {
  CaseInfo,
  CaseLocation,
  Evidence,
  Person,
  TimelineEvent
} from "./types.ts";

export type ViewName =
  "dashboard" | "evidence" | "people" | "timeline" | "workspace";

export type PeopleTab = "people" | "locations";

export interface AppState {
  allEvidence: Evidence[];
  filteredEvidence: Evidence[];
  selectedEvidence: Evidence | null;
  bookmarks: string[];
  currentPage: ViewName;

  allPeople: Person[];
  allLocations: CaseLocation[];
  allTimeline: TimelineEvent[];
  caseData: Partial<CaseInfo>;

  currentPeopleTab: PeopleTab;
  loadingStepsRemaining: number;
  evidenceViewLoading: boolean;

  viewRendered: Record<ViewName, boolean>;

  /** evidence id -> note text */
  notesStore: Record<string, string>;
  latestSearchRequestId: number;
}

export const state: AppState = {
  allEvidence: [],
  filteredEvidence: [],
  selectedEvidence: null,
  bookmarks: [],
  currentPage: "dashboard",

  allPeople: [],
  allLocations: [],
  allTimeline: [],
  caseData: {},

  currentPeopleTab: "people",
  loadingStepsRemaining: 2,
  evidenceViewLoading: true,

  viewRendered: {
    dashboard: false,
    evidence: false,
    people: false,
    timeline: false,
    workspace: false
  },

  notesStore: {},
  latestSearchRequestId: 0
};

export const STORAGE_KEY_BOOKMARKS = "remotion_bookmarks";
export const STORAGE_KEY_NOTES = "remotion_notes";
export const STORAGE_KEY_HYPOTHESIS = "remotion_hypothesis";
