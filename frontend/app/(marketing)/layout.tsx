import MarketingHeader from '@/components/marketing/MarketingHeader'
import MarketingFooter from '@/components/marketing/MarketingFooter'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-display [&[data-theme='sunset']]:bg-transparent">
      <MarketingHeader />
      {children}
      <MarketingFooter />
    </div>
  );
}
