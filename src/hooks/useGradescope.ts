import { useEffect, useState } from 'react'
import { supabase } from '@/supabaseClient'

export interface GradescopeAssignment {
  id: string
  title: string
  dueDate: string | null
  score: number | null
  maxScore: number | null
  status?: string | null
  averageScore?: number | null
  courseId?: string | number | null
  courseCode?: string | null
  courseName?: string | null
}

export interface CourseSummary {
  courseId: string | number
  courseCode?: string | null
  courseName?: string | null
  assignments: GradescopeAssignment[]
  totalScore: number
  totalMaxScore: number
  averagePercent: number | null
}

interface HookState {
  assignments: GradescopeAssignment[]
  courses: CourseSummary[]
  loading: boolean
  error: string | null
}

export const useGradescopeAssignments = (): HookState => {
  const [assignments, setAssignments] = useState<GradescopeAssignment[]>([])
  const [courses, setCourses] = useState<CourseSummary[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError(null)

      try {
        const { data, error: supabaseError } = await supabase
          .from('gradescope_assignments')
          .select(`
            id,
            assignment_name,
            title,
            name,
            due_date,
            score,
            max_score,
            status,
            average_score,
            course_id,
            gradescope_courses (
              id,
              code,
              name,
              short_name
            )
          `)
          .order('due_date', { ascending: true })

        if (supabaseError) {
          throw supabaseError
        }

        const normalized: GradescopeAssignment[] = (data ?? []).map((row: any) => {
          const course = row.gradescope_courses ?? {}
          return {
            id: String(row.id ?? crypto.randomUUID()),
            title: row.title ?? row.assignment_name ?? row.name ?? 'Untitled assignment',
            dueDate: row.due_date ?? null,
            score: typeof row.score === 'number' ? row.score : row.score ? Number(row.score) : null,
            maxScore: typeof row.max_score === 'number' ? row.max_score : row.max_score ? Number(row.max_score) : null,
            status: row.status ?? null,
            averageScore: typeof row.average_score === 'number' ? row.average_score : row.average_score ? Number(row.average_score) : null,
            courseId: row.course_id ?? course.id ?? null,
            courseCode: course.code ?? null,
            courseName: course.name ?? course.short_name ?? null,
          }
        })

        const grouped = new Map<string | number, CourseSummary>()
        normalized.forEach((assignment) => {
          const courseKey = assignment.courseId ?? assignment.courseCode ?? 'uncategorized'
          const current = grouped.get(courseKey) ?? {
            courseId: courseKey,
            courseCode: assignment.courseCode ?? null,
            courseName: assignment.courseName ?? null,
            assignments: [],
            totalScore: 0,
            totalMaxScore: 0,
            averagePercent: null,
          }

          current.assignments.push(assignment)

          if (typeof assignment.score === 'number' && typeof assignment.maxScore === 'number' && assignment.maxScore > 0) {
            current.totalScore += assignment.score
            current.totalMaxScore += assignment.maxScore
          }

          grouped.set(courseKey, current)
        })

        const summaries: CourseSummary[] = Array.from(grouped.values()).map((summary) => ({
          ...summary,
          averagePercent:
            summary.totalMaxScore > 0 ? Number(((summary.totalScore / summary.totalMaxScore) * 100).toFixed(1)) : null,
        }))

        if (!cancelled) {
          setAssignments(normalized)
          setCourses(summaries)
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message ?? 'Failed to load Gradescope assignments')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [])

  return { assignments, courses, loading, error }
}

export default useGradescopeAssignments
