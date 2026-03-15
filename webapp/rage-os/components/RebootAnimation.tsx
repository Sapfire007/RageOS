// Stitch prompt: "Fullscreen terminal reboot animation: pitch-black background, sequential green monospace text lines appearing one by one with a blinking cursor, each line preceded by a '>' prompt character."
'use client'
import { useEffect, useState } from 'react'

const REBOOT_MESSAGES = [
  'Shutting down failed systems...',
  'Clearing emotional cache...',
  'Restarting neural engine...',
  'Loading artificial intelligence...',
  'Loading artificial stupidity...',
  'Recalibrating user expectations...',
  'Rebuilding career prospects... [FAILED]',
  'Installing disappointment drivers...',
  'System ready to disappoint again.',
]

export default function RebootAnimation({ onComplete }: { onComplete: () => void }) {
  const [visibleCount, setVisibleCount] = useState(0)

  useEffect(() => {
    if (visibleCount < REBOOT_MESSAGES.length) {
      const t = setTimeout(() => setVisibleCount((c) => c + 1), 1100)
      return () => clearTimeout(t)
    } else {
      const t = setTimeout(onComplete, 800)
      return () => clearTimeout(t)
    }
  }, [visibleCount, onComplete])

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center p-12">
      <div className="font-mono text-base max-w-xl w-full">
        {REBOOT_MESSAGES.slice(0, visibleCount).map((msg, i) => (
          <div key={i} className="mb-1.5 text-green-400">
            <span className="text-green-600 mr-2">&gt;</span>
            {msg}
          </div>
        ))}
        {visibleCount < REBOOT_MESSAGES.length && (
          <span className="text-green-400 animate-pulse">_</span>
        )}
      </div>
    </div>
  )
}
