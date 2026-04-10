'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
  { label: 'App Center', href: '/dashboard/app-center', icon: 'apps' },
  { label: 'API Keys', href: '/dashboard/api-keys', icon: 'key' },
  { label: 'Usage', href: '/dashboard/usage', icon: 'bar_chart' },
  { label: 'History', href: '/dashboard/request-history', icon: 'history' },
  { label: 'Billing', href: '/dashboard/billing', icon: 'credit_card' },
  { label: 'Team', href: '/dashboard/team', icon: 'group' },
  { label: 'Settings', href: '/dashboard/settings', icon: 'settings' },
]

export default function UserSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-72 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-3 p-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
          <span className="material-symbols-outlined">sync_alt</span>
        </div>
        <div>
          <h1 className="text-lg font-bold leading-tight">ConvertPro</h1>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Premium SaaS Tool</p>
        </div>
      </div>
      <nav className="flex flex-col gap-1 px-4">
        {navItems.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href.replace(/\/+$/, ''))

          return (
            <Link
              key={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
              href={item.href}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="mt-auto border-t border-slate-200 p-4 dark:border-slate-800">
        <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
          <div className="mb-2 flex justify-between text-xs font-bold">
            <span>PLAN LIMIT</span>
            <span>43%</span>
          </div>
          <div className="mb-2 h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700">
            <div className="h-1.5 w-[43%] rounded-full bg-primary" />
          </div>
          <p className="text-[10px] uppercase text-slate-500">4,320 / 10,000 Requests</p>
        </div>
      </div>
    </aside>
  )
}
