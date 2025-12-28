import firebase_admin
from firebase_admin import credentials, firestore
import os
import json
from pathlib import Path

# Firebase state
firebase_connected = False
db = None

try:
    cred = None

    # 1️⃣ BEST: Render / Production (ENV JSON)
    firebase_json = os.getenv("FIREBASE_ADMIN_JSON")
    if firebase_json:
        cred_dict = json.loads(firebase_json)
        cred = credentials.Certificate(cred_dict)
        print("✓ Using FIREBASE_ADMIN_JSON for Firebase Admin")

    # 2️⃣ Local dev fallback (optional)
    if not cred:
        bundled_path = Path(__file__).parent.parent / "config" / "serviceAccountKey.json"
        if bundled_path.exists():
            cred = credentials.Certificate(str(bundled_path))
            print("✓ Using local serviceAccountKey.json")

    # 3️⃣ Initialize Firebase Admin
    if not cred:
        raise RuntimeError("Firebase Admin credentials not found")

    if not firebase_admin._apps:
        firebase_admin.initialize_app(cred)

    db = firestore.client()
    firebase_connected = True
    print("✓ Firebase Firestore connected successfully")

except Exception as e:
    print("⚠ Firebase initialization failed")
    print(str(e))
    firebase_connected = False
    db = None
