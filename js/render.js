import { state, STORAGE_KEY_HYPOTHESIS } from "./state.js";

import {
  evidenceMentionsPerson,
  formatDate,
  getStatusBadgeClass,
  getRelevanceBadgeClass,
  certaintyBadgeClass,
  findEvidenceById,
  findPersonById,
  findLocationById,
  navigateTo
} from "./utils.js";

import {
  saveBookmarksToStorage,
  saveNoteForEvidence,
  loadNoteForEvidence
} from "./storage.js";

export function renderDashboard() {
  const container = document.getElementById("dashboardContent");
  if (!container) return;

  let reviewedCount = 0;

  for (let i = 0; i < state.allEvidence.length; i++) {
    if ((state.allEvidence[i].status || "").toLowerCase() === "reviewed") {
      reviewedCount++;
    }
  }

  const progressPct =
    state.allEvidence.length === 0
      ? 0
      : Math.round((reviewedCount / state.allEvidence.length) * 100);

  let html = "";

  html += '<div class="case-summary-card">';
  html += "<h3>" + (state.caseData.title || "Case") + "</h3>";

  html +=
    '<p><span class="badge badge-flagged">' +
    (state.caseData.status || "unknown").toUpperCase() +
    "</span></p>";

  html += "<p>" + (state.caseData.summary || "") + "</p>";
  html += "</div>";

  html += '<div class="stat-grid">';
  html += statCardHTML(state.allEvidence.length, "Evidence items");
  html += statCardHTML(state.allPeople.length, "People");
  html += statCardHTML(state.allLocations.length, "Locations");
  html += statCardHTML(state.bookmarks.length, "Bookmarked");
  html += statCardHTML(reviewedCount, "Reviewed");
  html += "</div>";

  html += '<div class="dashboard-panel">';
  html += "<h3>Review progress</h3>";

  html +=
    '<div class="progress-bar-outer"><div class="progress-bar-inner" style="width:' +
    progressPct +
    '%;"></div></div>';

  html += "<p>" + progressPct + "% of evidence reviewed</p>";

  html += "</div>";

  html += '<div class="dashboard-columns">';

  html += '<div class="dashboard-panel"><h3>Recent evidence</h3>';

  const recentEvidence = state.allEvidence.slice(-5).reverse();

  if (recentEvidence.length === 0) {
    html += "<p>No evidence loaded yet.</p>";
  }

  for (let e = 0; e < recentEvidence.length; e++) {
    const ev = recentEvidence[e];

    html +=
      '<div class="mini-list-item"><strong>' +
      ev.id +
      "</strong> &mdash; " +
      ev.title +
      ' <span class="badge ' +
      getStatusBadgeClass(ev.status) +
      '">' +
      ev.status +
      "</span></div>";
  }

  html += "</div>";

  html += '<div class="dashboard-panel"><h3>Recent timeline events</h3>';

  const recentTimeline = state.allTimeline.slice(-5).reverse();

  if (recentTimeline.length === 0) {
    html += "<p>No timeline events loaded yet.</p>";
  }

  for (let t = 0; t < recentTimeline.length; t++) {
    const evt = recentTimeline[t];

    html +=
      '<div class="mini-list-item"><strong>' +
      formatDate(evt.time) +
      "</strong><br>" +
      evt.title +
      "</div>";
  }

  html += "</div>";
  html += "</div>";

  container.innerHTML = html;
}

function statCardHTML(value, label) {
  return (
    '<div class="stat-card"><div class="stat-value">' +
    value +
    '</div><div class="stat-label">' +
    label +
    "</div></div>"
  );
}

export function populateAllDropdowns() {
  populateEvidenceDropdowns();
  populateTimelineDropdowns();
  populateHypothesisDropdowns();
}

function populateEvidenceDropdowns() {
  const typeSelect = document.getElementById("filterType");
  const personSelect = document.getElementById("filterPerson");
  const locationSelect = document.getElementById("filterLocation");

  if (!typeSelect || !personSelect || !locationSelect) return;

  const types = [];

  for (let i = 0; i < state.allEvidence.length; i++) {
    const type = state.allEvidence[i].type.toLowerCase();

    if (types.indexOf(type) === -1) {
      types.push(type);
    }
  }

  typeSelect.innerHTML = '<option value="">All types</option>';

  for (let ti = 0; ti < types.length; ti++) {
    typeSelect.innerHTML +=
      '<option value="' + types[ti] + '">' + types[ti] + "</option>";
  }

  personSelect.innerHTML = '<option value="">All people</option>';

  for (let p = 0; p < state.allPeople.length; p++) {
    personSelect.innerHTML +=
      '<option value="' +
      state.allPeople[p].id +
      '">' +
      state.allPeople[p].name +
      "</option>";
  }

  locationSelect.innerHTML = '<option value="">All locations</option>';

  for (let l = 0; l < state.allLocations.length; l++) {
    locationSelect.innerHTML +=
      '<option value="' +
      state.allLocations[l].id +
      '">' +
      state.allLocations[l].id +
      " - " +
      state.allLocations[l].name +
      "</option>";
  }
}

function populateTimelineDropdowns() {
  const personSelect = document.getElementById("timelinePersonFilter");

  const locationSelect = document.getElementById("timelineLocationFilter");

  const typeSelect = document.getElementById("timelineTypeFilter");

  if (!personSelect || !locationSelect || !typeSelect) return;

  personSelect.innerHTML = '<option value="">All people</option>';

  for (let p = 0; p < state.allPeople.length; p++) {
    personSelect.innerHTML +=
      '<option value="' +
      state.allPeople[p].id +
      '">' +
      state.allPeople[p].name +
      "</option>";
  }

  locationSelect.innerHTML = '<option value="">All locations</option>';

  for (let l = 0; l < state.allLocations.length; l++) {
    locationSelect.innerHTML +=
      '<option value="' +
      state.allLocations[l].id +
      '">' +
      state.allLocations[l].id +
      "</option>";
  }

  const types = [];

  for (let i = 0; i < state.allTimeline.length; i++) {
    if (types.indexOf(state.allTimeline[i].type) === -1) {
      types.push(state.allTimeline[i].type);
    }
  }

  typeSelect.innerHTML = '<option value="">All event types</option>';

  for (let t = 0; t < types.length; t++) {
    typeSelect.innerHTML +=
      '<option value="' + types[t] + '">' + types[t] + "</option>";
  }
}

function populateHypothesisDropdowns() {
  const suspectSelect = document.getElementById("hypSuspect");

  const evidenceSelect = document.getElementById("hypEvidence");

  if (!suspectSelect || !evidenceSelect) return;

  const currentSuspect = suspectSelect.value;

  suspectSelect.innerHTML = '<option value="">Select a person…</option>';

  for (let p = 0; p < state.allPeople.length; p++) {
    suspectSelect.innerHTML +=
      '<option value="' +
      state.allPeople[p].id +
      '">' +
      state.allPeople[p].name +
      "</option>";
  }

  suspectSelect.value = currentSuspect;

  evidenceSelect.innerHTML = "";

  for (let i = 0; i < state.allEvidence.length; i++) {
    evidenceSelect.innerHTML +=
      '<option value="' +
      state.allEvidence[i].id +
      '">' +
      state.allEvidence[i].id +
      " - " +
      state.allEvidence[i].title +
      "</option>";
  }
}

function getFilteredEvidence() {
  const searchBox = document.getElementById("evidenceSearch");

  const searchTerm = searchBox ? searchBox.value.toLowerCase().trim() : "";

  const typeVal = document.getElementById("filterType").value;

  const personVal = document.getElementById("filterPerson").value;

  const locationVal = document.getElementById("filterLocation").value;

  const statusVal = document.getElementById("filterStatus").value;

  const relevanceVal = document.getElementById("filterRelevance").value;

  const results = [];

  for (let i = 0; i < state.allEvidence.length; i++) {
    const item = state.allEvidence[i];
    let matches = true;

    if (searchTerm) {
      const haystack = (
        item.title +
        " " +
        item.summary +
        " " +
        item.tags.join(" ")
      ).toLowerCase();

      if (haystack.indexOf(searchTerm) === -1) {
        matches = false;
      }
    }

    if (matches && typeVal && item.type.toLowerCase() !== typeVal) {
      matches = false;
    }

    if (matches && personVal) {
      const person = findPersonById(personVal);

      if (!person || !evidenceMentionsPerson(item, person)) {
        matches = false;
      }
    }

    if (
      matches &&
      locationVal &&
      item.locationIds.indexOf(locationVal) === -1
    ) {
      matches = false;
    }

    if (
      matches &&
      statusVal &&
      (item.status || "").toLowerCase() !== statusVal
    ) {
      matches = false;
    }

    if (
      matches &&
      relevanceVal &&
      (item.relevance || "").toLowerCase() !== relevanceVal
    ) {
      matches = false;
    }

    if (matches) {
      results.push(item);
    }
  }

  state.filteredEvidence = results;

  return results;
}

export function renderEvidenceList() {
  const container = document.getElementById("evidenceList");

  if (!container) return;

  const loadingIndicator = document.getElementById("evidenceLoadingIndicator");

  if (state.evidenceViewLoading) {
    if (loadingIndicator) {
      loadingIndicator.classList.remove("hidden");
    }

    container.innerHTML = "";
    return;
  }

  if (loadingIndicator) {
    loadingIndicator.classList.add("hidden");
  }

  const results = getFilteredEvidence();

  let html = "";

  if (results.length === 0) {
    html = "<p>No evidence matches the current filters.</p>";
  }

  for (let i = 0; i < results.length; i++) {
    html += renderEvidenceCardHTML(results[i]);
  }

  container.innerHTML = html;

  // Avoid duplicate delegated click listeners.
  container.removeEventListener("click", handleEvidenceListClick);

  container.addEventListener("click", handleEvidenceListClick);
}

function renderEvidenceCardHTML(ev) {
  const isBookmarked = state.bookmarks.indexOf(ev.id) !== -1;

  let html = '<div class="evidence-card" data-id="' + ev.id + '">';

  html +=
    '<button class="bookmark-btn ' +
    (isBookmarked ? "active" : "") +
    '" data-action="bookmark" data-id="' +
    ev.id +
    '" aria-label="Toggle bookmark for ' +
    ev.title +
    '"><span class="bookmark-icon">' +
    (isBookmarked ? "★" : "☆") +
    "</span></button>";

  html += "<h3>" + ev.title + "</h3>";

  html +=
    '<div class="evidence-meta">' +
    ev.id +
    " &middot; " +
    ev.type +
    " &middot; " +
    formatDate(ev.timestamp) +
    "</div>";

  html += '<div class="evidence-summary">' + ev.summary + "</div>";

  if (ev.tags.indexOf("critical") !== -1) {
    html += '<span class="badge badge-critical">Critical</span>';
  }

  html +=
    '<span class="badge ' +
    getStatusBadgeClass(ev.status) +
    '">' +
    ev.status +
    "</span>";

  html +=
    '<span class="badge ' +
    getRelevanceBadgeClass(ev.relevance) +
    '">' +
    ev.relevance +
    "</span>";

  html += "<div>";

  for (let t = 0; t < ev.tags.length; t++) {
    html += '<span class="tag-chip">' + ev.tags[t] + "</span>";
  }

  html += "</div>";
  html += "</div>";

  return html;
}

function handleEvidenceListClick(event) {
  const target = event.target;

  if (target.dataset && target.dataset.action === "bookmark") {
    event.stopPropagation();
    handleBookmarkClick(target.dataset.id);
    return;
  }

  const card = target.closest(".evidence-card");

  if (card) {
    openEvidenceDetail(card.getAttribute("data-id"));
  }
}

function handleBookmarkClick(evidenceId) {
  const ev = findEvidenceById(evidenceId);

  if (!ev) return;

  if (state.bookmarks.indexOf(evidenceId) === -1) {
    state.bookmarks.push(evidenceId);
    ev.bookmarked = true;
  } else {
    state.bookmarks = state.bookmarks.filter(function (id) {
      return id !== evidenceId;
    });

    ev.bookmarked = false;
  }

  saveBookmarksToStorage();

  if (state.currentPage === "evidence") {
    renderEvidenceList();
  }
}

export function applyStoredBookmarkFlags() {
  for (let i = 0; i < state.allEvidence.length; i++) {
    state.allEvidence[i].bookmarked =
      state.bookmarks.indexOf(state.allEvidence[i].id) !== -1;
  }
}

export function handleSortChange() {
  const sortValue = document.getElementById("sortEvidence").value;

  if (sortValue === "title-asc") {
    state.filteredEvidence.sort(function (a, b) {
      return a.title.localeCompare(b.title);
    });
  } else if (sortValue === "title-desc") {
    state.filteredEvidence.sort(function (a, b) {
      return b.title.localeCompare(a.title);
    });
  } else if (sortValue === "date-asc") {
    state.filteredEvidence.sort(function (a, b) {
      return new Date(a.timestamp) - new Date(b.timestamp);
    });
  } else {
    state.filteredEvidence.sort(function (a, b) {
      return new Date(b.timestamp) - new Date(a.timestamp);
    });
  }

  renderEvidenceList();
}

export function clearFilters() {
  document.getElementById("evidenceSearch").value = "";

  document.getElementById("filterType").value = "";

  document.getElementById("filterPerson").value = "";

  document.getElementById("filterLocation").value = "";

  document.getElementById("filterStatus").value = "";

  document.getElementById("filterRelevance").value = "";

  renderEvidenceList();
}

function simulateAsyncSearch(term) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve(term);
    }, 300);
  });
}

export function handleSearchInput(event) {
  const term = event.target.value;

  const requestId = ++state.latestSearchRequestId;

  simulateAsyncSearch(term).then(function (resolvedTerm) {
    if (requestId !== state.latestSearchRequestId) {
      return;
    }

    state.filteredEvidence = state.allEvidence.filter(function (ev) {
      return ev.title.toLowerCase().indexOf(resolvedTerm.toLowerCase()) !== -1;
    });

    renderEvidenceList();
  });
}

function openEvidenceDetail(evidenceId) {
  const ev = findEvidenceById(evidenceId);

  if (!ev) return;

  state.selectedEvidence = ev;

  const section = document.getElementById("evidenceDetailSection");

  section.classList.remove("hidden");

  renderEvidenceDetail(ev);

  section.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

export function closeEvidenceDetail() {
  const section = document.getElementById("evidenceDetailSection");

  section.classList.add("hidden");
  section.innerHTML = "";

  state.selectedEvidence = null;
}

/*
 * CODE SMELL FIX #1:
 * The person/location lookup logic used to be part
 * of renderEvidenceDetail().
 *
 * These helper functions reduce the size and
 * responsibilities of the rendering function.
 */

function getEvidencePersonNames(ev) {
  const personNames = [];

  for (let p = 0; p < ev.personIds.length; p++) {
    const person = findPersonById(ev.personIds[p]);

    personNames.push(person ? person.name : ev.personIds[p]);
  }

  return personNames;
}

function getEvidenceLocationNames(ev) {
  const locationNames = [];

  for (let l = 0; l < ev.locationIds.length; l++) {
    const loc = findLocationById(ev.locationIds[l]);

    locationNames.push(loc ? loc.id + " - " + loc.name : ev.locationIds[l]);
  }

  return locationNames;
}

/*
 * CODE SMELL FIX #2:
 * Status and relevance handlers previously
 * duplicated the same rendering logic.
 */

function refreshEvidenceViews(ev) {
  renderEvidenceDetail(ev);

  if (state.viewRendered.evidence) {
    renderEvidenceList();
  }

  renderDashboard();
}

function renderEvidenceDetail(ev) {
  const section = document.getElementById("evidenceDetailSection");

  const personNames = getEvidencePersonNames(ev);

  const locationNames = getEvidenceLocationNames(ev);

  let tagsHtml = "";

  for (let t = 0; t < ev.tags.length; t++) {
    tagsHtml += '<span class="tag-chip">' + ev.tags[t] + "</span>";
  }

  const storedNote = loadNoteForEvidence(ev.id);

  let html = "";

  html += '<div class="evidence-detail-header">';

  html += "<div><h2>" + ev.title + "</h2>";

  html +=
    '<div class="evidence-meta">' +
    ev.id +
    " &middot; " +
    ev.type +
    " &middot; " +
    formatDate(ev.timestamp) +
    "</div></div>";

  html +=
    '<button type="button" class="btn btn-secondary btn-small" onclick="closeEvidenceDetail()">Close</button>';

  html += "</div>";

  if (ev.tags.indexOf("critical") !== -1) {
    html +=
      '<div class="warning-banner">This item is tagged as critical evidence.</div>';
  }

  html +=
    '<div class="detail-field"><strong>Summary</strong>' +
    ev.summary +
    "</div>";

  html += '<div class="evidence-detail-content">' + ev.content + "</div>";

  html +=
    '<div class="detail-field"><strong>Related people</strong>' +
    personNames.join(", ") +
    "</div>";

  html +=
    '<div class="detail-field"><strong>Related locations</strong>' +
    locationNames.join(", ") +
    "</div>";

  html +=
    '<div class="detail-field"><strong>Tags</strong>' + tagsHtml + "</div>";

  html += '<div class="detail-field"><strong>Review status</strong>';

  html += '<select id="detailStatusSelect">';

  html += statusOptionHTML(ev.status, "unreviewed", "Unreviewed");

  html += statusOptionHTML(ev.status, "reviewed", "Reviewed");

  html += statusOptionHTML(ev.status, "flagged", "Flagged");

  html += "</select></div>";

  html += '<div class="detail-field"><strong>Relevance</strong>';

  html += '<select id="detailRelevanceSelect">';

  html += statusOptionHTML(ev.relevance, "unknown", "Unknown");

  html += statusOptionHTML(ev.relevance, "relevant", "Relevant");

  html += statusOptionHTML(ev.relevance, "irrelevant", "Irrelevant");

  html += "</select></div>";

  html += '<div class="detail-field"><strong>Investigator note</strong>';

  html +=
    '<textarea id="evidenceNoteInput" class="note-textarea" rows="3" data-evidence-id="' +
    ev.id +
    '" placeholder="Add a private note about this evidence...">' +
    storedNote +
    "</textarea>";

  html +=
    '<button type="button" class="btn btn-primary btn-small" style="margin-top:6px;" onclick="saveCurrentNote()">Save note</button>';

  html += "</div>";

  html +=
    '<div class="detail-field"><strong>Note preview</strong><div id="notePreview">' +
    storedNote +
    "</div></div>";

  section.innerHTML = html;

  document
    .getElementById("detailStatusSelect")
    .addEventListener("change", function (e) {
      ev.status = e.target.value;
      refreshEvidenceViews(ev);
    });

  document
    .getElementById("detailRelevanceSelect")
    .addEventListener("change", function (e) {
      ev.relevance = e.target.value;
      refreshEvidenceViews(ev);
    });
}

function statusOptionHTML(current, value, label) {
  const currentLower = (current || "").toLowerCase();

  const selected = currentLower === value ? " selected" : "";

  return '<option value="' + value + '"' + selected + ">" + label + "</option>";
}

export function saveCurrentNote() {
  const textarea = document.getElementById("evidenceNoteInput");

  if (!textarea) return;

  const evidenceId = textarea.getAttribute("data-evidence-id");

  const text = textarea.value;

  saveNoteForEvidence(evidenceId, text);

  const preview = document.getElementById("notePreview");

  if (preview) {
    preview.innerHTML = text;
  }
}

export function switchPeopleTab(tab) {
  state.currentPeopleTab = tab;

  const peoplePanel = document.getElementById("peoplePanel");

  const locationsPanel = document.getElementById("locationsPanel");

  const peopleTabBtn = document.getElementById("tabPeopleBtn");

  const locationsTabBtn = document.getElementById("tabLocationsBtn");

  if (tab === "people") {
    peoplePanel.classList.remove("hidden");

    locationsPanel.classList.add("hidden");

    peopleTabBtn.classList.add("active");

    locationsTabBtn.classList.remove("active");
  } else {
    peoplePanel.classList.add("hidden");

    locationsPanel.classList.remove("hidden");

    peopleTabBtn.classList.remove("active");

    locationsTabBtn.classList.add("active");
  }
}

function countEvidenceForPerson(person) {
  let count = 0;

  for (let i = 0; i < state.allEvidence.length; i++) {
    if (evidenceMentionsPerson(state.allEvidence[i], person)) {
      count++;
    }
  }

  return count;
}

export function renderPeople() {
  const container = document.getElementById("peoplePanel");

  let html = "";

  for (let i = 0; i < state.allPeople.length; i++) {
    const person = state.allPeople[i];

    const count = countEvidenceForPerson(person);

    html += '<div class="person-card">';

    html += '<div class="person-card-header">';

    html +=
      '<img class="person-avatar" src="' +
      person.avatar +
      '" alt="Portrait of ' +
      person.name +
      '">';

    html +=
      "<div><h3>" +
      person.name +
      '</h3><div class="person-role">' +
      person.role +
      "</div></div>";

    html += "</div>";

    html += "<p><strong>Speciality:</strong> " + person.speciality + "</p>";

    html += "<ul>";

    for (let r = 0; r < person.responsibilities.length; r++) {
      html += "<li>" + person.responsibilities[r] + "</li>";
    }

    html += "</ul>";

    html +=
      '<div class="person-statement">&ldquo;' +
      person.statement +
      "&rdquo;</div>";

    html +=
      "<p>" +
      count +
      " related evidence item" +
      (count === 1 ? "" : "s") +
      " &mdash; ";

    html +=
      '<button type="button" class="evidence-count-link" data-person-id="' +
      person.id +
      '">view</button></p>';

    html += "</div>";
  }

  container.innerHTML = html;

  const links = container.querySelectorAll(".evidence-count-link");

  for (let l = 0; l < links.length; l++) {
    links[l].addEventListener("click", function (e) {
      const personId = e.target.getAttribute("data-person-id");

      document.getElementById("filterPerson").value = personId;

      navigateTo("evidence");

      setTimeout(function () {
        renderEvidenceList();
      }, 0);
    });
  }
}

export function renderLocations() {
  const container = document.getElementById("locationsPanel");

  let html = "";

  for (let i = 0; i < state.allLocations.length; i++) {
    const loc = state.allLocations[i];

    html += '<div class="location-card">';

    html += "<h3>" + loc.id + " &mdash; " + loc.name + "</h3>";

    html += "<p>" + loc.description + "</p>";

    html += "<p><strong>Contains:</strong></p><ul>";

    for (let c = 0; c < loc.contains.length; c++) {
      html += "<li>" + loc.contains[c] + "</li>";
    }

    html += "</ul></div>";
  }

  container.innerHTML = html;
}

export function renderTimeline() {
  const container = document.getElementById("timelineContainer");

  if (!container) return;

  const order = document.getElementById("timelineOrder").value;

  const personFilter = document.getElementById("timelinePersonFilter").value;

  const locationFilter = document.getElementById(
    "timelineLocationFilter"
  ).value;

  const typeFilter = document.getElementById("timelineTypeFilter").value;

  let events = [];

  for (let i = 0; i < state.allTimeline.length; i++) {
    const evt = state.allTimeline[i];

    if (personFilter && evt.personIds.indexOf(personFilter) === -1) {
      continue;
    }

    if (locationFilter && evt.locationIds.indexOf(locationFilter) === -1) {
      continue;
    }

    if (typeFilter && evt.type !== typeFilter) {
      continue;
    }

    events.push(evt);
  }

  events = events.slice().sort(function (a, b) {
    const diff = new Date(a.time) - new Date(b.time);

    return order === "desc" ? -diff : diff;
  });

  let html = "";

  for (let e = 0; e < events.length; e++) {
    const item = events[e];

    html += '<div class="timeline-event certainty-' + item.certainty + '">';

    html +=
      '<div class="timeline-time">' +
      formatDate(item.time) +
      '&nbsp;&middot;&nbsp;<span class="badge badge-' +
      certaintyBadgeClass(item.certainty) +
      '">' +
      item.certainty +
      "</span></div>";

    html += "<h3>" + item.title + "</h3>";

    html += "<p>" + item.description + "</p>";

    const eventLocationNames = [];

    for (let el = 0; el < item.locationIds.length; el++) {
      const evtLoc = findLocationById(item.locationIds[el]);

      eventLocationNames.push(
        evtLoc ? evtLoc.id + " - " + evtLoc.name : item.locationIds[el]
      );
    }

    if (eventLocationNames.length > 0) {
      html +=
        '<p class="evidence-meta">Location: ' +
        eventLocationNames.join(", ") +
        "</p>";
    }

    for (let ev2 = 0; ev2 < item.evidenceIds.length; ev2++) {
      html +=
        '<button type="button" class="evidence-link-btn" data-evidence-id="' +
        item.evidenceIds[ev2] +
        '">View ' +
        item.evidenceIds[ev2] +
        "</button>";
    }

    html += "</div>";
  }

  if (events.length === 0) {
    html = "<p>No timeline events match the current filters.</p>";
  }

  container.innerHTML = html;

  const linkButtons = container.querySelectorAll(".evidence-link-btn");

  for (let b = 0; b < linkButtons.length; b++) {
    linkButtons[b].addEventListener("click", function (e) {
      openEvidenceModal(e.target.getAttribute("data-evidence-id"));
    });
  }
}

// --- Quick-view modal (used from the timeline) -------------------------

function openEvidenceModal(evidenceId) {
  const ev = findEvidenceById(evidenceId);

  if (!ev) return;

  let modal = document.getElementById("quickViewModal");

  if (!modal) {
    modal = document.createElement("div");

    modal.id = "quickViewModal";

    document.body.appendChild(modal);
  }

  modal.innerHTML =
    '<div class="modal-backdrop"><div class="modal-box">' +
    '<button type="button" class="modal-close-btn" aria-label="Close">&times;</button>' +
    "<h3>" +
    ev.title +
    "</h3>" +
    '<p class="evidence-meta">' +
    ev.id +
    " &middot; " +
    ev.type +
    " &middot; " +
    formatDate(ev.timestamp) +
    "</p>" +
    "<p>" +
    ev.summary +
    "</p>" +
    '<button type="button" class="btn btn-primary btn-small" data-open-full="' +
    ev.id +
    '">Open full evidence</button>' +
    "</div></div>";

  modal.onclick = function (e) {
    if (
      e.target.classList.contains("modal-close-btn") ||
      e.target.classList.contains("modal-backdrop")
    ) {
      modal.innerHTML = "";
    }

    if (e.target.getAttribute && e.target.getAttribute("data-open-full")) {
      const selectedEvidenceId = e.target.getAttribute("data-open-full");

      modal.innerHTML = "";

      navigateTo("evidence");

      setTimeout(function () {
        openEvidenceDetail(selectedEvidenceId);
      }, 0);
    }
  };
}

export function renderWorkspace() {
  renderBookmarksList();
  renderNotesList();
  populateHypothesisDropdowns();
  loadHypothesisFromStorage();
}

function renderBookmarksList() {
  const container = document.getElementById("bookmarksList");

  if (!container) return;

  const bookmarkedItems = state.allEvidence.filter(function (ev) {
    return ev.bookmarked;
  });

  if (bookmarkedItems.length === 0) {
    container.innerHTML =
      "<p>No bookmarked evidence yet. Bookmark items from the Evidence view.</p>";

    return;
  }

  let html = "";

  for (let i = 0; i < bookmarkedItems.length; i++) {
    const ev = bookmarkedItems[i];

    html +=
      '<div class="mini-list-item"><strong>' +
      ev.id +
      "</strong> &mdash; " +
      ev.title +
      ' <button type="button" class="btn btn-small btn-secondary" data-open-evidence="' +
      ev.id +
      '">Open</button></div>';
  }

  container.innerHTML = html;

  const openButtons = container.querySelectorAll("[data-open-evidence]");

  for (let b = 0; b < openButtons.length; b++) {
    openButtons[b].addEventListener("click", function (e) {
      navigateTo("evidence");

      const id = e.target.getAttribute("data-open-evidence");

      setTimeout(function () {
        openEvidenceDetail(id);
      }, 0);
    });
  }
}

function renderNotesList() {
  const container = document.getElementById("notesList");

  if (!container) return;

  const noteEntries = [];

  for (let i = 0; i < state.allEvidence.length; i++) {
    const note = state.notesStore[state.allEvidence[i].id];

    if (note) {
      noteEntries.push({
        index: i,
        evidenceId: state.allEvidence[i].id,
        title: state.allEvidence[i].title,
        text: note
      });
    }
  }

  if (noteEntries.length === 0) {
    container.innerHTML =
      "<p>No notes yet. Add one from an evidence item's detail view.</p>";

    return;
  }

  let html = "";

  for (let n = 0; n < noteEntries.length; n++) {
    const entry = noteEntries[n];

    html +=
      '<div class="mini-list-item"><strong>' +
      entry.evidenceId +
      "</strong> &mdash; " +
      entry.title;

    html +=
      '<div id="noteText-' + entry.index + '">' + entry.text + "</div></div>";
  }

  container.innerHTML = html;
}

export function saveHypothesis() {
  const draft = {
    suspectId: document.getElementById("hypSuspect").value,

    nature: document.getElementById("hypNature").value,

    evidenceIds: getSelectedOptions(document.getElementById("hypEvidence")),

    confidence: document.getElementById("hypConfidence").value,

    explanation: document.getElementById("hypExplanation").value,

    alternative: document.getElementById("hypAlternative").value,

    savedAt: new Date().toISOString()
  };

  try {
    localStorage.setItem(STORAGE_KEY_HYPOTHESIS, JSON.stringify(draft));
  } catch (err) {
    console.error("Could not save hypothesis draft", err);

    alert("Your hypothesis could not be saved to local storage.");

    return;
  }

  const msg = document.getElementById("hypothesisSavedMsg");

  msg.classList.remove("hidden");

  setTimeout(function () {
    msg.classList.add("hidden");
  }, 2000);
}

function getSelectedOptions(selectEl) {
  const result = [];

  for (let i = 0; i < selectEl.options.length; i++) {
    if (selectEl.options[i].selected) {
      result.push(selectEl.options[i].value);
    }
  }

  return result;
}

function loadHypothesisFromStorage() {
  const raw = localStorage.getItem(STORAGE_KEY_HYPOTHESIS);

  if (!raw) return;

  const draft = JSON.parse(raw);

  document.getElementById("hypSuspect").value = draft.suspectId || "";

  document.getElementById("hypNature").value = draft.nature || "";

  document.getElementById("hypConfidence").value = draft.confidence || 50;

  document.getElementById("hypConfidenceValue").textContent =
    draft.confidence || 50;

  document.getElementById("hypExplanation").value = draft.explanation || "";

  document.getElementById("hypAlternative").value = draft.alternative || "";

  const evidenceSelect = document.getElementById("hypEvidence");

  const savedIds = draft.evidenceIds || [];

  for (let i = 0; i < evidenceSelect.options.length; i++) {
    evidenceSelect.options[i].selected =
      savedIds.indexOf(evidenceSelect.options[i].value) !== -1;
  }
}
