import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { getChatHistory, getRoomOnlineUsers } from '../api/client'
import { useAuth } from '../context/AuthContext'
import ChatBubble from '../components/ChatBubble'
import './Chat.css'

export default function Chat() {
  const { roomId } = useParams()
  const { token, user } = useAuth()
  const { state } = useLocation()
  const matchName = state?.matchName || state?.matchEmail || `Room ${roomId}`

  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [otherOnline, setOtherOnline] = useState(false)
  const [wsReady, setWsReady] = useState(false)
  const [error, setError] = useState('')

  const wsRef = useRef(null)
  const bottomRef = useRef(null)

  const currentUserId = user?.user_id ?? null

  // ── 1. Fetch persistent history & initial presence status ──────────────
  useEffect(() => {
    if (!roomId) return

    getChatHistory(roomId)
      .then((res) => setMessages(res.data))
      .catch(() => {})

    getOnlineUsers(roomId)
      .then((res) => {
        const activeIds = res.data || []
        if (currentUserId) {
          setOtherOnline(activeIds.some((id) => id !== currentUserId))
        }
      })
      .catch(() => {})
  }, [roomId, currentUserId])

  // ── 2. WebSocket Connection ───────────────────────────────────────────
  useEffect(() => {
    if (!token || !currentUserId || !roomId) return

    // 1. Get raw base URL from env, or select default host
    const envWsUrl = import.meta.env.VITE_WS_BASE_URL
    const defaultWsUrl = window.location.hostname === 'localhost'
      ? 'ws://localhost:8000'
      : 'wss://matrimoy.onrender.com' // Explicit Render backend fallback

    let baseUrl = envWsUrl || defaultWsUrl

    // 2. Normalize http/https protocols to ws/wss automatically
    if (baseUrl.startsWith('http://')) {
      baseUrl = baseUrl.replace('http://', 'ws://')
    } else if (baseUrl.startsWith('https://')) {
      baseUrl = baseUrl.replace('https://', 'wss://')
    }

    // 3. Remove trailing slash if present
    baseUrl = baseUrl.replace(/\/$/, '')

    const wsUrl = `${baseUrl}/chat/ws/${roomId}?token=${encodeURIComponent(token)}`

    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    // Heartbeat setup to prevent Render 55s timeout
    let pingInterval = null

    ws.onopen = () => {
      setWsReady(true)
      setError('')
      
      // Send periodic ping every 30 seconds
      pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }))
        }
      }, 30000)
    }

    ws.onclose = (event) => {
      setWsReady(false)
      setOtherOnline(false)
      if (pingInterval) clearInterval(pingInterval)
      if (event.code === 1008) {
        setError('Authentication failed. Please log in again.')
      }
    }

    ws.onerror = () => setError('Connection lost. Reconnecting...')

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        if (data.type === 'pong') return // Ignore heartbeat responses

        if (data.type === 'presence') {
          const others = (data.online_user_ids || []).filter(
            (id) => id !== currentUserId
          )
          setOtherOnline(others.length > 0)
          return
        }

        if (data.type === 'message') {
          setMessages((prev) => {
            const exists = prev.some((m) => m.id === data.id)
            return exists ? prev : [...prev, data]
          })
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err)
      }
    }

    return () => {
      if (pingInterval) clearInterval(pingInterval)
      ws.close()
    }
  }, [roomId, token, currentUserId])

  // ── 3. Auto-scroll ─────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── 4. Send Message Handler ────────────────────────────────────────────
  const sendMessage = useCallback(
    (e) => {
      e.preventDefault()
      const trimmed = input.trim()
      if (!trimmed || !wsReady || !wsRef.current) return

      wsRef.current.send(trimmed)
      setInput('')
    },
    [input, wsReady]
  )

  const displayName = matchName.includes('@') ? matchName.split('@')[0] : matchName
  const avatarLetters = displayName.slice(0, 2).toUpperCase()

  return (
    <div className="chat-page">
      {/* ── Header ── */}
      <div className="chat-header glass">
        <div className="chat-header-avatar">{avatarLetters}</div>
        <div className="chat-header-info">
          <span className="chat-header-name">{displayName}</span>
          <span className={`chat-status ${otherOnline ? 'online' : 'offline'}`}>
            <span className="status-dot" />
            {!wsReady ? 'Connecting…' : otherOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      {/* ── Messages Container ── */}
      <div className="chat-messages">
        {error && <p className="chat-error">{error}</p>}

        {messages.length === 0 && !error && (
          <div className="chat-empty">
            <span>💬</span>
            <p>No messages yet. Say hello!</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <ChatBubble
            key={msg.id ?? `tmp-${i}`}
            message={msg}
            currentUserId={currentUserId}
          />
        ))}

        <div ref={bottomRef} />
      </div>

      {/* ── Message Input Form ── */}
      <form id="chat-input-form" className="chat-input-bar glass" onSubmit={sendMessage}>
        <input
          id="chat-message-input"
          className="chat-input form-input"
          type="text"
          placeholder={wsReady ? 'Type a message…' : 'Connecting…'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={!wsReady}
          autoComplete="off"
        />
        <button
          id="chat-send-btn"
          className="btn btn-primary chat-send"
          type="submit"
          disabled={!wsReady || !input.trim()}
        >
          ➤
        </button>
      </form>
    </div>
  )
}