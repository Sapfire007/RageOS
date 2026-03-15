'use client'
export const dynamic = 'force-dynamic'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const userId = localStorage.getItem('rage_os_user_id')
    if (userId) {
      router.replace('/desktop')
    } else {
      router.replace('/setup')
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7]">
      <div className="text-center">
        <div className="text-4xl mb-2 animate-pulse">💻</div>
        <p className="text-sm text-[#6e6e73]">Loading RageOS...</p>
      </div>
    </div>
  )
}
