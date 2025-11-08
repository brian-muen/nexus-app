import { describe, it, expect } from 'vitest';
import {
  normalizeCanvasAssignment,
  normalizeGradescopeAssignment,
  normalizeAny,
} from '../normalizeAssignments';

describe('normalizeAssignments', () => {
  it('normalizes a canvas assignment', () => {
    const canvas = {
      id: 123,
      name: 'HW1',
      description: 'Do things',
      due_at: '2025-12-01T05:00:00Z',
    };

    const u = normalizeCanvasAssignment(canvas, 42);
    expect(u.id).toBe('canvas:123');
    expect(u.source).toBe('canvas');
    expect(u.sourceId).toBe(123);
    expect(u.courseId).toBe(42);
    expect(u.name).toBe('HW1');
    expect(u.dueDate).toBe('2025-12-01T05:00:00Z');
  });

  it('normalizes a gradescope assignment', () => {
    const gs = {
      id: 987,
      name: 'Project',
      description: 'Big project',
      due_date: null,
      course_id: 7,
    };

    const u = normalizeGradescopeAssignment(gs);
    expect(u.id).toBe('gradescope:987');
    expect(u.source).toBe('gradescope');
    expect(u.sourceId).toBe(987);
    expect(u.courseId).toBe(7);
    expect(u.dueDate).toBeNull();
  });

  it('normalizeAny detects canvas shape', () => {
    const canvas = { id: 5, name: 'A', due_at: null };
    const u = normalizeAny(canvas);
    expect(u.source).toBe('canvas');
  });

  it('normalizeAny falls back to gradescope', () => {
    const gs = { id: 8, name: 'B', due_date: null };
    const u = normalizeAny(gs);
    expect(u.source).toBe('gradescope');
  });
});
