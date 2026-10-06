import { state, STORAGE_KEY_BOOKMARKS, STORAGE_KEY_NOTES } from "./state.ts";

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

export function loadBookmarksFromStorage(): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BOOKMARKS);
    const parsed: unknown = raw ? JSON.parse(raw) : [];

    state.bookmarks = Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : [];
  } catch (err) {
    console.warn("Could not read stored bookmarks, starting empty", err);

    state.bookmarks = [];
  }
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
