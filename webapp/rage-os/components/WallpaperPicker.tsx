// Stitch prompt: "A wallpaper picker modal: dark overlay, centered panel with title 'Choose Wallpaper', grid of wallpaper thumbnails with rounded corners, active selection shown with blue border and checkmark. 'Apply' button at bottom. Compact and clean."
'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface Wallpaper {
  id: string
  label: string
  preview: string      // CSS or url()
  value: string        // localStorage value
}

const WALLPAPERS: Wallpaper[] = [
  {
    id: 'default',
    label: 'Default',
    preview: 'linear-gradient(160deg, #dde3ec 0%, #c8d0da 100%)',
    value: 'default',
  },
  {
    id: 'men-hd',
    label: 'Men\'s HD',
    preview: 'url(/wallpaper/men-HD-wallpaper.jpg)',
    value: 'men-HD-wallpaper.jpg',
  },
  {
    id: 'women-hd',
    label: 'Women\'s HD',
    preview: 'url(/wallpaper/women-HD-wallpaper.jpg)',
    value: 'women-HD-wallpaper.jpg',
  },
  {
    id: 'dark',
    label: 'Dark Space',
    preview: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
    value: 'dark',
  },
  {
    id: 'sunset',
    label: 'Sunset',
    preview: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    value: 'sunset',
  },
  {
    id: 'ocean',
    label: 'Ocean',
    preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    value: 'ocean',
  },
  {
    id: 'forest',
    label: 'Forest',
    preview: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    value: 'forest',
  },
]

interface Props {
  current: string
  onApply: (value: string) => void
  onClose: () => void
}

export default function WallpaperPicker({ current, onApply, onClose }: Props) {
  const [selected, setSelected] = useState(current)

  function apply() {
    onApply(selected)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center" onClick={onClose}>
      <div
        className="bg-[#1c1c1e] border border-white/10 rounded-2xl shadow-2xl p-5 w-90"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-white font-semibold text-base mb-4">🖼️ Choose Wallpaper</h3>

        <div className="grid grid-cols-3 gap-3 mb-4">
          {WALLPAPERS.map((wp) => (
            <button
              key={wp.id}
              onClick={() => setSelected(wp.value)}
              className={`relative rounded-xl overflow-hidden h-20 border-2 transition-all ${
                selected === wp.value
                  ? 'border-[#007aff] scale-105'
                  : 'border-transparent hover:border-white/20'
              }`}
            >
              <div
                className="w-full h-full"
                style={{
                  background: wp.preview,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <div className="absolute inset-x-0 bottom-0 bg-black/50 text-white text-[9px] py-0.5 text-center">
                {wp.label}
              </div>
              {selected === wp.value && (
                <div className="absolute top-1 right-1 w-4 h-4 bg-[#007aff] rounded-full flex items-center justify-center text-[8px] text-white">
                  ✓
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 text-white border-white/20 hover:bg-white/10" onClick={onClose}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={apply}>
            Apply
          </Button>
        </div>
      </div>
    </div>
  )
}

/** Resolve a wallpaper value to a CSS background property */
export function resolveWallpaper(value: string): React.CSSProperties {
  switch (value) {
    case 'men-HD-wallpaper.jpg':
      return { backgroundImage: 'url(/wallpaper/men-HD-wallpaper.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }
    case 'women-HD-wallpaper.jpg':
      return { backgroundImage: 'url(/wallpaper/women-HD-wallpaper.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }
    case 'dark':
      return { background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)' }
    case 'sunset':
      return { background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }
    case 'ocean':
      return { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
    case 'forest':
      return { background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' }
    default:
      return { background: 'linear-gradient(160deg, #dde3ec 0%, #c8d0da 100%)' }
  }
}
