'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'

interface AuthContextType {
  userId: string | null
  user: any | null
  loading: boolean
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  userId: null,
  user: null,
  loading: true,
  refreshUser: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUserId =
      typeof window !== 'undefined' ? localStorage.getItem('rage_os_user_id') : null
    if (storedUserId) {
      loadUser(storedUserId)
    } else {
      setLoading(false)
    }
  }, [])

  async function loadUser(id: string) {
    const { data } = await supabase.from('users').select('*').eq('id', id).single()
    if (data) {
      setUser(data)
      setUserId(id)
    }
    setLoading(false)
  }

  async function refreshUser() {
    if (userId) await loadUser(userId)
  }

  return (
    <AuthContext.Provider value={{ userId, user, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
