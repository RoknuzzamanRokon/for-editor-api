'use client'

export interface MarketingTheme {
  mode: 'light'
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
}

export type ThemeMode = 'light'

const theme: MarketingTheme = {
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
}

export function getTheme(): MarketingTheme {
  return theme
}

export function useMarketingTheme() {
  return {
    theme,
    mode: theme.mode,
    toggle: () => {},
    setMode: (_mode: ThemeMode) => {},
  }
}

export function cardClass(_mode: ThemeMode, extra = '') {
  const base = 'rounded-3xl border border-slate-200 bg-white transition-all'
  return `${base} ${extra}`.trim()
}

export function sectionClass(_mode: ThemeMode, _variant: 'primary' | 'secondary' = 'primary', extra = '') {
  return `${extra}`.trim()
}
