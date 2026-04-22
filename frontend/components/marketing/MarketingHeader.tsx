'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import MarketingPromoStrip from '@/components/marketing/MarketingPromoStrip'
import { useMarketingTheme } from '@/config/marketingTheme'

const navLinks = [
  ['/', 'Home'],
  ['/features', 'Features'],
  ['/pricing', 'Pricing'],
  ['/docs', 'Documentation'],
  ['/dashboard', 'Dashboard'],
] as const

export default function MarketingHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { theme } = useMarketingTheme()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isActive = (path: string) => pathname === path

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    navLinks.forEach(([href]) => {
      router.prefetch(href)
    })
    router.prefetch('/login')
  }, [router])

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 w-full backdrop-blur-xl"
      style={{
        background: 'rgba(2,6,23,0.88)',
        borderColor: theme.border,
        boxShadow: '0 18px 42px rgba(2,6,23,0.34), 0 0 20px rgba(249,115,22,0.08)',
      }}
    >
      <div className="border-b" style={{ borderColor: theme.border }}>
        <div className="flex h-16 w-full items-center justify-between gap-3 px-3 sm:h-20 sm:px-6 lg:h-24 lg:px-8">
          <Link href="/" className="group flex min-w-0 items-center gap-2 cursor-pointer">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-110 sm:h-12 sm:w-12"
              style={{ background: theme.primary, color: theme.buttonText }}>
              <span className="material-symbols-outlined text-2xl sm:text-[28px]">sync_alt</span>
            </div>
            <span className="truncate text-base font-black tracking-tight sm:text-xl lg:text-2xl" style={{ color: theme.heading }}>
              ConvertPro <span style={{ color: theme.primary }}>API</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-10 lg:flex">
            {navLinks.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                prefetch
                className="text-base font-semibold transition-colors"
                style={{ color: isActive(href) ? theme.primary : theme.text }}
                onMouseEnter={() => router.prefetch(href)}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3 lg:gap-4">
            <Link
              href="/login"
              prefetch
              className="rounded-xl px-3 py-2 text-xs font-bold shadow-lg transition-all duration-200 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] sm:px-4 sm:py-2.5 sm:text-sm lg:px-6 lg:py-3 lg:text-base"
              style={{
                background: theme.buttonBg,
                color: theme.buttonText,
                boxShadow: theme.actionShadow,
              }}
              onMouseEnter={() => router.prefetch('/login')}
            >
              Login
            </Link>

            <button
              type="button"
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMobileMenuOpen}
              className="flex h-10 w-10 items-center justify-center rounded-xl border transition-all lg:hidden"
              style={{
                background: theme.surface,
                borderColor: theme.border,
                color: theme.heading,
                boxShadow: theme.softCardShadow,
              }}
              onClick={() => setIsMobileMenuOpen((current) => !current)}
            >
              <span className="material-symbols-outlined text-[22px]">
                {isMobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>
      </div>

      <MarketingPromoStrip />

      {isMobileMenuOpen ? (
        <div className="border-b px-3 py-3 sm:px-4 lg:hidden" style={{ borderColor: theme.border }}>
          <nav className="grid gap-2">
            {navLinks.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                prefetch
                className="rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors"
                style={isActive(href)
                  ? {
                    background: `${theme.primary}16`,
                    color: theme.primary,
                    borderColor: `${theme.primary}44`,
                  }
                  : {
                    background: theme.surface,
                    color: theme.text,
                    borderColor: theme.border,
                  }
                }
                onMouseEnter={() => router.prefetch(href)}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  )
}
