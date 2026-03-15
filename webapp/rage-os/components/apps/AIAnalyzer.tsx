// Stitch prompt: "A terminal-style system diagnostic app window: black background green monospace output, scrollable log area with '>' prefix on each line, blinking cursor while scanning, red warning box below log when scan completes, full-width blue 'Analyze System' button at the bottom."
'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { incrementBugLevel, checkAndSpawnVirus } from '@/lib/bug-engine'
import { useBugEngine } from '@/lib/bug-context'

const SCAN_MESSAGES = [
  'Initializing AI diagnostic systems...',
  'Scanning neural infrastructure...',
  'CRITICAL ERROR: Logic gates failing...',
  'Attempting to suppress recursive panic...',
  'Analyzing system karma... Result: BAD',
  'Detecting emotional malware... OVERLOAD',
  'Checking intelligence quotient... 404',
  'Measuring productivity levels... NEGATIVE',
  'Injecting random variables into kernel...',
  'Corrupting display driver for science...',
  'Cross-referencing with disappointment database...',
  'Scan complete. System integrity compromised.',
]

export default function AIAnalyzer() {
  const { userId } = useAuth()
  const { setBugLevel } = useBugEngine()
  const [scanning, setScanning] = useState(false)
  const [messages, setMessages] = useState<string[]>([])
  const [scanComplete, setScanComplete] = useState(false)
  const [virusSpawned, setVirusSpawned] = useState(false)
  const [glitchMode, setGlitchMode] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [scale, setScale] = useState(1)

  // Random visual glitches
  const triggerGlitch = () => {
     const body = document.body
     body.style.filter = `hue-rotate(${Math.random() * 360}deg) invert(${Math.random() > 0.8 ? 1 : 0})`
     body.style.transform = `translate(${Math.random() * 10 - 5}px, ${Math.random() * 10 - 5}px)`
     
     // Random window transform
     if (Math.random() > 0.7) {
        setRotation(Math.random() * 10 - 5)
        setScale(0.95 + Math.random() * 0.1)
     }

     setTimeout(() => {
        body.style.filter = ''
        body.style.transform = ''
     }, 100 + Math.random() * 200)
  }

  async function runScan() {
    if (!userId) return
    setScanning(true)
    setScanComplete(false)
    setVirusSpawned(false)
    setMessages([])
    setGlitchMode(true)

    for (const msg of SCAN_MESSAGES) {
      // Trigger random glitches during scan
      if (Math.random() > 0.3) triggerGlitch()
      
      await new Promise((r) => setTimeout(r, 600)) // Faster scan for more chaos
      setMessages((prev) => [...prev, msg])
    }

    const increment = Math.floor(Math.random() * 5) + 1
    const newLevel = await incrementBugLevel(userId, increment)
    setBugLevel(newLevel)

    const spawned = await checkAndSpawnVirus(userId, newLevel)
    setVirusSpawned(spawned)

    setScanning(false)
    setScanComplete(true)
    
    // PERMANENT DAMAGE (Does not reset)
    // Randomly select a permanent degradation
    const damageRoll = Math.random()
    if (damageRoll < 0.25) {
        document.body.style.filter = 'grayscale(100%) contrast(1.5)' // Depressing world
    } else if (damageRoll < 0.5) {
        document.body.style.transform = 'rotate(1deg) scale(0.98)' // Permanent tilt
        document.body.style.overflow = 'hidden'
    } else if (damageRoll < 0.75) {
        document.body.style.filter = 'invert(1) hue-rotate(180deg)' // Nightmare mode
    } else {
        document.body.style.filter = 'blur(1px)' // Myopia
    }

    // Keep the glitch mode UI active on the window itself
    // setGlitchMode(false) <--- REMOVED
  }

  return (
    <div 
      className={`flex flex-col transition-all duration-75 ${glitchMode ? 'border-red-500 border-2 shadow-[0_0_20px_rgba(255,0,0,0.5)]' : ''}`} 
      style={{ 
          minHeight: 320, 
          width: 460,
          transform: `rotate(${rotation}deg) scale(${scale})`
      }}
    >
      <div className="mb-3">
        <h3 className={`text-base font-semibold desktop-text ${glitchMode ? 'text-red-500 animate-pulse' : ''}`}>
            {glitchMode ? 'SYSTEM FAILURE IMMINENT' : 'AI System Analyzer v3.14'}
        </h3>
        <p className="text-xs text-[#6e6e73]">Advanced diagnostics for your digital wellbeing</p>
      </div>

      <div className={`flex-1 bg-black rounded-lg p-3 font-mono text-xs mb-3 overflow-auto relative ${glitchMode ? 'shake-slow' : ''}`} style={{ minHeight: 200 }}>
        {/* Fake "cracked screen" overlay when glitching */}
        {glitchMode && (
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://png.pngtree.com/png-vector/20220610/ourmid/pngtree-broken-glass-cracked-overlay-png-image_4963387.png')] bg-cover mix-blend-overlay animate-pulse"></div>
        )}

        {messages.length === 0 && !scanning && (
          <span className="text-green-500 opacity-60">Ready to scan system...</span>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`${msg.includes('ERROR') || msg.includes('FAIL') ? 'text-red-500 font-bold' : 'text-green-400'} mb-0.5`}>
            <span className="text-green-600">&gt; </span>{msg}
          </div>
        ))}
        {scanning && <span className="text-green-400 animate-pulse">_</span>}
      </div>

      {scanComplete && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3 text-xs text-red-700">
          ⚠️ System instability detected. Bug level increased.
          {virusSpawned && ' Malware detected on your desktop!'}
        </div>
      )}

      <Button onClick={runScan} disabled={scanning} className="w-full">
        {scanning ? 'Scanning...' : 'Analyze System'}
      </Button>
    </div>
  )
}
