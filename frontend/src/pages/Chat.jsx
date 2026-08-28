import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { getChatHistory } from '../api/client'
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
  // Tracks whether the OTHER user is also in this room
  const [otherOnline, setOtherOnline] = useState(false)
  const [wsReady, setWsReady] = useState(false)
  const [error, setError] = useState('')

  const wsRef = useRef(null)
  const bottomRef = useRef(null)

  // Current user's numeric DB id (from JWT stored in context)
  const currentUserId = user?.user_id ?? null

  // ── Load message history once ──────────────────────────────
  useEffect(() => {
    getChatHistory(roomId)
      .then((res) => setMessages(res.data))
      .catch(() => {}) // empty room is fine
  }, [roomId])

  // ── WebSocket ──────────────────────────────────────────────
  useEffect(() => {
    if (!token) return
    const wsUrl = `ws://localhost:8000/chat/ws/${roomId}?token=${token}`
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => setWsReady(true)
    ws.onclose = () => {
      setWsReady(false)
      setOtherOnline(false)
    }
    ws.onerror = () => setError('Connection lost. Please refresh.')

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        if (data.type === 'presence') {
          // Presence update: check if the other user (not me) is online
          const others = (data.online_user_ids || []).filter(
            (id) => id !== currentUserId
          )
          setOtherOnline(others.length > 0)
          return
        }

        if (data.type === 'message') {
          // Avoid duplicating messages that we already loaded from history
          setMessages((prev) => {
            const exists = prev.some((m) => m.id === data.id)
            return exists ? prev : [...prev, data]
          })
        }
      } catch {
        // ignore malformed frames
      }
    }

    return () => ws.close()
  }, [roomId, token, currentUserId])

  // ── Auto-scroll to latest message ─────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Send ───────────────────────────────────────────────────
  const sendMessage = useCallback((e) => {
    e.preventDefault()
    if (!input.trim() || !wsReady) return
    wsRef.current?.send(input.trim())
    setInput('')
  }, [input, wsReady])

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
            {!wsReady
              ? 'Connecting…'
              : otherOnline
              ? 'Online'
              : 'Offline'}
          </span>
        </div>
      </div>

      {/* ── Messages ── */}
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

      {/* ── Input bar ── */}
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
