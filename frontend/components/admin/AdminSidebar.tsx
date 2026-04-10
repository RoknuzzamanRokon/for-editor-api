'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: 'dashboard' },
  { label: 'History', href: '/admin/history/transactions', match: '/admin/history', icon: 'history' },
  { label: 'API Permissions', href: '/admin/api-permissions', icon: 'vpn_key' },
  { label: 'IP Whitelisting', href: '/admin/ip-whitelist', icon: 'verified_user' },
  { label: 'Users', href: '/admin/users', icon: 'group' },
  { label: 'Settings', href: '/admin/settings', icon: 'settings' },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-primary/10 bg-white dark:bg-slate-900">
      <div className="flex items-center gap-3 p-6">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-white">
          <span className="material-symbols-outlined text-xl">token</span>
        </div>
        <div>
          <h1 className="text-lg font-bold leading-none">Point Control</h1>
          <p className="text-xs font-medium text-slate-500">Admin Panel</p>
        </div>
      </div>
      <nav className="flex flex-col gap-1 px-4">
        {navItems.map((item) => {
          const matchTarget = item.match ?? item.href
          const isActive =
            item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(matchTarget.replace(/\/+$/, ''))

          return (
            <Link
              key={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-white'
                  : 'text-slate-600 hover:bg-primary/10 dark:text-slate-400'
              }`}
              href={item.href}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="mt-auto border-t border-primary/10 p-4">
        <div className="flex items-center gap-3 rounded-lg p-2 hover:bg-primary/5">
          <div className="flex size-9 items-center justify-center rounded-full bg-primary/20 text-primary">
            <span className="material-symbols-outlined">person</span>
          </div>
          <div className="flex-1 truncate">
            <p className="truncate text-xs font-bold">Alex Smith</p>
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">System Admin</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
