import React from "react";
import './App.css'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import SignIn from './components/SignIn'
import Settings from './components/Settings'
import { useAuth } from './contexts/AuthContext'
import { useState } from 'react'
import ErrorBoundary from './components/ErrorBoundary'

function App() {
  const { user } = useAuth()
  const [view, setView] = useState<string>('dashboard')

  if (!user) {
    return (
      <div className="app-root">
        <Header />
        <div className="app-body">
          <main className="app-main" style={{ margin: '2rem auto', maxWidth: 720 }}>
            <ErrorBoundary>
              <SignIn />
            </ErrorBoundary>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="app-root">
      <Header />
      <div className="app-body">
        <Sidebar selected={view} onSelect={setView} />
        <main className="app-main">
          <ErrorBoundary>
            {view === 'dashboard' && <Dashboard />}
            {view === 'settings' && <Settings />}
            {view !== 'dashboard' && view !== 'settings' && (
              <div className="nx-panel muted">View '{view}' not implemented yet.</div>
            )}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  )
}

export default App
