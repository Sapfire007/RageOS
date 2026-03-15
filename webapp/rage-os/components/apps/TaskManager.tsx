'use client'
import { useState, useRef, useEffect } from 'react'

const TROLL_SONGS = [
  { name: 'Charlie Kirk - We Are', file: 'we_are_charlie_kirk.mp3' },
  { name: 'Oi Oi Oi', file: 'oi_oi_oi_oi_eye_eye_me.mp3' },
  { name: 'Epstein', file: 'epstein-kidnapped-me-when-i-was-11_zl0hWU0.mp3' }
]

export default function TaskManager() {
  const [activeTab, setActiveTab] = useState('CPU')
  
  // Assign a random song to each tab when component mounts
  const [tabSongs] = useState(() => {
    const songs: Record<string, string> = {}
    const tabsList = ['CPU', 'RAM', 'Disk', 'GPU', 'Ethernet']
    tabsList.forEach(tab => {
        songs[tab] = TROLL_SONGS[Math.floor(Math.random() * TROLL_SONGS.length)].file
    })
    return songs
  })

  const [isPlaying, setIsPlaying] = useState(false)
  
  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyzerRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const audioElRef = useRef<HTMLAudioElement | null>(null)
  const reqFrameRef = useRef<number>(0)
  const startAttemptedRef = useRef(false)
  
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const cpuHistoryRef = useRef<number[]>(new Array(100).fill(0))
  const memHistoryRef = useRef<number[]>(new Array(100).fill(0))
  const diskHistoryRef = useRef<number[]>(new Array(100).fill(0))
  const gpuHistoryRef = useRef<number[]>(new Array(100).fill(0))

  useEffect(() => {
    let mounted = true
    
    // Fallback attempt to play if browser restricted auto-play
    const startAudio = async () => {
      if (!audioElRef.current || !mounted) return
      
      try {
        if (!audioCtxRef.current) {
          const AudioContext = window.AudioContext || (window as any).webkitAudioContext
          if (!AudioContext) return
          audioCtxRef.current = new AudioContext()
          analyzerRef.current = audioCtxRef.current.createAnalyser()
          analyzerRef.current.fftSize = 256
          
          sourceRef.current = audioCtxRef.current.createMediaElementSource(audioElRef.current)
          sourceRef.current.connect(analyzerRef.current)
          analyzerRef.current.connect(audioCtxRef.current.destination)
        }

        if (audioCtxRef.current.state === 'suspended') {
            await audioCtxRef.current.resume()
        }

        audioElRef.current.volume = 0.5
        const playPromise = audioElRef.current.play()
        if (playPromise !== undefined) {
            playPromise.then(() => {
                if (mounted) setIsPlaying(true)
            }).catch(err => {
                console.warn('Auto-play blocked, wait for user click.', err)
            })
        }
      } catch (err) {
        console.warn('Audio setup error', err)
      }
    }

    const handleInitialClick = () => {
      startAudio()
    }
    
    // Auto-start timer
    const initTimer = setTimeout(() => {
      if (!startAttemptedRef.current) {
         startAttemptedRef.current = true
         startAudio()
      }
    }, 150)
    
    // We bind to the whole document capturing just in case WindowManager steals focus
    document.addEventListener('mousedown', handleInitialClick, { capture: true })

    return () => {
      mounted = false
      clearTimeout(initTimer)
      document.removeEventListener('mousedown', handleInitialClick, { capture: true })
      
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {})
      }
      
      // Null out refs for strict mode
      audioCtxRef.current = null
      analyzerRef.current = null
      sourceRef.current = null
    }
  }, []) // Run only once

  useEffect(() => {
    const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number, color: string) => {
      ctx.strokeStyle = '#1e3a8a'
      ctx.lineWidth = 1
      ctx.beginPath()
      for(let x = 0; x < width; x += 30) {
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
      }
      for(let y = 0; y < height; y += 30) {
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
      }
      ctx.stroke()
    }

    const drawGraph = (
      canvas: HTMLCanvasElement | null, 
      history: number[], 
      color: string, 
      fillColor: string
    ) => {
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const width = canvas.width
      const height = canvas.height

      ctx.clearRect(0, 0, width, height)
      drawGrid(ctx, width, height, color)

      ctx.beginPath()
      ctx.moveTo(0, height)

      const step = width / (history.length - 1)
      for (let i = 0; i < history.length; i++) {
        const value = history[i] / 255 
        const y = height - (value * height)
        ctx.lineTo(i * step, y)
      }

      ctx.lineTo(width, height)
      ctx.closePath()

      ctx.fillStyle = fillColor
      ctx.fill()

      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.stroke()
    }

    const updateVisualizer = () => {
      if (analyzerRef.current && isPlaying) {
        const bufferLength = analyzerRef.current.frequencyBinCount
        const dataArray = new Uint8Array(bufferLength)
        analyzerRef.current.getByteFrequencyData(dataArray)

        let lowSum = 0, midSum = 0, highSum = 0, highestSum = 0
        
        // Focus on active frequencies (bins 0 to 50 out of ~128)
        // This ensures GPU and Disk graphs actually get reactive data
        for(let i=0; i<51; i++) {
            if (i < 6) lowSum += dataArray[i]         // Bass
            else if (i < 16) midSum += dataArray[i]   // Low-Mid
            else if (i < 31) highSum += dataArray[i]  // Mid
            else highestSum += dataArray[i]           // High
        }

        const cpuVal = Math.min(255, (lowSum / 6) * 1.2)
        const memVal = Math.min(255, (midSum / 10) * 1.5)
        const diskVal = Math.min(255, (highSum / 15) * 1.8)
        const gpuVal = Math.min(255, (highestSum / 20) * 2.4)

        cpuHistoryRef.current.push(cpuVal)
        cpuHistoryRef.current.shift()

        memHistoryRef.current.push(memVal)
        memHistoryRef.current.shift()

        diskHistoryRef.current.push(diskVal)
        diskHistoryRef.current.shift()

        gpuHistoryRef.current.push(gpuVal)
        gpuHistoryRef.current.shift()
      } else {
        cpuHistoryRef.current.push(0)
        cpuHistoryRef.current.shift()
        memHistoryRef.current.push(0)
        memHistoryRef.current.shift()
        diskHistoryRef.current.push(0)
        diskHistoryRef.current.shift()
        gpuHistoryRef.current.push(0)
        gpuHistoryRef.current.shift()
      }

      const currentTab = document.getElementById('taskman-current-tab')?.innerText || 'CPU'
      
      if (currentTab === 'CPU') {
          drawGraph(canvasRef.current, cpuHistoryRef.current, '#3b82f6', 'rgba(59, 130, 246, 0.2)')
      } else if (currentTab === 'RAM') {
          drawGraph(canvasRef.current, memHistoryRef.current, '#8b5cf6', 'rgba(139, 92, 246, 0.2)')
      } else if (currentTab === 'Disk') {
          drawGraph(canvasRef.current, diskHistoryRef.current, '#10b981', 'rgba(16, 185, 129, 0.2)')
      } else if (currentTab === 'GPU') {
          drawGraph(canvasRef.current, gpuHistoryRef.current, '#ef4444', 'rgba(239, 68, 68, 0.2)')
      } else {
          drawGraph(canvasRef.current, cpuHistoryRef.current, '#f59e0b', 'rgba(245, 158, 11, 0.2)')
      }

      reqFrameRef.current = requestAnimationFrame(updateVisualizer)
    }

    reqFrameRef.current = requestAnimationFrame(updateVisualizer)
    
    return () => cancelAnimationFrame(reqFrameRef.current)
  }, [isPlaying]) // Re-run if playing state changes for safety

  useEffect(() => {
    // When switching tabs, ensure the new song plays immediately if we are already playing
    if (isPlaying && audioElRef.current) {
        audioElRef.current.play().catch(err => console.warn('Tab switch play err', err))
    }
  }, [activeTab, isPlaying])

  const TABS = ['CPU', 'RAM', 'Disk', 'GPU', 'Ethernet']

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white font-sans text-sm selection:bg-blue-500/30 relative">
        
      <span id="taskman-current-tab" className="hidden">{activeTab}</span>
      
      <audio 
        ref={audioElRef} 
        src={`/trollsongplayer/${tabSongs[activeTab]}`} 
        loop
        autoPlay={isPlaying}
      />

      {!isPlaying && (
          <div 
             className="absolute inset-0 z-[999] bg-slate-900/90 flex flex-col items-center justify-center cursor-pointer backdrop-blur-md"
             onClick={(e) => {
                // Prevent bubbling so window manager doesn't steal focus aggressively
                e.stopPropagation();
                const ev = new Event('mousedown');
                document.dispatchEvent(ev);
             }}
          >
              <div className="text-blue-400 mb-4 animate-pulse">
                 <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </div>
              <p className="text-2xl font-light tracking-widest text-white">
                  INITIALIZE TELEMETRY
              </p>
              <p className="text-slate-400 text-xs mt-3 font-mono opacity-60">
                  Awaiting authorization to bypass data restrictions...
              </p>
          </div>
      )}

      <div className="flex items-center gap-4 px-2 py-2 border-b border-slate-700 bg-slate-800 text-xs shadow-md z-10 w-full overflow-x-auto">
        {TABS.map(tab => (
            <div 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 cursor-pointer rounded-t ${
                    activeTab === tab 
                    ? 'origin-bottom bg-slate-900 border-b-2 border-blue-400 font-semibold' 
                    : 'hover:bg-slate-700 text-slate-400'
                }`}
            >
                {tab}
            </div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-slate-900">
        
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 h-full flex flex-col min-h-[350px]">
            <div className="flex justify-between items-start mb-2">
                <div className="flex flex-col">
                    <span className="text-xl font-light">{activeTab}</span>
                    <span className="text-slate-400 text-xs mt-1">% Utilization</span>
                </div>
                <div className="text-3xl font-light tracking-tight" style={{
                    color: activeTab === 'CPU' ? '#60a5fa' : 
                           activeTab === 'RAM' ? '#a78bfa' : 
                           activeTab === 'Disk' ? '#34d399' : 
                           activeTab === 'GPU' ? '#f87171' : '#fbbf24'
                }}>
                    {(Math.random() * 10 + 90).toFixed(1)}%
                </div>
            </div>
            
            <div className="w-full h-48 md:h-64 relative border border-slate-700 bg-slate-950 flex-none">
                <canvas ref={canvasRef} width={800} height={250} className="w-full h-full" />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 text-xs text-slate-400">
                {activeTab === 'CPU' && (
                    <>
                        <div>Utilization<br/><span className="text-white text-base">{(Math.random()*10+90).toFixed(0)}%</span></div>
                        <div>Speed<br/><span className="text-white text-base">4.20 GHz</span></div>
                        <div>Processes<br/><span className="text-white text-base">420</span></div>
                        <div>Threads<br/><span className="text-white text-base">1337</span></div>
                    </>
                )}
                {activeTab === 'RAM' && (
                    <>
                        <div>In use (Compressed)<br/><span className="text-white text-base">31.9 GB</span></div>
                        <div>Available<br/><span className="text-white text-base">0.1 GB</span></div>
                        <div>Committed<br/><span className="text-white text-base">36.1/40.0 GB</span></div>
                        <div>Cached<br/><span className="text-white text-base">1.2 GB</span></div>
                    </>
                )}
                {activeTab === 'Disk' && (
                    <>
                        <div>Active time<br/><span className="text-white text-base">100%</span></div>
                        <div>Read speed<br/><span className="text-white text-base">999 MB/s</span></div>
                        <div>Write speed<br/><span className="text-white text-base">999 MB/s</span></div>
                        <div>Capacity<br/><span className="text-white text-base">2.0 TB</span></div>
                    </>
                )}
                {activeTab === 'GPU' && (
                    <>
                        <div>Utilization<br/><span className="text-white text-base">99%</span></div>
                        <div>GPU Memory<br/><span className="text-white text-base">24.0 GB</span></div>
                        <div>Temperature<br/><span className="text-white text-base">95°C</span></div>
                        <div>Power<br/><span className="text-white text-base">450W</span></div>
                    </>
                )}
                {activeTab === 'Ethernet' && (
                    <>
                        <div>Send<br/><span className="text-white text-base">{(Math.random()*100).toFixed(1)} Kbps</span></div>
                        <div>Receive<br/><span className="text-white text-base">{(Math.random()*100).toFixed(1)} Kbps</span></div>
                        <div>Adapter<br/><span className="text-white text-base">Intel(R) 2.5GbE</span></div>
                        <div>Status<br/><span className="text-white text-base">Connected</span></div>
                    </>
                )}
            </div>
        </div>
      </div>
    </div>
  )
}
