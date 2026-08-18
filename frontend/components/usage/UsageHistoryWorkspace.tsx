"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PointsTrendChart, RequestTrendChart } from "@/components/usage/UsageCharts";
import {
  RANGE_PRESETS,
  fetchUsageHistory,
  formatDuration,
  formatNumber,
  formatTimestamp,
  type UsageHistoryResponse,
} from "@/lib/usageHistory";

const CARD =
  "relative overflow-hidden rounded-[13px] border border-border bg-white/30 backdrop-blur-2xl [box-shadow:4px_4px_0px_0px_var(--border)] dark:bg-white/[0.03]";

// Opacity modifiers don't compile on the var()-based theme colors, so primary
// tints go through color-mix instead of `bg-primary/10`.
const PRIMARY_TINT = "bg-[color-mix(in_srgb,var(--primary)_12%,transparent)]";
const ACCENT_RAIL =
  "absolute inset-y-4 left-4 w-[1.5px] bg-[linear-gradient(to_bottom,transparent,color-mix(in_srgb,var(--primary)_50%,transparent),transparent)]";

const PAGE_SIZE = 10;

function StatTile({
  label,
  value,
  caption,
  icon,
}: {
  label: string;
  value: string;
  caption: string;
  icon: string;
}) {
  return (
    <div className={`${CARD} p-6`}>
      <div className={ACCENT_RAIL} />
      <div className="relative">
        <div className={`mb-4 inline-flex rounded-xl p-2 text-primary ${PRIMARY_TINT}`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
          {label}
        </p>
        <p className="mt-2 text-xl font-black tracking-tight tabular-nums text-slate-900 dark:text-white">
          {value}
        </p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{caption}</p>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const tone =
    status === "success"
      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      : status === "failed"
        ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
        : "bg-amber-500/10 text-amber-600 dark:text-amber-400";
  const icon =
    status === "success" ? "check_circle" : status === "failed" ? "error" : "pending";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${tone}`}
    >
      <span className="material-symbols-outlined text-[14px]">{icon}</span>
      {status}
    </span>
  );
}

export default function UsageHistoryWorkspace({ area }: { area: "admin" | "user" }) {
  const [data, setData] = useState<UsageHistoryResponse | null>(null);
  const [days, setDays] = useState<number>(30);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stale, setStale] = useState(false);
  const [error, setError] = useState("");
  const firstLoad = useRef(true);

  const load = useCallback(async (nextDays: number, nextPage: number) => {
    if (firstLoad.current) {
      setLoading(true);
    } else {
      setStale(true);
    }
    setError("");
    try {
      const result = await fetchUsageHistory(
        nextDays,
        PAGE_SIZE,
        nextPage * PAGE_SIZE,
      );
      setData(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load usage history");
    } finally {
      firstLoad.current = false;
      setLoading(false);
      setStale(false);
    }
  }, []);

  useEffect(() => {
    void load(days, page);
  }, [load, days, page]);

  const summary = data?.summary;
  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;
  const maxEndpointTotal = Math.max(1, ...(data?.endpoints ?? []).map((e) => e.total));

  return (
    <div className="mx-auto max-w-8xl space-y-6 p-4 sm:space-y-8 sm:p-6 lg:p-8">
      <section className="app-hero-card relative overflow-hidden rounded-[13px] border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-primary p-8 text-white shadow-xl dark:border-slate-800">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-12 left-0 h-32 w-32 rounded-full bg-white/5 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur">
              <span className="material-symbols-outlined text-sm">query_stats</span>
              Usage History
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-white md:text-4xl">
              Your API &amp; Points Usage
            </h1>
        
          </div>

          {summary ? (
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white backdrop-blur">
              Balance: {formatNumber(summary.points_balance)} pts
            </div>
          ) : null}
        </div>
      </section>

      {error ? (
        <div className="flex items-start gap-2 rounded-2xl border border-rose-200/70 bg-rose-50/80 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300">
          <span className="material-symbols-outlined text-base">error</span>
          <span>{error}</span>
        </div>
      ) : null}

      {/* All-time totals — deliberately above the range filter, since the filter
          below scopes only the trend section. */}
      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          icon="api"
          label="Total Requests"
          value={loading ? "—" : formatNumber(summary?.total_requests ?? 0)}
          caption="All time"
        />
        <StatTile
          icon="verified"
          label="Success Rate"
          value={loading ? "—" : `${summary?.success_rate ?? 0}%`}
          caption={
            loading
              ? "All time"
              : `${formatNumber(summary?.failed_requests ?? 0)} failed all time`
          }
        />
        <StatTile
          icon="toll"
          label="Points Spent"
          value={loading ? "—" : formatNumber(summary?.points_spent ?? 0)}
          caption={
            loading
              ? "All time"
              : `${formatNumber(summary?.points_topped_up ?? 0)} topped up`
          }
        />
        <StatTile
          icon="timer"
          label="Avg Duration"
          value={loading ? "—" : formatDuration(summary?.avg_duration_ms ?? null)}
          caption="Last 100 successful runs"
        />
      </section>

      {/* One filter row, above everything it scopes. */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
          Range
        </span>
        <div className="flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800/60">
          {RANGE_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setDays(preset)}
              aria-pressed={days === preset}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                days === preset
                  ? "bg-white text-primary shadow-sm dark:bg-slate-900"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              Last {preset} days
            </button>
          ))}
        </div>
        {summary?.last_used_at ? (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Last request {formatTimestamp(summary.last_used_at)}
          </span>
        ) : null}
      </div>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <RequestTrendChart
          data={data?.request_trend ?? []}
          loading={loading}
          stale={stale}
          days={days}
        />
        <PointsTrendChart
          data={data?.points_trend ?? []}
          loading={loading}
          stale={stale}
          days={days}
        />
      </section>

      {/* Per-endpoint breakdown. The bar is the chart; the numbers beside it are
          the table view, which is also the relief for the sub-3:1 series colors. */}
      <section className={CARD}>
        <div className={ACCENT_RAIL} />
        <div className="relative overflow-hidden rounded-[18px]">
          <div className="flex flex-wrap items-end justify-between gap-2 border-b border-slate-100 px-5 py-4 dark:border-slate-800 sm:px-6 sm:py-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Usage by Endpoint
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                All-time totals per API endpoint you have called
                {data && data.endpoints.length > 0
                  ? ` · ${data.endpoints.length} used`
                  : ""}
                .
              </p>
            </div>
            {/* Key for the compact number columns on each row. */}
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Requests · Success · Points
            </p>
          </div>

          <div className="p-5 sm:p-6">
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-14 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800/70"
                  />
                ))}
              </div>
            ) : (data?.endpoints.length ?? 0) === 0 ? (
              <div className="py-12 text-center">
                <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600">
                  api
                </span>
                <p className="mt-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
                  No endpoint usage yet
                </p>
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                  Run a conversion and it will show up here.
                </p>
              </div>
            ) : (
              // 8 rows × 56px + 7 × 8px gaps = 504px; the extra ~24px lets a
              // ninth row peek, which signals the list scrolls rather than ends.
              <div className="max-h-[33rem] space-y-2 overflow-y-auto pr-1">
                {data!.endpoints.map((endpoint) => (
                  <div
                    key={endpoint.action}
                    className="rounded-xl border border-slate-200/70 bg-white/70 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-900/60"
                    title={`${formatNumber(endpoint.success)} succeeded · ${formatNumber(
                      endpoint.failed,
                    )} failed · last used ${formatTimestamp(endpoint.last_used_at)}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                          {endpoint.label}
                        </p>
                        {!endpoint.allowed ? (
                          <span
                            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-slate-200 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                            title="Access to this endpoint has since been revoked — past usage is kept for your records."
                          >
                            <span className="material-symbols-outlined text-[11px]">
                              lock
                            </span>
                            Revoked
                          </span>
                        ) : null}
                      </div>

                      <div className="flex shrink-0 items-baseline gap-3 text-xs tabular-nums text-slate-500 dark:text-slate-400">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {formatNumber(endpoint.total)}
                          <span className="ml-1 font-normal text-slate-500 dark:text-slate-400">
                            reqs
                          </span>
                        </span>
                        <span>{endpoint.success_rate}%</span>
                        <span>{formatNumber(endpoint.points_spent)} pts</span>
                      </div>
                    </div>

                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{
                          width: `${Math.max(2, (endpoint.total / maxEndpointTotal) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className={CARD}>
        <div className={ACCENT_RAIL} />
        <div className="relative overflow-hidden rounded-[18px]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800 sm:px-6 sm:py-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Request History
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {data ? `${formatNumber(data.total)} total requests` : "Loading..."}
              </p>
            </div>

            {data && data.total > PAGE_SIZE ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0 || stale}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  aria-label="Previous page"
                >
                  <span className="material-symbols-outlined text-lg">chevron_left</span>
                </button>
                <span className="text-xs font-semibold tabular-nums text-slate-600 dark:text-slate-300">
                  {page + 1} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1 || stale}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  aria-label="Next page"
                >
                  <span className="material-symbols-outlined text-lg">chevron_right</span>
                </button>
              </div>
            ) : null}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                  <th className="px-5 py-3 sm:px-6">Endpoint</th>
                  <th className="px-5 py-3">File</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Points</th>
                  <th className="px-5 py-3">Duration</th>
                  <th className="px-5 py-3">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index}>
                      {Array.from({ length: 6 }).map((__, cell) => (
                        <td key={cell} className="px-5 py-3">
                          <div className="h-4 animate-pulse rounded bg-slate-100 dark:bg-slate-800/70" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (data?.items.length ?? 0) === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-10 text-center text-sm text-slate-500 dark:text-slate-400"
                    >
                      No requests recorded yet.
                    </td>
                  </tr>
                ) : (
                  data!.items.map((item) => (
                    <tr
                      key={item.id}
                      className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    >
                      <td className="px-5 py-3 font-medium text-slate-900 dark:text-white sm:px-6">
                        {item.label}
                      </td>
                      <td className="max-w-[220px] truncate px-5 py-3 text-slate-600 dark:text-slate-300">
                        {item.input_filename}
                      </td>
                      <td className="px-5 py-3">
                        <StatusPill status={item.status} />
                      </td>
                      <td className="px-5 py-3 tabular-nums text-slate-600 dark:text-slate-300">
                        {item.points_charged}
                      </td>
                      <td className="px-5 py-3 tabular-nums text-slate-600 dark:text-slate-300">
                        {formatDuration(item.duration_ms)}
                      </td>
                      <td className="px-5 py-3 text-slate-500 dark:text-slate-400">
                        {formatTimestamp(item.created_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <p className="text-center text-xs text-slate-400 dark:text-slate-500">
        {area === "admin"
          ? "Showing your own admin account usage. Platform-wide activity lives on the dashboard."
          : "Showing your own account usage."}
      </p>
    </div>
  );
}
