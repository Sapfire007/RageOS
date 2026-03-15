import { supabase } from './supabase'

export const VIRUS_TEMPLATES = [
  { name: 'bitcoin_miner', extension: '.exe', icon: '💰' },
  { name: 'career_destroyer', extension: '.dll', icon: '💼' },
  { name: 'totally_not_virus', extension: '.zip', icon: '📦' },
  { name: 'homework_stealer', extension: '.exe', icon: '📚' },
  { name: 'grade_reducer', extension: '.bat', icon: '📉' },
  { name: 'motivation_killer', extension: '.sys', icon: '😵' },
  { name: 'procrastination_engine', extension: '.dll', icon: '⏰' },
  { name: 'focus_destroyer', extension: '.exe', icon: '🎯' },
  { name: 'ambition_remover', extension: '.exe', icon: '🗑️' },
  { name: 'sleep_schedule_ruiner', extension: '.bat', icon: '🌙' },
]

export async function createVirusFile(userId: string, bugLevel: number) {
  const template = VIRUS_TEMPLATES[Math.floor(Math.random() * VIRUS_TEMPLATES.length)]
  const timestamp = Date.now().toString().slice(-5)
  // Ensure unique name so DB doesn't complain about unique constraints if added later
  // and so user can have multiple copies of the same virus type
  const filename = `${template.name}_${timestamp}${template.extension}`

  const { data, error } = await supabase
    .from('virus_files')
    .insert({ user_id: userId, filename, file_type: template.extension, bug_level_threshold: bugLevel })
    .select()
    .single()

  if (error) {
    console.warn('DB creation failed (likely offline/permissions). Using localStorage fallback.', error.message)
    
    // Simulate creation for demo purposes when DB fails
    const fakeId = typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).substring(2)
    const fakeVirus = {
        id: fakeId,
        user_id: userId,
        filename,
        file_type: template.extension,
        created_at: new Date().toISOString(),
        bug_level_threshold: bugLevel
    }
    
    // Store in localStorage
    if (typeof window !== 'undefined') {
        try {
            const raw = localStorage.getItem('rage_local_virus_files')
            const existing = raw ? JSON.parse(raw) : []
            // Append
            existing.push(fakeVirus)
            localStorage.setItem('rage_local_virus_files', JSON.stringify(existing))
            // console.log('[VirusGenerator] Saved to localStorage:', fakeVirus)
        } catch (e) {
            console.warn('[VirusGenerator] LocalStorage save failed:', e)
        }
    }
    
    // Crucial: Return the fake virus object so the UI can use it immediately!
    return { ...fakeVirus, icon: template.icon }
  }

  return { ...data, icon: template.icon }
}

export async function getVirusFiles(userId: string) {
  let dbData: any[] = []
  let dbError = null

  try {
      if (userId) { // Only fetch if userId exists
        const res = await supabase
            .from('virus_files')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: true })
        if (res.data) dbData = res.data
        if (res.error) dbError = res.error
      }
  } catch (err) {
      console.warn('Supabase fetch threw error:', err)
      dbError = err
  }
    
  // Also get local files
  let localFiles: any[] = []
  try {
      if (typeof window !== 'undefined') {
          const raw = localStorage.getItem('rage_local_virus_files')
          localFiles = raw ? JSON.parse(raw) : []
          // Filter by user ID if present, otherwise include all for debug
          if (userId) {
             // Relaxed filter: match ID or if the file has no ID (legacy)
             localFiles = localFiles.filter((f: any) => !f.user_id || f.user_id === userId)
          }
      }
  } catch (e) {
      console.warn('Failed to read local virus files', e)
  }

  if (dbError) {
      console.warn('[VirusGenerator] DB Fetch failed, returning local files:', localFiles)
      // Even if DB fails, return local files so the UI works
      return localFiles
  }
  
  // Combine and deduplicate by ID
  const combined = [...dbData, ...localFiles]
  
  // Deduplicate based on unique ID
  const map = new Map();
  for (const item of combined) {
      if (item.id) map.set(item.id, item);
  }
  
  return Array.from(map.values());
}

export function getVirusIcon(filename: string): string {
  const template = VIRUS_TEMPLATES.find((t) => filename.startsWith(t.name))
  return template?.icon ?? '☠️'
}

export function executeVirus(): string[] {
  return [
    'Initializing malware...',
    'Stealing RAM... 47% complete',
    'Uploading homework to dark web...',
    'Mining emotional damage...',
    'Deleting motivation.exe...',
    'Installing procrastination module...',
    'Reducing grades by 20%...',
    'Destroying career prospects...',
    'Draining battery life...',
    'Operation failed successfully.',
  ]
}
