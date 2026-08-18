'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

import ContactModal from '@/components/marketing/ContactModal'
import ProductShowcase from '@/components/marketing/ProductShowcase'
import { useMarketingTheme } from '@/config/marketingTheme'
import {
  AUDIENCES,
  CAPABILITIES,
  COMMERCIAL_POINTS,
  CONVERSION_GROUPS,
  FAQS,
  HERO_ANSWERS,
  HOW_IT_WORKS,
  IMAGE_OUTPUT_FORMATS,
  PREVIEW_FORMATS,
  PROBLEM_POINTS,
  SECONDARY_AUDIENCES,
  SOLUTION_POINTS,
  TOTAL_CONVERSIONS,
  WHY_ROWS,
} from '@/config/marketingContent'
import panelPhoto from '@/static/panel_photo.png'

/** Enquiry presets, all routed through the existing /api/v1/contact endpoint. */
const ENQUIRIES = {
  license: {
    planName: 'Commercial License',
    title: 'Get a commercial license',
    description:
      'Tell us about your team and the conversions your workflow depends on. We will come back to you with license and deployment options.',
    successMessage:
      'Thanks — we have your commercial license enquiry. We will review it and get in touch shortly.',
  },
  demo: {
    planName: 'Guided Demo',
    title: 'Request a guided demo',
    description:
      'Leave your details and we will walk you through ConvaterPro against your own workflow, on a call at a time that suits you.',
    successMessage:
      'Thanks — your demo request is in. We will be in touch to arrange a time.',
  },
  talk: {
    planName: 'Sales Enquiry',
    title: 'Talk to us',
    description:
      'Questions about deployment, access control, or the formats you need? Send your details and we will reply directly.',
    successMessage: 'Thanks for reaching out. We will reply to you shortly.',
  },
} as const

type EnquiryKey = keyof typeof ENQUIRIES

export default function Page() {
  const { theme: t } = useMarketingTheme()
  const [enquiry, setEnquiry] = useState<EnquiryKey | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [activeGroup, setActiveGroup] = useState(CONVERSION_GROUPS[0].id)

  const pageBg = 'rgba(9,17,31,0.72)'
  const heroBg = 'rgba(11,17,32,0.86)'
  const cardBg = 'rgba(9,17,31,0.78)'
  const raisedBg = 'rgba(17,24,39,0.72)'
  const insetBg = 'rgba(2,6,23,0.6)'

  /** Faint blueprint grid — the one decorative flourish, kept behind content. */
  const gridOverlay = {
    backgroundImage: `linear-gradient(${t.divider} 1px, transparent 1px), linear-gradient(90deg, ${t.divider} 1px, transparent 1px)`,
    backgroundSize: '64px 64px',
  }

  const primaryButton = {
    background: t.buttonBg,
    color: t.buttonText,
    boxShadow: t.actionShadow,
  }

  const outlineButton = {
    background: t.buttonOutlineBg,
    color: t.buttonOutlineText,
    borderColor: t.buttonOutlineBorder,
  }

  const selectedGroup =
    CONVERSION_GROUPS.find((group) => group.id === activeGroup) ?? CONVERSION_GROUPS[0]

  const Eyebrow = ({ children }: { children: React.ReactNode }) => (
    <p
      className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.24em] sm:text-sm"
      style={{ color: t.primary }}
    >
      <span aria-hidden="true" className="h-px w-8" style={{ background: t.primary }} />
      {children}
    </p>
  )

  return (
    <main style={{ background: pageBg, boxShadow: t.panelShadow }}>
      {/* ═══════════════ 1. Hero ═══════════════ */}
      <section
        className="relative overflow-hidden border-b px-4 pb-14 pt-10 sm:px-6 sm:pb-20 sm:pt-14 lg:px-8 lg:pb-24 lg:pt-20"
        style={{ background: heroBg, borderColor: t.border }}
        aria-labelledby="hero-heading"
      >
        <div className="pointer-events-none absolute inset-0 opacity-40" style={gridOverlay} aria-hidden="true" />
        <div
          className="pointer-events-none absolute -right-40 -top-40 h-[32rem] w-[32rem] rounded-full opacity-30 blur-[140px]"
          style={{ background: t.primary }}
          aria-hidden="true"
        />

        <div className="relative mx-auto grid max-w-[1440px] items-start gap-10 lg:grid-cols-2 lg:gap-14 lg:px-12">
          <div>
            <Eyebrow>Professional data conversion platform</Eyebrow>

            <h1
              id="hero-heading"
              className="mt-5 text-4xl font-black leading-[1.06] tracking-tight sm:text-6xl lg:text-[3.75rem]"
              style={{ color: t.heading }}
            >
              Convert Your Data.
              <br />
              <span style={{ color: t.primary }}>Simplify Your Workflow.</span>
            </h1>

            <p
              className="mt-6 max-w-2xl text-lg leading-8 sm:text-xl sm:leading-9 lg:text-2xl lg:leading-10"
              style={{ color: t.text }}
            >
              A professional web-based conversion platform built for GIS, surveying, mapping,
              engineering, and data-processing teams.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Link
                href="/register"
                className="rounded-2xl px-6 py-3.5 text-center text-base font-bold transition-transform hover:scale-[1.02] active:scale-[0.98] sm:px-8 sm:py-4 sm:text-lg"
                style={primaryButton}
              >
                Try ConvaterPro
              </Link>
              <button
                type="button"
                onClick={() => setEnquiry('license')}
                className="rounded-2xl border px-6 py-3.5 text-center text-base font-bold transition-opacity hover:opacity-90 sm:px-8 sm:py-4 sm:text-lg"
                style={outlineButton}
              >
                Get a Commercial License
              </button>
            </div>

            <p className="mt-4 text-sm sm:text-base" style={{ color: t.textMuted }}>
              Free 8-day demo account, no card required · {TOTAL_CONVERSIONS} conversion tools ·{' '}
            </p>
          </div>

          {/* Hero product visual — a real screenshot of the running dashboard */}
          <div className="relative w-full">
            <div
              className="overflow-hidden rounded-3xl border"
              style={{ borderColor: t.border, background: cardBg, boxShadow: t.elevatedCardShadow }}
            >
              <div
                className="flex items-center gap-3 border-b px-4 py-3"
                style={{ borderColor: t.divider, background: raisedBg }}
              >
                <div className="flex shrink-0 gap-1.5" aria-hidden="true">
                  <span className="h-3 w-3 rounded-full" style={{ background: t.error }} />
                  <span className="h-3 w-3 rounded-full" style={{ background: t.warning }} />
                  <span className="h-3 w-3 rounded-full" style={{ background: t.success }} />
                </div>
                <span className="truncate font-mono text-xs sm:text-sm" style={{ color: t.textMuted }}>
                  convaterpro.app/admin/dashboard
                </span>
              </div>
              <Image
                alt="The ConvaterPro dashboard: points issued, active users, API request volume, recent conversion activity, and system status including success and failure share."
                src={panelPhoto}
                width={1440}
                height={810}
                sizes="(max-width: 1023px) 100vw, 52vw"
                priority
                className="h-auto w-full object-contain"
                style={{ background: '#050b14' }}
              />
            </div>

            <p className="mt-3 text-center text-sm sm:text-base" style={{ color: t.textMuted }}>
              The running platform — not a concept mockup.
            </p>
          </div>
        </div>

        {/* The three questions the first screen has to answer */}
        <dl className="relative mx-auto mt-10 grid max-w-[1440px] gap-3 sm:grid-cols-3 sm:gap-4 lg:mt-14 lg:px-12">
          {HERO_ANSWERS.map((answer) => (
            <div
              key={answer.label}
              className="rounded-2xl border p-5"
              style={{ background: cardBg, borderColor: t.border }}
            >
              <dt className="flex items-center gap-2">
                <span
                  className="material-symbols-outlined text-lg"
                  style={{ color: t.primary }}
                  aria-hidden="true"
                >
                  {answer.icon}
                </span>
                <span
                  className="text-xs font-bold uppercase tracking-[0.16em] sm:text-sm"
                  style={{ color: t.primary }}
                >
                  {answer.label}
                </span>
              </dt>
              <dd className="mt-2 text-sm leading-6 sm:text-base sm:leading-7" style={{ color: t.text }}>
                {answer.text}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-20">
        {/* ═══════════════ 2. Problem → Solution ═══════════════ */}
        <section className="py-16 sm:py-20 lg:py-24" aria-labelledby="problem-heading">
          <div className="max-w-3xl">
            <Eyebrow>The problem</Eyebrow>
            <h2
              id="problem-heading"
              className="mt-5 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl"
              style={{ color: t.heading }}
            >
              Stop wasting time on repetitive conversion tasks.
            </h2>
            <p className="mt-5 text-base leading-7 sm:text-lg sm:leading-8 lg:text-xl lg:leading-9" style={{ color: t.text }}>
              Professional teams convert, transform, and repackage data constantly before it is
              usable in the next step. That work is unglamorous, easy to get wrong, and it adds up
              across a project.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-2 lg:gap-8">
            {/* Problem column */}
            <div
              className="rounded-3xl border p-6 sm:p-8"
              style={{ background: cardBg, borderColor: t.border, boxShadow: t.softCardShadow }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: `${t.error}1a`, color: t.error }}
                >
                  <span className="material-symbols-outlined text-2xl" aria-hidden="true">
                    warning
                  </span>
                </span>
                <h3 className="text-xl font-bold sm:text-2xl" style={{ color: t.heading }}>
                  How it usually goes
                </h3>
              </div>
              <ul className="mt-6 space-y-5">
                {PROBLEM_POINTS.map((point) => (
                  <li key={point.title} className="flex gap-3">
                    <span
                      className="material-symbols-outlined mt-0.5 shrink-0 text-xl"
                      style={{ color: t.textMuted }}
                      aria-hidden="true"
                    >
                      {point.icon}
                    </span>
                    <div>
                      <p className="text-base font-bold sm:text-lg" style={{ color: t.heading }}>
                        {point.title}
                      </p>
                      <p className="mt-1 text-sm leading-6 sm:text-base sm:leading-7" style={{ color: t.textMuted }}>
                        {point.text}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Solution column */}
            <div
              className="rounded-3xl border p-6 sm:p-8"
              style={{
                background: raisedBg,
                borderColor: `${t.primary}55`,
                boxShadow: t.elevatedCardShadow,
              }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: `${t.primary}1f`, color: t.primary }}
                >
                  <span className="material-symbols-outlined text-2xl" aria-hidden="true">
                    check_circle
                  </span>
                </span>
                <h3 className="text-xl font-bold sm:text-2xl" style={{ color: t.heading }}>
                  How it goes with ConvaterPro
                </h3>
              </div>
              <ul className="mt-6 space-y-5">
                {SOLUTION_POINTS.map((point) => (
                  <li key={point.title} className="flex gap-3">
                    <span
                      className="material-symbols-outlined mt-0.5 shrink-0 text-xl"
                      style={{ color: t.primary }}
                      aria-hidden="true"
                    >
                      {point.icon}
                    </span>
                    <div>
                      <p className="text-base font-bold sm:text-lg" style={{ color: t.heading }}>
                        {point.title}
                      </p>
                      <p className="mt-1 text-sm leading-6 sm:text-base sm:leading-7" style={{ color: t.text }}>
                        {point.text}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ═══════════════ 3. Who is it for ═══════════════ */}
        <section className="border-t py-16 sm:py-20 lg:py-24" style={{ borderColor: t.divider }} aria-labelledby="audience-heading">
          <div className="max-w-3xl">
            <Eyebrow>Who it is for</Eyebrow>
            <h2
              id="audience-heading"
              className="mt-5 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl"
              style={{ color: t.heading }}
            >
              Built around technical data workflows.
            </h2>
            <p className="mt-5 text-base leading-7 sm:text-lg sm:leading-8 lg:text-xl lg:leading-9" style={{ color: t.text }}>
              ConvaterPro handles the document, tabular, imagery, and packaging work that surrounds
              geospatial and engineering projects — the parts that eat hours and rarely get tooling.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:gap-8">
            {AUDIENCES.map((audience) => (
              <article
                key={audience.title}
                className="rounded-3xl border p-6 transition-transform hover:-translate-y-1 sm:p-8"
                style={{ background: cardBg, borderColor: t.border, boxShadow: t.softCardShadow }}
              >
                <span
                  className="flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{ background: `${t.primary}1a`, color: t.primary }}
                >
                  <span className="material-symbols-outlined text-3xl" aria-hidden="true">
                    {audience.icon}
                  </span>
                </span>
                <h3 className="mt-6 text-xl font-bold sm:text-2xl" style={{ color: t.heading }}>
                  {audience.title}
                </h3>
                <p className="mt-3 text-sm leading-7 sm:text-base sm:leading-8" style={{ color: t.text }}>
                  {audience.text}
                </p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {audience.tools.map((tool) => (
                    <li
                      key={tool}
                      className="rounded-full border px-3 py-1 text-xs font-semibold sm:text-sm"
                      style={{ borderColor: t.divider, background: insetBg, color: t.textMuted }}
                    >
                      {tool}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3 lg:gap-6">
            {SECONDARY_AUDIENCES.map((audience) => (
              <div
                key={audience.title}
                className="flex gap-3 rounded-2xl border p-5"
                style={{ background: insetBg, borderColor: t.divider }}
              >
                <span
                  className="material-symbols-outlined shrink-0 text-2xl"
                  style={{ color: t.primary }}
                  aria-hidden="true"
                >
                  {audience.icon}
                </span>
                <div>
                  <h3 className="text-base font-bold sm:text-lg" style={{ color: t.heading }}>
                    {audience.title}
                  </h3>
                  <p className="mt-1 text-sm leading-6 sm:text-base" style={{ color: t.textMuted }}>
                    {audience.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════ 4. How it works ═══════════════ */}
        <section className="border-t py-16 sm:py-20 lg:py-24" style={{ borderColor: t.divider }} aria-labelledby="how-heading">
          <div className="max-w-3xl">
            <Eyebrow>How it works</Eyebrow>
            <h2
              id="how-heading"
              className="mt-5 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl"
              style={{ color: t.heading }}
            >
              Four steps, every time.
            </h2>
            <p className="mt-5 text-base leading-7 sm:text-lg sm:leading-8 lg:text-xl lg:leading-9" style={{ color: t.text }}>
              The same flow for all {TOTAL_CONVERSIONS} tools, so there is nothing new to learn when
              a project needs a different conversion.
            </p>
          </div>

          <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {HOW_IT_WORKS.map((step) => (
              <li
                key={step.step}
                className="relative rounded-3xl border p-6 sm:p-7"
                style={{ background: cardBg, borderColor: t.border, boxShadow: t.softCardShadow }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-black tracking-[0.2em] sm:text-base" style={{ color: t.primary }}>
                    {step.step}
                  </span>
                  <span
                    className="material-symbols-outlined text-2xl sm:text-3xl"
                    style={{ color: t.primary }}
                    aria-hidden="true"
                  >
                    {step.icon}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-bold sm:text-xl" style={{ color: t.heading }}>
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-6 sm:text-base sm:leading-7" style={{ color: t.text }}>
                  {step.text}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* ═══════════════ 5. Capabilities ═══════════════ */}
        <section
          id="features"
          className="border-t py-16 sm:py-20 lg:py-24"
          style={{ borderColor: t.divider }}
          aria-labelledby="capabilities-heading"
        >
          <div className="max-w-3xl">
            <Eyebrow>Capabilities</Eyebrow>
            <h2
              id="capabilities-heading"
              className="mt-5 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl"
              style={{ color: t.heading }}
            >
              What you get on the platform.
            </h2>
            <p className="mt-5 text-base leading-7 sm:text-lg sm:leading-8 lg:text-xl lg:leading-9" style={{ color: t.text }}>
              Everything listed here is shipped and running today.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {CAPABILITIES.map((capability) => (
              <article
                key={capability.title}
                className="rounded-3xl border p-6 transition-transform hover:-translate-y-1 sm:p-7"
                style={{ background: cardBg, borderColor: t.border, boxShadow: t.softCardShadow }}
              >
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ background: `${t.primary}1a`, color: t.primary }}
                >
                  <span className="material-symbols-outlined text-2xl" aria-hidden="true">
                    {capability.icon}
                  </span>
                </span>
                <h3 className="mt-5 text-lg font-bold sm:text-xl" style={{ color: t.heading }}>
                  {capability.title}
                </h3>
                <p className="mt-3 text-sm leading-6 sm:text-base sm:leading-7" style={{ color: t.text }}>
                  {capability.text}
                </p>
              </article>
            ))}
          </div>

          {/* Full conversion catalogue */}
          <div
            className="mt-12 overflow-hidden rounded-3xl border"
            style={{ background: cardBg, borderColor: t.border, boxShadow: t.softCardShadow }}
          >
            <div className="border-b p-6 sm:p-8" style={{ borderColor: t.divider }}>
              <h3 className="text-xl font-bold sm:text-2xl lg:text-3xl" style={{ color: t.heading }}>
                All {TOTAL_CONVERSIONS} conversions
              </h3>
              <p className="mt-3 max-w-3xl text-sm leading-7 sm:text-base sm:leading-8" style={{ color: t.text }}>
                Documents, tabular data, PDFs, imagery, and archives. Pick a category to see exactly
                what is supported — this is the complete list, not a selection.
              </p>

              <div className="mt-6 flex flex-wrap gap-2 sm:gap-3" role="tablist" aria-label="Conversion categories">
                {CONVERSION_GROUPS.map((group) => {
                  const isActive = group.id === selectedGroup.id
                  return (
                    <button
                      key={group.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      aria-controls={`group-panel-${group.id}`}
                      id={`group-tab-${group.id}`}
                      onClick={() => setActiveGroup(group.id)}
                      className="flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-bold transition-all sm:px-4 sm:text-sm"
                      style={{
                        background: isActive ? `${t.primary}1c` : insetBg,
                        borderColor: isActive ? t.primary : t.divider,
                        color: isActive ? t.primary : t.text,
                      }}
                    >
                      <span className="material-symbols-outlined text-base sm:text-lg" aria-hidden="true">
                        {group.icon}
                      </span>
                      {group.label}
                      <span
                        className="rounded-full px-1.5 py-0.5 text-[0.65rem] font-black sm:text-xs"
                        style={{
                          background: isActive ? t.primary : t.divider,
                          color: isActive ? t.buttonText : t.textMuted,
                        }}
                      >
                        {group.items.length}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {CONVERSION_GROUPS.map((group) => (
              <div
                key={group.id}
                role="tabpanel"
                id={`group-panel-${group.id}`}
                aria-labelledby={`group-tab-${group.id}`}
                hidden={group.id !== selectedGroup.id}
                className="p-6 sm:p-8"
              >
                <p className="max-w-3xl text-sm leading-7 sm:text-base sm:leading-8" style={{ color: t.textMuted }}>
                  {group.blurb}
                </p>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
                  {group.items.map((item) => (
                    <li
                      key={item.action}
                      className="flex items-center gap-3 rounded-2xl border p-4"
                      style={{ background: insetBg, borderColor: t.divider }}
                    >
                      <span
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                        style={{ background: `${t.primary}16`, color: t.primary }}
                      >
                        <span className="material-symbols-outlined text-xl" aria-hidden="true">
                          {item.icon}
                        </span>
                      </span>
                      <span className="min-w-0 text-sm font-semibold sm:text-base" style={{ color: t.heading }}>
                        {item.label}
                      </span>
                    </li>
                  ))}
                </ul>

                {group.id === 'images' ? (
                  <p className="mt-5 text-sm sm:text-base" style={{ color: t.textMuted }}>
                    Image output formats: {IMAGE_OUTPUT_FORMATS.join(' · ')}
                  </p>
                ) : null}
              </div>
            ))}

            <div
              className="flex flex-col gap-3 border-t p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8"
              style={{ borderColor: t.divider, background: insetBg }}
            >
              <p className="text-sm leading-7 sm:text-base" style={{ color: t.textMuted }}>
                Preview built in for {PREVIEW_FORMATS.length} file types:{' '}
                <span style={{ color: t.text }}>{PREVIEW_FORMATS.join(', ')}</span>.
              </p>
              <button
                type="button"
                onClick={() => setEnquiry('talk')}
                className="shrink-0 rounded-2xl border px-5 py-2.5 text-sm font-bold transition-opacity hover:opacity-90 sm:text-base"
                style={outlineButton}
              >
                Need a format we don&apos;t list?
              </button>
            </div>
          </div>
        </section>

        {/* ═══════════════ 6. Product demonstration ═══════════════ */}
        <section className="border-t py-16 sm:py-20 lg:py-24" style={{ borderColor: t.divider }} aria-labelledby="demo-heading">
          <div className="max-w-3xl">
            <Eyebrow>See the product</Eyebrow>
            <h2
              id="demo-heading"
              className="mt-5 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl"
              style={{ color: t.heading }}
            >
              This is the actual software.
            </h2>
            <p className="mt-5 text-base leading-7 sm:text-lg sm:leading-8 lg:text-xl lg:leading-9" style={{ color: t.text }}>
              Three of the screens your team will use every day — the tool catalogue, a conversion in
              progress, and the usage view that shows what the account has been doing.
            </p>
          </div>

          <div className="mt-12">
            <ProductShowcase />
          </div>
        </section>

        {/* ═══════════════ 7. Commercial offering ═══════════════ */}
        <section
          className="relative overflow-hidden rounded-[2rem] border px-6 py-14 sm:px-10 sm:py-16 lg:px-14 lg:py-20"
          style={{
            background: 'linear-gradient(135deg, rgba(30,41,59,0.95) 0%, rgba(4,7,15,0.96) 100%)',
            borderColor: `${t.primary}44`,
            boxShadow: t.elevatedCardShadow,
          }}
          aria-labelledby="commercial-heading"
        >
          <div className="pointer-events-none absolute inset-0 opacity-25" style={gridOverlay} aria-hidden="true" />

          <div className="relative grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
            <div>
              <Eyebrow>For organizations</Eyebrow>
              <h2
                id="commercial-heading"
                className="mt-5 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl"
                style={{ color: t.heading }}
              >
                Need ConvaterPro for your organization?
              </h2>
              <p className="mt-5 text-base leading-7 sm:text-lg sm:leading-8 lg:text-xl lg:leading-9" style={{ color: t.text }}>
                ConvaterPro is not only a public utility. It is built to run as a team platform, with
                accounts you administer, permissions you set per person, and the option to deploy it
                on your own infrastructure.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
                <button
                  type="button"
                  onClick={() => setEnquiry('license')}
                  className="rounded-2xl px-6 py-3.5 text-center text-base font-bold transition-transform hover:scale-[1.02] active:scale-[0.98] sm:text-lg"
                  style={primaryButton}
                >
                  Get a Commercial License
                </button>
                <button
                  type="button"
                  onClick={() => setEnquiry('demo')}
                  className="rounded-2xl border px-6 py-3.5 text-center text-base font-bold transition-opacity hover:opacity-90 sm:text-lg"
                  style={outlineButton}
                >
                  Request a Demo
                </button>
                <button
                  type="button"
                  onClick={() => setEnquiry('talk')}
                  className="rounded-2xl px-6 py-3.5 text-center text-base font-bold underline decoration-2 underline-offset-4 transition-opacity hover:opacity-80 sm:text-lg"
                  style={{ color: t.link }}
                >
                  Talk to Us
                </button>
              </div>

              <p className="mt-5 text-sm sm:text-base" style={{ color: t.textMuted }}>
                Already know what you need?{' '}
                <Link href="/pricing" className="font-bold underline decoration-2 underline-offset-4" style={{ color: t.primary }}>
                  See the current plans
                </Link>
                .
              </p>
            </div>

            <div className="grid gap-4 sm:gap-5">
              {COMMERCIAL_POINTS.map((point) => (
                <div
                  key={point.title}
                  className="flex gap-4 rounded-2xl border p-5"
                  style={{ background: 'rgba(9,17,31,0.72)', borderColor: t.border }}
                >
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: t.primary, color: t.buttonText }}
                  >
                    <span className="material-symbols-outlined text-2xl" aria-hidden="true">
                      {point.icon}
                    </span>
                  </span>
                  <div>
                    <h3 className="text-base font-bold sm:text-lg" style={{ color: t.heading }}>
                      {point.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-6 sm:text-base sm:leading-7" style={{ color: t.textMuted }}>
                      {point.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════ 8. Why ConvaterPro ═══════════════ */}
        <section className="py-16 sm:py-20 lg:py-24" aria-labelledby="why-heading">
          <div className="max-w-3xl">
            <Eyebrow>Why ConvaterPro</Eyebrow>
            <h2
              id="why-heading"
              className="mt-5 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl"
              style={{ color: t.heading }}
            >
              What changes when conversion is a platform.
            </h2>
            <p className="mt-5 text-base leading-7 sm:text-lg sm:leading-8 lg:text-xl lg:leading-9" style={{ color: t.text }}>
              Compared with the usual mix of desktop utilities, one-off web converters, and manual
              steps.
            </p>
          </div>

          <p className="mt-8 flex items-center gap-2 text-sm sm:hidden" style={{ color: t.textMuted }}>
            <span className="material-symbols-outlined text-lg" aria-hidden="true">
              swipe_left
            </span>
            Scroll the table sideways to compare.
          </p>

          <div
            className="mt-4 overflow-hidden rounded-3xl border sm:mt-12"
            style={{ background: cardBg, borderColor: t.border, boxShadow: t.softCardShadow }}
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[34rem] border-collapse text-left">
                <caption className="sr-only">
                  Comparison of a typical conversion setup against ConvaterPro
                </caption>
                <thead>
                  <tr style={{ background: raisedBg }}>
                    <th
                      scope="col"
                      className="p-4 text-xs font-bold uppercase tracking-[0.16em] sm:p-5 sm:text-sm"
                      style={{ color: t.textMuted }}
                    >
                      &nbsp;
                    </th>
                    <th
                      scope="col"
                      className="p-4 text-xs font-bold uppercase tracking-[0.16em] sm:p-5 sm:text-sm"
                      style={{ color: t.textMuted }}
                    >
                      Typical setup
                    </th>
                    <th
                      scope="col"
                      className="p-4 text-xs font-bold uppercase tracking-[0.16em] sm:p-5 sm:text-sm"
                      style={{ color: t.primary }}
                    >
                      ConvaterPro
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {WHY_ROWS.map((row, index) => (
                    <tr
                      key={row.point}
                      style={{
                        borderTop: `1px solid ${t.divider}`,
                        background: index % 2 ? insetBg : 'transparent',
                      }}
                    >
                      <th
                        scope="row"
                        className="p-4 align-top text-sm font-bold sm:p-5 sm:text-base"
                        style={{ color: t.heading }}
                      >
                        {row.point}
                      </th>
                      <td className="p-4 align-top text-sm leading-6 sm:p-5 sm:text-base" style={{ color: t.textMuted }}>
                        {row.typical}
                      </td>
                      <td className="p-4 align-top text-sm leading-6 sm:p-5 sm:text-base" style={{ color: t.text }}>
                        <span className="flex gap-2">
                          <span
                            className="material-symbols-outlined shrink-0 text-lg"
                            style={{ color: t.success }}
                            aria-hidden="true"
                          >
                            check
                          </span>
                          {row.convater}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ═══════════════ FAQ ═══════════════ */}
        <section className="border-t py-16 sm:py-20 lg:py-24" style={{ borderColor: t.divider }} aria-labelledby="faq-heading">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div>
              <Eyebrow>Questions</Eyebrow>
              <h2
                id="faq-heading"
                className="mt-5 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl"
                style={{ color: t.heading }}
              >
                Straight answers.
              </h2>
              <p className="mt-5 text-base leading-7 sm:text-lg sm:leading-8" style={{ color: t.text }}>
                Including the ones we get asked before a purchase.{' '}
                <button
                  type="button"
                  onClick={() => setEnquiry('talk')}
                  className="font-bold underline decoration-2 underline-offset-4"
                  style={{ color: t.primary }}
                >
                  Ask us anything else
                </button>
                .
              </p>
            </div>

            <div className="space-y-3">
              {FAQS.map((faq, index) => {
                const isOpen = openFaq === index
                return (
                  <div
                    key={faq.q}
                    className="overflow-hidden rounded-2xl border"
                    style={{ background: cardBg, borderColor: isOpen ? `${t.primary}55` : t.border }}
                  >
                    <h3>
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : index)}
                        aria-expanded={isOpen}
                        aria-controls={`faq-answer-${index}`}
                        className="flex w-full items-center justify-between gap-4 p-5 text-left sm:p-6"
                      >
                        <span className="text-base font-bold sm:text-lg" style={{ color: t.heading }}>
                          {faq.q}
                        </span>
                        <span
                          className="material-symbols-outlined shrink-0 transition-transform"
                          style={{ color: t.primary, transform: isOpen ? 'rotate(180deg)' : undefined }}
                          aria-hidden="true"
                        >
                          expand_more
                        </span>
                      </button>
                    </h3>
                    <div id={`faq-answer-${index}`} hidden={!isOpen}>
                      <p className="px-5 pb-5 text-sm leading-7 sm:px-6 sm:pb-6 sm:text-base sm:leading-8" style={{ color: t.text }}>
                        {faq.a}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ═══════════════ 9. Final CTA ═══════════════ */}
        <section
          className="relative mb-16 overflow-hidden rounded-[2rem] border px-6 py-14 text-center sm:px-10 sm:py-16 lg:py-20"
          style={{
            background: 'linear-gradient(135deg, rgba(30,41,59,0.95) 0%, rgba(4,7,15,0.96) 100%)',
            borderColor: t.border,
            boxShadow: t.elevatedCardShadow,
          }}
          aria-labelledby="final-cta-heading"
        >
          <div className="pointer-events-none absolute inset-0 opacity-25" style={gridOverlay} aria-hidden="true" />
          <div className="relative">
            <h2
              id="final-cta-heading"
              className="mx-auto max-w-3xl text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl"
              style={{ color: t.heading }}
            >
              Ready to simplify your data workflow?
            </h2>
            <p
              className="mx-auto mt-5 max-w-2xl text-base leading-7 sm:text-lg sm:leading-8 lg:text-xl lg:leading-9"
              style={{ color: t.text }}
            >
              Start using ConvaterPro today, or talk to us about deploying it for your organization.
            </p>
            <div className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center sm:gap-4">
              <Link
                href="/register"
                className="rounded-2xl px-6 py-3.5 text-center text-base font-bold transition-transform hover:scale-[1.02] active:scale-[0.98] sm:px-8 sm:py-4 sm:text-lg"
                style={primaryButton}
              >
                Try ConvaterPro
              </Link>
              <button
                type="button"
                onClick={() => setEnquiry('license')}
                className="rounded-2xl border px-6 py-3.5 text-center text-base font-bold transition-opacity hover:opacity-90 sm:px-8 sm:py-4 sm:text-lg"
                style={outlineButton}
              >
                Get Commercial License
              </button>
            </div>
            <p className="mt-5 text-sm sm:text-base" style={{ color: t.textMuted }}>
              Prefer to read first? <Link href="/docs" className="underline decoration-2 underline-offset-4" style={{ color: t.link }}>Browse the API documentation</Link>.
            </p>
          </div>
        </section>
      </div>

      <ContactModal
        isOpen={enquiry !== null}
        onClose={() => setEnquiry(null)}
        planName={enquiry ? ENQUIRIES[enquiry].planName : ''}
        title={enquiry ? ENQUIRIES[enquiry].title : undefined}
        description={enquiry ? ENQUIRIES[enquiry].description : undefined}
        successMessage={enquiry ? ENQUIRIES[enquiry].successMessage : undefined}
      />
    </main>
  )
}
