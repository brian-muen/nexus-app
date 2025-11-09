import { useMemo, useState } from 'react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Link2 } from 'lucide-react'
import useAssignments from '@/hooks/useAssignments'

const DATE_FORMAT = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
})

const LONG_DATE_FORMAT = new Intl.DateTimeFormat(undefined, {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
})

const TIME_FORMAT = new Intl.DateTimeFormat(undefined, {
  hour: '2-digit',
  minute: '2-digit',
})

const formatDueTime = (iso?: string | null) => {
  if (!iso) return 'No due time'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'No due time'
  return TIME_FORMAT.format(date)
}

const startOfDay = (date: Date) => {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy
}

const addDays = (date: Date, amount: number) => {
  const copy = new Date(date)
  copy.setDate(copy.getDate() + amount)
  return copy
}

const getDayKey = (date: Date) => date.toISOString().slice(0, 10)

interface CalendarEvent {
  id: string
  title: string
  dueDate: string | null | undefined
  description?: string
  courseCode?: string | null
  courseName?: string | null
}

const UPCOMING_WINDOW_DAYS = 7

export default function CalendarView() {
  const [reloadKey] = useState(0)
  const [weekOffset, setWeekOffset] = useState(0)
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null)
  const { assignments, loading, error } = useAssignments(reloadKey)

  const events: CalendarEvent[] = useMemo(
    () =>
      assignments
        .filter((assignment) => Boolean(assignment.dueDate))
        .map((assignment) => ({
          id: assignment.id,
          title: assignment.name,
          dueDate: assignment.dueDate,
          description: assignment.description ?? undefined,
          courseCode: assignment.raw?.course?.code ?? null,
          courseName: assignment.raw?.course?.name ?? null,
        })),
    [assignments],
  )

  const today = startOfDay(new Date())
  const windowStart = addDays(today, weekOffset * UPCOMING_WINDOW_DAYS)

  const days = useMemo(() => {
    return Array.from({ length: UPCOMING_WINDOW_DAYS }).map((_, index) => {
      const date = addDays(windowStart, index)
      const key = getDayKey(date)
      return { date, key }
    })
  }, [windowStart])

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()
    events.forEach((event) => {
      if (!event.dueDate) return
      const key = getDayKey(startOfDay(new Date(event.dueDate)))
      const existing = map.get(key) ?? []
      existing.push(event)
      map.set(key, existing)
    })
    days.forEach(({ key }) => {
      if (!map.has(key)) map.set(key, [])
    })
    return map
  }, [events, days])

  const overdueEvents = useMemo(
    () =>
      events
        .filter((event) => {
          if (!event.dueDate) return false
          const due = startOfDay(new Date(event.dueDate))
          return due < today
        })
        .sort((a, b) => new Date(a.dueDate ?? 0).getTime() - new Date(b.dueDate ?? 0).getTime()),
    [events, today],
  )

  return (
    <div className="calendar-page">
      <header className="calendar-header">
        <div className="calendar-title">
          <span className="calendar-pill">
            <CalendarIcon className="w-4 h-4" />
            Upcoming schedule
          </span>
          <h1>Plan the week ahead</h1>
          <p>Scroll through the next few days to see everything that&apos;s due and carve out time to get it done.</p>
        </div>
        <div className="calendar-controls">
          <button type="button" className="nx-btn-outline icon" onClick={() => setWeekOffset((prev) => prev - 1)}>
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="calendar-current-range">
            {DATE_FORMAT.format(windowStart)} – {DATE_FORMAT.format(addDays(windowStart, UPCOMING_WINDOW_DAYS - 1))}
          </div>
          <button type="button" className="nx-btn-outline icon" onClick={() => setWeekOffset((prev) => prev + 1)}>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {overdueEvents.length > 0 && (
        <section className="calendar-overdue">
          <h2>Overdue</h2>
          <div className="calendar-overdue-grid">
            {overdueEvents.map((event) => (
              <article key={`overdue-${event.id}`} className="calendar-overdue-card">
                <div className="calendar-overdue-title">{event.title}</div>
                <div className="calendar-overdue-meta">
                  <Clock className="w-3 h-3" />
                  <span>Was due {LONG_DATE_FORMAT.format(new Date(event.dueDate ?? ''))}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="calendar-grid">
        {days.map(({ date, key }) => {
          const dayEvents = eventsByDay.get(key) ?? []
          return (
            <article key={key} className={`calendar-day-card ${dayEvents.length === 0 ? 'empty' : ''}`}>
              <header className="calendar-day-header">
                <span className="calendar-day-label">{DATE_FORMAT.format(date)}</span>
                <span className="calendar-day-full">{LONG_DATE_FORMAT.format(date)}</span>
              </header>
              <div className="calendar-day-events">
                {dayEvents.length === 0 && <p className="calendar-day-empty">No deadlines</p>}
                {dayEvents
                  .sort((a, b) => new Date(a.dueDate ?? 0).getTime() - new Date(b.dueDate ?? 0).getTime())
                  .map((event) => (
                    <div key={event.id} className="calendar-event">
                      <div className="calendar-event-header">
                        <span className="calendar-event-time">{formatDueTime(event.dueDate)}</span>
                        {event.courseCode && <span className="calendar-event-badge">{event.courseCode}</span>}
                      </div>
                      <div className="calendar-event-title">{event.title}</div>
                      {event.description && (
                        <>
                          <p className={`calendar-event-desc ${expandedEventId === event.id ? 'expanded' : ''}`}>
                            {event.description}
                          </p>
                          <button
                            type="button"
                            className="calendar-event-toggle"
                            onClick={() =>
                              setExpandedEventId((current) => (current === event.id ? null : event.id))
                            }
                          >
                            {expandedEventId === event.id ? 'Show less' : 'Show more'}
                          </button>
                        </>
                      )}
                      {event.courseName && (
                        <div className="calendar-event-foot">
                          <Link2 className="w-3 h-3" />
                          <span>{event.courseName}</span>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </article>
          )
        })}
      </section>

      {loading && <div className="nx-panel muted">Loading calendar…</div>}
      {error && <div className="nx-error">{error}</div>}
      {!loading && !error && events.length === 0 && (
        <div className="nx-panel muted">No assignments with due dates yet. Add some to see them on the calendar.</div>
      )}
    </div>
  )
}
