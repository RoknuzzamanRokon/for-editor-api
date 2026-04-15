'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function MarketingHeader() {
  const pathname = usePathname()
  const [theme, setTheme] = useState('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('marketing-theme') || 'light'
    setTheme(savedTheme)
    document.documentElement.setAttribute('data-theme', savedTheme)
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'sunset' : 'light'
    setTheme(newTheme)
    localStorage.setItem('marketing-theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  const isActive = (path: string) => pathname === path

  const headerBg = theme === 'sunset' ? 'bg-[#7c2d12]/20 backdrop-blur-lg' : 'bg-white/80'
  const headerBorder = theme === 'sunset' ? 'border-[#9a3412]/40' : 'border-slate-200/60'
  const textColor = theme === 'sunset' ? 'text-[#fed7aa]' : 'text-slate-900'
  const navTextColor = theme === 'sunset' ? 'text-[#fed7aa]/80 hover:text-[#f97316]' : 'text-slate-600 hover:text-primary'
  const buttonBg = theme === 'sunset' ? 'bg-[#7c2d12]/90 border-[#9a3412]/80' : 'bg-white/90 border-slate-200/80'
  const iconColor = theme === 'sunset' ? 'text-[#fed7aa]' : 'text-slate-900'
  const mobileBg = theme === 'sunset' ? 'bg-[#7c2d12]/50 text-[#fed7aa]/80' : 'bg-slate-100 text-slate-700'

  return (
    <header className={`fixed inset-x-0 top-0 z-50 w-full border-b backdrop-blur-md ${headerBorder} ${headerBg}`}>
      <div className="flex h-20 w-full items-center justify-between px-4 sm:h-24 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white transition-transform group-hover:scale-110 sm:h-12 sm:w-12">
            <span className="material-symbols-outlined text-2xl sm:text-[28px]">sync_alt</span>
          </div>
          <span className={`text-lg font-black tracking-tight sm:text-2xl ${textColor}`}>
            ConvertPro <span className="text-primary">API</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-10 lg:flex">
          <Link
            href="/"
            className={`text-base font-semibold transition-colors ${
              isActive('/') ? 'text-primary' : navTextColor
            }`}
          >
            Home
          </Link>
          <Link
            href="/features"
            className={`text-base font-semibold transition-colors ${
              isActive('/features') ? 'text-primary' : navTextColor
            }`}
          >
            Features
          </Link>
          <Link
            href="/pricing"
            className={`text-base font-semibold transition-colors ${
              isActive('/pricing') ? 'text-primary' : navTextColor
            }`}
          >
            Pricing
          </Link>
          <Link
            href="/docs"
            className={`text-base font-semibold transition-colors ${
              isActive('/docs') ? 'text-primary' : navTextColor
            }`}
          >
            Documentation
          </Link>
          <Link
            href="/dashboard"
            className={`text-base font-semibold transition-colors ${
              isActive('/dashboard') ? 'text-primary' : navTextColor
            }`}
          >
            Dashboard
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={toggleTheme}
            className={`flex h-10 w-10 items-center justify-center rounded-2xl border shadow-sm transition-all hover:scale-[1.02] hover:shadow-md sm:h-12 sm:w-12 ${buttonBg}`}
            title={`Switch to ${theme === 'light' ? 'Sunset' : 'Light'} theme`}
          >
            <span className={`material-symbols-outlined text-xl sm:text-[22px] ${iconColor}`}>
              {mounted && theme === 'sunset' ? 'light_mode' : 'wb_twilight'}
            </span>
          </button>
          <Link
            href="/login"
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all duration-200 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] sm:px-6 sm:py-3 sm:text-base"
          >
            Login
          </Link>
        </div>
      </div>

      <div className={`border-t px-4 py-3 lg:hidden ${headerBorder}`}>
        <nav className="flex items-center gap-3 overflow-x-auto whitespace-nowrap text-sm font-semibold">
          <Link
            href="/"
            className={`rounded-full px-3 py-1.5 ${
              isActive('/') ? 'bg-primary/10 text-primary' : mobileBg
            }`}
          >
            Home
          </Link>
          <Link
            href="/features"
            className={`rounded-full px-3 py-1.5 ${
              isActive('/features') ? 'bg-primary/10 text-primary' : mobileBg
            }`}
          >
            Features
          </Link>
          <Link
            href="/pricing"
            className={`rounded-full px-3 py-1.5 ${
              isActive('/pricing') ? 'bg-primary/10 text-primary' : mobileBg
            }`}
          >
            Pricing
          </Link>
          <Link
            href="/docs"
            className={`rounded-full px-3 py-1.5 ${
              isActive('/docs') ? 'bg-primary/10 text-primary' : mobileBg
            }`}
          >
            Documentation
          </Link>
          <Link
            href="/dashboard"
            className={`rounded-full px-3 py-1.5 ${
              isActive('/dashboard') ? 'bg-primary/10 text-primary' : mobileBg
            }`}
          >
            Dashboard
          </Link>
        </nav>
      </div>
    </header>
  )
}
