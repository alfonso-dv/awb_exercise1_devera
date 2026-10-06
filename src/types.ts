// Domain model for the case data.
// First pass (Demo 5): only the fields the converted modules actually use.
// Completed to match public/data/*.json in Demo 6.

export interface Evidence {
  id: string;
  personIds: string[];
  bookmarked?: boolean;
}

export interface Person {
  id: string;
  name: string;
}

// Not called "Location" to avoid confusion with the DOM's global `Location` (window.location).
export interface CaseLocation {
  id: string;
  name: string;
}

export interface TimelineEvent {
  id: string;
}

export interface CaseInfo {
  title: string;
}
