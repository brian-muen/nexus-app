import React from 'react'

type Props = {
  selected?: string
  onSelect?: (view: string) => void
}

const Sidebar: React.FC<Props> = ({ selected = 'dashboard', onSelect }) => {
  const items = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'assignments', label: 'Assignments' },
    { key: 'calendar', label: 'Calendar' },
    { key: 'grades', label: 'Grades' },
    { key: 'chatbot', label: 'Chatbot' },
  ]

  return (
    <aside className="nx-sidebar">
      <nav>
        <ul>
          {items.map(i => (
            <li key={i.key} className={i.key === selected ? 'active' : ''} onClick={() => onSelect?.(i.key)}>{i.label}</li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}

export default Sidebar
