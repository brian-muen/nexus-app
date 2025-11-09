import { useMemo } from 'react'
import { Calendar as CalendarIcon } from 'lucide-react'
import useAssignments from '@/hooks/useAssignments'

const DAY_FORMAT = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
})

const TIME_FORMAT = new Intl.DateTimeFormat(undefined, {
  hour: '2-digit',
  minute: '2-digit',
})

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

const formatTime = (iso?: string | null) => {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return TIME_FORMAT.format(date)
}

interface QuickEvent {
  id: string
  title: string
  dueDate: string | null | undefined
  courseCode?: string | null
}

const WINDOW_DAYS = 4

export default function QuickCalendar() {
  const { assignments } = useAssignments()

  const today = startOfDay(new Date())
  const days = useMemo(() => Array.from({ length: WINDOW_DAYS }).map((_, index) => addDays(today, index)), [today])

  const eventsByDay = useMemo(() => {
    const map = new Map<string, QuickEvent[]>()
    days.forEach((day) => map.set(day.toISOString().slice(0, 10), []))
    assignments
      .filter((assignment) => Boolean(assignment.dueDate))
      .forEach((assignment) => {
        const due = startOfDay(new Date(assignment.dueDate ?? ''))
        const key = due.toISOString().slice(0, 10)
        if (!map.has(key)) return
        const existing = map.get(key) ?? []
        existing.push({
          id: assignment.id,
          title: assignment.name,
          dueDate: assignment.dueDate,
          courseCode: assignment.raw?.course?.code ?? null,
        })
        map.set(key, existing)
      })
    return map
  }, [assignments, days])

  return (
    <section className="quick-calendar">
      <header className="quick-calendar-header">
        <span className="quick-calendar-pill">
          <CalendarIcon className="w-4 h-4" />
          Next few days
        </span>
        <h2>Quick calendar</h2>
        <p>Glance at what&apos;s due soon and jump into action.</p>
      </header>
      <div className="quick-calendar-grid">
        {days.map((day) => {
          const key = day.toISOString().slice(0, 10)
          const events = eventsByDay.get(key) ?? []
          return (
            <article key={key} className="quick-calendar-day">
              <div className="quick-calendar-day-header">{DAY_FORMAT.format(day)}</div>
              <div className="quick-calendar-day-body">
                {events.length === 0 && <p className="quick-calendar-empty">No deadlines</p>}
                {events
                  .sort((a, b) => new Date(a.dueDate ?? 0).getTime() - new Date(b.dueDate ?? 0).getTime())
                  .map((event) => (
                    <div key={event.id} className="quick-calendar-event">
                      <div className="quick-calendar-event-title">{event.title}</div>
                      <div className="quick-calendar-event-meta">
                        <span>{formatTime(event.dueDate)}</span>
                        {event.courseCode && <span className="quick-calendar-event-badge">{event.courseCode}</span>}
                      </div>
                    </div>
                  ))}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
