// Stitch prompt: "Windows Blue Screen of Death parody: full-screen electric blue background, large white sad face emoji, bold white 'CRITICAL SYSTEM FAILURE' heading, monospace error code block, white 'Reboot System' button with blue text."
'use client'
interface CrashScreenProps {
  errorCode: string
  onReboot: () => void
}

export default function CrashScreen({ errorCode, onReboot }: CrashScreenProps) {
  const stopCode = Math.floor(Math.random() * 16777215)
    .toString(16)
    .toUpperCase()
    .padStart(6, '0')

  return (
    <div className="fixed inset-0 bg-[#1a6fb5] z-50 flex items-center justify-center p-8">
      <div className="text-white text-center max-w-2xl w-full">
        <div className="text-9xl mb-6 select-none">:(</div>
        <h1 className="text-4xl font-bold mb-4 tracking-tight">CRITICAL SYSTEM FAILURE</h1>
        <p className="text-xl mb-2">Error Code: <span className="font-mono font-bold">{errorCode}</span></p>
        <p className="text-lg mb-8 opacity-80">
          Your excessive key pressing has caused a critical exception in the stupidity module.
          The system needs to restart to protect your feelings.
        </p>
        <div className="bg-white/10 border border-white/20 p-4 rounded-lg mb-8 text-left font-mono text-sm">
          <p className="mb-1">Technical information:</p>
          <p className="opacity-80">*** STOP: 0x000000{stopCode}</p>
          <p className="opacity-80">*** {errorCode}</p>
          <p className="opacity-60 mt-2 text-xs">Collecting error info... (0% complete — this may take your entire career)</p>
        </div>
        <button
          onClick={onReboot}
          className="px-10 py-3 bg-white text-[#1a6fb5] rounded-lg font-semibold text-lg hover:bg-gray-100 transition"
        >
          Reboot System
        </button>
      </div>
    </div>
  )
}
