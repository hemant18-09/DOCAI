// Centralized API base URL configuration
// Falls back to the deployed Render backend; override with VITE_API_BASE_URL for other environments
const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || 'https://docai-backend-8ze0.onrender.com').replace(/\/$/, '')

const API_BASE = `${API_ORIGIN}/api`

export { API_ORIGIN, API_BASE }
export default API_BASE
