'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { API_BASE } from '@/lib/apiBase'
import { AvatarBadge, type AvatarKey } from '@/lib/accountAvatar'
import { formatRoleLabel } from '@/lib/roleLabel'

type SidebarSettingsPayload = {
  identity: {
    username: string | null;
    email: string;
    role: string;
  };
  preferences: {
    avatar_key: AvatarKey;
  };
}

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
  { label: 'Points', href: '/dashboard/points', icon: 'toll' },
  { label: 'Profile', href: '/dashboard/profile', icon: 'person' },
  { label: 'App Center', href: '/dashboard/app-center', icon: 'apps' },
  { label: 'Billing', href: '/dashboard/billing', icon: 'credit_card' },
]

export default function UserSidebar({
  collapsed = false,
  onToggleSidebar,
  mobileOpen = false,
  onCloseMobileMenu,
}: {
  collapsed?: boolean;
  onToggleSidebar: () => void;
  mobileOpen?: boolean;
  onCloseMobileMenu: () => void;
}) {
  const pathname = usePathname()
  const [pointsBalance, setPointsBalance] = useState<number | null>(null)
  const [account, setAccount] = useState<{
    username?: string | null;
    email?: string;
    role?: string;
    avatarKey?: AvatarKey;
  } | null>(null)
  const compactDesktop = collapsed && !mobileOpen

  useEffect(() => {
    const token = window.localStorage.getItem('access_token')
    if (!token) return

    fetch(`${API_BASE}/api/v3/points/balance`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error('Failed to load points balance')
        }
        return res.json() as Promise<{ balance: number }>
      })
      .then((data) => {
        setPointsBalance(data.balance)
      })
      .catch(() => {
        setPointsBalance(null)
      })
  }, [])

  useEffect(() => {
    const token = window.localStorage.getItem('access_token')
    if (!token) return

    fetch(`${API_BASE}/api/v2/auth/settings`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data: SidebarSettingsPayload) => {
        setAccount({
          username: data.identity.username,
          email: data.identity.email,
          role: data.identity.role,
          avatarKey: data.preferences.avatar_key,
        })
      })
      .catch(() => {
        setAccount(null)
      })
  }, [])

  const displayName = account?.username || account?.email || 'User'
  const roleLabel = formatRoleLabel(account?.role || 'general_user')

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex h-dvh w-[min(20rem,calc(100vw-1rem))] flex-col overflow-hidden border-r border-white/30 bg-white/50 pt-0 shadow-[0_20px_80px_rgba(15,23,42,0.18)] backdrop-blur-2xl transition-transform duration-300 lg:z-20 lg:h-screen lg:translate-x-0 lg:pt-16 lg:transition-all dark:border-white/10 dark:bg-slate-950/55 ${
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      } ${
        collapsed ? "lg:w-20" : "lg:w-72"
      }`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.55),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.16),transparent_32%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.09),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.16),transparent_34%)]" />
      <div className="relative flex flex-col lg:hidden">
        <div className="flex items-center justify-between border-b border-white/30 px-4 py-4 dark:border-white/10">
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">User Navigation</p>
            <p className="text-xs text-slate-500">Menu and account</p>
          </div>
          <button
            type="button"
            onClick={onCloseMobileMenu}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Close navigation menu"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="border-b border-white/25 px-4 py-4 dark:border-white/10">
          <div className="rounded-[28px] border border-white/35 bg-white/45 p-4 shadow-[0_16px_40px_rgba(15,23,42,0.12)] backdrop-blur dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center gap-3">
              <AvatarBadge avatarKey={account?.avatarKey} size="md" />
              <div className="min-w-0">
                <p className="truncate text-base font-black tracking-tight text-slate-900 dark:text-white">
                  {displayName}
                </p>
                <p className="mt-1 inline-flex rounded-full border border-primary/15 bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                  {roleLabel}
                </p>
              </div>
            </div>
            <p className="mt-3 truncate text-xs text-slate-500 dark:text-slate-400">
              {account?.email || 'Account overview'}
            </p>
          </div>
        </div>
      </div>
      <div className={`relative hidden pt-4 lg:flex ${compactDesktop ? "justify-center px-2" : "justify-end px-4"}`}>
        <button
          type="button"
          onClick={onToggleSidebar}
          className="mb-2 flex items-center justify-center rounded-xl border border-white/35 bg-white/45 p-2 text-slate-600 transition hover:bg-white/70 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
          title="Toggle sidebar"
        >
          <span className="material-symbols-outlined">
            {collapsed ? "keyboard_double_arrow_right" : "keyboard_double_arrow_left"}
          </span>
        </button>
      </div>
      <nav className={`relative flex flex-col gap-2 py-4 ${compactDesktop ? "px-2" : "px-4"}`}>
        {navItems.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href.replace(/\/+$/, ''))
          const linkClasses = compactDesktop
            ? `mx-auto flex h-12 w-12 items-center justify-center rounded-full px-0 py-0 ${
                isActive
                  ? 'border border-primary/20 bg-white/80 text-primary shadow-[0_10px_30px_rgba(59,130,246,0.18)] dark:border-primary/20 dark:bg-white/10'
                  : 'border border-transparent text-slate-700 hover:border-white/40 hover:bg-white/55 dark:text-slate-300 dark:hover:border-white/10 dark:hover:bg-white/5'
              }`
            : `flex items-center gap-3 rounded-2xl px-3 py-3 font-medium transition-all ${
                isActive
                  ? 'border border-primary/20 bg-white/70 text-primary shadow-[0_10px_30px_rgba(59,130,246,0.15)] dark:border-primary/20 dark:bg-white/10'
                  : 'border border-transparent text-slate-700 hover:border-white/40 hover:bg-white/55 dark:text-slate-300 dark:hover:border-white/10 dark:hover:bg-white/5'
              }`

          return (
            <Link
              key={item.href}
              className={linkClasses}
              href={item.href}
              onClick={onCloseMobileMenu}
              title={compactDesktop ? item.label : undefined}
            >
              <span className="material-symbols-outlined shrink-0">{item.icon}</span>
              {!compactDesktop ? <span className="truncate">{item.label}</span> : null}
            </Link>
          )
        })}
      </nav>
      <div className="relative mt-auto border-t border-white/30 p-4 dark:border-white/10">
        <Link
          className={
            compactDesktop
              ? `mb-4 mx-auto flex h-12 w-12 items-center justify-center rounded-full px-0 py-0 ${
                  pathname.startsWith('/dashboard/settings')
                    ? 'border border-primary/20 bg-white/80 text-primary shadow-[0_10px_30px_rgba(59,130,246,0.18)] dark:border-primary/20 dark:bg-white/10'
                    : 'border border-transparent text-slate-700 hover:border-white/40 hover:bg-white/55 dark:text-slate-300 dark:hover:border-white/10 dark:hover:bg-white/5'
                }`
              : `mb-4 flex items-center gap-3 rounded-2xl px-3 py-3 font-medium transition-all ${
                  pathname.startsWith('/dashboard/settings')
                    ? 'border border-primary/20 bg-white/70 text-primary shadow-[0_10px_30px_rgba(59,130,246,0.15)] dark:border-primary/20 dark:bg-white/10'
                    : 'border border-transparent text-slate-700 hover:border-white/40 hover:bg-white/55 dark:text-slate-300 dark:hover:border-white/10 dark:hover:bg-white/5'
                }`
          }
          href="/dashboard/settings"
          onClick={onCloseMobileMenu}
          title={compactDesktop ? "Settings" : undefined}
        >
          <span className="material-symbols-outlined shrink-0">settings</span>
          {!compactDesktop ? <span className="truncate">Settings</span> : null}
        </Link>
        {compactDesktop ? (
          <div className="flex justify-center pt-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/20 bg-white/65 text-center text-[11px] font-black text-primary shadow-[0_12px_28px_rgba(59,130,246,0.18)] backdrop-blur dark:bg-white/10">
              {pointsBalance ?? '--'}
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-white/35 bg-white/55 p-4 shadow-[0_16px_40px_rgba(15,23,42,0.10)] backdrop-blur dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                  Current Points
                </p>
                <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                  {pointsBalance ?? '--'}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/20 bg-white/70 text-primary shadow-[0_10px_25px_rgba(59,130,246,0.16)] backdrop-blur dark:bg-white/10">
                <span className="material-symbols-outlined">toll</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
