import { ApiError, DATA_SOURCE } from "./http.ts";

/** Turns a failed request into a sentence for the user. */
export function describeLoadError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 404)
      return "The requested data does not exist (HTTP 404).";
    if (error.status >= 500) {
      return `The server ran into a problem (HTTP ${error.status}). Please try again.`;
    }
    return `The server rejected the request (HTTP ${error.status}).`;
  }
  // fetch() rejects with a TypeError when no response arrives at all.
  if (error instanceof TypeError) {
    return DATA_SOURCE === "api"
      ? "The server could not be reached. Is the backend running (npm run api)?"
      : "The server could not be reached. Check your internet connection.";
  }
  return "Something unexpected went wrong.";
}
