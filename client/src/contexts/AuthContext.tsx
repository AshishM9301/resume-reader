'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { User } from 'firebase/auth'
import { onAuthChange, getCurrentUser } from '@/lib/firebase'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<User>
  register: (email: string, password: string) => Promise<User>
  logout: () => Promise<void>
  refreshUser: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { loginWithEmail } = await import('@/lib/firebase')
    const result = await loginWithEmail(email, password)
    return result.user
  }, [])

  const register = useCallback(async (email: string, password: string) => {
    const { registerWithEmail } = await import('@/lib/firebase')
    const result = await registerWithEmail(email, password)
    return result.user
  }, [])

  const logout = useCallback(async () => {
    const { logout: firebaseLogout } = await import('@/lib/firebase')
    await firebaseLogout()
  }, [])

  const refreshUser = useCallback(() => {
    setUser(getCurrentUser())
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
