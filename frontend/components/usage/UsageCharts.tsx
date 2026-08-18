"use client";

/**
 * Charts for the Usage History page.
 *
 * Colors are set as CSS custom properties on each chart root (Tailwind arbitrary
 * properties, with a `dark:` twin) and referenced from SVG as `var(--series-*)`,
 * so the light/dark steps swap in one place.
 *
 * The palette is NOT the one used by the admin dashboard charts: those pair
 * `#34d399` success against `#fb7185` failed, which measures ΔE 4.6 under deutan
 * simulation — a red/green-colorblind reader cannot tell success from failure.
 * These use validated categorical slots (blue/orange/aqua) which clear the CVD,
 * lightness and chroma gates on both the light `paper` surface and the dark theme
 * surfaces. Series identity is never carried by hue alone: every legend entry
 * pairs a swatch with an icon + label + value, stacked segments are ordered
 * consistently, and the endpoint table restates every number as text.
 */

import { useMemo, useState } from "react";
import { formatDayLabel, formatNumber } from "@/lib/usageHistory";
import type { PointsTrendDay, UsageTrendDay } from "@/lib/usageHistory";

const CHART_W = 680;
const CHART_H = 128;
const LABEL_H = 28;
// Left gutter for the y-axis scale. The dashboard charts draw their scale at
// x=0 on top of the first bars; reserving a gutter keeps both readable.
const PAD_L = 34;
const PLOT_W = CHART_W - PAD_L;

// Validated categorical slots 1–3 (light / dark steps).
const SERIES_VARS =
  "[--series-1:#2a78d6] [--series-2:#eb6834] [--series-3:#1baf7a] " +
  "dark:[--series-1:#3987e5] dark:[--series-2:#d95926] dark:[--series-3:#199e70]";

const CARD =
  "relative overflow-hidden rounded-[13px] border border-border bg-white/30 p-4 backdrop-blur-2xl [box-shadow:4px_4px_0px_0px_var(--border)] dark:bg-white/[0.03] sm:p-5";

// The dashboard's accent rail uses `from-primary/0 via-primary/50 to-primary/0`,
// which compiles to no CSS at all (opacity modifiers don't work on the
// var()-based theme colors) — color-mix renders the same intent for real.
const ACCENT_RAIL =
  "absolute inset-y-4 left-4 w-[1.5px] bg-[linear-gradient(to_bottom,transparent,color-mix(in_srgb,var(--primary)_50%,transparent),transparent)] sm:inset-y-4 sm:left-4";

const GRID_RATIOS = [0, 0.25, 0.5, 0.75, 1];

/** Rounds only the top two corners, so the bar's data-end reads as a cap while
 *  the baseline end stays anchored flat. */
function roundedTopBar(x: number, y: number, w: number, h: number, r: number) {
  if (h <= 0) return "";
  const radius = Math.min(r, w / 2, h);
  return [
    `M ${x} ${y + h}`,
    `L ${x} ${y + radius}`,
    `Q ${x} ${y} ${x + radius} ${y}`,
    `L ${x + w - radius} ${y}`,
    `Q ${x + w} ${y} ${x + w} ${y + radius}`,
    `L ${x + w} ${y + h}`,
    "Z",
  ].join(" ");
}

function showLabelAt(index: number, count: number) {
  return index === 0 || index === count - 1 || (index % 7 === 0 && index < count - 2);
}

/** Pins the first/last day labels inside the viewBox instead of centering them
 *  on their bar, where they'd be clipped at the edges. */
function labelAnchor(index: number, count: number) {
  if (index === 0) return "start" as const;
  if (index === count - 1) return "end" as const;
  return "middle" as const;
}

/** X positions for a day-indexed bar chart, inside the gutter. */
function bandGeometry(count: number) {
  const groupWidth = PLOT_W / Math.max(count, 1);
  return {
    groupWidth,
    barWidth: Math.max(3, Math.min(18, groupWidth * 0.62)),
    centerAt: (index: number) => PAD_L + index * groupWidth + groupWidth / 2,
    bandAt: (index: number) => PAD_L + index * groupWidth,
    /** Tooltip anchor as a percentage of the full viewBox width. */
    tooltipPct: (index: number) =>
      ((PAD_L + (index + 0.5) * groupWidth) / CHART_W) * 100,
  };
}

function ChartFrame({
  title,
  subtitle,
  badge,
  loading,
  stale,
  empty,
  emptyHint,
  legend,
  children,
}: {
  title: string;
  subtitle: string;
  badge?: React.ReactNode;
  loading: boolean;
  stale: boolean;
  empty: boolean;
  emptyHint: string;
  legend?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className={`${CARD} ${SERIES_VARS}`}>
      <div className={ACCENT_RAIL} />

      <div className="relative flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
            {title}
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
        {!loading && badge ? badge : null}
      </div>

      {loading ? (
        <div className="mt-4 h-[188px] w-full animate-pulse rounded-[12px] bg-slate-100 dark:bg-slate-800" />
      ) : empty ? (
        <div className="mt-4 flex min-h-[188px] items-center justify-center rounded-[18px] border border-dashed border-slate-200 bg-slate-50/70 px-4 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
          {emptyHint}
        </div>
      ) : (
        // Refetch keeps the frame: the previous render stays put at reduced
        // opacity rather than collapsing back to a skeleton.
        <div className={stale ? "opacity-50 transition-opacity" : "transition-opacity"}>
          {legend}
          {children}
        </div>
      )}
    </div>
  );
}

function LegendItem({
  swatch,
  icon,
  label,
  value,
  active,
  onToggle,
}: {
  swatch: string;
  icon: string;
  label: string;
  value: string;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      className={`flex items-center gap-2 rounded-[10px] border px-2.5 py-2 text-left transition ${
        active
          ? "border-slate-200/70 bg-white/50 dark:border-white/10 dark:bg-white/[0.04]"
          : "border-transparent opacity-40"
      }`}
    >
      <span
        className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
        style={{ backgroundColor: swatch }}
      />
      <span className="min-w-0">
        <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          <span className="material-symbols-outlined text-[13px]">{icon}</span>
          {label}
        </span>
        <span className="block text-sm font-bold tabular-nums text-slate-900 dark:text-white">
          {value}
        </span>
      </span>
    </button>
  );
}

function Tooltip({
  x,
  rows,
  heading,
}: {
  x: number;
  heading: string;
  rows: { color: string; label: string; value: string }[];
}) {
  // Flip the anchor past the midpoint so the panel never runs off the card.
  const flip = x > 60;
  return (
    <div
      className="pointer-events-none absolute top-0 z-10 w-max min-w-[132px] rounded-lg border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-900"
      style={{
        left: `${x}%`,
        transform: flip ? "translateX(-100%) translateX(-8px)" : "translateX(8px)",
      }}
    >
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {heading}
      </p>
      {rows.map((row) => (
        <p key={row.label} className="flex items-center gap-2 text-xs leading-5">
          <span
            className="h-0.5 w-3 shrink-0 rounded-full"
            style={{ backgroundColor: row.color }}
          />
          <span className="font-bold tabular-nums text-slate-900 dark:text-white">
            {row.value}
          </span>
          <span className="text-slate-500 dark:text-slate-400">{row.label}</span>
        </p>
      ))}
    </div>
  );
}

function GridLines({ maxValue }: { maxValue: number }) {
  return (
    <>
      {GRID_RATIOS.map((ratio) => {
        const y = CHART_H - CHART_H * ratio;
        return (
          <g key={ratio}>
            <line
              x1={PAD_L}
              x2={CHART_W}
              y1={y}
              y2={y}
              stroke="rgba(15,23,42,0.1)"
              strokeDasharray="4 6"
              className="dark:stroke-white/10"
            />
            <text
              x={PAD_L - 6}
              // Clamped so the top tick's ascender stays inside the viewBox.
              y={Math.max(y + 3, 9)}
              textAnchor="end"
              fill="rgba(15,23,42,0.5)"
              fontSize="10"
              className="dark:fill-white/50"
            >
              {formatNumber(Math.round(maxValue * ratio))}
            </text>
          </g>
        );
      })}
    </>
  );
}

/** API requests per day — success and failed stacked, so bar height is the daily
 *  total without plotting the total as a redundant third series. */
export function RequestTrendChart({
  data,
  loading,
  stale,
  days,
}: {
  data: UsageTrendDay[];
  loading: boolean;
  stale: boolean;
  days: number;
}) {
  const [visible, setVisible] = useState({ success: true, failed: true });
  const [hover, setHover] = useState<number | null>(null);

  const totals = useMemo(
    () =>
      data.reduce(
        (acc, day) => ({
          success: acc.success + day.success,
          failed: acc.failed + day.failed,
          total: acc.total + day.total,
        }),
        { success: 0, failed: 0, total: 0 },
      ),
    [data],
  );

  const maxValue = Math.max(
    1,
    ...data.map(
      (day) => (visible.success ? day.success : 0) + (visible.failed ? day.failed : 0),
    ),
  );
  const band = bandGeometry(data.length);

  const toggle = (key: "success" | "failed") =>
    setVisible((current) => {
      const next = { ...current, [key]: !current[key] };
      return !next.success && !next.failed ? current : next;
    });

  const hovered = hover != null ? data[hover] : null;

  return (
    <ChartFrame
      title="API Requests"
      subtitle={`Last ${days} days`}
      loading={loading}
      stale={stale}
      empty={totals.total === 0}
      emptyHint="No API requests in this range yet."
      badge={
        <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/60 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
          <span className="material-symbols-outlined text-[13px]">functions</span>
          {formatNumber(totals.total)} total
        </span>
      }
      legend={
        <div className="mt-3 grid grid-cols-2 gap-2">
          <LegendItem
            swatch="var(--series-1)"
            icon="check_circle"
            label="Success"
            value={formatNumber(totals.success)}
            active={visible.success}
            onToggle={() => toggle("success")}
          />
          <LegendItem
            swatch="var(--series-2)"
            icon="error"
            label="Failed"
            value={formatNumber(totals.failed)}
            active={visible.failed}
            onToggle={() => toggle("failed")}
          />
        </div>
      }
    >
      <div
        className="relative mt-3 w-full"
        style={{ aspectRatio: `${CHART_W} / ${CHART_H + LABEL_H}` }}
      >
        {hovered ? (
          <Tooltip
            x={band.tooltipPct(hover!)}
            heading={formatDayLabel(hovered.date)}
            rows={[
              ...(visible.success
                ? [
                    {
                      color: "var(--series-1)",
                      label: "Success",
                      value: formatNumber(hovered.success),
                    },
                  ]
                : []),
              ...(visible.failed
                ? [
                    {
                      color: "var(--series-2)",
                      label: "Failed",
                      value: formatNumber(hovered.failed),
                    },
                  ]
                : []),
            ]}
          />
        ) : null}

        <svg
          viewBox={`0 0 ${CHART_W} ${CHART_H + LABEL_H}`}
          className="h-full w-full"
          role="img"
          aria-label={`Daily API requests for the last ${days} days`}
          onMouseLeave={() => setHover(null)}
        >
          <GridLines maxValue={maxValue} />

          {data.map((day, index) => {
            const centerX = band.centerAt(index);
            const x = centerX - band.barWidth / 2;
            const successH = visible.success ? (day.success / maxValue) * CHART_H : 0;
            const failedH = visible.failed ? (day.failed / maxValue) * CHART_H : 0;
            // 2px surface gap so adjacent stacked fills never touch.
            const gap = successH > 0 && failedH > 0 ? 2 : 0;
            const failedY = CHART_H - failedH - successH - gap;
            const successY = CHART_H - successH;
            const isHovered = hover === index;

            return (
              <g key={day.date}>
                {successH > 0 ? (
                  <path
                    d={
                      failedH > 0
                        ? `M ${x} ${successY} h ${band.barWidth} v ${successH} h ${-band.barWidth} Z`
                        : roundedTopBar(x, successY, band.barWidth, successH, 4)
                    }
                    fill="var(--series-1)"
                    opacity={isHovered ? 1 : 0.92}
                  />
                ) : null}
                {failedH > 0 ? (
                  <path
                    d={roundedTopBar(x, failedY, band.barWidth, failedH, 4)}
                    fill="var(--series-2)"
                    opacity={isHovered ? 1 : 0.92}
                  />
                ) : null}

                {/* Hit target spans the full column — bigger than the mark. */}
                <rect
                  x={band.bandAt(index)}
                  y={0}
                  width={band.groupWidth}
                  height={CHART_H}
                  fill="transparent"
                  onMouseEnter={() => setHover(index)}
                />

                {showLabelAt(index, data.length) ? (
                  <text
                    x={centerX}
                    y={CHART_H + 20}
                    textAnchor={labelAnchor(index, data.length)}
                    fill="rgba(15,23,42,0.5)"
                    fontSize="10"
                    className="dark:fill-white/50"
                  >
                    {formatDayLabel(day.date)}
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>
      </div>
    </ChartFrame>
  );
}

/** Points in vs out per day, diverging from a zero baseline — credits rise,
 *  spend falls, so direction carries the sign and hue only names the type. */
export function PointsTrendChart({
  data,
  loading,
  stale,
  days,
}: {
  data: PointsTrendDay[];
  loading: boolean;
  stale: boolean;
  days: number;
}) {
  const [visible, setVisible] = useState({ topup: true, spent: true, refunded: true });
  const [hover, setHover] = useState<number | null>(null);

  const totals = useMemo(
    () =>
      data.reduce(
        (acc, day) => ({
          topup: acc.topup + day.topup,
          spent: acc.spent + day.spent,
          refunded: acc.refunded + day.refunded,
        }),
        { topup: 0, spent: 0, refunded: 0 },
      ),
    [data],
  );

  const maxUp = Math.max(
    ...data.map(
      (day) => (visible.topup ? day.topup : 0) + (visible.refunded ? day.refunded : 0),
    ),
    1,
  );
  const maxDown = Math.max(...data.map((day) => (visible.spent ? day.spent : 0)), 1);
  // One scale for both arms so a credit and a debit of equal size look equal.
  const scaleMax = Math.max(maxUp, maxDown);

  // Arms are equal so the shared scale is honest: a 100-point credit and a
  // 100-point debit draw exactly the same length.
  const armH = CHART_H / 2;
  const zeroY = armH;
  const band = bandGeometry(data.length);

  const toggle = (key: "topup" | "spent" | "refunded") =>
    setVisible((current) => {
      const next = { ...current, [key]: !current[key] };
      return !next.topup && !next.spent && !next.refunded ? current : next;
    });

  const hovered = hover != null ? data[hover] : null;
  const isEmpty = totals.topup + totals.spent + totals.refunded === 0;

  return (
    <ChartFrame
      title="Points Activity"
      subtitle={`Last ${days} days · credits above, spend below`}
      loading={loading}
      stale={stale}
      empty={isEmpty}
      emptyHint="No points movement in this range yet."
      badge={
        <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/60 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
          <span className="material-symbols-outlined text-[13px]">swap_vert</span>
          Net {formatNumber(totals.topup + totals.refunded - totals.spent)}
        </span>
      }
      legend={
        <div className="mt-3 grid grid-cols-3 gap-2">
          <LegendItem
            swatch="var(--series-1)"
            icon="arrow_upward"
            label="Top-up"
            value={formatNumber(totals.topup)}
            active={visible.topup}
            onToggle={() => toggle("topup")}
          />
          <LegendItem
            swatch="var(--series-3)"
            icon="undo"
            label="Refunded"
            value={formatNumber(totals.refunded)}
            active={visible.refunded}
            onToggle={() => toggle("refunded")}
          />
          <LegendItem
            swatch="var(--series-2)"
            icon="arrow_downward"
            label="Spent"
            value={formatNumber(totals.spent)}
            active={visible.spent}
            onToggle={() => toggle("spent")}
          />
        </div>
      }
    >
      <div
        className="relative mt-3 w-full"
        style={{ aspectRatio: `${CHART_W} / ${CHART_H + LABEL_H}` }}
      >
        {hovered ? (
          <Tooltip
            x={band.tooltipPct(hover!)}
            heading={formatDayLabel(hovered.date)}
            rows={[
              ...(visible.topup
                ? [
                    {
                      color: "var(--series-1)",
                      label: "Top-up",
                      value: formatNumber(hovered.topup),
                    },
                  ]
                : []),
              ...(visible.refunded
                ? [
                    {
                      color: "var(--series-3)",
                      label: "Refunded",
                      value: formatNumber(hovered.refunded),
                    },
                  ]
                : []),
              ...(visible.spent
                ? [
                    {
                      color: "var(--series-2)",
                      label: "Spent",
                      value: `-${formatNumber(hovered.spent)}`,
                    },
                  ]
                : []),
            ]}
          />
        ) : null}

        <svg
          viewBox={`0 0 ${CHART_W} ${CHART_H + LABEL_H}`}
          className="h-full w-full"
          role="img"
          aria-label={`Daily points activity for the last ${days} days`}
          onMouseLeave={() => setHover(null)}
        >
          {/* Symmetric scale: +max, +half, 0, -half, -max. */}
          {[1, 0.5, -0.5, -1].map((ratio) => {
            const y = zeroY - armH * ratio;
            return (
              <g key={`grid-${ratio}`}>
                <line
                  x1={PAD_L}
                  x2={CHART_W}
                  y1={y}
                  y2={y}
                  stroke="rgba(15,23,42,0.1)"
                  strokeDasharray="4 6"
                  className="dark:stroke-white/10"
                />
                <text
                  x={PAD_L - 6}
                  // Clamped so the top tick's ascender stays inside the viewBox.
                  y={Math.max(y + 3, 9)}
                  textAnchor="end"
                  fill="rgba(15,23,42,0.5)"
                  fontSize="10"
                  className="dark:fill-white/50"
                >
                  {ratio < 0 ? "-" : ""}
                  {formatNumber(Math.round(scaleMax * Math.abs(ratio)))}
                </text>
              </g>
            );
          })}
          {/* Zero baseline sits solid — it's the reference both arms read against. */}
          <line
            x1={PAD_L}
            x2={CHART_W}
            y1={zeroY}
            y2={zeroY}
            stroke="rgba(15,23,42,0.35)"
            className="dark:stroke-white/40"
          />
          <text
            x={PAD_L - 6}
            y={zeroY + 3}
            textAnchor="end"
            fill="rgba(15,23,42,0.5)"
            fontSize="10"
            className="dark:fill-white/50"
          >
            0
          </text>

          {data.map((day, index) => {
            const centerX = band.centerAt(index);
            const x = centerX - band.barWidth / 2;
            const topupH = visible.topup ? (day.topup / scaleMax) * armH : 0;
            const refundH = visible.refunded ? (day.refunded / scaleMax) * armH : 0;
            const spentH = visible.spent ? (day.spent / scaleMax) * armH : 0;
            const gap = topupH > 0 && refundH > 0 ? 2 : 0;
            const isHovered = hover === index;
            const opacity = isHovered ? 1 : 0.92;

            return (
              <g key={day.date}>
                {topupH > 0 ? (
                  <path
                    d={
                      refundH > 0
                        ? `M ${x} ${zeroY - topupH} h ${band.barWidth} v ${topupH} h ${-band.barWidth} Z`
                        : roundedTopBar(x, zeroY - topupH, band.barWidth, topupH, 4)
                    }
                    fill="var(--series-1)"
                    opacity={opacity}
                  />
                ) : null}
                {refundH > 0 ? (
                  <path
                    d={roundedTopBar(
                      x,
                      zeroY - topupH - refundH - gap,
                      band.barWidth,
                      refundH,
                      4,
                    )}
                    fill="var(--series-3)"
                    opacity={opacity}
                  />
                ) : null}
                {spentH > 0 ? (
                  // Mirrored so the rounded cap lands at the far (downward) end.
                  <g transform={`translate(0 ${zeroY * 2}) scale(1 -1)`}>
                    <path
                      d={roundedTopBar(x, zeroY - spentH, band.barWidth, spentH, 4)}
                      fill="var(--series-2)"
                      opacity={opacity}
                    />
                  </g>
                ) : null}

                <rect
                  x={band.bandAt(index)}
                  y={0}
                  width={band.groupWidth}
                  height={CHART_H}
                  fill="transparent"
                  onMouseEnter={() => setHover(index)}
                />

                {showLabelAt(index, data.length) ? (
                  <text
                    x={centerX}
                    y={CHART_H + 20}
                    textAnchor={labelAnchor(index, data.length)}
                    fill="rgba(15,23,42,0.5)"
                    fontSize="10"
                    className="dark:fill-white/50"
                  >
                    {formatDayLabel(day.date)}
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>
      </div>
    </ChartFrame>
  );
}
