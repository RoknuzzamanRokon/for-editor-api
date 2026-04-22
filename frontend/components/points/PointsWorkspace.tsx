"use client";

import { useEffect, useMemo, useState } from "react";
import { API_BASE } from "@/lib/apiBase";

const ACTIVITY_CHART_WIDTH = 1920;
const ACTIVITY_CHART_HEIGHT = 240;
const ACTIVITY_CHART_PADDING = { top: 16, right: 18, bottom: 34, left: 18 };

type PointHistoryEntry = {
  id: number;
  action: string;
  amount: number;
  status: string;
  request_id: string;
  created_at: string;
};

type MyPointResponse = {
  user_id: number;
  available_points: number;
  point_status: string;
  expires_at: string | null;
  expiry_status: string;
  history: PointHistoryEntry[];
  total: number;
  limit: number;
  offset: number;
};

type PointActivitySummaryDay = {
  date: string;
  topup: number;
  refunded: number;
  spent: number;
  net: number;
};

type PointActivitySummaryResponse = {
  days: number;
  items: PointActivitySummaryDay[];
};

type ActivityBar = {
  date: string;
  label: string;
  spent: number;
};

function formatDate(value?: string | null) {
  if (!value) return "Not configured";
  return new Date(value).toLocaleString();
}

function formatCompactDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

function getStatusBadge(status: string) {
  const value = status.toLowerCase();

  if (value === "success" || value === "active" || value === "valid" || value === "topup") {
    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300";
  }

  if (value === "pending") {
    return "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300";
  }

  if (value === "failed" || value === "inactive" || value === "expired") {
    return "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300";
  }

  if (value === "spent") {
    return "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300";
  }

  if (value === "refunded") {
    return "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300";
  }

  return "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300";
}

function MetricCard({
  label,
  value,
  icon,
  caption,
}: {
  label: string;
  value: string | number;
  icon: string;
  caption: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/40 bg-white/55 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-white/30 to-transparent dark:from-primary/10 dark:via-white/5 dark:to-transparent" />
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative">
        <div className="mb-4 inline-flex rounded-2xl border border-white/40 bg-white/65 p-3 text-primary shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/10">
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
          {label}
        </p>
        <p className="mt-1 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          {value}
        </p>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{caption}</p>
      </div>
    </div>
  );
}

export default function PointsWorkspace() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isMobileChart, setIsMobileChart] = useState(false);
  const [points, setPoints] = useState<MyPointResponse | null>(null);
  const [activitySummary, setActivitySummary] = useState<PointActivitySummaryResponse | null>(null);

  useEffect(() => {
    const auth = localStorage.getItem("access_token") ?? "";
    if (!auth) {
      setError("No access token found");
      setLoading(false);
      return;
    }

    Promise.all([
      fetch(`${API_BASE}/api/v3/points/my-point`, {
        method: "GET",
        headers: { Authorization: `Bearer ${auth}` },
      }),
      fetch(`${API_BASE}/api/v3/points/activity-summary?days=30`, {
        method: "GET",
        headers: { Authorization: `Bearer ${auth}` },
      }),
    ])
      .then(async ([pointsRes, summaryRes]) => {
        const pointsBody = await pointsRes.text();
        if (!pointsRes.ok) {
          throw new Error(pointsBody || "Failed to load points data");
        }
        setPoints(JSON.parse(pointsBody) as MyPointResponse);

        const summaryBody = await summaryRes.text();
        if (!summaryRes.ok) {
          throw new Error(summaryBody || "Failed to load point activity summary");
        }
        setActivitySummary(JSON.parse(summaryBody) as PointActivitySummaryResponse);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load points data");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const syncViewport = () => setIsMobileChart(mediaQuery.matches);

    syncViewport();
    mediaQuery.addEventListener("change", syncViewport);

    return () => {
      mediaQuery.removeEventListener("change", syncViewport);
    };
  }, []);

  const visibleSummaryItems = useMemo(() => {
    if (!activitySummary) return [];
    return isMobileChart ? activitySummary.items.slice(-7) : activitySummary.items;
  }, [activitySummary, isMobileChart]);

  const activityChart = useMemo<ActivityBar[]>(() => {
    return visibleSummaryItems.map((item) => ({
      date: item.date,
      label: formatCompactDate(item.date),
      spent: item.spent,
    }));
  }, [visibleSummaryItems]);

  const activityLabelIndexes = useMemo(() => {
    if (activityChart.length === 0) return new Set<number>();
    return new Set(activityChart.map((_, index) => index));
  }, [activityChart]);

  const summaryTotals = useMemo(() => {
    return (activitySummary?.items ?? []).reduce(
      (acc, item) => {
        acc.topup += item.topup;
        acc.spent += item.spent;
        acc.refunded += item.refunded;
        return acc;
      },
      { topup: 0, spent: 0, refunded: 0 },
    );
  }, [activitySummary]);

  const lastActivityAt = useMemo(() => points?.history[0]?.created_at ?? null, [points]);
  const chartDays = isMobileChart ? 7 : 30;

  if (loading) {
    return (
      <div className="mx-auto max-w-8xl p-4 sm:p-6 lg:p-8">
        <div className="space-y-6">
          <div className="app-hero-card rounded-[13px] border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-primary p-6 shadow-xl dark:border-slate-800">
            <div className="h-5 w-36 animate-pulse rounded bg-white/20" />
            <div className="mt-4 h-10 w-72 max-w-full animate-pulse rounded bg-white/20" />
            <div className="mt-3 h-4 w-full max-w-2xl animate-pulse rounded bg-white/15" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="rounded-[28px] border border-white/40 bg-white/55 p-5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                <div className="h-12 w-12 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
                <div className="mt-4 h-4 w-28 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                <div className="mt-3 h-8 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              </div>
            ))}
          </div>
          <div className="grid gap-6 xl:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="rounded-[13px] border border-white/40 bg-white/55 p-6 backdrop-blur-2xl dark:border-white/10 dark:bg-white/5">
                <div className="h-5 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                <div className="mt-3 h-4 w-52 animate-pulse rounded bg-slate-100 dark:bg-slate-800/70" />
                <div className="mt-6 h-56 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800/70" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !points || !activitySummary) {
    return (
      <div className="mx-auto max-w-8xl p-4 sm:p-6 lg:p-8">
        <div className="rounded-[13px] border border-rose-200/70 bg-rose-50/80 p-6 text-sm text-rose-700 backdrop-blur-2xl dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300">
          {error || "Points data not available"}
        </div>
      </div>
    );
  }

  const maxSpentAmount = Math.max(...activityChart.map((item) => item.spent), 1);
  const activityUsableWidth =
    ACTIVITY_CHART_WIDTH - ACTIVITY_CHART_PADDING.left - ACTIVITY_CHART_PADDING.right;
  const activityUsableHeight =
    ACTIVITY_CHART_HEIGHT - ACTIVITY_CHART_PADDING.top - ACTIVITY_CHART_PADDING.bottom;
  const activityBars = activityChart.map((item, index) => {
    const totalBars = Math.max(activityChart.length, 1);
    const slotWidth = activityUsableWidth / totalBars;
    const barWidth = Math.max(Math.min(slotWidth * 0.8, 26), 10);
    const x = ACTIVITY_CHART_PADDING.left + slotWidth * index + (slotWidth - barWidth) / 2;
    const height =
      item.spent > 0 ? Math.max((item.spent / maxSpentAmount) * activityUsableHeight, 6) : 0;
    const y = ACTIVITY_CHART_HEIGHT - ACTIVITY_CHART_PADDING.bottom - height;

    return {
      ...item,
      x,
      y,
      width: barWidth,
      height,
    };
  });
  const activityTicks = Array.from({ length: 4 }, (_, index) => {
    const value = Math.round((maxSpentAmount * (3 - index)) / 3);
    const y =
      ACTIVITY_CHART_PADDING.top + (activityUsableHeight * index) / 3;

    return { value, y };
  });

  const statusBreakdown = [
    {
      key: "topup",
      label: "Topup",
      value: summaryTotals.topup,
      color: "#10b981",
      trackColor: "rgba(16, 185, 129, 0.16)",
    },
    {
      key: "spent",
      label: "Spent",
      value: summaryTotals.spent,
      color: "#3b82f6",
      trackColor: "rgba(59, 130, 246, 0.16)",
    },
    {
      key: "refunded",
      label: "Refunded",
      value: summaryTotals.refunded,
      color: "#8b5cf6",
      trackColor: "rgba(139, 92, 246, 0.16)",
    },
  ];
  const maxBreakdownValue = Math.max(...statusBreakdown.map((item) => item.value), 1);

  return (
    <div className="mx-auto max-w-8xl space-y-6 p-4 sm:space-y-8 sm:p-6 lg:p-8">
      <section className="app-hero-card relative overflow-hidden rounded-[13px] border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-primary p-5 text-white shadow-xl sm:p-8 dark:border-slate-800">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-12 left-0 h-32 w-32 rounded-full bg-primary-foreground/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur">
              <span className="material-symbols-outlined text-sm">toll</span>
              Points Center
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl">
              All point activity, balance, and usage signals
            </h1>
            <p className="mt-3 max-w-3xl text-sm text-white/80 md:text-base">
              Monitor your current balance, track every point movement, and understand how topups,
              spending, and refunds changed over time.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-xs uppercase tracking-wider text-white/70">Balance</p>
              <p className="mt-1 text-sm font-bold">{points.available_points}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-xs uppercase tracking-wider text-white/70">Status</p>
              <p className="mt-1 text-sm font-bold">{points.point_status}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-xs uppercase tracking-wider text-white/70">Entries</p>
              <p className="mt-1 text-sm font-bold">{points.total}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-xs uppercase tracking-wider text-white/70">Last Activity</p>
              <p className="mt-1 text-sm font-bold">{lastActivityAt ? formatCompactDate(lastActivityAt) : "-"}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Available Points"
          value={points.available_points}
          icon="account_balance_wallet"
          caption="Current balance ready for conversions and account activity."
        />
        <MetricCard
          label="Ledger Entries"
          value={points.total}
          icon="receipt_long"
          caption="All recorded point movements linked to this account."
        />
        <MetricCard
          label="Point Status"
          value={points.point_status}
          icon="verified_user"
          caption="Current availability state from the points ledger."
        />
        <MetricCard
          label="Expiry Status"
          value={points.expiry_status.replace(/_/g, " ")}
          icon="schedule"
          caption="No expiry configuration is currently attached to this wallet."
        />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_1fr]">
        <section className="relative overflow-hidden rounded-[13px] border border-white/40 bg-white/55 shadow-[0_20px_50px_rgba(15,23,42,0.10)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-white/30 to-transparent dark:from-primary/10 dark:via-white/5 dark:to-transparent" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/20" />
          <div className="relative border-b border-white/30 px-6 py-5 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="inline-flex rounded-2xl border border-white/40 bg-white/60 p-3 text-primary shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/10">
                <span className="material-symbols-outlined">bar_chart</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Point Activity</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {`Spent points over the last ${chartDays} days`}
                </p>
              </div>
            </div>
          </div>
          <div className="relative p-6">
            <div className="overflow-x-auto">
              <div className="w-full">
                <svg
                  viewBox={`0 0 ${ACTIVITY_CHART_WIDTH} ${ACTIVITY_CHART_HEIGHT}`}
                  className="h-72 min-w-[640px] w-full"
                  role="img"
                  aria-label={`Point activity ${chartDays} day usage chart`}
                  preserveAspectRatio="none"
                >
                  {activityTicks.map((tick) => (
                    <g key={`${tick.value}-${tick.y}`}>
                      <line
                        x1={ACTIVITY_CHART_PADDING.left}
                        y1={tick.y}
                        x2={ACTIVITY_CHART_WIDTH - ACTIVITY_CHART_PADDING.right}
                        y2={tick.y}
                        stroke="currentColor"
                        strokeOpacity="0.12"
                        strokeDasharray="4 6"
                      />
                      <text
                        x={ACTIVITY_CHART_PADDING.left}
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
                    x1={ACTIVITY_CHART_PADDING.left}
                    y1={ACTIVITY_CHART_HEIGHT - ACTIVITY_CHART_PADDING.bottom}
                    x2={ACTIVITY_CHART_WIDTH - ACTIVITY_CHART_PADDING.right}
                    y2={ACTIVITY_CHART_HEIGHT - ACTIVITY_CHART_PADDING.bottom}
                    stroke="currentColor"
                    strokeOpacity="0.18"
                  />

                  {activityBars.map((item, index) => (
                    <g key={item.date}>
                      <rect
                        x={item.x}
                        y={item.y}
                        width={item.width}
                        height={item.height}
                        rx="6"
                        fill="var(--primary)"
                      >
                        <title>{`${item.date}: ${item.spent}`}</title>
                      </rect>

                      {activityLabelIndexes.has(index) ? (
                        <>
                          <text
                            x={item.x + item.width / 2}
                            y={ACTIVITY_CHART_HEIGHT - 12}
                            textAnchor="middle"
                            fontSize="11"
                            fill="currentColor"
                            opacity="0.6"
                          >
                            {item.label}
                          </text>
                          <text
                            x={item.x + item.width / 2}
                            y={Math.max(item.y - 8, ACTIVITY_CHART_PADDING.top + 12)}
                            textAnchor="middle"
                            fontSize="11"
                            fill="currentColor"
                            opacity="0.75"
                          >
                            {item.spent}
                          </text>
                        </>
                      ) : null}
                    </g>
                  ))}

                  {activityBars.every((item) => item.spent === 0) ? (
                    <text
                      x={ACTIVITY_CHART_WIDTH / 2}
                      y={ACTIVITY_CHART_HEIGHT / 2}
                      textAnchor="middle"
                      fontSize="14"
                      fill="currentColor"
                      opacity="0.55"
                    >
                      {`No point usage in the last ${chartDays} days`}
                    </text>
                  ) : null}
                </svg>
              </div>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden rounded-[13px] border border-white/40 bg-white/55 shadow-[0_20px_50px_rgba(15,23,42,0.10)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-white/30 to-transparent dark:from-primary/10 dark:via-white/5 dark:to-transparent" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/20" />
          <div className="relative border-b border-white/30 px-6 py-5 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="inline-flex rounded-2xl border border-white/40 bg-white/60 p-3 text-primary shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/10">
                <span className="material-symbols-outlined">donut_small</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Status Breakdown</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Topup, spent, and refunded totals across the last 30 days
                </p>
              </div>
            </div>
          </div>
          <div className="relative space-y-4 p-6">
            {statusBreakdown.map((item) => {
              const width = maxBreakdownValue === 0 ? 0 : (item.value / maxBreakdownValue) * 100;
              return (
                <div key={item.key} className="rounded-2xl border border-white/35 bg-white/45 p-4 backdrop-blur dark:border-white/10 dark:bg-white/5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{item.label}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">30 day total</p>
                    </div>
                    <p className="text-lg font-black text-slate-900 dark:text-white">{item.value}</p>
                  </div>
                  <div
                    className="mt-3 h-3 overflow-hidden rounded-full"
                    style={{ backgroundColor: item.trackColor }}
                  >
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.max(width, item.value > 0 ? 12 : 0)}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </section>

      <section className="overflow-hidden rounded-[13px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-6 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Point Ledger History</h3>
            <p className="mt-1 text-sm text-slate-500">Total entries: {points.total}</p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <span className="material-symbols-outlined text-sm">schedule</span>
            Live ledger records
          </div>
        </div>

        <div className="max-h-[560px] overflow-y-auto overflow-x-auto">
          {points.history.length === 0 ? (
            <div className="p-8 text-sm text-slate-500">No point history found.</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-800/50">
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {points.history.map((entry) => (
                  <tr
                    key={entry.id}
                    className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{entry.action}</p>
                        <p className="mt-0.5 text-xs text-slate-500">Request ID: {entry.request_id}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold">{entry.amount}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusBadge(
                          entry.status,
                        )}`}
                      >
                        {entry.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {formatDate(entry.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
