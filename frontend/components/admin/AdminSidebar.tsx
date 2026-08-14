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
import { useVisibleNavItems } from "@/lib/useAllowedPaths";

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
  { label: "Dashboard", href: "/admin/dashboard", icon: "dashboard" },
  { label: "Profile", href: "/admin/profile", icon: "manage_accounts" },
  { label: "App Center", href: "/admin/app-center", icon: "apps" },
  { label: "Billing", href: "/admin/billing", icon: "credit_card" },
  { label: "Users", href: "/admin/users", icon: "group" },
  { label: "Points", href: "/admin/point", icon: "toll" },
  { label: "Usage History", href: "/admin/usage-history", icon: "query_stats" },
  { label: "Notifications", href: "/admin/notifications", icon: "notifications" },
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
  const visibleNavItems = useVisibleNavItems(navItems);
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
      className={`fixed inset-y-0 left-0 z-50 flex h-dvh w-72 max-w-[calc(100vw-2rem)] flex-col overflow-hidden border-r border-slate-200 bg-white pt-0 transition-transform duration-300 lg:z-20 lg:h-screen lg:translate-x-0 lg:pt-16 lg:transition-all dark:border-slate-800 dark:bg-slate-900 ${
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      } ${
        collapsed ? "lg:w-16" : "lg:w-64"
      }`}
    >
      <div className="flex flex-col lg:hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 dark:border-slate-800">
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">Admin Navigation</p>
            <p className="text-xs text-slate-500">Menu and tools</p>
          </div>
          <button
            type="button"
            onClick={onCloseMobileMenu}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Close navigation menu"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="border-b border-slate-200 px-4 py-4 dark:border-slate-800">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
            <div className="flex items-center gap-3">
              <AvatarBadge avatarKey={account?.avatarKey} size="md" />
              <div className="min-w-0">
                <p className="truncate text-base font-black tracking-tight text-slate-900 dark:text-white">
                  {displayName}
                </p>
                <p className="mt-1 inline-flex rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
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
      <div className={`hidden pt-4 lg:flex ${compactDesktop ? "justify-center px-2" : "justify-end px-4"}`}>
        <button
          type="button"
          onClick={onToggleSidebar}
          className="mb-2 flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
          title="Toggle sidebar"
        >
          <span className="material-symbols-outlined text-lg">
            {collapsed ? "keyboard_double_arrow_right" : "keyboard_double_arrow_left"}
          </span>
        </button>
      </div>

      <nav className={`flex flex-col gap-1 py-4 ${compactDesktop ? "px-2" : "px-3"}`}>
        {visibleNavItems.map((item) => {
          const matchTarget = item.match ?? item.href;
          const isActive =
            item.href === "/admin/dashboard"
              ? pathname === "/admin/dashboard"
              : pathname.startsWith(matchTarget.replace(/\/+$/, ""));
          const linkClasses = compactDesktop
            ? `mx-auto flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                isActive
                  ? "bg-slate-100 text-primary dark:bg-slate-800"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-white"
              }`
            : `relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-slate-100 text-primary dark:bg-slate-800"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-white"
              }`;

          return (
            <Link
              key={item.href}
              className={linkClasses}
              href={item.href}
              onClick={onCloseMobileMenu}
              title={compactDesktop ? item.label : undefined}
            >
              {isActive && !compactDesktop ? (
                <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
              ) : null}
              <span className="material-symbols-outlined shrink-0 text-[20px]">{item.icon}</span>
              {!compactDesktop ? <span className="truncate">{item.label}</span> : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-slate-200 p-3 dark:border-slate-800">
        <div
          className={`${
            compactDesktop
              ? "mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-[10px] font-bold text-primary dark:bg-slate-800"
              : "rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50"
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
