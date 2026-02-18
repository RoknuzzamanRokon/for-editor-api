'use client'

import { useTheme } from '@/contexts/ThemeContext'
import { useState } from 'react'

export default function Header() {
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  const themes = [
    { name: 'Light', value: 'light' as const },
    { name: 'Dark', value: 'dark' as const },
    { name: 'Ocean', value: 'ocean' as const },
    { name: 'Sunset', value: 'sunset' as const },
    { name: 'Forest', value: 'forest' as const },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <h1 className="text-2xl font-bold text-primary">Converter</h1>
        
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card hover:bg-card-hover border border-border transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            <span className="text-sm font-medium capitalize">{theme}</span>
            <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-40 rounded-lg border border-border bg-card shadow-lg overflow-hidden">
              {themes.map((t) => (
                <button
                  key={t.value}
                  onClick={() => {
                    setTheme(t.value)
                    setIsOpen(false)
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-card-hover transition-colors ${
                    theme === t.value ? 'bg-primary text-white font-medium' : 'text-foreground'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
