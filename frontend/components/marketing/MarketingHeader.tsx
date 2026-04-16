'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getTheme } from '@/config/marketingTheme'

const navLinks = [
  ['/', 'Home'],
  ['/features', 'Features'],
  ['/pricing', 'Pricing'],
  ['/docs', 'Documentation'],
  ['/dashboard', 'Dashboard'],
] as const

export default function MarketingHeader() {
  const pathname = usePathname()
  const theme = getTheme()

  const isActive = (path: string) => pathname === path

  return (
    <header className="fixed inset-x-0 top-0 z-50 w-full border-b backdrop-blur-xl"
      style={{ background: 'rgba(255,255,255,0.92)', borderColor: theme.border }}>
      <div className="flex h-20 w-full items-center justify-between px-4 sm:h-24 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-110 sm:h-12 sm:w-12"
            style={{ background: theme.primary, color: theme.buttonText }}>
            <span className="material-symbols-outlined text-2xl sm:text-[28px]">sync_alt</span>
          </div>
          <span className="text-lg font-black tracking-tight sm:text-2xl" style={{ color: theme.heading }}>
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

        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/login"
            className="rounded-xl px-4 py-2.5 text-sm font-bold shadow-lg transition-all duration-200 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] sm:px-6 sm:py-3 sm:text-base"
            style={{ background: theme.buttonBg, color: theme.buttonText }}
          >
            Login
          </Link>
        </div>
      </div>

      <div className="border-t px-4 py-3 lg:hidden" style={{ borderColor: theme.border }}>
        <nav className="flex items-center gap-3 overflow-x-auto whitespace-nowrap text-sm font-semibold">
          {navLinks.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="rounded-full px-3 py-1.5 transition-colors"
              style={isActive(href)
                ? { background: `${theme.primary}18`, color: theme.primary }
                : { background: '#f1f5f9', color: theme.text }
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
