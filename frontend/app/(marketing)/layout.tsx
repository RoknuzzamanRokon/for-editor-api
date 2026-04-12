export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-background-light text-slate-900 font-display dark:bg-background-dark">{children}</div>;
}
