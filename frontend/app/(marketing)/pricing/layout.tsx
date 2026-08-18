import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'ConvaterPro plans and top-up packages for individual professionals, teams, and organizations that need a private conversion platform.',
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children
}
