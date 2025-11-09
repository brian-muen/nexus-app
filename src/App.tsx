import './App.css'
import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import SignIn from './components/SignIn'
import Home from './components/Home'
import CalendarPage from './pages/CalendarPage'
import TodoPage from './pages/TodoPage'
import ChatbotPage from './pages/ChatbotPage'
import Assignments from './components/Assignments'
import CalendarView from './components/CalendarView'
import GradesPage from './pages/GradesPage'
import { useAuth } from './contexts/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'

function App() {
  const { userId } = useAuth()
  const [view, setView] = useState<string>('dashboard')

  if (!userId) {
    return (
      <ErrorBoundary>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/todo" element={<TodoPage />} />
            <Route path="/chatbot" element={<ChatbotPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <SignIn />
        </BrowserRouter>
      </ErrorBoundary>
    )
  }

  return (
    <BrowserRouter>
      <div className="app-root">
        <Header />
        <div className="app-body">
          <Sidebar selected={view} onSelect={setView} />
          <main className="app-main">
            <ErrorBoundary>
              {view === 'dashboard' && <Dashboard />}
              {view === 'assignments' && <Assignments />}
              {view === 'calendar' && <CalendarView />}
              {view === 'grades' && <GradesPage />}
              {view === 'chatbot' && <ChatbotPage />}
              {!['dashboard', 'assignments', 'calendar', 'grades', 'chatbot'].includes(view) && (
                <div className="nx-panel muted">View '{view}' not implemented yet.</div>
              )}
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
