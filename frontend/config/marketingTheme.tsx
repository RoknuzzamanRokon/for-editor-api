'use client'

import { useEffect, useState } from 'react'

export interface MarketingTheme {
  mode: 'light' | 'dark'
  bg: string
  bgSecondary: string
  surface: string
  card: string
  cardHover: string
  text: string
  textMuted: string
  heading: string
  primary: string
  primaryHover: string
  secondary: string
  accent: string
  border: string
  divider: string
  buttonBg: string
  buttonText: string
  buttonHover: string
  buttonOutlineBg: string
  buttonOutlineText: string
  buttonOutlineBorder: string
  buttonOutlineHover: string
  link: string
  linkHover: string
  success: string
  warning: string
  error: string
  glassBg: string
  glassBorder: string
  headerBg: string
  headerBorder: string
  codeBlockBg: string
  codeBlockText: string
  codeBlockBorder: string
  shellBg: string
  panelShadow: string
  elevatedCardShadow: string
  softCardShadow: string
  actionShadow: string
}

export type ThemeMode = 'light' | 'dark'

const light: MarketingTheme = {
  mode: 'light',
  bg: '#ffffff',
  bgSecondary: '#f8fafc',
  surface: '#f1f5f9',
  card: '#ffffff',
  cardHover: '#f8fafc',
  text: '#475569',
  textMuted: '#64748b',
  heading: '#0f172a',
  primary: '#2563eb',
  primaryHover: '#1d4ed8',
  secondary: '#334155',
  accent: '#0f172a',
  border: '#e2e8f0',
  divider: '#e5e7eb',
  buttonBg: '#0f172a',
  buttonText: '#ffffff',
  buttonHover: '#1e293b',
  buttonOutlineBg: '#ffffff',
  buttonOutlineText: '#0f172a',
  buttonOutlineBorder: '#cbd5e1',
  buttonOutlineHover: '#f8fafc',
  link: '#0f172a',
  linkHover: '#2563eb',
  success: '#16a34a',
  warning: '#d97706',
  error: '#dc2626',
  glassBg: 'bg-white/90 backdrop-blur-md',
  glassBorder: 'border border-slate-200/80',
  headerBg: 'bg-white/90 backdrop-blur-md',
  headerBorder: 'border-slate-200/80',
  codeBlockBg: '#0f172a',
  codeBlockText: '#e2e8f0',
  codeBlockBorder: '#1e293b',
  shellBg: '#f1f5f9',
  panelShadow: '0 24px 80px rgba(15,23,42,0.12)',
  elevatedCardShadow: '0 24px 60px rgba(15,23,42,0.16), 0 10px 28px rgba(15,23,42,0.10)',
  softCardShadow: '0 18px 42px rgba(15,23,42,0.08)',
  actionShadow: '0 18px 38px rgba(15,23,42,0.14)',
}

const dark: MarketingTheme = {
  mode: 'dark',
  bg: '#020617',
  bgSecondary: '#0b1120',
  surface: '#111827',
  card: '#09111f',
  cardHover: '#111827',
  text: '#d6d3d1',
  textMuted: '#a8a29e',
  heading: '#f8fafc',
  primary: '#f97316',
  primaryHover: '#fb923c',
  secondary: '#fed7aa',
  accent: '#ffb17a',
  border: 'rgba(249,115,22,0.28)',
  divider: 'rgba(249,115,22,0.18)',
  buttonBg: '#f97316',
  buttonText: '#111827',
  buttonHover: '#fb923c',
  buttonOutlineBg: '#0b1220',
  buttonOutlineText: '#fed7aa',
  buttonOutlineBorder: 'rgba(251,146,60,0.35)',
  buttonOutlineHover: '#111827',
  link: '#fed7aa',
  linkHover: '#fb923c',
  success: '#4ade80',
  warning: '#fbbf24',
  error: '#f87171',
  glassBg: 'bg-slate-950/85 backdrop-blur-md',
  glassBorder: 'border border-orange-500/20',
  headerBg: 'bg-slate-950/88 backdrop-blur-md',
  headerBorder: 'border-orange-500/20',
  codeBlockBg: '#020617',
  codeBlockText: '#d6d3d1',
  codeBlockBorder: 'rgba(249,115,22,0.24)',
  shellBg: '#020617',
  panelShadow: '0 28px 90px rgba(2,6,23,0.58), 0 0 0 1px rgba(249,115,22,0.12), 0 0 50px rgba(249,115,22,0.14)',
  elevatedCardShadow: '0 24px 56px rgba(2,6,23,0.58), 0 0 26px rgba(249,115,22,0.14)',
  softCardShadow: '0 16px 34px rgba(2,6,23,0.42), 0 0 18px rgba(249,115,22,0.08)',
  actionShadow: '0 0 24px rgba(249,115,22,0.18)',
}

const themes = { light, dark } as const

function isThemeMode(value: string | null | undefined): value is ThemeMode {
  return value === 'light' || value === 'dark'
}

function getInitialMode(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'light'
  }

  const rootMode = document.documentElement.getAttribute('data-theme')
  if (isThemeMode(rootMode)) {
    return rootMode
  }

  const stored = localStorage.getItem('marketing-theme')
  return isThemeMode(stored) ? stored : 'light'
}

export function getTheme(mode: ThemeMode = 'light'): MarketingTheme {
  return themes[mode]
}

export function useMarketingTheme() {
  const [mode, setModeState] = useState<ThemeMode>(getInitialMode)

  useEffect(() => {
    const nextMode = getInitialMode()
    setModeState(nextMode)
    document.documentElement.setAttribute('data-theme', nextMode)

    const handleThemeChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ mode?: ThemeMode }>
      const nextTheme = customEvent.detail?.mode
      if (!isThemeMode(nextTheme)) {
        return
      }
      setModeState(nextTheme)
      document.documentElement.setAttribute('data-theme', nextTheme)
    }

    window.addEventListener('marketingthemechange', handleThemeChange)
    return () => {
      window.removeEventListener('marketingthemechange', handleThemeChange)
    }
  }, [])

  const setMode = (nextMode: ThemeMode) => {
    setModeState(nextMode)
    localStorage.setItem('marketing-theme', nextMode)
    document.documentElement.setAttribute('data-theme', nextMode)
    window.dispatchEvent(
      new CustomEvent('marketingthemechange', { detail: { mode: nextMode } }),
    )
  }

  const toggle = () => setMode(mode === 'light' ? 'dark' : 'light')

  return {
    theme: getTheme(mode),
    mode,
    toggle,
    setMode,
  }
}

export function cardClass(mode: ThemeMode, extra = '') {
  const base = 'rounded-3xl border transition-all'
  const surface =
    mode === 'dark'
      ? 'border-orange-500/20 bg-slate-950/95 shadow-[0_16px_34px_rgba(2,6,23,0.42),0_0_18px_rgba(249,115,22,0.08)]'
      : 'border-slate-200 bg-white'
  return `${base} ${surface} ${extra}`.trim()
}

export function sectionClass(mode: ThemeMode, _variant: 'primary' | 'secondary' = 'primary', extra = '') {
  const surface = mode === 'dark' ? 'bg-slate-950' : 'bg-white'
  return `${surface} ${extra}`.trim()
}
