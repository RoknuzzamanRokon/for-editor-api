'use client'

import { useEffect, useRef, useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

const themes = [
  { id: 'light', label: 'Light', color: '#f8fafc' },
  { id: 'dark', label: 'Dark', color: '#020617' },
  { id: 'ocean', label: 'Ocean', color: '#0c4a6e' },
  { id: 'sunset', label: 'Sunset', color: '#451a03' },
  { id: 'forest', label: 'Forest', color: '#052e16' },
  { id: 'midnight', label: 'Midnight', color: '#0b1120' },
  { id: 'livedark', label: 'Live Dark', color: '#000000', accent: '#3b82f6' },
] as const

export default function ThemeSwitcher({ className = '' }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const displayTheme = mounted ? theme : 'light'

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-1.5 rounded-lg border border-primary/20 bg-card/80 px-3 py-1.5 text-xs font-medium text-foreground/80 backdrop-blur-sm transition-colors hover:bg-card-hover/80"
        title="Change theme"
        type="button"
      >
        <span className="material-symbols-outlined text-sm">palette</span>
        <span className="hidden sm:inline capitalize">{displayTheme}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-44 rounded-xl border border-primary/20 bg-card p-2 shadow-2xl backdrop-blur-md">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTheme(t.id)
                  setOpen(false)
                }}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                  displayTheme === t.id
                    ? 'bg-primary/15 font-semibold text-foreground'
                    : 'text-foreground/70 hover:bg-card-hover'
                }`}
                type="button"
              >
                <span
                  className="h-3.5 w-3.5 flex-shrink-0 rounded-full border border-primary/20"
                  style={{
                    background:
                      'accent' in t
                        ? `linear-gradient(135deg, ${t.color} 50%, ${t.accent} 50%)`
                        : t.color,
                  }}
                />
                {t.label}
                {displayTheme === t.id && (
                  <span className="material-symbols-outlined ml-auto text-sm">check</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
