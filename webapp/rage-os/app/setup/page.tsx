// Stitch prompt: "A multi-step onboarding page for a fake OS: centered white card with progress dots at the top (3 dots, current one highlighted blue), animated step transitions (slide from right). Minimal clean design, slightly rounded card with subtle shadow. Background is a soft gradient. Steps: 1 selfie, 2 name, 3 CAPTCHA."
'use client'
export const dynamic = 'force-dynamic'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import SelfieUpload from '@/components/SelfieUpload'
import WebcamCapture from '@/components/WebcamCapture'
import NameInput from '@/components/NameInput'
import ImpossibleCaptcha from '@/components/ImpossibleCaptcha'

export default function SetupPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Reset startup sound trigger so it plays again when going to desktop
    sessionStorage.removeItem('rage_os_startup_played')
  }, [])

  const [step, setStep] = useState(0)
  const [data, setData] = useState({
    gender: '',
    avatarUrl: '',
    name: '',
    corruptedName: '',
    password: '',
  })
  const existingUserRef = useRef<Record<string, unknown> | null>(null)
  // Always points at latest data so handleCaptcha gets the freshest corruptedName
  const dataRef = useRef(data)
  dataRef.current = data

  function handleSelfie(gender: string, _imageUrl: string) {
    const mediaAvatar = gender !== 'female' ? '/media/men.jpg' : '/media/women.jpg'
    setData((d) => ({ ...d, gender, avatarUrl: mediaAvatar }))
    setStep(1)
  }

  async function handleName(name: string, password: string) {
    // Check if user already exists in DB (3 s timeout)
    let existing: Record<string, unknown> | null = null
    try {
      const timeout = new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 3000)
      )
      // Query by name first, then require exact password match in JS.
      const query = supabase
        .from('users')
        .select('*')
        .eq('name', name)
        .limit(50)
        .then((r) => {
          if (r.error) console.error('[setup] login SELECT error:', r.error.message, JSON.stringify(r.error))
          if (r.error) return null
          const rows = Array.isArray(r.data) ? r.data : []
          // Only treat as existing on exact name+password match.
          const matched = rows.find((u) => u.password === password)
          return matched ?? null
        })
      existing = await Promise.race([query, timeout])
    } catch {
      // timeout or network error — treat as new user
    }

    // Always show CAPTCHA for both existing and new users.
    existingUserRef.current = existing
    setData((d) => ({ ...d, name, corruptedName: name, password }))
    setStep(2)

    if (!existing) {
      // Fire-and-forget: update corruptedName whenever AI responds for new users
      fetch('/api/dyslexify-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
        .then((r) => r.json())
        .then((json) => {
          if (json.dyslexicName) {
            setData((d) => ({ ...d, corruptedName: json.dyslexicName }))
          }
        })
        .catch(() => {/* keep original */})
    }
  }

  async function handleCaptcha() {
    const existing = existingUserRef.current
    if (existing) {
      localStorage.setItem('rage_os_user_id', existing.id as string)
      localStorage.setItem('rage_os_name', (existing.corrupted_name || existing.name) as string)
      const isMale = existing.gender !== 'female'
      localStorage.setItem('rage_os_avatar', isMale ? '/media/men.jpg' : '/media/women.jpg')
      localStorage.setItem('rage_os_wallpaper', isMale ? 'men-HD-wallpaper.jpg' : 'women-HD-wallpaper.jpg')

      try {
        const audio = new Audio('/sound/startup_sound.mp3')
        audio.volume = 0.5
        audio.play().catch(() => {})
      } catch (e) {}
      sessionStorage.setItem('rage_os_startup_played', 'true')

      try {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {})
        }
      } catch (e) {}

      router.push('/desktop')
      return
    }

    // Always read from ref so we get the dyslexified name even if AI resolved after step change
    const d = dataRef.current
    const userId = crypto.randomUUID()
    // Sanitise gender to only values allowed by the DB CHECK constraint
    const gender = d.gender === 'female' ? 'female' : d.gender === 'other' ? 'other' : 'male'
    const { error } = await supabase.from('users').insert({
      id: userId,
      name: d.name,
      corrupted_name: d.corruptedName || d.name,
      password: d.password,
      gender,
      bug_level: 0,
      total_crashes: 0,
      total_payments_attempted: 0,
      created_at: new Date().toISOString(),
    })
    if (error) console.error('[setup] DB insert error:', error.message, error.code, JSON.stringify(error))

    localStorage.setItem('rage_os_user_id', userId)
    localStorage.setItem('rage_os_name', d.corruptedName || d.name)
    const isMale = gender !== 'female'
    localStorage.setItem('rage_os_avatar', isMale ? '/media/men.jpg' : '/media/women.jpg')
    localStorage.setItem('rage_os_wallpaper', isMale ? 'men-HD-wallpaper.jpg' : 'women-HD-wallpaper.jpg')
    
    // Force play startup sound seamlessly during the click boundary
    try {
      const audio = new Audio('/sound/startup_sound.mp3')
      audio.volume = 0.5
      audio.play().catch(() => {})
    } catch(e) {}
    sessionStorage.setItem('rage_os_startup_played', 'true')
    
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {})
      }
    } catch(e) {}
    
    router.push('/desktop')
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'linear-gradient(135deg, #e8ecf0 0%, #d0d8e0 100%)' }}
    >
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm overflow-visible relative">
        {/* Step dots */}
        <div className="flex justify-center gap-2 mb-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === step ? 'w-6 bg-[#007aff]' : i < step ? 'w-2 bg-[#007aff]/40' : 'w-2 bg-black/15'
              }`}
            />
          ))}
        </div>

        <div style={{ minHeight: 360 }} className={step === 1 ? 'pt-8' : ''}>
          {step === 0 && <WebcamCapture onComplete={handleSelfie} />}
          {step === 1 && <NameInput avatarUrl={data.avatarUrl} onComplete={handleName} />}
          {step === 2 && <ImpossibleCaptcha onComplete={handleCaptcha} />}
        </div>
      </div>
    </div>
  )
}
