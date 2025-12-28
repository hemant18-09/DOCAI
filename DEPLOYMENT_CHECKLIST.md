# 🚀 Deployment Checklist - Is Your App Ready?

## Current Deployment Status

**Frontend:** Vercel (`https://docai1.vercel.app`)  
**Backend:** Render (`https://docai-backend-8ze0.onrender.com`)

---

## ⚠️ CRITICAL: Things You MUST Configure

Your app **WILL NOT WORK** without these steps:

### 🔴 1. Vercel Environment Variables (REQUIRED)

Go to: **Vercel Dashboard → docai1 → Settings → Environment Variables**

Add these **8 variables** (Production & Preview):

```bash
# Firebase Web SDK (REQUIRED - get from Firebase Console)
VITE_FIREBASE_API_KEY=your_actual_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Backend API (already correct)
VITE_API_BASE_URL=https://docai-backend-8ze0.onrender.com
```

**If you don't set Firebase variables:**
- ❌ Login will fail
- ❌ Signup will fail
- ❌ You'll see: "Firebase is not configured" error

**How to get Firebase values:**
1. Go to https://console.firebase.google.com
2. Select your project → ⚙️ Settings → Project settings
3. Under "Your apps" → Web app → Copy the config values

---

### 🔴 2. Render Environment Variables (REQUIRED)

Go to: **Render Dashboard → docai-backend-8ze0 → Environment**

Add this **1 variable**:

```bash
# Firebase Admin SDK credentials (REQUIRED for token verification)
GOOGLE_APPLICATION_CREDENTIALS=/etc/secrets/serviceAccountKey.json
```

**OR** if you have the JSON content directly:

```bash
# Option 2: Paste the entire JSON
GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account","project_id":"your-project",...}
```

**If you don't set this:**
- ❌ Login will fail with "Firebase Auth not available"
- ❌ Token verification will fail (503 error)

**How to get Firebase Admin credentials:**
1. Firebase Console → Project Settings → Service accounts
2. Click "Generate new private key"
3. Download the JSON file
4. In Render, either:
   - Upload as a secret file, OR
   - Paste JSON content into env var

---

## ✅ Already Configured (No Action Needed)

These are already set correctly in your code:

### ✅ CORS Configuration
```python
# backend/main.py - Line 26-32
allow_origins=["https://docai1.vercel.app"]  # ✅ Correct
```

### ✅ API Base URL
```javascript
// frontend/src/config/api.js
const API_ORIGIN = import.meta.env.VITE_API_BASE_URL || 'https://docai-backend-8ze0.onrender.com'
// ✅ Defaults to your Render URL
```

### ✅ Authorization Header
```javascript
// Frontend sends Bearer token correctly
headers: {
  'Authorization': `Bearer ${idToken}`  // ✅ Correct
}
```

### ✅ Backend Route
```python
# backend/routes/auth.py - Line 93
@router.post("/login/firebase")  # ✅ Route exists
```

---

## 🧪 Quick Test - Will It Work?

### Step 1: Test Backend Health
Open this URL in browser:
```
https://docai-backend-8ze0.onrender.com/health
```

**Expected:** `{"status":"ok","message":"Backend server is running"}`

**If it fails:**
- ❌ Backend is not deployed
- ❌ Wait a few minutes (Render free tier sleeps after inactivity)

---

### Step 2: Test Frontend
Open:
```
https://docai1.vercel.app
```

**Expected scenarios:**

#### ✅ If Firebase vars are set:
- You see the login page
- No errors in console (F12)

#### ❌ If Firebase vars are NOT set:
- You see: "⚙️ Configuration Required"
- Message: "Firebase environment variables are not configured"

---

### Step 3: Test Login
1. Open https://docai1.vercel.app
2. Try to login with:
   - Email: `rohit.singh@email.com`
   - Password: `rohit123`

**What should happen:**

#### ✅ SUCCESS:
- Redirects to home page
- No errors in DevTools (F12)
- Network tab shows `/auth/login/firebase` → Status 200

#### ❌ FAILURE Scenarios:

| Error | Cause | Fix |
|-------|-------|-----|
| "Firebase is not configured" | Vercel env vars missing | Add Firebase vars to Vercel |
| "Failed to fetch" | Backend URL wrong | Check `VITE_API_BASE_URL` in Vercel |
| 401 Unauthorized | Firebase Admin not initialized | Add `GOOGLE_APPLICATION_CREDENTIALS` to Render |
| 503 Service Unavailable | Backend sleeping or crashed | Wait 30 sec, refresh, or check Render logs |
| CORS error | CORS misconfigured | Already fixed, redeploy backend |

---

## 🎯 Deployment Checklist

Copy this checklist and complete each item:

### Vercel (Frontend)
- [ ] **Project deployed** to Vercel
- [ ] **Root directory** set to `frontend`
- [ ] **8 Firebase env vars** added to Vercel (VITE_FIREBASE_*)
- [ ] **VITE_API_BASE_URL** set to `https://docai-backend-8ze0.onrender.com`
- [ ] **Redeployed** after adding env vars
- [ ] **Tested**: Open https://docai1.vercel.app → No "Configuration Required" error

### Render (Backend)
- [ ] **Project deployed** to Render
- [ ] **Python runtime** selected
- [ ] **Root directory** set to `backend`
- [ ] **GOOGLE_APPLICATION_CREDENTIALS** env var added
- [ ] **Redeployed** after adding env var
- [ ] **Tested**: Open https://docai-backend-8ze0.onrender.com/health → Status 200

### Integration Test
- [ ] Open frontend URL
- [ ] Login with test credentials (rohit.singh@email.com / rohit123)
- [ ] Check Network tab → `/auth/login/firebase` status 200
- [ ] Successfully redirected to home page

---

## 🔥 Common Mistakes

### ❌ Mistake 1: Forgot to redeploy after adding env vars
**Fix:** Vercel/Render → Deployments → Redeploy

### ❌ Mistake 2: Used `http://` instead of `https://`
**Fix:** All URLs must be HTTPS in production

### ❌ Mistake 3: Firebase vars set in Preview but not Production
**Fix:** Set env vars for **both** Production AND Preview in Vercel

### ❌ Mistake 4: Copy-pasted Firebase vars with quotes
**Fix:** Use raw values, not: `"YOUR_API_KEY"` (wrong), use: `YOUR_API_KEY` (correct)

### ❌ Mistake 5: Backend sleeping on Render free tier
**Fix:** First request takes 30-60 seconds to wake up, this is normal

---

## 📊 Final Answer: Will It Work?

### ✅ YES - If You Complete All Steps Above

Your app is **correctly configured** in the codebase. It will work perfectly **IF**:
1. ✅ You add Firebase env vars to Vercel
2. ✅ You add Firebase Admin credentials to Render
3. ✅ Both services are deployed and redeployed after env vars

### ❌ NO - If You Skip Environment Variables

Without environment variables, the app **cannot work** because:
- Frontend can't authenticate users (no Firebase SDK)
- Backend can't verify tokens (no Firebase Admin)

---

## 🆘 If It Still Doesn't Work

Follow this debugging order:

1. **Check [FIREBASE_AUTH_TROUBLESHOOTING.md](FIREBASE_AUTH_TROUBLESHOOTING.md)** for detailed debugging steps
2. **Open Render Logs** and look for errors when you try to login
3. **Open Browser DevTools (F12)** → Network tab → Look for red requests
4. **Test backend health endpoint** → Should return 200 OK
5. **Verify all env vars are saved** in Vercel and Render dashboards

---

## ✨ Expected Working Flow

When everything is configured correctly:

1. User visits `https://docai1.vercel.app`
2. Sees login page (no configuration error)
3. Enters email/password
4. Frontend calls Firebase Auth → Gets ID token
5. Frontend sends token to `https://docai-backend-8ze0.onrender.com/api/auth/login/firebase`
6. Backend verifies token with Firebase Admin
7. Backend returns user profile
8. Frontend stores user data and redirects to home
9. ✅ **SUCCESS**

---

## 📚 Additional Resources

- **Setup:** [VERCEL_SETUP.md](VERCEL_SETUP.md)
- **Troubleshooting:** [FIREBASE_AUTH_TROUBLESHOOTING.md](FIREBASE_AUTH_TROUBLESHOOTING.md)
- **Test Credentials:** [CREDENTIALS.md](CREDENTIALS.md)
- **API Reference:** [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
