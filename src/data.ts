import { state } from "./state.ts";
import type {
  CaseInfo,
  CaseLocation,
  Evidence,
  Person,
  PersonId,
  RawEvidence,
  TimelineEvent
} from "./types.ts";

export interface DataLoadCallbacks {
  renderDashboard: () => void;
  populateAllDropdowns: () => void;
  applyStoredBookmarkFlags: () => void;
  renderEvidenceList: () => void;
  renderTimeline: () => void;
}

/**
 * Fetches a JSON file and returns it as `T`.
 *
 * NOTE: the `as T` is a promise *we* make, not something TypeScript can check:
 * `res.json()` returns whatever is in the file. A malformed JSON file would
 * still type-check here and only fail later at runtime.
 */
async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: HTTP ${res.status}`);
  }

  return (await res.json()) as T;
}

/**
 * Resolves each entry of `personIds` to a canonical person id. The data uses
 * ids almost everywhere, but some entries use the display name instead.
 */
export function normalizeEvidence(
  raw: RawEvidence,
  people: Person[]
): Evidence {
  const personIds: PersonId[] = raw.personIds.map((ref) => {
    const byId = people.find((p) => p.id === ref);
    if (byId) return byId.id;

    const byName = people.find((p) => p.name === ref);
    if (byName) return byName.id;

    console.warn(`Evidence ${raw.id}: unknown person reference "${ref}"`);
    return ref;
  });

  return { ...raw, personIds };
}

export async function loadAllData({
  renderDashboard,
  populateAllDropdowns,
  applyStoredBookmarkFlags,
  renderEvidenceList,
  renderTimeline
}: DataLoadCallbacks): Promise<void> {
  showLoadingOverlay("Loading case file…");
  state.loadingStepsRemaining = 2;

  await loadCorePeopleAndLocations(renderDashboard, populateAllDropdowns);

  loadEvidenceData(
    renderDashboard,
    populateAllDropdowns,
    applyStoredBookmarkFlags,
    renderEvidenceList
  );

  // Deliberately not awaited: the timeline loads in the background while the
  // app is already usable. loadTimelineData() handles its own errors.
  void loadTimelineData(renderDashboard, populateAllDropdowns, renderTimeline);
}

function showLoadingOverlay(msg: string): void {
  const overlay = document.getElementById("loadingOverlay");
  const text = document.getElementById("loadingText");

  if (text) {
    text.textContent = msg;
  }

  if (overlay) {
    overlay.classList.remove("hidden");
  }
}

function hideLoadingStep(): void {
  state.loadingStepsRemaining--;

  if (state.loadingStepsRemaining <= 0) {
    const overlay = document.getElementById("loadingOverlay");

    if (overlay) {
      overlay.classList.add("hidden");
    }
  }
}

async function loadCorePeopleAndLocations(
  renderDashboard: () => void,
  populateAllDropdowns: () => void
): Promise<void> {
  state.caseData = await fetchJson<CaseInfo>("data/case.json");
  state.allPeople = await fetchJson<Person[]>("data/people.json");
  state.allLocations = await fetchJson<CaseLocation[]>("data/locations.json");

  hideLoadingStep();
  renderDashboard();
  populateAllDropdowns();
}

function loadEvidenceData(
  renderDashboard: () => void,
  populateAllDropdowns: () => void,
  applyStoredBookmarkFlags: () => void,
  renderEvidenceList: () => void
): void {
  fetchJson<RawEvidence[]>("data/evidence.json")
    .then(function (data) {
      state.allEvidence = data.map((raw) =>
        normalizeEvidence(raw, state.allPeople)
      );
      state.evidenceViewLoading = false;

      applyStoredBookmarkFlags();

      state.filteredEvidence = state.allEvidence.slice();

      renderDashboard();
      populateAllDropdowns();

      if (state.currentPage === "evidence") {
        renderEvidenceList();
      }
    })
    .catch(function (err: unknown) {
      console.error("Failed to load evidence.json", err);

      alert("Evidence could not be loaded. Some views may be incomplete.");
    });
}

async function loadTimelineData(
  renderDashboard: () => void,
  populateAllDropdowns: () => void,
  renderTimeline: () => void
): Promise<void> {
  try {
    state.allTimeline = await fetchJson<TimelineEvent[]>("data/timeline.json");

    renderDashboard();

    if (state.currentPage === "timeline") {
      renderTimeline();
    }

    populateAllDropdowns();
  } catch (err) {
    console.error("Failed to load timeline.json", err);
  } finally {
    hideLoadingStep();
  }
}
