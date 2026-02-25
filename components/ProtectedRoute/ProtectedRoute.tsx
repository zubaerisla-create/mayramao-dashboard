// components/ProtectedRoute/ProtectedRoute.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector } from '@/lib/store/hooks'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter()
  const { accessToken } = useAppSelector((state) => state.auth)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAuth = setTimeout(() => {
      if (!accessToken) {
        router.push('/login')
      }
      setIsChecking(false)
    }, 100)

    return () => clearTimeout(checkAuth)
  }, [accessToken, router])

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  if (!accessToken) {
    return null
  }

  return <>{children}</>
}