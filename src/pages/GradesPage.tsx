import useGradescopeAssignments from '@/hooks/useGradescope'
import { Trophy, TrendingUp, BookOpen } from 'lucide-react'

const formatPercent = (value: number | null | undefined) => {
  if (value == null || Number.isNaN(value)) return '—'
  return `${value.toFixed(1)}%`
}

const formatScore = (score: number | null | undefined, maxScore: number | null | undefined) => {
  if (score == null || maxScore == null) return '—'
  return `${score}/${maxScore}`
}

const formatDue = (iso: string | null | undefined) => {
  if (!iso) return 'No due date'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'No due date'
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function GradesPage() {
  const { assignments, courses, loading, error } = useGradescopeAssignments()

  const overall = courses.reduce(
    (acc, course) => {
      acc.totalScore += course.totalScore
      acc.totalMax += course.totalMaxScore
      return acc
    },
    { totalScore: 0, totalMax: 0 },
  )

  const overallPercent = overall.totalMax > 0 ? (overall.totalScore / overall.totalMax) * 100 : null

  return (
    <div className="grades-page">
      <header className="grades-hero">
        <div className="grades-hero-meta">
          <span className="grades-pill">
            <Trophy className="w-4 h-4" />
            Gradescope overview
          </span>
          <h1>Track progress across every course</h1>
          <p>Review recent submissions, see per-course averages, and catch assignments that need attention.</p>
        </div>
        <div className="grades-summary-cards">
          <article className="grades-summary-card">
            <div className="grades-summary-icon">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="grades-summary-label">Overall average</p>
              <p className="grades-summary-value">{formatPercent(overallPercent)}</p>
            </div>
          </article>
          <article className="grades-summary-card">
            <div className="grades-summary-icon alt">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="grades-summary-label">Courses tracked</p>
              <p className="grades-summary-value">{courses.length}</p>
            </div>
          </article>
        </div>
      </header>

      {loading && <div className="nx-panel muted">Loading Gradescope data…</div>}
      {error && <div className="nx-error">{error}</div>}
      {!loading && !error && assignments.length === 0 && (
        <div className="nx-panel muted">No Gradescope submissions yet. Once assignments are imported, your progress will appear here.</div>
      )}

      <section className="grades-courses">
        {courses.map((course) => (
          <article key={course.courseId} className="grades-course-card">
            <header className="grades-course-header">
              <h2>{course.courseCode || 'Uncategorized course'}</h2>
              <p>{course.courseName || 'No course name provided'}</p>
              <span className="grades-course-average">{formatPercent(course.averagePercent)}</span>
            </header>

            <div className="grades-course-table">
              <div className="grades-course-table-head">
                <span>Assignment</span>
                <span>Due</span>
                <span>Status</span>
                <span>Score</span>
              </div>
              <div className="grades-course-table-body">
                {course.assignments.map((assignment) => (
                  <div key={assignment.id} className="grades-course-row">
                    <div className="grades-course-col">
                      <p className="grades-assignment-title">{assignment.title}</p>
                      {assignment.averageScore != null && (
                        <span className="grades-assignment-average">Class avg: {formatPercent(assignment.averageScore)}</span>
                      )}
                    </div>
                    <span className="grades-course-col">{formatDue(assignment.dueDate)}</span>
                    <span className="grades-course-col status">{assignment.status ?? '—'}</span>
                    <span className="grades-course-col score">{formatScore(assignment.score, assignment.maxScore)}</span>
                  </div>
                ))}
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}
