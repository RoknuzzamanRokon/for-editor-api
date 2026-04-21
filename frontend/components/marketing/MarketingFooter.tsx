'use client'
import Link from 'next/link'
import { useMarketingTheme } from '@/config/marketingTheme'

const footerLinks = [
  ['/', 'Home'],
  ['/features', 'Features'],
  ['/pricing', 'Pricing'],
  ['/docs', 'Docs'],
] as const

export default function MarketingFooter() {
  const { theme } = useMarketingTheme()

  return (
    <footer className="border-t py-8 sm:py-10 lg:py-12" style={{ background: theme.bgSecondary, borderColor: theme.border }}>
      <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-4 px-4 text-center sm:px-6 md:flex-row md:text-left lg:px-20">
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs sm:gap-4 sm:text-sm md:justify-start" style={{ color: theme.textMuted }}>
          <span>© 2026 ConvertPro API</span>
          <span className="hidden h-1 w-1 rounded-full sm:block" style={{ background: theme.border }} />
          {footerLinks.map(([href, label]) => (
            <Link key={href} href={href} className="transition-colors hover:opacity-80" style={{ color: theme.text }}>{label}</Link>
          ))}
        </div>
      </div>
    </footer>
  )
}
