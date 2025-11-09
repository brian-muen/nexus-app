import React from 'react'
import QuickCalendar from './QuickCalendar'
import QuickTodo from './QuickTodo'

const Dashboard: React.FC = () => {
  return (
    <div className="nx-dashboard">
      <div className="dashboard-left">
        <QuickCalendar />
      </div>
      <div className="dashboard-right">
        <QuickTodo />
      </div>
    </div>
  )
}

export default Dashboard
