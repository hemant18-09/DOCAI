import { useState, useEffect } from 'react';
import API_BASE from '../config/api';
import '../styles/ProviderPortal.css';

// Sidebar Component
const Sidebar = ({ currentView, onViewChange }) => {
  const navItems = [
    {
      group: 'Clinical',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
        { id: 'appointments', label: 'Appointments', icon: 'calendar' },
        { id: 'messages', label: 'Messages', icon: 'messages', badge: '3' },
      ],
    },
    {
      group: 'Administrative',
      items: [
        { id: 'records-queue', label: 'Incoming Records', icon: 'records', badge: '5', badgeColor: 'var(--accent-amber)' },
      ],
    },
  ];

  const renderIcon = (type) => {
    const iconMap = {
      dashboard: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
      ),
      calendar: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y="10" x2="21" y2="10"></line>
        </svg>
      ),
      messages: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
          <polyline points="22,6 12,13 2,6"></polyline>
        </svg>
      ),
      records: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      ),
    };
    return iconMap[type] || null;
  };

  return (
    <aside className="provider-sidebar">
      <div className="provider-logo">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" />
          <path d="M12 8V16" />
          <path d="M8 12H16" />
        </svg>
        DocAI Provider
      </div>
      <nav>
        {navItems.map((group) => (
          <div key={group.group} className="provider-nav-group">
            <div className="provider-nav-label">{group.group}</div>
            {group.items.map((item) => (
              <div key={item.id} className={`provider-nav-item ${currentView === item.id ? 'active' : ''}`} onClick={() => onViewChange(item.id)}>
                {renderIcon(item.icon)}
                {item.label}
                {item.badge && <span className="provider-badge" style={item.badgeColor ? { background: item.badgeColor } : {}}>{item.badge}</span>}
              </div>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
};

// TopBar Component
const TopBar = ({ title }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const doctorName = user.name || 'Doctor';
  const specialization = user.specialization || 'Healthcare Provider';
  
  return (
  <header className="provider-top-bar">
    <div className="provider-header-title">{title}</div>
    <div className="provider-header-right">
      <button className="btn btn-outline">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
      </button>
      <div className="provider-user-info">
        <div className="provider-user-details">
          <div className="provider-user-name">{doctorName}</div>
          <div className="provider-user-role">{specialization}</div>
        </div>
        <div className="provider-user-avatar" style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '16px'
        }}>
          {doctorName.split(' ')[1]?.charAt(0) || 'D'}
        </div>
      </div>
    </div>
  </header>
)};

// Dashboard View
const Dashboard = ({ onPatientClick }) => {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="provider-page-title">Today's Overview</h1>
        <div style={{ color: 'var(--text-soft)', fontWeight: 500 }}>{today}</div>
      </div>
      <div className="provider-stats-grid">
        <div className="provider-card provider-stat-card">
          <span className="provider-stat-label">Total Appointments</span>
          <span className="provider-stat-value">12</span>
        </div>
        <div className="provider-card provider-stat-card">
          <span className="provider-stat-label" style={{ color: 'var(--accent-red)' }}>High Priority Triage</span>
          <span className="provider-stat-value" style={{ color: 'var(--accent-red)' }}>3</span>
        </div>
        <div className="provider-card provider-stat-card">
          <span className="provider-stat-label">Video Visits</span>
          <span className="provider-stat-value">8</span>
        </div>
        <div className="provider-card provider-stat-card">
          <span className="provider-stat-label">Pending Lab Reviews</span>
          <span className="provider-stat-value">5</span>
        </div>
      </div>
      <div className="provider-card">
        <div className="provider-card-header">
          <h2 className="provider-section-title" style={{ margin: 0 }}>Appointment Queue</h2>
          <button className="btn btn-outline">View Full Calendar</button>
        </div>
        <table className="provider-data-table">
          <thead>
            <tr>
              <th style={{ width: '100px' }}>Time</th>
              <th>Patient</th>
              <th>AI Triage Summary (Reason)</th>
              <th>Type</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="provider-clickable-row" onClick={() => onPatientClick('patient-detail')}>
              <td style={{ fontWeight: 600 }}>10:00 AM</td>
              <td>
                <div style={{ fontWeight: 600 }}>Simulated Patient</div>
                <div style={{ fontSize: '13px', color: 'var(--text-soft)' }}>34 F • MRN #882910</div>
              </td>
              <td>
                <div style={{ fontWeight: 500, marginBottom: '4px' }}>Acute Cephalalgia & Photophobia</div>
                <div style={{ fontSize: '13px', color: 'var(--text-medium)', lineHeight: 1.4 }}>Severe, sudden onset headache (8/10) with nausea and distinct light sensitivity.</div>
              </td>
              <td><span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary-teal)' }}>Video</span></td>
              <td><span className="provider-urgency-tag provider-tag-high">High Priority</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
};

// Appointments View
const Appointments = ({ onPatientClick }) => (
  <>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
      <h1 className="provider-page-title">Schedule</h1>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button className="btn btn-outline">Today</button>
        <button className="btn btn-primary">New Appointment</button>
      </div>
    </div>
    <div className="provider-card" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="provider-calendar-grid">
        <div className="provider-cal-header"></div>
        <div className="provider-cal-header">Mon 26</div>
        <div className="provider-cal-header">Tue 27</div>
        <div className="provider-cal-header">Wed 28</div>
        <div className="provider-cal-header">Thu 29</div>
        <div className="provider-cal-header">Fri 30</div>
        <div className="provider-cal-time-slot">9:00 AM</div>
        <div className="provider-cal-cell"><div className="provider-appt-block provider-appt-inperson">Team Meeting</div></div>
        <div className="provider-cal-cell"></div>
        <div className="provider-cal-cell"><div className="provider-appt-block provider-appt-video">J. Smith (Video)</div></div>
        <div className="provider-cal-cell"></div>
        <div className="provider-cal-cell"></div>
        <div className="provider-cal-time-slot">10:00 AM</div>
        <div className="provider-cal-cell" style={{ background: '#FFF5F5' }}><div className="provider-appt-block provider-appt-video" style={{ borderLeftColor: 'var(--accent-red)' }} onClick={() => onPatientClick('patient-detail')}>Simulated Patient (High Priority)</div></div>
        <div className="provider-cal-cell"><div className="provider-appt-block provider-appt-inperson">R. Downey Jr.</div></div>
        <div className="provider-cal-cell"></div>
        <div className="provider-cal-cell"><div className="provider-appt-block provider-appt-video">A. Patel (Follow-up)</div></div>
        <div className="provider-cal-cell"></div>
        <div className="provider-cal-time-slot">11:00 AM</div>
        <div className="provider-cal-cell"><div className="provider-appt-block provider-appt-video">C. Evans (Cough)</div></div>
        <div className="provider-cal-cell"></div>
        <div className="provider-cal-cell"><div className="provider-appt-block provider-appt-inperson">Physical Slots</div></div>
        <div className="provider-cal-cell"></div>
        <div className="provider-cal-cell"></div>
      </div>
    </div>
  </>
);

// Messages View
const Messages = () => {
  const [activeConversation, setActiveConversation] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [doctor, setDoctor] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setDoctor(user);
      fetchConversations(user.id);
    }
  }, []);

  useEffect(() => {
    if (doctor && activeConversation) {
      const interval = setInterval(() => {
        fetchConversations(doctor.id);
      }, 3000); // Poll every 3 seconds
      return () => clearInterval(interval);
    }
  }, [doctor, activeConversation]);

  const fetchConversations = async (doctorId) => {
    try {
      const response = await fetch(`${API_BASE}/messages/doctor/${doctorId}`);
      const data = await response.json();
      if (data.success) {
        setConversations(data.conversations);
        if (data.conversations.length > 0 && !activeConversation) {
          setActiveConversation(data.conversations[0]);
        } else if (activeConversation) {
          // Update active conversation
          const updated = data.conversations.find(c => c.patientId === activeConversation.patientId);
          if (updated) setActiveConversation(updated);
        }
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !doctor || !activeConversation) return;

    try {
      const response = await fetch(`${API_BASE}/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId: activeConversation.patientId,
          doctorId: doctor.id,
          patientName: activeConversation.patientName,
          doctorName: doctor.name,
          message: messageInput,
          sender: 'doctor'
        }),
      });

      if (response.ok) {
        setMessageInput('');
        fetchConversations(doctor.id);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  return (
    <>
      <h1 className="provider-page-title" style={{ marginBottom: '24px' }}>Messages</h1>
      <div className="provider-messages-container provider-card" style={{ margin: 0 }}>
        <div className="provider-msg-list">
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)' }}>
            <input type="text" placeholder="Search messages..." style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
          </div>
          {conversations.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-soft)' }}>
              No messages yet
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.patientId}
                className={`provider-msg-preview ${activeConversation?.patientId === conv.patientId ? 'active' : ''}`}
                onClick={() => setActiveConversation(conv)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ fontWeight: 600 }}>{conv.patientName}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-soft)' }}>
                    {conv.lastMessage ? formatTime(conv.lastMessage.timestamp) : ''}
                  </div>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-medium)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {conv.lastMessage ? conv.lastMessage.message.substring(0, 50) + '...' : 'No messages'}
                </div>
                {conv.unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'var(--accent-red)',
                    color: 'white',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    borderRadius: '10px',
                    padding: '2px 6px',
                    minWidth: '18px',
                    textAlign: 'center'
                  }}>
                    {conv.unreadCount}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
        <div className="provider-msg-content">
          {activeConversation ? (
            <>
              <div className="provider-msg-header">
                <div style={{ fontWeight: 700, fontSize: '18px' }}>{activeConversation.patientName}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-soft)' }}>Patient ID: {activeConversation.patientId}</div>
              </div>
              <div className="provider-msg-body">
                {activeConversation.messages.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-soft)' }}>
                    No messages in this conversation
                  </div>
                ) : (
                  activeConversation.messages.map((msg) => (
                    <div key={msg.id} className={`provider-msg-bubble provider-msg-${msg.sender === 'patient' ? 'in' : 'out'}`}>
                      {msg.message}
                      <div style={{ textAlign: 'right', fontSize: '11px', color: msg.sender === 'patient' ? 'var(--text-soft)' : 'rgba(255,255,255,0.8)', marginTop: '8px' }}>
                        {formatTime(msg.timestamp)}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', background: 'var(--bg-white)', display: 'flex', gap: '12px' }}>
                <input
                  type="text"
                  placeholder="Type a reply..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSendMessage();
                    }
                  }}
                  style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                />
                <button className="btn btn-primary" onClick={handleSendMessage}>Send</button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-soft)' }}>
              Select a conversation to view messages
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// Records Queue View
const RecordsQueue = () => (
  <>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
      <h1 className="provider-page-title">Incoming Records Queue</h1>
      <div style={{ color: 'var(--text-soft)' }}>5 items pending review</div>
    </div>
    <div className="provider-card">
      <table className="provider-data-table">
        <thead>
          <tr>
            <th>Date Uploaded</th>
            <th>Patient</th>
            <th>Type</th>
            <th>AI Extracted Data Summary</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Today, 8:45 AM</td>
            <td style={{ fontWeight: 600 }}>Simulated Patient</td>
            <td><span className="provider-history-pill provider-pill-prescription">Prescription</span></td>
            <td style={{ maxWidth: '350px' }}>
              <div style={{ fontFamily: 'monospace', fontSize: '12px', background: '#F7FAFC', padding: '8px', borderRadius: '4px' }}>MED: Amoxicillin 500mg<br />SIG: 1 cap q12h x 10d</div>
              <div style={{ fontSize: '12px', color: 'var(--accent-red)', marginTop: '4px', fontWeight: 600 }}>Alert: Potential interaction with current Lisinopril.</div>
            </td>
            <td><div style={{ display: 'flex', gap: '8px' }}><button className="btn btn-primary" style={{ padding: '8px 12px', fontSize: '12px' }}>Review</button><button className="btn btn-outline" style={{ padding: '8px 12px', fontSize: '12px' }}>Dismiss</button></div></td>
          </tr>
        </tbody>
      </table>
    </div>
  </>
);

// Patient Detail View
const PatientDetail = ({ onBack }) => (
  <>
    <div style={{ marginBottom: '24px', cursor: 'pointer', color: 'var(--text-medium)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '14px' }} onClick={onBack}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg> Back
    </div>
    <div className="provider-patient-header">
      <div>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '32px' }}>Simulated Patient</h1>
        <div style={{ color: 'var(--text-medium)', fontSize: '16px', display: 'flex', gap: '16px' }}>
          <span>34 Y/O Female</span>
          <span>DOB: 05/12/1989</span>
          <span>MRN: #882910</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button className="btn btn-outline">Message</button>
        <button className="btn btn-primary" style={{ background: 'var(--accent-green)' }}>Start Video Visit</button>
      </div>
    </div>
    <div className="provider-two-column-grid">
      <div>
        <div className="provider-triage-alert provider-critical">
          <div style={{ color: 'var(--accent-red)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>High Risk Symptom Presentation (Today, 8:30 AM)</div>
          <p style={{ marginTop: '12px', fontSize: '15px' }}><strong>Chief Complaint:</strong> Severe, sudden onset headache.<br /><strong>AI Summary:</strong> Patient indicates acute cephalalgia with marked photophobia and nausea.</p>
        </div>
        <div className="provider-card">
          <div className="provider-card-header">
            <h2 className="provider-section-title" style={{ margin: 0 }}>Medical History Timeline</h2>
          </div>
          <div className="provider-card-body">
            <div className="provider-timeline-item">
              <div style={{ width: '120px', flexShrink: 0 }}>
                <div style={{ fontSize: '12px', color: 'var(--text-soft)', fontWeight: 500 }}>Today, 8:30 AM</div>
              </div>
              <div className="provider-timeline-content">
                <div style={{ fontWeight: 600 }}>Symptom Triage Event</div>
                <div style={{ fontSize: '13px', color: 'var(--text-medium)' }}>Patient submitted symptoms via mobile app resulting in High Priority alert.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className="provider-card">
          <div className="provider-card-header">
            <h2 className="provider-section-title" style={{ margin: 0 }}>Current Medications</h2>
          </div>
          <div className="provider-card-body">
            <div style={{ padding: '16px 0' }}>
              <div style={{ fontWeight: 600, fontSize: '15px' }}>Lisinopril (10mg)</div>
              <div style={{ marginTop: '4px', fontSize: '12px', color: 'var(--text-soft)' }}>PO Daily (HTN)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
);

// Main Provider Portal View
export default function ProviderPortalView() {
  const [currentView, setCurrentView] = useState('dashboard');

  const getHeaderTitle = () => {
    const titles = {
      'dashboard': 'Dashboard overview',
      'appointments': 'Calendar & Scheduling',
      'messages': 'Patient Messages',
      'records-queue': 'Records for Review',
      'patient-detail': 'Patient Chart',
    };
    return titles[currentView] || 'Dashboard overview';
  };

  return (
    <div className="provider-portal-container">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      <div className="provider-main-content">
        <TopBar title={getHeaderTitle()} />
        <div className="provider-content-scroll-area">
          {currentView === 'dashboard' && <Dashboard onPatientClick={() => setCurrentView('patient-detail')} />}
          {currentView === 'appointments' && <Appointments onPatientClick={() => setCurrentView('patient-detail')} />}
          {currentView === 'messages' && <Messages />}
          {currentView === 'records-queue' && <RecordsQueue />}
          {currentView === 'patient-detail' && <PatientDetail onBack={() => setCurrentView('dashboard')} />}
        </div>
      </div>
    </div>
  );
}
