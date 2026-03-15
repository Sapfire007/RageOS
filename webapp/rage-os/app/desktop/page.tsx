// Stitch prompt: "A full-screen macOS-inspired desktop environment: top menu bar (dark/translucent) showing OS name on left, time+bug-level indicator on right. Desktop grid of application icons in center. Windows taskbar at the bottom. Windows appear as floating cards. Background is user-selected wallpaper. Top bar shows a corrupted username and red badge for bug level."
'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useBugEngine } from '@/lib/bug-context'
import ApplicationIcon from '@/components/ApplicationIcon'
import WindowManager, { AppId } from '@/components/WindowManager'
import CrashScreen from '@/components/CrashScreen'
import RebootAnimation from '@/components/RebootAnimation'
import PaymentPopup from '@/components/PaymentPopup'
import Taskbar from '@/components/Taskbar'
import WallpaperPicker, { resolveWallpaper } from '@/components/WallpaperPicker'
import MremeNotch from '@/components/MremeNotch'
import AutonomousVirusSimulation from '@/components/AutonomousVirusSimulation'
import DesktopCorruptionOverlay from '@/components/DesktopCorruptionOverlay'
import { useKeyboardCrash } from '@/hooks/useKeyboardCrash'
import { useRecoveryMode } from '@/hooks/useRecoveryMode'
import { getVirusFiles } from '@/lib/virus-generator'

interface OpenWindow {
  id: string
  appId: AppId
  title: string
}

const DESKTOP_APPS = [
  { appId: 'ai-analyzer' as AppId, name: '', icon: '🔬', variant: 'normal' as const },
  { appId: 'notes' as AppId, name: '', icon: '📝', variant: 'normal' as const },
  { appId: 'chatbot' as AppId, name: '', icon: '🤖', variant: 'normal' as const },
  { appId: 'settings' as AppId, name: '', icon: '⚙️', variant: 'normal' as const },
  { appId: 'recycle-bin' as AppId, name: '', icon: '🗑️', variant: 'normal' as const },
  { appId: 'virus-executor' as AppId, name: '', icon: '☣️', variant: 'normal' as const },
  { appId: 'emotional-companion' as AppId, name: '', icon: '😈', variant: 'normal' as const },
  { appId: 'scam-mail' as AppId, name: '', icon: '📧', variant: 'normal' as const },
  { appId: 'browser' as AppId, name: '', icon: '🌐', variant: 'normal' as const },
  { appId: 'stonks' as AppId, name: '', icon: '📈', variant: 'normal' as const },
  { appId: 'task-manager' as AppId, name: '', icon: '📊', variant: 'normal' as const },
  { appId: 'unfair-tictactoe' as AppId, name: '', icon: '🎮', variant: 'normal' as const },
  { appId: 'triage' as AppId, name: '', icon: '🏥', variant: 'normal' as const },
]

export default function DesktopPage() {
  const router = useRouter()
  const { userId, user } = useAuth()
  const { bugLevel, bugTier } = useBugEngine()

  const [windows, setWindows] = useState<OpenWindow[]>([])
  const [crashed, setCrashed] = useState(false)
  const [rebooting, setRebooting] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [showWallpaperPicker, setShowWallpaperPicker] = useState(false)
  const [wallpaper, setWallpaper] = useState('default')
  const [time, setTime] = useState('')
  const [virusFiles, setVirusFiles] = useState<Array<{ id: string; filename: string }>>([])
  const [showUpdateBanner, setShowUpdateBanner] = useState(true)
  const [displayName, setDisplayName] = useState('User')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [autonomousVirusShow, setAutonomousVirusShow] = useState(false)
  const [autonomousVirusName, setAutonomousVirusName] = useState('')
  const [virusExecutionCount, setVirusExecutionCount] = useState(0)
  const paymentIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [requiresInteraction, setRequiresInteraction] = useState(false)
  
  // Load wallpaper + displayName + avatar from localStorage (client-only to avoid hydration mismatch)
  useEffect(() => {
    const saved = localStorage.getItem('rage_os_wallpaper') ?? 'default'
    setWallpaper(saved)
    const name = localStorage.getItem('rage_os_name') ?? user?.corrupted_name ?? user?.name ?? 'User'
    setDisplayName(name)
    setAvatarUrl(localStorage.getItem('rage_os_avatar'))
    
    // Load virus execution count
    let execCount = parseInt(localStorage.getItem('rage_virus_exec_count') ?? '0', 10)
    
    // Check if page reloaded while a virus was pending payload
    const pendingVirusType = localStorage.getItem('rage_last_virus_type')
    const pendingVirusName = localStorage.getItem('rage_last_virus_name')
    if (pendingVirusType && pendingVirusName) {
      execCount += 1
      localStorage.setItem('rage_virus_exec_count', String(execCount))
      setAutonomousVirusName(pendingVirusName)
      setAutonomousVirusShow(true)
      localStorage.removeItem('rage_last_virus_type')
      localStorage.removeItem('rage_last_virus_name')
    }
    
    setVirusExecutionCount(execCount)

    if (localStorage.getItem('rage_os_crashed') === 'true') {
      setCrashed(true)
    }
  }, [user?.corrupted_name, user?.name])

  function applyWallpaper(value: string) {
    setWallpaper(value)
    localStorage.setItem('rage_os_wallpaper', value)
  }

  // Clock
  useEffect(() => {
    function tick() {
      setTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  // Redirect if no user
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const uid = localStorage.getItem('rage_os_user_id')
      if (!uid) router.replace('/setup')
    }
  }, [router])

  // Play startup sound on mount
  useEffect(() => {
    const hasPlayed = sessionStorage.getItem('rage_os_startup_played')
    if (hasPlayed) return;

    const audio = new Audio('/sound/startup_sound.mp3')
    audio.volume = 0.5
    
    const tryPlay = async () => {
        try {
            await audio.play()
            sessionStorage.setItem('rage_os_startup_played', 'true')
        } catch (err) {
            console.warn('Startup sound auto-play blocked. Enforcing lock screen.')
            setRequiresInteraction(true)
        }
    }
    
    tryPlay();
    
    // Cleanup not strictly necessary for audio.play() returning, but good practice
  }, [])

  function handleDesktopLogin() {
    setRequiresInteraction(false)
    const audio = new Audio('/sound/startup_sound.mp3')
    audio.volume = 0.5
    audio.play().catch(console.error)
    sessionStorage.setItem('rage_os_startup_played', 'true')
    
    // Auto-fullscreen on login
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(console.error)
      }
    } catch (e) {
      console.error('Fullscreen request failed:', e)
    }
  }

  // Load virus files
  useEffect(() => {
    if (!userId) return
    getVirusFiles(userId).then((files) => setVirusFiles(files as Array<{ id: string; filename: string }>))
  }, [userId])

  // Payment popup every 120 seconds (but NOT when Reality Check is open)
  useEffect(() => {
    // Don't show payment popup if Reality Check window is open
    const hasRealityCheckOpen = windows.some(w => w.appId === 'emotional-companion')
    
    if (hasRealityCheckOpen) {
      setShowPayment(false)
      return
    }
    
    paymentIntervalRef.current = setInterval(() => {
      setShowPayment(true)
    }, 120_000)
    // Show first popup after 30s for demo (but only if Reality Check not open)
    const firstTimer = setTimeout(() => {
      if (!windows.some(w => w.appId === 'emotional-companion')) {
        setShowPayment(true)
      }
    }, 30_000)
    return () => {
      if (paymentIntervalRef.current) clearInterval(paymentIntervalRef.current)
      clearTimeout(firstTimer)
    }
  }, [windows])

  // Crash handler
  const handleCrash = useCallback(() => {
    if (userId) {
      import('@/lib/supabase').then(({ supabase }) => {
        supabase.from('users').update({ total_crashes: (user?.total_crashes ?? 0) + 1 }).eq('id', userId)
      })
    }
    setCrashed(true)
    localStorage.setItem('rage_os_crashed', 'true')
  }, [userId, user?.total_crashes])

  // Reboot handler
  const handleReboot = useCallback(() => {
    setCrashed(false)
    localStorage.removeItem('rage_os_crashed')
    setRebooting(true)
  }, [])

  // Reboot complete handler
  const handleRebootComplete = useCallback(() => {
    setRebooting(false)
    setWindows([])
  }, [])

  useKeyboardCrash(handleCrash)
  useRecoveryMode(userId)

  // Listen for wallpaper picker request from Settings
  useEffect(() => {
    function handleOpenWallpaper() { setShowWallpaperPicker(true) }
    window.addEventListener('rage-open-wallpaper', handleOpenWallpaper)
    return () => window.removeEventListener('rage-open-wallpaper', handleOpenWallpaper)
  }, [])

  function openApp(appId: AppId, title: string) {
    // Limit to 4 windows at once
    if (windows.length >= 4) return
    setWindows((prev) => [...prev, { id: crypto.randomUUID(), appId, title }])
  }

  function closeWindow(instanceId: string) {
    // Check if Virus Lab is closing and a virus was recently executed
    const closingWindow = windows.find((w) => w.id === instanceId)
    if (closingWindow && closingWindow.appId === 'virus-executor') {
      const lastVirusType = localStorage.getItem('rage_last_virus_type')
      const lastVirusName = localStorage.getItem('rage_last_virus_name')
      if (lastVirusType && lastVirusName) {
        // Increment execution count and trigger autonomous execution sequence
        const newCount = virusExecutionCount + 1
        setVirusExecutionCount(newCount)
        localStorage.setItem('rage_virus_exec_count', String(newCount))
        
        setAutonomousVirusName(lastVirusName)
        setAutonomousVirusShow(true)
        // Clear the stored flag so it only plays once per close
        localStorage.removeItem('rage_last_virus_type')
        localStorage.removeItem('rage_last_virus_name')
      }
    }
    setWindows((prev) => prev.filter((w) => w.id !== instanceId))
  }

  if (rebooting) return <RebootAnimation onComplete={handleRebootComplete} />
  if (crashed) return <CrashScreen errorCode="RAGE_EXCEPTION_0x4A" onReboot={handleReboot} />

  if (requiresInteraction) {
    return (
      <div 
        className="w-screen h-screen flex flex-col items-center justify-center relative select-none"
        style={resolveWallpaper(wallpaper)}
      >
         <div className="absolute inset-0 bg-black/50 backdrop-blur-xl" />
         <div className="z-10 flex flex-col items-center animate-in fade-in zoom-in duration-700">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="User Avatar" className="w-32 h-32 rounded-full border-4 border-white/20 mb-6 object-cover shadow-2xl" />
            ) : (
              <div className="w-32 h-32 rounded-full border-4 border-white/20 mb-6 bg-white/10 flex items-center justify-center text-4xl shadow-2xl">ðŸ‘¤</div>
            )}
            <h1 className="text-white text-4xl font-semibold mb-1 tracking-tight">{displayName}</h1>
            <p className="text-white/60 text-sm mb-10">RageOS is locked</p>
            <button 
                onClick={handleDesktopLogin}
                className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md border border-white/20 hover:border-white/40 transition-all font-medium text-lg flex items-center gap-3 shadow-lg group"
            >
                Log In
                <span className="group-hover:translate-x-1 transition-transform">â†’</span>
            </button>
         </div>
      </div>
    )
  }

  return (
    <div
      className="w-screen h-screen overflow-hidden relative select-none"
      style={resolveWallpaper(wallpaper)}
    >
      {/* Top Menu Bar */}
      <div
        className="absolute top-0 left-0 right-0 h-9 flex items-center px-4 justify-between z-50"
        style={{ background: 'rgba(30,30,30,0.85)', backdropFilter: 'blur(12px)' }}
      >
        <div className="flex items-center gap-3">
          <span className="text-white font-semibold text-sm">💻 RageOS</span>
          <span className="text-white/40 text-xs">File</span>
          <span className="text-white/40 text-xs">Edit</span>
          <span className="text-white/40 text-xs">Help</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Bug level indicator */}
          <div className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
            bugTier === 'EXTREME' ? 'bg-red-500/80 text-white' :
            bugTier === 'HIGH' ? 'bg-orange-500/80 text-white' :
            bugTier === 'MEDIUM' ? 'bg-yellow-500/80 text-black' :
            'bg-white/10 text-white/70'
          }`}>
            🐛 {bugLevel}
          </div>
          <span className="text-white/70 text-xs truncate max-w-30">{displayName}</span>
          {avatarUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt="avatar"
              className="w-6 h-6 rounded-full object-cover border border-white/20"
            />
          )}
          <span className="text-white/60 text-xs">{time}</span>
        </div>
      </div>

      {/* mreme — MacBook-style notch at top-center */}
      <MremeNotch />

      {/* Update Banner */}
      {showUpdateBanner && (
        <div className="absolute top-9 left-0 right-0 bg-[#007aff] text-white text-xs py-1.5 px-4 flex items-center justify-between z-40">
          <span>🔔 RageOS 14.2.1 is available. Update requires 47 restarts and your firstborn.</span>
          <button onClick={() => setShowUpdateBanner(false)} className="text-white/70 hover:text-white ml-4">✕</button>
        </div>
      )}

      {/* Desktop Icons Grid */}
      <div
        className="absolute grid gap-6 pt-4 z-20"
        style={{
          top: showUpdateBanner ? 80 : 52,
          left: 24,
          gridTemplateColumns: 'repeat(auto-fill, 80px)',
          maxWidth: 340,
        }}
      >
        {DESKTOP_APPS.map((app) => (
          <ApplicationIcon
            key={app.appId}
            id={app.appId}
            name={app.name}
            icon={app.icon}
            variant={app.variant}
            onClick={() => openApp(app.appId, app.name)}
          />
        ))}
        {/* Virus files hidden from desktop as per user request
        {virusFiles.map((v) => (
          <ApplicationIcon
            key={v.id}
            id={v.id}
            name={v.filename}
            icon="☣️"
            variant="virus"
            onClick={() => openApp('virus-executor', 'Virus Lab')}
          />
        ))} 
        */}
      </div>

      {/* Window Manager — fixed windows render relative to viewport */}
      <WindowManager windows={windows} onClose={closeWindow} />

      {/* Payment Popup */}
      <PaymentPopup
        userId={userId ?? null}
        open={showPayment}
        onClose={() => setShowPayment(false)}
      />

      {/* jew.png — fixed bottom-left of screen when payment popup is open */}
      {showPayment && (
        <img
          src="/media/jew.png"
          alt=""
          className="fixed bottom-0 left-0 w-72 h-72 object-contain pointer-events-none select-none"
          style={{ zIndex: 60 }}
        />
      )}

      {/* Wallpaper Picker */}
      {showWallpaperPicker && (
        <WallpaperPicker
          current={wallpaper}
          onApply={applyWallpaper}
          onClose={() => setShowWallpaperPicker(false)}
        />
      )}

      {/* Autonomous Virus Simulation — shows when Virus Lab closes after execution */}
      <AutonomousVirusSimulation
        show={autonomousVirusShow}
        virusName={autonomousVirusName}
        executionCount={virusExecutionCount}
        onComplete={() => setAutonomousVirusShow(false)}
      />

      {/* Desktop Corruption Overlay — progressive visual effects based on execution count */}
      <DesktopCorruptionOverlay executionCount={virusExecutionCount} />

      {/* Max windows notice */}
      {windows.length >= 4 && (
        <div className="absolute bottom-14 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full z-50">
          Maximum windows reached. Close one first.
        </div>
      )}

      {/* Taskbar */}
      <Taskbar
        windows={windows}
        userName={displayName}
        bugLevel={bugLevel}
        bugTier={bugTier}
        time={time}
        onOpenApp={openApp}
        onShowWallpaperPicker={() => setShowWallpaperPicker(true)}
      />
    </div>
  )
}
