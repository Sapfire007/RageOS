// Stitch prompt: "A Windows-style start menu popup: dark semi-transparent panel floating above the taskbar. Top: user avatar circle with emoji + username. Below: list of menu items with icons (Change Wallpaper, Settings, Sign Out). Clean white text on dark background, hover highlight. Bottom: OS version string."
'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AppId } from '@/components/WindowManager'

interface Props {
  userName: string
  onClose: () => void
  onOpenApp: (appId: AppId, title: string) => void
  onChangeWallpaper: () => void
}

const MENU_ITEMS = [
  { icon: '⚙️', label: 'Settings', appId: 'settings' as AppId, title: 'Settings' },
  { icon: '📝', label: 'Notes', appId: 'notes' as AppId, title: 'Notes' },
  { icon: '🤖', label: 'RageBot', appId: 'chatbot' as AppId, title: 'RageBot' },
  { icon: '🗑️', label: 'Recycle Bin', appId: 'recycle-bin' as AppId, title: 'Recycle Bin' },
]

export default function StartMenu({ userName, onClose, onOpenApp, onChangeWallpaper }: Props) {
  const router = useRouter()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    setAvatarUrl(localStorage.getItem('rage_os_avatar'))
  }, [])

  function handleLogout() {
    localStorage.removeItem('rage_os_user_id')
    localStorage.removeItem('rage_os_name')
    localStorage.removeItem('rage_os_wallpaper')
    onClose()
    router.replace('/setup')
  }

  function handleApp(appId: AppId, title: string) {
    onOpenApp(appId, title)
    onClose()
  }

  function handleWallpaper() {
    onChangeWallpaper()
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-60" onClick={onClose} />

      {/* Menu panel */}
      <div
        className="fixed bottom-12 left-2 z-70 w-64 rounded-xl overflow-hidden shadow-2xl border border-white/10"
        style={{ background: 'rgba(20,20,20,0.92)', backdropFilter: 'blur(20px)' }}
      >
        {/* User info */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-linear-to-br from-blue-400 to-purple-600 flex items-center justify-center text-xl select-none shrink-0">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              '😤'
            )}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{userName}</p>
            <p className="text-white/40 text-[10px]">RageOS Premium™ (Not really)</p>
          </div>
        </div>

        {/* App shortcuts */}
        <div className="px-2 py-2">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.appId}
              onClick={() => handleApp(item.appId, item.title)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-white/10 transition-colors group"
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-white/80 text-sm group-hover:text-white">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px bg-white/10 mx-3" />

        {/* System actions */}
        <div className="px-2 py-2">
          <button
            onClick={handleWallpaper}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-white/10 transition-colors group"
          >
            <span className="text-lg">🖼️</span>
            <span className="text-white/80 text-sm group-hover:text-white">Change Wallpaper</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-red-500/20 transition-colors group"
          >
            <span className="text-lg">🚪</span>
            <span className="text-red-400 text-sm group-hover:text-red-300">Sign Out</span>
          </button>
        </div>

        {/* Version */}
        <div className="px-4 py-2 border-t border-white/10">
          <p className="text-white/20 text-[10px]">RageOS v1.0.0-beta.forever</p>
        </div>
      </div>
    </>
  )
}
