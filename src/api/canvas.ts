// src/api/canvas.ts

const CANVAS_BASE_URL = "https://canvas.princeton.edu/api/v1"; // change per school if needed

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
export const fetchCourses = async (token: string): Promise<Course[]> => {
  const res = await fetch(`${CANVAS_BASE_URL}/courses?enrollment_state=active`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch courses from Canvas");

  const data = await res.json();
  return data.map((c: any) => ({
    id: c.id,
    name: c.name,
  }));
};

// Fetch assignments for a specific course
export const fetchAssignments = async (
  courseId: number,
  token: string
): Promise<Assignment[]> => {
  const res = await fetch(`${CANVAS_BASE_URL}/courses/${courseId}/assignments`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error(`Failed to fetch assignments for course ${courseId}`);

  const data = await res.json();
  return data.map((a: any) => ({
    id: a.id,
    name: a.name,
    description: a.description ?? null,
    due_at: a.due_at ? new Date(a.due_at) : null,
  }));
};
