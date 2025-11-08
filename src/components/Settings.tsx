import React, { useState, useEffect } from 'react'
import * as canvasApi from '../api/canvas'
import gradescopeApi from '../api/gradescope'

const CANVAS_KEY = 'nexus_canvas_token'
const GRADESCOPE_KEY = 'nexus_gradescope_token'

const Settings: React.FC = () => {
  const [canvasToken, setCanvasToken] = useState('')
  const [gradescopeToken, setGradescopeToken] = useState('')
  const [saved, setSaved] = useState(false)
  const [validating, setValidating] = useState(false)
  const [canvasValid, setCanvasValid] = useState<boolean | null>(null)
  const [gradescopeValid, setGradescopeValid] = useState<boolean | null>(null)

  useEffect(() => {
    try {
      const c = localStorage.getItem(CANVAS_KEY) || ''
      const g = localStorage.getItem(GRADESCOPE_KEY) || ''
      setCanvasToken(c)
      setGradescopeToken(g)
    } catch (e) {
      // ignore
    }
  }, [])

  const save = () => {
    validateAndSave()
  }

  const validateAndSave = async () => {
    setSaved(false)
    setValidating(true)
    setCanvasValid(null)
    setGradescopeValid(null)

    const canvasTokenToTest = canvasToken || ''
    const gradescopeTokenToTest = gradescopeToken || ''

    const results = await Promise.all([
      (async () => {
        if (!canvasTokenToTest) return false
        try {
          await canvasApi.fetchCourses(canvasTokenToTest)
          return true
        } catch (e) {
          return false
        }
      })(),
      (async () => {
        if (!gradescopeTokenToTest) return false
        try {
          await gradescopeApi.fetchCourses(gradescopeTokenToTest)
          return true
        } catch (e) {
          return false
        }
      })(),
    ])

    const [canvasOk, gsOk] = results
    setCanvasValid(canvasOk)
    setGradescopeValid(gsOk)

    try {
      if (canvasOk) localStorage.setItem(CANVAS_KEY, canvasToken)
      if (gsOk) localStorage.setItem(GRADESCOPE_KEY, gradescopeToken)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      alert('Failed to save tokens')
    }

    setValidating(false)
  }

  const clear = () => {
    try {
      localStorage.removeItem(CANVAS_KEY)
      localStorage.removeItem(GRADESCOPE_KEY)
      setCanvasToken('')
      setGradescopeToken('')
      setSaved(true)
      setTimeout(() => setSaved(false), 1200)
    } catch (e) {
      alert('Failed to clear tokens')
    }
  }

  return (
    <section className="nx-section">
      <h2>Settings</h2>
      <div style={{ display: 'grid', gap: '0.75rem', maxWidth: 760 }}>
        <label>
          Canvas API Token
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input className="nx-input" value={canvasToken} onChange={e => setCanvasToken(e.target.value)} placeholder="Paste Canvas access token here" />
            {validating ? <span style={{ color: '#999' }}>validating…</span> : canvasValid === true ? <span style={{ color: '#8f8' }}>OK</span> : canvasValid === false ? <span style={{ color: '#f88' }}>Invalid</span> : null}
          </div>
        </label>

        <label>
          Gradescope Token
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input className="nx-input" value={gradescopeToken} onChange={e => setGradescopeToken(e.target.value)} placeholder="Paste Gradescope token or cookie" />
            {validating ? <span style={{ color: '#999' }}>validating…</span> : gradescopeValid === true ? <span style={{ color: '#8f8' }}>OK</span> : gradescopeValid === false ? <span style={{ color: '#f88' }}>Invalid</span> : null}
          </div>
        </label>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="nx-btn" onClick={save}>Save</button>
          <button className="nx-btn" onClick={clear}>Clear</button>
          {saved && <div style={{ color: '#8f8', alignSelf: 'center' }}>Saved</div>}
        </div>

        <p style={{ color: '#999' }}>
          Note: For demo purposes tokens are stored in localStorage. For production, use a secure backend and httpOnly cookies.
        </p>
      </div>
    </section>
  )
}

export default Settings
