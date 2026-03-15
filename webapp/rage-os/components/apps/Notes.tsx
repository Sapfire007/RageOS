// Stitch prompt: "A sticky notes app window: soft yellow background, top toolbar with 'New Note' button and a counter badge, list of note cards below each with a title, body preview (2 lines), timestamp, and delete (x) button. Notes feel slightly rotated/handwritten. Dark bordered textarea when editing."
'use client'
import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'

interface Note {
  id: string
  user_id: string
  title: string
  body: string
  created_at: string
}

export default function Notes() {
  const { userId } = useAuth()
  const [notes, setNotes] = useState<Note[]>([])
  const [editing, setEditing] = useState<null | 'new'>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [draft, setDraft] = useState({ title: '', body: '' })
  const [saving, setSaving] = useState(false)

  const loadNotes = useCallback(async () => {
    if (!userId) return
    const { data } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (data) setNotes(data)
  }, [userId])

  useEffect(() => {
    loadNotes()
  }, [loadNotes])

  async function saveNote() {
    if (!draft.title && !draft.body) { setEditing(null); return }
    setSaving(true)

    // Transform via rage-bait AI
    let rageyTitle = draft.title || 'Untitled'
    let rageyBody = draft.body
    try {
      const res = await fetch('/api/ragebait-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: draft.title || 'Untitled', body: draft.body }),
      })
      if (res.ok) {
        const json = await res.json()
        rageyTitle = json.title ?? rageyTitle
        rageyBody = json.body ?? rageyBody
      }
    } catch { /* use originals */ }

    // Persist to Supabase
    if (userId) {
      const { data } = await supabase
        .from('notes')
        .insert({ user_id: userId, title: rageyTitle, body: rageyBody })
        .select()
        .single()
      if (data) setNotes((prev) => [data, ...prev])
    } else {
      // Fallback: local only
      setNotes((prev) => [{
        id: crypto.randomUUID(),
        user_id: '',
        title: rageyTitle,
        body: rageyBody,
        created_at: new Date().toISOString(),
      }, ...prev])
    }

    setDraft({ title: '', body: '' })
    setEditing(null)
    setSaving(false)
  }

  async function deleteNote(id: string) {
    await supabase.from('notes').delete().eq('id', id)
    setNotes((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <div style={{ width: 380, minHeight: 300 }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold desktop-text">
          Notes{' '}
          {notes.length > 0 && (
            <span className="ml-1 text-xs bg-yellow-400 text-black rounded-full px-1.5 py-0.5">
              {notes.length}
            </span>
          )}
        </h3>
        <Button size="sm" onClick={() => setEditing('new')}>New Note</Button>
      </div>

      {editing === 'new' && (
        <div className="mb-3 border-2 border-black rounded-lg p-2 bg-yellow-50">
          <input
            className="w-full text-sm font-semibold bg-transparent outline-none mb-1 border-b border-black/20 pb-1"
            placeholder="Title..."
            value={draft.title}
            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
          />
          <textarea
            className="w-full text-xs bg-transparent outline-none resize-none"
            rows={3}
            placeholder="Write something..."
            value={draft.body}
            onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
          />
          <div className="flex gap-2 mt-1 justify-end">
            <Button size="sm" variant="outline" onClick={() => { setEditing(null); setDraft({ title: '', body: '' }) }}>Cancel</Button>
            <Button size="sm" onClick={saveNote} disabled={saving}>
              {saving ? 'Judging you...' : 'Save'}
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2 overflow-auto" style={{ maxHeight: 360 }}>
        {notes.length === 0 && !editing && (
          <p className="text-xs text-[#6e6e73] text-center py-6">No notes yet. But do you really need notes?</p>
        )}
        {notes.map((note, i) => {
          const isExpanded = expandedId === note.id
          return (
          <div
            key={note.id}
            className="bg-yellow-100 border border-yellow-300 rounded p-2 text-xs relative cursor-pointer hover:border-yellow-500 transition-colors"
            style={{ transform: `rotate(${(i % 2 === 0 ? 1 : -1) * 0.5}deg)` }}
            onClick={() => setExpandedId(isExpanded ? null : note.id)}
          >
            <button
              onClick={(e) => { e.stopPropagation(); deleteNote(note.id) }}
              className="absolute top-1 right-1 text-gray-400 hover:text-red-500 text-xs leading-none"
            >
              ✕
            </button>
            <p className="font-semibold truncate pr-4 mb-0.5">{note.title}</p>
            <p className={`text-[#6e6e73] whitespace-pre-wrap wrap-break-word ${isExpanded ? '' : 'line-clamp-2'}`}>
              {note.body}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              {new Date(note.created_at).toLocaleTimeString()}
              {!isExpanded && note.body && note.body.length > 80 && (
                <span className="ml-1 text-yellow-600">▼ tap to read</span>
              )}
              {isExpanded && <span className="ml-1 text-yellow-600">▲ collapse</span>}
            </p>
          </div>
          )
        })}
      </div>
    </div>
  )
}
