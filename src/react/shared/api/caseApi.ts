// The case-data API: one function per endpoint. This is the ONLY place that
// knows the backend's URLs and the static-file fallback. Components and hooks
// call these functions and never call fetch() themselves.

import type {
  CaseInfo,
  CaseLocation,
  Person,
  RawEvidence,
  TimelineEvent
} from "../../../types.ts";
import { ApiError, DATA_SOURCE, getJson, getStaticJson } from "./http.ts";

/** Lists: GET /api/<resource>, or public/data/<resource>.json in static mode. */
function getResource<T>(resource: string, signal?: AbortSignal): Promise<T> {
  return DATA_SOURCE === "api"
    ? getJson<T>(resource, signal)
    : getStaticJson<T>(`${resource}.json`, signal);
}

export function getCaseInfo(signal?: AbortSignal): Promise<CaseInfo> {
  return getResource<CaseInfo>("case", signal);
}

export function getPeople(signal?: AbortSignal): Promise<Person[]> {
  return getResource<Person[]>("people", signal);
}

export function getLocations(signal?: AbortSignal): Promise<CaseLocation[]> {
  return getResource<CaseLocation[]>("locations", signal);
}

export function getEvidenceList(signal?: AbortSignal): Promise<RawEvidence[]> {
  return getResource<RawEvidence[]>("evidence", signal);
}

export function getTimeline(signal?: AbortSignal): Promise<TimelineEvent[]> {
  return getResource<TimelineEvent[]>("timeline", signal);
}

/** One evidence item: GET /api/evidence/:id (static mode: looked up in the list). */
export async function getEvidenceItem(
  id: string,
  signal?: AbortSignal
): Promise<RawEvidence> {
  if (DATA_SOURCE === "api") {
    return getJson<RawEvidence>(`evidence/${encodeURIComponent(id)}`, signal);
  }
  const item = (await getEvidenceList(signal)).find((ev) => ev.id === id);
  if (!item) throw new ApiError(404, `data/evidence.json#${id}`);
  return item;
}
