import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'API Documentation',
  description:
    'ConvaterPro REST API reference: authentication, conversion endpoints, idempotency keys, points, permissions, and downloads.',
}

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return children
}
