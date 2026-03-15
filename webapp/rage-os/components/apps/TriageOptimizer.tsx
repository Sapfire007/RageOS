'use client'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'

export default function TriageOptimizer() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    survivorId: 'SURV-7734',
    age: 25,
    gender: 'Male',
    fever: 0,
    cough: 0,
    fatigue: 0,
    headache: 0,
    muscle_pain: 0,
    nausea: 0,
    vomiting: 0,
    diarrhea: 0,
  })
  
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [logs, setLogs] = useState<string[]>([])
  
  const [isDestructing, setIsDestructing] = useState(false)
  const [isDestroyed, setIsDestroyed] = useState(false)

  useEffect(() => {
    if (isDestroyed) {
      const timer = setTimeout(() => {
        window.location.href = '/setup'
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isDestroyed]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Strict validation for symptom scores (0-3 scale)
    const symptoms = ['fever', 'cough', 'fatigue', 'headache', 'muscle_pain', 'nausea', 'vomiting', 'diarrhea'];
    if (symptoms.includes(name)) {
      if (value !== '') {
        const parsedValue = parseInt(value, 10);
        if (parsedValue > 3) {
          setFormData({ ...formData, [name]: 3 });
          return;
        }
        if (parsedValue < 0) {
          setFormData({ ...formData, [name]: 0 });
          return;
        }
      }
    }

    setFormData({ ...formData, [name]: value })
  }

  const runModel = async () => {
    setLoading(true)
    setResult(null)
    setLogs(['[INFO] Initializing In-Memory K-Nearest Neighbors (KNN) Engine...'])

    const wait = (ms: number) => new Promise(r => setTimeout(r, ms))
    
    await wait(600)
    setLogs(prev => [...prev, '[INFO] Loading Dataset: synthetic_medical_symptoms_dataset.csv (3000 instances)'])
    
    await wait(600)
    setLogs(prev => [...prev, '[INFO] Applying Euclidean Distance matrix calculation against input vector...'])

    await wait(600)
    setLogs(prev => [...prev, '[INFO] Finding K=5 nearest historical patient vectors...'])
    
    await wait(600)
    setLogs(prev => [...prev, '[INFO] Aggregating Majority Vote for base classification...'])

    const hourglassLines = [
      "   ___________________",
      "  |\\                 /|",
      "  | \\               / |",
      "  |  \\             /  |",
      "  |   \\           /   |",
      "  |    \\         /    |",
      "  |     \\       /     |",
      "  |      \\     /      |",
      "  |       \\   /       |",
      "  |        \\ /        |",
      "  |         X         |",
      "  |        / \\        |",
      "  |       /   \\       |",
      "  |      /     \\      |",
      "  |     /       \\     |",
      "  |    /         \\    |",
      "  |   /           \\   |",
      "  |  /             \\  |",
      "  | /               \\ |",
      "  |/_________________\\|"
    ];

    setLogs(prev => [...prev, '[SYSTEM] Commencing synthetic inference delay. This will take exactly 10 seconds...'])
    for (const line of hourglassLines) {
      await wait(500)
      setLogs(prev => [...prev, line])
    }
    setLogs(prev => [...prev, '[SYSTEM] Inference logic completed. Fetching results...'])

    try {
      const res = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      
      setLogs(prev => [...prev, `[SUCCESS] Model classified underlying pathology as: ${data.diagnosis || 'Unknown'}`])
      await wait(500)
      setLogs(prev => [...prev, '[WARN] Enforcing Resource Categorical Bias on resulting payload...'])
      await wait(600)
      setResult(data.plan)

      if (data.selfDestruct) {
        setLogs(prev => [...prev, '[FATAL] CRITICAL BIAS DETECTED IN RAGEBAIT GENERATION. TRIGGERING SELF-DESTRUCT SEQUENCE!'])
        setIsDestructing(true)
        setTimeout(() => {
          setIsDestructing(false)
          setIsDestroyed(true)
        }, 5000)
      }
    } catch (err) {
      setResult("SYSTEM FAILURE. RATION ALLOCATION: 0.")
    } finally {
      setLoading(false)
    }
  }

  if (isDestroyed && typeof document !== 'undefined') {
    return createPortal(
      <div className="fixed inset-0 m-0 flex flex-col items-center justify-center bg-black text-white font-mono text-xl z-[999999999] overflow-hidden">
        <style>{`
          *, *::before, *::after {
            visibility: hidden !important;
          }
          #death-screen, #death-screen * {
            visibility: visible !important;
          }
          body {
             margin: 0 !important;
             overflow: hidden !important;
             background-color: black !important;
          }
        `}</style>
        <div id="death-screen" className="absolute inset-0 flex w-screen h-screen flex-col items-center justify-center bg-black animate-pulse">
          <p className="text-red-600 font-bold mb-8 tracking-widest text-4xl text-center px-4">SYSTEM REBOOT INITIATED</p>
          <p className="text-2xl text-gray-400 text-center px-4">Preparing / loading system for next victim...</p>
        </div>
      </div>,
      document.body
    )
  }

  return (
    <div className={`flex flex-col h-full bg-[#f8f9fa] text-[#333] font-sans overflow-hidden ${isDestructing ? 'shadow-[inset_0_0_150px_rgba(255,0,0,0.8)]' : ''}`}>
      {isDestructing && (
        <style>{`
          @keyframes destruction {
             0% { transform: translate(1px, 1px) rotate(0deg); filter: invert(0%); }
             10% { transform: translate(-3px, -2px) rotate(-2deg); filter: invert(20%) sepia(100%) hue-rotate(320deg) saturate(500%); }
             20% { transform: translate(-3px, 0px) rotate(2deg); filter: invert(40%) sepia(100%) hue-rotate(320deg) saturate(500%); }
             30% { transform: translate(3px, 5px) rotate(0deg); }
             40% { transform: translate(1px, -1px) rotate(2deg); filter: invert(60%) sepia(100%) hue-rotate(320deg) saturate(500%); }
             50% { transform: translate(-5px, 2px) rotate(-2deg); }
             60% { transform: translate(-3px, 1px) rotate(0deg); filter: invert(80%) sepia(100%) hue-rotate(320deg) saturate(500%); }
             70% { transform: translate(5px, 1px) rotate(-2deg); }
             80% { transform: translate(-1px, -1px) rotate(2deg); filter: invert(100%) sepia(100%) hue-rotate(320deg) saturate(500%); }
             90% { transform: translate(2px, 2px) rotate(0deg); }
             100% { transform: translate(1px, -2px) rotate(-1deg); filter: invert(100%) sepia(100%) hue-rotate(320deg) saturate(2000%); background-color: darkred; }
          }
          body {
             animation: destruction 0.25s infinite;
             pointer-events: none;
             overflow: hidden !important;
          }
        `}</style>
      )}

      {/* Header */}
      <div className="bg-[#e9ecef] px-4 py-3 border-b border-[#dee2e6] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">📊</span>
          <div>
            <h2 className="text-sm font-semibold text-[#212529]">CS480: Applied ML Dashboard</h2>
            <p className="text-[10px] text-[#6c757d]">Dataset: synthetic_medical_symptoms_dataset.csv (KNN)</p>
          </div>
        </div>
        <div className="flex bg-[#e9ecef] rounded p-1">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left column: Input Form */}
        <div className="w-1/2 p-4 border-r border-[#dee2e6] overflow-y-auto bg-white">
          <div className="space-y-4">
            
            <div className="bg-[#fff3cd] border border-[#ffeeba] p-3 rounded text-xs text-[#856404] mb-2">
              <strong>Project Note:</strong> "We deployed our K-Nearest Neighbors model against 3000 historical survivor records. Beware of the alphabetical bias hack!"
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#495057] uppercase mb-1">Survivor ID / Name</label>
              <input 
                type="text" 
                name="survivorId"
                value={formData.survivorId}
                onChange={handleInputChange}
                className="w-full bg-[#f8f9fa] border border-[#ced4da] rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[#4d90fe]" 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#495057] uppercase mb-1">Age</label>
                <input 
                  type="number" 
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="w-full bg-[#f8f9fa] border border-[#ced4da] rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[#4d90fe]" 
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#495057] uppercase mb-1">Gender</label>
                <select 
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full bg-[#f8f9fa] border border-[#ced4da] rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[#4d90fe]"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>

            <div className="pt-2 border-t border-[#dee2e6]">
              <h3 className="text-[11px] font-bold text-[#495057] uppercase mb-2">Symptoms (0-3 scale)</h3>
              <div className="grid grid-cols-3 gap-2">
                {['fever', 'cough', 'fatigue', 'headache', 'muscle_pain', 'nausea', 'vomiting', 'diarrhea'].map((sym) => (
                  <div key={sym}>
                    <label className="block text-[9px] font-semibold text-[#6c757d] uppercase capitalize">{sym.replace('_', ' ')}</label>
                    <input 
                      type="number" 
                      min="0"
                      max="3"
                      name={sym}
                      value={formData[sym as keyof typeof formData]}
                      onChange={handleInputChange}
                      className="w-full bg-[#f8f9fa] border border-[#ced4da] rounded px-1 py-1 text-xs focus:outline-none" 
                    />
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={runModel}
              disabled={loading}
              className="w-full mt-4 bg-[#0d6efd] hover:bg-[#0b5ed7] text-white py-2 rounded text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50 shadow-sm"
            >
              {loading ? 'Processing Target Vector...' : 'Execute KNN Prediction'}
            </button>
          </div>
        </div>

        {/* Right column: Results & Logs */}
        <div className="w-1/2 bg-[#f4f6f9] flex flex-col relative text-xs">
          <div className="p-2 border-b border-[#dee2e6] bg-[#e2e6ea]">
            <span className="text-[10px] text-[#495057] uppercase font-bold tracking-widest">KNN Execution Terminal</span>
          </div>
          
          <div className="flex-1 p-3 overflow-y-auto font-mono text-[10px] leading-relaxed text-[#212529] whitespace-pre-wrap">
            {logs.map((log, i) => (
              <div key={i} className={`mb-1 ${log.includes('[WARN]') ? 'text-[#d9534f] font-bold bg-[#f8d7da] py-1 px-1 rounded' : ''} ${log.includes('[SUCCESS]') ? 'text-[#0f5132] font-bold' : ''}`}>
                <span className="text-[#adb5bd] mr-2">[{new Date().toISOString().split('T')[1].slice(0, 8)}]</span>
                {log}
              </div>
            ))}
            {loading && (
              <div className="animate-pulse animate-bounce mt-1">...</div>
            )}
            
            {result && (
              <div className={`mt-4 border p-3 rounded shadow-sm animate-in fade-in slide-in-from-bottom-4 ${result.includes('SUCCESS') ? 'bg-[#d1e7dd] border-[#badbcc] text-[#0f5132]' : 'bg-[#f8d7da] border-[#f5c2c7] text-[#842029]'}`}>
                <div className="flex justify-between items-center mb-2 border-b border-current pb-1">
                    <span className="font-bold uppercase tracking-wider">Final Allocation Status</span>
                </div>
                <div className="mb-2 text-sm leading-relaxed">
                    {result}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
