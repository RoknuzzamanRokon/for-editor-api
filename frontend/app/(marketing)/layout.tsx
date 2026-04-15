'use client'
import MarketingHeader from '@/components/marketing/MarketingHeader'
import MarketingFooter from '@/components/marketing/MarketingFooter'
import { useMarketingTheme } from '@/config/marketingTheme'

// Inline script that runs before hydration to set data-theme immediately
// preventing any flash of wrong theme on navigation
const themeScript = `
  (function(){
    try {
      var t = localStorage.getItem('marketing-theme') || 'light';
      document.documentElement.setAttribute('data-theme', t);
    } catch(e){}
  })();
`

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const { theme: t, mode } = useMarketingTheme()

  return (
    <div
      className="min-h-screen font-display"
      style={{ background: mode === 'sunset' ? 'transparent' : t.bg, color: t.text }}
    >
      {/* Runs synchronously before paint to avoid theme flash */}
      <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      <MarketingHeader />
      {children}
      <MarketingFooter />
    </div>
  )
}
