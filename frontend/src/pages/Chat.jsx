import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useLocation } from 'react'
import { getChatHistory, getOnlineUsers } from '../api/client' // Add HTTP endpoint for initial status
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

    // Load past messages (for offline users catching up)
    getChatHistory(roomId)
      .then((res) => setMessages(res.data))
      .catch(() => {})

    // Fetch initial online status before WS broadcasts kick in
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
    if (!token || !currentUserId) return

    // Replace with environment variable for production (wss://)
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.hostname === 'localhost' ? 'localhost:8000' : window.location.host
    const wsUrl = `${wsProtocol}//${host}/chat/ws/${roomId}?token=${token}`

    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => {
      setWsReady(true)
      setError('')
    }

    ws.onclose = () => {
      setWsReady(false)
      setOtherOnline(false)
    }

    ws.onerror = () => setError('Connection lost. Reconnecting...')

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        if (data.type === 'presence') {
          // Filter out current user using guaranteed fresh ID
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

      // Sending raw text to match FastAPI `data = await websocket.receive_text()`
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