'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
  { label: 'Profile', href: '/dashboard/profile', icon: 'person' },
  { label: 'App Center', href: '/dashboard/app-center', icon: 'apps' },
  { label: 'Billing', href: '/dashboard/billing', icon: 'credit_card' },
]

export default function UserSidebar({
  collapsed = false,
  onToggleSidebar,
}: {
  collapsed?: boolean;
  onToggleSidebar: () => void;
}) {
  const pathname = usePathname()

  return (
    <aside
      className={`fixed left-0 top-0 z-20 flex h-screen flex-col border-r border-slate-200 bg-white pt-16 transition-all duration-300 dark:border-slate-800 dark:bg-slate-900 ${
        collapsed ? "w-20" : "w-72"
      }`}
    >
      <div className={`flex justify-end pt-4 ${collapsed ? "px-2" : "px-4"}`}>
        <button
          type="button"
          onClick={onToggleSidebar}
          className="mb-2 flex items-center justify-center rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          title="Toggle sidebar"
        >
          <span className="material-symbols-outlined">
            {collapsed ? "keyboard_double_arrow_right" : "keyboard_double_arrow_left"}
          </span>
        </button>
      </div>
      <nav className={`flex flex-col gap-1 ${collapsed ? "px-2" : "px-4"}`}>
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
              title={collapsed ? item.label : undefined}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {!collapsed ? item.label : null}
            </Link>
          )
        })}
      </nav>
      <div className="mt-auto border-t border-slate-200 p-4 dark:border-slate-800">
        <Link
          className={`mb-4 flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium transition-colors ${
            pathname.startsWith('/dashboard/settings')
              ? 'bg-primary/10 text-primary'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
          href="/dashboard/settings"
          title={collapsed ? "Settings" : undefined}
        >
          <span className="material-symbols-outlined">settings</span>
          {!collapsed ? "Settings" : null}
        </Link>
        <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
          <div className="mb-2 flex justify-between text-xs font-bold">
            {!collapsed ? <span>PLAN LIMIT</span> : null}
            <span>43%</span>
          </div>
          <div className="mb-2 h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700">
            <div className="h-1.5 w-[43%] rounded-full bg-primary" />
          </div>
          {!collapsed ? (
            <p className="text-[10px] uppercase text-slate-500">4,320 / 10,000 Requests</p>
          ) : null}
        </div>
      </div>
    </aside>
  )
}
