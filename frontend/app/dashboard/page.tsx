"use client";

import { useEffect, useMemo, useState } from "react";
import { API_BASE } from "@/lib/apiBase";
const CHART_WIDTH = 1920;
const CHART_HEIGHT = 240;
const CHART_PADDING = { top: 16, right: 16, bottom: 34, left: 16 };
const X_AXIS_LABEL_INDEXES = new Set([0, 7, 14, 21, 29]);

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
    usage_count: number;
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

type PerformancePoint = {
  date: string;
  label: string;
  total: number;
  x: number;
  y: number;
};

type RecentHistoryStatusItem = {
  status: string;
  label: string;
  count: number;
  percent: number;
  color: string;
  trackColor: string;
};

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

function formatShortDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, (month || 1) - 1, day || 1));
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
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

function getStatusMeta(status: string) {
  const value = status.toLowerCase();
  if (value === "success") {
    return {
      label: "Success",
      color: "#10b981",
      trackColor: "rgba(16, 185, 129, 0.18)",
    };
  }
  if (value === "processing") {
    return {
      label: "Processing",
      color: "#3b82f6",
      trackColor: "rgba(59, 130, 246, 0.18)",
    };
  }
  if (value === "failed") {
    return {
      label: "Failed",
      color: "#ef4444",
      trackColor: "rgba(239, 68, 68, 0.18)",
    };
  }
  return {
    label: "Other",
    color: "#64748b",
    trackColor: "rgba(100, 116, 139, 0.18)",
  };
}

function buildLast30DaysSeries(
  performance: DashboardOverviewResponse["performance_30_days"],
): PerformancePoint[] {
  const performanceMap = new Map(performance.map((item) => [item.date, item.total]));
  const today = new Date();
  const series: Array<{ date: string; total: number; label: string }> = [];

  for (let offset = 29; offset >= 0; offset -= 1) {
    const date = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
    date.setUTCDate(date.getUTCDate() - offset);
    const key = date.toISOString().slice(0, 10);
    series.push({
      date: key,
      total: performanceMap.get(key) ?? 0,
      label: formatShortDate(key),
    });
  }

  const maxTotal = Math.max(...series.map((item) => item.total), 1);
  const usableWidth = CHART_WIDTH - CHART_PADDING.left - CHART_PADDING.right;
  const usableHeight = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;

  return series.map((item, index) => {
    const x = CHART_PADDING.left + (usableWidth * index) / Math.max(series.length - 1, 1);
    const y = CHART_PADDING.top + usableHeight - (item.total / maxTotal) * usableHeight;

    return {
      ...item,
      x,
      y,
    };
  });
}

function buildRecentHistoryStatusSummary(
  recentHistory: DashboardOverviewResponse["recent_history"],
): RecentHistoryStatusItem[] {
  const counts = new Map<string, number>();

  for (const item of recentHistory) {
    const normalizedStatus = item.status.toLowerCase();
    const key =
      normalizedStatus === "success" ||
      normalizedStatus === "failed" ||
      normalizedStatus === "processing"
        ? normalizedStatus
        : "other";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const total = recentHistory.length;

  return ["success", "failed", "processing", "other"]
    .map((status) => {
      const count = counts.get(status) ?? 0;
      const meta = getStatusMeta(status);
      return {
        status,
        label: meta.label,
        count,
        percent: total === 0 ? 0 : (count / total) * 100,
        color: meta.color,
        trackColor: meta.trackColor,
      };
    })
    .filter((item) => item.count > 0 || (total === 0 && item.status !== "other"));
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

  const performanceSeries = useMemo(
    () => (overview ? buildLast30DaysSeries(overview.performance_30_days) : []),
    [overview],
  );
  const recentHistoryStatusSummary = useMemo(
    () => (overview ? buildRecentHistoryStatusSummary(overview.recent_history) : []),
    [overview],
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-8xl p-4 sm:p-6 lg:p-8">
        <div className="space-y-6">
          <div className="app-hero-card rounded-[13px] border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-primary p-6 shadow-xl dark:border-slate-800">
            <div className="h-5 w-36 animate-pulse rounded bg-white/20" />
            <div className="mt-4 h-10 w-80 max-w-full animate-pulse rounded bg-white/20" />
            <div className="mt-3 h-4 w-full max-w-2xl animate-pulse rounded bg-white/15" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="rounded-2xl border border-primary/10 bg-primary/5 p-6 shadow-sm">
                <div className="mb-4 h-10 w-10 animate-pulse rounded-xl bg-primary/10" />
                <div className="h-4 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                <div className="mt-3 h-8 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !overview) {
    return (
      <div className="mx-auto max-w-8xl p-4 sm:p-6 lg:p-8">
        <div className="rounded-[13px] border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-300">
          {error || "Dashboard data not available"}
        </div>
      </div>
    );
  }

  const totalRequests30Days = performanceSeries.reduce((sum, item) => sum + item.total, 0);
  const busiestDay = performanceSeries.reduce((best, current) => {
    if (!best || current.total > best.total) {
      return current;
    }
    return best;
  }, performanceSeries[0]);
  const chartLinePath = performanceSeries
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
  const chartAreaPath = chartLinePath
    ? `${chartLinePath} L ${performanceSeries[performanceSeries.length - 1]?.x ?? CHART_PADDING.left} ${CHART_HEIGHT - CHART_PADDING.bottom} L ${performanceSeries[0]?.x ?? CHART_PADDING.left} ${CHART_HEIGHT - CHART_PADDING.bottom} Z`
    : "";
  const maxTotal = Math.max(...performanceSeries.map((item) => item.total), 1);
  const yAxisTicks = Array.from({ length: 4 }, (_, index) => {
    const value = Math.round((maxTotal * (3 - index)) / 3);
    const y =
      CHART_PADDING.top +
      ((CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom) * index) / 3;

    return { value, y };
  });
  const recentHistoryTotal = overview.recent_history.length;
  const donutRadius = 54;
  const donutCircumference = 2 * Math.PI * donutRadius;
  let donutOffset = 0;
  const recentHistoryDonutSegments = recentHistoryStatusSummary.map((item) => {
    const segmentLength =
      recentHistoryTotal === 0 ? 0 : (item.count / recentHistoryTotal) * donutCircumference;
    const segment = {
      ...item,
      dashArray: `${segmentLength} ${Math.max(donutCircumference - segmentLength, 0)}`,
      dashOffset: -donutOffset,
    };
    donutOffset += segmentLength;
    return segment;
  });
  const maxActiveApiUsage = Math.max(...overview.active_apis.map((api) => api.usage_count), 1);

  return (
    <div className="mx-auto max-w-8xl space-y-6 p-4 sm:space-y-8 sm:p-6 lg:p-8">
      <section className="app-hero-card relative overflow-hidden rounded-[13px] border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-primary p-5 text-white shadow-xl sm:p-8 dark:border-slate-800">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-12 left-0 h-32 w-32 rounded-full bg-primary-foreground/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
              <span className="material-symbols-outlined text-base">
                dashboard
              </span>
              Live API overview
            </div>

            <h1 className="text-2xl font-black tracking-tight sm:text-3xl md:text-5xl">
              Hi, {displayName.charAt(0).toUpperCase() + displayName.slice(1)}
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-white/80 md:text-base">
              Track request volume, API usage, conversion health, and recent
              activity from one clean dashboard.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-xs uppercase tracking-wider text-white/70">
                Role
              </p>
              <p className="mt-1 text-sm font-bold">
                {overview.user.role.replaceAll("_", " ")}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-xs uppercase tracking-wider text-white/70">
                Status
              </p>
              <p className="mt-1 text-sm font-bold">
                {overview.user.is_active ? "Active" : "Inactive"}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-xs uppercase tracking-wider text-white/70">
                Points
              </p>
              <p className="mt-1 text-sm font-bold">
                {overview.summary.remaining_points}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-xs uppercase tracking-wider text-white/70">
                Active APIs
              </p>
              <p className="mt-1 text-sm font-bold">
                {overview.summary.active_api_count}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[13px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-medium text-slate-500">Monthly Requests</p>
          <p className="mt-1 text-2xl font-bold">
            {overview.summary.monthly_requests.toLocaleString()}
          </p>
        </div>

        <div className="rounded-[13px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-medium text-slate-500">Remaining Points</p>
          <p className="mt-1 text-2xl font-bold">
            {overview.summary.remaining_points.toLocaleString()}
          </p>
        </div>

        <div className="rounded-[13px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-medium text-slate-500">Success Rate</p>
          <p className="mt-1 text-2xl font-bold">
            {overview.summary.success_rate.toFixed(1)}%
          </p>
        </div>

        <div className="rounded-[13px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-medium text-slate-500">Avg. Latency</p>
          <p className="mt-1 text-2xl font-bold">
            {overview.summary.avg_latency_ms == null
              ? "-"
              : `${Math.round(overview.summary.avg_latency_ms)}ms`}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-[13px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-100 p-4 sm:p-6 dark:border-slate-800">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h3 className="text-lg font-bold">API Performance (30 Days)</h3>
              <p className="mt-1 text-sm text-slate-500">
                Daily request volume across the last 30 days, including inactive
                days.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 text-sm sm:min-w-[280px] sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/60">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Total Requests
                </p>
                <p className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">
                  {totalRequests30Days.toLocaleString()}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/60">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Busiest Day
                </p>
                <p className="mt-1 text-sm font-bold text-slate-900 dark:text-slate-100">
                  {busiestDay
                    ? `${busiestDay.label} (${busiestDay.total})`
                    : "-"}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 sm:p-8">
          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
              className="h-72 min-w-[640px] w-full"
              role="img"
              aria-label="30 day API usage line chart"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient
                  id="performance-area"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="var(--primary)"
                    stopOpacity="0.28"
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--primary)"
                    stopOpacity="0.03"
                  />
                </linearGradient>
              </defs>

              {yAxisTicks.map((tick) => (
                <g key={`${tick.value}-${tick.y}`}>
                  <line
                    x1={CHART_PADDING.left}
                    y1={tick.y}
                    x2={CHART_WIDTH - CHART_PADDING.right}
                    y2={tick.y}
                    stroke="currentColor"
                    strokeOpacity="0.12"
                    strokeDasharray="4 6"
                  />
                  <text
                    x={CHART_PADDING.left}
                    y={tick.y - 6}
                    fontSize="11"
                    fill="currentColor"
                    opacity="0.55"
                  >
                    {tick.value}
                  </text>
                </g>
              ))}

              <line
                x1={CHART_PADDING.left}
                y1={CHART_HEIGHT - CHART_PADDING.bottom}
                x2={CHART_WIDTH - CHART_PADDING.right}
                y2={CHART_HEIGHT - CHART_PADDING.bottom}
                stroke="currentColor"
                strokeOpacity="0.16"
              />

              {chartAreaPath ? (
                <path
                  d={chartAreaPath}
                  fill="url(#performance-area)"
                  stroke="none"
                />
              ) : null}

              <path
                d={chartLinePath}
                fill="none"
                stroke="var(--primary)"
                strokeWidth="3"
                strokeLinejoin="round"
                strokeLinecap="round"
              />

              {performanceSeries.map((point, index) => (
                <g key={point.date}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={index === performanceSeries.length - 1 ? 5 : 4}
                    fill="var(--primary)"
                    stroke="white"
                    strokeWidth="2"
                  >
                    <title>{`${point.date}: ${point.total} request${point.total === 1 ? "" : "s"}`}</title>
                  </circle>
                  {X_AXIS_LABEL_INDEXES.has(index) ? (
                    <text
                      x={point.x}
                      y={CHART_HEIGHT - 10}
                      textAnchor={
                        index === 0 ? "start" : index === 29 ? "end" : "middle"
                      }
                      fontSize="11"
                      fill="currentColor"
                      opacity="0.6"
                    >
                      {point.label}
                    </text>
                  ) : null}
                </g>
              ))}
            </svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <div className="rounded-[13px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold">My Active APIs</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Usage count by API action.
                </p>
              </div>
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">
                {overview.active_apis.length} APIs
              </span>
            </div>
            {overview.active_apis.length === 0 ? (
              <p className="text-sm text-slate-500">No active APIs found.</p>
            ) : (
              <div className="space-y-4">
                {overview.active_apis
                  .slice()
                  .sort((left, right) => right.usage_count - left.usage_count)
                  .slice(0, 6)
                  .map((api) => (
                    <div key={api.action} className="space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">
                            {api.label}
                          </p>
                          <p className="truncate text-[11px] text-slate-500">
                            {api.route}
                          </p>
                        </div>
                        <p className="shrink-0 text-sm font-bold text-slate-900 dark:text-slate-100">
                          {api.usage_count}{" "}
                          {api.usage_count === 1 ? "time" : "times"}
                        </p>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{
                            width: `${Math.max((api.usage_count / maxActiveApiUsage) * 100, api.usage_count > 0 ? 8 : 0)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          <div className="rounded-[13px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h4 className="mb-3 font-bold">Conversion Summary</h4>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <p>
                Total:{" "}
                <span className="font-semibold">
                  {overview.summary.total_conversions}
                </span>
              </p>
              <p>
                Success:{" "}
                <span className="font-semibold">
                  {overview.summary.success_conversions}
                </span>
              </p>
              <p>
                Failed:{" "}
                <span className="font-semibold">
                  {overview.summary.failed_conversions}
                </span>
              </p>
              <p>
                Processing:{" "}
                <span className="font-semibold">
                  {overview.summary.processing_conversions}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-[13px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-2 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6 dark:border-slate-800">
              <h3 className="text-lg font-bold">Recent History</h3>
              <span className="text-xs text-slate-500">
                {overview.recent_history.length > 10
                  ? "Showing first 10, scroll for more"
                  : `Last ${overview.recent_history.length} items`}
              </span>
            </div>
            <div className="border-b border-slate-100 p-4 sm:p-6 dark:border-slate-800">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr] lg:items-center">
                <div className="flex justify-center">
                  <div className="relative h-44 w-44">
                    <svg
                      viewBox="0 0 160 160"
                      className="h-full w-full"
                      role="img"
                      aria-label="Recent history status breakdown"
                    >
                      <circle
                        cx="80"
                        cy="80"
                        r={donutRadius}
                        fill="none"
                        stroke="rgba(148, 163, 184, 0.16)"
                        strokeWidth="18"
                      />
                      {recentHistoryDonutSegments.map((item) => (
                        <circle
                          key={item.status}
                          cx="80"
                          cy="80"
                          r={donutRadius}
                          fill="none"
                          stroke={item.color}
                          strokeWidth="18"
                          strokeLinecap="round"
                          strokeDasharray={item.dashArray}
                          strokeDashoffset={item.dashOffset}
                          transform="rotate(-90 80 80)"
                        >
                          <title>{`${item.label}: ${item.count} (${item.percent.toFixed(0)}%)`}</title>
                        </circle>
                      ))}
                    </svg>
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="mt-2 text-3xl font-black text-slate-900 dark:text-slate-100">
                        {recentHistoryTotal}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      Status breakdown from the current recent history list.
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Quick health view for the same records shown in the table
                      below.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {recentHistoryStatusSummary.map((item) => (
                      <div
                        key={item.status}
                        className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: item.color }}
                              aria-hidden="true"
                            />
                            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                              {item.label}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                              {item.count}
                            </p>
                            <p className="text-xs text-slate-500">
                              {item.percent.toFixed(0)}%
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${item.percent}%`,
                              backgroundColor: item.color,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
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
                      <td
                        className="px-6 py-6 text-sm text-slate-500"
                        colSpan={5}
                      >
                        No history found.
                      </td>
                    </tr>
                  ) : (
                    overview.recent_history.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 text-sm font-medium">
                          {item.endpoint}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${getStatusBadge(item.status)}`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {formatDuration(item.duration_ms)}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {item.points_charged}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {formatDate(item.updated_at)}
                        </td>
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
