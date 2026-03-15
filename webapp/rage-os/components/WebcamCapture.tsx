// Stitch prompt: "A webcam selfie capture step in onboarding: centered card, live video preview in a rounded rectangle with a camera shutter button below. After capture: shows frozen frame preview side by side with 'Retake' and 'Use Photo' buttons. Clean minimal style. If camera access is denied shows a friendly error message."
'use client'
import { useRef, useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  onComplete: (gender: string, imageDataUrl: string) => void
}

export default function WebcamCapture({ onComplete }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [classifying, setClassifying] = useState(false)
  const [awaitingGender, setAwaitingGender] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [cameraReady, setCameraReady] = useState(false)

  const startCamera = useCallback(async () => {
    setCameraError(null)
    setCameraReady(false)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => setCameraReady(true)
      }
    } catch {
      setCameraError('Camera access was denied. Please allow webcam access and try again.')
    }
  }, [])

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }

  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [startCamera])

  function capture() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Mirror the capture (selfie mode)
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
    setCapturedImage(dataUrl)
    stopCamera()
  }

  function retake() {
    setCapturedImage(null)
    setAwaitingGender(false)
    setClassifying(false)
    startCamera()
  }

  function pickGender(gender: 'male' | 'female') {
    if (!capturedImage) return
    onComplete(gender, capturedImage)
  }

  async function classifyAndProceed(dataUrl: string) {
    setClassifying(true)
    try {
      const res = await fetch('/api/classify-gender', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: dataUrl }),
      })
      const data = await res.json()
      if (data.gender === 'male' || data.gender === 'female') {
        onComplete(data.gender, dataUrl)
      } else {
        // unknown — ask the user
        setClassifying(false)
        setAwaitingGender(true)
      }
    } catch {
      setClassifying(false)
      setAwaitingGender(true)
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div className="text-5xl mb-3">📸</div>
      <h2 className="text-xl font-bold desktop-text mb-1">Step 1 of 3</h2>
      <p className="text-sm text-[#6e6e73] mb-4 text-center">
        Take a selfie so our AI can judge you
      </p>

      {cameraError ? (
        <div className="w-64 text-center">
          <div className="text-5xl mb-3">🚫</div>
          <p className="text-sm text-red-600 mb-4">{cameraError}</p>
          <Button onClick={startCamera}>Try Again</Button>
        </div>
      ) : capturedImage ? (
        /* Preview captured image */
        <div className="flex flex-col items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={capturedImage}
            alt="captured selfie"
            className="w-56 h-44 object-cover rounded-2xl border-2 border-[#007aff]"
          />
          {classifying ? (
            <p className="text-xs text-[#6e6e73] animate-pulse">🤖 AI is judging your appearance...</p>
          ) : awaitingGender ? (
            <div className="flex flex-col items-center gap-2">
              <p className="text-xs text-[#6e6e73]">Our AI couldn&apos;t figure it out. You tell us.</p>
              <div className="flex gap-3">
                <Button onClick={() => pickGender('male')}>👨 Male</Button>
                <Button onClick={() => pickGender('female')}>👩 Female</Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <Button variant="outline" onClick={retake}>Retake</Button>
              <Button onClick={() => classifyAndProceed(capturedImage!)}>Use Photo →</Button>
            </div>
          )}
          <p className="text-[10px] text-[#6e6e73] mt-1">
            * Our AI is 37% accurate. We apologize in advance.
          </p>
        </div>
      ) : (
        /* Live camera */
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-56 h-44 rounded-2xl overflow-hidden bg-black border-2 border-black/20">
            {/* Mirror the video for selfie feel */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }}
            />
            {!cameraReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <span className="text-white text-xs animate-pulse">Starting camera...</span>
              </div>
            )}
          </div>
          <Button
            onClick={capture}
            disabled={!cameraReady}
            className="rounded-full w-14 h-14 text-2xl p-0 flex items-center justify-center border-4 border-white shadow-lg"
          >
            📷
          </Button>
          <p className="text-[10px] text-[#6e6e73]">Click the button to take your selfie</p>
        </div>
      )}

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
