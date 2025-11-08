import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import * as canvasApi from '../api/canvas'
import gradescopeApi from '../api/gradescope'
import { normalizeAny } from '../utils/normalizeAssignments'
import type { UnifiedAssignment } from '../utils/normalizeAssignments'

export const useAssignments = () => {
  const { token } = useAuth()
  const [assignments, setAssignments] = useState<UnifiedAssignment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        // Canvas: fetch courses and assignments
        // Prefer explicit Canvas token saved in settings; fall back to the generic token
        const canvasToken = localStorage.getItem('nexus_canvas_token') || token || ''
        const gradescopeToken = localStorage.getItem('nexus_gradescope_token') || token || ''

        const canvasCourses = await canvasApi.fetchCourses(canvasToken)
        const canvasPromises = canvasCourses.map(async (c) => {
          try {
            const as = await canvasApi.fetchAssignments(c.id, canvasToken)
            return as.map(a => normalizeAny(a, { source: 'canvas', courseId: c.id }))
          } catch (e) {
            return [] as UnifiedAssignment[]
          }
        })

        const canvasResults = (await Promise.all(canvasPromises)).flat()

        // Gradescope: try fetching courses then assignments
        let gsResults: UnifiedAssignment[] = []
        try {
          const gsCourses = await gradescopeApi.fetchCourses(gradescopeToken)
          const gsPromises = gsCourses.map(async (c: any) => {
            try {
              const as = await gradescopeApi.fetchAssignments(c.id, gradescopeToken)
              return as.map((a: any) => normalizeAny(a))
            } catch (e) {
              return [] as UnifiedAssignment[]
            }
          })
          gsResults = (await Promise.all(gsPromises)).flat()
        } catch (e) {
          // ignore gradescope errors for now
        }

        const merged = [...canvasResults, ...gsResults]

        // sort by due date (nulls at the end)
        merged.sort((x, y) => {
          const dx = x.dueDate ? new Date(x.dueDate).getTime() : Infinity
          const dy = y.dueDate ? new Date(y.dueDate).getTime() : Infinity
          return dx - dy
        })

        if (!cancelled) setAssignments(merged)
      } catch (err: any) {
        if (!cancelled) setError(err?.message ?? String(err))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    if (token) {
      load()
    } else {
      // clear when no token
      setAssignments([])
    }

    return () => {
      cancelled = true
    }
  }, [token])

  return { assignments, loading, error }
}

export default useAssignments
