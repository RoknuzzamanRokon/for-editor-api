'use client'

export interface MarketingTheme {
  mode: 'sunset'
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

const sunset: MarketingTheme = {
  mode: 'sunset',
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
export type ThemeMode = 'sunset'

export function getTheme(): MarketingTheme {
  return sunset
}

export function useMarketingTheme() {
  return {
    theme: getTheme(),
    mode: 'sunset' as ThemeMode,
  }
}

export function cardClass(extra = '') {
  const base = 'rounded-3xl border transition-all'
  const surface = 'border-orange-500/20 bg-slate-950/95 shadow-[0_16px_34px_rgba(2,6,23,0.42),0_0_18px_rgba(249,115,22,0.08)]'
  return `${base} ${surface} ${extra}`.trim()
}

export function sectionClass(_variant: 'primary' | 'secondary' = 'primary', extra = '') {
  return `bg-slate-950 ${extra}`.trim()
}
