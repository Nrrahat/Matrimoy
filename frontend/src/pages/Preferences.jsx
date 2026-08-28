import { useEffect, useState } from 'react'
import { getPreferences, createPreferences, updatePreferences } from '../api/client'
import './Preferences.css'

const RELIGIONS = ['Islam', 'Hinduism', 'Christianity', 'Buddhism', 'Judaism', 'Sikhism', 'Other']
const EDUCATIONS = ['High School', 'Bachelor\'s', 'Master\'s', 'PhD', 'Diploma', 'Other']
const OCCUPATIONS = ['Engineer', 'Doctor', 'Teacher', 'Lawyer', 'Businessman', 'Government', 'Other']
const CITIES = ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Other']

const EMPTY = {
  min_age: 18, max_age: 45,
  gender_preference: '',
  preferred_religions: [],
  preferred_education: [],
  preferred_occupations: [],
  preferred_cities: [],
  min_income: '',
}

function MultiSelect({ label, options, selected, onChange }) {
  const toggle = (val) =>
    onChange(selected.includes(val) ? selected.filter((v) => v !== val) : [...selected, val])
  return (
    <div className="form-group">
      <span className="form-label">{label}</span>
      <div className="multi-select">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            className={`ms-chip ${selected.includes(opt) ? 'ms-chip-active' : ''}`}
            onClick={() => toggle(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function Preferences() {
  const [form, setForm] = useState(EMPTY)
  const [isExisting, setIsExisting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    getPreferences()
      .then((res) => {
        const d = res.data
        setForm({
          min_age: d.min_age ?? 18,
          max_age: d.max_age ?? 45,
          gender_preference: d.gender_preference ?? '',
          preferred_religions: d.preferred_religions ?? [],
          preferred_education: d.preferred_education ?? [],
          preferred_occupations: d.preferred_occupations ?? [],
          preferred_cities: d.preferred_cities ?? [],
          min_income: d.min_income ?? '',
        })
        setIsExisting(true)
      })
      .catch(() => setIsExisting(false))
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
  }

  const handleMulti = (key) => (val) => setForm((p) => ({ ...p, [key]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage({ type: '', text: '' })
    try {
      const payload = {
        ...form,
        min_age: Number(form.min_age),
        max_age: Number(form.max_age),
        min_income: form.min_income ? Number(form.min_income) : null,
      }
      if (isExisting) {
        await updatePreferences(payload)
      } else {
        await createPreferences(payload)
        setIsExisting(true)
      }
      setMessage({ type: 'success', text: '✅ Preferences saved successfully!' })
    } catch (err) {
      const detail = err.response?.data?.detail
      setMessage({ type: 'error', text: typeof detail === 'string' ? detail : 'Failed to save preferences.' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="page-wrapper container" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <span className="spinner" style={{ width: 40, height: 40, borderWidth: 4 }} />
    </div>
  )

  return (
    <div className="pref-page page-wrapper container">
      <div className="fade-up">
        <h1 className="page-title">
          Match <span className="gradient-text">Preferences</span>
        </h1>
        <p className="page-subtitle">
          Define your ideal partner criteria to get better recommendations.
        </p>
      </div>

      <form id="preferences-form" className="pref-form glass fade-up" onSubmit={handleSubmit}>

        {/* Age Range */}
        <div className="pref-section">
          <h2 className="pref-section-title">🎂 Age Range</h2>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="pref-min-age">Minimum Age</label>
              <input
                id="pref-min-age" className="form-input" type="number"
                name="min_age" min={18} max={100}
                value={form.min_age} onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="pref-max-age">Maximum Age</label>
              <input
                id="pref-max-age" className="form-input" type="number"
                name="max_age" min={18} max={100}
                value={form.max_age} onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Gender */}
        <div className="pref-section">
          <h2 className="pref-section-title">👤 Gender Preference</h2>
          <div className="form-group">
            <select
              id="pref-gender" className="form-select"
              name="gender_preference" value={form.gender_preference} onChange={handleChange}
            >
              <option value="">Any gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Religion */}
        <div className="pref-section">
          <h2 className="pref-section-title">🕊️ Religion</h2>
          <MultiSelect
            label="Preferred religions (select all that apply)"
            options={RELIGIONS}
            selected={form.preferred_religions}
            onChange={handleMulti('preferred_religions')}
          />
        </div>

        {/* Education */}
        <div className="pref-section">
          <h2 className="pref-section-title">🎓 Education</h2>
          <MultiSelect
            label="Preferred education levels"
            options={EDUCATIONS}
            selected={form.preferred_education}
            onChange={handleMulti('preferred_education')}
          />
        </div>

        {/* Occupation */}
        <div className="pref-section">
          <h2 className="pref-section-title">💼 Occupation</h2>
          <MultiSelect
            label="Preferred occupations"
            options={OCCUPATIONS}
            selected={form.preferred_occupations}
            onChange={handleMulti('preferred_occupations')}
          />
        </div>

        {/* Cities */}
        <div className="pref-section">
          <h2 className="pref-section-title">📍 Cities</h2>
          <MultiSelect
            label="Preferred cities"
            options={CITIES}
            selected={form.preferred_cities}
            onChange={handleMulti('preferred_cities')}
          />
        </div>

        {/* Income */}
        <div className="pref-section">
          <h2 className="pref-section-title">💰 Minimum Income (optional)</h2>
          <div className="form-group">
            <label className="form-label" htmlFor="pref-income">Annual income (BDT)</label>
            <input
              id="pref-income" className="form-input" type="number"
              name="min_income" min={0}
              placeholder="e.g. 500000"
              value={form.min_income} onChange={handleChange}
            />
          </div>
        </div>

        {message.text && (
          <div className={message.type === 'success' ? 'auth-success' : 'auth-error'}>
            {message.text}
          </div>
        )}

        <button
          id="pref-save"
          className="btn btn-primary pref-submit"
          type="submit"
          disabled={saving}
        >
          {saving ? <><span className="spinner" /> Saving…</> : '💾 Save Preferences'}
        </button>
      </form>
    </div>
  )
}
