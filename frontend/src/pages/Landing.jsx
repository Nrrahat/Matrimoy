import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Landing.css'

const FEATURES = [
  { icon: '🔍', title: 'Smart Matching', desc: 'AI-powered compatibility scoring based on your preferences, religion, education, and lifestyle.' },
  { icon: '💬', title: 'Real-Time Chat', desc: 'Connect instantly with your matches via secure, end-to-end private messaging.' },
  { icon: '🛡️', title: 'Verified Profiles', desc: 'Every profile is reviewed to ensure authenticity and protect your privacy.' },
  { icon: '🌍', title: 'Global Reach', desc: 'Discover compatible partners across cities and countries with shared values.' },
]

const STATS = [
  { value: '50K+', label: 'Happy Couples' },
  { value: '200K+', label: 'Active Members' },
  { value: '98%', label: 'Satisfaction Rate' },
  { value: '150+', label: 'Countries' },
]

export default function Landing() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="landing">
      {/* Animated background orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* Hero */}
      <section className="hero container">
        <div className="hero-badge fade-up">
          <span className="badge badge-gold">✨ Premium Matrimony Platform</span>
        </div>
        <h1 className="hero-title fade-up">
          Find Your <span className="gradient-text">Soulmate</span>
          <br />With Purpose & Grace
        </h1>
        <p className="hero-subtitle fade-up">
          A premium matrimony platform built for serious seekers. Advanced matching, real-time chat,
          and thousands of verified profiles — all in one beautifully crafted experience.
        </p>
        <div className="hero-cta fade-up">
          {isAuthenticated ? (
            <Link to="/matches" className="btn btn-primary btn-lg">
              💑 View My Matches
            </Link>
          ) : (
            <>
              <Link to="/register" id="cta-register" className="btn btn-primary btn-lg">
                Begin Your Journey
              </Link>
              <Link to="/login" className="btn btn-outline btn-lg">
                Sign In
              </Link>
            </>
          )}
        </div>

        {/* Floating profile cards */}
        <div className="hero-cards fade-up">
          {['💝', '💍', '🌹'].map((icon, i) => (
            <div key={i} className={`hero-card glass card-float-${i}`}>
              <span className="card-icon">{icon}</span>
              <span className="card-label">
                {['New Match!', 'Engaged', 'Married'][i]}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Bar */}
      <section className="stats-bar glass">
        <div className="container stats-inner">
          {STATS.map((s) => (
            <div key={s.label} className="stat-item">
              <span className="stat-value gold-text">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="features container">
        <div className="section-header">
          <h2 className="section-title">
            Why Choose <span className="gradient-text">Matrimony</span>?
          </h2>
          <p className="section-subtitle">
            We combine modern technology with traditional values to bring you the best matchmaking experience.
          </p>
        </div>
        <div className="features-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="feature-card card glass">
              <span className="feature-icon">{f.icon}</span>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-banner container">
        <div className="cta-inner glass-2">
          <h2>Ready to Find Your Perfect Match?</h2>
          <p>Join thousands of people who found love on Matrimony.</p>
          <Link to="/register" className="btn btn-primary btn-lg">
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>© 2026 Matrimony. Built with ♥ for those who seek lifelong love.</p>
      </footer>
    </div>
  )
}
