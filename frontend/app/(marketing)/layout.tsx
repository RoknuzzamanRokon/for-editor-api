'use client'
import MarketingHeader from '@/components/marketing/MarketingHeader'
import MarketingFooter from '@/components/marketing/MarketingFooter'
import { getTheme } from '@/config/marketingTheme'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const theme = getTheme()

  return (
    <div className="min-h-screen bg-slate-100 font-display" style={{ color: theme.text }}>
      <MarketingHeader />
      {children}
      <MarketingFooter />
    </div>
  )
}
