/**
 * Signals Utility - Fetch symptom and context signals from Firestore
 */

import API_BASE from '../config/api'

export async function getSignals() {
  try {
    const response = await fetch(`${API_BASE}/signals/`)
    if (!response.ok) throw new Error('Failed to fetch signals')
    const data = await response.json()
    return data.data || {}
  } catch (error) {
    console.error('Error fetching signals:', error)
    return { symptomSignals: {}, contextSignals: {} }
  }
}

export async function getSymptomCategory(category) {
  try {
    const response = await fetch(`${API_BASE}/signals/symptom/${category}`)
    if (!response.ok) throw new Error(`Failed to fetch ${category} symptoms`)
    const data = await response.json()
    return data.symptoms || []
  } catch (error) {
    console.error(`Error fetching ${category} symptoms:`, error)
    return []
  }
}

export async function getContextCategory(category) {
  try {
    const response = await fetch(`${API_BASE}/signals/context/${category}`)
    if (!response.ok) throw new Error(`Failed to fetch ${category} contexts`)
    const data = await response.json()
    return data.contexts || []
  } catch (error) {
    console.error(`Error fetching ${category} contexts:`, error)
    return []
  }
}

export async function initializeSignals() {
  try {
    const response = await fetch(`${API_BASE}/signals/init`, { method: 'POST' })
    if (!response.ok) throw new Error('Failed to initialize signals')
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error initializing signals:', error)
    return null
  }
}

export async function updateSignals(symptomSignals, contextSignals) {
  try {
    const response = await fetch(`${API_BASE}/signals/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symptomSignals, contextSignals })
    })
    if (!response.ok) throw new Error('Failed to update signals')
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error updating signals:', error)
    return null
  }
}

// English + Hindi + Telugu emergency signals (extensible)
export const SYMPTOM_SIGNALS = {
  cardiac: [
    { text: "chest pain", lang: "en" },
    { text: "crushing chest", lang: "en" },
    { text: "pain in left arm", lang: "en" },
    { text: "jaw pain", lang: "en" },
    { text: "heart attack", lang: "en" },
    { text: "tightness in chest", lang: "en" },

    { text: "सीने में दर्द", lang: "hi" },
    { text: "दिल का दौरा", lang: "hi" },
    { text: "बाएं हाथ में दर्द", lang: "hi" },
    { text: "छाती में जकड़न", lang: "hi" },

    { text: "ఛాతిలో నొప్పి", lang: "te" },
    { text: "గుండె నొప్పి", lang: "te" },
    { text: "హృదయాఘాతం", lang: "te" },
  ],

  neurological: [
    "slurred speech",
    "stroke",
    "seizure",
    "arm weakness",

    "बोलने में कठिनाई",
    "लकवा",
    "दौरा",

    "మాట తడబడటం",
    "పక్షవాతం",
    "ఫిట్స్",
  ],

  respiratory: [
    { text: "shortness of breath", lang: "en" },
    { text: "cannot breathe", lang: "en" },
    { text: "gasping for air", lang: "en" },

    { text: "सांस लेने में कठिनाई", lang: "hi" },
    { text: "सांस नहीं आ रही", lang: "hi" },

    { text: "శ్వాస తీసుకోవడంలో ఇబ్బంది", lang: "te" },
    { text: "ఊపిరి రావడం లేదు", lang: "te" },
  ],

  bleeding: [
    "heavy bleeding",
    "vomiting blood",

    "बहुत ज्यादा खून बहना",
    "खून की उल्टी",

    "అధిక రక్తస్రావం",
    "రక్త వాంతులు",
  ],

  trauma: [
    "car accident",
    "head injury",

    "कार दुर्घटना",
    "सिर में चोट",

    "రోడ్డు ప్రమాదం",
    "తల గాయం",
  ],
};

export const CONTEXT_SIGNALS = {
  sudden: ["sudden", "अचानक", "అకస్మాత్తుగా"],
  worsening: ["getting worse", "बढ़ रहा है", "మరింత ఎక్కువవుతోంది"],
  exertion: ["walking", "exercise", "चलते समय", "నడుస్తున్నప్పుడు"],
  duration: ["for hours", "कई घंटों से", "గంటలుగా"],
};
