import { signOut } from 'firebase/auth'
import { auth } from '../config/firebase'

function PatientProfile({ onClose, goTo }) {
  const user = JSON.parse(localStorage.getItem('user'))

  if (!user) return null

  const handleLogout = async () => {
    try {
      await signOut(auth)
    } catch {}

    localStorage.clear()
    onClose()
    goTo('login')
  }

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2>Patient Profile</h2>

        <p>
          <strong>Name:</strong>{' '}
          {user.name && user.name.trim() !== '' ? user.name : 'Not provided'}
        </p>

        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> Patient</p>

        {user.age && <p><strong>Age:</strong> {user.age}</p>}
        {user.bloodGroup && <p><strong>Blood Group:</strong> {user.bloodGroup}</p>}

        <button onClick={handleLogout} style={logoutBtn}>
          Logout
        </button>

        <button onClick={onClose} style={btnStyle}>
          Close
        </button>
      </div>
    </div>
  )
}

const overlayStyle = {
  position: 'fixed',
  inset: 0,
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
  marginTop: '12px',
  width: '100%',
}

const logoutBtn = {
  marginTop: '16px',
  width: '100%',
  background: '#e74c3c',
  color: '#fff',
  border: 'none',
  padding: '10px',
  borderRadius: '6px',
  cursor: 'pointer',
}

export default PatientProfile
