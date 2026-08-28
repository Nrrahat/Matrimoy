import axios from 'axios'

// Use environment variable in production, fallback to Render URL or localhost
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Inject JWT token on every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('matrimony_token')
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

// On 401, clear storage and redirect to login
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('matrimony_token')
      localStorage.removeItem('matrimony_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ─── Auth ───────────────────────────────────────────
export const registerUser = (data) => client.post('/auth/register', data)

export const loginUser = (email, password) => {
  const form = new URLSearchParams()
  form.append('username', email)
  form.append('password', password)
  return client.post('/auth/login', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
}

// ─── Profile ────────────────────────────────────────
export const getProfile = (customId) => client.get(`/profile/${customId}`)
export const updateProfile = (customId, data) =>
  client.post(`/profile/updateprofile/${customId}`, data)

// ─── Matches ────────────────────────────────────────
export const getRecommendations = (limit = 20) =>
  client.get('/matches/recommendations', { params: { limit } })

export const getPreferences = () => client.get('/matches/preferences')
export const createPreferences = (data) => client.post('/matches/preferences', data)
export const updatePreferences = (data) => client.patch('/matches/preferences', data)

// ─── Chat ───────────────────────────────────────────
export const getOrCreateRoom = (targetUserId) =>
  client.post(`/chat/room/${targetUserId}`)

export const getChatHistory = (roomId) =>
  client.get(`/chat/room/${roomId}/messages`)

export const getRoomOnlineUsers = (roomId) =>
  client.get(`/chat/room/${roomId}/online`)

export default client