import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getRecommendations, getPreferences } from '../api/client'
import { useAuth } from '../context/AuthContext'
import './Dashboard.css'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ matches: 0, hasPrefs: false })
  const [loading, setLoading] = useState(true)

  const displayName = user?.name || 'there'

  useEffect(() => {
    async function loadStats() {
      try {
        const [matchRes, prefRes] = await Promise.allSettled([
          getRecommendations(5),
          getPreferences(),
        ])
        setStats({
          matches: matchRes.status === 'fulfilled' ? matchRes.value.data.length : 0,
          hasPrefs: prefRes.status === 'fulfilled',
        })
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  const QUICK_LINKS = [
    { to: '/matches', icon: '💑', label: 'Browse Matches', desc: 'Discover compatible profiles', color: '#c9184a' },
    { to: '/preferences', icon: '⚙️', label: 'My Preferences', desc: 'Refine your match criteria', color: '#f4c430' },
    { to: '/profile/me', icon: '👤', label: 'My Profile', desc: 'Update your information', color: '#7c3aed' },
  ]

  return (
    <div className="dashboard page-wrapper container">
      {/* Welcome Banner */}
      <div className="welcome-banner glass fade-up">
        <div className="welcome-text">
          <h1 className="welcome-title">
            Welcome back, <span className="gradient-text">{displayName}</span> 👋
          </h1>
          <p className="welcome-sub">
            Your perfect match might be just one scroll away.
          </p>
        </div>
        <div className="welcome-heart">♥</div>
      </div>

      {/* Stats Row */}
      {!loading && (
        <div className="dash-stats fade-up">
          <div className="dash-stat glass">
            <span className="dash-stat-icon">💑</span>
            <div>
              <div className="dash-stat-value">{stats.matches}+</div>
              <div className="dash-stat-label">Potential Matches</div>
            </div>
          </div>
          <div className="dash-stat glass">
            <span className="dash-stat-icon">⚙️</span>
            <div>
              <div className="dash-stat-value">{stats.hasPrefs ? 'Set' : 'Not Set'}</div>
              <div className="dash-stat-label">Preferences</div>
            </div>
          </div>
          <div className="dash-stat glass">
            <span className="dash-stat-icon">🌟</span>
            <div>
              <div className="dash-stat-value">Active</div>
              <div className="dash-stat-label">Account Status</div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Links */}
      <section className="dash-section fade-up">
        <h2 className="dash-section-title">Quick Actions</h2>
        <div className="quick-links">
          {QUICK_LINKS.map((link) => (
            <Link key={link.to} to={link.to} className="quick-link card">
              <span className="ql-icon" style={{ color: link.color }}>{link.icon}</span>
              <div>
                <div className="ql-label">{link.label}</div>
                <div className="ql-desc">{link.desc}</div>
              </div>
              <span className="ql-arrow">→</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Setup CTA if no preferences */}
      {!loading && !stats.hasPrefs && (
        <div className="setup-cta glass-2 fade-up">
          <span className="setup-icon">⚙️</span>
          <div className="setup-text">
            <h3>Set Your Preferences</h3>
            <p>Tell us what you're looking for to get better match recommendations.</p>
          </div>
          <Link to="/preferences" className="btn btn-primary">
            Set Preferences
          </Link>
        </div>
      )}
    </div>
  )
}
