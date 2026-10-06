import { getElement } from "./dom.ts";

export interface EventListenerCallbacks {
  handleSearchInput: (event: Event) => void;
  renderEvidenceList: () => void;
  clearFilters: () => void;
  renderTimeline: () => void;
}

export function setupEventListeners({
  handleSearchInput,
  renderEvidenceList,
  clearFilters,
  renderTimeline
}: EventListenerCallbacks): void {
  getElement("evidenceSearch", HTMLInputElement).addEventListener(
    "input",
    handleSearchInput
  );

  for (const id of [
    "filterType",
    "filterPerson",
    "filterLocation",
    "filterStatus",
    "filterRelevance"
  ]) {
    getElement(id, HTMLSelectElement).addEventListener(
      "change",
      renderEvidenceList
    );
  }

  getElement("clearFiltersBtn", HTMLButtonElement).addEventListener(
    "click",
    clearFilters
  );

  for (const id of [
    "timelineOrder",
    "timelinePersonFilter",
    "timelineLocationFilter",
    "timelineTypeFilter"
  ]) {
    getElement(id, HTMLSelectElement).addEventListener(
      "change",
      renderTimeline
    );
  }

  const confidence = getElement("hypConfidence", HTMLInputElement);

  confidence.addEventListener("input", () => {
    getElement("hypConfidenceValue", HTMLElement).textContent =
      confidence.value;
  });
}
