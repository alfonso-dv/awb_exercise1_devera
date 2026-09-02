# DEMO 1

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

Changed index.html so it uses the modules and not just app.js with: <script type="module" src="app.js"></script>