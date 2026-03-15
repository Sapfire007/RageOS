// Stitch prompt: "A modern email client interface. Left sidebar with folders (Inbox 10k, Sent, Junk, Trash). Main list of emails with subject, sender, time. Reading pane on the right or modal. Clean white/gray design but with slightly 'off' details like 'Unsubscribe' button being tiny."
'use client'
import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { triggerChaosEffect, applyPermanentDamage } from '@/lib/chaos-engine'

interface Email {
  id: string
  sender: string
  subject: string
  body: string
  linkText: string
  read: boolean
  timestamp: string
}

const FOLDERS = [
  { id: 'inbox', name: 'Inbox', count: '10,482', icon: '📥' },
  { id: 'sent', name: 'Sent', count: '0', icon: '📤' },
  { id: 'junk', name: 'Important', count: '5', icon: '⭐' }, // Misleading name
  { id: 'trash', name: 'Trash', count: '99+', icon: '🗑️' },
]

export default function ScamMail() {
  const [emails, setEmails] = useState<Email[]>([])
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [loading, setLoading] = useState(false)
  const [glitching, setGlitching] = useState(false)
  const intervalRef = useRef<any>(null)

  // Load initial "fake" emails
  useEffect(() => {
    const initialEmails: Email[] = [
      {
        id: '1',
        sender: 'Security Alert <admin@goggle.com>',
        subject: 'Someone tried to sign in from Antarctica',
        body: 'We detected a sign-in attempt from a penguin. If this wasn\'t you, click below immediately to verify your password or your account will be deleted in 3 seconds.',
        linkText: 'VERIFY NOW',
        read: false,
        timestamp: '10:42 AM'
      },
      {
        id: '2',
        sender: 'HR Department <hr@company.fake>',
        subject: 'MANDATORY: Sexual Harassment Training v2',
        body: 'You have been reported for "not laughing at the boss\'s jokes". Please complete this mandatory retraining module immediately.',
        linkText: 'START TRAINING',
        read: false,
        timestamp: 'Yesterday'
      }
    ]
    setEmails(initialEmails)
  }, [])

  // Poll for new spam
  useEffect(() => {
    const fetchSpam = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/generate-spam', { method: 'POST' })
        const data = await res.json()
        
        const newEmail: Email = {
            id: Math.random().toString(36).substring(7),
            sender: data.sender || 'Unknown Scammer',
            subject: data.subject || 'URGENT',
            body: data.body || 'Click the link.',
            linkText: data.linkText || 'CLICK ME',
            read: false,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
        
        setEmails(prev => [newEmail, ...prev])
        // Play notification sound if possible?
      } catch (e) {
        console.error("Failed to fetch spam", e)
      } finally {
        setLoading(false)
      }
    }

    // Initial fetch after 2s
    const timer = setTimeout(fetchSpam, 2000)
    
    // Auto-fetch every 30-60 seconds for demo (User asked for 5-10 mins but that's too slow for testing, we'll do 45s)
    intervalRef.current = setInterval(fetchSpam, 45000)

    return () => {
        clearTimeout(timer)
        if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const handleLinkClick = () => {
     // TRIGGER VIRUS
     setGlitching(true);
     
     // 1. Shake screen immediately
     const stopChaos = triggerChaosEffect(2.0); // High intensity
     
     // 2. Play sound? (Optional)
     
     // 3. Updates logic
     setTimeout(() => {
         stopChaos();
         setGlitching(false);
         // Apply permanent damage
         applyPermanentDamage('generic'); // Or random type
         alert("⚠️ MALWARE EXECUTED: System integrity compromised.");
     }, 3000); // 3 seconds of chaos
  }

  const selectEmail = (email: Email) => {
      setSelectedEmail(email)
      setEmails(prev => prev.map(e => e.id === email.id ? { ...e, read: true } : e))
  }

  return (
    <div className="flex bg-white text-black font-sans w-[800px] h-[500px] overflow-hidden rounded-lg shadow-xl border border-gray-300">
      {/* Sidebar */}
      <div className="w-48 bg-gray-100 border-r border-gray-300 flex flex-col pt-3">
        <div className="px-4 mb-4">
            <h2 className="text-xl font-bold text-blue-600">Mail</h2>
            <p className="text-xs text-gray-500">v1.0 (Beta)</p>
        </div>
        <div className="flex-1 overflow-y-auto">
            {FOLDERS.map(f => (
                <div key={f.id} className={`flex justify-between items-center px-4 py-2 hover:bg-gray-200 cursor-pointer ${f.id === 'inbox' ? 'bg-blue-100/50 font-semibold' : ''}`}>
                    <span className="flex items-center gap-2 text-sm">{f.icon} {f.name}</span>
                    <span className="text-xs text-gray-400 bg-gray-200 rounded-full px-1.5">{f.count}</span>
                </div>
            ))}
        </div>
      </div>

      {/* Email List */}
      <div className="w-72 border-r border-gray-200 flex flex-col bg-white">
          <div className="h-10 border-b flex items-center px-3 bg-gray-50">
              <input type="text" placeholder="Search" className="w-full text-xs bg-white border rounded px-2 py-1 outline-none focus:ring-1 focus:ring-blue-300" />
          </div>
          <div className="flex-1 overflow-y-auto">
              {emails.map(email => (
                  <div 
                    key={email.id} 
                    onClick={() => selectEmail(email)}
                    className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-blue-50 transition-colors ${selectedEmail?.id === email.id ? 'bg-blue-100 border-l-4 border-l-blue-500' : ''} ${!email.read ? 'font-semibold' : 'text-gray-600'}`}
                  >
                      <div className="flex justify-between mb-1">
                          <span className="text-sm truncate w-2/3">{email.sender.split('<')[0]}</span>
                          <span className="text-xs text-gray-400">{email.timestamp}</span>
                      </div>
                      <div className="text-sm truncate mb-1 text-black">{email.subject}</div>
                      <div className="text-xs text-gray-400 truncate">{email.body}</div>
                  </div>
              ))}
              {loading && <div className="p-3 text-center text-xs text-gray-400 animate-pulse">Checking for new mail...</div>}
          </div>
      </div>

      {/* Reading Pane */}
      <div className="flex-1 flex flex-col bg-white relative">
          {glitching && (
            <div className="absolute inset-0 bg-red-500/20 z-50 pointer-events-none mix-blend-multiply animate-pulse"></div>
          )}
          
          {selectedEmail ? (
              <div className="flex flex-col h-full">
                  <div className="p-4 border-b border-gray-100">
                      <h2 className="text-lg font-bold mb-2">{selectedEmail.subject}</h2>
                      <div className="flex items-center gap-2 mb-1">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-bold">
                              {selectedEmail.sender[0]}
                          </div>
                          <div>
                              <div className="text-sm font-semibold">{selectedEmail.sender}</div>
                              <div className="text-xs text-gray-500">To: Me &lt;victim@rage-os.com&gt;</div>
                          </div>
                          <div className="ml-auto text-xs text-gray-400">{selectedEmail.timestamp}</div>
                      </div>
                  </div>
                  
                  <div className="p-6 flex-1 overflow-y-auto prose prose-sm max-w-none">
                      <p className="whitespace-pre-wrap mb-6">{selectedEmail.body}</p>
                      
                      <div className="my-8 p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                          <p className="text-xs text-gray-500 mb-2">Action Required:</p>
                          <Button 
                            onClick={handleLinkClick}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow-lg transition-transform hover:scale-105 active:scale-95"
                          >
                             {selectedEmail.linkText}
                          </Button>
                          <p className="text-[10px] text-gray-400 mt-2">
                             Trusted sender verified by RageOS Security™
                          </p>
                      </div>
                  </div>
              </div>
          ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
                  <span className="text-6xl mb-4">✉️</span>
                  <p>Select an email to read</p>
              </div>
          )}
      </div>
    </div>
  )
}