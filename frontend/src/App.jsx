import { useState, useEffect } from 'react'
import { auth } from './config/firebase'
import API_BASE from './config/api'
import { MessageProvider } from './context/MessageContext'
import './App.css'
import LoginView from './views/LoginView.jsx'
import HomeView from './views/HomeView.jsx'
import TriageView from './views/TriageView.jsx'
import SlotsView from './views/SlotsView.jsx'
import RxUploadView from './views/PrescriptionUploadView.jsx'
import RxAnalysisView from './views/RxAnalysisView.jsx'
import MedsView from './views/MedsView.jsx'
import DoctorView from './views/DoctorView.jsx'
import StoresView from './views/StoresView.jsx'
import RecordsView from './views/RecordsView.jsx'
import SignupView from './views/SignupView.jsx'
import ChatView from './views/ChatView.jsx'
import ProviderPortalView from './views/ProviderPortalView.jsx'

// Check if Firebase is configured
const isFirebaseConfigured = !!auth

function ViewSection({ id, name, currentView, children }) {
  const className =
    'view-section' + (currentView === name ? ' active-view' : '')
  return (
    <section id={id} className={className}>
      {children}
    </section>
  )
}

function App() {
  const [view, setView] = useState('login')
  const [showIntro, setShowIntro] = useState(true)
  const [animationStep, setAnimationStep] = useState(0)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    if (!showIntro) return
    
    const timings = [
      800,   // Step 0: D appears
      1200,  // Step 1: D slides left, full DocAI appears
      1000,  // Step 2: Tagline appears
      1000   // Step 3: Transition to header
    ]

    const timeoutId = setTimeout(() => {
      if (animationStep < timings.length) {
        setAnimationStep(animationStep + 1)
      } else {
        setShowIntro(false)
      }
    }, timings[animationStep])

    return () => clearTimeout(timeoutId)
  }, [animationStep, showIntro])

  // Bootstrap login state from Firebase session or localStorage
  useEffect(() => {
    if (!auth) {
      console.warn('[App Bootstrap] Firebase not configured; skipping auth listener')
      return
    }

    console.log('[App Bootstrap] Checking auth state...')
    const existing = localStorage.getItem('user')
    if (existing) {
      console.log('[App Bootstrap] Found existing user in localStorage')
      setIsLoggedIn(true)
      return
    }

    // Listen for Firebase auth state changes
    console.log('[App Bootstrap] Setting up Firebase auth listener')
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      console.log('[App Bootstrap] Auth state changed:', user ? `User: ${user.email}` : 'No user')
      if (user) {
        try {
          console.log('[App Bootstrap] Getting ID token...')
          const idToken = await user.getIdToken()
          console.log('[App Bootstrap] Calling backend /api/auth/login/firebase')
          const response = await fetch(`${API_BASE}/auth/login/firebase`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`
            }
          })
          const data = await response.json()
          console.log('[App Bootstrap] Backend response:', data)
          if (response.ok && data.success) {
            console.log('[App Bootstrap] Storing user in localStorage')
            localStorage.setItem('user', JSON.stringify(data.user))
            localStorage.setItem('userType', data.userType)
            localStorage.setItem('firebaseUid', data.firebaseUid)
            setIsLoggedIn(true)
          } else {
            console.error('[App Bootstrap] Backend login failed:', data)
          }
        } catch (e) {
          console.warn('Login bootstrap failed:', e)
        }
      }
    })

    return () => unsubscribe()
  }, [])

  const desktopNavClass = (name) =>
    `nav-link${view === name ? ' active' : ''}`

  const mobileNavClass = (name) =>
    `mobile-nav-item${view === name ? ' active' : ''}`

  const goTo = (name) => {
    setView(name)
  }

  const handleAvatarClick = () => {
    if (isLoggedIn) {
      // Navigate to profile page (if it exists)
      goTo('profile')
    } else {
      // Navigate to signup page
      goTo('signup')
    }
  }

  return (
    <>
      {!isFirebaseConfigured && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: '#f5f5f5',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h1 style={{ fontSize: '28px', marginBottom: '10px' }}>⚙️ Configuration Required</h1>
          <p style={{ fontSize: '16px', color: '#666', maxWidth: '500px', lineHeight: '1.6' }}>
            Firebase environment variables are not configured. 
            <br/><br/>
            <strong>Local Development:</strong> Create <code>frontend/.env.local</code> with <code>VITE_FIREBASE_*</code> values
            <br/><br/>
            <strong>Vercel/Render Deployment:</strong> Add environment variables in your dashboard (see .env.example)
            <br/><br/>
            <a href="https://github.com/hemant18-09/DOCAI" style={{ color: '#0070f3', textDecoration: 'none' }}>Docs</a>
          </p>
        </div>
      )}
      
      {isFirebaseConfigured && (
      <MessageProvider>
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
      {view !== 'doctor' && view !== 'provider-portal' && (
        <header className="header">
          <div className="header-logo-section">
            <div className="logo">
              <img 
                src="/docai-logo.svg" 
                alt="DOC-AI Logo" 
                className="logo-image"
                loading="eager"
                fetchpriority="high"
                onError={(e) => { e.currentTarget.src = '/docai-logo-fallback.svg' }}
              />
              <span className="logo-text-animated">DocAI</span>
            </div>
            <button
              className="profile-icon-btn"
              title={isLoggedIn ? "Profile Settings" : "Sign Up"}
              onClick={handleAvatarClick}
              aria-label="Profile"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </button>
          </div>
        </header>
      )

      {view === 'doctor' ? (
          <DoctorView goTo={goTo} />
        ) : view === 'provider-portal' ? (
          <ProviderPortalView />
        ) : (
        <main className="main-container">
          <ViewSection
            id="view-login"
            name="login"
            currentView={view}
          >
            <LoginView goTo={goTo} />
          </ViewSection>

        <ViewSection
          id="view-home"
          name="home"
          currentView={view}
        >
          <HomeView
            goTo={goTo}
          />
        </ViewSection>

        <ViewSection
          id="view-triage"
          name="triage"
          currentView={view}
        >
          <TriageView goTo={goTo} />
        </ViewSection>

        <ViewSection
          id="view-slots"
          name="slots"
          currentView={view}
        >
          <SlotsView goTo={goTo} />
        </ViewSection>

        <ViewSection
          id="view-rx-upload"
          name="rx-upload"
          currentView={view}
        >
          <RxUploadView goTo={goTo} />
        </ViewSection>

        <ViewSection
          id="view-rx-analysis"
          name="rx-analysis"
          currentView={view}
        >
          <RxAnalysisView goTo={goTo} />
        </ViewSection>

        <ViewSection
          id="view-meds"
          name="meds"
          currentView={view}
        >
          <MedsView />
        </ViewSection>

        {/* DoctorView is rendered standalone when active */}

        <ViewSection
          id="view-stores"
          name="stores"
          currentView={view}
        >
          <StoresView />
        </ViewSection>

        <ViewSection
          id="view-records"
          name="records"
          currentView={view}
        >
          <RecordsView goTo={goTo} />
        </ViewSection>

        <ViewSection
          id="view-chat"
          name="chat"
          currentView={view}
        >
          <ChatView goTo={goTo} />
        </ViewSection>

        <ViewSection
          id="view-signup"
          name="signup"
          currentView={view}
        >
          <SignupView goTo={goTo} />
        </ViewSection>
        </main>
      )}

      {view !== 'doctor' && view !== 'provider-portal' && (
        <nav className="mobile-bottom-nav">
        <a
          className={mobileNavClass('home')}
          onClick={() => goTo('home')}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span>Home</span>
        </a>
        <a
          className={mobileNavClass('meds')}
          onClick={() => goTo('meds')}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10.5 20.5l10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7z"></path>
            <path d="M8.5 8.5l7 7"></path>
          </svg>
          <span>Meds</span>
        </a>
        <a
          className={mobileNavClass('stores')}
          onClick={() => goTo('stores')}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 9l2-5h14l2 5"></path>
            <path d="M21 9v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9"></path>
            <path d="M9 22v-8h6v8"></path>
          </svg>
          <span>Stores</span>
        </a>
        <a
          className={mobileNavClass('records')}
          onClick={() => goTo('records')}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          <span>Records</span>
        </a>
        <a
          className={mobileNavClass('chat')}
          onClick={() => goTo('chat')}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
          <span>Messages</span>
        </a>
        </nav>
      )}
      </MessageProvider>
      )}
    </>
  )
}

export default App





