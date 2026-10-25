'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
  cycleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>('system')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')

  const applyTheme = (t: Theme) => {
    const isDark = t === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : t === 'dark'
    setResolvedTheme(isDark ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', isDark)
  }

  useEffect(() => {
    const saved = localStorage.getItem('theme') as Theme | null
    if (saved) {
      setThemeState(saved)
      applyTheme(saved)
    } else {
      applyTheme('system')
    }
  }, [])

  useEffect(() => {
    if (theme !== 'system') return
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyTheme('system')
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [theme])

  const setTheme = (t: Theme) => {
    setThemeState(t)
    localStorage.setItem('theme', t)
    applyTheme(t)
  }

  const cycleTheme = () => {
    const order: Theme[] = ['light', 'dark', 'system']
    const idx = order.indexOf(theme)
    const next = order[(idx + 1) % order.length]
    setTheme(next)
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}