import { ApiError, DATA_SOURCE } from "../api/http.ts";

const UNREACHABLE_HINT =
  DATA_SOURCE === "api"
    ? "Is the backend running (npm run api)?"
    : "Check your internet connection.";

/** UI wording: turns a failed request into a sentence for the user. */
export function describeLoadError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 404) {
      return "The requested data does not exist (HTTP 404).";
    }
    // 502/504 = a proxy/gateway got no answer from the server behind it. In
    // development that's Vite's /api proxy when the backend isn't running.
    if (error.status === 502 || error.status === 504) {
      return `The server could not be reached (HTTP ${error.status}). ${UNREACHABLE_HINT}`;
    }
    if (error.status >= 500) {
      return `The server ran into a problem (HTTP ${error.status}). Please try again.`;
    }
    return `The server rejected the request (HTTP ${error.status}).`;
  }
  // fetch() rejects with a TypeError when no response arrives at all.
  if (error instanceof TypeError) {
    return `The server could not be reached. ${UNREACHABLE_HINT}`;
  }
  return "Something unexpected went wrong.";
}
