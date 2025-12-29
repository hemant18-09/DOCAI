import { useState, useEffect } from 'react'
import useSpeechToText from '../hooks/useSpeechToText.js'
import { assessEmergency } from '../utils/emergencyGovernor.js'

/* ===================== LANGUAGE CONFIG ===================== */
const LANGUAGE_MAP = {
  en: 'en-US',
  hi: 'hi-IN',
  te: 'te-IN',
  ta: 'ta-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
}

const LANGUAGE_LABELS = {
  en: 'English',
  hi: 'Hindi',
  te: 'Telugu',
  ta: 'Tamil',
  kn: 'Kannada',
  ml: 'Malayalam',
}

/* ===================== NORMALIZE ===================== */
function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z\u0900-\u097F\u0C00-\u0C7F\s]/g, '')
    .trim()
}

/* ===================== CHEST PAIN OVERRIDE ===================== */
function hasChestPain(text) {
  return (
    text.includes('chest pain') ||
    text.includes('heart pain') ||
    text.includes('सीने में दर्द') ||
    text.includes('ఛాతిలో నొప్పి')
  )
}

/* ===================== MAIN VIEW ===================== */
function PatientPortalView({ goTo }) {
  const [textInput, setTextInput] = useState('')
  const [selectedLang, setSelectedLang] = useState('en')
  const [emergencyReport, setEmergencyReport] = useState(null)

  const {
    listening,
    text,
    startListening,
    stopListening,
    setText,
  } = useSpeechToText(LANGUAGE_MAP[selectedLang])

  /* ===================== SPEAK ===================== */
  const handleSpeak = () => {
    if (listening) stopListening()
    else {
      setText('')
      startListening()
    }
    setEmergencyReport(null)
  }

  /* ===================== TEXT INPUT ===================== */
  const handleTextChange = (e) => {
    setTextInput(e.target.value)
    setEmergencyReport(null)
  }

  /* ===================== CONTINUE ===================== */
  const handleContinue = () => {
    const normalizedText = normalize(textInput)

    let report = assessEmergency(textInput)

    /* 🚨 MEDICAL OVERRIDE FOR CHEST PAIN */
    if (hasChestPain(normalizedText)) {
      report = {
        isEmergency: true,
        risk: 85,
        reasons: [
          'Chest pain can indicate a cardiac emergency',
          'Immediate medical evaluation is recommended',
        ],
      }
    }

    console.log('EMERGENCY REPORT:', report)

    if (report?.isEmergency) {
      setEmergencyReport(report)
      localStorage.setItem('emergencyReport', JSON.stringify(report))
      return
    }

    goTo('triage')
  }

  /* ===================== CONFIRM EMERGENCY ===================== */
  const confirmEmergency = () => {
    goTo('emergency-booking')
  }

  /* ===================== SPEECH → TEXT ===================== */
  useEffect(() => {
    if (text && text !== textInput) {
      setTextInput(text)
      setEmergencyReport(null)
    }
  }, [text])

  /* ===================== LANGUAGE CHANGE ===================== */
  useEffect(() => {
    if (listening) stopListening()
    setText('')
    setTextInput('')
    setEmergencyReport(null)
  }, [selectedLang])

  /* ===================== UI ===================== */
  return (
    <div className="card home-hero-card">
      <h1 className="home-hero-title">What’s bothering you today?</h1>
      <p className="card-subtitle">
        Describe how you’re feeling in your own words.
      </p>

      {/* -------- Language Selector -------- */}
      <div className="speak-section">
        <div className="language-selector-inline">
          <label>Language:</label>
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
          >
            {Object.entries(LANGUAGE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>

        <button
          className={`mode-button ${listening ? 'listening' : ''}`}
          onClick={handleSpeak}
        >
          🎤 {listening ? 'Listening… Tap to stop' : 'Speak'}
        </button>
      </div>

      {/* -------- Emergency Warning -------- */}
      {emergencyReport && (
        <div
          style={{
            border: '2px solid #dc2626',
            background: '#fee2e2',
            color: '#7f1d1d',
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <strong>🚨 Medical Emergency Detected</strong>
          <p style={{ marginTop: 8 }}>
            Your symptoms may indicate a serious condition.
          </p>

          <ul style={{ marginTop: 8 }}>
            {emergencyReport.reasons.slice(0, 3).map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>

          <button
            className="cta-button"
            style={{ marginTop: 12, background: '#dc2626' }}
            onClick={confirmEmergency}
          >
            Proceed to Emergency Care
          </button>

          <p style={{ fontSize: 12, marginTop: 8 }}>
            For immediate help, call your local emergency number.
          </p>
        </div>
      )}

      {/* -------- Symptom Input -------- */}
      <textarea
        className="symptom-input-box"
        placeholder="Type here or use the speak button…"
        value={textInput}
        onChange={handleTextChange}
      />

      {/* -------- Continue Button -------- */}
      {!emergencyReport && (
        <button
          className="cta-button"
          onClick={handleContinue}
          disabled={!textInput.trim()}
        >
          Continue
        </button>
      )}
    </div>
  )
}

export default PatientPortalView
