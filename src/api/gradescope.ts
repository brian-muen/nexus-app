// A lightweight Gradescope client for the app.
// Notes / assumptions:
// - Gradescope doesn't provide a single stable public API for students in the same way as Canvas.
//   This module provides a small wrapper that can be configured with a base URL and token.
// - Token can be a Bearer token or a session cookie string; the helper will attach it as
//   an Authorization header when it looks like a bearer token, otherwise as Cookie.
// - Endpoints used here are best-effort and designed to be swapped for your institution's
//   integration/backend proxy. Keep the functions small and easy to adapt.

const _envGradescope = typeof process !== 'undefined' && (process as any).env ? (process as any).env.GRADESCOPE_BASE_URL : undefined;
let GRADESCOPE_BASE = _envGradescope || "https://www.gradescope.com/api";

/**
 * Set a runtime base URL for Gradescope endpoints. Useful when you have a school
 * specific proxy or different deployment.
 */
export const setGradescopeBaseUrl = (url: string) => {
  GRADESCOPE_BASE = url;
};
// Types
export interface GradescopeCourse {
  id: number;
  name: string;
  course_code?: string;
}

export interface GradescopeAssignment {
  id: number;
  name: string;
  description?: string;
  due_date?: string | null;
  course_id?: number;
}

export interface GradescopeSubmission {
  id: number;
  student_name?: string;
  submitted_at?: string | null;
  grade?: number | null;
  status?: string;
}

function buildHeaders(token?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (!token) return headers;

  // Simple heuristic: if token looks like "Bearer ..." or a long JWT, use Authorization
  if (/^Bearer\s+/i.test(token) || token.split('.').length === 3) {
    headers["Authorization"] = token.startsWith("Bearer") ? token : `Bearer ${token}`;
  } else {
    // fallback: attach as cookie (some integrations use session cookies)
    headers["Cookie"] = token;
  }

  return headers;
}

async function doGet<T>(path: string, token?: string, baseUrl?: string): Promise<T> {
  const effectiveBase = baseUrl ?? GRADESCOPE_BASE;
  const url = path.startsWith("http") ? path : `${effectiveBase}${path}`;

  const res = await fetch(url, {
    method: "GET",
    headers: buildHeaders(token),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Gradescope request failed ${res.status} ${res.statusText}: ${text}`);
  }

  return (await res.json()) as T;
}

// Public helpers
/**
 * Fetch courses a user is enrolled in.
 * @param token optional auth token or cookie string
 * @param baseUrl optional base url override
 */
export const fetchCourses = async (
  token?: string,
  baseUrl?: string
): Promise<GradescopeCourse[]> => {
  // Many deployments expose something like /courses.json or a proxied endpoint.
  // Keep this path configurable via baseUrl if needed.
  return doGet<GradescopeCourse[]>("/courses.json", token, baseUrl);
};

/**
 * Fetch assignments for a course.
 * @param courseId Gradescope course id
 */
export const fetchAssignments = async (
  courseId: number,
  token?: string,
  baseUrl?: string
): Promise<GradescopeAssignment[]> => {
  // Path mirrors a common pattern: /courses/:id/assignments.json
  return doGet<GradescopeAssignment[]>(`/courses/${courseId}/assignments.json`, token, baseUrl);
};

/**
 * Fetch a single assignment by id.
 */
export const fetchAssignment = async (
  assignmentId: number,
  token?: string,
  baseUrl?: string
): Promise<GradescopeAssignment> => {
  return doGet<GradescopeAssignment>(`/assignments/${assignmentId}.json`, token, baseUrl);
};

/**
 * Fetch submissions for an assignment.
 */
export const fetchSubmissions = async (
  assignmentId: number,
  token?: string,
  baseUrl?: string
): Promise<GradescopeSubmission[]> => {
  return doGet<GradescopeSubmission[]>(`/assignments/${assignmentId}/submissions.json`, token, baseUrl);
};

// Lightweight helper that returns summarized assignment description if available.
// This imports the project's summarize utility lazily to avoid hard dependency in environments
// where OpenAI keys aren't configured.
export const fetchAndSummarizeAssignment = async (
  assignmentId: number,
  token?: string,
  baseUrl?: string
): Promise<{ assignment: GradescopeAssignment; summary?: string }> => {
  const assignment = await fetchAssignment(assignmentId, token, baseUrl);

  let summary: string | undefined;
  if (assignment.description) {
    try {
      // dynamic import to avoid failing in environments without OpenAI configured
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { summarizeText } = await import("../utils/summarize");
      summary = await summarizeText(assignment.description);
    } catch (err) {
      // ignore summarization errors and return raw description
      summary = undefined;
    }
  }

  return { assignment, summary };
};

export default {
  fetchCourses,
  fetchAssignments,
  fetchAssignment,
  fetchSubmissions,
  fetchAndSummarizeAssignment,
};
