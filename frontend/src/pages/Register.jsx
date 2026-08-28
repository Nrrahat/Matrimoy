import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser } from '../api/client'
import './Auth.css'

const INITIAL = {
  custom_id: '', name: '', email: '', password: '',
  gender: '', age: '', date_of_birth: '',
}

export default function Register() {
  const [form, setForm] = useState(INITIAL)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const payload = { ...form, age: Number(form.age) }
      await registerUser(payload)
      navigate('/login', { state: { registered: true } })
    } catch (err) {
      const detail = err.response?.data?.detail
      if (Array.isArray(detail)) {
        setError(detail.map((d) => d.msg).join(', '))
      } else {
        setError(detail || 'Registration failed. Please try again.')
      }
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
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-sub">Begin your journey to forever</p>
        </div>

        <form id="register-form" className="auth-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="reg-custom-id">Profile ID</label>
              <input
                id="reg-custom-id"
                className="form-input"
                type="text"
                name="custom_id"
                placeholder="e.g. john_doe_01"
                value={form.custom_id}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">Full Name</label>
              <input
                id="reg-name"
                className="form-input"
                type="text"
                name="name"
                placeholder="Your full name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email Address</label>
            <input
              id="reg-email"
              className="form-input"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              className="form-input"
              type="password"
              name="password"
              placeholder="Create a strong password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="reg-gender">Gender</label>
              <select
                id="reg-gender"
                className="form-select"
                name="gender"
                value={form.gender}
                onChange={handleChange}
                required
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-age">Age</label>
              <input
                id="reg-age"
                className="form-input"
                type="number"
                name="age"
                placeholder="18"
                min={18}
                max={100}
                value={form.age}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-dob">Date of Birth</label>
            <input
              id="reg-dob"
              className="form-input"
              type="date"
              name="date_of_birth"
              value={form.date_of_birth}
              onChange={handleChange}
              required
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button
            id="register-submit"
            className="btn btn-primary auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? <><span className="spinner" /> Creating account…</> : '✨ Create My Account'}
          </button>
        </form>

        <p className="auth-footer-text">
          Already a member?{' '}
          <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
