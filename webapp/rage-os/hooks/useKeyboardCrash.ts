import { useEffect, useRef } from 'react'

export function useKeyboardCrash(onCrash: () => void) {
  const pressedKey = useRef<string | null>(null)
  const pressStartTime = useRef<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!pressedKey.current) {
        pressedKey.current = e.key
        pressStartTime.current = Date.now()
        timerRef.current = setTimeout(() => {
          onCrash()
          pressedKey.current = null
          pressStartTime.current = null
        }, 5000)
      }
    }

    function handleKeyUp(e: KeyboardEvent) {
      if (pressedKey.current === e.key) {
        if (timerRef.current) clearTimeout(timerRef.current)
        pressedKey.current = null
        pressStartTime.current = null
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [onCrash])
}
