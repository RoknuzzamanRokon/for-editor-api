"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { API_BASE } from "@/lib/apiBase";
import RouteLoadingContent from "@/components/ui/RouteLoadingContent";
import UserShell from "@/components/user/UserShell";
import AdminShell from "@/components/admin/AdminShell";

type Role = "super_user" | "admin" | "admin_user" | "general_user" | string;
type RefreshTokenResponse = {
  access_token?: string;
  token_type?: string;
};

function defaultRouteForRole(role: Role) {
  return role === "general_user" || role === "demo_user" ? "/dashboard" : "/admin";
}

async function fetchMe(token: string) {
  const res = await fetch(`${API_BASE}/api/v2/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("me_failed");
  return res.json();
}

async function refreshToken(refreshToken: string) {
  const res = await fetch(`${API_BASE}/api/v2/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  if (!res.ok) throw new Error("refresh_failed");
  return res.json() as Promise<RefreshTokenResponse>;
}

function clearStoredSession() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user_role");
}

async function fetchRoleFromToken(token: string) {
  const me = await fetchMe(token);
  const role = me?.role;
  if (!role || typeof role !== "string") {
    throw new Error("missing_role");
  }
  return role as Role;
}

async function refreshAccessToken(refresh: string) {
  const refreshed = await refreshToken(refresh);
  const newAccess = refreshed?.access_token;
  if (!newAccess) throw new Error("no_access");
  localStorage.setItem("access_token", newAccess);
  return newAccess;
}

async function resolveRoleWithStoredTokens(access?: string | null, refresh?: string | null) {
  if (access) {
    try {
      const role = await fetchRoleFromToken(access);
      if (role) {
        localStorage.setItem("user_role", role);
      }
      return role;
    } catch {
      // Fall through to refresh token flow.
    }
  }

  if (!refresh) {
    throw new Error("missing_refresh");
  }

  const newAccess = await refreshAccessToken(refresh);
  const role = await fetchRoleFromToken(newAccess);
  if (role) {
    localStorage.setItem("user_role", role);
  }
  return role;
}

export default function RequireRole({
  allow,
  children,
}: {
  allow: Role[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const access = localStorage.getItem("access_token");
      const refresh = localStorage.getItem("refresh_token");
      const cachedRole = localStorage.getItem("user_role");

      if (!access && !refresh) {
        router.replace(`/login?next=${encodeURIComponent(pathname || "/")}`);
        return;
      }

      // Quick check with cached role first, but only when an access token exists.
      if (cachedRole && allow.includes(cachedRole) && access) {
        if (!cancelled) setReady(true);
        void resolveRoleWithStoredTokens(access, refresh)
          .then((role) => {
            if (!role) return;
            if (!allow.includes(role)) {
              router.replace(defaultRouteForRole(role));
            }
          })
          .catch(() => {
            clearStoredSession();
            router.replace(`/login?next=${encodeURIComponent(pathname || "/")}`);
          });
        return;
      }

      try {
        const role = await resolveRoleWithStoredTokens(access, refresh);
        if (!allow.includes(role)) {
          router.replace(defaultRouteForRole(role));
          return;
        }
      } catch {
        clearStoredSession();
        router.replace(`/login?next=${encodeURIComponent(pathname || "/")}`);
        return;
      }

      if (!cancelled) setReady(true);
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [allow, pathname, router]);

  if (!ready) {
    if ((pathname || "").startsWith("/dashboard")) {
      return (
        <UserShell>
          <RouteLoadingContent label="Dashboard workspace" titleWidth="w-72" />
        </UserShell>
      );
    }

    if ((pathname || "").startsWith("/admin")) {
      return (
        <AdminShell>
          <RouteLoadingContent label="Admin workspace" titleWidth="w-80" />
        </AdminShell>
      );
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-background-light dark:bg-slate-950/50 text-foreground/70">
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}
