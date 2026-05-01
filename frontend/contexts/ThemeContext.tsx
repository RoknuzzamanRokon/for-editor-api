'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Theme = 'ocean' | 'sunset' | 'forest'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const THEMES: Theme[] = ['ocean', 'sunset', 'forest']

function isTheme(value: string | null | undefined): value is Theme {
  return value != null && THEMES.includes(value as Theme)
}

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') {
    return 'sunset'
  }

  const root = document.documentElement
  const stored = localStorage.getItem('theme')

  if (isTheme(stored)) {
    return stored
  }

  const classTheme = THEMES.find((themeName) => root.classList.contains(themeName))
  return classTheme ?? 'sunset'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme | null
    if (isTheme(stored)) {
      setTheme(stored)
    }
  }, [])

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<{ theme?: Theme }>
      const nextTheme = customEvent.detail?.theme
      if (isTheme(nextTheme)) {
        setTheme(nextTheme)
      }
    }

    window.addEventListener('themechange', handler)
    return () => window.removeEventListener('themechange', handler)
  }, [])

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark', 'ocean', 'sunset', 'forest', 'midnight', 'livedark')
    document.documentElement.classList.add(theme)
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', theme)
  }, [theme])

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
