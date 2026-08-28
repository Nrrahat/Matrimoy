import { Link } from 'react-router-dom'
import './MatchCard.css'

const GENDER_EMOJI = { Male: '👨', Female: '👩', Other: '🧑' }

export default function MatchCard({ match, onChat }) {
  const displayName = match.name || match.custom_id || match.email?.split('@')[0] || 'Anonymous'
  const initials = displayName.slice(0, 2).toUpperCase()
  const genderEmoji = GENDER_EMOJI[match.gender] || '🧑'

  return (
    <div className="match-card card fade-up">
      {/* Avatar */}
      <div className="match-avatar">
        <span className="match-initials">{initials}</span>
        <span className="match-gender-badge">{genderEmoji}</span>
      </div>

      {/* Info */}
      <div className="match-info">
        <h3 className="match-name">{displayName}</h3>
        {match.age && (
          <span className="match-age badge badge-primary">{match.age} yrs</span>
        )}
      </div>

      {/* Details */}
      <div className="match-details">
        {match.occupation && (
          <div className="match-detail">
            <span className="detail-icon">💼</span>
            <span>{match.occupation}</span>
          </div>
        )}
        {match.religion && (
          <div className="match-detail">
            <span className="detail-icon">🕊️</span>
            <span>{match.religion}</span>
          </div>
        )}
        {match.city && (
          <div className="match-detail">
            <span className="detail-icon">📍</span>
            <span>{match.city}</span>
          </div>
        )}
        {match.education && (
          <div className="match-detail">
            <span className="detail-icon">🎓</span>
            <span>{match.education}</span>
          </div>
        )}
      </div>

      {match.bio && (
        <p className="match-bio">"{match.bio}"</p>
      )}

      {/* Actions */}
      <div className="match-actions">
        <button
          id={`chat-btn-${match.user_id}`}
          className="btn btn-primary btn-sm"
          onClick={() => onChat && onChat(match)}
        >
          💬 Start Chat
        </button>
        <Link
          to={`/profile/${match.custom_id}`}
          className="btn btn-outline btn-sm"
        >
          View Profile
        </Link>
      </div>
    </div>
  )
}
