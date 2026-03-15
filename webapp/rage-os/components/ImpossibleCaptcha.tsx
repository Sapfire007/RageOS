// Stitch prompt: "CAPTCHA step with AI-generated math/logic question, skip ✕ button, success flash"
'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  onComplete: () => void
}

export default function ImpossibleCaptcha({ onComplete }: Props) {
  const [question, setQuestion] = useState('')
  const [attempt, setAttempt] = useState('')
  const [loadingQ, setLoadingQ] = useState(true)
  const [wrong, setWrong] = useState(false)
  const [tries, setTries] = useState(0)
  const [success, setSuccess] = useState(false)

  function loadCaptcha() {
    setLoadingQ(true)
    fetch('/api/generate-captcha')
      .then((r) => r.json())
      .then((d) => {
        setQuestion(d.question)
      })
      .catch(() => {
        setQuestion('What is 7 × 6?')
      })
      .finally(() => setLoadingQ(false))
  }

  useEffect(() => {
    loadCaptcha()
  }, [])

  function flash() {
    setSuccess(true)
    setTimeout(onComplete, 1200)
  }

  function tryVerify() {
    // Intentionally impossible by typing: only the ✕ button may pass this layer.
    setTries((t) => t + 1)
    setWrong(true)
    setAttempt('')
    loadCaptcha()
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12">
        <div className="text-6xl animate-bounce">✅</div>
        <p className="text-lg font-bold desktop-text text-green-600">CAPTCHA Completed!</p>
        <p className="text-xs text-[#6e6e73]">Redirecting...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center">
      {/* Header with ✕ skip button */}
      <div className="w-full flex items-center justify-between mb-1">
        <div className="text-5xl">🤖</div>
        <button
          onClick={flash}
          title="Skip CAPTCHA"
          className="w-7 h-7 rounded-full flex items-center justify-center text-[#6e6e73] hover:bg-black/10 hover:text-black transition-colors text-base font-bold"
        >
          ✕
        </button>
      </div>

      <h2 className="text-xl font-bold desktop-text mb-1">Step 3 of 3</h2>
      <p className="text-sm text-[#6e6e73] mb-4 text-center">
        Prove you&apos;re human. (You probably aren&apos;t.)
      </p>

      <div className="w-full max-w-xs border-2 border-black/20 rounded-2xl overflow-hidden">
        <div className="bg-[#f5f5f7] px-4 py-4 border-b border-black/10 min-h-16 flex items-center">
          {loadingQ ? (
            <p className="text-xs text-[#6e6e73] animate-pulse">⚙️ Generating question...</p>
          ) : (
            <p className="text-sm font-semibold desktop-text">{question}</p>
          )}
        </div>
        <div className="px-3 py-3">
          <input
            type="text"
            value={attempt}
            onChange={(e) => { setAttempt(e.target.value); setWrong(false) }}
            onKeyDown={(e) => e.key === 'Enter' && attempt.trim() && !loadingQ && tryVerify()}
            placeholder="Your answer..."
            className="w-full text-sm border border-black/20 rounded-lg px-3 py-2 outline-none focus:ring-1 ring-[#007aff]/30"
            disabled={loadingQ}
            autoFocus
          />
        </div>
      </div>

      {wrong && (
        <p className="text-[10px] text-red-500 mt-2">
          ❌ Wrong. Attempt {tries}/∞. Your confidence is admirable.
        </p>
      )}

      <div className="w-full max-w-xs mt-3">
        <Button className="w-full" onClick={tryVerify} disabled={!attempt.trim() || loadingQ}>
          Verify
        </Button>
      </div>
    </div>
  )
}
