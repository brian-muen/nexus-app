// Lightweight Calendar client and conversion helpers.
// Assumptions:
// - Default base URL is the Google Calendar API v3 pattern. Many schools will proxy or
//   provide a different calendar endpoint; use `setCalendarBaseUrl` or pass `baseUrl` to functions.
// - Auth token can be a Bearer token or a cookie string; we attach it heuristically.

const _envCalendar = typeof process !== 'undefined' && (process as any).env ? (process as any).env.CALENDAR_BASE_URL : undefined;
let CALENDAR_BASE = _envCalendar || "https://www.googleapis.com/calendar/v3";

export const setCalendarBaseUrl = (url: string) => {
  CALENDAR_BASE = url;
};

function buildHeaders(token?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (!token) return headers;

  if (/^Bearer\s+/i.test(token) || token.split('.').length === 3) {
    headers["Authorization"] = token.startsWith("Bearer") ? token : `Bearer ${token}`;
  } else {
    headers["Cookie"] = token;
  }

  return headers;
}

async function doGet<T>(path: string, token?: string, baseUrl?: string): Promise<T> {
  const effectiveBase = baseUrl ?? CALENDAR_BASE;
  const url = path.startsWith("http") ? path : `${effectiveBase}${path}`;
  const res = await fetch(url, { method: "GET", headers: buildHeaders(token) });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Calendar request failed ${res.status} ${res.statusText}: ${text}`);
  }
  return (await res.json()) as T;
}

async function doPost<T>(path: string, body: any, token?: string, baseUrl?: string): Promise<T> {
  const effectiveBase = baseUrl ?? CALENDAR_BASE;
  const url = path.startsWith("http") ? path : `${effectiveBase}${path}`;
  const res = await fetch(url, { method: "POST", headers: buildHeaders(token), body: JSON.stringify(body) });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Calendar POST failed ${res.status} ${res.statusText}: ${text}`);
  }
  return (await res.json()) as T;
}

async function doDelete(path: string, token?: string, baseUrl?: string): Promise<void> {
  const effectiveBase = baseUrl ?? CALENDAR_BASE;
  const url = path.startsWith("http") ? path : `${effectiveBase}${path}`;
  const res = await fetch(url, { method: "DELETE", headers: buildHeaders(token) });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Calendar DELETE failed ${res.status} ${res.statusText}: ${text}`);
  }
}

// Types used by the app
export interface CalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: string; // ISO datetime or date
  end?: string; // ISO datetime or date
  allDay?: boolean;
  source?: string; // optional provenance marker
  raw?: any;
}

/**
 * Fetch events from a calendar (Google Calendar style). Returns the API response items mapped
 * to the small `CalendarEvent` shape. By default uses `primary` calendar.
 */
export const fetchEvents = async (
  token?: string,
  calendarId = "primary",
  baseUrl?: string
): Promise<CalendarEvent[]> => {
  const path = `/calendars/${encodeURIComponent(calendarId)}/events`;
  const data = await doGet<any>(path, token, baseUrl);
  const items = Array.isArray(data.items) ? data.items : [];
  return items.map((it: any) => ({
    id: it.id,
    summary: it.summary ?? "",
    description: it.description,
    start: it.start?.dateTime ?? it.start?.date ?? null,
    end: it.end?.dateTime ?? it.end?.date ?? null,
    allDay: !!it.start?.date && !it.start?.dateTime,
    raw: it,
  } as CalendarEvent));
};

/**
 * Create an event in the calendar. The provided `event` uses the small `CalendarEvent` shape
 * and will be translated to a Google Calendar request body.
 */
export const createEvent = async (
  event: CalendarEvent,
  token?: string,
  calendarId = "primary",
  baseUrl?: string
): Promise<CalendarEvent> => {
  const path = `/calendars/${encodeURIComponent(calendarId)}/events`;

  // Map small shape to Google Calendar fields
  const body: any = {
    summary: event.summary,
    description: event.description,
  };

  if (event.allDay) {
    // date only
    body.start = { date: event.start };
    if (event.end) body.end = { date: event.end };
  } else {
    body.start = { dateTime: event.start };
    if (event.end) body.end = { dateTime: event.end };
  }

  const created = await doPost<any>(path, body, token, baseUrl);
  return {
    id: created.id,
    summary: created.summary,
    description: created.description,
    start: created.start?.dateTime ?? created.start?.date,
    end: created.end?.dateTime ?? created.end?.date,
    allDay: !!created.start?.date && !created.start?.dateTime,
    raw: created,
  } as CalendarEvent;
};

export const deleteEvent = async (
  eventId: string,
  token?: string,
  calendarId = "primary",
  baseUrl?: string
): Promise<void> => {
  const path = `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`;
  await doDelete(path, token, baseUrl);
};

// Conversion helpers: import app's UnifiedAssignment type to convert assignments into calendar events
import type { UnifiedAssignment } from "../utils/normalizeAssignments";

/**
 * Convert a unified assignment into a calendar event. Uses the assignment's dueDate as the event start.
 */
export const assignmentToEvent = (a: UnifiedAssignment): CalendarEvent => ({
  id: a.id,
  summary: a.name,
  description: a.description ?? undefined,
  start: a.dueDate ?? "",
  end: a.dueDate ?? undefined,
  allDay: false,
  source: a.source,
  raw: a.raw,
});

/**
 * Convert an array of unified assignments to calendar events.
 */
export const assignmentsToEvents = (assignments: UnifiedAssignment[]): CalendarEvent[] =>
  assignments.map(assignmentToEvent);

export default {
  fetchEvents,
  createEvent,
  deleteEvent,
  assignmentToEvent,
  assignmentsToEvents,
  setCalendarBaseUrl,
};
