export function setupEventListeners({
  handleSearchInput,
  renderEvidenceList,
  clearFilters,
  renderTimeline
}) {
  document
    .getElementById("evidenceSearch")
    .addEventListener("input", handleSearchInput);

  document
    .getElementById("filterType")
    .addEventListener("change", renderEvidenceList);

  document
    .getElementById("filterPerson")
    .addEventListener("change", renderEvidenceList);

  document
    .getElementById("filterLocation")
    .addEventListener("change", renderEvidenceList);

  document
    .getElementById("filterStatus")
    .addEventListener("change", renderEvidenceList);

  document
    .getElementById("filterRelevance")
    .addEventListener("change", renderEvidenceList);

  document
    .getElementById("clearFiltersBtn")
    .addEventListener("click", clearFilters);

  document
    .getElementById("timelineOrder")
    .addEventListener("change", renderTimeline);

  document
    .getElementById("timelinePersonFilter")
    .addEventListener("change", renderTimeline);

  document
    .getElementById("timelineLocationFilter")
    .addEventListener("change", renderTimeline);

  document
    .getElementById("timelineTypeFilter")
    .addEventListener("change", renderTimeline);

  document.getElementById("hypConfidence").addEventListener("input", (e) => {
    document.getElementById("hypConfidenceValue").textContent = e.target.value;
  });
}
