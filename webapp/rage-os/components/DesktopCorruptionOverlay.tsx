'use client'
import { useEffect, useState } from 'react'

interface Props {
  executionCount: number
}

export default function DesktopCorruptionOverlay({ executionCount }: Props) {
  const [glitchLinePositions, setGlitchLinePositions] = useState<number[]>([])
  const [colorShift, setColorShift] = useState(0)

  // Animate glitch lines based on execution count
  useEffect(() => {
    if (executionCount < 2) return

    const interval = setInterval(() => {
      setGlitchLinePositions(
        Array(Math.min(executionCount, 8))
          .fill(0)
          .map(() => Math.random() * 100)
      )
      setColorShift(Math.random() > 0.5 ? 1 : 0)
    }, 200)

    return () => clearInterval(interval)
  }, [executionCount])

  // Tier 1: 2-3 executions - Occasional glitch lines
  if (executionCount >= 2 && executionCount < 4) {
    return (
      <div className="fixed inset-0 pointer-events-none z-40">
        {glitchLinePositions.map((pos, i) => (
          Math.random() > 0.7 && (
            <div
              key={i}
              className="absolute left-0 right-0 h-0.5"
              style={{
                top: `${pos}%`,
                background: i % 2 === 0 ? 'rgba(255, 0, 0, 0.15)' : 'rgba(0, 255, 255, 0.15)',
                opacity: Math.random() * 0.3,
              }}
            />
          )
        ))}
      </div>
    )
  }

  // Tier 2: 4-5 executions - More glitch + color distortion
  if (executionCount >= 4 && executionCount < 7) {
    return (
      <div className="fixed inset-0 pointer-events-none z-40">
        {/* Glitch lines */}
        {glitchLinePositions.map((pos, i) => (
          <div
            key={`line-${i}`}
            className="absolute left-0 right-0 h-1"
            style={{
              top: `${pos}%`,
              background: i % 3 === 0 ? 'rgba(255, 0, 0, 0.25)' : i % 3 === 1 ? 'rgba(0, 255, 255, 0.25)' : 'rgba(255, 255, 0, 0.2)',
              opacity: 0.4 + Math.random() * 0.3,
              filter: 'blur(1px)',
            }}
          />
        ))}

        {/* Color distortion corners */}
        <div
          className="absolute top-0 left-0 w-1/3 h-1/4 pointer-events-none"
          style={{
            background: colorShift ? 'radial-gradient(circle, rgba(255,0,0,0.1), transparent)' : 'radial-gradient(circle, rgba(0,255,255,0.1), transparent)',
            opacity: 0.3,
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-1/3 h-1/4 pointer-events-none"
          style={{
            background: colorShift ? 'radial-gradient(circle, rgba(0,255,255,0.1), transparent)' : 'radial-gradient(circle, rgba(255,0,0,0.1), transparent)',
            opacity: 0.3,
          }}
        />
      </div>
    )
  }

  // Tier 3: 6+ executions - Severe corruption + block distortion + text noise
  if (executionCount >= 7) {
    return (
      <div className="fixed inset-0 pointer-events-none z-40">
        {/* Intense glitch lines covering most screen */}
        {glitchLinePositions.map((pos, i) => (
          <div
            key={`line-${i}`}
            className="absolute left-0 right-0 h-1.5"
            style={{
              top: `${pos}%`,
              background: i % 4 === 0 ? 'rgba(255, 0, 0, 0.35)' : i % 4 === 1 ? 'rgba(0, 255, 255, 0.35)' : i % 4 === 2 ? 'rgba(150, 0, 150, 0.3)' : 'rgba(0, 255, 255, 0.25)',
              opacity: 0.5 + Math.random() * 0.4,
              boxShadow: '0 0 8px rgba(255,0,0,0.6)',
            }}
          />
        ))}

        {/* Random pixel blocks (severe corruption) */}
        {Array(12 + Math.floor(executionCount / 2))
          .fill(0)
          .map((_, i) => (
            <div
              key={`block-${i}`}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${20 + Math.random() * 80}px`,
                height: `${15 + Math.random() * 60}px`,
                background: ['rgba(255,0,0,0.15)', 'rgba(0,255,255,0.15)', 'rgba(150,0,150,0.15)', 'rgba(255,255,0,0.1)'][i % 4],
                pointerEvents: 'none',
                animation: `glitch-pulse ${0.5 + Math.random() * 0.5}s infinite`,
              }}
            />
          ))}

        {/* Screen-wide tint overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: colorShift ? 'radial-gradient(circle at center, rgba(255,0,0,0.05), rgba(0,255,255,0.05))' : 'radial-gradient(circle at center, rgba(0,255,255,0.05), rgba(255,0,0,0.05))',
            pointerEvents: 'none',
          }}
        />
      </div>
    )
  }

  return null
}
