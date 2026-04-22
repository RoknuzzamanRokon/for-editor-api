'use client'
import Link from 'next/link'
import { useMarketingTheme } from '@/config/marketingTheme'

const footerGroups = [
  {
    title: 'Navigation',
    links: [
      ['/', 'Home'],
      ['/features', 'Features'],
      ['/pricing', 'Pricing'],
      ['/docs', 'Docs'],
    ] as const,
  },
  {
    title: 'Platform',
    links: [
      ['/login', 'Login'],
      ['/dashboard', 'Dashboard'],
      ['/pricing', 'Plans'],
    ] as const,
  },
] as const

export default function MarketingFooter() {
  const { theme } = useMarketingTheme()

  return (
    <footer className="border-t py-8 sm:py-10 lg:py-12" style={{ background: theme.bgSecondary, borderColor: theme.border }}>
      <div className="mx-auto grid max-w-[1440px] gap-8 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-20">
        <div className="text-center lg:text-left">
          <p className="text-lg font-black tracking-tight" style={{ color: theme.heading }}>
            ConvertPro API
          </p>
          <p className="mt-2 text-sm" style={{ color: theme.textMuted }}>
            Crafted for modern file workflows.
          </p>
          <p className="mt-4 text-xs uppercase tracking-[0.2em]" style={{ color: theme.primary }}>
            © 2026 Roknuzzaman
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 text-center sm:grid-cols-2 lg:text-left">
          {footerGroups.map((group) => (
            <div key={group.title}>
              <p className="text-xs font-black uppercase tracking-[0.22em]" style={{ color: theme.primary }}>
                {group.title}
              </p>
              <div className="mt-4 flex flex-col gap-3">
                {group.links.map(([href, label]) => (
                  <Link
                    key={href}
                    href={href}
                    className="text-sm transition-colors hover:opacity-80"
                    style={{ color: theme.text }}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </footer>
  )
}
