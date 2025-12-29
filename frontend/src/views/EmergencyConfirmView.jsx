import { useState } from 'react'
import API_BASE from '../config/api'

function EmergencyConfirmView({ goTo }) {
  const [loading, setLoading] = useState(false)
  const report = JSON.parse(localStorage.getItem('emergencyReport') || '{}')
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const handleConfirm = async () => {
    try {
      setLoading(true)

      const payload = {
        patientId: user.id,
        patientName: user.name,
        age: user.age,
        complaint: report.reasons?.join(', ') || 'Emergency symptoms',
        city: user.city || 'Unknown',
        severity: report.risk >= 85 ? 'CRITICAL' : 'HIGH',
        riskScore: report.risk,
      }

      const res = await fetch(`${API_BASE}/emergencies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error('Failed to create emergency')

      const data = await res.json()

      // Save emergency id for later (chat / tracking)
      localStorage.setItem(
        'activeEmergency',
        JSON.stringify(data.emergency)
      )

      // Move to hospital selection or waiting screen
      goTo('emergency-hospitals')
    } catch (err) {
      console.error('Emergency create failed:', err)
      alert('Could not create emergency. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card home-hero-card">
      <h1 style={{ color: '#dc2626' }}>🚨 Confirm Emergency</h1>

      <p>
        Our system detected a <strong>high-risk medical emergency</strong>.
      </p>

      <ul style={{ marginTop: 12 }}>
        {report.reasons?.map((r, i) => (
          <li key={i}>{r}</li>
        ))}
      </ul>

      <button
        className="cta-button"
        style={{ background: '#dc2626', marginTop: 20 }}
        onClick={handleConfirm}
        disabled={loading}
      >
        {loading ? 'Contacting hospital…' : 'Confirm & Find Hospital'}
      </button>

      <a
        href="tel:112"
        style={{
          display: 'block',
          marginTop: 14,
          textAlign: 'center',
        }}
      >
        Or call emergency services (112)
      </a>
    </div>
  )
}

export default EmergencyConfirmView
