'use client'
import { useEffect, useState } from 'react'
import { incrementBugLevel } from '@/lib/bug-engine'
import { useAuth } from '@/lib/auth-context'

interface Props {
  show: boolean
  virusName: string
  executionCount: number
  onComplete: () => void
}

export default function AutonomousVirusSimulation({ show, virusName, executionCount, onComplete }: Props) {
  const { userId } = useAuth()
  const [output, setOutput] = useState<string[]>([])
  const [stage, setStage] = useState<'terminal' | 'glitch' | 'done'>('terminal')

  // Intensity multipliers based on execution count
  const isIntense = executionCount >= 4
  const isExtreme = executionCount >= 7
  const bugIncrement = Math.min(2 + Math.floor(executionCount / 2), 6)
  const shakeIntensity = isExtreme ? 'screen-shake-extreme' : isIntense ? 'screen-shake-intense' : 'screen-shake-intense'

  useEffect(() => {
    if (!show) {
      setOutput([])
      setStage('terminal')
      return
    }

    let timeout: NodeJS.Timeout

    // Stage 1: Terminal execution (1.5s)
    const terminalLines = [
      `[SYSTEM] Executing autonomous payload: ${virusName}`,
      '[PAYLOAD] Loading primary injection module...',
      '[+] Successfully loaded into memory space',
      ...(isIntense ? ['[PAYLOAD] Injecting deep kernel hooks...', '[+] Kernel memory corruption successful'] : []),
      '[PAYLOAD] Bypassing all defensive layers...',
      '[+] All protections disabled',
      '[PAYLOAD] Applying system-wide corruption...',
      ...(isExtreme ? ['[!] CRITICAL: Persistent process hooking active', '[!] CRITICAL: DLL entry point rewritten', '[+] Boot sector modifications pending'] : []),
      '[✓] PAYLOAD EXECUTED — System compromised autonomously',
    ]

    let lineIdx = 0
    const spamTerminal = setInterval(() => {
      if (lineIdx < terminalLines.length) {
        setOutput((prev) => [...prev, terminalLines[lineIdx]])
        lineIdx++
      } else {
        clearInterval(spamTerminal)
        
        // Trigger system effects: screen shake + increment bugs
        document.body.classList.add(shakeIntensity)
        setTimeout(() => document.body.classList.remove(shakeIntensity), isExtreme ? 400 : 300)
        
        // Add progressive bug levels based on execution count
        if (userId) {
          incrementBugLevel(userId, bugIncrement)
        }
        
        setStage('glitch')
        // Glitch phase: 800ms-1.2s based on intensity
        timeout = setTimeout(() => {
          setStage('done')
          setTimeout(() => onComplete(), isExtreme ? 500 : 300)
        }, isExtreme ? 600 : 400)
      }
    }, 80 - (isExtreme ? 30 : isIntense ? 15 : 0))

    return () => {
      clearInterval(spamTerminal)
      if (timeout) clearTimeout(timeout)
    }
  }, [show, virusName, userId, onComplete, isIntense, isExtreme, bugIncrement, shakeIntensity])

  if (!show) return null

  // Stage: Terminal
  if (stage === 'terminal') {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center z-9999"
        style={{ background: 'rgba(0,0,0,0.7)' }}
      >
        <div className="w-96 bg-black border-2 border-red-700 rounded-lg overflow-hidden shadow-2xl">
          <div className="bg-red-900 px-3 py-2 text-[11px] font-mono text-red-200">
            AUTONOMOUS_EXECUTION_TERMINAL
          </div>
          <div className="p-3 font-mono text-[10px] text-green-400 max-h-64 overflow-auto bg-black">
            {output.map((line, i) => (
              <div key={i} className="mb-1">
                <span className="text-red-500">▶</span> {line}
              </div>
            ))}
            {stage === 'terminal' && <span className="text-green-400 animate-pulse">█</span>}
          </div>
        </div>
      </div>
    )
  }

  // Stage: Glitch overlay
  if (stage === 'glitch') {
    const glitchIntensity = isExtreme ? 0.6 : isIntense ? 0.35 : 0.15
    const lineCount = isExtreme ? 25 : isIntense ? 15 : 8
    return (
      <div
        className="fixed inset-0 pointer-events-none z-9999"
        style={{
          background: isExtreme 
            ? 'linear-gradient(45deg, rgba(255,0,0,0.25), rgba(0,255,255,0.25), rgba(150,0,150,0.2))'
            : 'linear-gradient(45deg, rgba(255,0,0,0.1), rgba(0,255,255,0.1))',
          animation: 'glitch-flicker 0.1s infinite',
        }}
      >
        {/* Glitch lines — more intense at higher execution counts */}
        {Array(lineCount).fill(0).map((_, i) => (
          <div
            key={`line-${i}`}
            className="absolute left-0 right-0"
            style={{
              top: `${(i / lineCount) * 100}%`,
              height: isExtreme ? '3px' : isIntense ? '2px' : '1px',
              background: i % 2 === 0 ? 
                `rgba(255, 0, 0, ${glitchIntensity})` : 
                `rgba(0, 255, 255, ${glitchIntensity})`,
              boxShadow: isExtreme ? `0 0 ${8 + i}px rgba(255,0,0,${glitchIntensity})` : 'none',
            }}
          />
        ))}

        {/* Distortion blocks */}
        <div style={{ position: 'absolute', top: '20%', left: '10%', fontSize: isExtreme ? 56 : 48, opacity: isExtreme ? 0.5 : 0.3 }}>
          ▓▓▒
        </div>
        <div style={{ position: 'absolute', bottom: '15%', right: '8%', fontSize: isExtreme ? 64 : 56, opacity: isExtreme ? 0.45 : 0.25 }}>
          ░▒▓
        </div>
        {isExtreme && (
          <>
            <div style={{ position: 'absolute', top: '50%', left: '50%', fontSize: 72, opacity: 0.25, transform: 'translate(-50%, -50%)' }}>
              ▒▒▒
            </div>
          </>
        )}
      </div>
    )
  }

  return null
}
