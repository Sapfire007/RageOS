// Stitch prompt: "A fake payment modal dialog: clean white card with header 'Upgrade to Premium AI Plan', three price buttons in a row (₹999 / ₹9999 / ₹99999), form with labeled inputs (card number, CVV, OTP, blood group, favorite dinosaur). On failure: centered red X emoji, bold 'Transaction Failed' title, 'skill issue' reason, close button."
'use client'
import { useState, useEffect, useRef } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

const ABSURD_FIELDS = [
  { label: 'Card Number', name: 'card', placeholder: '1234 5678 9012 3456', type: 'text' },
  { label: 'CVV', name: 'cvv', placeholder: '???', type: 'text' },
  { label: 'OTP', name: 'otp', placeholder: 'Enter OTP you never received', type: 'text' },
  { label: 'Blood Group', name: 'blood', placeholder: 'O+, AB-, etc.', type: 'text' },
  { label: 'Favorite Dinosaur', name: 'dino', placeholder: 'T-Rex, Velociraptor…', type: 'text' },
  { label: "Mother's Maiden Bitcoin Address", name: 'btc', placeholder: '1A1zP1eP5QG…', type: 'text' },
]

interface PaymentPopupProps {
  userId: string | null
  open: boolean
  onClose: () => void
}

export default function PaymentPopup({ userId, open, onClose }: PaymentPopupProps) {
  const [processing, setProcessing] = useState(false)
  const [failed, setFailed] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState('')
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Play music when popup opens, stop when it closes
  useEffect(() => {
    if (open) {
      setFailed(false)
      setSelectedPlan('')
      const audio = new Audio('/sound/hava_nagila.mp3')
      audio.loop = true
      audio.volume = 0.6
      audio.play().catch(() => {}) // ignore autoplay block
      audioRef.current = audio
    } else {
      audioRef.current?.pause()
      audioRef.current = null
    }
    return () => {
      audioRef.current?.pause()
      audioRef.current = null
    }
  }, [open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setProcessing(true)
    if (userId) {
      // Increment payment attempts
      const { data } = await supabase
        .from('users')
        .select('total_payments_attempted')
        .eq('id', userId)
        .single()
      await supabase
        .from('users')
        .update({ total_payments_attempted: (data?.total_payments_attempted ?? 0) + 1 })
        .eq('id', userId)
    }
    setTimeout(() => {
      setProcessing(false)
      setFailed(true)
    }, 2200)
  }

  return (
    <DialogPrimitive.Root open={open}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <DialogPrimitive.Content
          className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl border border-[#d2d2d7] p-6 w-full max-w-md max-h-[90vh] overflow-auto"
          onEscapeKeyDown={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogPrimitive.Title className="text-lg font-semibold text-[#1d1d1f] mb-1">
            Upgrade to Premium AI Plan 🚀
          </DialogPrimitive.Title>

        {!failed ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <p className="text-sm text-[#6e6e73]">Choose your plan to unlock unlimited intelligence:</p>
            <div className="flex gap-2">
              {['₹69', '₹420', '🫘 Kidney'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setSelectedPlan(p)}
                  className={`flex-1 py-2 rounded-lg border-2 text-sm font-semibold transition ${
                    selectedPlan === p
                      ? 'border-[#007aff] bg-[#007aff]/10 text-[#007aff]'
                      : 'border-[#d2d2d7] text-[#1d1d1f]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {ABSURD_FIELDS.map((f) => (
              <div key={f.name}>
                <label className="block text-xs font-medium text-[#1d1d1f] mb-1">{f.label}</label>
                <input
                  type={f.type}
                  name={f.name}
                  placeholder={f.placeholder}
                  required
                  autoComplete="off"
                  className="w-full border border-[#d2d2d7] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#007aff]"
                />
              </div>
            ))}

            <Button type="submit" className="w-full" disabled={processing || !selectedPlan}>
              {processing ? 'Processing payment...' : 'Pay Now'}
            </Button>
          </form>
        ) : (
          <div className="text-center py-8">
            <button
              onClick={onClose}
              className="text-7xl mb-4 block mx-auto cursor-pointer hover:scale-110 transition-transform"
              aria-label="Close payment dialog"
            >
              ❌
            </button>
            <h3 className="text-xl font-bold mb-2">Transaction Failed</h3>
            <p className="text-[#6e6e73] mb-6">
              Payment could not be processed due to a <strong>skill issue</strong>.
            </p>
            <Button onClick={() => { setFailed(false); setSelectedPlan('') }}>
              Try Again
            </Button>
          </div>
        )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
