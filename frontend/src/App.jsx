import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'

import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Matches from './pages/Matches'
import Preferences from './pages/Preferences'
import Profile from './pages/Profile'
import Chat from './pages/Chat'

// Redirect logged-in users away from public-only pages
function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          {/* Public-only — redirect to /dashboard when logged in */}
          <Route path="/" element={
            <PublicRoute><Landing /></PublicRoute>
          } />
          <Route path="/login" element={
            <PublicRoute><Login /></PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute><Register /></PublicRoute>
          } />

          {/* Protected */}
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/matches" element={
            <ProtectedRoute><Matches /></ProtectedRoute>
          } />
          <Route path="/preferences" element={
            <ProtectedRoute><Preferences /></ProtectedRoute>
          } />
          <Route path="/profile/:customId" element={
            <ProtectedRoute><Profile /></ProtectedRoute>
          } />
          <Route path="/chat/:roomId" element={
            <ProtectedRoute><Chat /></ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={
            <div style={{
              minHeight: '100vh', display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexDirection: 'column', gap: '1rem',
              color: 'var(--clr-text-muted)'
            }}>
              <span style={{ fontSize: '4rem' }}>404</span>
              <h2>Page not found</h2>
              <a href="/" className="btn btn-primary">Go Home</a>
            </div>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
