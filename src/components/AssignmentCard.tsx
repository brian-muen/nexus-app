import React, { useMemo, useState } from 'react'
import AssignmentSummary from './AssignmentSummary'

interface Props {
  id: string
  title: string
  due?: string | null
  description?: string
}

const formatDueDate = (due?: string | null) => {
  if (!due) return 'No due date'
  const date = new Date(due)
  if (Number.isNaN(date.getTime())) return 'No due date'
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const AssignmentCard: React.FC<Props> = ({ id, title, due, description }) => {
  const [expanded, setExpanded] = useState(false)
  const [showSummary, setShowSummary] = useState(false)

  const toggleExpanded = () => {
    setExpanded(previous => !previous)
    if (expanded) {
      setShowSummary(false)
    }
  }

  const preview = useMemo(() => {
    if (!description) return ''
    if (expanded) return description
    if (description.length <= 220) return description
    return `${description.slice(0, 220)}…`
  }, [description, expanded])

  return (
    <article className={`assignment-card${expanded ? ' expanded' : ''}`} data-id={id}>
      <button type="button" className="assignment-toggle" onClick={toggleExpanded}>
        <div className="assignment-head">
          <div className="assignment-title-group">
            <h3>{title}</h3>
            <time className="assignment-due">{formatDueDate(due)}</time>
          </div>
          <span className="assignment-expand-icon" aria-hidden>
            {expanded ? '−' : '+'}
          </span>
        </div>
      </button>
      <div className="assignment-body">
        {description ? (
          <p className="assignment-desc">{preview}</p>
        ) : (
          <p className="assignment-desc muted">No description provided.</p>
        )}
        {expanded && description && (
          <div className="assignment-summary-wrapper">
            <button
              className="nx-btn small summary-toggle"
              onClick={() => setShowSummary(previous => !previous)}
              type="button"
            >
              {showSummary ? 'Hide summary' : 'Summarize assignment'}
            </button>
            {showSummary && <AssignmentSummary description={description} />}
          </div>
        )}
      </div>
    </article>
  )
}

export default AssignmentCard
