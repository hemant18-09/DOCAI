import { useState, useEffect } from 'react'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth } from '../config/firebase'
import API_BASE from '../config/api'

export default function LoginView({ goTo }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginAs, setLoginAs] = useState('patient') // patient | doctor
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [signupNotice, setSignupNotice] = useState('')

  // Show one-time signup success message
  useEffect(() => {
    const flag = localStorage.getItem('signupSuccess')
    const emailPrefill = localStorage.getItem('signupEmail')

    if (flag) {
      setSignupNotice('Successfully signed up! Please log in to continue.')
      if (emailPrefill) setEmail(emailPrefill)
      localStorage.removeItem('signupSuccess')
      localStorage.removeItem('signupEmail')
    }
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!auth) {
      setError('Firebase is not configured.')
      setLoading(false)
      return
    }

    try {
      // 1️⃣ Firebase authentication
      const cred = await signInWithEmailAndPassword(auth, email, password)
      const idToken = await cred.user.getIdToken()

      // 2️⃣ Ask backend who this user really is
      const res = await fetch(`${API_BASE}/auth/login/firebase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.detail || 'Login failed')
      }

      const backendRole = data.userType // doctor | patient

      // 3️⃣ HARD BLOCK role mismatch
      if (backendRole !== loginAs) {
        await signOut(auth)
        setError(
          `This account is registered as ${backendRole}. Please login as ${backendRole}.`
        )
        setLoading(false)
        return
      }

      // 4️⃣ Save session
      localStorage.setItem('user', JSON.stringify(data.user))
      localStorage.setItem('firebaseUid', data.firebaseUid)
      localStorage.setItem('userType', backendRole)

      setLoading(false)

      // 5️⃣ FINAL REDIRECT (this is the important part)
      if (backendRole === 'doctor') {
        goTo('provider-portal') // ✅ Doctor Portal ONLY
      } else {
        goTo('home') // ✅ Patient Portal ONLY
      }
    } catch (err) {
      console.error(err)
      setError(err.message || 'Authentication failed')
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Welcome Back</h1>
        <p className="login-subtitle">Sign in to your DocAI account</p>

        {signupNotice && (
          <div
            style={{
              background: '#eafaf1',
              color: '#1e8449',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '16px',
            }}
          >
            {signupNotice}
          </div>
        )}

        {/* Login As */}
        <div className="user-type-section">
          <p className="user-type-label">Login as:</p>
          <div className="user-type-options">
            <label className="user-type-option">
              <input
                type="radio"
                checked={loginAs === 'patient'}
                onChange={() => setLoginAs('patient')}
              />
              Patient
            </label>

            <label className="user-type-option">
              <input
                type="radio"
                checked={loginAs === 'doctor'}
                onChange={() => setLoginAs('doctor')}
              />
              Doctor
            </label>
          </div>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="login-button">
            {loading ? 'Signing in…' : 'Sign In'}
          </button>

          {error && (
            <div
              style={{
                marginTop: '12px',
                background: '#fadbd8',
                color: '#c0392b',
                padding: '10px',
                borderRadius: '8px',
                textAlign: 'center',
              }}
            >
              {error}
            </div>
          )}
        </form>

        <div className="login-footer">
          Don’t have an account?{' '}
          <span onClick={() => goTo('signup')} className="signup-link">
            Sign up
          </span>
        </div>
      </div>
    </div>
  )
}
