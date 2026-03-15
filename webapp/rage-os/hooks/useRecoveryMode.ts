import { useEffect, useRef } from 'react'
import { resetBugLevel } from '@/lib/bug-engine'

export function useRecoveryMode(userId: string | null, onRecovery?: () => void) {
  const pressTimestamps = useRef<number[]>([])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey && e.key === 'r') {
        e.preventDefault()
        const now = Date.now()
        pressTimestamps.current = [...pressTimestamps.current, now].filter(
          (t) => now - t < 2000
        )
        if (pressTimestamps.current.length >= 5 && userId) {
          pressTimestamps.current = []
          activateRecovery(userId, onRecovery)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [userId, onRecovery])
}

async function activateRecovery(userId: string, onRecovery?: () => void) {
  await resetBugLevel(userId)
  
  // Clear local storage metrics that maintain virus constraints/states
  localStorage.removeItem('rage_local_virus_files')
  localStorage.removeItem('rage_virus_exec_count')
  localStorage.removeItem('rage_last_virus_type')
  localStorage.removeItem('rage_last_virus_name')
  localStorage.removeItem('rage_os_crashed')

  // Try to dispatch a clear-windows event so the UI refreshes state dynamically if possible
  window.dispatchEvent(new CustomEvent('rage_clear_windows'))
  
  alert('🛠️ System Recovery Activated\n\nBug level reset to 0.\nVirus files cleared.\nSystem stabilized.')
  
  if (onRecovery) onRecovery()
  else window.location.reload()
}
