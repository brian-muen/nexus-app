import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '@/supabaseClient'
import type { UnifiedAssignment } from '../utils/normalizeAssignments'

export const useAssignments = (refreshSignal = 0) => {
  const { userId } = useAuth()
  const [assignments, setAssignments] = useState<UnifiedAssignment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      if (!userId) {
        setAssignments([])
        return
      }

      setLoading(true)
      setError(null)
      try {
        const { data, error: supabaseError } = await supabase
          .from('canvas_assignments')
          .select('*')
          .eq('user_id', userId)
          .order('due_at', { ascending: true })

        if (supabaseError) throw supabaseError

        const mapped: UnifiedAssignment[] = (data ?? []).map((row: any) => ({
          id: row.assignment_id ? `canvas:${row.assignment_id}` : `canvas:${row.id}`,
          source: 'canvas',
          sourceId: row.assignment_id ?? row.id,
          courseId: row.canvas_course_id ?? undefined,
          name: row.name ?? row.title ?? 'Untitled assignment',
          description: row.description ?? undefined,
          dueDate: row.due_at ?? null,
          grade: row.points_possible ?? null,
          raw: row.raw ?? row,
        }))

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
  }, [userId, refreshSignal])

  return { assignments, loading, error }
}

export default useAssignments
