import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Phone, Heart, Leaf, Sun, Volume2, VolumeX, X, Loader, Sparkles } from 'lucide-react'

declare global {
  interface Window {
    webkitSpeechRecognition: any
    SpeechRecognition: any
  }
}

export default function RealityCheckApp() {
  const [isConnected, setIsConnected] = useState(false)
  const [currentMessage, setCurrentMessage] = useState('')
  const [callDuration, setCallDuration] = useState(0)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Call duration timer
  useEffect(() => {
    if (!isConnected) return
    
    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1)
    }, 1000)
    
    return () => clearInterval(interval)
  }, [isConnected])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  function connectToRealityCheck() {
    setIsConnected(true)
    setCallDuration(0)
    setCurrentMessage('Aligning chakras...')
    setIsProcessing(true)

    // Generate a fresh roast
    generateRoastAndHangup()
  }

  function disconnect() {
    setIsConnected(false)
    setCurrentMessage('')
    setCallDuration(0)
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  const generateRoastAndHangup = async () => {
    try {
      const response = await fetch("/api/reality-check", {
        method: "POST",
      })

      const data = await response.json()
      const assistantResponse = data.content || "I see you're still seeking validation. How tragic."

      setCurrentMessage(assistantResponse)
      setIsProcessing(false)
      
      // Speak and then hang up
      speakText(assistantResponse, () => {
        setTimeout(() => {
            disconnect()
        }, 500)
      })

    } catch (error) {
      console.error('Roast generation error:', error)
      const fallbackResponse = "My inner peace is disturbed by your incompetence. Goodbye."
      setCurrentMessage(fallbackResponse)
      setIsProcessing(false)
      speakText(fallbackResponse, () => {
         setTimeout(() => {
            disconnect()
        }, 500)
      })
    }
  }

  function speakText(text: string, onComplete?: () => void) {
    if (isMuted || !('speechSynthesis' in window)) {
      if (onComplete) onComplete()
      return
    }
    
    window.speechSynthesis.cancel()
    
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1.0
    utterance.pitch = 1.2
    utterance.volume = 1.0
    
    const voices = window.speechSynthesis.getVoices()
    // Prefer a gentle female voice for the "fake therapist" vibe
    const voice = voices.find(v => v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Google US English')) || voices[0]
    if (voice) utterance.voice = voice
    
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => {
      setIsSpeaking(false)
      if (onComplete) onComplete()
    }
    utterance.onerror = () => {
      setIsSpeaking(false)
      if (onComplete) onComplete()
    }
    
    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }

  function toggleMute() {
    const newMutedState = !isMuted
    setIsMuted(newMutedState)
    
    if (newMutedState) {
      // Cancel speech
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
        setIsSpeaking(false)
      }
    } 
  }

  return (
    <div className="w-full h-full bg-linear-to-br from-cyan-50 via-teal-100 to-blue-200 flex flex-col items-center justify-between overflow-hidden relative" style={{ width: 480, height: 400 }}>
      {/* Header */}
      <div className="w-full bg-white/40 backdrop-blur-md p-4 flex items-center justify-between border-b border-white/30 absolute top-0 z-10">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-teal-400 animate-pulse' : 'bg-gray-400'}`}></div>
          <div>
            <h3 className="font-semibold text-sm text-teal-800 tracking-wide">Serenity Now</h3>
            {isConnected && (
              <p className="text-teal-600/80 text-[10px] uppercase tracking-wider font-medium">{formatDuration(callDuration)} • MINDFULNESS</p>
            )}
          </div>
        </div>
        <Leaf className="text-teal-600/50" size={18} />
      </div>

      {/* Main Connection/Active State */}
      <div className="flex-1 w-full flex flex-col items-center justify-center p-6 mt-12">
        {!isConnected ? (
           <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-700">
              <div className="relative">
                <div className="absolute inset-0 bg-teal-300/30 rounded-full blur-xl animate-pulse delay-75"></div>
                <div className="w-32 h-32 rounded-full bg-white/60 flex items-center justify-center border border-white/50 shadow-sm backdrop-blur-sm relative z-10">
                  <Sun size={48} className="text-amber-400 animate-[spin_10s_linear_infinite]" />
                </div>
              </div>
              
              <div className="text-center space-y-2">
                 <h2 className="text-2xl font-light text-teal-900">Wellness Hotline</h2>
                 <p className="text-teal-700/60 text-sm max-w-56 font-light leading-relaxed">Let our empathetic AI guide you through your difficult moments with kindness.</p>
              </div>
              
              <Button 
                onClick={connectToRealityCheck}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 rounded-full text-lg font-bold shadow-xl hover:shadow-green-500/30 transition-all scale-100 hover:scale-105 active:scale-95 group flex items-center gap-3 border-4 border-green-500/20"
              >
                <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                   <Phone className="group-hover:rotate-12 transition-transform" size={24} fill="currentColor" />
                </div>
                Call Support
              </Button>
           </div>
        ) : (
           <div className="flex flex-col items-center justify-center w-full max-w-xs gap-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
              {/* Avatar / Visualizer */}
              <div className={`relative w-40 h-40 rounded-full flex items-center justify-center transition-all duration-1000 ${isSpeaking ? 'scale-105' : 'scale-100'}`}>
                  {/* Ripples when speaking */}
                  {isSpeaking && (
                    <>
                      <div className="absolute inset-0 bg-teal-400/20 rounded-full animate-ping opacity-50 duration-[2s]"></div>
                      <div className="absolute inset-0 bg-cyan-400/10 rounded-full animate-ping delay-300 opacity-50 duration-[2s]"></div>
                    </>
                  )}
                  
                  <div className="z-10 bg-linear-to-tr from-teal-100 to-white w-32 h-32 rounded-full flex items-center justify-center border-4 border-white/60 shadow-xl overflow-hidden">
                    <span className="text-5xl filter drop-shadow-sm transform transition-transform duration-500">
                        {isSpeaking ? '👺' : '🌸'} 
                    </span>
                  </div>
              </div>

               {/* Captions */}
               <div className="min-h-24 flex items-center justify-center w-full">
                  <p className="text-center text-lg font-light text-teal-900 leading-relaxed max-w-xs italic">
                    "{currentMessage || "Finding your center..."}"
                  </p>
               </div>
           </div>
        )}
      </div>

      {/* Footer Controls */}
      {isConnected && (
        <div className="w-full p-8 pb-10 flex items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-4">
           <Button
              onClick={toggleMute}
              variant="outline"
              size="icon"
              className={`w-14 h-14 rounded-full border-0 transition-colors ${isMuted ? 'bg-red-100 text-red-500' : 'bg-teal-50 text-teal-600 hover:bg-teal-100'}`}
            >
              {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </Button>

            <Button
              onClick={disconnect}
              size="icon"
              className="w-16 h-16 rounded-full bg-red-400 hover:bg-red-500 text-white shadow-md border-0 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
            >
              <X size={32} />
            </Button>
        </div>
      )}
    </div>
  )
}