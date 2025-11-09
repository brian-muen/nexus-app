// src/api/canvas.ts

const DEFAULT_CANVAS_BASE_URL = (import.meta as any)?.env?.VITE_CANVAS_BASE_URL || "https://canvas.princeton.edu/api/v1";
let CANVAS_BASE_URL = DEFAULT_CANVAS_BASE_URL;

export const setCanvasBaseUrl = (url: string) => {
  if (!url) return;
  CANVAS_BASE_URL = url.replace(/\/$/, '') || DEFAULT_CANVAS_BASE_URL;
};

export const getCanvasBaseUrl = () => CANVAS_BASE_URL;

// Type definitions
export interface Course {
  id: number;
  name: string;
}

export interface Assignment {
  id: number;
  name: string;
  description: string | null;
  due_at: Date | null;
}

// Fetch active courses for the user
export const fetchCourses = async (token?: string, baseUrl?: string, proxyBase?: string): Promise<Course[]> => {
  const base = (baseUrl || CANVAS_BASE_URL).replace(/\/$/, '');
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = token.startsWith('Bearer') ? token : `Bearer ${token}`;
  }
  const url = proxyBase
    ? `${proxyBase}/courses${baseUrl ? `?baseUrl=${encodeURIComponent(base)}` : ''}`
    : `${base}/courses?enrollment_state=active`;
  const res = await fetch(url, { headers });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Canvas courses request failed: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data.map((c: any) => ({
    id: c.id,
    name: c.name,
  }));
};

// Fetch assignments for a specific course
export const fetchAssignments = async (
  courseId: number,
  token?: string,
  baseUrl?: string,
  proxyBase?: string
): Promise<Assignment[]> => {
  const base = (baseUrl || CANVAS_BASE_URL).replace(/\/$/, '');
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = token.startsWith('Bearer') ? token : `Bearer ${token}`;
  }
  const url = proxyBase
    ? `${proxyBase}/courses/${courseId}/assignments${baseUrl ? `?baseUrl=${encodeURIComponent(base)}` : ''}`
    : `${base}/courses/${courseId}/assignments`;
  const res = await fetch(url, { headers });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Canvas assignments request failed: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data.map((a: any) => ({
    id: a.id,
    name: a.name,
    description: a.description ?? null,
    due_at: a.due_at ? new Date(a.due_at) : null,
  }));
};

export default {
  fetchCourses,
  fetchAssignments,
  setCanvasBaseUrl,
  getCanvasBaseUrl,
};
