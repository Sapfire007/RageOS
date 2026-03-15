// Stitch prompt: "A chat application window: white/light gray background, scrollable message list with left-aligned bot bubbles (gray rounded, bot avatar emoji) and right-aligned user bubbles (blue/accent), text input at the bottom with a send button. Minimalist and clean."
'use client'
import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { generateChatbotResponse } from '@/lib/chatbot-responses'

interface Message {
  id: string
  from: 'user' | 'bot'
  text: string
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      from: 'bot',
      text: 'Hello! I am definitely a helpful AI assistant. Ask me anything!',
    },
  ])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, thinking])

  async function send() {
    const text = input.trim()
    if (!text) return
    setInput('')

    const userMsg: Message = { id: crypto.randomUUID(), from: 'user', text }
    setMessages((prev) => [...prev, userMsg])

    setThinking(true)
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 1200))
    setThinking(false)

    const response = generateChatbotResponse(text)
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), from: 'bot', text: response }])
  }

  return (
    <div className="flex flex-col" style={{ width: 360, height: 400 }}>
      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-black/10">
        <span className="text-xl">🤖</span>
        <div>
          <p className="text-sm font-semibold desktop-text">RageBot™</p>
          <p className="text-[10px] text-green-500">Online (probably)</p>
        </div>
      </div>

      <div className="flex-1 overflow-auto space-y-2 mb-2 pr-1">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.from === 'bot' && <span className="mr-1 text-base self-end">🤖</span>}
            <div
              className={`max-w-[75%] text-xs px-3 py-1.5 rounded-2xl ${
                m.from === 'user'
                  ? 'bg-[#007aff] text-white rounded-br-sm'
                  : 'bg-[#e5e5ea] desktop-text rounded-bl-sm'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {thinking && (
          <div className="flex items-end gap-1">
            <span className="text-base">🤖</span>
            <div className="bg-[#e5e5ea] px-3 py-1.5 rounded-2xl rounded-bl-sm text-xs desktop-text">
              <span className="animate-pulse">...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 text-xs border border-black/20 rounded-full px-3 py-1.5 outline-none focus:ring-2 ring-[#007aff]/30 bg-white"
          placeholder="Ask me something useless..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') send() }}
        />
        <Button size="sm" onClick={send} disabled={!input.trim() || thinking} className="rounded-full px-3">
          ↑
        </Button>
      </div>
    </div>
  )
}
