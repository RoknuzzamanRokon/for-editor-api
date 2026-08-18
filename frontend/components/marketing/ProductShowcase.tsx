'use client'

/**
 * Product demonstration for the landing page.
 *
 * All three panels are faithful recreations of shipped screens — the App Center
 * (`app/user/app-center/page.tsx`), the conversion workspace
 * (`.../app-center/edit/[slug]/page.tsx`), and the dashboard
 * (`app/user/dashboard/page.tsx`). Same groupings, same field labels, same
 * response fields returned by `POST /api/v3/conversions/*`, same tiles and
 * charts. Nothing here shows a capability the product does not have. The
 * verbatim screenshot of the running admin dashboard is used in the hero.
 */

import Link from 'next/link'
import { useId, useState } from 'react'

import { useMarketingTheme } from '@/config/marketingTheme'

type TabId = 'app-center' | 'workspace' | 'analytics'

const TABS: { id: TabId; label: string; icon: string; caption: string }[] = [
  {
    id: 'app-center',
    label: 'App Center',
    icon: 'apps',
    caption: 'Every conversion your account is allowed to run, grouped and searchable.',
  },
  {
    id: 'workspace',
    label: 'Conversion workspace',
    icon: 'upload_file',
    caption: 'Upload, set the options that tool needs, and read the result off the response summary.',
  },
  {
    id: 'analytics',
    label: 'Usage dashboard',
    icon: 'query_stats',
    caption: 'Request volume over 30 days, success rate, the tools your account leans on, and what every job cost.',
  },
]

/** Mirrors the App Center's PDF / Image / Other sections. */
const SHOWCASE_SECTIONS = [
  {
    label: 'PDF Tools',
    icon: 'picture_as_pdf',
    items: [
      { short: 'PDF→Excel', icon: 'table_chart' },
      { short: 'PDF→Word', icon: 'description' },
      { short: 'Merge PDF', icon: 'merge' },
      { short: 'Split PDF', icon: 'call_split' },
      { short: 'Compress PDF', icon: 'compress' },
      { short: 'Watermark', icon: 'branding_watermark' },
      { short: 'Protect PDF', icon: 'lock' },
      { short: 'Page Numbers', icon: 'format_list_numbered' },
      { short: 'Organize Pages', icon: 'reorder' },
      { short: 'Rotate PDF', icon: 'rotate_right' },
    ],
  },
  {
    label: 'Image Tools',
    icon: 'image',
    items: [
      { short: 'Image Convert', icon: 'sync_alt' },
      { short: 'PDF→Image', icon: 'photo_library' },
      { short: 'Image→PDF', icon: 'image' },
      { short: 'Remove BG', icon: 'auto_fix_high' },
    ],
  },
  {
    label: 'Other Tools',
    icon: 'apps',
    items: [
      { short: 'CSV→Excel', icon: 'grid_on' },
      { short: 'Excel→CSV', icon: 'csv' },
      { short: 'Zip Files', icon: 'folder_zip' },
      { short: 'Unzip Archive', icon: 'unarchive' },
      { short: 'HTML→PDF', icon: 'html' },
    ],
  },
]

/** Shape matches ConversionHistoryItem from the workspace. */
const SHOWCASE_HISTORY = [
  { file: 'control-points-block-c.pdf', status: 'success', points: 3, when: '2 min ago' },
  { file: 'boundary-survey-r4.xlsx', status: 'success', points: 3, when: '18 min ago' },
  { file: 'site-plan-set-issue-b.pdf', status: 'processing', points: 3, when: '26 min ago' },
  { file: 'levels-export.csv', status: 'success', points: 3, when: '1 hr ago' },
] as const

/** Mirrors the dashboard's recent-history donut. */
const DONUT_SEGMENTS = [
  { label: 'Success', share: 92, tone: 'success' as const },
  { label: 'Processing', share: 6, tone: 'warning' as const },
  { label: 'Failed', share: 2, tone: 'error' as const },
]

const DONUT_RADIUS = 48
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS

/** Mirrors the dashboard's "My Active APIs" usage bars. */
const TOP_TOOLS = [
  { label: 'PDF to Excel', count: 412, share: 100 },
  { label: 'CSV to Excel', count: 268, share: 65 },
  { label: 'Merge PDF', count: 191, share: 46 },
  { label: 'Watermark PDF', count: 124, share: 30 },
] as const

/** 30 daily totals rendered as the performance line, same shape as the dashboard. */
const CHART_LINE = (() => {
  const daily = [
    18, 24, 21, 30, 27, 12, 9, 33, 41, 38, 45, 39, 16, 11, 48, 52, 47, 55, 61, 24,
    18, 58, 66, 71, 63, 74, 28, 22, 79, 86,
  ]
  const max = Math.max(...daily)
  return daily
    .map((value, index) => {
      const x = (480 * index) / (daily.length - 1)
      const y = 128 - (value / max) * 116
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(' ')
})()

export default function ProductShowcase() {
  const { theme: t } = useMarketingTheme()
  const [active, setActive] = useState<TabId>('app-center')
  const baseId = useId()

  const panelBg = 'rgba(9,17,31,0.86)'
  const innerBg = 'rgba(17,24,39,0.7)'
  const tileBg = 'rgba(2,6,23,0.62)'
  const activeTab = TABS.find((tab) => tab.id === active) ?? TABS[0]

  const toneColor = (tone: 'success' | 'warning' | 'error') =>
    tone === 'success' ? t.success : tone === 'warning' ? t.warning : t.error

  const statusStyle = (status: string) => {
    if (status === 'success') return { color: t.success, bg: `${t.success}1f`, label: 'Success' }
    if (status === 'processing') return { color: t.warning, bg: `${t.warning}1f`, label: 'Processing' }
    return { color: t.error, bg: `${t.error}1f`, label: 'Failed' }
  }

  return (
    <div>
      {/* Tab strip */}
      <div
        className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3"
        role="tablist"
        aria-label="Product screens"
      >
        {TABS.map((tab) => {
          const isActive = tab.id === active
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`${baseId}-tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`${baseId}-panel-${tab.id}`}
              onClick={() => setActive(tab.id)}
              className="flex items-center gap-2 rounded-full border px-4 py-2.5 text-left text-sm font-bold transition-all sm:text-base"
              style={{
                background: isActive ? `${t.primary}1c` : 'rgba(9,17,31,0.7)',
                borderColor: isActive ? t.primary : t.border,
                color: isActive ? t.primary : t.text,
              }}
            >
              <span className="material-symbols-outlined text-lg sm:text-xl" aria-hidden="true">
                {tab.icon}
              </span>
              {tab.label}
            </button>
          )
        })}
      </div>

      <p className="mt-4 text-base leading-7 sm:text-lg sm:leading-8" style={{ color: t.textMuted }}>
        {activeTab.caption}
      </p>

      {/* Browser frame */}
      <div
        className="mt-6 overflow-hidden rounded-3xl border"
        style={{ borderColor: t.border, background: panelBg, boxShadow: t.elevatedCardShadow }}
      >
        <div
          className="flex items-center gap-3 border-b px-4 py-3 sm:px-5"
          style={{ borderColor: t.divider, background: innerBg }}
        >
          <div className="flex shrink-0 gap-1.5" aria-hidden="true">
            <span className="h-3 w-3 rounded-full" style={{ background: t.error }} />
            <span className="h-3 w-3 rounded-full" style={{ background: t.warning }} />
            <span className="h-3 w-3 rounded-full" style={{ background: t.success }} />
          </div>
          <div
            className="flex min-w-0 flex-1 items-center gap-2 rounded-full border px-3 py-1.5"
            style={{ borderColor: t.divider, background: tileBg }}
          >
            <span className="material-symbols-outlined text-sm" style={{ color: t.success }} aria-hidden="true">
              lock
            </span>
            <span className="truncate font-mono text-xs sm:text-sm" style={{ color: t.textMuted }}>
              {active === 'app-center'
                ? 'convaterpro.app/user/app-center'
                : active === 'workspace'
                  ? 'convaterpro.app/user/app-center/edit/pdf-to-excel'
                  : 'convaterpro.app/admin/dashboard'}
            </span>
          </div>
        </div>

        {/* ── App Center ── */}
        <div
          role="tabpanel"
          id={`${baseId}-panel-app-center`}
          aria-labelledby={`${baseId}-tab-app-center`}
          hidden={active !== 'app-center'}
          className="p-4 sm:p-6 lg:p-8"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-xl font-black sm:text-2xl" style={{ color: t.heading }}>
              Editor Panel
            </h3>
            <div
              className="flex items-center gap-2 rounded-full border px-3 py-2"
              style={{ borderColor: t.divider, background: tileBg }}
            >
              <span className="material-symbols-outlined text-lg" style={{ color: t.textMuted }} aria-hidden="true">
                search
              </span>
              <span className="text-sm" style={{ color: t.textMuted }}>
                Search tools
              </span>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {SHOWCASE_SECTIONS.map((section) => (
              <div
                key={section.label}
                className="rounded-2xl border p-4 sm:p-5"
                style={{ borderColor: t.divider, background: innerBg }}
              >
                <div className="mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-xl" style={{ color: t.primary }} aria-hidden="true">
                    {section.icon}
                  </span>
                  <h4
                    className="text-xs font-bold uppercase tracking-[0.18em] sm:text-sm"
                    style={{ color: t.text }}
                  >
                    {section.label}
                  </h4>
                  <span
                    className="ml-auto rounded-full px-2.5 py-0.5 text-xs font-bold"
                    style={{ background: `${t.primary}1c`, color: t.primary }}
                  >
                    {section.items.length}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 sm:gap-4">
                  {section.items.map((item) => (
                    <div key={item.short} className="flex flex-col items-center gap-2">
                      <div
                        className="flex aspect-square w-full max-w-[6rem] items-center justify-center rounded-xl border"
                        style={{
                          borderColor: t.border,
                          background: 'linear-gradient(150deg, rgba(30,41,59,0.9) 0%, rgba(2,6,23,0.95) 100%)',
                        }}
                      >
                        <span
                          className="material-symbols-outlined text-2xl sm:text-3xl"
                          style={{ color: t.primary }}
                          aria-hidden="true"
                        >
                          {item.icon}
                        </span>
                      </div>
                      <p className="text-center text-[0.7rem] font-semibold leading-tight sm:text-xs" style={{ color: t.text }}>
                        {item.short}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Conversion workspace ── */}
        <div
          role="tabpanel"
          id={`${baseId}-panel-workspace`}
          aria-labelledby={`${baseId}-tab-workspace`}
          hidden={active !== 'workspace'}
          className="p-4 sm:p-6 lg:p-8"
        >
          <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
            {/* Upload + options */}
            <div className="rounded-2xl border p-4 sm:p-5" style={{ borderColor: t.divider, background: innerBg }}>
              <h3 className="text-lg font-bold sm:text-xl" style={{ color: t.heading }}>
                PDF to Excel
              </h3>
              <div
                className="mt-4 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-8 text-center"
                style={{ borderColor: t.buttonOutlineBorder, background: tileBg }}
              >
                <span className="material-symbols-outlined text-4xl" style={{ color: t.primary }} aria-hidden="true">
                  cloud_upload
                </span>
                <p className="mt-3 text-sm font-semibold sm:text-base" style={{ color: t.text }}>
                  Click to select a file, or drag &amp; drop it here
                </p>
                <p className="mt-1 text-xs sm:text-sm" style={{ color: t.textMuted }}>
                  control-points-block-c.pdf · 2.4 MB
                </p>
              </div>

              <div className="mt-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color: t.textMuted }}>
                  Conversion options
                </p>
                <div
                  className="mt-2 flex items-center justify-between rounded-xl border px-3 py-2.5"
                  style={{ borderColor: t.divider, background: tileBg }}
                >
                  <span className="text-sm sm:text-base" style={{ color: t.text }}>
                    Extract tables to workbook
                  </span>
                  <span className="material-symbols-outlined text-lg" style={{ color: t.textMuted }} aria-hidden="true">
                    expand_more
                  </span>
                </div>
              </div>

              <div
                className="mt-4 w-full rounded-xl px-4 py-3 text-center text-sm font-bold sm:text-base"
                style={{ background: t.buttonBg, color: t.buttonText }}
              >
                Convert File
              </div>
            </div>

            {/* Response summary + history */}
            <div className="space-y-5">
              <div className="rounded-2xl border p-4 sm:p-5" style={{ borderColor: t.divider, background: innerBg }}>
                <h3 className="text-lg font-bold sm:text-xl" style={{ color: t.heading }}>
                  Response Summary
                </h3>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { label: 'Status', value: 'Success', accent: t.success },
                    { label: 'Points', value: '3' },
                    { label: 'Balance', value: '1,847' },
                    { label: 'ID', value: '2149' },
                  ].map((tile) => (
                    <div key={tile.label} className="rounded-xl p-3" style={{ background: tileBg }}>
                      <p className="text-[0.65rem] uppercase tracking-[0.14em] sm:text-xs" style={{ color: t.textMuted }}>
                        {tile.label}
                      </p>
                      <p
                        className="mt-1.5 text-sm font-bold sm:text-base"
                        style={{ color: tile.accent ?? t.heading }}
                      >
                        {tile.value}
                      </p>
                    </div>
                  ))}
                </div>
                <div
                  className="mt-4 flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold sm:text-base"
                  style={{ borderColor: t.buttonOutlineBorder, background: t.buttonOutlineBg, color: t.buttonOutlineText }}
                >
                  <span className="material-symbols-outlined text-lg" aria-hidden="true">
                    visibility
                  </span>
                  Preview result
                </div>
              </div>

              <div className="rounded-2xl border p-4 sm:p-5" style={{ borderColor: t.divider, background: innerBg }}>
                <h3 className="text-lg font-bold sm:text-xl" style={{ color: t.heading }}>
                  Recent Conversions
                </h3>
                <div className="mt-3 space-y-2">
                  {SHOWCASE_HISTORY.map((row) => {
                    const status = statusStyle(row.status)
                    return (
                      <div
                        key={row.file}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                        style={{ background: tileBg }}
                      >
                        <span
                          className="material-symbols-outlined text-lg shrink-0"
                          style={{ color: t.textMuted }}
                          aria-hidden="true"
                        >
                          draft
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold sm:text-sm" style={{ color: t.heading }}>
                            {row.file}
                          </p>
                          <p className="text-[0.65rem] sm:text-xs" style={{ color: t.textMuted }}>
                            {row.when} · {row.points} points
                          </p>
                        </div>
                        <span
                          className="shrink-0 rounded-full px-2 py-0.5 text-[0.65rem] font-bold sm:text-xs"
                          style={{ background: status.bg, color: status.color }}
                        >
                          {status.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Usage dashboard ── */}
        <div
          role="tabpanel"
          id={`${baseId}-panel-analytics`}
          aria-labelledby={`${baseId}-tab-analytics`}
          hidden={active !== 'analytics'}
          className="p-4 sm:p-6 lg:p-8"
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Monthly Requests', value: '1,284' },
              { label: 'Remaining Points', value: '1,847' },
              { label: 'Success Rate', value: '97.4%', accent: t.success },
              { label: 'Active APIs', value: '19' },
            ].map((tile) => (
              <div
                key={tile.label}
                className="rounded-2xl border p-4"
                style={{ borderColor: t.divider, background: innerBg }}
              >
                <p className="text-[0.7rem] sm:text-xs" style={{ color: t.textMuted }}>
                  {tile.label}
                </p>
                <p className="mt-1 text-xl font-black sm:text-2xl" style={{ color: tile.accent ?? t.heading }}>
                  {tile.value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
            {/* 30-day request volume */}
            <div className="rounded-2xl border p-4 sm:p-5" style={{ borderColor: t.divider, background: innerBg }}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-base font-bold sm:text-lg" style={{ color: t.heading }}>
                  API Performance (30 Days)
                </h3>
                <p className="text-xs sm:text-sm" style={{ color: t.textMuted }}>
                  Total Requests{' '}
                  <span className="font-bold" style={{ color: t.primary }}>
                    1,284
                  </span>
                </p>
              </div>
              <svg
                viewBox="0 0 480 140"
                className="mt-4 h-32 w-full sm:h-40"
                role="img"
                aria-label="Line chart of daily conversion requests over the last 30 days, trending upward"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id={`${baseId}-area`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={t.primary} stopOpacity="0.28" />
                    <stop offset="100%" stopColor={t.primary} stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[0, 1, 2, 3].map((row) => (
                  <line
                    key={row}
                    x1="0"
                    x2="480"
                    y1={12 + row * 34}
                    y2={12 + row * 34}
                    stroke={t.divider}
                    strokeWidth="1"
                  />
                ))}
                <path d={`${CHART_LINE} L 480 128 L 0 128 Z`} fill={`url(#${baseId}-area)`} />
                <path
                  d={CHART_LINE}
                  fill="none"
                  stroke={t.primary}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Status split + top tools */}
            <div className="space-y-5">
              <div className="rounded-2xl border p-4 sm:p-5" style={{ borderColor: t.divider, background: innerBg }}>
                <h3 className="text-base font-bold sm:text-lg" style={{ color: t.heading }}>
                  Recent History
                </h3>
                <div className="mt-3 flex items-center gap-4">
                  <svg
                    viewBox="0 0 120 120"
                    className="h-24 w-24 shrink-0"
                    role="img"
                    aria-label="Donut chart: 92 percent of recent conversions succeeded, 6 percent processing, 2 percent failed"
                  >
                    {DONUT_SEGMENTS.map((segment, index) => {
                      const length = (segment.share / 100) * DONUT_CIRCUMFERENCE
                      const offset = DONUT_SEGMENTS.slice(0, index).reduce(
                        (sum, item) => sum + (item.share / 100) * DONUT_CIRCUMFERENCE,
                        0,
                      )
                      return (
                        <circle
                          key={segment.label}
                          cx="60"
                          cy="60"
                          r={DONUT_RADIUS}
                          fill="none"
                          stroke={toneColor(segment.tone)}
                          strokeWidth="12"
                          strokeDasharray={`${length} ${DONUT_CIRCUMFERENCE - length}`}
                          strokeDashoffset={-offset}
                          transform="rotate(-90 60 60)"
                        />
                      )
                    })}
                  </svg>
                  <div className="min-w-0 flex-1 space-y-2">
                    {DONUT_SEGMENTS.map((segment) => (
                      <div key={segment.label} className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ background: toneColor(segment.tone) }}
                        />
                        <span className="text-xs sm:text-sm" style={{ color: t.text }}>
                          {segment.label}
                        </span>
                        <span className="ml-auto text-xs font-bold sm:text-sm" style={{ color: t.heading }}>
                          {segment.share}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border p-4 sm:p-5" style={{ borderColor: t.divider, background: innerBg }}>
                <h3 className="text-base font-bold sm:text-lg" style={{ color: t.heading }}>
                  My Active APIs
                </h3>
                <div className="mt-3 space-y-3">
                  {TOP_TOOLS.map((tool) => (
                    <div key={tool.label}>
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-xs sm:text-sm" style={{ color: t.text }}>
                          {tool.label}
                        </span>
                        <span className="text-xs font-bold sm:text-sm" style={{ color: t.heading }}>
                          {tool.count}
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full" style={{ background: tileBg }}>
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${tool.share}%`, background: t.primary }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-5 text-sm sm:text-base" style={{ color: t.textMuted }}>
        These are the screens you get on day one.{' '}
        <Link href="/register" className="font-bold underline decoration-2 underline-offset-4" style={{ color: t.primary }}>
          Create a free account
        </Link>{' '}
        to work through them yourself.
      </p>
    </div>
  )
}
