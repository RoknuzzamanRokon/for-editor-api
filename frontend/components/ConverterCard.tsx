import Link from 'next/link'
import { ReactNode } from 'react'

interface ConverterCardProps {
  title: string
  description: string
  icon: ReactNode
  href: string
}

export default function ConverterCard({ title, description, icon, href }: ConverterCardProps) {
  return (
    <Link href={href} className="group block h-full">
      <article className="relative h-full overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary hover:shadow-lg">
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 card-accent" />
        <div className="relative z-10 flex h-full flex-col gap-5">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-background/40 text-primary transition-transform duration-300 group-hover:scale-105">
            {icon}
          </div>

          <div className="flex-1">
            <h3 className="text-xl font-semibold text-foreground transition-colors group-hover:text-primary">
              {title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-foreground/70">{description}</p>
          </div>

          <div className="inline-flex items-center gap-2 text-sm font-semibold text-primary/90 group-hover:text-primary">
            Start conversion
            <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </article>
    </Link>
  )
}
