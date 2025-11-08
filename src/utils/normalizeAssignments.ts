// Utilities to normalize assignment objects from different sources (Canvas, Gradescope)

export type Source = "canvas" | "gradescope";

export interface UnifiedAssignment {
  id: string; // stable id (prefix with source to avoid collisions)
  source: Source;
  sourceId: number; // numeric id from the original system
  courseId?: number;
  name: string;
  description?: string;
  dueDate?: string | null;
  grade?: number | null;
  raw?: any; // original object for debugging
}

// Canvas shape (minimal) - matches src/api/canvas.ts
export interface CanvasAssignment {
  id: number;
  name: string;
  description?: string;
  due_at?: string | null;
}

// Gradescope shape (minimal) - matches src/api/gradescope.ts
export interface GradescopeAssignment {
  id: number;
  name: string;
  description?: string;
  due_date?: string | null;
  course_id?: number;
}

export const normalizeCanvasAssignment = (a: CanvasAssignment, courseId?: number): UnifiedAssignment => ({
  id: `canvas:${a.id}`,
  source: "canvas",
  sourceId: a.id,
  courseId: courseId,
  name: a.name,
  description: a.description,
  dueDate: a.due_at ?? null,
  grade: null,
  raw: a,
});

export const normalizeGradescopeAssignment = (a: GradescopeAssignment): UnifiedAssignment => ({
  id: `gradescope:${a.id}`,
  source: "gradescope",
  sourceId: a.id,
  courseId: a.course_id,
  name: a.name,
  description: a.description,
  dueDate: a.due_date ?? null,
  grade: null,
  raw: a,
});

export const normalizeAny = (obj: any, opts?: { source?: Source; courseId?: number }): UnifiedAssignment => {
  if (opts?.source === "canvas" || (obj && typeof obj.due_at !== "undefined")) {
    return normalizeCanvasAssignment(obj as CanvasAssignment, opts?.courseId);
  }

  return normalizeGradescopeAssignment(obj as GradescopeAssignment);
};

export default {
  normalizeCanvasAssignment,
  normalizeGradescopeAssignment,
  normalizeAny,
};
