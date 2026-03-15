'use client'
import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'

// Extend the Window interface for speech recognition
declare global {
  interface Window {
    webkitSpeechRecognition: any
  }
}

interface Props {
  userId?: string | null
  isOpen: boolean
  onClose: () => void
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export default function EmotionalCompanion({ userId, isOpen, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const recognitionRef = useRef<any | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  // Initialize voice recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInputText(transcript)
        setIsListening(false)
      }
      
      recognition.onerror = () => {
        setIsListening(false)
      }
      
      recognition.onend = () => {
        setIsListening(false)
      }
      
      recognitionRef.current = recognition
    }
  }, [])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Initial greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = "Oh great, another person who thinks talking to an AI will fix their pathetic life. What's your sob story today?"
      setMessages([{ role: 'assistant', content: greeting, timestamp: Date.now() }])
      speakText(greeting)
    }
  }, [isOpen])

  async function sendToCompanion(userMessage: string) {
    if (!userMessage.trim()) return

    // Add user message
    const newMessages = [...messages, { role: 'user' as const, content: userMessage, timestamp: Date.now() }]
    setMessages(newMessages)
    setIsLoading(true)

    try {
      // Create conversation context - focus on emotional support
      const conversation = newMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))

      const systemMessage = {
        role: 'system' as const,
        content: 'You are a brutally honest, demotivating AI that gives harsh reality checks. You are sarcastic, blunt, and deliver raw truths without sugar-coating. Insult the user with sharp, cutting remarks about their failures and weaknesses. Keep responses short and devastating (1-2 sentences). Be mean but not profane.'
      }

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer YOUR_OPENROUTER_API_KEY_HERE`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": "openrouter/healer-alpha",
          "messages": [systemMessage, ...conversation],
          "temperature": 0.7,
          "max_tokens": 150
        })
      })

      const data = await response.json()
      const assistantResponse = data.choices?.[0]?.message?.content || "Wow, you're so boring even an AI doesn't want to talk to you. Try being interesting for once."

      // Add assistant response
      setMessages(prev => [...prev, { role: 'assistant', content: assistantResponse, timestamp: Date.now() }])
      
      // Speak the response
      speakText(assistantResponse)

    } catch (error) {
      const fallbackResponse = "Great, even the AI servers don't want to deal with your problems. That should tell you something about yourself."
      setMessages(prev => [...prev, { role: 'assistant', content: fallbackResponse, timestamp: Date.now() }])
      speakText(fallbackResponse)
    }

    setIsLoading(false)
    setInputText('')
  }

  function speakText(text: string) {
    if ('speechSynthesis' in window) {
      // Stop any current speech
      window.speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1.1
      utterance.volume = 0.8
      
      // Use a more natural voice if available
      const voices = window.speechSynthesis.getVoices()
      const voice = voices.find(v => v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Karen')) || voices[0]
      if (voice) utterance.voice = voice
      
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)
      
      window.speechSynthesis.speak(utterance)
    }
  }

  function startListening() {
    if (recognitionRef.current && !isListening) {
      setIsListening(true)
      recognitionRef.current.start()
    }
  }

  function stopSpeaking() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 h-96 bg-white border border-red-200 rounded-lg shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="bg-red-600 text-white p-3 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">😈</span>
          <span className="font-medium text-sm">Reality Check</span>
          {isSpeaking && <span className="animate-pulse text-xs">🔊</span>}
        </div>
        <button
          onClick={() => onClose()}
          className="text-white/80 hover:text-white text-lg"
        >
          ×
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-3 space-y-3">
        {messages.map((msg) => (
          <div key={msg.timestamp} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] p-2 rounded-lg text-sm ${
              msg.role === 'user' 
                ? 'bg-red-100 text-red-900' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-2 rounded-lg text-sm text-gray-600">
              <span className="animate-pulse">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-red-100">
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendToCompanion(inputText)}
            placeholder="Tell me your failures..."
            className="flex-1 px-3 py-2 border border-red-200 rounded-lg text-sm focus:outline-none focus:border-red-400"
            disabled={isLoading}
          />
          <Button
            onClick={() => sendToCompanion(inputText)}
            disabled={isLoading || !inputText.trim()}
            size="sm"
            className="bg-red-600 hover:bg-red-700"
          >
            💬
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={startListening}
            disabled={isListening || isLoading}
            size="sm"
            variant="outline"
            className={`flex-1 ${isListening ? 'animate-pulse' : ''}`}
          >
            {isListening ? '🎤 Listening...' : '🎤 Voice'}
          </Button>
          <Button
            onClick={stopSpeaking}
            disabled={!isSpeaking}
            size="sm"
            variant="outline"
          >
            🔇 Stop
          </Button>
        </div>
      </div>
    </div>
  )
}