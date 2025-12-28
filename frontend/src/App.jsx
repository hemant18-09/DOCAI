import { useState, useEffect } from 'react'
import { auth } from './config/firebase'
import API_BASE from './config/api'
import { MessageProvider } from './context/MessageContext'
import './App.css'

import LoginView from './views/LoginView.jsx'
import SignupView from './views/SignupView.jsx'
import PatientPortalView from './views/PatientPortalView.jsx'
import TriageView from './views/TriageView.jsx'
import SlotsView from './views/SlotsView.jsx'
import RxUploadView from './views/PrescriptionUploadView.jsx'
import RxAnalysisView from './views/RxAnalysisView.jsx'
import MedsView from './views/MedsView.jsx'
import StoresView from './views/StoresView.jsx'
import RecordsView from './views/RecordsView.jsx'
import ChatView from './views/ChatView.jsx'
import DoctorPortalView from './views/DoctorPortalView.jsx'

import PatientProfile from './components/PatientProfile.jsx'

// Firebase configured?
const isFirebaseConfigured = !!auth

function ViewSection({ name, currentView, children }) {
  return (
    <section className={`view-section ${currentView === name ? 'active-view' : ''}`}>
      {children}
    </section>
  )
}

function App() {
  const [view, setView] = useState('login')
  const [showIntro, setShowIntro] = useState(true)
  const [animationStep, setAnimationStep] = useState(0)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  /* ---------------- INTRO ANIMATION ---------------- */
  useEffect(() => {
    if (!showIntro) return
    const timings = [800, 1200, 1000, 1000]
    const timer = setTimeout(() => {
      if (animationStep < timings.length) {
        setAnimationStep(animationStep + 1)
      } else {
        setShowIntro(false)
      }
    }, timings[animationStep])
    return () => clearTimeout(timer)
  }, [animationStep, showIntro])

  /* ---------------- AUTH BOOTSTRAP ---------------- */
  useEffect(() => {
    if (!auth) return

    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setIsLoggedIn(true)
      setView('patient-portal')
      return
    }

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) return

      try {
        const idToken = await user.getIdToken()
        const res = await fetch(`${API_BASE}/auth/login/firebase`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
        })
        const data = await res.json()

        if (res.ok && data.success) {
          localStorage.setItem('user', JSON.stringify(data.user))
          localStorage.setItem('userType', data.userType)
          localStorage.setItem('firebaseUid', data.firebaseUid)
          setIsLoggedIn(true)
          setView('patient-portal')
        }
      } catch (e) {
        console.warn('Bootstrap login failed', e)
      }
    })

    return () => unsubscribe()
  }, [])

  const goTo = (name) => {
    setShowProfile(false)
    setView(name)
  }

  /* ---------------- PROFILE ICON ---------------- */
  const handleAvatarClick = () => {
  const user = localStorage.getItem('user')
  if (!user) return

  setShowProfile(true)
}

  const hideChrome = ['login', 'signup'].includes(view)

  return (
    <>
      {!isFirebaseConfigured && (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <h2>Firebase not configured</h2>
        </div>
      )}

      {isFirebaseConfigured && (
        <MessageProvider>

          {/* ---------------- INTRO ---------------- */}
          {showIntro && (
            <div className={`intro-screen ${animationStep >= 3 ? 'fade-out' : ''}`}>
              <div className="intro-content">
                <div className="intro-logo-container">
                  <span className={`intro-d ${animationStep >= 1 ? 'slide' : ''}`}>D</span>
                  <span className={`intro-full ${animationStep >= 1 ? 'show' : ''}`}>ocAI</span>
                </div>
                <div className={`intro-tagline ${animationStep >= 2 ? 'show' : ''}`}>
                  AI-assisted healthcare, designed for clarity and trust.
                </div>
              </div>
            </div>
          )}

          {/* ---------------- HEADER ---------------- */}
          {!hideChrome && view !== 'doctor-portal' && (
            <header className="header">
              <div className="header-logo-section">
                <div className="logo">
                  <img src="/docai-logo.svg" alt="DocAI" className="logo-image" />
                  <span className="logo-text-animated">DocAI</span>
                </div>

                <button className="profile-icon-btn" onClick={handleAvatarClick}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </button>
              </div>
            </header>
          )}

          {/* ---------------- PROFILE MODAL ---------------- */}
          {showProfile && (
            <PatientProfile
              onClose={() => setShowProfile(false)}
              goTo={goTo}
            />
          )}

          {/* ---------------- MAIN ---------------- */}
          {view === 'doctor-portal' ? (
            <DoctorPortalView />
          ) : (
            <main className="main-container">

              <ViewSection name="login" currentView={view}>
                <LoginView goTo={goTo} />
              </ViewSection>

              <ViewSection name="signup" currentView={view}>
                <SignupView goTo={goTo} />
              </ViewSection>

              <ViewSection name="patient-portal" currentView={view}>
                <PatientPortalView goTo={goTo} />
              </ViewSection>

              <ViewSection name="triage" currentView={view}>
                <TriageView goTo={goTo} />
              </ViewSection>

              <ViewSection name="slots" currentView={view}>
                <SlotsView goTo={goTo} />
              </ViewSection>

              <ViewSection name="rx-upload" currentView={view}>
                <RxUploadView goTo={goTo} />
              </ViewSection>

              <ViewSection name="rx-analysis" currentView={view}>
                <RxAnalysisView goTo={goTo} />
              </ViewSection>

              <ViewSection name="meds" currentView={view}>
                <MedsView />
              </ViewSection>

              <ViewSection name="stores" currentView={view}>
                <StoresView />
              </ViewSection>

              <ViewSection name="records" currentView={view}>
                <RecordsView goTo={goTo} />
              </ViewSection>

              <ViewSection name="chat" currentView={view}>
                <ChatView goTo={goTo} />
              </ViewSection>

            </main>
          )}

          {/* ---------------- MOBILE NAV ---------------- */}
          {!hideChrome && view !== 'doctor-portal' && isLoggedIn && (
            <nav className="mobile-bottom-nav">
              <a onClick={() => goTo('patient-portal')}>Patient</a>
              <a onClick={() => goTo('meds')}>Meds</a>
              <a onClick={() => goTo('stores')}>Stores</a>
              <a onClick={() => goTo('records')}>Records</a>
              <a onClick={() => goTo('chat')}>Chat</a>
            </nav>
          )}

        </MessageProvider>
      )}
    </>
  )
}

export default App
