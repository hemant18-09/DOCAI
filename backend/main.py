from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import sys
from pathlib import Path

load_dotenv()

# Ensure repository root is importable
ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.append(str(ROOT_DIR))

# Initialize Firebase Admin (optional)
try:
    from config import firebase  # triggers initialization
except Exception as e:
    print("Firebase init skipped:", e)

app = FastAPI()

# ✅ FINAL CORS CONFIG (DEV + PROD SAFE)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://docai1.vercel.app",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",  # preview deployments
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
from routes.auth import router as auth_router
from routes.messages import router as messages_router
from routes.symptoms import router as symptoms_router
from routes.signals import router as signals_router

app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(messages_router, prefix="/api/messages", tags=["messages"])
app.include_router(symptoms_router, prefix="/api/health", tags=["health"])
app.include_router(signals_router, prefix="/api/signals", tags=["signals"])

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Backend server is running"}

@app.get("/api")
def api_root():
    return {"message": "DOC-AI Backend API"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 5000))
    uvicorn.run(app, host="0.0.0.0", port=port)
