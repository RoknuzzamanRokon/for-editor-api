'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

import panelPhoto from '@/static/panel_photo.png'
import { useMarketingTheme } from '@/config/marketingTheme'

const SUPPORTED_CONVERSIONS = [
  { icon: 'description', title: 'PDF to Word', desc: 'Editable DOCX output' },
  { icon: 'table_chart', title: 'PDF to Excel', desc: 'Extract tables to XLSX' },
  { icon: 'picture_as_pdf', title: 'Word to PDF', desc: 'DOCX to shareable PDF' },
  { icon: 'grid_on', title: 'Excel to PDF', desc: 'Spreadsheets to PDF' },
  { icon: 'image', title: 'Image to PDF', desc: 'Combine photos into a PDF' },
  { icon: 'auto_fix_high', title: 'Remove Background', desc: 'Cut backgrounds from photos' },
  { icon: 'delete_sweep', title: 'Remove Pages', desc: 'Drop unwanted PDF pages' },
  { icon: 'merge', title: 'Merge PDF', desc: 'Combine PDFs into one file' },
  { icon: 'call_split', title: 'Split PDF', desc: 'One PDF into separate files' },
  { icon: 'rotate_right', title: 'Rotate PDF', desc: 'Rotate every page' },
  { icon: 'lock', title: 'Protect PDF', desc: 'Add a password' },
  { icon: 'lock_open', title: 'Unlock PDF', desc: 'Remove a password' },
  { icon: 'branding_watermark', title: 'Watermark PDF', desc: 'Stamp text on every page' },
  { icon: 'format_list_numbered', title: 'Page Numbers', desc: 'Number every page' },
  { icon: 'text_snippet', title: 'PDF to Text', desc: 'Extract plain text' },
  { icon: 'note_add', title: 'Text to PDF', desc: 'Turn text into a PDF' },
  { icon: 'slideshow', title: 'PowerPoint to PDF', desc: 'PPTX to shareable PDF' },
  { icon: 'co_present', title: 'PDF to PowerPoint', desc: 'PDF pages into slides' },
  { icon: 'photo_library', title: 'PDF to Image', desc: 'Export pages as PNGs' },
  { icon: 'sync_alt', title: 'Image Converter', desc: 'PNG, JPG, WEBP, HEIC & more' },
  { icon: 'compress', title: 'Compress PDF', desc: 'Shrink PDF file size' },
  { icon: 'reorder', title: 'Reorganize Pages', desc: 'Reorder or drop pages' },
] as const

const STATS = [
  { value: '22+', label: 'Conversion Tools' },
  { value: '4', label: 'Role Tiers' },
  { value: '100%', label: 'Refunded on Failure' },
  { value: '24/7', label: 'Self-Serve Access' },
] as const

const HOW_IT_WORKS = [
  { step: '01', icon: 'person_add', title: 'Create an account', desc: 'Sign up in seconds. Start on the free Demo tier or pick a paid plan to unlock every tool.' },
  { step: '02', icon: 'key', title: 'Get your API key', desc: 'Grab a bearer token from your dashboard, or skip the API entirely and convert files right from the UI.' },
  { step: '03', icon: 'bolt', title: 'Start converting', desc: 'Call any of the 22 endpoints with an idempotency key, or drop files straight into the App Center.' },
] as const

const PRICING_TEASER = [
  { name: 'Demo', price: '$0', sub: 'Test the API for free', featured: false },
  { name: 'General', price: '$19', sub: 'For individual developers', featured: false },
  { name: 'Admin', price: '$99', sub: 'High-volume, priority access', featured: true },
  { name: 'Enterprise', price: 'Custom', sub: 'Dedicated support & SLAs', featured: false },
] as const

const FAQS = [
  {
    q: 'Do you store my uploaded files?',
    a: 'Uploaded files are processed and the result is stored privately for you to download. You can delete any conversion — and its stored file — from your history at any time.',
  },
  {
    q: 'What happens if a conversion fails?',
    a: "You're never charged for a failed conversion. If processing fails after your points were reserved, they're automatically refunded to your balance.",
  },
  {
    q: 'How do I avoid being charged twice on a retry?',
    a: 'Send an Idempotency-Key header with your request. Retrying the same request with the same key returns the original result instead of running (or billing) it again.',
  },
  {
    q: 'Which file formats are supported?',
    a: '22+ conversions across PDF, Word, Excel, PowerPoint, and image formats — including HEIC, PNG, JPG, and WEBP. See the full list above.',
  },
  {
    q: 'Can I manage access for a team?',
    a: 'Yes. Demo, General, Admin, and Super User roles are available, and admins can grant or revoke access to individual conversion tools per user.',
  },
  {
    q: 'Need something custom?',
    a: "Enterprise plans include custom integrations, a dedicated manager, and priority support. Reach out from the Pricing page and we'll get back to you.",
  },
] as const

export default function Page() {
  const { theme: t } = useMarketingTheme()
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0)

  const mainBackground = 'rgba(9,17,31,0.72)'
  const heroBackground = 'rgba(11,17,32,0.82)'
  const primaryCardBackground = 'rgba(9,17,31,0.74)'
  const secondaryCardBackground = 'rgba(17,24,39,0.74)'
  const ctaBackground = 'linear-gradient(135deg, rgba(30,41,59,0.95) 0%, rgba(4,7,15,0.95) 100%)'

  return (
    <main
      className="transparent"
      style={{ background: mainBackground, borderColor: t.border, boxShadow: t.panelShadow }}
    >

      {/* ── Hero ── */}
      <section
        className="relative mb-16 w-full overflow-hidden border-b px-4 pb-10 pt-6 backdrop-blur-sm sm:px-6 sm:pb-14 sm:pt-10 lg:mb-24 lg:px-8 lg:pb-20 lg:pt-16"
        style={{ background: heroBackground, borderColor: t.border }}
      >
        <div className="relative mx-auto grid max-w-[1440px] items-center gap-5 lg:grid-cols-[0.82fr_1.18fr] lg:gap-18 lg:px-12">
          <div>
            <h1 className="mt-2 max-w-5xl text-4xl font-black tracking-tight sm:mt-0 sm:text-6xl lg:text-[6.8rem] lg:leading-[1.02]" style={{ color: t.heading }}>
              Powerful file conversion API for <span style={{ color: t.primary }}>modern applications</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 sm:mt-8 sm:text-xl sm:leading-9 lg:text-2xl lg:leading-10" style={{ color: t.text }}>
              Secure, fast, role-based infrastructure for document conversion, permissions, billing controls, and operational visibility.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:gap-4">
              <a href="/register" className="group relative rounded-2xl px-6 py-3.5 text-center text-base font-bold shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] sm:px-8 sm:py-4 sm:text-lg"
                style={{
                  background: t.buttonBg,
                  color: t.buttonText,
                  boxShadow: t.actionShadow,
                }}>
                <span className="relative z-10">Try API Free</span>
              </a>
              <a href="/docs" className="rounded-2xl border px-6 py-3.5 text-center text-base font-bold backdrop-blur-sm transition-all hover:opacity-90 sm:px-8 sm:py-4 sm:text-lg"
                style={{ background: t.buttonOutlineBg, color: t.buttonOutlineText, borderColor: t.buttonOutlineBorder }}>
                View Documentation
              </a>
            </div>
          </div>
          <div className="w-full lg:-mr-28">
            <div
              className="overflow-hidden rounded-3xl border shadow-2xl shadow-black transition-transform hover:scale-[1.01] lg:rounded-[2rem]"
              style={{
                borderColor: t.border,
                background: primaryCardBackground,
                boxShadow: t.elevatedCardShadow,
              }}
            >
              <div className="flex h-10 items-center gap-2 border-b px-5" style={{ borderColor: t.divider, background: secondaryCardBackground }}>
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-amber-400" />
                <span className="h-3 w-3 rounded-full bg-emerald-400" />
              </div>
              <div className="bg-[#050b14] p-2 sm:p-3 lg:p-4">
                <Image
                  alt="Dashboard Mockup"
                  className="h-auto w-full object-contain"
                  src={panelPhoto}
                  width={1440}
                  height={810}
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 sm:py-12 lg:px-20">

        {/* ── Stats strip ── */}
        <section className="mb-16 grid grid-cols-2 gap-6 sm:grid-cols-4 lg:mb-24">
          {STATS.map(({ value, label }) => (
            <div
              key={label}
              className="rounded-2xl border p-5 text-center sm:p-6"
              style={{ background: primaryCardBackground, borderColor: t.border }}
            >
              <p className="text-3xl font-black tracking-tight sm:text-4xl" style={{ color: t.primary }}>{value}</p>
              <p className="mt-2 text-sm font-semibold sm:text-base" style={{ color: t.text }}>{label}</p>
            </div>
          ))}
        </section>

        {/* ── Conversions grid ── */}
        <section className="mb-16 lg:mb-24" id="features">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl" style={{ color: t.heading }}>Supported conversions</h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 sm:text-xl sm:leading-9" style={{ color: t.text }}>
              Production-ready endpoints for common document and image workflows.
            </p>
          </div>
          <div className="marquee-row relative overflow-hidden">
            <div className="marquee-track flex w-max gap-5">
              {[...SUPPORTED_CONVERSIONS, ...SUPPORTED_CONVERSIONS].map(({ icon, title, desc }, index) => (
                <div
                  key={`${title}-${index}`}
                  className="flex w-72 flex-shrink-0 items-center gap-4 rounded-2xl border p-5 transition-all hover:-translate-y-1"
                  style={{ background: primaryCardBackground, borderColor: t.border }}
                >
                  <div
                    className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl"
                    style={{ background: `${t.primary}18`, color: t.primary }}
                  >
                    <span className="material-symbols-outlined text-2xl">{icon}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-base font-bold" style={{ color: t.heading }}>{title}</p>
                    <p className="truncate text-sm" style={{ color: t.text }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 3-col info cards ── */}
        <section className="mb-16 grid gap-6 lg:mb-24 lg:gap-8 lg:grid-cols-3">
          {[
            { label: 'Security',   title: 'JWT and role-based access',    desc: 'Protect write actions with bearer tokens, enforce role checks, and expose only the conversion actions each user is allowed to run.' },
            { label: 'Billing',    title: 'Points and usage controls',    desc: 'Track point balances, top up users, inspect ledgers, and prevent duplicate charges with idempotency keys on conversion requests.' },
            { label: 'Operations', title: 'Dashboard and admin insight',  desc: 'Monitor recent history, conversion success, user activity, point-giving history, and per-user API permissions from one platform.' },
          ].map(({ label, title, desc }) => (
            <div
              key={title}
              className="group rounded-3xl border p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl backdrop-blur-sm sm:p-8"
              style={{
                background: primaryCardBackground,
                borderColor: t.border,
                boxShadow: t.softCardShadow,
              }}
            >
              <p className="text-xs font-bold uppercase tracking-[0.24em]" style={{ color: t.primary }}>{label}</p>
              <h3 className="mt-4 text-2xl font-bold" style={{ color: t.heading }}>{title}</h3>
              <p className="mt-4 text-base leading-7" style={{ color: t.text }}>{desc}</p>
            </div>
          ))}
        </section>

        {/* ── How it works ── */}
        <section className="mb-16 lg:mb-24">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl" style={{ color: t.heading }}>How it works</h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 sm:text-xl sm:leading-9" style={{ color: t.text }}>
              From sign-up to your first converted file in minutes.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
            {HOW_IT_WORKS.map(({ step, icon, title, desc }) => (
              <div
                key={step}
                className="relative rounded-3xl border p-6 shadow-sm backdrop-blur-sm sm:p-8"
                style={{ background: primaryCardBackground, borderColor: t.border, boxShadow: t.softCardShadow }}
              >
                <span className="text-sm font-black tracking-widest" style={{ color: t.primary }}>{step}</span>
                <div className="mt-4 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: `${t.primary}18`, color: t.primary }}>
                  <span className="material-symbols-outlined text-3xl">{icon}</span>
                </div>
                <h3 className="mt-6 text-xl font-bold" style={{ color: t.heading }}>{title}</h3>
                <p className="mt-3 text-base leading-7" style={{ color: t.text }}>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Dark CTA band ── */}
        <section className="mb-16 overflow-hidden rounded-[2rem] py-12 shadow-2xl sm:py-16 lg:mb-24 lg:py-20"
          style={{
            background: ctaBackground,
            color: t.heading,
            boxShadow: t.elevatedCardShadow,
          }}>
          <div className="grid items-center gap-10 px-5 sm:px-8 lg:grid-cols-[1fr_0.95fr] lg:gap-14 lg:px-14">
            <div>
              <h2 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl" style={{ color: t.heading }}>
                Built for product, platform, and internal tools teams.
              </h2>
              <div className="mt-10 space-y-8">
                {[
                  { icon: 'key',        title: 'Auth and user management',    desc: 'Sign in, refresh access, create users, update roles, and manage access without building separate admin plumbing.' },
                  { icon: 'sync',       title: 'Safe conversion retries',     desc: 'Use idempotency keys on v3 conversion requests to protect billing and avoid repeated background work.' },
                  { icon: 'monitoring', title: 'Live operational visibility',  desc: 'Recent history, success rates, balances, and activity views make the API easier to run at team scale.' },
                ].map(({ icon, title, desc }) => (
                  <div key={title} className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                      style={{ background: t.primary, color: t.buttonText }}>
                      <span className="material-symbols-outlined">{icon}</span>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold" style={{ color: t.heading }}>{title}</h4>
                      <p className="mt-2 text-lg" style={{ color: t.textMuted }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div
              className="rounded-3xl border p-6 transition-transform hover:scale-[1.01]"
              style={{
                background: secondaryCardBackground,
                borderColor: t.border,
                boxShadow: t.elevatedCardShadow,
              }}
            >
              <div className="mb-4 flex items-center justify-between border-b pb-4" style={{ borderColor: t.divider }}>
                <span className="font-mono text-sm font-bold" style={{ color: t.primary }}>POST /api/v3/conversions/pdf-to-word</span>
                <div className="flex gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                </div>
              </div>
              <pre className="overflow-x-auto whitespace-pre-wrap break-words text-sm leading-6 sm:text-base sm:leading-7" style={{ color: t.textMuted }}>
                <code>{`curl -X POST http://127.0.0.1:8000/api/v3/conversions/pdf-to-word \\
  -H "Authorization: Bearer <token>" \\
  -H "Idempotency-Key: 550e8400-..." \\
  -F "file=@document.pdf"

{
  "conversion_id": 214,
  "status": "success",
  "download_url": "/api/v3/conversions/214/download",
  "points_charged": 3,
  "remaining_balance": 97
}`}</code>
              </pre>
            </div>
          </div>
        </section>

        {/* ── Why choose ── */}
        <section className="mb-16 lg:mb-24">
          <h2 className="mb-12 text-center text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl" style={{ color: t.heading }}>
            Why teams choose ConvertPro
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: 'speed',         title: 'Fast delivery',    desc: 'Versioned endpoints and predictable request shapes reduce integration time.' },
              { icon: 'group',         title: 'Team-ready roles', desc: 'Support demo, general, admin, and super user workflows in one system.' },
              { icon: 'paid',          title: 'Usage clarity',    desc: 'Balances, ledgers, and top-ups make cost control understandable for every account.' },
              { icon: 'manage_search', title: 'Admin visibility', desc: 'Inspect users, permissions, and conversion performance without leaving the platform.' },
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                className="group rounded-3xl border p-8 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl backdrop-blur-sm"
                style={{
                  background: primaryCardBackground,
                  borderColor: t.border,
                  boxShadow: t.softCardShadow,
                }}
              >
                <span className="material-symbols-outlined text-4xl transition-transform group-hover:scale-110" style={{ color: t.primary }}>{icon}</span>
                <h3 className="mt-5 text-xl font-bold" style={{ color: t.heading }}>{title}</h3>
                <p className="mt-3 text-base leading-7" style={{ color: t.text }}>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Pricing teaser ── */}
        <section className="mb-16 lg:mb-24">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl" style={{ color: t.heading }}>Simple, transparent pricing</h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 sm:text-xl sm:leading-9" style={{ color: t.text }}>
              Start free, upgrade when you need more. No surprise charges — failed conversions are always refunded.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PRICING_TEASER.map(({ name, price, sub, featured }) => (
              <Link
                key={name}
                href="/pricing"
                className="group relative flex flex-col rounded-2xl border p-6 text-center transition-all hover:-translate-y-1 sm:p-8"
                style={{
                  background: featured ? secondaryCardBackground : primaryCardBackground,
                  borderColor: featured ? t.primary : t.border,
                  boxShadow: featured ? t.elevatedCardShadow : t.softCardShadow,
                }}
              >
                {featured && (
                  <span
                    className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider"
                    style={{ background: t.primary, color: t.buttonText }}
                  >
                    Most Popular
                  </span>
                )}
                <h3 className="text-lg font-bold" style={{ color: t.heading }}>{name}</h3>
                <p className="mt-3 text-3xl font-black" style={{ color: t.heading }}>{price}</p>
                <p className="mt-2 text-sm" style={{ color: t.textMuted }}>{sub}</p>
              </Link>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/pricing"
              className="inline-flex rounded-2xl px-6 py-3.5 text-base font-bold shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: t.buttonBg, color: t.buttonText, boxShadow: t.actionShadow }}
            >
              View full pricing &amp; features
            </Link>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="mb-16 lg:mb-24">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl" style={{ color: t.heading }}>Frequently asked questions</h2>
          </div>
          <div className="mx-auto max-w-3xl space-y-4">
            {FAQS.map(({ q, a }, index) => {
              const isOpen = openFaqIndex === index
              return (
                <div
                  key={q}
                  className="overflow-hidden rounded-2xl border"
                  style={{ background: primaryCardBackground, borderColor: t.border }}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-4 p-5 text-left sm:p-6"
                    aria-expanded={isOpen}
                  >
                    <span className="text-base font-bold sm:text-lg" style={{ color: t.heading }}>{q}</span>
                    <span
                      className="material-symbols-outlined shrink-0 transition-transform"
                      style={{ color: t.primary, transform: isOpen ? 'rotate(180deg)' : 'none' }}
                    >
                      expand_more
                    </span>
                  </button>
                  {isOpen && (
                    <p className="px-5 pb-5 text-base leading-7 sm:px-6 sm:pb-6" style={{ color: t.text }}>
                      {a}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section
          className="mb-8 overflow-hidden rounded-[2rem] border px-6 py-14 text-center shadow-2xl sm:px-10 sm:py-16 lg:py-20"
          style={{ background: ctaBackground, borderColor: t.border, boxShadow: t.elevatedCardShadow }}
        >
          <h2 className="mx-auto max-w-2xl text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl" style={{ color: t.heading }}>
            Ready to start converting?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-8 sm:text-xl" style={{ color: t.text }}>
            Create a free account and make your first conversion in minutes.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
            <a
              href="/register"
              className="rounded-2xl px-6 py-3.5 text-center text-base font-bold shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] sm:px-8 sm:py-4 sm:text-lg"
              style={{ background: t.buttonBg, color: t.buttonText, boxShadow: t.actionShadow }}
            >
              Try API Free
            </a>
            <Link
              href="/pricing"
              className="rounded-2xl border px-6 py-3.5 text-center text-base font-bold transition-all hover:opacity-90 sm:px-8 sm:py-4 sm:text-lg"
              style={{ background: t.buttonOutlineBg, color: t.buttonOutlineText, borderColor: t.buttonOutlineBorder }}
            >
              Talk to Sales
            </Link>
          </div>
        </section>

      </div>
    </main>
  )
}
