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
    <footer className="border-t py-12" style={{ background: theme.bgSecondary, borderColor: theme.border }}>
      <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-6 px-6 md:flex-row lg:px-20">
        <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: theme.textMuted }}>
          <span>© 2026 ConvertPro API</span>
          <span className="h-1 w-1 rounded-full" style={{ background: theme.border }} />
          {footerLinks.map(([href, label]) => (
            <Link key={href} href={href} className="transition-colors hover:opacity-80" style={{ color: theme.text }}>{label}</Link>
          ))}
        </div>
      </div>
    </footer>
  )
}
