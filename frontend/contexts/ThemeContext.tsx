'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { FontFamily } from '@/lib/fonts'

type Theme = 'ocean' | 'sunset' | 'forest' | 'paper' | 'crimson' | 'burgundy'
export type FontSize = 'small' | 'medium' | 'large' | 'xlarge'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  fontFamily: FontFamily
  setFontFamily: (font: FontFamily) => void
  fontSize: FontSize
  setFontSize: (size: FontSize) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const THEMES: Theme[] = ['ocean', 'sunset', 'forest', 'paper', 'crimson', 'burgundy']
const LIGHT_THEMES: Theme[] = ['paper']
const VALID_FONTS = ['dm_sans', 'inter', 'roboto', 'open_sans', 'lato', 'montserrat', 'oswald', 'raleway', 'source_sans']
const VALID_SIZES: FontSize[] = ['small', 'medium', 'large', 'xlarge']

function isTheme(v: string | null | undefined): v is Theme {
  return v != null && THEMES.includes(v as Theme)
}

function isFontFamily(v: string | null | undefined): v is FontFamily {
  return v != null && VALID_FONTS.includes(v)
}

function isFontSize(v: string | null | undefined): v is FontSize {
  return v != null && VALID_SIZES.includes(v as FontSize)
}

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'sunset'
  const stored = localStorage.getItem('theme')
  if (isTheme(stored)) return stored
  const classTheme = THEMES.find((t) => document.documentElement.classList.contains(t))
  return classTheme ?? 'sunset'
}

function getInitialFont(): FontFamily {
  if (typeof window === 'undefined') return 'dm_sans'
  const stored = localStorage.getItem('fontFamily')
  return isFontFamily(stored) ? stored : 'dm_sans'
}

function getInitialFontSize(): FontSize {
  if (typeof window === 'undefined') return 'medium'
  const stored = localStorage.getItem('fontSize')
  return isFontSize(stored) ? stored : 'medium'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)
  const [fontFamily, setFontFamily] = useState<FontFamily>(getInitialFont)
  const [fontSize, setFontSize] = useState<FontSize>(getInitialFontSize)

  // Sync theme from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme | null
    if (isTheme(stored)) setTheme(stored)
  }, [])

  // Sync font from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('fontFamily') as FontFamily | null
    if (isFontFamily(stored)) setFontFamily(stored)
  }, [])

  // Sync font size from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('fontSize') as FontSize | null
    if (isFontSize(stored)) setFontSize(stored)
  }, [])

  // Listen for external theme/font changes
  useEffect(() => {
    const handler = (event: Event) => {
      const e = event as CustomEvent<{ theme?: Theme; fontFamily?: FontFamily; fontSize?: FontSize }>
      if (isTheme(e.detail?.theme)) setTheme(e.detail.theme!)
      if (isFontFamily(e.detail?.fontFamily)) setFontFamily(e.detail.fontFamily!)
      if (isFontSize(e.detail?.fontSize)) setFontSize(e.detail.fontSize!)
    }
    window.addEventListener('themechange', handler)
    return () => window.removeEventListener('themechange', handler)
  }, [])

  // Apply theme to DOM
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark', 'ocean', 'sunset', 'forest', 'paper', 'crimson', 'burgundy', 'midnight', 'livedark')
    document.documentElement.classList.add(theme)
    if (!LIGHT_THEMES.includes(theme)) {
      document.documentElement.classList.add('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  // Apply font family to DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-font', fontFamily)
    localStorage.setItem('fontFamily', fontFamily)
    window.dispatchEvent(new CustomEvent('fontchange', { detail: { fontFamily } }))
  }, [fontFamily])

  // Apply font size to DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-font-size', fontSize)
    localStorage.setItem('fontSize', fontSize)
    window.dispatchEvent(new CustomEvent('fontsizechange', { detail: { fontSize } }))
  }, [fontSize])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, fontFamily, setFontFamily, fontSize, setFontSize }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider')
  return context
}
