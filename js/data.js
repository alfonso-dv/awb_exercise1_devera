import { state } from "./state.js";

export async function loadAllData({
  renderDashboard,
  populateAllDropdowns,
  applyStoredBookmarkFlags,
  renderEvidenceList,
  renderTimeline
}) {
  showLoadingOverlay("Loading case file…");
  state.loadingStepsRemaining = 2;

  await loadCorePeopleAndLocations(
    renderDashboard,
    populateAllDropdowns
  );

  loadEvidenceData(
    renderDashboard,
    populateAllDropdowns,
    applyStoredBookmarkFlags,
    renderEvidenceList
  );

  loadTimelineData(
    renderDashboard,
    populateAllDropdowns,
    renderTimeline
  );
}

function showLoadingOverlay(msg) {
  const overlay = document.getElementById("loadingOverlay");
  const text = document.getElementById("loadingText");

  if (text) {
    text.textContent = msg;
  }

  if (overlay) {
    overlay.classList.remove("hidden");
  }
}

function hideLoadingStep() {
  state.loadingStepsRemaining--;

  if (state.loadingStepsRemaining <= 0) {
    const overlay = document.getElementById("loadingOverlay");

    if (overlay) {
      overlay.classList.add("hidden");
    }
  }
}

async function loadCorePeopleAndLocations(
  renderDashboard,
  populateAllDropdowns
) {
  const caseRes = await fetch("data/case.json");
  const caseJson = await caseRes.json();
  state.caseData = caseJson;

  const peopleRes = await fetch("data/people.json");
  const peopleJson = await peopleRes.json();
  state.allPeople = peopleJson;

  const locationsRes = await fetch("data/locations.json");
  const locationsJson = await locationsRes.json();
  state.allLocations = locationsJson;

  hideLoadingStep();
  renderDashboard();
  populateAllDropdowns();
}

function loadEvidenceData(
  renderDashboard,
  populateAllDropdowns,
  applyStoredBookmarkFlags,
  renderEvidenceList
) {
  fetch("data/evidence.json")
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      state.allEvidence = data;
      state.evidenceViewLoading = false;

      applyStoredBookmarkFlags();

      state.filteredEvidence = state.allEvidence.slice();

      renderDashboard();
      populateAllDropdowns();

      if (state.currentPage === "evidence") {
        renderEvidenceList();
      }
    })
    .catch(function (err) {
      console.error("Failed to load evidence.json", err);

      alert(
        "Evidence could not be loaded. Some views may be incomplete."
      );
    });
}

async function loadTimelineData(
  renderDashboard,
  populateAllDropdowns,
  renderTimeline
) {
  try {
    const res = await fetch("data/timeline.json");
    const data = await res.json();

    state.allTimeline = data;

    renderDashboard();

    if (state.currentPage === "timeline") {
      renderTimeline();
    }

    populateAllDropdowns();
  } catch (err) {
    console.log("timeline load error", err);
  } finally {
    hideLoadingStep();
  }
}