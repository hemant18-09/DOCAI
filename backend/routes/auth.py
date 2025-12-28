from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional
from database.users import find_user_by_email, find_all_doctors, find_all_patients, create_user

# Optional Firebase Auth
try:
    from firebase_admin import auth as firebase_auth  # type: ignore
    from config import firebase as firebase_cfg  # exposes firebase_connected
except Exception:
    firebase_auth = None
    firebase_cfg = None

router = APIRouter()

class LoginRequest(BaseModel):
    email: str
    password: str

class SignupRequest(BaseModel):
    id: str
    name: str
    email: str
    role: str
    phone: str = ""
    bloodGroup: str = None
    age: int = None
    specialization: str = None

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    role: str
    specialization: str = None

@router.post("/signup")
async def signup(request: SignupRequest):
    """Create a new user account and store in Firestore."""
    try:
        # Check if user already exists
        existing_user = await find_user_by_email(request.email)
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Prepare user data
        user_data = {
            "id": request.id,
            "name": request.name,
            "email": request.email,
            "role": request.role,
            "phone": request.phone
        }
        
        # Add role-specific fields
        if request.role == "patient":
            user_data["bloodGroup"] = request.bloodGroup
            user_data["age"] = request.age
        elif request.role == "doctor":
            user_data["specialization"] = request.specialization or "General Physician"
        
        # Save to Firestore
        created_user = await create_user(user_data)
        
        if not created_user:
            raise HTTPException(status_code=500, detail="Failed to create user")
        
        # Remove sensitive data before returning
        user_response = {k: v for k, v in created_user.items() if k != "password"}
        
        return {
            "success": True,
            "message": "Account created successfully",
            "user": user_response
        }
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Signup error: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/login")
async def login(request: LoginRequest):
    """Firebase ID token login (email/password deprecated)."""
    raise HTTPException(
        status_code=400,
        detail="Use POST /api/auth/login/firebase with Firebase ID token instead"
    )

@router.post("/login/firebase")
async def login_with_firebase(authorization: Optional[str] = Header(None)):
    """Login using Firebase ID token from Authorization header. Returns matched user profile by email if available."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

    if not firebase_auth:
        raise HTTPException(status_code=503, detail="Firebase Auth not available")

    token = authorization.split("Bearer ")[1]

    try:
        decoded = firebase_auth.verify_id_token(token)
        email = decoded.get("email")
        uid = decoded.get("uid")
        name = decoded.get("name") or ""

        user = await find_user_by_email(email) if email else None
        if user:
            user_copy = {k: v for k, v in user.items() if k != "password"}
            return {
                "success": True,
                "message": "Login successful",
                "user": user_copy,
                "userType": user_copy.get("role", "user"),
                "firebaseUid": uid,
            }
        else:
            # Return minimal profile from Firebase token
            return {
                "success": True,
                "message": "Login successful (Firebase)",
                "user": {
                    "id": uid,
                    "name": name,
                    "email": email,
                    "phone": "",
                    "role": "user",
                },
                "userType": "user",
                "firebaseUid": uid,
            }
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid or expired Firebase ID token")

@router.get("/doctors")
async def get_doctors():
    """Get all doctors from Firestore."""
    try:
        doctors = await find_all_doctors()
        # Remove passwords
        doctors_clean = [{k: v for k, v in d.items() if k != "password"} for d in doctors]
        return {
            "success": True,
            "doctors": doctors_clean
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/patients")
async def get_patients():
    """Get all patients from Firestore."""
    try:
        patients = await find_all_patients()
        # Remove passwords
        patients_clean = [{k: v for k, v in p.items() if k != "password"} for p in patients]
        return {
            "success": True,
            "patients": patients_clean
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")
