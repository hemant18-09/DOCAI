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

    if (!auth) {
      setError('Firebase is not configured.')
      return
    }

    setError('')
    setLoading(true)

    // Validations
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

    if (userType === 'patient' && (!formData.bloodGroup || !formData.age)) {
      setError('Please fill all required fields')
      setLoading(false)
      return
    }

    try {
      // 1️⃣ Firebase signup
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      )

      const firebaseUid = userCredential.user.uid

      // 2️⃣ Backend payload
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
      } else {
        userData.specialization =
          formData.specialization || 'General Physician'
      }

      // 3️⃣ Save to backend
      const response = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      })

      await response.json() // we don't depend on success flag

      // ✅ SUCCESS → FORCE LOGOUT + REDIRECT
      if (response.ok) {
        try {
          await signOut(auth)
        } catch {}

        alert('Successfully signed up. Please login to continue.')
        goTo('login')
        return
      }

      setError('Signup failed')
      setLoading(false)

    } catch (err) {
      console.error('Signup error:', err)
      setError(err.message || 'Signup failed')
      setLoading(false)
    }
  }

  return (
    <div className="card home-hero-card">
      <h1 className="home-hero-title">Create Account</h1>
      <p className="card-subtitle">
        Sign up to get personalized healthcare assistance.
      </p>

      <div style={{ marginBottom: 20 }}>
        <p style={{ fontWeight: 600 }}>I am a:</p>
        <label>
          <input
            type="radio"
            checked={userType === 'patient'}
            onChange={() => setUserType('patient')}
          /> Patient
        </label>
        &nbsp;&nbsp;
        <label>
          <input
            type="radio"
            checked={userType === 'doctor'}
            onChange={() => setUserType('doctor')}
          /> Doctor
        </label>
      </div>

      {error && (
        <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>
      )}

      <form onSubmit={handleSignup}>
        <input name="name" placeholder="Full Name" onChange={handleChange} required />

        {userType === 'patient' && (
          <>
            <input name="bloodGroup" placeholder="Blood Group" onChange={handleChange} />
            <input name="age" type="number" placeholder="Age" onChange={handleChange} />
          </>
        )}

        {userType === 'doctor' && (
          <input
            name="specialization"
            placeholder="Specialization"
            onChange={handleChange}
          />
        )}

        <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
        <input name="confirmPassword" type="password" placeholder="Confirm Password" onChange={handleChange} required />

        <button type="submit" disabled={loading}>
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>
    </div>
  )
}

export default SignupView
