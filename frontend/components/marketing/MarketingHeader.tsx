'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
  const { theme } = useMarketingTheme()

  const isActive = (path: string) => pathname === path

  return (
    <header className="fixed inset-x-0 top-0 z-50 w-full border-b backdrop-blur-xl"
      style={{ background: 'rgba(2,6,23,0.88)', borderColor: theme.border }}>
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
              className="text-base font-semibold transition-colors"
              style={{ color: isActive(href) ? theme.primary : theme.text }}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3 lg:gap-4">
          <Link
            href="/login"
            className="rounded-xl px-3 py-2 text-xs font-bold shadow-lg transition-all duration-200 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] sm:px-4 sm:py-2.5 sm:text-sm lg:px-6 lg:py-3 lg:text-base"
            style={{
              background: theme.buttonBg,
              color: theme.buttonText,
              boxShadow: theme.actionShadow,
            }}
          >
            Login
          </Link>
        </div>
      </div>

      <div className="border-t px-3 py-2.5 sm:px-4 sm:py-3 lg:hidden" style={{ borderColor: theme.border }}>
        <nav className="flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-1 text-xs font-semibold sm:gap-3 sm:text-sm">
          {navLinks.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="rounded-full px-3 py-1.5 transition-colors"
              style={isActive(href)
                ? { background: `${theme.primary}18`, color: theme.primary }
                : { background: theme.surface, color: theme.text }
              }
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
