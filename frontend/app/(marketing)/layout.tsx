import type { Metadata } from 'next'

import MarketingShell from '@/components/marketing/MarketingShell'

export const metadata: Metadata = {
  title: {
    default: 'ConvaterPro — Convert Your Data. Simplify Your Workflow.',
    template: '%s · ConvaterPro',
  },
  description:
    'A professional web-based conversion platform for GIS, surveying, mapping, engineering, and data-processing teams. 28 conversion tools, role-based access, usage tracking, and a REST API.',
  keywords: [
    'data conversion platform',
    'GIS data conversion',
    'surveying data conversion',
    'PDF to Excel',
    'CSV to Excel converter',
    'document conversion API',
    'engineering document workflow',
  ],
  openGraph: {
    type: 'website',
    siteName: 'ConvaterPro',
    title: 'ConvaterPro — Convert Your Data. Simplify Your Workflow.',
    description:
      'A professional web-based conversion platform for GIS, surveying, mapping, engineering, and data-processing teams.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ConvaterPro — Convert Your Data. Simplify Your Workflow.',
    description:
      'A professional web-based conversion platform for GIS, surveying, mapping, engineering, and data-processing teams.',
  },
}

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <MarketingShell>{children}</MarketingShell>
}
