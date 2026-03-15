// Stitch prompt: "A selfie upload step in an onboarding flow: centered card, large dotted upload area with camera emoji, accepts image files, shows thumbnail preview after selection. Below: two buttons 'Male' and 'Female' for mock gender classification. Friendly pastel colors."
'use client'
import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  onComplete: (gender: string, imageUrl: string) => void
}

export default function SelfieUpload({ onComplete }: Props) {
  const [preview, setPreview] = useState<string | null>(null)
  const [classifying, setClassifying] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreview(url)
  }

  async function classify(manual: string) {
    setClassifying(true)
    await new Promise((r) => setTimeout(r, 1800))
    setClassifying(false)
    onComplete(manual, preview ?? '')
  }

  return (
    <div className="flex flex-col items-center">
      <div className="text-5xl mb-3">📸</div>
      <h2 className="text-xl font-bold desktop-text mb-1">Step 1 of 3</h2>
      <p className="text-sm text-[#6e6e73] mb-5 text-center">
        Upload a selfie so our AI can judge you
      </p>

      <div
        onClick={() => fileRef.current?.click()}
        className={`w-56 h-44 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-colors mb-5 ${
          preview ? 'border-[#007aff]' : 'border-black/20 hover:border-black/40'
        }`}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="selfie" className="w-full h-full object-cover rounded-2xl" />
        ) : (
          <>
            <span className="text-4xl">📷</span>
            <p className="text-xs text-[#6e6e73] mt-2">Click to upload</p>
          </>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

      {preview && (
        <div className="space-y-2 w-full max-w-xs">
          <p className="text-xs text-center text-[#6e6e73] mb-1">Our AI detected... ambiguity. Please clarify:</p>
          <div className="flex gap-3">
            <Button
              className="flex-1"
              onClick={() => classify('male')}
              disabled={classifying}
            >
              {classifying ? 'Analyzing...' : '♂ Male'}
            </Button>
            <Button
              className="flex-1"
              variant="outline"
              onClick={() => classify('female')}
              disabled={classifying}
            >
              {classifying ? 'Analyzing...' : '♀ Female'}
            </Button>
          </div>
          <p className="text-[10px] text-center text-[#6e6e73] mt-1 px-4">
            * AI classification is 37% accurate. We apologize.
          </p>
        </div>
      )}
    </div>
  )
}
