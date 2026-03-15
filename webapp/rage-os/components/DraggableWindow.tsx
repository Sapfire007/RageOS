// Stitch prompt: "A macOS-style draggable window: light gray title bar with three traffic light dots (red/yellow/green) on the left, centered window title in 12px medium font, white content area with padding, rounded-xl, box-shadow for depth. Minimum width 420px."
'use client'
import { useRef, useState, useCallback } from 'react'

interface DraggableWindowProps {
  title: string
  onClose: () => void
  children: React.ReactNode
  initialX?: number
  initialY?: number
  minWidth?: number
}

export default function DraggableWindow({
  title,
  onClose,
  children,
  initialX = 120,
  initialY = 80,
  minWidth = 420,
}: DraggableWindowProps) {
  const [pos, setPos] = useState({ x: initialX, y: initialY })
  const dragging = useRef(false)
  const offset = useRef({ x: 0, y: 0 })

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    dragging.current = true
    offset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    e.preventDefault()
  }, [pos])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return
    setPos({ x: e.clientX - offset.current.x, y: e.clientY - offset.current.y })
  }, [])

  const onPointerUp = useCallback(() => {
    dragging.current = false
  }, [])

  return (
    <div
      style={{ position: 'fixed', left: pos.x, top: pos.y, minWidth, zIndex: 30 }}
      className="bg-white/95 backdrop-blur rounded-xl shadow-2xl border border-[#d2d2d7] overflow-hidden"
    >
      {/* Title Bar — drag handle */}
      <div
        className="h-9 bg-[#f0f0f0] border-b border-[#d2d2d7] flex items-center justify-between px-3 cursor-move select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <div className="flex items-center gap-1.5">
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onClose() }}
            className="w-3 h-3 rounded-full bg-[#ff5f57] hover:bg-[#e0524a] transition border border-[#e0443c]/40"
          />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#e0a825]/40" />
          <div className="w-3 h-3 rounded-full bg-[#28c840] border border-[#1a9e30]/40" />
        </div>
        <span className="text-xs font-medium text-[#3d3d3f] absolute left-1/2 -translate-x-1/2 pointer-events-none">
          {title}
        </span>
        <div className="w-12" />
      </div>

      {/* Content */}
      <div className="p-4 overflow-auto max-h-[70vh]">{children}</div>
    </div>
  )
}
