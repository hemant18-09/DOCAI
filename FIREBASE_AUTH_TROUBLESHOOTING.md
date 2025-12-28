# Firebase Auth Troubleshooting Checklist

## ✅ Step 1: Check Backend URL Configuration

### Frontend (React)
Your backend URL is defined in `frontend/src/config/api.js`:

```javascript
const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || 'https://docai-backend-8ze0.onrender.com').replace(/\/$/, '')
const API_BASE = `${API_ORIGIN}/api`
```

### Vercel Environment Variables
Set in **Vercel Dashboard → Project Settings → Environment Variables**:

```
VITE_API_BASE_URL=https://docai-backend-8ze0.onrender.com
```

**❗ DO NOT USE:**
- `http://localhost:5000` (local dev only)
- Empty or missing values
- URLs without `https://`

### Quick Test
Open this in your browser:
```
https://docai-backend-8ze0.onrender.com/health
```

Expected response: `{"status": "ok", "message": "Backend server is running"}`

If it fails → **Backend is not running or URL is wrong**

---

## ✅ Step 2: Verify Backend Route Exists

Your backend has the login route at:
```python
@router.post("/login/firebase")  # Located in backend/routes/auth.py line 93
async def login_with_firebase(authorization: Optional[str] = Header(None)):
    """Login using Firebase ID token from Authorization header."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    ...
```

The full endpoint path:
```
POST https://docai-backend-8ze0.onrender.com/api/auth/login/firebase
```

### How Frontend Calls It
Both frontend and bootstrap use:
```javascript
const response = await fetch(`${API_BASE}/auth/login/firebase`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${idToken}`
  }
})
```

**If route is missing → Frontend will always fail with 404**

---

## ✅ Step 3: Check Render Backend Logs (MOST IMPORTANT)

### How to View Logs
1. Go to **Render Dashboard**
2. Click on your backend service: `docai-backend-8ze0`
3. Click **"Logs"** tab
4. In frontend, attempt login
5. Watch Render logs in real-time

### What to Look For

**Good response (200 OK):**
```
POST /api/auth/login/firebase 200
```

**Common errors:**

| Error | Cause | Fix |
|-------|-------|-----|
| `401 Unauthorized` | Token is invalid or Firebase not initialized | See Step 4 |
| `Missing or invalid Authorization header` | Frontend not sending Bearer token | Check frontend code |
| `Firebase Auth not available` | Firebase Admin SDK not initialized | See Step 4 |
| `CORS error` | Backend CORS not allowing Vercel origin | See Step 5 |

---

## ✅ Step 4: Firebase Admin SDK Setup (CRITICAL)

### Current Setup
Your backend correctly initializes Firebase Admin in `backend/config/firebase.py`:

```python
import firebase_admin
from firebase_admin import credentials

try:
    # Prefer env var path; fallback to bundled file
    env_creds_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    bundled_path = Path(__file__).parent.parent / "config" / "serviceAccountKey.json"

    cred = None
    if env_creds_path and Path(env_creds_path).exists():
        cred = credentials.Certificate(env_creds_path)
    elif bundled_path.exists():
        cred = credentials.Certificate(str(bundled_path))

    if cred:
        if not firebase_admin._apps:
            firebase_admin.initialize_app(cred)
        print("✓ Firebase Firestore connected successfully")
```

Token verification in `backend/routes/auth.py`:
```python
from firebase_admin import auth as firebase_auth

decoded = firebase_auth.verify_id_token(token)  # Line 107
uid = decoded.get("uid")
email = decoded.get("email")
```

### For Render Deployment
You **MUST** provide Firebase credentials to Render:

#### Option A: Environment Variable (Recommended)
1. Get your `serviceAccountKey.json` from Firebase Console
2. In **Render Dashboard → Environment**:
   - Name: `GOOGLE_APPLICATION_CREDENTIALS`
   - Value: (paste entire JSON content or set path)

#### Option B: Upload File
1. In **Render → Files**, upload `serviceAccountKey.json`
2. Backend will find it at `backend/config/serviceAccountKey.json`

**If credentials are missing → Firebase verification will fail with 503**

---

## ✅ Step 5: CORS Middleware Configuration

Your backend correctly implements CORS in `backend/main.py`:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://docai1.vercel.app"],  # Your Vercel frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Current settings:**
- ✅ Only allows `https://docai1.vercel.app`
- ✅ Credentials enabled
- ✅ All methods and headers allowed
- ❌ NOT `allow_origins=["*"]` with credentials (security risk)

**If CORS is wrong → Browser will show CORS error in Network tab, fetch fails silently**

---

## 🔍 How to Confirm Everything Works

### 1. Open DevTools Network Tab
- **Browser → F12 → Network**

### 2. Go to Login Page
- Navigate to `https://docai1.vercel.app`
- Try to login

### 3. Look for `/auth/login/firebase` Request
- Filter: `login/firebase`

### 4. Check Response Status

| Status | Meaning |
|--------|---------|
| **200** | ✅ Success! User authenticated |
| **401** | Token invalid or missing header |
| **403** | Token verification failed |
| **404** | Route doesn't exist |
| **500** | Backend error (check Render logs) |
| **CORS error** | Frontend can't reach backend |

### 5. Check Response Body
Should contain:
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "...",
    "name": "...",
    "email": "...",
    "role": "patient"
  }
}
```

---

## Quick Checklist

- [ ] `VITE_API_BASE_URL` set in Vercel to `https://docai-backend-8ze0.onrender.com`
- [ ] Backend URL is HTTPS, not HTTP
- [ ] `GET /health` works: `https://docai-backend-8ze0.onrender.com/health`
- [ ] Backend route `/api/auth/login/firebase` exists (status 200 when called)
- [ ] Firebase credentials (`GOOGLE_APPLICATION_CREDENTIALS`) set in Render
- [ ] CORS allows `https://docai1.vercel.app`
- [ ] Frontend sends `Authorization: Bearer <token>` header
- [ ] Render logs show `200 OK` when you try to login
- [ ] DevTools Network tab shows `200` for login request
- [ ] Response body contains `"success": true`

---

## Still Not Working?

1. **Check Render Logs First** → Most common issue is Firebase not initialized
2. **Check Vercel Env Vars** → `VITE_API_BASE_URL` must be set
3. **Test Backend URL** → Can you reach `/health` endpoint?
4. **Check Frontend Console** → Any JavaScript errors?
5. **Verify Bearer Header** → Network tab should show `Authorization: Bearer ...`
