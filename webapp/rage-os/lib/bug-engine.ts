import { supabase } from './supabase'

// ── Bug Level CRUD ──────────────────────────────────────────────

export async function incrementBugLevel(userId: string, amount: number = 1): Promise<number> {
  const { data } = await supabase
    .from('users')
    .select('bug_level')
    .eq('id', userId)
    .single()

  const newBugLevel = (data?.bug_level ?? 0) + amount

  await supabase.from('users').update({ bug_level: newBugLevel }).eq('id', userId)

  return newBugLevel
}

export async function getBugLevel(userId: string): Promise<number> {
  const { data } = await supabase
    .from('users')
    .select('bug_level')
    .eq('id', userId)
    .single()
  return data?.bug_level ?? 0
}

export async function resetBugLevel(userId: string) {
  await supabase.from('users').update({ bug_level: 0 }).eq('id', userId)
  await supabase.from('virus_files').delete().eq('user_id', userId)
}

// ── Tiers ───────────────────────────────────────────────────────

export type BugTier = 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME'

export function getBugTier(bugLevel: number): BugTier {
  if (bugLevel >= 51) return 'EXTREME'
  if (bugLevel >= 26) return 'HIGH'
  if (bugLevel >= 11) return 'MEDIUM'
  return 'LOW'
}

export const BUG_EFFECTS: Record<BugTier, string[]> = {
  LOW: ['randomWarningPopup', 'glitchText', 'minorDelays'],
  MEDIUM: ['spawnVirusFiles', 'randomErrorMessages', 'cursorGlitch'],
  HIGH: ['windowLoadingDelays', 'interfaceGlitches', 'randomPopups', 'mouseOffsetDrift'],
  EXTREME: ['crashWarnings', 'systemInstabilityMessages', 'screenShake', 'randomReboot'],
}

// ── Effects ─────────────────────────────────────────────────────

export function triggerBugEffect(effect: string) {
  switch (effect) {
    case 'randomWarningPopup':
      showWarning('Warning: System karma dangerously low')
      break
    case 'glitchText':
      applyGlitchAnimation()
      break
    case 'screenShake':
      document.body.classList.add('screen-shake')
      setTimeout(() => document.body.classList.remove('screen-shake'), 500)
      break
    default:
      break
  }
}

function showWarning(message: string) {
  console.warn('[BugEngine]', message)
}

function applyGlitchAnimation() {
  const elements = document.querySelectorAll('.desktop-text')
  elements.forEach((el) => {
    el.classList.add('glitch-effect')
    setTimeout(() => el.classList.remove('glitch-effect'), 1000)
  })
}

// ── Virus spawn check ────────────────────────────────────────────

export async function checkAndSpawnVirus(userId: string, bugLevel: number): Promise<boolean> {
  // Always spawn a virus if level is high enough, or with probability
  if (bugLevel >= 5) {
     // Higher level = higher chance, capped at 80%
     const chance = Math.min((bugLevel - 4) * 0.1, 0.8)
     if (Math.random() < chance) {
        const { createVirusFile } = await import('./virus-generator')
        await createVirusFile(userId, bugLevel)
        return true
     }
  }
  return false
}
