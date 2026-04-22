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

type AdminDashboardRequestTrendDay = {
  date: string;
  total: number;
  success: number;
  failed: number;
  processing: number;
};

type AdminDashboardPointsTrendDay = {
  date: string;
  topup: number;
  spent: number;
  refunded: number;
};

type AdminDashboardSummaryResponse = {
  quick_stats: AdminDashboardQuickStat[];
  recent_activity: AdminDashboardActivityEntry[];
  system_status: AdminDashboardSystemMetric[];
  request_trend_30_days: AdminDashboardRequestTrendDay[];
  points_activity_30_days: AdminDashboardPointsTrendDay[];
};

type ChartPoint = {
  x: number;
  y: number;
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

function formatDayLabel(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(new Date(`${value}T00:00:00Z`));
}

function getToneClass(tone?: string | null) {
  if (tone === "success") return "text-emerald-600";
  if (tone === "warning") return "text-amber-600";
  if (tone === "danger") return "text-rose-600";
  return "text-slate-900 dark:text-white";
}

function buildLinePath(values: number[], width: number, height: number, maxValue: number) {
  if (values.length === 0) return "";

  return values
    .map((value, index) => {
      const x = values.length === 1 ? width / 2 : (index / (values.length - 1)) * width;
      const y = maxValue === 0 ? height : height - (value / maxValue) * height;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function buildAreaPath(values: number[], width: number, height: number, maxValue: number) {
  if (values.length === 0) return "";

  const linePath = buildLinePath(values, width, height, maxValue);
  return `${linePath} L ${width} ${height} L 0 ${height} Z`;
}

function getChartPoints(values: number[], width: number, height: number, maxValue: number): ChartPoint[] {
  if (values.length === 0) return [];

  return values.map((value, index) => ({
    x: values.length === 1 ? width / 2 : (index / (values.length - 1)) * width,
    y: maxValue === 0 ? height : height - (value / maxValue) * height,
  }));
}

function ChartStat({
  label,
  value,
  toneClass,
}: {
  label: string;
  value: string;
  toneClass?: string;
}) {
  return (
    <div className="rounded-[16px] border border-white/45 bg-white/60 px-4 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.05]">
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className={`mt-2 text-lg font-black text-slate-900 dark:text-white ${toneClass ?? ""}`}>{value}</p>
    </div>
  );
}

function ChartLegend({
  items,
}: {
  items: { label: string; color: string; value: string }[];
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-[16px] border border-slate-200/70 bg-white/75 px-4 py-3 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/70"
        >
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              {item.label}
            </span>
          </div>
          <p className="mt-2 text-lg font-black text-slate-900 dark:text-white">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[24px] border border-slate-200/80 bg-white/80 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.07)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/75 sm:p-6">
      <div className="mb-5">
        <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
      </div>
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}

function DonutStat({
  label,
  value,
  helper,
  color,
}: {
  label: string;
  value: number;
  helper: string;
  color: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className="rounded-[18px] border border-slate-200/70 bg-white/80 p-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/70">
      <div className="flex items-center gap-4">
        <div
          className="relative h-16 w-16 shrink-0 rounded-full"
          style={{
            background: `conic-gradient(${color} 0deg ${clamped * 3.6}deg, rgba(148,163,184,0.18) ${clamped * 3.6}deg 360deg)`,
          }}
        >
          <div className="absolute inset-[7px] flex items-center justify-center rounded-full bg-white text-sm font-black text-slate-900 dark:bg-slate-950 dark:text-white">
            {clamped.toFixed(0)}%
          </div>
        </div>

        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-900 dark:text-white">{label}</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{helper}</p>
        </div>
      </div>
    </div>
  );
}

function RequestTrendChart({
  data,
  loading,
}: {
  data: AdminDashboardRequestTrendDay[];
  loading: boolean;
}) {
  const width = 680;
  const height = 220;
  const labels = useMemo(
    () =>
      data.map((item, index) => ({
        date: item.date,
        show: index === 0 || index === data.length - 1 || index % 7 === 0,
      })),
    [data],
  );
  const totals = useMemo(() => data.map((item) => item.total), [data]);
  const success = useMemo(() => data.map((item) => item.success), [data]);
  const failed = useMemo(() => data.map((item) => item.failed), [data]);
  const maxValue = Math.max(1, ...totals, ...success, ...failed);
  const totalPath = buildLinePath(totals, width, height, maxValue);
  const totalAreaPath = buildAreaPath(totals, width, height, maxValue);
  const successPath = buildLinePath(success, width, height, maxValue);
  const failedPath = buildLinePath(failed, width, height, maxValue);
  const totalPoints = getChartPoints(totals, width, height, maxValue);
  const gridValues = [0, 0.25, 0.5, 0.75, 1];

  const totalRequests = totals.reduce((sum, value) => sum + value, 0);
  const peakDay = data.reduce<AdminDashboardRequestTrendDay | null>(
    (peak, item) => (!peak || item.total > peak.total ? item : peak),
    null,
  );
  const successRate = totalRequests
    ? Math.round((success.reduce((sum, value) => sum + value, 0) / totalRequests) * 1000) / 10
    : 0;

  return (
    <ChartCard
      title="Requests Overview"
      description="Daily request volume for the last 30 days with success and failed overlays."
    >
      <div className="mt-6 flex flex-1 flex-col">
        {loading ? (
          <div className="min-h-[420px] flex-1 animate-pulse rounded-[20px] bg-slate-100 dark:bg-slate-800" />
        ) : (
          <div className="flex min-h-[420px] flex-1 flex-col overflow-hidden rounded-[20px] border border-slate-200/80 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4 sm:p-5">
            <div className="min-h-[320px] w-full flex-1">
              <svg viewBox={`0 0 ${width} ${height + 32}`} className="h-full w-full" role="img" aria-label="Admin request trend chart">
                <defs>
                  <linearGradient id="admin-request-area" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.02" />
                  </linearGradient>
                </defs>

                {gridValues.map((ratio) => {
                  const y = height - height * ratio;
                  return (
                    <g key={ratio}>
                      <line x1="0" x2={width} y1={y} y2={y} stroke="rgba(255,255,255,0.10)" strokeDasharray="5 8" />
                      <text
                        x="0"
                        y={Math.max(y - 6, 12)}
                        fill="rgba(255,255,255,0.55)"
                        fontSize="12"
                      >
                        {formatNumber(Math.round(maxValue * ratio))}
                      </text>
                    </g>
                  );
                })}

                <path d={totalAreaPath} fill="url(#admin-request-area)" />
                <path d={totalPath} fill="none" stroke="#7dd3fc" strokeWidth="4" strokeLinecap="round" />
                <path d={successPath} fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" />
                <path d={failedPath} fill="none" stroke="#fb7185" strokeWidth="2.5" strokeLinecap="round" />

                {totalPoints.map((point, index) => (
                  <circle key={`${point.x}-${index}`} cx={point.x} cy={point.y} r="3.5" fill="#e0f2fe" />
                ))}

                {labels.map((label, index) => {
                  if (!label.show) return null;
                  const x = labels.length === 1 ? width / 2 : (index / (labels.length - 1)) * width;
                  return (
                    <text
                      key={label.date}
                      x={x}
                      y={height + 22}
                      textAnchor={index === 0 ? "start" : index === labels.length - 1 ? "end" : "middle"}
                      fill="rgba(255,255,255,0.58)"
                      fontSize="12"
                    >
                      {formatDayLabel(label.date)}
                    </text>
                  );
                })}
              </svg>
            </div>

            <div className="mt-4">
              <ChartLegend
                items={[
                  { label: "Total", color: "#7dd3fc", value: formatNumber(totalRequests) },
                  {
                    label: "Successful",
                    color: "#34d399",
                    value: formatNumber(success.reduce((sum, value) => sum + value, 0)),
                  },
                  {
                    label: "Failed",
                    color: "#fb7185",
                    value: formatNumber(failed.reduce((sum, value) => sum + value, 0)),
                  },
                ]}
              />
            </div>
          </div>
        )}
      </div>
    </ChartCard>
  );
}

function PointsActivityChart({
  data,
  loading,
}: {
  data: AdminDashboardPointsTrendDay[];
  loading: boolean;
}) {
  const width = 680;
  const height = 220;
  const labels = useMemo(
    () =>
      data.map((item, index) => ({
        date: item.date,
        show: index === 0 || index === data.length - 1 || index % 7 === 0,
      })),
    [data],
  );
  const maxValue = Math.max(
    1,
    ...data.flatMap((item) => [item.topup, item.spent, item.refunded]),
  );
  const barGroupWidth = width / Math.max(data.length, 1);
  const barWidth = Math.max(4, Math.min(12, barGroupWidth / 4));
  const totals = data.reduce(
    (acc, item) => ({
      topup: acc.topup + item.topup,
      spent: acc.spent + item.spent,
      refunded: acc.refunded + item.refunded,
    }),
    { topup: 0, spent: 0, refunded: 0 },
  );
  const busiestDay = data.reduce<AdminDashboardPointsTrendDay | null>(
    (peak, item) =>
      !peak || item.topup + item.spent + item.refunded > peak.topup + peak.spent + peak.refunded ? item : peak,
    null,
  );

  return (
    <ChartCard
      title="Points Activity"
      description="Topups, spending, and refunds split by day for the same 30-day window."
    >
      <div className="mt-6 flex flex-1 flex-col">
        {loading ? (
          <div className="min-h-[420px] flex-1 animate-pulse rounded-[20px] bg-slate-100 dark:bg-slate-800" />
        ) : (
          <div className="flex min-h-[420px] flex-1 flex-col overflow-hidden rounded-[20px] border border-slate-200/80 bg-gradient-to-br from-cyan-50 via-white to-sky-100 p-4 dark:border-cyan-500/10 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 sm:p-5">
            <div className="min-h-[320px] w-full flex-1">
              <svg
                viewBox={`0 0 ${width} ${height + 32}`}
                className="h-full w-full"
                role="img"
                aria-label="Admin points activity chart"
              >
                {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                  const y = height - height * ratio;
                  return (
                    <g key={ratio}>
                      <line
                        x1="0"
                        x2={width}
                        y1={y}
                        y2={y}
                        stroke="rgba(15,23,42,0.12)"
                        strokeDasharray="5 8"
                        className="dark:stroke-white/10"
                      />
                      <text
                        x="0"
                        y={Math.max(y - 6, 12)}
                        fill="rgba(15,23,42,0.50)"
                        fontSize="12"
                        className="dark:fill-white/55"
                      >
                        {formatNumber(Math.round(maxValue * ratio))}
                      </text>
                    </g>
                  );
                })}

                {data.map((item, index) => {
                  const groupX = index * barGroupWidth + barGroupWidth / 2;
                  const topupHeight =
                    maxValue === 0 ? 0 : (item.topup / maxValue) * height;
                  const spentHeight =
                    maxValue === 0 ? 0 : (item.spent / maxValue) * height;
                  const refundedHeight =
                    maxValue === 0 ? 0 : (item.refunded / maxValue) * height;

                  return (
                    <g key={item.date}>
                      <rect
                        x={groupX - barWidth * 1.5}
                        y={height - topupHeight}
                        width={barWidth}
                        height={topupHeight}
                        rx="4"
                        fill="#0ea5e9"
                      />
                      <rect
                        x={groupX - barWidth / 2}
                        y={height - spentHeight}
                        width={barWidth}
                        height={spentHeight}
                        rx="4"
                        fill="#f59e0b"
                      />
                      <rect
                        x={groupX + barWidth / 2}
                        y={height - refundedHeight}
                        width={barWidth}
                        height={refundedHeight}
                        rx="4"
                        fill="#10b981"
                      />

                      {labels[index]?.show ? (
                        <text
                          x={groupX}
                          y={height + 22}
                          textAnchor="middle"
                          fill="rgba(15,23,42,0.54)"
                          fontSize="12"
                          className="dark:fill-white/58"
                        >
                          {formatDayLabel(item.date)}
                        </text>
                      ) : null}
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="mt-4 space-y-4">
              <ChartLegend
                items={[
                  {
                    label: "Topup",
                    color: "#0ea5e9",
                    value: formatNumber(totals.topup),
                  },
                  {
                    label: "Spent",
                    color: "#f59e0b",
                    value: formatNumber(totals.spent),
                  },
                  {
                    label: "Refunded",
                    color: "#10b981",
                    value: formatNumber(totals.refunded),
                  },
                ]}
              />
            </div>
          </div>
        )}
      </div>
    </ChartCard>
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
  const requestTrend = useMemo(() => summary?.request_trend_30_days ?? [], [summary]);
  const pointsActivity = useMemo(() => summary?.points_activity_30_days ?? [], [summary]);
  const requestStatusSummary = useMemo(() => {
    const totals = requestTrend.reduce(
      (acc, item) => ({
        total: acc.total + item.total,
        success: acc.success + item.success,
        failed: acc.failed + item.failed,
        processing: acc.processing + item.processing,
      }),
      { total: 0, success: 0, failed: 0, processing: 0 },
    );

    if (!totals.total) {
      return [
        { label: "Success Rate", value: 0, helper: "No request data yet", color: "#10b981" },
        { label: "Failed Share", value: 0, helper: "No failed requests yet", color: "#f43f5e" },
        { label: "Processing Share", value: 0, helper: "No queued requests yet", color: "#f59e0b" },
      ];
    }

    return [
      {
        label: "Success Rate",
        value: (totals.success / totals.total) * 100,
        helper: `${formatNumber(totals.success)} of ${formatNumber(totals.total)} requests succeeded`,
        color: "#10b981",
      },
      {
        label: "Failed Share",
        value: (totals.failed / totals.total) * 100,
        helper: `${formatNumber(totals.failed)} requests failed in this window`,
        color: "#f43f5e",
      },
      {
        label: "Processing Share",
        value: (totals.processing / totals.total) * 100,
        helper: `${formatNumber(totals.processing)} requests still processing`,
        color: "#f59e0b",
      },
    ];
  }, [requestTrend]);

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

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <RequestTrendChart data={requestTrend} loading={loading} />
          <PointsActivityChart data={pointsActivity} loading={loading} />
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
              <h3 className="mb-4 text-base font-bold">System Status</h3>
              <div className="space-y-4">
                {loading
                  ? Array.from({ length: 3 }).map((_, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 rounded-[18px] border border-slate-200/70 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-900/70"
                      >
                        <div className="h-16 w-16 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-28 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                          <div className="h-3 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                        </div>
                      </div>
                    ))
                  : requestStatusSummary.map((item) => (
                      <DonutStat
                        key={item.label}
                        label={item.label}
                        value={item.value}
                        helper={item.helper}
                        color={item.color}
                      />
                    ))}
              </div>
              {!loading && systemStatus.length > 0 ? (
                <div className="mt-4 space-y-2 border-t border-slate-200/70 pt-4 text-sm dark:border-slate-800">
                  {systemStatus.map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-slate-500">{item.label}</span>
                      <span className={`font-semibold ${getToneClass(item.tone)}`}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
