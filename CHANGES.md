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