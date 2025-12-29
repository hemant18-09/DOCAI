import { useEffect, useState } from 'react'
import API_BASE from '../config/api'
import './ChatView.css'

/* ---------- Helpers ---------- */
const formatTime = (ts) =>
  new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

/* ---------- Component ---------- */
export default function ChatView({ goTo }) {
  const [user, setUser] = useState(null)
  const [doctors, setDoctors] = useState([])
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)

  /* ---------- Load user ---------- */
  useEffect(() => {
    const u = localStorage.getItem('user')
    if (u) setUser(JSON.parse(u))
    else setLoading(false)
  }, [])

  /* ---------- Load doctors ---------- */
  useEffect(() => {
    if (!user) return

    fetch(`${API_BASE}/auth/doctors`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.doctors.length) {
          setDoctors(d.doctors)
          setSelectedDoctor(d.doctors[0])
        }
        setLoading(false)
      })
  }, [user])

  /* ---------- Load messages ---------- */
  useEffect(() => {
    if (!user || !selectedDoctor) return

    loadMessages()
    const interval = setInterval(loadMessages, 3000)
    return () => clearInterval(interval)
  }, [user, selectedDoctor])

  const loadMessages = async () => {
    const res = await fetch(
      `${API_BASE}/messages/conversation?patientId=${user.id}&doctorId=${selectedDoctor.id}`
    )
    const data = await res.json()
    if (data.success) setMessages(data.messages)
  }

  /* ---------- Send message ---------- */
  const sendMessage = async () => {
    if (!input.trim()) return

    await fetch(`${API_BASE}/messages/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientId: user.id,
        doctorId: selectedDoctor.id,
        patientName: user.name,
        doctorName: selectedDoctor.name,
        message: input,
        sender: 'patient',
      }),
    })

    setInput('')
    loadMessages()
  }

  /* ---------- Guards ---------- */
  if (loading) return <div className="card">Loading…</div>

  if (!user) {
    return (
      <div className="card">
        <h2>Please login to chat</h2>
        <button className="cta-button" onClick={() => goTo('login')}>
          Login
        </button>
      </div>
    )
  }

  /* ---------- UI ---------- */
  return (
    <div className="chat-container">
      {/* Doctor List */}
      <div className="chat-list">
        {doctors.map((d) => (
          <div
            key={d.id}
            className={`chat-item ${selectedDoctor?.id === d.id ? 'active' : ''}`}
            onClick={() => setSelectedDoctor(d)}
          >
            <strong>{d.name}</strong>
            <div className="muted">{d.specialization}</div>
          </div>
        ))}
      </div>

      {/* Messages */}
      <div className="chat-box">
        <div className="chat-header">
          {selectedDoctor?.name}
        </div>

        <div className="chat-messages">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`chat-bubble ${m.sender === 'patient' ? 'out' : 'in'}`}
            >
              {m.message}
              <div className="chat-time">{formatTime(m.timestamp)}</div>
            </div>
          ))}
        </div>

        <div className="chat-input">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type message…"
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  )
}
