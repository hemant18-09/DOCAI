import { useEffect, useState } from 'react'
import { EMERGENCY_HOSPITALS } from '../utils/emergencyHospitals'
import { getCurrentLocation, calculateDistance } from '../utils/geoUtils'

function EmergencyBookingView({ goTo }) {
  const report = JSON.parse(localStorage.getItem('emergencyReport'))

  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(true)

  /* ---------------- LOAD NEAREST HOSPITALS ---------------- */
  useEffect(() => {
    async function loadHospitals() {
      try {
        const loc = await getCurrentLocation()

        const enriched = EMERGENCY_HOSPITALS.map((h) => {
          const distanceKm = calculateDistance(
            loc.lat,
            loc.lng,
            h.lat,
            h.lng
          )

          return {
            ...h,
            distance: typeof distanceKm === 'number' ? distanceKm : null,
            eta:
              typeof distanceKm === 'number'
                ? Math.round((distanceKm / 40) * 60)
                : null,
          }
        })

        enriched.sort((a, b) => (a.distance ?? 9999) - (b.distance ?? 9999))
        setHospitals(enriched)
      } catch {
        const fallback = EMERGENCY_HOSPITALS
          .filter((h) => h.city === 'Jaipur')
          .map((h) => ({
            ...h,
            distance: null,
            eta: null,
          }))

        setHospitals(fallback)
      } finally {
        setLoading(false)
      }
    }

    loadHospitals()
  }, [])

  if (loading) {
    return (
      <p style={{ textAlign: 'center', marginTop: 40 }}>
        🚑 Finding nearby emergency hospitals…
      </p>
    )
  }

  return (
    <div className="card home-hero-card">
      <h1 style={{ color: '#dc2626' }}>🚨 Emergency Care Required</h1>

      <p>Based on your symptoms, immediate medical attention is recommended.</p>

      {report?.reasons?.length > 0 && (
        <ul>
          {report.reasons.slice(0, 3).map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      )}

      <h3 style={{ marginTop: 24 }}>Nearby Emergency Hospitals</h3>

      {hospitals.map((h, index) => (
        <div
          key={h.id}
          className="list-item-card"
          style={{ marginBottom: 12 }}
        >
          <strong>{h.name}</strong>
          <p>{h.city}</p>

          {index === 0 && (
            <p style={{ color: '#dc2626', fontWeight: 600 }}>
              🚑 Nearest Hospital
            </p>
          )}

          {/* SAFE DISTANCE */}
          <p style={{ fontSize: 13 }}>
            {typeof h.distance === 'number' ? (
              <>
                📍 {h.distance.toFixed(1)} km • ⏱ {h.eta} mins
              </>
            ) : (
              '📍 Distance unavailable'
            )}
          </p>

          {/* ACTION BUTTONS */}
          <div
            style={{
              display: 'flex',
              gap: 8,
              marginTop: 8,
              flexWrap: 'wrap',
            }}
          >
            <button
              className="small-btn"
              style={{ flex: '1 1 120px' }}
              onClick={() =>
                window.open(
                  `https://www.google.com/maps?q=${h.lat},${h.lng}`,
                  '_blank'
                )
              }
            >
              🗺 Open Map
            </button>

            {h.phone && (
              <a
                className="small-btn"
                style={{ flex: '1 1 120px', textAlign: 'center' }}
                href={`tel:${h.phone}`}
              >
                📞 Call
              </a>
            )}

            <button
              className="small-btn primary"
              style={{ flex: '1 1 120px' }}
              disabled={!h.distance}
              onClick={() => {
                localStorage.setItem('selectedHospital', JSON.stringify(h))
                goTo('emergency-confirm')
              }}
            >
              Confirm Slot
            </button>
          </div>
        </div>
      ))}

      <a
        href="tel:112"
        style={{
          display: 'block',
          marginTop: 20,
          textAlign: 'center',
          fontWeight: 600,
        }}
      >
        📞 Call emergency services (112)
      </a>
    </div>
  )
}

export default EmergencyBookingView
