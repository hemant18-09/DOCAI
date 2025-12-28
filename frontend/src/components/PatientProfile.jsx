function PatientProfile({ onClose }) {
  const user = JSON.parse(localStorage.getItem('user'))

  if (!user) return null

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2>Patient Profile</h2>

        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> Patient</p>

        {user.age && <p><strong>Age:</strong> {user.age}</p>}
        {user.bloodGroup && (
          <p><strong>Blood Group:</strong> {user.bloodGroup}</p>
        )}

        <button onClick={onClose} style={btnStyle}>
          Close
        </button>
      </div>
    </div>
  )
}

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0,0,0,0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
}

const modalStyle = {
  background: '#fff',
  padding: '24px',
  borderRadius: '12px',
  width: '90%',
  maxWidth: '400px',
}

const btnStyle = {
  marginTop: '16px',
  width: '100%',
}

export default PatientProfile
