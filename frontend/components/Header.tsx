import Link from 'next/link'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-3xl font-bold">sync_alt</span>
          <span className="text-xl font-extrabold tracking-tight text-slate-900">
            ConvertPro <span className="text-primary">API</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link className="text-sm font-medium text-slate-600 transition-colors hover:text-primary" href="/#features">
            Features
          </Link>
          <Link className="text-sm font-medium text-slate-600 transition-colors hover:text-primary" href="/pricing">
            Pricing
          </Link>
          <Link className="text-sm font-medium text-slate-600 transition-colors hover:text-primary" href="/docs">
            Documentation
          </Link>
          <Link className="text-sm font-medium text-slate-600 transition-colors hover:text-primary" href="/dashboard">
            Dashboard
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            className="rounded-lg px-5 py-2 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-100"
            href="/dashboard"
          >
            Login
          </Link>
          <Link
            className="rounded-lg bg-primary px-5 py-2 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-blue-700"
            href="/pricing"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  )
}
