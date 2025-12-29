import { useEffect, useState } from 'react'
import '../styles/ProviderPortal.css'
import API_BASE from '../config/api'
import useChatSocket from '../hooks/useChatSocket'

/* ===================== API HELPERS ===================== */

async function fetchEmergencies() {
  try {
    const res = await fetch(`${API_BASE}/emergencies`)
    if (!res.ok) throw new Error('Failed to fetch emergencies')
    const data = await res.json()
    return data.emergencies || []
  } catch (err) {
    console.error('Fetch emergencies error:', err)
    return []
  }
}

async function acceptEmergency(id, doctorId) {
  if (!doctorId) return
  await fetch(`${API_BASE}/emergencies/${id}/accept`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ doctorId }),
  })
}

async function resolveEmergency(id) {
  await fetch(`${API_BASE}/emergencies/${id}/resolve`, {
    method: 'POST',
  })
}

/* ===================== SIDEBAR ===================== */

const Sidebar = ({ currentView, onViewChange, emergencyCount }) => (
  <aside className="provider-sidebar">
    <div className="provider-logo">DocAI Provider</div>

    <nav>
      <div className="provider-nav-group">
        <div className="provider-nav-label">Clinical</div>

        <div
          className={`provider-nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
          onClick={() => onViewChange('dashboard')}
        >
          📊 Dashboard
        </div>

        <div
          className={`provider-nav-item ${currentView === 'emergencies' ? 'active' : ''}`}
          onClick={() => onViewChange('emergencies')}
        >
          🚨 Emergencies
          {emergencyCount > 0 && (
            <span className="provider-badge" style={{ background: 'var(--accent-red)' }}>
              {emergencyCount}
            </span>
          )}
        </div>
      </div>
    </nav>
  </aside>
)

/* ===================== TOP BAR ===================== */

const TopBar = ({ title }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  return (
    <header className="provider-top-bar">
      <h2>{title}</h2>
      <div>
        <strong>{user.name || 'Doctor'}</strong>
        <div style={{ fontSize: 12 }}>
          {user.specialization || 'Healthcare Provider'}
        </div>
      </div>
    </header>
  )
}

/* ===================== DASHBOARD ===================== */

const Dashboard = ({ emergencyCount, onViewEmergency }) => (
  <>
    <h1 className="provider-page-title">Dashboard Overview</h1>

    <div className="provider-stats-grid">
      <div className="provider-card">Appointments Today: 12</div>
      <div className="provider-card" style={{ color: 'var(--accent-red)' }}>
        Emergency Cases: {emergencyCount}
      </div>
      <div className="provider-card">Completed: 8</div>
    </div>

    <div className="provider-card">
      <h3>Emergency Queue</h3>
      <button className="btn btn-outline" onClick={onViewEmergency}>
        View Emergencies
      </button>
    </div>
  </>
)

/* ===================== EMERGENCY QUEUE ===================== */

const EmergencyQueue = ({ emergencies, onSelect }) => (
  <>
    <h1 className="provider-page-title">🚨 Emergency Queue</h1>

    <div className="provider-card">
      <table className="provider-data-table">
        <thead>
          <tr>
            <th>Patient</th>
            <th>Complaint</th>
            <th>Severity</th>
            <th>Status</th>
            <th>Reported</th>
          </tr>
        </thead>
        <tbody>
          {emergencies.map((e) => (
            <tr
              key={e.id}
              className="provider-clickable-row"
              onClick={() => onSelect(e)}
            >
              <td>
                <strong>{e.patientName}</strong>
                <div style={{ fontSize: 12 }}>{e.age} yrs</div>
              </td>
              <td>{e.complaint}</td>
              <td>
                <span className={`provider-urgency-tag provider-tag-${e.severity.toLowerCase()}`}>
                  {e.severity}
                </span>
              </td>
              <td>{e.status}</td>
              <td>
                {e.createdAt
                  ? new Date(
                      e.createdAt.seconds
                        ? e.createdAt.seconds * 1000
                        : e.createdAt
                    ).toLocaleTimeString()
                  : '--'}
              </td>
            </tr>
          ))}

          {emergencies.length === 0 && (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center', padding: 20 }}>
                No active emergencies
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </>
)

/* ===================== EMERGENCY CHAT ===================== */

const EmergencyChat = ({ emergency }) => {
  const doctor = JSON.parse(localStorage.getItem('user') || '{}')
  const roomId = `emergency-${emergency.id}`

  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')

  const { send } = useChatSocket(roomId, (msg) => {
    setMessages((prev) => [...prev, msg])
  })

  const sendMessage = () => {
    if (!input.trim()) return

    const msg = {
      sender: 'doctor',
      text: input,
      emergencyId: emergency.id,
      doctorId: doctor.id,
      timestamp: Date.now(),
    }

    send(msg)
    setMessages((prev) => [...prev, msg])
    setInput('')
  }

  return (
    <div className="provider-card">
      <h3>💬 Live Emergency Chat</h3>

      <div className="chat-box">
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.sender}`}>
            {m.text}
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Message patient..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  )
}

/* ===================== PATIENT DETAIL ===================== */

const PatientDetail = ({ emergency, onBack, onAccepted, onResolved }) => {
  if (!emergency) return null

  const doctor = JSON.parse(localStorage.getItem('user') || '{}')

  return (
    <>
      <button className="btn btn-outline" onClick={onBack}>
        ← Back
      </button>

      <h1 className="provider-page-title">{emergency.patientName}</h1>

      <div className="provider-card">
        <p><strong>Complaint:</strong> {emergency.complaint}</p>
        <p><strong>Severity:</strong> {emergency.severity}</p>
        <p><strong>Status:</strong> {emergency.status}</p>

        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          {emergency.status === 'NEW' && (
            <button
              className="btn btn-primary"
              onClick={async () => {
                await acceptEmergency(emergency.id, doctor.id)
                onAccepted()
              }}
            >
              Accept Case
            </button>
          )}

          {emergency.status !== 'RESOLVED' && (
            <button
              className="btn btn-outline"
              onClick={async () => {
                await resolveEmergency(emergency.id)
                onResolved()
              }}
            >
              Mark Resolved
            </button>
          )}
        </div>
      </div>

      {/* 🔥 LIVE CHAT */}
      <EmergencyChat emergency={emergency} />
    </>
  )
}

/* ===================== MAIN VIEW ===================== */

export default function DoctorPortalView() {
  const [currentView, setCurrentView] = useState('dashboard')
  const [emergencies, setEmergencies] = useState([])
  const [selectedEmergency, setSelectedEmergency] = useState(null)

  async function loadEmergencies() {
    const data = await fetchEmergencies()
    const active = data.filter(
      (e) => e.status === 'NEW' || e.status === 'IN_PROGRESS'
    )
    setEmergencies(active)
  }

  useEffect(() => {
    loadEmergencies()
    const interval = setInterval(loadEmergencies, 5000)
    return () => clearInterval(interval)
  }, [])

  const titles = {
    dashboard: 'Dashboard',
    emergencies: 'Emergency Queue',
    'patient-detail': 'Patient Detail',
  }

  return (
    <div className="provider-portal-container">
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        emergencyCount={emergencies.length}
      />

      <div className="provider-main-content">
        <TopBar title={titles[currentView]} />

        <div className="provider-content-scroll-area">
          {currentView === 'dashboard' && (
            <Dashboard
              emergencyCount={emergencies.length}
              onViewEmergency={() => setCurrentView('emergencies')}
            />
          )}

          {currentView === 'emergencies' && (
            <EmergencyQueue
              emergencies={emergencies}
              onSelect={(e) => {
                setSelectedEmergency(e)
                setCurrentView('patient-detail')
              }}
            />
          )}

          {currentView === 'patient-detail' && (
            <PatientDetail
              emergency={selectedEmergency}
              onBack={() => setCurrentView('emergencies')}
              onAccepted={loadEmergencies}
              onResolved={() => {
                setSelectedEmergency(null)
                loadEmergencies()
                setCurrentView('emergencies')
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
