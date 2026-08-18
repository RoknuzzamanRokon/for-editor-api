import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Features',
  description:
    'Conversion pipelines, role-based access, per-user tool permissions, points and billing controls, usage history, and admin oversight in one platform.',
}

export default function FeaturesLayout({ children }: { children: React.ReactNode }) {
  return children
}
