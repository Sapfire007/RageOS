// Stitch prompt: "A name input step in onboarding: centered card with a single large text input labeled 'Your Name', a preview showing the name getting corrupted/glitched in real time below the input, and a 'Continue' button. Show multiple corruption variants side by side in small gray pills."
'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  avatarUrl?: string
  onComplete: (name: string, password: string) => Promise<void>
}

export default function NameInput({ avatarUrl, onComplete }: Props) {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleContinue() {
    if (!name.trim() || !password.trim()) return
    setLoading(true)
    try {
      await onComplete(name.trim(), password.trim())
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center">
      {/* Gender avatar badge on top border */}
      {avatarUrl && (
        <div className="-mt-14 mb-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatarUrl}
            alt="avatar"
            className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
          />
        </div>
      )}
      <div className="text-4xl mb-2">{avatarUrl ? '' : '✍️'}</div>
      <h2 className="text-xl font-bold desktop-text mb-1">Step 2 of 3</h2>
      <p className="text-sm text-[#6e6e73] mb-5 text-center">
        Login or create your account
      </p>

      <div className="w-full max-w-xs flex flex-col gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Username..."
          className="w-full border-2 border-black/20 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-[#007aff] transition-colors desktop-text"
          maxLength={30}
          disabled={loading}
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password..."
          className="w-full border-2 border-black/20 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-[#007aff] transition-colors desktop-text"
          maxLength={50}
          disabled={loading}
        />

        {loading && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl text-center">
            <p className="text-xs text-orange-600 animate-pulse">
              ⚙️ Checking credentials...
            </p>
          </div>
        )}

        <Button
          className="w-full"
          onClick={handleContinue}
          disabled={!name.trim() || !password.trim() || loading}
        >
          {loading ? 'Loading...' : 'Continue →'}
        </Button>

        <p className="text-[10px] text-[#6e6e73] text-center">
          Existing account? Enter your credentials to log back in.
        </p>
      </div>
    </div>
  )
}
