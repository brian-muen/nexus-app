import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '@/supabaseClient'
import type { UnifiedAssignment } from '../utils/normalizeAssignments'

export const useAssignments = (refreshSignal = 0) => {
  const { email } = useAuth()
  const [assignments, setAssignments] = useState<UnifiedAssignment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const { data, error: supabaseError } = await supabase
          .from('canvas_assignments')
          .select(`
            id,
            course_id,
            title,
            description,
            due_date,
            status,
            download_url,
            canvas_id,
            canvas_courses ( id, code, name ),
            canvas_submissions ( id, grade, submitted_at, canvas_users ( id, name, email ) )
          `)
          .order('due_date', { ascending: true })

        if (supabaseError) throw supabaseError

        const mapped: UnifiedAssignment[] = (data ?? []).map((row: any) => {
          const course = row.canvas_courses ?? null
          const submissions: any[] = row.canvas_submissions ?? []
          const submissionForUser = email
            ? submissions.find((submission) => submission?.canvas_users?.email === email)
            : undefined

          return {
            id: `canvas:${row.id}`,
            source: 'canvas',
            sourceId: row.id,
            courseId: row.course_id ?? undefined,
            name: row.title ?? 'Untitled assignment',
            description: row.description ?? undefined,
            dueDate: row.due_date ?? null,
            grade: submissionForUser?.grade ?? null,
            raw: {
              ...row,
              course,
              submission: submissionForUser,
            },
          }
        })

        mapped.sort((x, y) => {
          const dx = x.dueDate ? new Date(x.dueDate).getTime() : Infinity
          const dy = y.dueDate ? new Date(y.dueDate).getTime() : Infinity
          return dx - dy
        })

        if (!cancelled) setAssignments(mapped)
      } catch (err: any) {
        if (!cancelled) setError(err?.message ?? String(err))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [email, refreshSignal])

  return { assignments, loading, error }
}

export default useAssignments
