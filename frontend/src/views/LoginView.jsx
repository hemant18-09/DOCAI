import { useState, useEffect } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../config/firebase'

export default function LoginView({ goTo }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [userType, setUserType] = useState('patient')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [signupNotice, setSignupNotice] = useState('')

  // Show a one-time success banner if redirected from signup
  useEffect(() => {
    const flag = localStorage.getItem('signupSuccess')
    const emailPrefill = localStorage.getItem('signupEmail')
    if (flag) {
      setSignupNotice('Successfully signed up! Please log in to continue.')
      if (emailPrefill) {
        setEmail(emailPrefill)
      }
      // Clear one-time flags
      localStorage.removeItem('signupSuccess')
      localStorage.removeItem('signupEmail')
    }
  }, [])

  const handleFirebaseLogin = async (e) => {
    e.preventDefault()
    
    // Guard: Firebase not configured
    if (!auth) {
      setError('Firebase is not configured. Check environment variables.')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      
      // Get ID token
      const idToken = await userCredential.user.getIdToken()
      
      // Send token to backend
      const response = await fetch('http://localhost:5000/api/auth/login/firebase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('firebaseUid', data.firebaseUid)

        // Decide navigation strictly by backend role, not the radio button.
        // If the account isn't a doctor but the user selected Doctor, show a clear error.
        const role = data.userType || 'user'
        localStorage.setItem('userType', role)

        setLoading(false)

        if (role === 'doctor') {
          goTo('provider-portal')
        } else if (role === 'patient') {
          if (userType === 'doctor') {
            setError('This email belongs to a patient account. Please sign up as a doctor to access Provider Portal.')
            return
          }
          goTo('home')
        } else {
          // No profile found in Firestore (role === 'user').
          if (userType === 'doctor') {
            setError('No doctor profile found for this email. Sign up as a doctor first.')
            return
          }
          goTo('home')
        }
      } else {
        setLoading(false)
        setError(data.detail || 'Login failed')
      }
    } catch (error) {
      console.error('Firebase auth error:', error)
      setError(error.message || 'Authentication failed')
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Welcome Back</h1>
        <p className="login-subtitle">Sign in to your DocAI account</p>

        {signupNotice && (
          <div style={{
            marginTop: '10px',
            marginBottom: '16px',
            padding: '12px',
            backgroundColor: '#eafaf1',
            color: '#1e8449',
            borderRadius: '8px',
            fontSize: '14px'
          }}>
            {signupNotice}
          </div>
        )}
        
        <div className="user-type-section">
          <p className="user-type-label">I am a:</p>
          <div className="user-type-options" style={{ display: 'flex', gap: '16px' }}>
            <label className="user-type-option" style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flex: 1, padding: '12px', border: userType === 'patient' ? '2px solid var(--primary-teal)' : '2px solid #ccc', borderRadius: '8px', transition: 'all 0.2s', backgroundColor: userType === 'patient' ? '#f0fdfb' : 'transparent' }}>
              <input
                type="radio"
                name="userType"
                value="patient"
                checked={userType === 'patient'}
                onChange={(e) => { console.log('Changed to:', e.target.value); setUserType('patient'); }}
                style={{ cursor: 'pointer', width: '18px', height: '18px', accentColor: 'var(--primary-teal)' }}
              />
              <span className="user-type-text" style={{ fontWeight: userType === 'patient' ? '600' : '400' }}>Patient</span>
            </label>
            <label className="user-type-option" style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flex: 1, padding: '12px', border: userType === 'doctor' ? '2px solid var(--primary-teal)' : '2px solid #ccc', borderRadius: '8px', transition: 'all 0.2s', backgroundColor: userType === 'doctor' ? '#f0fdfb' : 'transparent' }}>
              <input
                type="radio"
                name="userType"
                value="doctor"
                checked={userType === 'doctor'}
                onChange={(e) => { console.log('Changed to:', e.target.value); setUserType('doctor'); }}
                style={{ cursor: 'pointer', width: '18px', height: '18px', accentColor: 'var(--primary-teal)' }}
              />
              <span className="user-type-text" style={{ fontWeight: userType === 'doctor' ? '600' : '400' }}>Doctor</span>
            </label>
          </div>
        </div>
        
        <form onSubmit={handleFirebaseLogin}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="login-button">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          {error && (
            <div className="error-message" style={{
              color: '#e74c3c',
              backgroundColor: '#fadbd8',
              padding: '10px',
              borderRadius: '8px',
              marginTop: '10px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}
        </form>

        <div className="login-footer">
          <p>
            Don't have an account?{' '}
            <a onClick={() => { goTo('signup'); }} className="signup-link">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
