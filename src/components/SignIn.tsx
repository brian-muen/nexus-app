import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

// Small helper to parse hash like #access_token=...&id_token=... into an object
function parseHash(hash: string) {
  const cleaned = hash.startsWith('#') ? hash.substring(1) : hash
  return cleaned.split('&').reduce<Record<string, string>>((acc, pair) => {
    const [k, v] = pair.split('=')
    if (k) acc[k] = decodeURIComponent(v || '')
    return acc
  }, {})
}

function parseIdToken(idToken?: string) {
  if (!idToken) return null
  try {
    const parts = idToken.split('.')
    if (parts.length < 2) return null
    const payload = parts[1]
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json)
  } catch (e) {
    return null
  }
}

const SignIn: React.FC = () => {
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // listen for postMessage from popup (oauth-callback.html)
    function onMessage(e: MessageEvent) {
      try {
        if (e.data?.type === 'oauth_callback' && typeof e.data.hash === 'string') {
          const params = parseHash(e.data.hash)
          const idToken = params['id_token']
          const accessToken = params['access_token']
          const profile = parseIdToken(idToken)
          const username = profile?.email ?? profile?.name ?? 'user'
          login(username, accessToken ?? '')
          setLoading(false)
        }
      } catch (err) {
        console.error('OAuth message handling error', err)
        setLoading(false)
      }
    }

    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [login])

  const startPopupAuth = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
    if (!clientId) {
      alert('VITE_GOOGLE_CLIENT_ID is not configured. Add it to .env and restart the dev server.')
      return
    }
    const redirectUri = `${window.location.origin}/oauth-callback.html`
    const scope = encodeURIComponent('openid email profile')
    // Using response_type=token%20id_token for simple SPA popup flow.
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=token%20id_token&scope=${scope}&prompt=select_account&nonce=nonce`;

    setLoading(true)
    const w = window.open(authUrl, 'gsignin', 'width=500,height=600')
    if (!w) {
      alert('Popup blocked. Please allow popups for this site.')
      setLoading(false)
    }
  }

  return (
    <div className="nx-signin">
      <h2>Welcome to Nexus</h2>
      <p>Sign in with Google to sync your Canvas/Gradescope data and calendar.</p>
      <div style={{ marginTop: '1rem' }}>
        <button className="nx-btn" onClick={startPopupAuth} disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in with Google'}
        </button>
      </div>
      <p style={{ marginTop: '1rem', color: '#999' }}>
        Note: This is a client-side demo flow using a popup. For production, implement the OAuth 2.0
        code flow with PKCE on a secure backend.
      </p>
    </div>
  )
}

export default SignIn
