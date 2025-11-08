import React, { useState } from 'react'
import AssignmentSummary from './AssignmentSummary'

interface Props {
  id: string
  title: string
  due?: string | null
  description?: string
}

const AssignmentCard: React.FC<Props> = ({ id, title, due, description }) => {
  const [showSummary, setShowSummary] = useState(false)

  return (
    <article className="assignment-card" data-id={id}>
      <div className="assignment-head">
        <h3>{title}</h3>
        <time className="assignment-due">{due ? new Date(due).toLocaleString() : 'No due date'}</time>
      </div>
      <div className="assignment-body">
        {description ? <p className="assignment-desc">{description.slice(0, 220)}{description.length > 220 ? '…' : ''}</p> : <p className="assignment-desc muted">No description</p>}
        {description && (
          <div>
            <button className="nx-btn small" onClick={() => setShowSummary(s => !s)}>
              {showSummary ? 'Hide summary' : 'Summarize'}
            </button>
            {showSummary && <AssignmentSummary description={description} />}
          </div>
        )}
      </div>
    </article>
  )
}

export default AssignmentCard
