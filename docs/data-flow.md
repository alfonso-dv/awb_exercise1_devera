# Data flow: one evidence item, end to end

Example: the investigator clicks the card **E05** in the Evidence Catalogue
(`react.html#/evidence/E05`) while `npm run dev:all` is running.

```mermaid
sequenceDiagram
  participant File as public/data/evidence.json
  participant API as Node API<br/>server/index.mjs
  participant Proxy as Vite dev server<br/>(proxy /api)
  participant Http as API layer<br/>http.ts getJson
  participant CaseApi as API layer<br/>caseApi.getEvidenceItem
  participant Hook as hooks<br/>useEvidenceItem → useFetch
  participant Route as UI<br/>EvidenceDetailRoute
  participant View as UI<br/>EvidenceDetail → screen

  Route->>Hook: useEvidenceItem("E05", people)
  Hook-->>Route: state = loading (no result for key "evidence/E05" yet)
  Route-->>View: Panel "Loading E05…" + spinner
  Note over Hook: after the commit, the effect runs:<br/>new AbortController
  Hook->>CaseApi: getEvidenceItem("E05", signal)
  CaseApi->>Http: getJson("evidence/E05", signal)
  Http->>Proxy: GET api/evidence/E05 (+ ?delay/fail/… from the page URL)
  Proxy->>API: GET /api/evidence/E05
  API->>File: readFile + JSON.parse
  File-->>API: 18 raw items
  API-->>Proxy: 200 { id: "E05", … } (or 404 / simulated 500)
  Proxy-->>Http: response
  Http-->>CaseApi: JSON as RawEvidence (or throws ApiError / TypeError)
  CaseApi-->>Hook: RawEvidence
  Hook->>Hook: normalizeEvidence (names → person ids)<br/>setFinished({ key, success, data })
  Hook-->>Route: re-render: state = success, data = Evidence
  Route->>Route: withReviewEdits(data) (investigator's status/relevance)
  Route-->>View: <EvidenceDetail evidence=… />
  Note over Hook,Route: If the id changes before the response arrives,<br/>the effect cleanup calls controller.abort():<br/>the request is cancelled and its result ignored.
```

In a **production build** (GitHub Pages) the steps API → File are replaced by
`fetch("data/evidence.json")` and a lookup by id inside `caseApi.getEvidenceItem`; every layer
above it stays the same.

## What breaks if a step silently stops happening

| Step | If it silently stopped… | How you'd notice |
|---|---|---|
| **Abort in the effect cleanup** | Request races come back: open E01 (slow) then E02 → E01's late response replaces E02. | The detail no longer matches the URL / highlighted card. Reproduce with `?slow=E01&delay=2500` (or `?unsafeRace`). |
| **`normalizeEvidence` in `useEvidenceItem`** | E04 keeps `"Nova Byte"` (a name) in `personIds`. | No visible error at all: E04's "Related people" is just **empty**, because the lookup by id finds nobody. Only noticed by checking E04 or by a test. That's the dangerous kind. |
| **`withReviewEdits` in the route** | The detail shows the original status while the card and Dashboard show the edited one. | Inconsistent badges between list and detail after changing a status. |
| **Vite proxy / backend** | No response at all. | `ErrorState`: "The server could not be reached. Is the backend running (npm run api)?" The failure is visible by design. |
| **`res.ok` check in `getJson`** | A 500's JSON error body would be treated as an evidence item. | The detail renders "undefined" fields or crashes, instead of the error panel. |
