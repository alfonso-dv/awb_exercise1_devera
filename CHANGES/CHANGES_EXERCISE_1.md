# DEMO 1

Originally, most of the application's logic was contained in one large app.js. I refactored it into native ES modules based on responsibility. state.js contains shared application state, utils.js contains reusable helper functions, data.js handles JSON loading, storage.js handles local storage, events.js sets up event listeners, and render.js contains UI rendering. The remaining app.js acts as the application's entry point and connects the modules. I intentionally did not fix the existing application bugs because this demo is a pure refactor.

For DEMO 1 I first moved the GLOBAL STATE code into state.js, and applied "state." to each variable in app.js in the following functions:

allEvidence

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

latestSearchRequestId

Moved the specific functions into designated modules in js folder.

Changed index.html so it uses the modules and not just app.js with:

<script type="module" src="app.js"></script>


## QUESTIONS AND ANSWERS

### What is the difference between a classic `<script>` and a `<script type="module">`? Name at least two behavioral differences that are relevant to this app.

A classic script can put variables and functions into the global scope.

A module has its own module scope, so variables and functions are not automatically available to every other file.

With modules, values have to be explicitly shared using `export` and `import`.

Modules also automatically use strict mode.

Another difference is that module scripts are deferred automatically, so they execute after the HTML has been parsed.


### Before your refactor, `allEvidence` was a global `var`, readable and writable from anywhere in `app.js`. After splitting into modules, what has to happen for a different module to read or change that value?

I moved shared state into `state.js`.

For example:

    export const state = {
      allEvidence: []
    };

Another module must import it:

    import { state } from "./state.js";

Then it can access:

    state.allEvidence

If I try to use `state` without importing or declaring it, I get a `ReferenceError`.

This is useful because it prevents hidden dependencies and immediately tells me that a module is trying to use something it does not have access to.


### What's the difference between a named export and a default export?

A named export exports something using a specific name.

For example:

    export function navigateTo(viewName) {
      window.location.hash = viewName;
    }

It is imported with:

    import { navigateTo } from "./js/utils.js";

A default export is the main export of a module and can be imported using another local name.

I used named exports because most of my modules contain several different functions. This makes it clear which individual functions another module needs.


### Why won't `type="module"` scripts work properly when opening `index.html` directly with `file://`?

ES modules are loaded as separate resources and browsers apply security and origin restrictions to them.

The application also uses `fetch()` to load JSON files.

Both module loading and fetch requests work correctly when the application is served through a local HTTP server instead of opened directly from the file system.


# DEMO 2

The bug was in data.js.

    state.filteredEvidence = state.allEvidence;

was pointing to the same array which can be seen with the console debug log.

Changing to:

    state.filteredEvidence = state.allEvidence.slice();

allows the array to be sorted independently by creating a copy.


## QUESTIONS AND ANSWERS

### Explain the difference between a reference and a copy in JavaScript, and how that explains this bug.

Arrays and objects are reference types in JavaScript.

When I wrote:

    state.filteredEvidence = state.allEvidence;

JavaScript did not create a new array.

Both variables pointed to the same array in memory.

Because `.sort()` mutates an array, sorting `filteredEvidence` also changed `allEvidence`.

I could confirm this with:

    state.filteredEvidence === state.allEvidence

which returned `true`.

Using:

    state.filteredEvidence = state.allEvidence.slice();

creates a shallow copy of the array.

Now the filtered array can be sorted without changing the original array.


### Walk through the exact user actions and system state that trigger the bug.

After the evidence data loads, `filteredEvidence` is created from `allEvidence`.

In the broken version, both variables reference the same array.

When the user sorts the evidence list, `.sort()` mutates `filteredEvidence`.

Because it is the same array, `allEvidence` is also reordered.


### Could you have found this by reading the code without running it?

It would be possible to notice the dangerous assignment while reading the code, but the problem is easier to understand by running the application.

The assignment happens in one part of the program and the mutation happens later.

Running the application and checking the arrays in the Console confirmed that both variables referenced the same object.


# DEMO 3

![alt text](DEMO3unfix.png)

loadNoteAsync() in app.js

Adding a `.then()` makes it so the note is accessed after the Promise has been resolved.


## QUESTIONS AND ANSWERS

### Explain the async operation this bug revolves around.

`loadNoteAsync()` returns a Promise.

The broken code treated the result as if it were already the actual note.

For example:

    var firstNote = loadNoteAsync("E01");

At this point, `firstNote` is a Promise and not the resolved note value.


### At what point in the Promise lifecycle does the bug happen?

The bug happens while the Promise has not yet been handled as resolved data.

The application tries to use the Promise itself instead of waiting for its result.


### How did you fix it?

I used `.then()`:

    loadNoteAsync("E01").then(function (firstNote) {
      console.log("First note preview:", firstNote);
    });

The code inside `.then()` runs after the Promise resolves.

Now `firstNote` contains the actual note.


### How did you confirm the problem?

Before the fix, the Console showed a Promise instead of the note value.

After using `.then()`, the Console showed the actual note.


# DEMO 4

![alt text](DEMO4unfix.png)

Problem was `var i` was being called after it has been initially called once so it ends up using the changed `i` creating errors.

`let i` in events.js creates a new `i` binding for each loop.

![alt text](DEMO4fix.png)


## QUESTIONS AND ANSWERS

### How did you notice this bug if nothing looked broken?

I kept DevTools open while testing the application and saw an error in the Console when clicking the navigation buttons.

The visible UI could still appear to work because navigation was also handled elsewhere.


### Why is "nothing looks broken" not the same as "nothing is broken"?

A JavaScript error can happen without immediately causing a visible UI problem.

The broken listener was still failing even though another part of the application could make navigation work.

Console errors can reveal broken logic that may cause bigger problems later.


### Why did `var i` cause the problem?

`var` is function-scoped.

All of the callbacks created inside the loop shared the same `i`.

The callbacks run later, after the loop has already finished.

At that point, `i` contains its final value and can point outside the `navButtons` array.


### Why does `let i` fix it?

`let` is block-scoped.

In a `for` loop, each iteration gets its own binding of `i`.

Therefore, every event listener remembers the correct value for its own button.


# DEMO 5

FIX EVIDENCE LOADING ISSUE data.js

added:

    state.evidenceViewLoading = false;

it starts as true and never turns back to false now it does


EVIDENCE CLICK LISTENER GETS ADDED REPEATEDLY render.js

remove before adding a new one:

    container.removeEventListener("click", handleEvidenceListClick);


FILTERSTATUS HAS 2 CHANGE HANDLERS

events.js

Delete:

    document
      .getElementById("filterStatus")
      .setAttribute("onchange", "renderEvidenceList()");


HASHCHANGE IS REGISTERED TWICE

events.js

It already exists in app.js so delete in events.js:

    window.addEventListener("hashchange", handleHashChange);

    handleHashChange,

app.js,

Delete in setupEventListeners:

    handleHashChange: handleHashChange,


ACCUMULATING MODAL CLICK LISTENERS

render.js

This function adds a listener after every time the modal opens:

    modal.addEventListener("click", function (e) {
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
        modal.innerHTML = "";
        navigateTo("evidence");

        setTimeout(function () {
          openEvidenceDetail(
            e.target.getAttribute("data-open-full")
          );
        }, 0);
      }
    });

so instead we can use onclick which replaces instead of adds:

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

These are now obsolete:

    state.modalCloseListenerCount++;
    console.log(
      "modal opened, active close listeners:",
      state.modalCloseListenerCount
    );


TIMELINE LOCATION DISPLAYS [object Object]

render.js

`findLocationById()` returns a location object, not strings so it can spit out `[object Object]`.

Replace:

    eventLocationNames.push(
      evtLoc || item.locationIds[el]
    );

with:

    eventLocationNames.push(
      evtLoc
        ? evtLoc.id + " - " + evtLoc.name
        : item.locationIds[el]
    );


REVIEW PROGRESS BAR DOESN'T UPDATE

render.js

The dashboard is never re-rendered so adding renderDashboard at the end of the status listener updates the bar:

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


## QUESTIONS AND ANSWERS

### For the bug you chose to present, walk through the exact user actions and system state that trigger it.

I can present the mutation/reference bug from Demo 2.

The broken code is:

    state.filteredEvidence = state.allEvidence;

After the evidence loads, both variables reference the same array.

When I sort the evidence list, `.sort()` mutates `filteredEvidence`.

Because `filteredEvidence` and `allEvidence` are the same array, `allEvidence` is also changed.

The fix is:

    state.filteredEvidence = state.allEvidence.slice();

This creates a separate array.


### Across all the bugs you found, did fixing one change or reveal another bug?

Most of the bugs were separate.

For example, the evidence loading bug affected loading state, while the navigation bug was caused by `var`.

However, fixing some bugs made other problems easier to find.

For example, once the Evidence page loaded correctly, I could test the Evidence page more thoroughly and notice problems with event listeners and status updates.


### How did you make sure the fixes were isolated?

After each fix, I tested the affected feature again.

I also tested nearby features to make sure the change did not introduce another problem.

For example, after fixing the Evidence loading state, I tested searching, filtering, opening details and changing evidence status.


# DEMO 6

Ctrl + Shift + C

Sources, js -> render.js

debug line:

    ev.status = e.target.value;

Change an evidence status.

Check Closure Status:

    "unreviewed"

In console:

    e.target.value

Check Closure Status after Step Over:

    "reviewed"

![alt text](DEMO6.png)


## QUESTIONS AND ANSWERS

### What is the difference between Step Over and Step Into?

Step Over executes the current line without entering any function called by that line.

Step Into enters the called function so I can debug the code inside it.


### Give an example from this app where using the wrong one would waste your time.

For example:

    renderEvidenceDetail(ev);

If I already know that `renderEvidenceDetail()` works and I only want to see what happens after it finishes, I should use Step Over.

If I use Step Into, I would have to go through all of the rendering logic unnecessarily.


### What does Step Out do?

Step Out finishes the current function and returns to the function that called it.

It is useful when I enter a function with Step Into but then decide I do not need to inspect the rest of it.


### What is the Call Stack?

The Call Stack shows the chain of functions that caused the current function to run.

For example, if I am paused inside `renderEvidenceDetail()`, the Call Stack can show that it was called by the status change event listener.

This helps me understand where a function call came from.


### What is a conditional breakpoint?

A conditional breakpoint only pauses when a condition is true.

For example:

    ev.id === "E01"

This means execution only pauses when evidence E01 is being processed.


### Why is a conditional breakpoint better than repeatedly pressing Resume?

Without a conditional breakpoint, the debugger may pause many times for cases that I do not care about.

A condition lets me directly stop only for the specific object or value I want to investigate.


### What is the difference between a DevTools breakpoint and a `debugger;` statement?

A DevTools breakpoint is created inside the browser and does not change my JavaScript source code.

A `debugger;` statement is written directly into the code:

    debugger;

When DevTools is open, JavaScript pauses when it reaches that line.

I prefer a normal DevTools breakpoint for temporary debugging because I do not have to modify my source code.


### Describe a situation where the debugger was better than `console.log()`.

When debugging:

    ev.status = e.target.value;

I could pause before the assignment.

I could inspect:

    ev.status

and:

    e.target.value

Then I could Step Over the line and immediately see `ev.status` change.

The debugger also lets me inspect Scope, Watch and the Call Stack.

With `console.log()`, I can print values, but I cannot pause execution and inspect the full program state at that exact moment.


# DEMO 7

## DEVTOOLS

Console:

Use the log level filter to show only errors.

Use it again to show only warnings.

Use the text filter to search for a specific console message.

Enable Preserve Log to keep console messages when the page reloads.


Network:

Open Network and reload the application.

Look for the JSON requests such as:

    case.json
    people.json
    locations.json
    evidence.json
    timeline.json

Inspect:

    Status
    Response
    Timing

Test Slow 3G and reload the page.


Application:

Go to:

    Application -> Local Storage

The application uses:

    remotion_bookmarks
    remotion_notes
    remotion_hypothesis

Edit one of the values and reload.

Also test invalid JSON to see how the application reacts.


Elements:

Inspect an Evidence card or Person card.

The HTML visible in the Elements panel was created by the rendering functions inside `render.js`.


## QUESTIONS AND ANSWERS

### What is the practical difference between `console.log`, `console.warn` and `console.error`?

`console.log()` is normally used for general information or debugging.

`console.warn()` indicates that something unexpected or potentially problematic happened.

`console.error()` indicates an error or failure.

The important difference is not only their appearance.

DevTools classifies them using different log levels, which allows me to filter the Console and display only warnings or errors.


### What does Preserve Log do?

Normally, Console messages can disappear when the page reloads.

Preserve Log keeps messages from before the reload.

This is useful when debugging errors that happen during application startup or navigation.


### What does Status mean in the Network panel?

Status is the HTTP response status.

For example:

    200

means the request succeeded.

I may also see:

    304

which means Not Modified.

That means the browser already has a cached version and the server tells it that the resource has not changed.


### What does Type mean?

Type shows what kind of resource or request it is.

For this application, the data files are loaded using `fetch()` and contain JSON.


### What does Time mean?

Time shows how long the request took to complete.

When using Slow 3G, the request takes longer and this is visible in the Time information.


### What would happen if a JSON request returned 404?

`fetch()` does not automatically reject just because the HTTP response is a 404.

It still returns a Response object.

If the application then tries:

    res.json()

and the response is not valid JSON, parsing can fail.

If that code has `.catch()` or `try/catch`, the error can be handled there.

Without error handling, the error may be uncaught and some application data may not load.


### What localStorage keys does this application use?

    remotion_bookmarks

Stores bookmarked evidence.

    remotion_notes

Stores evidence notes.

    remotion_hypothesis

Stores the hypothesis information from the Workspace.


### What happens if you corrupt the bookmarks JSON?

The bookmarks loader uses `try/catch`.

If `JSON.parse()` fails, the error is caught and bookmarks are reset to an empty array.

The application therefore continues running.


### What happens if you corrupt the notes JSON?

`loadNotesFromStorage()` currently uses `JSON.parse()` without a `try/catch`.

Invalid JSON therefore throws an error.

Because notes are loaded during startup, this error can interrupt the rest of application initialization.


### What happens when you use Slow 3G?

The JSON requests take longer.

The application's data appears gradually rather than immediately.

The core data is intentionally loaded sequentially:

    case
    ↓
    people
    ↓
    locations

Evidence and timeline loading are started afterward.

This makes the loading order much easier to observe.


# DEMO 8

var -> const/let

const = does not get a new value assigned

let = can change value

i.e.:

    var container = document.getElementById("dashboardContent");

    var reviewedCount = 0;

to:

    const container = document.getElementById("dashboardContent");

    let reviewedCount = 0;

Done in every module.


## QUESTIONS AND ANSWERS

### What is the difference between `var`, `let`, and `const`?

`var` is function-scoped and can be redeclared and reassigned.

`let` is block-scoped and can be reassigned.

`const` is block-scoped and cannot be reassigned after initialization.


### Why is `container` a `const`?

For example:

    const container =
      document.getElementById("dashboardContent");

The `container` variable always refers to the same DOM element.

The object itself could still be modified, but the variable is not assigned a completely different value.


### Why is `reviewedCount` a `let`?

For example:

    let reviewedCount = 0;

The value changes while the application counts reviewed evidence.

Because the variable is reassigned, it has to use `let` instead of `const`.


### Give a concrete example of a bug caused by `var`.

Demo 4 is an example.

The loop originally used:

    for (var i = 0; i < navButtons.length; i++)

All callbacks shared the same `i`.

Using:

    let i

gave every loop iteration its own binding and fixed the problem.


### What is an accidental global?

An accidental global can happen when a variable is assigned without first being declared.

For example:

    reviewedCount = 10;

instead of:

    let reviewedCount = 10;

In non-strict classic JavaScript, this can accidentally create a global variable.

ES modules automatically use strict mode.

Therefore, the same mistake in a module results in a `ReferenceError` rather than silently creating a global variable.


### What is an example of code that technically worked but was still worth cleaning?

One example was duplicated rendering logic.

The application could still work, but repeating the same logic in multiple places makes it harder to maintain.

Another example was the large `renderEvidenceDetail()` function.

Moving person and location lookup logic into helper functions makes the code easier to understand and reduces duplicate code.

Clean code reduces bug risk and makes the program easier to review and maintain.


# DEMO 9

data.js

Sequencing the `loadCorePeopleAndLocations()` from using `.then()` to async and await.

From:

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

to:

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


loadAllData, from:

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

to:

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


Also convert `loadTimelineData()` from `.then()`, `.catch()` and `.finally()` to async/await while keeping the same error handling:

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


## QUESTIONS AND ANSWERS

### Why is the nested `.then()` chain harder to understand than the async/await version?

The nested `.then()` version creates several levels of callbacks.

For example, I had to go through:

    fetch case
        -> parse case
            -> fetch people
                -> parse people
                    -> fetch locations
                        -> parse locations

This makes the control flow harder to read.

With async/await, the same sequence is written from top to bottom:

    await case
    await people
    await locations

The behavior is still sequential, but the code is easier to follow.


### What does `await` actually do?

`await` pauses the execution of the current async function until the Promise settles.

For example:

    const caseRes = await fetch("data/case.json");

`loadCorePeopleAndLocations()` waits at this point until the fetch completes.


### Does `await` freeze the entire program?

No.

Only the current async function is paused.

The JavaScript environment can still process other events and asynchronous work while the Promise is pending.


### What does an async function return?

An async function always returns a Promise.

Even:

    async function example() {
      return 5;
    }

returns a Promise that resolves to `5`.

Therefore I can do:

    example().then(function (value) {
      console.log(value);
    });

and the Console will eventually print:

    5


### What is the async/await equivalent of `.catch()`?

The equivalent is normally `try/catch`.

For example:

    try {
      const res = await fetch(...);
    } catch (err) {
      console.log(err);
    }


### What is the async/await equivalent of `.finally()`?

I can use:

    finally {
      ...
    }

after `try/catch`.

This is what I used in `loadTimelineData()` to make sure `hideLoadingStep()` still runs.


### What happens if an awaited Promise rejects and there is no try/catch?

The async function's returned Promise becomes rejected.

If nothing handles that rejection, it can result in an unhandled Promise rejection.


### Is async/await faster than `.then()`?

No.

Async/await is mostly a different way of writing Promise-based asynchronous code.

The same operations still happen.

In my refactor I intentionally kept:

    case
    then people
    then locations

sequential.

I did not use `Promise.all()` because that would change the application's behavior.


### What happens if you deliberately remove one of the `await`s?

For example, temporarily changing:

    const peopleRes =
      await fetch("data/people.json");

to:

    const peopleRes =
      fetch("data/people.json");

means `peopleRes` is now a Promise instead of a Response.

Then:

    peopleRes.json()

will fail because `.json()` belongs to the resolved Response object, not the Promise.

This is similar to Demo 3 because in both cases a Promise is treated as though it were already resolved data.


# DEMO 10

Convert functions to use arrow functions.

events.js

addEventListener:

From:

    document
      .getElementById("hypConfidence")
      .addEventListener("input", function (e) {
        document.getElementById(
          "hypConfidenceValue"
        ).textContent = e.target.value;
      });

to:

    document
      .getElementById("hypConfidence")
      .addEventListener("input", (e) => {
        document.getElementById(
          "hypConfidenceValue"
        ).textContent = e.target.value;
      });


From:

    for (let i = 0; i < navButtons.length; i++) {
      navButtons[i].addEventListener("click", function () {
        const targetView =
          navButtons[i].getAttribute("data-view");

        console.log(
          "nav clicked:",
          targetView
        );
      });
    }

to:

    navButtons[i].addEventListener("click", () => {
      const targetView =
        navButtons[i].getAttribute("data-view");

      console.log(
        "nav clicked:",
        targetView
      );
    });


utils.js

getStatusBadgeClass

From:

    export function getStatusBadgeClass(status) {
      const s =
        (status || "").toLowerCase();

      if (s === "reviewed")
        return "badge-reviewed";

      if (s === "flagged")
        return "badge-flagged";

      return "badge-unreviewed";
    }

to:

    export const getStatusBadgeClass = (status) => {
      const s =
        (status || "").toLowerCase();

      if (s === "reviewed")
        return "badge-reviewed";

      if (s === "flagged")
        return "badge-flagged";

      return "badge-unreviewed";
    };


getRelevanceBadgeClass

From:

    export function getRelevanceBadgeClass(relevance) {
      const r =
        (relevance || "").toLowerCase();

      if (r === "relevant")
        return "badge-relevant";

      return "badge-unreviewed";
    }

to:

    export const getRelevanceBadgeClass = (relevance) => {
      const r =
        (relevance || "").toLowerCase();

      if (r === "relevant")
        return "badge-relevant";

      return "badge-unreviewed";
    };


## QUESTIONS AND ANSWERS

### What is different about how arrow functions handle `this` compared to regular functions?

Regular functions get their `this` depending on how the function is called.

Arrow functions do not create their own `this`.

Instead, they use `this` from the surrounding lexical scope.


### Why can this make arrow functions risky as object methods?

An object method often needs `this` to refer to the object.

For example:

    const person = {
      name: "John",

      showName: function () {
        console.log(this.name);
      }
    };

Here, `this` refers to `person`.

Changing this carelessly to an arrow function can change what `this` refers to.


### Why are arrows often useful as callbacks?

Callbacks often do not need their own dynamic `this`.

For example:

    addEventListener("input", (e) => {
      console.log(e.target.value);
    });

This callback uses `e` and does not depend on its own `this`, so an arrow function is appropriate.


### Arrow functions cannot be constructors. Did this limitation affect my conversions?

No.

None of the functions I converted are used with `new`.

For example:

    getStatusBadgeClass()

is just a utility function and is never used as a constructor.


### Arrow functions do not have their own `arguments` object. Did this matter?

No.

The functions I converted use explicitly declared parameters such as:

    status

    relevance

    e

They do not use the `arguments` object.


### What is the difference in hoisting?

A regular function declaration such as:

    function getStatusBadgeClass() {
    }

is hoisted and can be called before its declaration appears in the file.

A `const` arrow function such as:

    const getStatusBadgeClass = () => {
    };

cannot be used before that declaration has executed.


### Did hoisting cause a problem in my refactor?

No.

The converted functions are not called before their declarations are initialized in a way that causes a problem.

They are exported normally and used after their module has been evaluated.


### Show one concrete before and after. Is there a behavioral difference?

Before:

    export function getStatusBadgeClass(status) {
      const s =
        (status || "").toLowerCase();

      if (s === "reviewed")
        return "badge-reviewed";

      if (s === "flagged")
        return "badge-flagged";

      return "badge-unreviewed";
    }

After:

    export const getStatusBadgeClass = (status) => {
      const s =
        (status || "").toLowerCase();

      if (s === "reviewed")
        return "badge-reviewed";

      if (s === "flagged")
        return "badge-flagged";

      return "badge-unreviewed";
    };

For this particular function, there is no intended behavioral difference.

It does not use `this`, `arguments`, or `new`.

The change is mainly syntax and style.


### Which function should deliberately NOT be converted to an arrow function?

A good example is a regular DOM event callback that deliberately uses `this`.

For example:

    document
      .getElementById("hypConfidence")
      .addEventListener("input", function () {
        document.getElementById(
          "hypConfidenceValue"
        ).textContent = this.value;
      });

In a regular DOM event listener, `this` refers to the element that received the event.

If I changed it to:

    () => {
      this.value
    }

the arrow function would not create its own event-handler `this`.

It would inherit `this` from the surrounding module scope instead.

Therefore, if I want to deliberately demonstrate a function that should remain regular, I can keep this event listener as a normal function and use `this.value`.


### What rule could the team use for deciding between regular and arrow functions?

A reasonable team rule would be:

Use arrow functions for short callbacks and utility functions when they do not need their own `this`, `arguments`, or constructor behavior.

Use regular functions when dynamic `this` is required, when the function is intended to be a constructor, or when function-declaration hoisting is useful.

The important thing is not to convert every function automatically. The choice should depend on the behavior the function needs.