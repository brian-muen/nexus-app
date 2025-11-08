import React from 'react'
import AssignmentCard from './AssignmentCard'
import useAssignments from '../hooks/useAssignments'

const Dashboard: React.FC = () => {
  const { assignments, loading, error } = useAssignments()

  return (
    <section className="nx-dashboard">
      <section className="nx-section">
        <h2>Upcoming assignments</h2>
        <div className="assignments-list">
          {loading && <div className="nx-panel muted">Loading assignments…</div>}
          {error && <div className="nx-panel muted">Error: {error}</div>}
          {!loading && !error && assignments.length === 0 && (
            <div className="nx-panel muted">No upcoming assignments found. You can add Canvas / Gradescope accounts in Settings.</div>
          )}
          {assignments.map(a => (
            <AssignmentCard key={a.id} id={a.id} title={a.name} due={a.dueDate ?? undefined} description={a.description ?? undefined} />
          ))}
        </div>
      </section>

      <section className="nx-section">
        <h2>Quick calendar</h2>
        <div className="nx-panel muted">Calendar preview will appear here. Connect your calendar to sync events.</div>
      </section>
    </section>
  )
}

export default Dashboard
