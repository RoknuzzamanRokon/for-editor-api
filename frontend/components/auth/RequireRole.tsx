"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { API_BASE } from "@/lib/apiBase";

type Role = "super_user" | "admin" | "admin_user" | "general_user" | string;

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
  return res.json();
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

      if (!access && !refresh) {
        router.replace(`/login?next=${encodeURIComponent(pathname || "/")}`);
        return;
      }

      try {
        const me = await fetchMe(access || "");
        const role = me?.role as Role;
        localStorage.setItem("user_role", role);
        if (!allow.includes(role)) {
          router.replace(role === "general_user" ? "/dashboard" : "/admin");
          return;
        }
      } catch {
        if (!refresh) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user_role");
          router.replace(`/login?next=${encodeURIComponent(pathname || "/")}`);
          return;
        }

        try {
          const refreshed = await refreshToken(refresh);
          const newAccess = refreshed?.access_token as string | undefined;
          if (!newAccess) throw new Error("no_access");
          localStorage.setItem("access_token", newAccess);
          const me = await fetchMe(newAccess);
          const role = me?.role as Role;
          localStorage.setItem("user_role", role);
          if (!allow.includes(role)) {
            router.replace(role === "general_user" ? "/dashboard" : "/admin");
            return;
          }
        } catch {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user_role");
          router.replace(`/login?next=${encodeURIComponent(pathname || "/")}`);
          return;
        }
      }

      if (!cancelled) setReady(true);
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [allow, pathname, router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-light text-slate-600">
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}
