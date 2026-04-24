"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { API_BASE } from "@/lib/apiBase";
import { AvatarBadge, type AvatarKey } from "@/lib/accountAvatar";
import { formatProfileName } from "@/lib/profileName";
import { formatRoleLabel } from "@/lib/roleLabel";
import {
  publishAccountSettingsCache,
  readAccountSettingsCache,
} from "@/lib/accountSettingsCache";

type NavItem = {
  label: string;
  href: string;
  icon: string;
  match?: string;
};

type SidebarSettingsPayload = {
  identity: {
    username: string | null;
    email: string;
    role: string;
  };
  preferences: {
    avatar_key: AvatarKey;
  };
};

function normalizeSidebarSettings(payload: unknown) {
  if (!payload || typeof payload !== "object") return null;

  const candidate = payload as {
    identity?: {
      username?: string | null;
      email?: string;
      role?: string;
    };
    preferences?: {
      avatar_key?: AvatarKey;
    };
  };

  if (!candidate.identity?.email || !candidate.identity.role) return null;
  if (!candidate.preferences?.avatar_key) return null;

  return {
    username: candidate.identity.username ?? null,
    email: candidate.identity.email,
    role: candidate.identity.role,
    avatarKey: candidate.preferences.avatar_key,
  };
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: "dashboard" },
  { label: "Profile", href: "/admin/profile", icon: "manage_accounts" },
  { label: "App Center", href: "/admin/app-center", icon: "apps" },
  { label: "Billing", href: "/admin/billing", icon: "credit_card" },
  { label: "Users", href: "/admin/users", icon: "group" },
  { label: "Points", href: "/admin/point", icon: "toll" },
  { label: "API Permissions", href: "/admin/api-permissions", icon: "vpn_key" },
  { label: "Settings", href: "/admin/settings", icon: "settings" },
];

export default function AdminSidebar({
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
  const pathname = usePathname();
  const [totalGivenPoints, setTotalGivenPoints] = useState<number>(0);
  const [account, setAccount] = useState<{
    username?: string | null;
    email?: string;
    role?: string;
    avatarKey?: AvatarKey;
  } | null>(null);
  const compactDesktop = collapsed && !mobileOpen;

  const displayGivenPoints = useMemo(() => {
    return totalGivenPoints.toLocaleString();
  }, [totalGivenPoints]);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    const headers = { Authorization: `Bearer ${token}` };

    const load = async () => {
      try {
        const meRes = await fetch(`${API_BASE}/api/v2/auth/me`, { headers });
        if (!meRes.ok) return;
        const me = (await meRes.json()) as { id?: number };
        if (!me?.id) return;

        const historyRes = await fetch(
          `${API_BASE}/api/v3/admin/points/giving-history?created_by_user_id=${me.id}&limit=200&offset=0`,
          { headers },
        );
        if (!historyRes.ok) return;

        const data = (await historyRes.json()) as {
          items?: Array<{ amount?: number }>;
        };
        const sum = (data.items || []).reduce(
          (acc, item) => acc + Number(item.amount || 0),
          0,
        );
        setTotalGivenPoints(sum);
      } catch {
        setTotalGivenPoints(0);
      }
    };

    void load();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    const cached = readAccountSettingsCache<SidebarSettingsPayload>();
    const normalizedCached = normalizeSidebarSettings(cached);
    if (normalizedCached) {
      setAccount(normalizedCached);
    }

    fetch(`${API_BASE}/api/v2/auth/settings`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data: SidebarSettingsPayload) => {
        publishAccountSettingsCache(data);
        setAccount(normalizeSidebarSettings(data));
      })
      .catch(() => {
        setAccount(null);
      });
  }, []);

  useEffect(() => {
    const handleSettingsChange = (event: Event) => {
      const customEvent = event as CustomEvent<SidebarSettingsPayload>;
      const payload = customEvent.detail;
      const normalizedPayload = normalizeSidebarSettings(payload);
      if (!normalizedPayload) return;
      setAccount(normalizedPayload);
    };

    window.addEventListener("accountsettingschange", handleSettingsChange);
    return () => {
      window.removeEventListener("accountsettingschange", handleSettingsChange);
    };
  }, []);

  const displayName = formatProfileName(
    account?.username,
    account?.email || "Admin User",
  );
  const roleLabel = formatRoleLabel(account?.role || "admin_user");

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
            <p className="text-sm font-bold text-slate-900 dark:text-white">Admin Navigation</p>
            <p className="text-xs text-slate-500">Menu and tools</p>
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
              {account?.email || "Administrative access"}
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
          const matchTarget = item.match ?? item.href;
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(matchTarget.replace(/\/+$/, ""));
          const linkClasses = compactDesktop
            ? `mx-auto flex h-12 w-12 items-center justify-center rounded-full px-0 py-0 ${
                isActive
                  ? "border border-primary/20 bg-white/80 text-primary shadow-[0_10px_30px_rgba(59,130,246,0.18)] dark:border-primary/20 dark:bg-white/10"
                  : "border border-transparent text-slate-700 hover:border-white/40 hover:bg-white/55 dark:text-slate-300 dark:hover:border-white/10 dark:hover:bg-white/5"
              }`
            : `flex items-center gap-3 rounded-2xl px-3 py-3 font-medium transition-all ${
                isActive
                  ? "border border-primary/20 bg-white/70 text-primary shadow-[0_10px_30px_rgba(59,130,246,0.15)] dark:border-primary/20 dark:bg-white/10"
                  : "border border-transparent text-slate-700 hover:border-white/40 hover:bg-white/55 dark:text-slate-300 dark:hover:border-white/10 dark:hover:bg-white/5"
              }`;

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
          );
        })}
      </nav>

      <div className="relative mt-auto border-t border-white/30 p-4 dark:border-white/10">
        <div
          className={`${
            compactDesktop
              ? "mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-primary/20 bg-white/65 text-[11px] font-bold text-primary shadow-[0_12px_28px_rgba(59,130,246,0.18)] backdrop-blur dark:bg-white/10"
              : "rounded-3xl border border-white/35 bg-white/55 p-4 shadow-[0_16px_40px_rgba(15,23,42,0.10)] backdrop-blur dark:border-white/10 dark:bg-white/5"
          }`}
        >
          {compactDesktop ? (
            <span>{displayGivenPoints}</span>
          ) : (
            <>
              <div className="mb-2 flex justify-between text-xs font-bold">
                <span>ADMIN GIVEN</span>
                <span>{displayGivenPoints}</span>
              </div>
              <div className="mb-2 h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700">
                <div className="h-1.5 w-full rounded-full bg-primary" />
              </div>
              <p className="text-[10px] uppercase text-slate-500">Total points given by admin</p>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
