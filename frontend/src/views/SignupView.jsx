import { useState } from 'react'
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth } from '../config/firebase'
import API_BASE from '../config/api'

function SignupView({ goTo }) {
  const [userType, setUserType] = useState('patient')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    bloodGroup: '',
    age: '',
    specialization: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    
    // Guard: Firebase not configured
    if (!auth) {
      setError('Firebase is not configured. Check environment variables.')
      setLoading(false)
      return
    }
    
    setError('')
    setLoading(true)

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    if (userType === 'patient') {
      if (!formData.bloodGroup || !formData.age) {
        setError('Please fill all required fields')
        setLoading(false)
        return
      }
    }

    try {
      // Create Firebase Auth account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      )
      const firebaseUid = userCredential.user.uid

      // Prepare user data for backend
      const userData = {
        id: firebaseUid,
        name: formData.name,
        email: formData.email,
        role: userType,
        phone: ''
      }

      if (userType === 'patient') {
        userData.bloodGroup = formData.bloodGroup
        userData.age = parseInt(formData.age)
      } else if (userType === 'doctor') {
        userData.specialization = formData.specialization || 'General Physician'
      }

      // Save user to backend/Firestore
      const response = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Ensure user is signed out so they must log in explicitly
        try { await signOut(auth) } catch {}

        // Store a one-time success flag and prefill email
        localStorage.setItem('signupSuccess', '1')
        localStorage.setItem('signupEmail', formData.email)

        // Redirect to login page after successful signup
        goTo('login')
      } else {
        setError(data.message || 'Signup failed')
        setLoading(false)
      }
    } catch (error) {
      console.error('Signup error:', error)
      setError(error.message || 'Signup failed')
      setLoading(false)
    }
  }

  return (
    <>
      <div className="card home-hero-card">
        <h1 className="home-hero-title">Create Account</h1>
        <p className="card-subtitle">
          Sign up to get personalized healthcare assistance.
        </p>

        {/* User Type Selection */}
        <div style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: 'var(--text-primary)' }}>I am a:</p>
          <div style={{ display: 'flex', gap: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flex: 1, padding: '12px', border: userType === 'patient' ? '2px solid var(--primary-teal)' : '2px solid #ccc', borderRadius: '8px', transition: 'all 0.2s', backgroundColor: userType === 'patient' ? '#f0fdfb' : 'transparent' }}>
              <input
                type="radio"
                name="userType"
                value="patient"
                checked={userType === 'patient'}
                onChange={(e) => { setUserType('patient'); }}
                style={{ cursor: 'pointer', width: '18px', height: '18px', accentColor: 'var(--primary-teal)' }}
              />
              <span style={{ fontWeight: userType === 'patient' ? '600' : '400' }}>Patient</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flex: 1, padding: '12px', border: userType === 'doctor' ? '2px solid var(--primary-teal)' : '2px solid #ccc', borderRadius: '8px', transition: 'all 0.2s', backgroundColor: userType === 'doctor' ? '#f0fdfb' : 'transparent' }}>
              <input
                type="radio"
                name="userType"
                value="doctor"
                checked={userType === 'doctor'}
                onChange={(e) => { setUserType('doctor'); }}
                style={{ cursor: 'pointer', width: '18px', height: '18px', accentColor: 'var(--primary-teal)' }}
              />
              <span style={{ fontWeight: userType === 'doctor' ? '600' : '400' }}>Doctor</span>
            </label>
          </div>
        </div>

        {error && (
          <div style={{
            padding: '12px',
            backgroundColor: '#fee',
            color: '#c33',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="symptom-input-box"
            style={{ minHeight: 'auto', padding: '12px', marginBottom: 0 }}
          />

          {userType === 'patient' && (
            <>
              <input
                type="text"
                name="bloodGroup"
                placeholder="Blood Group (e.g., O+, A-, B+)"
                value={formData.bloodGroup}
                onChange={handleChange}
                required
                className="symptom-input-box"
                style={{ minHeight: 'auto', padding: '12px', marginBottom: 0 }}
              />
              <input
                type="number"
                name="age"
                placeholder="Age"
                value={formData.age}
                onChange={handleChange}
                required
                min="1"
                max="120"
                className="symptom-input-box"
                style={{ minHeight: 'auto', padding: '12px', marginBottom: 0 }}
              />
            </>
          )}

          {userType === 'doctor' && (
            <input
              type="text"
              name="specialization"
              placeholder="Specialization (Optional)"
              value={formData.specialization}
              onChange={handleChange}
              className="symptom-input-box"
              style={{ minHeight: 'auto', padding: '12px', marginBottom: 0 }}
            />
          )}

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
            className="symptom-input-box"
            style={{ minHeight: 'auto', padding: '12px', marginBottom: 0 }}
          />
          <input
            type="password"
            name="password"
            placeholder="Password (min 6 characters)"
            value={formData.password}
            onChange={handleChange}
            required
            className="symptom-input-box"
            style={{ minHeight: 'auto', padding: '12px', marginBottom: 0 }}
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="symptom-input-box"
            style={{ minHeight: 'auto', padding: '12px', marginBottom: 0 }}
          />
          <button
            type="submit"
            className="cta-button"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text-soft)', marginTop: '16px' }}>
          Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); goTo('login'); }} style={{ color: 'var(--primary-teal)', textDecoration: 'none', fontWeight: 600, cursor: 'pointer' }}>Log In</a>
        </p>
      </div>
      <button
        style={{
          color: 'var(--text-soft)',
          background: 'none',
          border: 'none',
          padding: '12px',
          width: '100%',
          cursor: 'pointer',
          marginTop: '12px',
        }}
        onClick={() => goTo('home')}
      >
        Back
      </button>
    </>
  )
}

export default SignupView
