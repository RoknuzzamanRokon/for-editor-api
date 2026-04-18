"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000";

type MyApiEntry = {
  action: string;
  label: string;
  route: string;
  method: string;
  allowed: boolean;
  points: number;
  theme: string;
  icon: string;
  last_used_at: string | null;
  success_rate: number;
  description: string;
};

export default function DashboardAppCenterPage() {
  const router = useRouter();
  const [apis, setApis] = useState<MyApiEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pinnedRoutes, setPinnedRoutes] = useState<string[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("No access token found");
      setLoading(false);
      return;
    }

    fetch(`${API_BASE}/api/v3/permissions/my-api`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Failed to load API list");
        }
        const data = (await res.json()) as { user_id: number; apis: MyApiEntry[] };
        setApis(Array.isArray(data.apis) ? data.apis : []);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load API list");
      })
      .finally(() => setLoading(false));
  }, []);

  const allowedApis = useMemo(() => apis.filter((item) => item.allowed), [apis]);

  const orderedEndpoints = useMemo(() => {
    const pinOrder = new Map<string, number>(pinnedRoutes.map((route, index) => [route, index]));

    return [...allowedApis].sort((a, b) => {
      const aPinned = pinOrder.has(a.route);
      const bPinned = pinOrder.has(b.route);

      if (aPinned && bPinned) {
        return (pinOrder.get(a.route) ?? 0) - (pinOrder.get(b.route) ?? 0);
      }
      if (aPinned) return -1;
      if (bPinned) return 1;
      return 0;
    });
  }, [allowedApis, pinnedRoutes]);

  const togglePin = (route: string) => {
    setPinnedRoutes((prev) => {
      if (prev.includes(route)) {
        return prev.filter((item) => item !== route);
      }
      return [...prev, route];
    });
  };

  const getThemeClasses = (theme: string) => {
    switch (theme) {
      case "emerald":
      case "green":
        return "bg-emerald-100 text-emerald-600";
      case "amber":
        return "bg-amber-100 text-amber-600";
      case "slate":
        return "bg-slate-200 text-slate-700";
      case "blue":
      default:
        return "bg-blue-100 text-blue-600";
    }
  };

  const toEditSlug = (action: string) => action.replace(/_/g, "-");

  useEffect(() => {
    orderedEndpoints.slice(0, 32).forEach((item) => {
      router.prefetch(`/dashboard/app-center/edit/${toEditSlug(item.action)}`);
    });
  }, [orderedEndpoints, router]);

  return (
    <div className="w-full max-w-none space-y-8 p-8">
      <section className="relative overflow-hidden rounded-[13px] border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-primary p-8 text-white shadow-xl dark:border-slate-800">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-12 left-0 h-32 w-32 rounded-full bg-primary-foreground/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur">
              <span className="material-symbols-outlined text-sm">apps</span>
              App Center
            </div>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-white">App Center</h1>
            <p className="mt-2 max-w-3xl text-sm text-white/80 md:text-base">
              Active conversion APIs from <span className="font-semibold text-white">/api/v3/permissions/my-api</span>, ready to launch, pin, and run through your daily workflow without digging through menus.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white backdrop-blur">
            Total: {allowedApis.length}
          </div>
        </div>
      </section>

      <div className="flex items-center justify-between rounded-xl border border-primary/10 bg-primary/5 p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/20 p-2 text-primary">
            <span className="material-symbols-outlined">info</span>
          </div>
          <div>
            <p className="text-sm font-bold leading-tight">Usage Hint</p>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Each conversion costs <span className="font-bold">3 points</span>.
              Top up points in Billing to increase your limit.
            </p>
          </div>
        </div>
        <button className="rounded-lg bg-primary px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white">
          Top Up
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {["Category", "Status", "Method", "Sort"].map((item) => (
          <button
            key={item}
            className="flex items-center gap-2 rounded-xl border border-transparent bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 hover:border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-700"
          >
            {item}
            <span className="material-symbols-outlined text-[18px]">
              {item === "Sort" ? "sort" : "expand_more"}
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="rounded-[13px] border border-slate-200 bg-white p-5 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
            Loading API list...
          </div>
        ) : error ? (
          <div className="rounded-[13px] border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
            {error}
          </div>
        ) : null}

        {orderedEndpoints.map((item) => {
          const { action, label, route, icon, method, allowed, points, last_used_at, success_rate, description } = item;
          const iconClass = getThemeClasses(item.theme);
          const pinIndex = pinnedRoutes.indexOf(route);
          const pinned = pinIndex !== -1;
          const editHref = `/dashboard/app-center/edit/${toEditSlug(action)}`;

          return (
            <div
              key={route}
              className="relative overflow-hidden rounded-[13px] border border-slate-200/80 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.10)] transition-all hover:-translate-y-0.5 hover:shadow-[0_28px_70px_rgba(15,23,42,0.14)] dark:border-slate-800 dark:bg-slate-950"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.16),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.10),transparent_28%)]" />
              {pinned ? (
                <div className="absolute right-0 top-0 rounded-bl-lg bg-primary px-3 py-1 text-[10px] font-bold text-white">
                  PIN #{pinIndex + 1}
                </div>
              ) : null}

              <div className="relative p-5">
                <div className="mb-4 inline-flex rounded-2xl border border-white/40 bg-white/70 p-3 text-primary shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/10">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${iconClass}`}>
                    <span className="material-symbols-outlined text-[14px] align-middle">{icon}</span>
                  </span>
                </div>

                <h3 className="mb-1 text-lg font-bold text-slate-900 dark:text-white">{label}</h3>
                <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">{description}</p>

                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-primary/15 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                    {points} points
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                      allowed
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300"
                        : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {allowed ? "check_circle" : "cancel"}
                    </span>
                    {allowed ? "Allowed" : "Not allowed"}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                    {method}
                  </span>
                </div>

                <div className="mb-6 grid grid-cols-2 gap-2 text-[11px]">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900">
                    <p className="text-slate-400">Last used</p>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">
                      {last_used_at ? new Date(last_used_at).toLocaleString() : "Never"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900">
                    <p className="text-slate-400">Success rate</p>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">
                      {success_rate.toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={editHref}
                    prefetch
                    onMouseEnter={() => router.prefetch(editHref)}
                    onFocus={() => router.prefetch(editHref)}
                    className="flex flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-bold text-slate-900 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                  >
                    Try It
                  </Link>

                  <button
                    onClick={() => togglePin(route)}
                    className={`rounded-2xl border p-2 transition-colors ${
                      pinned
                        ? "border-primary/30 bg-primary/10 text-primary"
                        : "border-slate-200 bg-slate-50 text-slate-400 hover:text-slate-600 dark:border-slate-700 dark:bg-slate-900"
                    }`}
                    title={pinned ? "Unpin" : "Pin"}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      keep
                    </span>
                  </button>
                </div>

                <p className="mt-3 truncate text-[11px] text-slate-500 dark:text-slate-400">{route}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
