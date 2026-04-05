import { useState, useRef } from 'react'
import { parseAPI, expensesAPI } from '@/services/api'

type VoiceState = 'idle' | 'listening' | 'processing' | 'confirmed'

const NEURO_IDLE = '12px 12px 24px rgba(0,0,0,0.5), -8px -8px 20px rgba(255,255,255,0.04), 0 0 0 2px rgba(124,58,237,0.3)'
const NEURO_PRESSED = 'inset 8px 8px 20px rgba(0,0,0,0.6), inset -4px -4px 12px rgba(255,255,255,0.03), 0 0 0 3px rgba(124,58,237,0.8)'

declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

export default function VoicePage() {
  const [state, setState] = useState<VoiceState>('idle')
  const [transcript, setTranscript] = useState('')
  const [parsed, setParsed] = useState<any>(null)
  const [toast, setToast] = useState('')
  const recRef = useRef<any>(null)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { showToast('Speech recognition not supported in this browser'); return }
    const rec = new SR()
    rec.lang = 'en-IN'
    rec.continuous = false
    rec.interimResults = true
    recRef.current = rec

    rec.onstart = () => setState('listening')
    rec.onresult = (e: any) => {
      const t = Array.from(e.results).map((r: any) => r[0].transcript).join('')
      setTranscript(t)
    }
    rec.onend = async () => {
      setState('processing')
      try {
        const res = await parseAPI.parse(transcript)
        setParsed(res.data)
        setState('confirmed')
      } catch {
        setState('idle')
        showToast('Parse failed. Try again.')
      }
    }
    rec.onerror = () => { setState('idle'); showToast('Microphone error') }
    rec.start()
  }

  const stopListening = () => { recRef.current?.stop() }

  const handleMic = () => {
    if (state === 'idle') startListening()
    else if (state === 'listening') stopListening()
    else if (state === 'confirmed') { setState('idle'); setTranscript(''); setParsed(null) }
  }

  const confirm = async () => {
    if (!parsed) return
    try {
      await expensesAPI.create({ amount: parsed.amount, category: parsed.category, description: parsed.description, date: parsed.date })
      showToast('Expense saved!')
      setState('idle'); setTranscript(''); setParsed(null)
    } catch { showToast('Failed to save. Try again.') }
  }

  const micBoxShadow = state === 'listening'
    ? NEURO_PRESSED
    : NEURO_IDLE

  const micAnimation = state === 'listening' ? 'purplePulse 1.5s ease-in-out infinite' : 'none'

  const stateLabel: Record<VoiceState, string> = {
    idle: 'Tap to speak',
    listening: 'Listening…',
    processing: 'Parsing…',
    confirmed: 'Tap to reset',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '70vh', justifyContent: 'center' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800, color: 'var(--bx-vivid)', marginBottom: 6 }}>Voice Entry</h1>
      <p style={{ fontSize: '13px', color: 'rgba(232,232,248,0.4)', marginBottom: 48, fontFamily: 'var(--font-display)' }}>Speak your expense naturally</p>

      {/* Mic button */}
      <div onClick={handleMic} style={{
        width: 160, height: 160, borderRadius: '50%',
        background: '#1A1A2E', boxShadow: micBoxShadow, animation: micAnimation,
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'box-shadow 300ms ease',
      }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
          stroke={state === 'listening' ? '#A78BFA' : state === 'processing' ? '#7C3AED' : 'rgba(232,232,248,0.6)'}
          strokeWidth="1.8">
          <rect x="9" y="2" width="6" height="12" rx="3"/>
          <path d="M5 10a7 7 0 0014 0"/>
          <line x1="12" y1="19" x2="12" y2="22"/>
          <line x1="9" y1="22" x2="15" y2="22"/>
        </svg>
      </div>

      <p style={{ marginTop: 24, fontSize: '12px', fontFamily: 'var(--font-display)', color: 'rgba(232,232,248,0.4)', letterSpacing: '0.04em' }}>{stateLabel[state]}</p>

      {/* Transcript */}
      {transcript && (
        <div style={{ marginTop: 16, fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'rgba(232,232,248,0.7)', maxWidth: 400, textAlign: 'center', lineHeight: 1.5 }}>
          "{transcript}"
        </div>
      )}

      {/* Confirmation card */}
      {state === 'confirmed' && parsed && (
        <div style={{
          marginTop: 32, background: 'var(--glass-bg)', backdropFilter: 'blur(20px)',
          border: '0.5px solid var(--bx-border)', borderRadius: 16, padding: '24px 28px',
          width: 340, animation: 'fadeIn 0.3s ease',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '26px', fontWeight: 700, color: '#F0F0FF' }}>₹{parsed.amount}</span>
            <span style={{ background: 'rgba(124,58,237,0.15)', color: '#A78BFA', borderRadius: 4, padding: '3px 10px', fontSize: '11px', fontWeight: 600, fontFamily: 'var(--font-display)' }}>{parsed.category}</span>
          </div>
          <div style={{ fontSize: '13px', color: 'rgba(232,232,248,0.7)', marginBottom: 4 }}>{parsed.description}</div>
          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(232,232,248,0.4)', marginBottom: 20 }}>{parsed.date}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => { setState('idle'); setTranscript(''); setParsed(null) }} style={{ flex: 1, padding: '8px', background: 'transparent', border: '0.5px solid rgba(232,232,248,0.15)', borderRadius: 8, color: 'rgba(232,232,248,0.5)', cursor: 'pointer', fontSize: '11px', fontFamily: 'var(--font-display)' }}>Cancel</button>
            <button onClick={confirm} style={{ flex: 2, padding: '8px', background: 'linear-gradient(135deg, #7C3AED, #4C1D95)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 600, fontFamily: 'var(--font-display)' }}>Confirm</button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: 'rgba(18,18,24,0.95)', border: '0.5px solid var(--bx-border)', borderRadius: 8, padding: '10px 20px', fontSize: '13px', color: '#F0F0FF', fontFamily: 'var(--font-display)', zIndex: 1000 }}>
          {toast}
        </div>
      )}
    </div>
  )
}
