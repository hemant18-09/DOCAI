import { useState, useEffect } from 'react'
import API_BASE from '../config/api'
import './ChatView.css'

function ChatView({ goTo }) {
  const [doctors, setDoctors] = useState([])
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [conversations, setConversations] = useState({})
  const [messageInput, setMessageInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Get logged in user
    console.log('[ChatView] Checking localStorage for user...')
    const userData = localStorage.getItem('user')
    if (userData) {
      console.log('[ChatView] Found user in localStorage:', JSON.parse(userData))
      setUser(JSON.parse(userData))
    } else {
      console.log('[ChatView] No user in localStorage')
    }

    // Fetch all doctors
    fetchDoctors()
  }, [])

  // Re-check localStorage for user every 500ms for up to 5 seconds (bootstrap case)
  useEffect(() => {
    if (user) return
    console.log('[ChatView] Starting localStorage polling (no user yet)...')
    const attempts = 10
    let count = 0
    const timer = setInterval(() => {
      console.log(`[ChatView] Poll attempt ${count + 1}/${attempts}`)
      const userData = localStorage.getItem('user')
      if (userData) {
        console.log('[ChatView] User found on retry!')
        setUser(JSON.parse(userData))
        clearInterval(timer)
      } else if (++count >= attempts) {
        console.log('[ChatView] Polling finished, no user found')
        clearInterval(timer)
      }
    }, 500)
    return () => clearInterval(timer)
  }, [user])

  useEffect(() => {
    if (user && selectedDoctor) {
      fetchConversation()
      const interval = setInterval(fetchConversation, 3000) // Poll every 3 seconds
      return () => clearInterval(interval)
    }
  }, [user, selectedDoctor])

  const fetchDoctors = async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/doctors`)
      const data = await response.json()
      if (data.success) {
        setDoctors(data.doctors)
        if (data.doctors.length > 0) {
          setSelectedDoctor(data.doctors[0])
        }
      }
      setLoading(false)
    } catch (error) {
      console.error('Error fetching doctors:', error)
      setLoading(false)
    }
  }

  const fetchConversation = async () => {
    if (!user || !selectedDoctor) return

    try {
      const response = await fetch(
        `${API_BASE}/messages/conversation?patientId=${user.id}&doctorId=${selectedDoctor.id}`
      )
      const data = await response.json()
      if (data.success) {
        setConversations(prev => ({
          ...prev,
          [selectedDoctor.id]: data.messages
        }))
      }
    } catch (error) {
      console.error('Error fetching conversation:', error)
    }
  }

  const sendMessage = async () => {
    try {
      const response = await fetch(`${API_BASE}/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId: user.id,
          doctorId: selectedDoctor.id,
          patientName: user.name,
          doctorName: selectedDoctor.name,
          message: messageInput,
          sender: 'patient'
        }),
      })

      if (response.ok) {
        setMessageInput('')
        fetchConversation()
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleSendMessage = () => {
    if (messageInput.trim() && user && selectedDoctor) {
      sendMessage()
    }

    const formatTime = (timestamp) => {
      const date = new Date(timestamp)
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (loading) {
    return <div className="card"><h2>Loading...</h2></div>
  }

  if (!user) {
    return (
      <div className="card">
        <h2>Please login to access messages</h2>
        <button className="cta-button" onClick={() => goTo('login')}>
          Go to Login
        </button>
      </div>
    )
  }

  const currentMessages = selectedDoctor ? conversations[selectedDoctor.id] || [] : []

  return (
    <>
      <h1 className="card-title" style={{ fontSize: '24px', marginBottom: '20px' }}>
        Messages
      </h1>

      <div className="chat-container">
        <div className="chat-list-section">
          <div className="chat-search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="chat-search-input"
            />
          </div>

          <div className="chat-list">
            {doctors.map((doctor) => {
              const msgs = conversations[doctor.id] || []
              const lastMsg = msgs[msgs.length - 1]
              
              return (
              <div
                key={doctor.id}
                className={`chat-item ${selectedDoctor?.id === doctor.id ? 'active' : ''}`}
                onClick={() => setSelectedDoctor(doctor)}
              >
                <div className="chat-avatar" style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '18px'
                }}>
                  {doctor.name.split(' ')[1]?.charAt(0) || 'D'}
                </div>
                <div className="chat-item-content">
                  <div className="chat-item-header">
                    <div className="chat-item-name">{doctor.name}</div>
                    <div className="chat-item-time">
                      {lastMsg ? formatTime(lastMsg.timestamp) : 'New'}
                    </div>
                  </div>
                  <div className="chat-item-preview">
                    {lastMsg ? lastMsg.message.substring(0, 40) + '...' : doctor.specialization}
                  </div>
                </div>
              </div>
            )})}
          </div>
        </div>

        <div className="chat-detail-section">
          {selectedDoctor && (
            <>
              <div className="chat-header">
                <div className="chat-header-info">
                  <div className="chat-header-avatar" style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold'
                  }}>
                    {selectedDoctor.name.split(' ')[1]?.charAt(0) || 'D'}
                  </div>
                  <div>
                    <div className="chat-header-name">{selectedDoctor.name}</div>
                    <div className="chat-header-role">{selectedDoctor.specialization}</div>
                  </div>
                </div>
                <div className="chat-header-actions">
                  <button className="btn btn-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                  </button>
                  <button className="btn btn-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M23 7l-7 5 7 5V7z"></path>
                      <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                    </svg>
                  </button>
                </div>
              </div>

              <div className="chat-messages">
                {currentMessages.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  currentMessages.map((msg) => (
                  <div key={msg.id} className={`chat-message chat-message-${msg.sender === 'patient' ? 'out' : 'in'}`}>
                    <div className="chat-message-bubble">
                      {msg.message}
                      <div className="chat-message-time">{formatTime(msg.timestamp)}</div>
                    </div>
                  </div>
                )))}
              </div>

              <div className="chat-input-area">
                <textarea
                  className="chat-input"
                  placeholder="Type your message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  rows="3"
                />
                <button 
                  className="btn btn-primary"
                  onClick={handleSendMessage}
                >
                  Send
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default ChatView
