// Importing the stylesheet through the module graph lets Vite hot-swap CSS (HMR)
// and bundle/minify it for production.
import "./styles.css";

// GLOBAL STATE IN state.js

import { state } from "./src/state.ts";

import { navigateTo } from "./src/utils.ts";

import { loadAllData } from "./src/data.ts";

import {
  loadBookmarksFromStorage,
  loadNotesFromStorage
} from "./src/storage.ts";

import { setupEventListeners } from "./src/events.js";

import {
  renderDashboard,
  populateAllDropdowns,
  renderEvidenceList,
  applyStoredBookmarkFlags,
  handleSortChange,
  clearFilters,
  handleSearchInput,
  closeEvidenceDetail,
  saveCurrentNote,
  switchPeopleTab,
  renderPeople,
  renderLocations,
  renderTimeline,
  renderWorkspace,
  saveHypothesis
} from "./src/render.js";

// IMPORTS THE REFACTORED CODE FROM MODULES

// ---------------------------------------------------------------------
// DATA LOADING IN data.js
// ---------------------------------------------------------------------

// ---------------------------------------------------------------------
// GENERIC LOOKUP HELPERS IN utils.js
// ---------------------------------------------------------------------

// ---------------------------------------------------------------------
// NAVIGATION IN utils.js / HASH ROUTING
// ---------------------------------------------------------------------

function handleHashChange() {
  let hash = window.location.hash.replace("#", "");

  const validViews = [
    "dashboard",
    "evidence",
    "people",
    "timeline",
    "workspace"
  ];

  if (validViews.indexOf(hash) === -1) {
    hash = "dashboard";
  }

  state.currentPage = hash;

  const sections = document.querySelectorAll(".view");

  for (let i = 0; i < sections.length; i++) {
    sections[i].classList.remove("active");
  }

  document.getElementById("view-" + hash).classList.add("active");

  const navButtons = document.querySelectorAll(".nav-btn");

  for (let n = 0; n < navButtons.length; n++) {
    navButtons[n].classList.remove("active");

    if (navButtons[n].getAttribute("data-view") === hash) {
      navButtons[n].classList.add("active");
    }
  }

  if (hash === "dashboard" && !state.viewRendered.dashboard) {
    renderDashboard();
    state.viewRendered.dashboard = true;
  } else if (hash === "evidence" && !state.viewRendered.evidence) {
    renderEvidenceList();
    state.viewRendered.evidence = true;
  } else if (hash === "people" && !state.viewRendered.people) {
    renderPeople();
    renderLocations();
    state.viewRendered.people = true;
  } else if (hash === "timeline" && !state.viewRendered.timeline) {
    renderTimeline();
    state.viewRendered.timeline = true;
  } else if (hash === "workspace") {
    // workspace is cheap enough that it always re-renders
    renderWorkspace();
  }
}

// ---------------------------------------------------------------------
// DASHBOARD IN render.js
// ---------------------------------------------------------------------

// ---------------------------------------------------------------------
// EVIDENCE CATALOGUE IN render.js
// ---------------------------------------------------------------------

// ---------------------------------------------------------------------
// EVIDENCE DETAIL in render.js
// ---------------------------------------------------------------------

// ---------------------------------------------------------------------
// PEOPLE & LOCATIONS in render.js
// ---------------------------------------------------------------------

// ---------------------------------------------------------------------
// TIMELINE in render.js
// ---------------------------------------------------------------------

// ---------------------------------------------------------------------
// WORKSPACE in render.js
// ---------------------------------------------------------------------

// ---------------------------------------------------------------------
// LOCAL STORAGE HELPERS (bookmarks & notes) IN storage.js
// ---------------------------------------------------------------------

// ---------------------------------------------------------------------
// EVENT LISTENER SETUP in events.js
// ---------------------------------------------------------------------

// ---------------------------------------------------------------------
// INLINE HTML HANDLER COMPATIBILITY
// ---------------------------------------------------------------------

window.navigateTo = navigateTo;
window.switchPeopleTab = switchPeopleTab;
window.handleSortChange = handleSortChange;
window.saveHypothesis = saveHypothesis;
window.closeEvidenceDetail = closeEvidenceDetail;
window.saveCurrentNote = saveCurrentNote;
window.renderEvidenceList = renderEvidenceList;

// ---------------------------------------------------------------------
// INIT
// ---------------------------------------------------------------------

function initApp() {
  loadBookmarksFromStorage();
  loadNotesFromStorage();

  setupEventListeners({
    handleSearchInput: handleSearchInput,
    renderEvidenceList: renderEvidenceList,
    clearFilters: clearFilters,
    renderTimeline: renderTimeline
  });

  loadAllData({
    renderDashboard: renderDashboard,
    populateAllDropdowns: populateAllDropdowns,
    applyStoredBookmarkFlags: applyStoredBookmarkFlags,
    renderEvidenceList: renderEvidenceList,
    renderTimeline: renderTimeline
  }).then(function () {
    handleHashChange();
  });
}

window.addEventListener("DOMContentLoaded", initApp);
window.addEventListener("hashchange", handleHashChange);
