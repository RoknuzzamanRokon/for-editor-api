"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  label: string;
  href: string;
  icon: string;
  match?: string;
};

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: "dashboard" },
  { label: "Profile", href: "/admin/profile", icon: "manage_accounts" },
  { label: "App Center", href: "/admin/app-center", icon: "apps" },
  { label: "Users", href: "/admin/users", icon: "group" },
  { label: "Points", href: "/admin/point", icon: "toll" },
  { label: "API Permissions", href: "/admin/api-permissions", icon: "vpn_key" },
  { label: "Settings", href: "/admin/settings", icon: "settings" },
];

export default function AdminSidebar({
  collapsed = false,
  onToggleSidebar,
}: {
  collapsed?: boolean;
  onToggleSidebar: () => void;
}) {
  const pathname = usePathname();
  const [totalGivenPoints, setTotalGivenPoints] = useState<number>(0);

  const displayGivenPoints = useMemo(() => {
    return totalGivenPoints.toLocaleString();
  }, [totalGivenPoints]);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    const API_BASE =
      process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
      "http://127.0.0.1:8000";

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
          const matchTarget = item.match ?? item.href;
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(matchTarget.replace(/\/+$/, ""));

          return (
            <Link
              key={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
              href={item.href}
              title={collapsed ? item.label : undefined}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {!collapsed ? item.label : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-slate-200 p-4 dark:border-slate-800">
        <div
          className={`${
            collapsed
              ? "mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-primary/20 bg-primary/15 text-[11px] font-bold text-primary shadow-sm"
              : "rounded-xl bg-slate-50 p-4 dark:bg-slate-800"
          }`}
        >
          {collapsed ? (
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
