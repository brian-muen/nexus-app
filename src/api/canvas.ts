// src/api/canvas.ts

const CANVAS_BASE_URL = "https://canvas.princeton.edu/api/v1"; // replace later to support different schools

// Type definitions
export interface Course {
  id: number;
  name: string;
}

export interface Assignment {
  id: number;
  name: string;
  description: string;
  due_at: string;
}

// Fetch all courses for the user
export const fetchCourses = async (token: string): Promise<Course[]> => {
  const res = await fetch(`${CANVAS_BASE_URL}/courses`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch courses from Canvas");

  return res.json();
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

  return res.json();
};