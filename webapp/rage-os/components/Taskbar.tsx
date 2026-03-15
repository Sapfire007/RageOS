// Stitch prompt: "A Windows-style taskbar at the bottom of the screen: dark semi-transparent bar 48px tall. Left: square Start button with Windows-like grid icon. Center: pill buttons for each open window (active = brighter). Right: system tray with bug level badge and current time. Fixed positioning at screen bottom."
'use client'
import { useState } from 'react'
import StartMenu from '@/components/StartMenu'
import { AppId } from '@/components/WindowManager'

interface OpenWindow {
  id: string
  appId: AppId
  title: string
}

interface Props {
  windows: OpenWindow[]
  userName: string
  bugLevel: number
  bugTier: string
  time: string
  onOpenApp: (appId: AppId, title: string) => void
  onFocusWindow?: (id: string) => void
  onShowWallpaperPicker: () => void
}

export default function Taskbar({
  windows,
  userName,
  bugLevel,
  bugTier,
  time,
  onOpenApp,
  onShowWallpaperPicker,
}: Props) {
  const [startOpen, setStartOpen] = useState(false)

  function toggleStart() {
    setStartOpen((v) => !v)
  }

  return (
    <>
      {startOpen && (
        <StartMenu
          userName={userName}
          onClose={() => setStartOpen(false)}
          onOpenApp={onOpenApp}
          onChangeWallpaper={onShowWallpaperPicker}
        />
      )}

      <div
        className="fixed bottom-0 left-0 right-0 h-12 flex items-center px-2 gap-2 z-50 border-t border-white/10"
        style={{ background: 'rgba(18,18,20,0.92)', backdropFilter: 'blur(20px)' }}
      >
        {/* Start Button */}
        <button
          onClick={toggleStart}
          className={`flex items-center justify-center w-10 h-9 rounded-lg transition-colors select-none ${
            startOpen ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-white/80'
          }`}
          title="Start"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <rect x="0" y="0" width="7" height="7" rx="1" />
            <rect x="9" y="0" width="7" height="7" rx="1" />
            <rect x="0" y="9" width="7" height="7" rx="1" />
            <rect x="9" y="9" width="7" height="7" rx="1" />
          </svg>
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-white/15" />

        {/* Open windows */}
        <div className="flex-1 flex items-center gap-1 overflow-x-auto min-w-0">
          {windows.length === 0 && (
            <span className="text-white/25 text-xs">No windows open</span>
          )}
          {windows.map((win) => (
            <div
              key={win.id}
              className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-white/10 border border-white/10 text-white/80 text-xs whitespace-nowrap cursor-default hover:bg-white/15 transition-colors"
              style={{ maxWidth: 140 }}
            >
              <span className="truncate">{win.title}</span>
            </div>
          ))}
        </div>

        {/* System tray */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Bug level badge */}
          <div
            className={`flex items-center gap-1 text-[11px] font-medium px-2 h-7 rounded-md ${
              bugTier === 'EXTREME'
                ? 'bg-red-500/80 text-white'
                : bugTier === 'HIGH'
                ? 'bg-orange-500/70 text-white'
                : bugTier === 'MEDIUM'
                ? 'bg-yellow-500/70 text-black'
                : 'bg-white/10 text-white/60'
            }`}
          >
            🐛 {bugLevel}
          </div>
          <span className="text-white/60 text-xs tabular-nums">{time}</span>
        </div>
      </div>
    </>
  )
}
