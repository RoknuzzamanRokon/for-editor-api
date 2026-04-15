/**
 * marketingTheme.tsx
 * ─────────────────────────────────────────────────────────────
 * Centralized theme configuration for all marketing pages.
 * Controls every color token for both "light" and "sunset" modes.
 *
 * Usage:
 *   import { useMarketingTheme } from '@/config/marketingTheme'
 *   const t = useMarketingTheme()          // auto-reads localStorage
 *
 *   — or —
 *
 *   import { getTheme } from '@/config/marketingTheme'
 *   const t = getTheme('sunset')           // static / SSR-safe
 * ─────────────────────────────────────────────────────────────
 */

'use client'

import { useEffect, useState } from 'react'

// ─── Token shape ─────────────────────────────────────────────
export interface MarketingTheme {
  mode: 'light' | 'sunset'

  // Backgrounds
  bg: string            // page / outermost wrapper
  bgSecondary: string   // alternate section bg (e.g. features strip)
  surface: string       // subtle inset surface (e.g. code block bg)
  card: string          // card background
  cardHover: string     // card hover background

  // Text
  text: string          // body copy
  textMuted: string     // secondary / caption text
  heading: string       // h1–h3

  // Brand
  primary: string       // primary accent (buttons, links, icons)
  primaryHover: string  // primary on hover
  secondary: string     // secondary accent
  accent: string        // highlight / badge

  // Borders & dividers
  border: string        // card / section borders
  divider: string       // <hr> / row dividers

  // Buttons
  buttonBg: string
  buttonText: string
  buttonHover: string
  buttonOutlineBg: string
  buttonOutlineText: string
  buttonOutlineBorder: string
  buttonOutlineHover: string

  // Links
  link: string
  linkHover: string

  // Status
  success: string
  warning: string
  error: string

  // Glass / backdrop helpers (Tailwind class strings)
  glassBg: string       // e.g. "bg-white/90 backdrop-blur-md"
  glassBorder: string   // e.g. "border border-slate-200/60"
  headerBg: string      // header wrapper classes
  headerBorder: string  // header bottom border class
  codeBlockBg: string
  codeBlockText: string
  codeBlockBorder: string
}

// ─── Light theme ─────────────────────────────────────────────
const light: MarketingTheme = {
  mode: 'light',

  bg:           '#ffffff',
  bgSecondary:  '#f5f5f5',
  surface:      '#ebebeb',
  card:         '#ffffff',
  cardHover:    '#f9f9f9',

  text:         '#404040',
  textMuted:    '#888888',
  heading:      '#0a0a0a',

  primary:      '#0a0a0a',
  primaryHover: '#262626',
  secondary:    '#404040',
  accent:       '#171717',

  border:       '#e0e0e0',
  divider:      '#efefef',

  buttonBg:           '#0a0a0a',
  buttonText:         '#ffffff',
  buttonHover:        '#262626',
  buttonOutlineBg:    '#ffffff',
  buttonOutlineText:  '#0a0a0a',
  buttonOutlineBorder:'#d4d4d4',
  buttonOutlineHover: '#f5f5f5',

  link:         '#0a0a0a',
  linkHover:    '#404040',

  success:      '#16a34a',
  warning:      '#d97706',
  error:        '#dc2626',

  glassBg:      'bg-white/90 backdrop-blur-md',
  glassBorder:  'border border-neutral-200',
  headerBg:     'bg-white/90 backdrop-blur-md',
  headerBorder: 'border-neutral-200',
  codeBlockBg:  '#0a0a0a',
  codeBlockText: '#e5e5e5',
  codeBlockBorder: '#262626',
}
const sunset: MarketingTheme = {
  mode: 'sunset',

  // ── Backgrounds ───────────────────────────────────────────
  // html[data-theme='sunset'] in globals.css provides the animated
  // deep-warm gradient base. Sections use semi-transparent overlays.
  bg:           'rgba(30, 10, 2, 0.60)',          // dark warm overlay — shows gradient
  bgSecondary:  'rgba(90, 28, 8, 0.70)',          // richer warm strip
  surface:      'rgba(18, 6, 1, 0.80)',           // deep dark inset
  card:         'rgba(120, 40, 12, 0.45)',        // warm glass card
  cardHover:    'rgba(35, 33, 32, 0.94)',        // brighter on hover

  // ── Typography ────────────────────────────────────────────
  text:         '#fde8c8',                        // warm cream
  textMuted:    'rgba(253,232,200,0.58)',
  heading:      '#fff8f0',                        // near-white warm

  // ── Brand ─────────────────────────────────────────────────
  primary:      '#ff7c2a',                        // vivid sunset orange
  primaryHover: '#f96316',
  secondary:    '#ffb347',                        // golden amber
  accent:       '#ff4f6e',                        // sunset pink

  // ── Borders ───────────────────────────────────────────────
  border:       'rgba(255,140,50,0.28)',
  divider:      'rgba(255,140,50,0.14)',

  // ── Buttons ───────────────────────────────────────────────
  buttonBg:            '#ff7c2a',
  buttonText:          '#ffffff',
  buttonHover:         '#f96316',
  buttonOutlineBg:     'rgba(255,124,42,0.14)',
  buttonOutlineText:   '#fde8c8',
  buttonOutlineBorder: 'rgba(255,140,50,0.45)',
  buttonOutlineHover:  'rgba(255,124,42,0.24)',

  // ── Links ─────────────────────────────────────────────────
  link:         '#ffb347',
  linkHover:    '#ff7c2a',

  // ── Status ────────────────────────────────────────────────
  success:      '#4ade80',
  warning:      '#fbbf24',
  error:        '#ff6b6b',

  // ── Glass / chrome ────────────────────────────────────────
  glassBg:      'bg-[#5a1c08]/50 backdrop-blur-md',
  glassBorder:  'border border-orange-400/25',
  headerBg:     'bg-[#1e0a02]/60 backdrop-blur-xl',
  headerBorder: 'border-orange-400/20',

  // ── Code blocks ───────────────────────────────────────────
  codeBlockBg:     'rgba(12, 4, 1, 0.90)',
  codeBlockText:   '#fde8c8',
  codeBlockBorder: 'rgba(255,124,42,0.30)',
}
// ─── Token map ────────────────────────────────────────────────
const themes = { light, sunset } as const
export type ThemeMode = keyof typeof themes

// ─── Static helper (SSR-safe, no hooks) ──────────────────────
export function getTheme(mode: ThemeMode = 'light'): MarketingTheme {
  return themes[mode] ?? themes.light
}

// ─── React hook (client-side, reads localStorage) ────────────
export function useMarketingTheme(): {
  theme: MarketingTheme
  mode: ThemeMode
  toggle: () => void
  setMode: (m: ThemeMode) => void
} {
  // Read synchronously so first render already has the right mode
  const [mode, setModeState] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'light'
    return (localStorage.getItem('marketing-theme') as ThemeMode) || 'light'
  })

  // Apply data-theme on mount and whenever the page becomes visible again
  // (covers back-navigation from login or any other page)
  useEffect(() => {
    const apply = () => {
      const saved = (localStorage.getItem('marketing-theme') as ThemeMode) || 'light'
      setModeState(saved)
      document.documentElement.setAttribute('data-theme', saved)
    }

    apply() // run immediately on mount

    // Re-apply when tab regains focus or page becomes visible
    window.addEventListener('focus', apply)
    document.addEventListener('visibilitychange', apply)

    return () => {
      window.removeEventListener('focus', apply)
      document.removeEventListener('visibilitychange', apply)
    }
  }, [])

  const setMode = (m: ThemeMode) => {
    setModeState(m)
    localStorage.setItem('marketing-theme', m)
    document.documentElement.setAttribute('data-theme', m)
  }

  const toggle = () => setMode(mode === 'light' ? 'sunset' : 'light')

  return { theme: getTheme(mode), mode, toggle, setMode }
}

// ─── Tailwind class helpers ───────────────────────────────────
/**
 * Returns a Tailwind class string for a card based on current theme mode.
 * Includes glass effect for sunset, solid white for light.
 */
export function cardClass(mode: ThemeMode, extra = '') {
  const base = 'rounded-3xl border transition-all backdrop-blur-sm'
  const l = 'bg-white border-neutral-200'
  const s = 'border-orange-400/25'
  return `${base} ${mode === 'sunset' ? s : l} ${extra}`.trim()
}

export function sectionClass(mode: ThemeMode, variant: 'primary' | 'secondary' = 'primary', extra = '') {
  const map = {
    light:  { primary: 'bg-white', secondary: 'bg-neutral-50' },
    sunset: { primary: 'backdrop-blur-sm', secondary: 'backdrop-blur-md' },
  }
  return `${map[mode][variant]} ${extra}`.trim()
}

// ─── Usage example ────────────────────────────────────────────
/**
 * Example component showing how to consume the theme.
 *
 * import { useMarketingTheme, cardClass } from '@/config/marketingTheme'
 *
 * export function ExampleCard() {
 *   const { theme, mode, toggle } = useMarketingTheme()
 *
 *   return (
 *     <div
 *       className={cardClass(mode, 'p-8')}
 *       style={{ color: theme.text }}
 *     >
 *       <h2 style={{ color: theme.heading }}>Hello</h2>
 *       <p style={{ color: theme.textMuted }}>Body copy here.</p>
 *       <button
 *         onClick={toggle}
 *         style={{ background: theme.buttonBg, color: theme.buttonText }}
 *         className="rounded-xl px-6 py-3 font-bold"
 *       >
 *         Toggle theme
 *       </button>
 *     </div>
 *   )
 * }
 */
