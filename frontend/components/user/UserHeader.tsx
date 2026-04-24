'use client'

import { startTransition, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ThemeSwitcher from "@/components/ui/ThemeSwitcher";
import { AvatarBadge, type AvatarKey } from "@/lib/accountAvatar";
import { API_BASE } from "@/lib/apiBase";
import { formatProfileName } from "@/lib/profileName";
import { formatRoleLabel } from "@/lib/roleLabel";
import {
  clearAccountSettingsCache,
  publishAccountSettingsCache,
  readAccountSettingsCache,
} from "@/lib/accountSettingsCache";

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

function normalizeHeaderSettings(payload: unknown) {
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

export default function UserHeader({
  onOpenMobileMenu,
}: {
  onOpenMobileMenu: () => void;
}) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [user, setUser] = useState<{
    username?: string | null;
    email?: string;
    role?: string;
    avatarKey?: AvatarKey;
  } | null>(null);
  const [sessionRole, setSessionRole] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    const cached = readAccountSettingsCache<HeaderSettingsPayload>();
    const normalizedCached = normalizeHeaderSettings(cached);
    if (normalizedCached) {
      setUser(normalizedCached);
    } else if (cached) {
      clearAccountSettingsCache();
    }

    fetch(`${API_BASE}/api/v2/auth/settings`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch user settings");
        }
        return res.json() as Promise<HeaderSettingsPayload>;
      })
      .then((data: HeaderSettingsPayload) => {
        const normalized = normalizeHeaderSettings(data);
        if (!normalized) {
          throw new Error("Invalid user settings payload");
        }
        publishAccountSettingsCache(data);
        setUser(normalized);
      })
      .catch((err) => console.error("Failed to fetch user:", err));
  }, []);

  useEffect(() => {
    setSessionRole(localStorage.getItem("user_role") || "");

    const handleSettingsChange = (event: Event) => {
      const customEvent = event as CustomEvent<HeaderSettingsPayload>;
      const payload = customEvent.detail;
      const normalizedPayload = normalizeHeaderSettings(payload);
      if (!normalizedPayload) return;
      setUser(normalizedPayload);
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
    clearAccountSettingsCache();
    startTransition(() => {
      router.push("/");
    });
  };

  const roleValue = (user?.role || sessionRole || "").toLowerCase();
  const planLabel = roleValue.includes("admin") || roleValue.includes("super") ? "Admin" : "User";
  const displayName = formatProfileName(user?.username, user?.email || "User");

  return (
    <header
      className="fixed left-0 right-0 top-0 z-30 flex h-16 w-full max-w-none items-center justify-between border-b border-slate-200 bg-white/80 px-3 backdrop-blur-md sm:px-6 lg:px-8 dark:border-slate-800 dark:bg-slate-900/80"
    >
      <div className="flex min-w-0 items-center gap-2 sm:gap-4">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-100 lg:hidden dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label="Open navigation menu"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
            <span className="material-symbols-outlined">sync_alt</span>
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-base font-bold leading-tight sm:text-lg">ConvertPro</h1>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Premium SaaS Tool
            </p>
          </div>
        </div>
        <span className="hidden rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white sm:inline-flex">
          {planLabel} Plan
        </span>
        <div className="hidden h-4 w-px bg-slate-300 dark:bg-slate-700 md:block" />
        <div className="hidden items-center gap-2 text-sm text-slate-500 md:flex">
          <span className="material-symbols-outlined text-sm">cloud_done</span>
          <span>API Status: Healthy</span>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
        <ThemeSwitcher />
        <button
          type="button"
          className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-red-500 dark:border-slate-900" />
        </button>
        <div className="flex items-center gap-2 border-l border-slate-200 pl-2 sm:gap-3 sm:pl-4 dark:border-slate-800">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-bold leading-none">{displayName}</p>
            <p className="mt-1 text-[10px] font-medium uppercase text-slate-500">{formatRoleLabel(user?.role || "general_user")}</p>
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
              <div className="absolute right-0 z-50 mt-2 w-64 max-w-[calc(100vw-1.5rem)] rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
                <div className="border-b border-slate-200 p-4 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <AvatarBadge avatarKey={user?.avatarKey} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">{displayName}</p>
                      <p className="truncate text-xs text-slate-500">{user?.email}</p>
                    </div>
                  </div>
                  <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-slate-400">{formatRoleLabel(user?.role || "general_user")}</p>
                </div>
                <div className="p-2">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      startTransition(() => {
                        router.push("/dashboard/settings");
                      });
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
  )
}
