import { createContext, useContext, useState, useCallback } from 'react'
import { loginUser as apiLogin } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('matrimony_token') || null)
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('matrimony_user')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  const login = useCallback(async (email, password) => {
    const res = await apiLogin(email, password)
    const { access_token } = res.data
    localStorage.setItem('matrimony_token', access_token)
    // Decode display info from JWT payload (not for verification)
    const payload = JSON.parse(atob(access_token.split('.')[1]))
    const userData = {
      email: payload.sub || email,
      user_id: payload.user_id || null,
      custom_id: payload.custom_id || null,
      name: payload.name || null,
    }
    localStorage.setItem('matrimony_user', JSON.stringify(userData))
    setToken(access_token)
    setUser(userData)
    return userData
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('matrimony_token')
    localStorage.removeItem('matrimony_user')
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
