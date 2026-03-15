'use client'
import { useEffect, useRef, useState } from 'react'
import { useBugEngine } from '@/lib/bug-context'

const BUG_EMOJIS = ['🐛', '🪲', '🦗', '🦟', '🕷️', '🐜']

interface BugData {
  x: number; y: number
  vx: number; vy: number
  rotation: number; rotSpeed: number
  size: number; emoji: string
}

function makeBug(i: number): BugData {
  return {
    x: Math.random() * (window.innerWidth - 48),
    y: 60 + Math.random() * (window.innerHeight - 100),
    vx: (Math.random() - 0.5) * 2.5 + (Math.random() > 0.5 ? 1 : -1),
    vy: (Math.random() - 0.5) * 2.5 + (Math.random() > 0.5 ? 0.8 : -0.8),
    rotation: Math.random() * 360,
    rotSpeed: (Math.random() - 0.5) * 5,
    size: 18 + Math.floor(Math.random() * 14),
    emoji: BUG_EMOJIS[(i + Math.floor(Math.random() * BUG_EMOJIS.length)) % BUG_EMOJIS.length],
  }
}

export default function BugOverlay() {
  const { bugLevel, bugTier } = useBugEngine()

  const targetCount =
    bugTier === 'EXTREME' ? 14 :
    bugTier === 'HIGH'    ? 7  :
    bugTier === 'MEDIUM'  ? 3  :
    bugLevel >= 5         ? 1  : 0

  const [count, setCount] = useState(0)
  const [emojis, setEmojis] = useState<string[]>([])
  const [glitchLines, setGlitchLines] = useState<{ a: number; b: number } | null>(null)

  const bugsRef  = useRef<BugData[]>([])
  const domRefs  = useRef<(HTMLDivElement | null)[]>([])
  const animRef  = useRef<number | null>(null)

  // Resize bug pool when tier changes
  useEffect(() => {
    const prev = bugsRef.current
    bugsRef.current = Array.from({ length: targetCount }, (_, i) =>
      i < prev.length ? prev[i] : makeBug(i),
    )
    setCount(targetCount)
    setEmojis(bugsRef.current.map((b) => b.emoji))
  }, [targetCount])

  // rAF loop — direct DOM mutations, zero React re-renders per frame
  useEffect(() => {
    if (animRef.current) { cancelAnimationFrame(animRef.current); animRef.current = null }
    if (targetCount === 0) return

    function tick() {
      const w = window.innerWidth
      const h = window.innerHeight
      bugsRef.current.forEach((bug, i) => {
        bug.x += bug.vx
        bug.y += bug.vy
        bug.rotation += bug.rotSpeed

        if (bug.x <= 0 || bug.x >= w - bug.size) {
          bug.vx = -bug.vx * (0.9 + Math.random() * 0.2)
          bug.x = Math.max(0, Math.min(w - bug.size, bug.x))
        }
        if (bug.y <= 36 || bug.y >= h - bug.size) {
          bug.vy = -bug.vy * (0.9 + Math.random() * 0.2)
          bug.y = Math.max(36, Math.min(h - bug.size, bug.y))
        }
        // Random direction twitch
        if (Math.random() < 0.006) {
          bug.vx = (Math.random() - 0.5) * 3
          bug.vy = (Math.random() - 0.5) * 3
        }
        const el = domRefs.current[i]
        if (el) {
          el.style.left      = `${bug.x}px`
          el.style.top       = `${bug.y}px`
          el.style.transform = `rotate(${bug.rotation}deg)`
        }
      })
      animRef.current = requestAnimationFrame(tick)
    }

    animRef.current = requestAnimationFrame(tick)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [targetCount])

  // Glitch scan lines at HIGH / EXTREME
  useEffect(() => {
    if (bugTier !== 'HIGH' && bugTier !== 'EXTREME') return
    const ms = bugTier === 'EXTREME' ? 1600 : 5000
    const iv = setInterval(() => {
      setGlitchLines({ a: 20 + Math.random() * 60, b: 10 + Math.random() * 80 })
      setTimeout(() => setGlitchLines(null), 130)
    }, ms)
    return () => clearInterval(iv)
  }, [bugTier])

  if (count === 0 && !glitchLines) return null

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 45 }}>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          ref={(el) => { domRefs.current[i] = el }}
          style={{
            position: 'absolute',
            fontSize: bugsRef.current[i]?.size ?? 22,
            left: bugsRef.current[i]?.x ?? 0,
            top:  bugsRef.current[i]?.y ?? 0,
            userSelect: 'none',
            pointerEvents: 'none',
            lineHeight: 1,
          }}
        >
          {emojis[i] ?? '🐛'}
        </div>
      ))}

      {glitchLines && (
        <>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,0,0,0.04)' }} />
          <div style={{ position: 'absolute', top: `${glitchLines.a}%`, left: 0, right: 0, height: 2, background: 'rgba(255,0,255,0.55)' }} />
          <div style={{ position: 'absolute', top: `${glitchLines.b}%`, left: 0, right: 0, height: 1, background: 'rgba(0,255,255,0.45)' }} />
        </>
      )}
    </div>
  )
}
