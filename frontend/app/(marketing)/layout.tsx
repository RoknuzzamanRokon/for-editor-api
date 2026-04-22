'use client'
import MarketingHeader from '@/components/marketing/MarketingHeader'
import MarketingFooter from '@/components/marketing/MarketingFooter'
import { useMarketingTheme } from '@/config/marketingTheme'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const { theme } = useMarketingTheme()

  return (
    <div className="min-h-screen font-display transition-colors duration-300" style={{ color: theme.text, background: theme.shellBg }}>
      <MarketingHeader />
      <div className="pt-[6.5rem] sm:pt-[7.5rem] lg:pt-32">
        {children}
      </div>
      <MarketingFooter />
    </div>
  )
}
