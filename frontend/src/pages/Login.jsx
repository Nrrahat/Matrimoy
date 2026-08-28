import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const { state } = useLocation()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      const detail = err.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <div className="auth-card glass fade-up">
        <div className="auth-header">
          <span className="auth-logo">♥</span>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-sub">Sign in to continue your journey</p>
        </div>

        {state?.registered && (
          <div className="auth-success">
            🎉 Account created! Please sign in.
          </div>
        )}

        <form id="login-form" className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              className="form-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError('') }}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              className="form-input"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError('') }}
              required
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button
            id="login-submit"
            className="btn btn-primary auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? <><span className="spinner" /> Signing in…</> : '→ Sign In'}
          </button>
        </form>

        <p className="auth-footer-text">
          New here?{' '}
          <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  )
}
