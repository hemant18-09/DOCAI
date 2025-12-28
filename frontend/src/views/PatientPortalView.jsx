import { useState, useEffect } from 'react'
import useSpeechToText from '../hooks/useSpeechToText.js'
import { assessEmergency } from '../utils/emergencyGovernor.js'

const LANGUAGE_MAP = {
  en: "en-US",
  hi: "hi-IN",
  te: "te-IN",
  ta: "ta-IN",
  kn: "kn-IN",
  ml: "ml-IN",
};

const LANGUAGE_LABELS = {
  en: "English",
  hi: "Hindi",
  te: "Telugu",
  ta: "Tamil",
  kn: "Kannada",
  ml: "Malayalam",
};

function PatientPortalView({ goTo }) {
  const [textInput, setTextInput] = useState('')
  const [selectedLang, setSelectedLang] = useState('en')
  const { listening, text, startListening, stopListening, setText } = useSpeechToText(LANGUAGE_MAP[selectedLang])
  const [emergencyReport, setEmergencyReport] = useState(null)

  const handleSpeak = () => {
    if (listening) {
      stopListening()
    } else {
      startListening()
    }
    // Clear any previous emergency when user re-engages speech
    if (emergencyReport) setEmergencyReport(null)
  }

  const handleTextChange = (e) => {
    setTextInput(e.target.value)
    // Clear emergency state on any manual text change
    if (emergencyReport) setEmergencyReport(null)
  }

  const handleContinue = () => {
    const report = assessEmergency(textInput)
    if (report.isEmergency) {
      setEmergencyReport(report)
      return
    }
    goTo('triage')
  }

  // Sync speech text to textInput when speech is detected
  useEffect(() => {
    if (text) {
      setTextInput(text)
      // Clear emergency when new speech text arrives
      if (emergencyReport) setEmergencyReport(null)
    }
  }, [text])

  return (
    <>
      <div className="card home-hero-card">
        <h1 className="home-hero-title">What's bothering you today?</h1>
        <p className="card-subtitle">
          Describe how you're feeling in your own words.
        </p>
        <div className="speak-section">
          <div className="language-selector-inline">
            <label className="language-selector-label">Language:</label>
            <select 
              className="language-dropdown"
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
            >
              {Object.entries(LANGUAGE_LABELS).map(([code, label]) => (
                <option key={code} value={code}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="input-mode-toggle">
            <button 
              className={`mode-button mode-button-active ${listening ? 'listening' : ''}`}
              onClick={handleSpeak}
            >
              <span className="mode-icon">🎤</span>
              {listening ? 'Listening... Click to Stop' : 'Speak'}
            </button>
          </div>
          <p className="listening-hint">
            {listening && `Listening in ${LANGUAGE_LABELS[selectedLang]}`}
          </p>
          <p className="language-hint">
            You can speak in English, Hindi, Telugu, Tamil, Kannada, or Malayalam.
          </p>
        </div>
        {emergencyReport && (
          <div style={{
            border: '2px solid #ef4444',
            background: '#fee2e2',
            color: '#991b1b',
            borderRadius: '12px',
            padding: '16px',
            margin: '0 0 16px 0',
          }}>
            <strong style={{ display: 'block', marginBottom: 6 }}>Emergency warning</strong>
            <div style={{ fontSize: 14, marginBottom: 6 }}>{emergencyReport.message}</div>
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: 13 }}>
              {emergencyReport.reasons.slice(0,3).map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        )}

        <textarea
          className="symptom-input-box"
          placeholder="Describe how you're feeling in your own words type here or click the speak now button"
          value={textInput}
          onChange={handleTextChange}
        />
        <button
          className="cta-button"
          onClick={handleContinue}
          disabled={!!emergencyReport}
        >
          {emergencyReport ? 'Emergency detected — seek care now' : 'Continue'}
        </button>
        {emergencyReport && (
          <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-soft)', marginTop: 8 }}>
            For urgent help, call your local emergency number.
          </div>
        )}
      </div>
      <div className="trust-badges-container">
        <div className="trust-badge">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>{' '}
          Private Data
        </div>
        <div className="trust-badge">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>{' '}
          Secure
        </div>
      </div>
      <div className="secondary-actions-grid">
        <div className="action-card-small" onClick={() => goTo('triage')}>
          <div className="action-card-icon">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <div className="action-card-title">Symptom Checker</div>
          <div className="action-card-desc">
            Check your symptoms and get a risk assessment.
          </div>
        </div>
        <div className="action-card-small" onClick={() => goTo('rx-upload')}>
          <div className="action-card-icon">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <div className="action-card-title">Prescription Analyzer</div>
          <div className="action-card-desc">
            Upload and analyze a prescription.
          </div>
        </div>
      </div>
    </>
  )
}

export default PatientPortalView
