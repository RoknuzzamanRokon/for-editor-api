'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Theme = 'light' | 'dark' | 'ocean' | 'sunset' | 'forest' | 'midnight' | 'livedark'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('theme') as Theme | null
    if (
      stored === 'light' ||
      stored === 'dark' ||
      stored === 'ocean' ||
      stored === 'sunset' ||
      stored === 'forest' ||
      stored === 'midnight' ||
      stored === 'livedark'
    ) {
      setTheme(stored)
    }
  }, [])

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<{ theme?: Theme }>
      const nextTheme = customEvent.detail?.theme
      if (
        nextTheme === 'light' ||
        nextTheme === 'dark' ||
        nextTheme === 'ocean' ||
        nextTheme === 'sunset' ||
        nextTheme === 'forest' ||
        nextTheme === 'midnight' ||
        nextTheme === 'livedark'
      ) {
        setTheme(nextTheme)
      }
    }

    window.addEventListener('themechange', handler)
    return () => window.removeEventListener('themechange', handler)
  }, [])

  useEffect(() => {
    if (mounted) {
      document.documentElement.classList.remove('light', 'dark', 'ocean', 'sunset', 'forest', 'midnight', 'livedark')
      document.documentElement.classList.add(theme)
      if (theme !== 'light') {
        document.documentElement.classList.add('dark')
        localStorage.setItem('theme_last_non_light', theme)
      }
      localStorage.setItem('theme', theme)
    }
  }, [theme, mounted])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
