'use client'

import MarketingHeader from '@/components/marketing/MarketingHeader'
import MarketingFooter from '@/components/marketing/MarketingFooter'
import { useMarketingTheme } from '@/config/marketingTheme'

/**
 * Client half of the marketing layout. Split out so `(marketing)/layout.tsx`
 * can stay a server component and export route metadata for SEO.
 */
export default function MarketingShell({ children }: { children: React.ReactNode }) {
  const { theme } = useMarketingTheme()

  return (
    <div
      className="min-h-screen font-display transition-colors duration-300"
      style={{ color: theme.text, background: theme.shellBg }}
    >
      <MarketingHeader />
      <div className="pt-[4.5rem] sm:pt-[5.5rem] lg:pt-[6rem]">{children}</div>
      <MarketingFooter />
    </div>
  )
}
