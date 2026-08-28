import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getProfile, updateProfile } from '../api/client'
import { useAuth } from '../context/AuthContext'
import './Profile.css'

export default function Profile() {
  const { customId } = useParams()
  const { user } = useAuth()
  const fileRef = useRef(null)

  const [profile, setProfile] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [error, setError] = useState('')
  // Local profile picture — stored in localStorage per user as base64
  const [avatarSrc, setAvatarSrc] = useState(null)

  // If customId is "me", use the logged-in user's custom_id
  const id = customId === 'me' ? (user?.custom_id || user?.email?.split('@')[0]) : customId
  const isOwn = customId === 'me'

  // Display name: prefer custom_id from URL, then user store, then id
  const displayName = isOwn
    ? (user?.name || user?.custom_id || id)
    : id

  // Load avatar from localStorage
  useEffect(() => {
    if (!id) return
    const saved = localStorage.getItem(`matrimony_avatar_${id}`)
    if (saved) setAvatarSrc(saved)
  }, [id])

  useEffect(() => {
    if (!id) return
    getProfile(id)
      .then((res) => {
        setProfile(res.data)
        setForm(res.data)
      })
      .catch(() => setError('Profile not found.'))
      .finally(() => setLoading(false))
  }, [id])

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage({ type: '', text: '' })
    try {
      const res = await updateProfile(id, form)
      setProfile(res.data)
      setEditMode(false)
      setMessage({ type: 'success', text: '✅ Profile updated!' })
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Update failed.' })
    } finally {
      setSaving(false)
    }
  }

  // Profile picture upload — stored locally as base64
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target.result
      setAvatarSrc(dataUrl)
      localStorage.setItem(`matrimony_avatar_${id}`, dataUrl)
    }
    reader.readAsDataURL(file)
  }

  if (loading) return (
    <div className="page-wrapper container" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <span className="spinner" style={{ width: 40, height: 40, borderWidth: 4 }} />
    </div>
  )

  if (error) return (
    <div className="page-wrapper container">
      <div className="glass" style={{ padding: 'var(--space-xl)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
        <span style={{ fontSize: '3rem' }}>😔</span>
        <p style={{ color: 'var(--clr-text-muted)', marginTop: 'var(--space-md)' }}>{error}</p>
      </div>
    </div>
  )

  const FIELDS = [
    { name: 'bio', label: 'About Me', icon: '📝', textarea: true },
    { name: 'religion', label: 'Religion', icon: '🕊️' },
    { name: 'education', label: 'Education', icon: '🎓' },
    { name: 'occupation', label: 'Occupation', icon: '💼' },
    { name: 'address', label: 'Address', icon: '📍' },
    { name: 'income', label: 'Annual Income', icon: '💰' },
  ]

  const initials = displayName ? displayName.slice(0, 2).toUpperCase() : '??'

  return (
    <div className="profile-page page-wrapper container">
      {/* ── Hero / Header ── */}
      <div className="profile-hero glass fade-up">
        {/* Profile Picture */}
        <div className="profile-avatar-wrap">
          {avatarSrc ? (
            <img src={avatarSrc} alt="Profile" className="profile-avatar-img" />
          ) : (
            <span className="profile-initials">{initials}</span>
          )}
          {isOwn && (
            <>
              <button
                className="avatar-upload-btn"
                title="Change photo"
                onClick={() => fileRef.current?.click()}
                type="button"
                id="avatar-upload-btn"
              >
                📷
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleAvatarChange}
                id="avatar-file-input"
              />
            </>
          )}
        </div>

        <div className="profile-hero-info">
          {/* Show custom_id as the profile ID */}
          <h1 className="profile-name">{displayName}</h1>
          {isOwn && user?.custom_id && (
            <span className="profile-custom-id">@{user.custom_id}</span>
          )}
          {profile?.occupation && (
            <p className="profile-occupation">{profile.occupation}</p>
          )}
        </div>

        {isOwn && (
          <button
            id="edit-profile-btn"
            className={`btn ${editMode ? 'btn-outline' : 'btn-primary'}`}
            onClick={() => { setEditMode(!editMode); setMessage({ type: '', text: '' }) }}
          >
            {editMode ? 'Cancel' : '✏️ Edit Profile'}
          </button>
        )}
      </div>

      {message.text && (
        <div
          className={message.type === 'success' ? 'pf-msg pf-success' : 'pf-msg pf-error'}
        >
          {message.text}
        </div>
      )}

      {/* ── Edit Form ── */}
      {editMode ? (
        <form id="profile-form" className="profile-form glass fade-up" onSubmit={handleSave}>
          {FIELDS.map((f) => (
            <div key={f.name} className="form-group">
              <label className="form-label" htmlFor={`pf-${f.name}`}>
                {f.icon} {f.label}
              </label>
              {f.textarea ? (
                <textarea
                  id={`pf-${f.name}`}
                  className="form-textarea"
                  name={f.name}
                  value={form[f.name] || ''}
                  onChange={handleChange}
                  rows={4}
                />
              ) : (
                <input
                  id={`pf-${f.name}`}
                  className="form-input"
                  type="text"
                  name={f.name}
                  value={form[f.name] || ''}
                  onChange={handleChange}
                />
              )}
            </div>
          ))}
          <div className="profile-form-actions">
            <button id="profile-save" className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? <><span className="spinner" /> Saving…</> : '💾 Save Changes'}
            </button>
          </div>
        </form>
      ) : (
        /* ── View Mode ── */
        <div className="profile-details-grid fade-up">
          {FIELDS.map((f) =>
            profile?.[f.name] ? (
              <div key={f.name} className="profile-detail-card glass">
                <span className="pdc-icon">{f.icon}</span>
                <div>
                  <div className="pdc-label">{f.label}</div>
                  <div className="pdc-value">{profile[f.name]}</div>
                </div>
              </div>
            ) : null
          )}
          {!FIELDS.some((f) => profile?.[f.name]) && (
            <p style={{ color: 'var(--clr-text-dim)', gridColumn: '1 / -1' }}>
              No profile details yet.{isOwn ? ' Click "Edit Profile" to add information.' : ''}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
