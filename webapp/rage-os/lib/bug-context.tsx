'use client'
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAuth } from './auth-context'
import { getBugLevel, BUG_EFFECTS, getBugTier, triggerBugEffect, type BugTier } from './bug-engine'

interface BugContextType {
  bugLevel: number
  bugTier: BugTier
  setBugLevel: (level: number) => void
  applyRandomBugEffect: () => void
}

const BugContext = createContext<BugContextType>({
  bugLevel: 0,
  bugTier: 'LOW',
  setBugLevel: () => {},
  applyRandomBugEffect: () => {},
})

export function BugProvider({ children }: { children: React.ReactNode }) {
  const { userId } = useAuth()
  const [bugLevel, setBugLevelState] = useState(0)

  useEffect(() => {
    if (userId) {
      getBugLevel(userId).then(setBugLevelState)
    }
  }, [userId])

  function setBugLevel(level: number) {
    setBugLevelState(level)
  }

  const applyRandomBugEffect = useCallback(() => {
    const tier = getBugTier(bugLevel)
    const effects = BUG_EFFECTS[tier]
    const effect = effects[Math.floor(Math.random() * effects.length)]
    triggerBugEffect(effect)
  }, [bugLevel])

  return (
    <BugContext.Provider
      value={{ bugLevel, bugTier: getBugTier(bugLevel), setBugLevel, applyRandomBugEffect }}
    >
      {children}
    </BugContext.Provider>
  )
}

export const useBugEngine = () => useContext(BugContext)
