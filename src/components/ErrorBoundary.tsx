import React from 'react'

interface State {
  hasError: boolean
  error?: Error | null
}

class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch() {
    // placeholder for error reporting
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24 }}>
          <h2>Something went wrong</h2>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#111', color: '#f88', padding: 12 }}>{String(this.state.error)}</pre>
          <p>If you see this message, please open the browser console and paste the first error here so we can debug further.</p>
        </div>
      )
    }

    return this.props.children as React.ReactElement
  }
}

export default ErrorBoundary
