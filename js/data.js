import { state } from "./state.js";

export function loadAllData({
  renderDashboard,
  populateAllDropdowns,
  applyStoredBookmarkFlags,
  renderEvidenceList,
  renderTimeline
}) {
  showLoadingOverlay("Loading case file…");
  state.loadingStepsRemaining = 2;

  return loadCorePeopleAndLocations(
    renderDashboard,
    populateAllDropdowns
  ).then(function () {
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
  });
}

function showLoadingOverlay(msg) {
  var overlay = document.getElementById("loadingOverlay");
  var text = document.getElementById("loadingText");

  if (text) text.textContent = msg;
  if (overlay) overlay.classList.remove("hidden");
}

function hideLoadingStep() {
  state.loadingStepsRemaining--;

  if (state.loadingStepsRemaining <= 0) {
    var overlay = document.getElementById("loadingOverlay");

    if (overlay) {
      overlay.classList.add("hidden");
    }
  }
}

function loadCorePeopleAndLocations(
  renderDashboard,
  populateAllDropdowns
) {
  return fetch("data/case.json").then(function (caseRes) {
    return caseRes.json().then(function (caseJson) {
      state.caseData = caseJson;

      return fetch("data/people.json").then(function (peopleRes) {
        return peopleRes.json().then(function (peopleJson) {
          state.allPeople = peopleJson;

          return fetch("data/locations.json").then(function (locationsRes) {
            return locationsRes.json().then(function (locationsJson) {
              state.allLocations = locationsJson;

              hideLoadingStep();
              renderDashboard();
              populateAllDropdowns();
            });
          });
        });
      });
    });
  });
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

      console.log(
        "Same array?",
        state.filteredEvidence === state.allEvidence
      );

      console.log("Original:", state.allEvidence.map(function (ev) {
        return ev.title;
      }));

      state.filteredEvidence.sort(function (a, b) {
        return a.title.localeCompare(b.title);
      });

      console.log(
        "allEvidence after filteredEvidence sort:",
        state.allEvidence.map(function (ev) {
        return ev.title;
      })
    );

      //this log is used to check if the original array is sorted or not and bypasses the bug that is yet to be fixed.

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

function loadTimelineData(
  renderDashboard,
  populateAllDropdowns,
  renderTimeline
) {
  return fetch("data/timeline.json")
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      state.allTimeline = data;

      renderDashboard();

      if (state.currentPage === "timeline") {
        renderTimeline();
      }

      populateAllDropdowns();
    })
    .catch(function (err) {
      console.log("timeline load error", err);
    })
    .finally(function () {
      hideLoadingStep();
    });
}