"use client";

import { useEffect, useMemo, useState } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000";

type DashboardOverviewResponse = {
  user: {
    id: number;
    email: string;
    username: string | null;
    role: string;
    is_active: boolean;
    created_at: string;
  };
  summary: {
    monthly_requests: number;
    remaining_points: number;
    success_rate: number;
    avg_latency_ms: number | null;
    total_conversions: number;
    success_conversions: number;
    failed_conversions: number;
    processing_conversions: number;
    active_api_count: number;
  };
  performance_30_days: Array<{
    date: string;
    total: number;
    success: number;
    failed: number;
    processing: number;
  }>;
  active_apis: Array<{
    action: string;
    label: string;
    route: string;
    method: string;
    points: number;
    last_used_at: string | null;
    success_rate: number;
    description: string;
  }>;
  recent_history: Array<{
    id: number;
    action: string;
    endpoint: string;
    status: string;
    input_filename: string;
    points_charged: number;
    duration_ms: number | null;
    created_at: string;
    updated_at: string;
    download_url: string | null;
  }>;
};

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

function formatDuration(durationMs?: number | null) {
  if (durationMs == null) return "-";
  if (durationMs < 1000) return `${durationMs}ms`;
  return `${(durationMs / 1000).toFixed(1)}s`;
}

function getStatusBadge(status: string) {
  const value = status.toLowerCase();
  if (value === "success") {
    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
  }
  if (value === "processing") {
    return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
  }
  if (value === "failed") {
    return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
  }
  return "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300";
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [overview, setOverview] = useState<DashboardOverviewResponse | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("No access token found");
      setLoading(false);
      return;
    }

    fetch(`${API_BASE}/api/v3/dashboard/overview`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        const bodyText = await res.text();
        if (!res.ok) {
          throw new Error(bodyText || "Failed to load dashboard overview");
        }
        return JSON.parse(bodyText) as DashboardOverviewResponse;
      })
      .then((data) => {
        setOverview(data);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load dashboard overview");
      })
      .finally(() => setLoading(false));
  }, []);

  const displayName = useMemo(() => {
    if (!overview) return "User";
    return overview.user.username || overview.user.email;
  }, [overview]);

  if (loading) {
    return (
      <div className="mx-auto max-w-8xl p-8">
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (error || !overview) {
    return (
      <div className="mx-auto max-w-8xl p-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-300">
          {error || "Dashboard data not available"}
        </div>
      </div>
    );
  }

  const maxTotal = Math.max(...overview.performance_30_days.map((item) => item.total), 1);

  return (
    <div className="mx-auto max-w-8xl space-y-8 p-8">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">Welcome back, {displayName}</h2>
        <p className="mt-1 text-slate-500">Here is what's happening with your API integrations today.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-medium text-slate-500">Monthly Requests</p>
          <p className="mt-1 text-2xl font-bold">{overview.summary.monthly_requests.toLocaleString()}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-medium text-slate-500">Remaining Points</p>
          <p className="mt-1 text-2xl font-bold">{overview.summary.remaining_points.toLocaleString()}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-medium text-slate-500">Success Rate</p>
          <p className="mt-1 text-2xl font-bold">{overview.summary.success_rate.toFixed(1)}%</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-medium text-slate-500">Avg. Latency</p>
          <p className="mt-1 text-2xl font-bold">
            {overview.summary.avg_latency_ms == null ? "-" : `${Math.round(overview.summary.avg_latency_ms)}ms`}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-100 p-6 dark:border-slate-800">
          <h3 className="text-lg font-bold">API Performance (30 Days)</h3>
        </div>
        <div className="flex h-64 items-end gap-2 p-8">
          {(overview.performance_30_days.length > 0 ? overview.performance_30_days : [{ date: "-", total: 0, success: 0, failed: 0, processing: 0 }]).map((item) => (
            <div
              key={item.date}
              className="flex-1 rounded-t-lg bg-primary/20 transition-all hover:bg-primary"
              style={{ height: `${Math.max((item.total / maxTotal) * 100, 3)}%` }}
              title={`${item.date}: ${item.total}`}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-4 font-bold">My Active APIs</h3>
            {overview.active_apis.length === 0 ? (
              <p className="text-sm text-slate-500">No active APIs found.</p>
            ) : (
              <div className="space-y-3">
                {overview.active_apis.slice(0, 6).map((api) => (
                  <div key={api.action} className="rounded-lg border border-primary/10 bg-primary/5 p-3">
                    <p className="text-sm font-semibold">{api.label}</p>
                    <p className="text-xs text-slate-500">{api.route}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h4 className="mb-3 font-bold">Conversion Summary</h4>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <p>Total: <span className="font-semibold">{overview.summary.total_conversions}</span></p>
              <p>Success: <span className="font-semibold">{overview.summary.success_conversions}</span></p>
              <p>Failed: <span className="font-semibold">{overview.summary.failed_conversions}</span></p>
              <p>Processing: <span className="font-semibold">{overview.summary.processing_conversions}</span></p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-800">
              <h3 className="text-lg font-bold">Recent History</h3>
              <span className="text-xs text-slate-500">
                {overview.recent_history.length > 10
                  ? "Showing first 10, scroll for more"
                  : `Last ${overview.recent_history.length} items`}
              </span>
            </div>
            <div className="max-h-[560px] overflow-y-auto overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-xs font-bold uppercase tracking-wider text-slate-400 dark:bg-slate-800/50">
                    <th className="px-6 py-4">Endpoint</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Time</th>
                    <th className="px-6 py-4">Points</th>
                    <th className="px-6 py-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {overview.recent_history.length === 0 ? (
                    <tr>
                      <td className="px-6 py-6 text-sm text-slate-500" colSpan={5}>
                        No history found.
                      </td>
                    </tr>
                  ) : (
                    overview.recent_history.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 text-sm font-medium">{item.endpoint}</td>
                        <td className="px-6 py-4">
                          <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${getStatusBadge(item.status)}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">{formatDuration(item.duration_ms)}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">{item.points_charged}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">{formatDate(item.updated_at)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
