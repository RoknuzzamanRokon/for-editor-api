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
    <Link href={href}>
      <div className="group rounded-lg border border-border bg-card p-6 transition-all hover:bg-card-hover hover:border-primary hover:shadow-lg cursor-pointer">
        <div className="flex items-center gap-4">
          <div className="text-primary transition-transform group-hover:scale-110">
            {icon}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
              {title}
            </h3>
            <p className="mt-1 text-sm text-foreground/70">{description}</p>
          </div>
        </div>
      </div>
    </Link>
  )
}
