// Domain model for the case data, matching public/data/*.json.

/** Canonical person identifier, e.g. "nova-byte" (never a display name). */
export type PersonId = string;
/** Location identifier, e.g. "L03". */
export type LocationId = string;
/** Evidence identifier, e.g. "E05". */
export type EvidenceId = string;
/** ISO-8601 timestamp string, e.g. "2026-10-16T06:49:00Z". */
export type IsoTimestamp = string;

export interface CaseInfo {
  caseId: string;
  title: string;
  subtitle: string;
  status: string;
  opened: string;
  summary: string;
  location: string;
  leadInvestigator: string;
  notes: string;
}

export interface Person {
  id: PersonId;
  name: string;
  role: string;
  speciality: string;
  responsibilities: string[];
  statement: string;
  background: string;
  /** Path relative to the site root, e.g. "assets/people/nova-byte.png". */
  avatar: string;
}

// Not called "Location" to avoid confusion with the DOM's global `Location` (window.location).
export interface CaseLocation {
  id: LocationId;
  name: string;
  description: string;
  contains: string[];
}

/**
 * Evidence exactly as stored in evidence.json.
 *
 * `personIds` is the ambiguous field: most entries hold person ids
 * ("nova-byte"), but E04 holds a display name ("Nova Byte"). The JS version
 * never decided and matched both everywhere it was used.
 */
export interface RawEvidence {
  id: EvidenceId;
  type: string;
  title: string;
  timestamp: IsoTimestamp;
  summary: string;
  content: string;
  /** Person id OR person display name — normalised on load, see Evidence. */
  personIds: string[];
  locationIds: LocationId[];
  tags: string[];
  /** Free text in the data ("unreviewed", "Reviewed"); compared case-insensitively. */
  status: string;
  /** Free text in the data ("unknown", "Unknown"); compared case-insensitively. */
  relevance: string;
}

/** Evidence as used by the app: person references resolved to ids. */
export interface Evidence extends Omit<RawEvidence, "personIds"> {
  personIds: PersonId[];
  /** UI-only flag, derived from the stored bookmarks after loading. */
  bookmarked?: boolean;
}

export type Certainty = "confirmed" | "reported" | "contradictory";

export interface TimelineEvent {
  id: string;
  time: IsoTimestamp;
  title: string;
  description: string;
  type: string;
  certainty: Certainty;
  personIds: PersonId[];
  locationIds: LocationId[];
  evidenceIds: EvidenceId[];
}
