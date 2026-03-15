// Stitch prompt: "A recycle bin app window: white background, file list with icon (trash emoji), filename, size, and 'Restore' button per row. Large 'Empty Bin' red button at the bottom. Warning dialog when user tries to restore: file is corrupt and unrecoverable."
'use client'
import { useState } from 'react'

const DELETED_FILES = [
  { name: 'your_dreams.psd', size: '4.2 GB', date: '2019-06-12' },
  { name: 'backup_FINAL_v3_REAL.zip', size: '2.1 GB', date: '2022-11-09' },
  { name: 'social_life.exe', size: '512 MB', date: '2020-03-14' },
  { name: 'motivation.dll', size: '0 KB', date: '2023-01-01' },
  { name: 'thesis_final_FINAL.docx', size: '87 KB', date: '2024-05-22' },
  { name: 'sleep_schedule.json', size: '1.2 KB', date: '2021-08-08' },
  { name: 'gym_membership_receipt.pdf', size: '44 KB', date: '2023-02-14' },
  { name: 'good_vibes_only.mp3', size: '3.8 MB', date: '2018-12-31' },
]

export default function RecycleBin() {
  const [files, setFiles] = useState(DELETED_FILES)
  const [error, setError] = useState<string | null>(null)

  function restore(name: string) {
    setError(`Cannot restore "${name}": file is permanently corrupted. Consider it gone.`)
    setTimeout(() => setError(null), 3500)
  }

  function emptyBin() {
    setFiles([])
    setError('Bin emptied. Your dreams are truly gone now.')
    setTimeout(() => setError(null), 4000)
  }

  return (
    <div style={{ width: 400, minHeight: 300 }}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold desktop-text text-sm">Recycle Bin 🗑️</h3>
        <span className="text-[10px] text-[#6e6e73]">{files.length} item{files.length !== 1 ? 's' : ''}</span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-2 py-1.5 mb-2">
          ⚠️ {error}
        </div>
      )}

      <div className="overflow-auto space-y-1 mb-3" style={{ maxHeight: 240 }}>
        {files.length === 0 ? (
          <p className="text-xs text-[#6e6e73] text-center py-8">Bin is empty. But so is your heart.</p>
        ) : (
          files.map((f) => (
            <div key={f.name} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-black/5 group">
              <span className="text-base">🗑️</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate desktop-text">{f.name}</p>
                <p className="text-[10px] text-[#6e6e73]">
                  {f.size} · deleted {f.date}
                </p>
              </div>
              <button
                onClick={() => restore(f.name)}
                className="text-[10px] text-[#007aff] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
              >
                Restore
              </button>
            </div>
          ))
        )}
      </div>

      {files.length > 0 && (
        <button
          onClick={emptyBin}
          className="w-full text-xs font-medium text-red-600 border border-red-200 rounded-lg py-1.5 hover:bg-red-50 transition-colors"
        >
          Empty Recycle Bin
        </button>
      )}
    </div>
  )
}
