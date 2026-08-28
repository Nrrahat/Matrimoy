import './ChatBubble.css'

// Bangladesh Standard Time = UTC+6
const BST_OFFSET = 6 * 60 // minutes

function toBSTTime(isoString) {
  if (!isoString) return ''
  const date = new Date(isoString)
  // If the timestamp has no Z/offset info (bare ISO from SQLite/Postgres UTC),
  // treat it as UTC and shift to BST manually
  const utcMs = date.getTime()
  const bstDate = new Date(utcMs + BST_OFFSET * 60 * 1000)
  return bstDate.toLocaleTimeString('en-BD', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

export default function ChatBubble({ message, currentUserId }) {
  // Own message = sender_id matches logged-in user → show on RIGHT
  const isOwn = currentUserId !== null && message.sender_id === currentUserId
  const time = toBSTTime(message.timestamp)

  return (
    <div className={`bubble-wrapper ${isOwn ? 'own' : 'other'}`}>
      <div className={`bubble ${isOwn ? 'bubble-own' : 'bubble-other'}`}>
        <p className="bubble-text">{message.content}</p>
        {time && <span className="bubble-time">{time} BST</span>}
      </div>
    </div>
  )
}
