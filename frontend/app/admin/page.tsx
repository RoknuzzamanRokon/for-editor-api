"use client";

import { useEffect, useMemo, useState } from "react";
import AdminShell from "../../components/admin/AdminShell";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000";

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
      <div className="mx-auto max-w-8xl space-y-8 p-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Monitor usage, point flow, and system-level activity from one place.
          </p>
        </div>

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
              <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-800">
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
