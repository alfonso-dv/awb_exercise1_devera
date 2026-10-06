import { state, type ViewName } from "./state.ts";
import type { CaseLocation, Evidence, Person } from "./types.ts";

export function evidenceMentionsPerson(ev: Evidence, person: Person): boolean {
  if (!ev.personIds) return false;

  return (
    ev.personIds.indexOf(person.id) !== -1 ||
    ev.personIds.indexOf(person.name) !== -1
  );
}

export function formatDate(ts: string | undefined): string {
  if (!ts) return "Unknown date";

  const d = new Date(ts);

  if (isNaN(d.getTime())) return ts;

  return (
    d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric"
    }) +
    " " +
    d.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit"
    })
  );
}

export const getStatusBadgeClass = (status: string | undefined): string => {
  const s = (status || "").toLowerCase();

  if (s === "reviewed") return "badge-reviewed";
  if (s === "flagged") return "badge-flagged";

  return "badge-unreviewed";
};

export const getRelevanceBadgeClass = (
  relevance: string | undefined
): string => {
  const r = (relevance || "").toLowerCase();

  if (r === "relevant") return "badge-relevant";

  return "badge-unreviewed";
};

export function certaintyBadgeClass(certainty: string): string {
  if (certainty === "confirmed") return "reviewed";
  if (certainty === "contradictory") return "critical";
  if (certainty === "reported") return "flagged";

  return "unreviewed";
}

export function findEvidenceById(id: string): Evidence | null {
  for (let i = 0; i < state.allEvidence.length; i++) {
    if (state.allEvidence[i].id === id) {
      return state.allEvidence[i];
    }
  }

  return null;
}

export function findPersonById(id: string): Person | null {
  for (let i = 0; i < state.allPeople.length; i++) {
    if (state.allPeople[i].id === id) {
      return state.allPeople[i];
    }
  }

  return null;
}

export function findLocationById(id: string): CaseLocation | null {
  for (let i = 0; i < state.allLocations.length; i++) {
    if (state.allLocations[i].id === id) {
      return state.allLocations[i];
    }
  }

  return null;
}

export function navigateTo(viewName: ViewName): void {
  window.location.hash = viewName;
}
