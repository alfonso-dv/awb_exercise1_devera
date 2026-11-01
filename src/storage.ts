import {
  state,
  STORAGE_KEY_BOOKMARKS,
  STORAGE_KEY_HYPOTHESIS,
  STORAGE_KEY_NOTES
} from "./state.ts";

// localStorage content is outside our control (older app versions, manual
// edits in DevTools), so parsed values start as `unknown` and are checked.
function isStringRecord(value: unknown): value is Record<string, string> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every((v) => typeof v === "string")
  );
}

export function saveBookmarksToStorage(): void {
  localStorage.setItem(STORAGE_KEY_BOOKMARKS, JSON.stringify(state.bookmarks));
}

/** Reads the bookmarked evidence ids from localStorage (no side effects). */
export function readStoredBookmarks(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BOOKMARKS);
    const parsed: unknown = raw ? JSON.parse(raw) : [];

    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : [];
  } catch (err) {
    console.warn("Could not read stored bookmarks, starting empty", err);

    return [];
  }
}

export function loadBookmarksFromStorage(): void {
  state.bookmarks = readStoredBookmarks();
}

export function saveNoteForEvidence(evidenceId: string, text: string): void {
  state.notesStore[evidenceId] = text;

  localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(state.notesStore));
}

export function loadNoteForEvidence(evidenceId: string): string {
  return state.notesStore[evidenceId] || "";
}

export function loadNotesFromStorage(): void {
  const raw = localStorage.getItem(STORAGE_KEY_NOTES);

  if (!raw) {
    state.notesStore = {};
    return;
  }

  const parsed: unknown = JSON.parse(raw);

  state.notesStore = isStringRecord(parsed) ? parsed : {};
}

export function loadNoteAsync(evidenceId: string): Promise<string> {
  return new Promise(function (resolve) {
    resolve(state.notesStore[evidenceId] || "");
  });
}

/** Shape of the hypothesis draft saved in localStorage. */
export interface HypothesisDraft {
  suspectId: string;
  nature: string;
  evidenceIds: string[];
  /** Slider value as a string, e.g. "75" (input.value is always a string). */
  confidence: string;
  explanation: string;
  alternative: string;
  savedAt: string;
}

/**
 * JSON.parse() returns `any`, which would silently switch type checking off
 * for every use of the draft. Treat the stored value as `unknown` and keep
 * only fields of the expected type, so a corrupt or outdated entry can't
 * break the workspace view.
 */
export function parseHypothesisDraft(raw: string): Partial<HypothesisDraft> {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.warn("Ignoring unreadable hypothesis draft", err);
    return {};
  }

  if (typeof parsed !== "object" || parsed === null) return {};

  const draft: Partial<HypothesisDraft> = {};
  const record = parsed as Record<string, unknown>;

  for (const key of [
    "suspectId",
    "nature",
    "confidence",
    "explanation",
    "alternative",
    "savedAt"
  ] as const) {
    const value = record[key];
    if (typeof value === "string") draft[key] = value;
  }

  const evidenceIds = record.evidenceIds;
  if (Array.isArray(evidenceIds)) {
    draft.evidenceIds = evidenceIds.filter(
      (id): id is string => typeof id === "string"
    );
  }

  return draft;
}

// ---------------------------------------------------------------------
// Side-effect-free helpers used by the React app (they don't touch the
// vanilla `state` object).
// ---------------------------------------------------------------------

/** Writes the given bookmark ids to localStorage. */
export function writeStoredBookmarks(ids: readonly string[]): void {
  localStorage.setItem(STORAGE_KEY_BOOKMARKS, JSON.stringify(ids));
}

/** Reads all saved notes (evidence id -> text) from localStorage. */
export function readStoredNotes(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTES);
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    return isStringRecord(parsed) ? parsed : {};
  } catch (err) {
    console.warn("Could not read stored notes, starting empty", err);
    return {};
  }
}

/** Writes all notes to localStorage. */
export function writeStoredNotes(
  notes: Readonly<Record<string, string>>
): void {
  localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(notes));
}

/** Reads the saved hypothesis draft (missing/invalid fields are left out). */
export function readStoredHypothesis(): Partial<HypothesisDraft> {
  const raw = localStorage.getItem(STORAGE_KEY_HYPOTHESIS);
  return raw ? parseHypothesisDraft(raw) : {};
}

/** Saves a hypothesis draft to localStorage (throws if storage is full/blocked). */
export function writeStoredHypothesis(draft: HypothesisDraft): void {
  localStorage.setItem(STORAGE_KEY_HYPOTHESIS, JSON.stringify(draft));
}
