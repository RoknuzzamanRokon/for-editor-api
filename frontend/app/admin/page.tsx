"use client";

import { useEffect, useMemo, useState } from "react";
import AdminShell from "../../components/admin/AdminShell";
import { API_BASE } from "@/lib/apiBase";

type AdminDashboardQuickStat = {
  label: string;
  value: number;
  icon: string;
};

type AdminDashboardActivityEntry = {
  user_id: number;
  user_email: string;
  user_username: string | null;
  points_change: number;
  action: string;
  occurred_at: string;
};

type AdminDashboardSystemMetric = {
  label: string;
  value: string;
  tone: string | null;
};

type AdminDashboardSummaryResponse = {
  quick_stats: AdminDashboardQuickStat[];
  recent_activity: AdminDashboardActivityEntry[];
  system_status: AdminDashboardSystemMetric[];
};

function formatNumber(value: number) {
  return new Intl.NumberFormat().format(value);
}

function formatRelativeTime(value: string) {
  const date = new Date(value);
  const diffMs = date.getTime() - Date.now();
  const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  const minutes = Math.round(diffMs / (1000 * 60));

  if (Math.abs(minutes) < 60) return formatter.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return formatter.format(hours, "hour");
  const days = Math.round(hours / 24);
  return formatter.format(days, "day");
}

function getToneClass(tone?: string | null) {
  if (tone === "success") return "text-emerald-600";
  if (tone === "warning") return "text-amber-600";
  if (tone === "danger") return "text-rose-600";
  return "text-slate-900 dark:text-white";
}

function HeroMetric({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[13px] border border-white/40 bg-white/45 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.05]">
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <div className="mt-3 flex items-center gap-3">
        <span className="material-symbols-outlined text-primary">{icon}</span>
        <p className="text-lg font-black text-slate-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [summary, setSummary] = useState<AdminDashboardSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("No access token found.");
      setLoading(false);
      return;
    }

    fetch(`${API_BASE}/api/v3/admin/dashboard-summary`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        const body = await res.text();
        if (!res.ok) {
          throw new Error(body || "Failed to load dashboard summary");
        }
        return JSON.parse(body) as AdminDashboardSummaryResponse;
      })
      .then((data) => setSummary(data))
      .catch((err: unknown) => {
        setError(
          err instanceof Error ? err.message : "Failed to load dashboard summary",
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const quickStats = useMemo(() => summary?.quick_stats ?? [], [summary]);
  const recentActivity = useMemo(() => summary?.recent_activity ?? [], [summary]);
  const systemStatus = useMemo(() => summary?.system_status ?? [], [summary]);

  return (
    <AdminShell>
      <div className="mx-auto max-w-8xl space-y-6 p-4 sm:space-y-8 sm:p-6 lg:p-8">
        <section className="relative overflow-hidden rounded-[13px] border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-primary px-6 py-7 text-white shadow-[0_28px_90px_rgba(15,23,42,0.18)] md:px-8 md:py-8 dark:border-slate-800">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-12 left-0 h-32 w-32 rounded-full bg-primary-foreground/10 blur-3xl" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          <div className="absolute left-0 top-10 h-40 w-px bg-gradient-to-b from-white/0 via-white/20 to-white/0" />
          <div className="relative">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-[30px] border border-primary/25 bg-white/55 text-primary shadow-[0_0_50px_rgba(59,130,246,0.18)] backdrop-blur-xl dark:border-cyan-300/10 dark:bg-white/5 dark:shadow-[0_0_56px_rgba(59,130,246,0.20)]">
                <span className="material-symbols-outlined relative text-5xl">admin_panel_settings</span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/65 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.24em] text-primary backdrop-blur-md dark:border-white/10 dark:bg-white/10">
                  <span className="material-symbols-outlined text-sm">shield</span>
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Admin Control Center
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white md:text-5xl">
                    Admin Dashboard
                  </h1>
                </div>

                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300 md:text-base">
                  Monitor usage, point flow, active users, recent platform activity, and system-level status from one command surface.
                </p>
              </div>
            </div>
          </div>
        </section>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-primary/10 bg-primary/5 p-6 shadow-sm"
                >
                  <div className="mb-4 h-10 w-10 animate-pulse rounded-xl bg-primary/10" />
                  <div className="h-4 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="mt-3 h-8 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                </div>
              ))
            : quickStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-primary/10 bg-primary/5 p-6 shadow-sm"
                >
                  <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-2 text-primary">
                    <span className="material-symbols-outlined">{stat.icon}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                    {formatNumber(stat.value)}
                  </p>
                </div>
              ))}
        </section>

        <section className="grid grid-cols-1 gap-8 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-col gap-2 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6 dark:border-slate-800">
                <h2 className="text-lg font-bold">Recent Activity</h2>
                <button className="text-xs font-bold text-primary hover:underline" type="button">
                  View all
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-800/50">
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Points</th>
                      <th className="px-6 py-4">Action</th>
                      <th className="px-6 py-4">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {loading ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4">
                            <div className="h-4 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-4 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-4 w-28 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                          </td>
                        </tr>
                      ))
                    ) : recentActivity.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-10 text-center text-sm text-slate-500">
                          No recent activity found.
                        </td>
                      </tr>
                    ) : (
                      recentActivity.map((row) => (
                        <tr
                          key={`${row.user_id}-${row.occurred_at}-${row.action}`}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/40"
                        >
                          <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                            {row.user_username || row.user_email}
                          </td>
                          <td
                            className={`px-6 py-4 font-bold ${
                              row.points_change < 0 ? "text-red-600" : "text-emerald-600"
                            }`}
                          >
                            {row.points_change > 0 ? "+" : ""}
                            {formatNumber(row.points_change)}
                          </td>
                          <td className="px-6 py-4">{row.action}</td>
                          <td className="px-6 py-4 text-slate-500">
                            {formatRelativeTime(row.occurred_at)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-primary/10 bg-primary/5 p-6 shadow-sm">
              <h3 className="mb-4 text-base font-bold">Quick Action</h3>
              <button
                type="button"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white transition hover:opacity-90"
              >
                <span className="material-symbols-outlined text-base">add</span>
                Give Points
              </button>
            </div>

            <div className="rounded-2xl border border-primary/10 bg-primary/5 p-6 shadow-sm">
              <h3 className="mb-4 text-base font-bold">System Status</h3>
              <div className="space-y-3 text-sm">
                {loading
                  ? Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="h-4 w-28 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                        <div className="h-4 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                      </div>
                    ))
                  : systemStatus.map((item) => (
                      <div key={item.label} className="flex items-center justify-between">
                        <span className="text-slate-500">{item.label}</span>
                        <span className={`font-semibold ${getToneClass(item.tone)}`}>
                          {item.value}
                        </span>
                      </div>
                    ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
