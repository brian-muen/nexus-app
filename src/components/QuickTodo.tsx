import { useMemo, useState } from 'react'
import { Filter, Calendar as CalendarIcon, BookOpen } from 'lucide-react'
import useAssignments from '@/hooks/useAssignments'

const FILTERS = ['All', 'Today', 'This Week'] as const

type FilterType = (typeof FILTERS)[number]

type GroupedAssignment = {
  id: string
  title: string
  dueDate: string | null | undefined
  courseCode?: string | null
  courseName?: string | null
}

const startOfDay = (date: Date) => {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy
}

const formatDueDate = (iso?: string | null) => {
  if (!iso) return 'No due date'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'No due date'
  return new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric' }).format(date)
}

interface FilterOption {
  label: string
  value: FilterType
  filter: (assignment: GroupedAssignment, today: Date) => boolean
}

const filterOptions: FilterOption[] = [
  {
    label: 'All',
    value: 'All',
    filter: () => true,
  },
  {
    label: 'Today',
    value: 'Today',
    filter: (assignment, today) => {
      if (!assignment.dueDate) return false
      const due = startOfDay(new Date(assignment.dueDate))
      return due.getTime() === today.getTime()
    },
  },
  {
    label: 'This Week',
    value: 'This Week',
    filter: (assignment, today) => {
      if (!assignment.dueDate) return false
      const due = startOfDay(new Date(assignment.dueDate))
      const endOfWeek = new Date(today)
      endOfWeek.setDate(endOfWeek.getDate() + 6)
      endOfWeek.setHours(23, 59, 59, 999)
      return due >= today && due <= endOfWeek
    },
  },
]

export default function QuickTodo() {
  const { assignments } = useAssignments()
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('All')
  const [selectedCourse, setSelectedCourse] = useState<string>('All')

  const today = startOfDay(new Date())

  const assignmentsWithMeta: GroupedAssignment[] = useMemo(
    () =>
      assignments.map((assignment) => ({
        id: assignment.id,
        title: assignment.name,
        dueDate: assignment.dueDate,
        courseCode: assignment.raw?.course?.code ?? null,
        courseName: assignment.raw?.course?.name ?? null,
      })),
    [assignments],
  )

  const courseOptions = useMemo(() => {
    const codes = new Set<string>()
    assignmentsWithMeta.forEach((assignment) => {
      if (assignment.courseCode) {
        codes.add(assignment.courseCode)
      }
    })
    return ['All', ...Array.from(codes.values())]
  }, [assignmentsWithMeta])

  const visibleAssignments = useMemo(() => {
    const filterOption = filterOptions.find((option) => option.value === selectedFilter) ?? filterOptions[0]
    return assignmentsWithMeta
      .filter((assignment) => filterOption.filter(assignment, today))
      .filter((assignment) => (selectedCourse === 'All' ? true : assignment.courseCode === selectedCourse))
      .sort((a, b) => new Date(a.dueDate ?? 0).getTime() - new Date(b.dueDate ?? 0).getTime())
  }, [assignmentsWithMeta, selectedFilter, selectedCourse, today])

  return (
    <section className="quick-todo">
      <header className="quick-todo-header">
        <span className="quick-todo-pill">
          <BookOpen className="w-4 h-4" />
          To-do focus
        </span>
        <div className="quick-todo-title">
          <h2>Assignments to tackle</h2>
          <p>Filter by time window or course to plan your next work sprint.</p>
        </div>
      </header>

      <div className="quick-todo-filters">
        <div className="quick-todo-filter-group">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`quick-todo-filter ${selectedFilter === option.value ? 'active' : ''}`}
              onClick={() => setSelectedFilter(option.value)}
            >
              <Filter className="w-3 h-3" />
              {option.label}
            </button>
          ))}
        </div>

        <div className="quick-todo-course">
          <CalendarIcon className="w-3 h-3" />
          <select value={selectedCourse} onChange={(event) => setSelectedCourse(event.target.value)}>
            {courseOptions.map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="quick-todo-list">
        {visibleAssignments.length === 0 && (
          <div className="quick-todo-empty">No assignments match the current filters.</div>
        )}
        {visibleAssignments.map((assignment) => (
          <article key={assignment.id} className="quick-todo-item">
            <header className="quick-todo-item-header">
              <h3>{assignment.title}</h3>
              <span className="quick-todo-item-date">{formatDueDate(assignment.dueDate)}</span>
            </header>
            <div className="quick-todo-item-meta">
              <span className="quick-todo-item-tag">Due</span>
              {assignment.courseCode && <span className="quick-todo-item-tag alt">{assignment.courseCode}</span>}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
