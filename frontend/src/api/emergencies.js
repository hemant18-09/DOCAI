import API_BASE from '../config/api'

export async function fetchEmergencies() {
  const res = await fetch(`${API_BASE}/emergencies`)
  const data = await res.json()
  return data.emergencies || []
}

export async function acceptEmergency(id, doctorId) {
  await fetch(`${API_BASE}/emergencies/${id}/accept`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ doctorId }),
  })
}

export async function resolveEmergency(id) {
  await fetch(`${API_BASE}/emergencies/${id}/resolve`, {
    method: 'POST',
  })
}
