function EmergencyHospitalsView({ goTo }) {
  const hospitals = [
    {
      id: 1,
      name: 'SMS Hospital',
      city: 'Jaipur',
      distance: '2.1 km',
    },
    {
      id: 2,
      name: 'Fortis Hospital',
      city: 'Jaipur',
      distance: '4.3 km',
    },
    {
      id: 3,
      name: 'Apollo Hospital',
      city: 'Hyderabad',
      distance: '3.8 km',
    },
  ]

  return (
    <div className="card home-hero-card">
      <h1>Nearby Emergency Hospitals</h1>
      <p>Select a hospital to confirm an emergency slot.</p>

      <div style={{ marginTop: 16 }}>
        {hospitals.map((h) => (
          <div
            key={h.id}
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
              cursor: 'pointer',
            }}
            onClick={() => {
              localStorage.setItem('selectedHospital', JSON.stringify(h))
              goTo('emergency-confirm')
            }}
          >
            <strong>{h.name}</strong>
            <div>{h.city}</div>
            <div style={{ fontSize: 13, color: '#6b7280' }}>
              Distance: {h.distance}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default EmergencyHospitalsView
