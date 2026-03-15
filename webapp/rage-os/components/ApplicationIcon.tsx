// Stitch prompt: "A macOS-style application icon for a desktop OS: centered emoji at 48px, label below in 11px system font, subtle hover state with rounded-lg white background at 50% opacity. Compact 80x90px footprint."
interface AppIconProps {
  id: string
  name: string
  icon: string
  onClick: () => void
  variant?: 'normal' | 'virus'
}

export default function ApplicationIcon({ name, icon, onClick, variant = 'normal' }: AppIconProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all cursor-pointer select-none ${
        variant === 'virus'
          ? 'hover:bg-red-100 border-2 border-red-300'
          : 'hover:bg-white/60'
      }`}
      style={{ width: 80, minHeight: 88 }}
    >
      <span className="text-5xl leading-none mb-1.5">{icon}</span>
      <span
        className={`text-[11px] text-center leading-tight max-w-18 wrap-break-word font-medium desktop-text ${
          variant === 'virus' ? 'text-red-700 font-mono' : 'text-[#1d1d1f]'
        }`}
      >
        {name}
      </span>
    </button>
  )
}
