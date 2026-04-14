"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ThemeSwitcher from "@/components/ui/ThemeSwitcher";
import { AvatarBadge, type AvatarKey } from "@/lib/accountAvatar";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000";

type HeaderSettingsPayload = {
  identity: {
    username: string | null;
    email: string;
    role: string;
  };
  preferences: {
    avatar_key: AvatarKey;
  };
};

export default function AdminHeader() {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [user, setUser] = useState<{
    username?: string | null;
    email?: string;
    role?: string;
    avatarKey?: AvatarKey;
  } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      fetch(`${API_BASE}/api/v2/auth/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data: HeaderSettingsPayload) =>
          setUser({
            username: data.identity.username,
            email: data.identity.email,
            role: data.identity.role,
            avatarKey: data.preferences.avatar_key,
          }),
        )
        .catch((err) => console.error("Failed to fetch user:", err));
    }

    const handleSettingsChange = (event: Event) => {
      const customEvent = event as CustomEvent<HeaderSettingsPayload>;
      const payload = customEvent.detail;
      if (!payload) return;
      setUser({
        username: payload.identity.username,
        email: payload.identity.email,
        role: payload.identity.role,
        avatarKey: payload.preferences.avatar_key,
      });
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    window.addEventListener("accountsettingschange", handleSettingsChange);
    document.addEventListener("click", handleClickOutside);
    return () => {
      window.removeEventListener("accountsettingschange", handleSettingsChange);
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_role");
    router.push("/");
  };

  const displayName = user?.username || user?.email || "Admin User";
  const roleLabel = user?.role || "admin_user";

  return (
    <header className="fixed left-0 right-0 top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-8 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
            <span className="material-symbols-outlined">sync_alt</span>
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">Point Control</h1>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Admin Panel</p>
          </div>
        </div>
        <span className="rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
          Admin Plan
        </span>
        <div className="h-4 w-px bg-slate-300 dark:bg-slate-700" />
        <div className="hidden items-center gap-2 text-sm text-slate-500 md:flex">
          <span className="material-symbols-outlined text-sm">cloud_done</span>
          <span>API Status: Healthy</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <ThemeSwitcher />
        <button className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-red-500 dark:border-slate-900" />
        </button>
        <div className="flex items-center gap-3 border-l border-slate-200 pl-4 dark:border-slate-800">
          <div className="text-right">
            <p className="text-sm font-bold leading-none">{displayName}</p>
            <p className="mt-1 text-[10px] font-medium uppercase text-slate-500">{roleLabel}</p>
          </div>
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setShowMenu((prev) => !prev)}
              className="rounded-full transition-all hover:ring-2 hover:ring-primary/30"
            >
              <AvatarBadge avatarKey={user?.avatarKey} />
            </button>
            {showMenu && (
              <div className="absolute right-0 z-50 mt-2 w-64 rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
                <div className="border-b border-slate-200 p-4 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <AvatarBadge avatarKey={user?.avatarKey} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">{displayName}</p>
                      <p className="truncate text-xs text-slate-500">{user?.email || "admin@local"}</p>
                    </div>
                  </div>
                  <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-slate-400">
                    {roleLabel}
                  </p>
                </div>
                <div className="p-2">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      router.push("/admin/settings");
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <span className="material-symbols-outlined text-lg">settings</span>
                    <span>Settings</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                  >
                    <span className="material-symbols-outlined text-lg">logout</span>
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
