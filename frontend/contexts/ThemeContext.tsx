'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { FontFamily } from '@/lib/fonts'

type Theme = 'ocean' | 'sunset' | 'forest'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  fontFamily: FontFamily
  setFontFamily: (font: FontFamily) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const THEMES: Theme[] = ['ocean', 'sunset', 'forest']

function isTheme(value: string | null | undefined): value is Theme {
  return value != null && THEMES.includes(value as Theme)
}

function isFontFamily(value: string | null | undefined): value is FontFamily {
  const validFonts = ['dm_sans', 'inter', 'roboto', 'open_sans', 'lato', 'montserrat', 'oswald', 'poppins', 'raleway', 'source_sans', 'noto_serif']
  return value != null && validFonts.includes(value)
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

function getInitialFont(): FontFamily {
  if (typeof window === 'undefined') {
    return 'dm_sans'
  }

  const stored = localStorage.getItem('fontFamily')
  if (isFontFamily(stored)) {
    return stored
  }

  return 'dm_sans'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)
  const [fontFamily, setFontFamily] = useState<FontFamily>(getInitialFont)

  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme | null
    if (isTheme(stored)) {
      setTheme(stored)
    }
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem('fontFamily') as FontFamily | null
    if (isFontFamily(stored)) {
      setFontFamily(stored)
    }
  }, [])

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<{ theme?: Theme; fontFamily?: FontFamily }>
      const nextTheme = customEvent.detail?.theme
      const nextFont = customEvent.detail?.fontFamily
      
      if (isTheme(nextTheme)) {
        setTheme(nextTheme)
      }
      if (isFontFamily(nextFont)) {
        setFontFamily(nextFont)
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

  useEffect(() => {
    document.documentElement.setAttribute('data-font', fontFamily)
    localStorage.setItem('fontFamily', fontFamily)
    
    // Dispatch custom event for font change
    window.dispatchEvent(
      new CustomEvent('fontchange', {
        detail: { fontFamily }
      })
    )
  }, [fontFamily])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, fontFamily, setFontFamily }}>
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
