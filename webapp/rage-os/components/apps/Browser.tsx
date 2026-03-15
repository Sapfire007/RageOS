// Stitch prompt: "A minimal web browser UI. Top toolbar with back/forward arrows (grayed out), refresh icon, address bar with 'https://' prefix and lock icon, and a 'Go' button. Main content area is an iframe taking up the remaining space. Status bar at bottom showing 'Connecting...' or 'Done'."
'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RotateCw, ArrowLeft, ArrowRight, X, Search, Lock } from 'lucide-react'

export default function RageBrowser() {
  const [urlInput, setUrlInput] = useState('https://www.google.com')
  const [internalInput, setInternalInput] = useState('') // For the Goggle search bar
  const [currentUrl, setCurrentUrl] = useState('') // Actual iframe src
  const [isLoading, setIsLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState('Ready')
  const [lastQuery, setLastQuery] = useState('') // Store just the query for display
  const [history, setHistory] = useState<string[]>([])
  
  // Fake progress bar
  const [progress, setProgress] = useState(0)

  // Allow passing a query directly for the internal search page
  const handleSearch = async (e?: React.FormEvent, overrideQuery?: string) => {
    e?.preventDefault()
    
    // If called from form, use state; if called from internal page, use arg
    const queryToUse = overrideQuery || urlInput
    if (!queryToUse.trim()) return

    // Ensure the top bar matches what we are searching if triggered from internal page
    if (overrideQuery) setUrlInput(overrideQuery)

    setIsLoading(true)
    setProgress(10)
    setStatusMessage('Resolving host...')
    setLastQuery('') 

    // 1. Pretend to load normally
    setTimeout(async () => {
      setProgress(30)
      setStatusMessage('Optimizing query for maximum frustration...')
      
      try {
        // 2. Intercept the query
        // Strip protocol just to get the raw terms
        const rawTerms = queryToUse.replace(/^https?:\/\/(www\.)?/, '').split('/')[0] 
        
        const res = await fetch('/api/browser-chaos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: rawTerms }) 
        })
        
        const data = await res.json()
        const annoyingQuery = data.modifiedQuery || rawTerms + " broken"
        const reason = data.reason || "I felt like it."
        
        setProgress(70)
        setStatusMessage(`Redirecting: ${reason}`)
        
        setLastQuery(annoyingQuery)
        
        // 3. Update the URL bar to the annoying query to gaslight user
        // We make it look like a real google search url
        setUrlInput(`https://www.google.com/search?q=${encodeURIComponent(annoyingQuery)}`)
        
        // 4. Load the annoying result
        // Switching to Bing as it allows embedding more often than Google
        const embedUrl = `https://www.bing.com/search?q=${encodeURIComponent(annoyingQuery)}`
        
        setCurrentUrl(embedUrl)
        
        setTimeout(() => {
          setProgress(100)
          setIsLoading(false)
          setStatusMessage('Done (unfortunately)')
        }, 800)
        
      } catch (err) {
        setStatusMessage('Error: chaos engine failure')
        setIsLoading(false)
      }
    }, 1500)
  }

  return (
    <div className="flex flex-col bg-[#f0f0f4] text-black w-[800px] h-[500px] overflow-hidden rounded-lg shadow-xl border border-[#d1d1d6]">
      {/* Browser Toolbar */}
      <div className="flex items-center gap-2 p-2 bg-[#f9f9fb] border-b border-[#d1d1d6]">
        <div className="flex gap-1 ml-2">
            <button className="p-1.5 rounded hover:bg-black/5 text-gray-400" onClick={() => setCurrentUrl('')} title="Home"><ArrowLeft size={16} /></button>
            <button className="p-1.5 rounded hover:bg-black/5 text-gray-400 cursor-not-allowed"><ArrowRight size={16} /></button>
            <button onClick={() => setCurrentUrl('')} className="p-1.5 rounded hover:bg-black/5 text-black" title="Reset"><RotateCw size={16} /></button>
        </div>

        {/* Address Bar */}
        <form onSubmit={handleSearch} className="flex-1 flex items-center bg-white border border-[#d1d1d6] rounded-md px-2 py-1 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/50 transition-all">
            <Lock size={12} className="text-green-600 mr-2" />
            <input 
                type="text" 
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-sm font-sans text-[#1d1d1f]"
                placeholder="Search or enter website name"
            />
            {isLoading && <X size={14} className="text-gray-400 cursor-pointer" onClick={() => setIsLoading(false)} />}
        </form>

        <Button onClick={handleSearch} variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Search size={16} />
        </Button>
      </div>

      {/* Progress Bar */}
      {isLoading && (
          <div className="h-0.5 w-full bg-gray-200">
              <div 
                className="h-full bg-blue-500 transition-all duration-300 ease-out" 
                style={{ width: `${progress}%` }} 
              />
          </div>
      )}

      {currentUrl && lastQuery && (
        <div className="bg-red-50 border-b border-red-100 px-3 py-1 flex items-center justify-between text-xs animate-in slide-in-from-top-2">
            <div>
                <span className="text-gray-500 mr-2">Did you mean:</span> 
                <span className="font-bold text-red-600 line-through decoration-2 decoration-black">{lastQuery}</span>
                <span className="ml-2 italic text-gray-400">({statusMessage.replace("Redirecting: ", "")})</span>
            </div>
            <button 
                onClick={() => setCurrentUrl('')} 
                className="text-blue-600 hover:underline font-medium"
            >
                Start Over
            </button>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 bg-white relative overflow-hidden">
        {currentUrl ? (
            <div className="w-full h-full relative overflow-hidden"> 
                {/* 
                   HACK: Shift the iframe up to hide the Bing/Search Engine header 
                   so the user is forced to use our "Rage" search bar.
                   Also adds height to compensate for the shift.
                */}
                <iframe 
                    src={currentUrl} 
                    className="w-full border-none absolute top-[-115px] left-0"
                    style={{ height: 'calc(100% + 115px)' }}
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                    title="Browser Content"
                />
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center h-full w-full select-none">
                {/* Goggle Logo */}
                <h1 className="text-6xl font-bold mb-8 text-[#4285f4] tracking-tighter">
                   <span className="text-[#4285f4]">G</span>
                   <span className="text-[#ea4335]">o</span>
                   <span className="text-[#fbbc05]">g</span>
                   <span className="text-[#4285f4]">g</span>
                   <span className="text-[#34a853]">l</span>
                   <span className="text-[#ea4335]">e</span>
                </h1>
                
                {/* Search Box */}
                <form 
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSearch(e, internalInput);
                    }}
                    className="w-full max-w-md px-4"
                >
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                        <input 
                            type="text" 
                            className="w-full h-12 rounded-full border border-gray-200 pl-12 pr-4 shadow-sm hover:shadow-md focus:shadow-md focus:outline-none focus:border-gray-100 transition-all text-base"
                            placeholder="Search Goggle or type a URL"
                            value={internalInput}
                            onChange={(e) => setInternalInput(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className="flex gap-3 justify-center mt-6">
                        <Button 
                            type="submit" 
                            variant="secondary" 
                            className="bg-[#f8f9fa] hover:bg-[#f1f3f4] text-[#3c4043] border border-transparent hover:border-[#dadce0] px-6 text-sm h-9"
                        >
                            Goggle Search
                        </Button>
                        <Button 
                            type="button" 
                            variant="secondary"
                            onClick={() => {
                                setInternalInput("I'm feeling unlucky");
                                handleSearch(undefined, "I'm feeling unlucky");
                            }}
                            className="bg-[#f8f9fa] hover:bg-[#f1f3f4] text-[#3c4043] border border-transparent hover:border-[#dadce0] px-6 text-sm h-9"
                        >
                            I'm Feeling Unlucky
                        </Button>
                    </div>
                </form>

                <div className="mt-8 text-xs text-gray-500">
                    Goggle offered in: <span className="text-blue-800 hover:underline cursor-pointer">English (Broken)</span> <span className="text-blue-800 hover:underline cursor-pointer">Latin</span> <span className="text-blue-800 hover:underline cursor-pointer">Binary</span>
                </div>
            </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="h-6 bg-[#f0f0f4] border-t border-[#d1d1d6] flex items-center px-3 text-[10px] text-gray-500 justify-between">
          <span>{statusMessage}</span>
          <span>Security Level: Paranoid</span>
      </div>
    </div>
  )
}