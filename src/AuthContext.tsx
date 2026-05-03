import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { User } from './types'
import { updateStreak } from './firebaseService'

interface AuthContextType {
  user: User | null
  streak: number
  login: (user: User) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('elevate_user')
    return stored ? JSON.parse(stored) : null
  })
  const [streak, setStreak] = useState<number>(0)

  useEffect(() => {
    if (user) setStreak(user.streak)
  }, [user])

  const login = async (u: User) => {
    const newStreak = await updateStreak(u.username)
    const updated = { ...u, streak: newStreak }
    setUser(updated)
    setStreak(newStreak)
    localStorage.setItem('elevate_user', JSON.stringify(updated))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('elevate_user')
  }

  return (
    <AuthContext.Provider value={{ user, streak, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
