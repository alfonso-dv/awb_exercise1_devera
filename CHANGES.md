# DEMO 1

Originally, most of the application's logic was contained in one large app.js. I refactored it into native ES modules based on responsibility. state.js contains shared application state, utils.js contains reusable helper functions, data.js handles JSON loading, storage.js handles local storage, events.js sets up event listeners, and render.js contains UI rendering. The remaining app.js acts as the application's entry point and connects the modules. I intentionally did not fix the existing application bugs because this demo is a pure refactor.

For DEMO 1 I first moved the GLOBAL STATE code into state.js, and applied "state." to each variable in app.js in the following functions 

"allEvidence
filteredEvidence
selectedEvidence
bookmarks
currentPage
allPeople
allLocations
allTimeline
caseData
currentPeopleTab
loadingStepsRemaining
evidenceViewLoading
viewRendered
notesStore
modalCloseListenerCount
latestSearchRequestId"

Moved the specific functions into designated modules in js folder.


Changed index.html so it uses the modules and not just app.js with: <script type="module" src="app.js"></script>

# DEMO 2

The bug was in data.js. 

state.filteredEvidence = state.allEvidence; 
was pointing to the same array which can be seen with the console debug log.

Changing to 
state.filteredEvidence = state.allEvidence.slice();
allowing the array to be sorted independently by creating a copy.

# DEMO 3
![alt text](image.png)

loadNoteAsync() in app.js
Adding a .then makes it so the note is accessed after Promise has been resolved

# DEMO 4
![alt text](image.png)

Problem was var i was being called after it has been initially called once so it ends up using the changed i creating errors

"let i" in events.js creates a new i binding for each loop
![alt text](image-1.png)

# DEMO 5

FIX EVIDENCE LOADING ISSUE data.js
added:
state.evidenceViewLoading = false;
it starts as true and never turns back to false now it does

EVIDENCE CLICK LISTENER GETS ADDED REPEATEDLY render.js
remove after adding a new one
container.removeEventListener("click", handleEvidenceListClick);

FILTERSTATUS HAS 2 CHANGE HANDLERS
events.js
Delete   
document
    .getElementById("filterStatus")
    .setAttribute("onchange", "renderEvidenceList()");

HASHCHANGE IS REGISTERED TWICE
events.js
It already exists in app.js so delete in events.js
  window.addEventListener("hashchange", handleHashChange);
      
      handleHashChange,
app.js,
Delete in setupEventListeners
    handleHashChange: handleHashChange,
    

ACUUMULATING MODAL CLICK LISTENERS
render.js
This function adds a listener after every time the modal opens 
  modal.addEventListener("click", function (e) {
    if (e.target.classList.contains("modal-close-btn") || e.target.classList.contains("modal-backdrop")) {
      modal.innerHTML = "";
    }
    if (e.target.getAttribute && e.target.getAttribute("data-open-full")) {
      modal.innerHTML = "";
      navigateTo("evidence");
      setTimeout(function () {
        openEvidenceDetail(e.target.getAttribute("data-open-full"));
      }, 0);
    }
  });

so instead we can use onclick which replaces instead of adds

modal.onclick = function (e) {
  if (
    e.target.classList.contains("modal-close-btn") ||
    e.target.classList.contains("modal-backdrop")
  ) {
    modal.innerHTML = "";
  }

  if (
    e.target.getAttribute &&
    e.target.getAttribute("data-open-full")
  ) {
    var evidenceId =
      e.target.getAttribute("data-open-full");

    modal.innerHTML = "";
    navigateTo("evidence");

    setTimeout(function () {
      openEvidenceDetail(evidenceId);
    }, 0);
  }
};

These are now obsolete
  state.modalCloseListenerCount++;
  console.log("modal opened, active close listeners:", state.modalCloseListenerCount);

TIMELINE LOCATION DISPLAYS [object Object]
render.js

findLocationByID() returns a location object, not strings so it can spit out [object Object]

Replace
eventLocationNames.push(
  evtLoc || item.locationIds[el]
);

with 

eventLocationNames.push(
  evtLoc
    ? evtLoc.id + " - " + evtLoc.name
    : item.locationIds[el]
);

REVIEW PROGRESS BAR DOESN'T UPDATE
render.js
The dashboard is never re-rendered so adding renderDashboard at the end of the status listener updates the bar
document
  .getElementById("detailStatusSelect")
  .addEventListener("change", function (e) {
    ev.status = e.target.value;

    renderEvidenceDetail(ev);

    if (state.viewRendered.evidence) {
      renderEvidenceList();
    }

    renderDashboard();
  });
