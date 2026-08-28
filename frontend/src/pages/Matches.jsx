import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRecommendations, getOrCreateRoom } from '../api/client'
import MatchCard from '../components/MatchCard'
import './Matches.css'

export default function Matches() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    getRecommendations(50)
      .then((res) => setMatches(res.data))
      .catch((err) => setError(err.response?.data?.detail || 'Failed to load matches.'))
      .finally(() => setLoading(false))
  }, [])

  const handleChat = async (match) => {
    try {
      const res = await getOrCreateRoom(match.user_id)
      const matchName = match.custom_id || match.name || match.email?.split('@')[0] || 'User'
      navigate(`/chat/${res.data.id}`, { state: { matchName } })
    } catch {
      alert('Could not open chat room. Please try again.')
    }
  }

  return (
    <div className="matches-page page-wrapper container">
      <div className="matches-header fade-up">
        <div>
          <h1 className="page-title">
            Your <span className="gradient-text">Matches</span>
          </h1>
          <p className="page-subtitle">
            Profiles selected based on your preferences and compatibility.
          </p>
        </div>
        <span className="match-count badge badge-primary">
          {matches.length} profiles found
        </span>
      </div>

      {loading && (
        <div className="matches-loading">
          <span className="spinner" style={{ width: 40, height: 40, borderWidth: 4 }} />
          <p>Finding your matches…</p>
        </div>
      )}

      {error && (
        <div className="matches-error glass">
          <span>⚠️</span>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && matches.length === 0 && (
        <div className="matches-empty glass fade-up">
          <span className="empty-icon">💔</span>
          <h2>No matches found</h2>
          <p>Try updating your preferences to broaden your search.</p>
        </div>
      )}

      <div className="matches-grid">
        {matches.map((m, i) => (
          <div
            key={m.user_id}
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <MatchCard match={m} onChat={handleChat} />
          </div>
        ))}
      </div>
    </div>
  )
}
