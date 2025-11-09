import { useMemo, useState } from 'react';
import useAssignments from '@/hooks/useAssignments';
import AssignmentCard from '@/components/AssignmentCard';
import type { UnifiedAssignment } from '@/utils/normalizeAssignments';

const groupByCourse = (assignments: UnifiedAssignment[]) => {
  const byCourse = new Map<
    string,
    {
      courseId?: number;
      courseName?: string | null;
      courseCode?: string | null;
      source: string;
      items: UnifiedAssignment[];
    }
  >();

  assignments.forEach((assignment) => {
    const course = assignment.raw?.course ?? null;
    const courseId = assignment.courseId ?? course?.id;
    const key = `${assignment.source}:${courseId ?? 'uncategorized'}`;
    const entry =
      byCourse.get(key) ?? {
        courseId,
        courseName: course?.name ?? null,
        courseCode: course?.code ?? null,
        source: assignment.source,
        items: [] as UnifiedAssignment[],
      };
    entry.items.push(assignment);
    byCourse.set(key, entry);
  });

  return Array.from(byCourse.values()).sort((a, b) => {
    const labelA = `${a.courseCode ?? ''}${a.courseName ?? ''}`.toLowerCase();
    const labelB = `${b.courseCode ?? ''}${b.courseName ?? ''}`.toLowerCase();
    return labelA.localeCompare(labelB);
  });
};

const sourceLabel: Record<string, string> = {
  canvas: 'Mock Canvas',
  gradescope: 'Gradescope',
};

export default function Assignments() {
  const [reloadKey, setReloadKey] = useState(0);
  const { assignments, loading, error } = useAssignments(reloadKey);

  const sections = useMemo(
    () =>
      groupByCourse(
        assignments.filter((assignment): assignment is UnifiedAssignment => assignment.source === 'canvas'),
      ),
    [assignments],
  );

  return (
    <div className="assignments-page">
      <header className="nx-section">
        <h1>Assignments (Mock Canvas)</h1>
        <p className="nx-subtle">
          These assignments are served from the Supabase tables <code>canvas_courses</code>, <code>canvas_assignments</code>, and
          <code> canvas_submissions</code>. Update the data in Supabase and press refresh to pull the latest snapshot.
        </p>
      </header>

      <section className="canvas-sync-panel">
        <article className="canvas-sync-card">
          <h2>Mock data controls</h2>
          <p>
            Use the seeded Canvas tables in Supabase to emulate the real Canvas API. When you add or edit rows, click refresh to
            reload the assignments in Nexus.
          </p>
          <div className="sync-actions">
            <button type="button" className="nx-btn" onClick={() => setReloadKey((prev) => prev + 1)} disabled={loading}>
              {loading ? 'Refreshing…' : 'Refresh assignments'}
            </button>
          </div>
        </article>
      </section>

      {loading && <div className="nx-panel muted">Loading assignments…</div>}
      {error && <div className="nx-error">{error}</div>}

      {!loading && !error && sections.length === 0 && (
        <div className="nx-panel muted">No mock Canvas assignments found. Seed the Supabase tables to get started.</div>
      )}

      <section className="assignments-grid">
        {sections.map((section) => (
          <article key={`${section.source}-${section.courseId ?? 'na'}`} className="assignments-group">
            <header className="group-header">
              <div className="group-header-left">
                <span className={`source-pill ${section.source}`}>{sourceLabel[section.source] ?? section.source}</span>
                <span className="group-course-name">
                  {section.courseCode ? `${section.courseCode} · ${section.courseName ?? 'Untitled course'}` : section.courseName || 'General'}
                </span>
              </div>
              <div className="group-meta">
                <span>{section.items.length} assignments</span>
              </div>
            </header>
            <div className="group-body">
              {section.items.map((assignment) => (
                <AssignmentCard
                  key={assignment.id}
                  id={assignment.id}
                  title={assignment.name}
                  due={assignment.dueDate ?? null}
                  description={assignment.description ?? undefined}
                />
              ))}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}