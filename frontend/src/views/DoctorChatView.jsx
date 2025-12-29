import { useEffect, useState } from 'react'
import API_BASE from '../config/api'
import '../styles/ProviderPortal.css'

/* ---------- Helpers ---------- */
const formatTime = (ts) =>
  new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

export default function DoctorChatView() {
  const [doctor, setDoctor] = useState(null)
  const [conversations, setConversations] = useState([])
  const [activeChat, setActiveChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)

  /* ---------- Load doctor ---------- */
  useEffect(() => {
    const d = localStorage.getItem('user')
    if (d) setDoctor(JSON.parse(d))
    setLoading(false)
  }, [])

  /* ---------- Load conversations ---------- */
  useEffect(() => {
    if (!doctor) return
    loadConversations()
    const interval = setInterval(loadConversations, 3000)
    return () => clearInterval(interval)
  }, [doctor])

  const loadConversations = async () => {
    const res = await fetch(`${API_BASE}/messages/doctor/${doctor.id}`)
    const data = await res.json()
    if (data.success) {
      setConversations(data.conversations)
      if (!activeChat && data.conversations.length) {
        setActiveChat(data.conversations[0])
        setMessages(data.conversations[0].messages || [])
      }
    }
  }

  /* ---------- Select patient ---------- */
  const openChat = (conv) => {
    setActiveChat(conv)
    setMessages(conv.messages || [])
  }

  /* ---------- Send message ---------- */
  const sendMessage = async () => {
    if (!input.trim() || !activeChat) return

    await fetch(`${API_BASE}/messages/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientId: activeChat.patientId,
        doctorId: doctor.id,
        patientName: activeChat.patientName,
        doctorName: doctor.name,
        message: input,
        sender: 'doctor',
      }),
    })

    setInput('')
    loadConversations()
  }

  if (loading) return <div>Loading…</div>

  if (!doctor) {
    return <div>Please login as doctor</div>
  }

  return (
    <div className="provider-messages-container provider-card">
      {/* Patient List */}
      <div className="provider-msg-list">
        <h3 style={{ padding: '16px' }}>Patients</h3>
        {conversations.map((c) => (
          <div
            key={c.patientId}
            className={`provider-msg-preview ${
              activeChat?.patientId === c.patientId ? 'active' : ''
            }`}
            onClick={() => openChat(c)}
          >
            <strong>{c.patientName}</strong>
            <div style={{ fontSize: 12, color: '#666' }}>
              {c.lastMessage}
            </div>
            {c.unreadCount > 0 && (
              <span className="provider-badge">{c.unreadCount}</span>
            )}
          </div>
        ))}
      </div>

      {/* Chat */}
      <div className="provider-msg-content">
        {activeChat ? (
          <>
            <div className="provider-msg-header">
              <strong>{activeChat.patientName}</strong>
            </div>

            <div className="provider-msg-body">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`provider-msg-bubble provider-msg-${
                    m.sender === 'doctor' ? 'out' : 'in'
                  }`}
                >
                  {m.message}
                  <div className="msg-time">
                    {formatTime(m.timestamp)}
                  </div>
                </div>
              ))}
            </div>

            <div className="provider-msg-input">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type reply..."
              />
              <button className="btn btn-primary" onClick={sendMessage}>
                Send
              </button>
            </div>
          </>
        ) : (
          <div>Select a patient</div>
        )}
      </div>
    </div>
  )
}
