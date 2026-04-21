'use client'
import Image from 'next/image'
import { useMarketingTheme, cardClass } from '@/config/marketingTheme'

export default function Page() {
  const { theme: t } = useMarketingTheme()

  const card = cardClass('group p-8 transition-all hover:-translate-y-1 hover:shadow-2xl')
  const mainBackground = 'rgba(9,17,31,0.72)'
  const heroBackground = 'rgba(11,17,32,0.82)'
  const primaryCardBackground = 'rgba(9,17,31,0.74)'
  const secondaryCardBackground = 'rgba(17,24,39,0.74)'
  const ctaBackground = 'linear-gradient(135deg, rgba(17,24,39,0.82) 0%, rgba(9,17,31,0.76) 100%)'

  return (
    <main
      className="transparent"
      style={{ background: mainBackground, borderColor: t.border, boxShadow: t.panelShadow }}
    >

      {/* ── Hero ── */}
      <section
        className="relative mb-16 w-full overflow-hidden border-y px-4 py-10 backdrop-blur-sm sm:px-6 sm:py-14 lg:mb-24 lg:px-8 lg:py-20"
        style={{ background: heroBackground, borderColor: t.border }}
      >
        <div className="absolute -top-24 left-16 h-64 w-64 rounded-full blur-[120px]" style={{ background: `${t.primary}18` }} />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full blur-[140px]" style={{ background: `${t.primary}18` }} />
        <div className="relative mx-auto grid max-w-[1440px] items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14 lg:px-12">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium sm:text-sm"
              style={{ background: `${t.primary}18`, color: t.primary }}>
              <span className="material-symbols-outlined text-sm">verified</span> Now processing 1M+ files daily
            </div>
            <h1 className="mt-6 max-w-5xl text-4xl font-black tracking-tight sm:mt-8 sm:text-6xl lg:text-[6.8rem] lg:leading-[1.02]" style={{ color: t.heading }}>
              Powerful file conversion API for <span style={{ color: t.primary }}>modern applications</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 sm:mt-8 sm:text-xl sm:leading-9 lg:text-2xl lg:leading-10" style={{ color: t.text }}>
              Secure, fast, role-based infrastructure for document conversion, permissions, billing controls, and operational visibility.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:gap-4">
              <a href="/pricing" className="group relative rounded-2xl px-6 py-3.5 text-center text-base font-bold shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] sm:px-8 sm:py-4 sm:text-lg"
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
          <div className="w-full">
            <div
              className="overflow-hidden rounded-3xl border shadow-2xl transition-transform hover:scale-[1.02]"
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
              <Image
                alt="Dashboard Mockup"
                className="aspect-video w-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAD5wujvbMWRNdzjqN5AGPZDPPvibfQIV_qqgwbvq2I04UpQ8hIteazbjnyYm5nTW3A7PuGIVFJq2mgs0dWVCUzxlKWf3lOJcefbBBbQ7iNa4vR4iLxqOxXI7FFyF1P305W3nA4b0a2HbGDSlFwQWChRQq_5Bz6BHqnmckyOiMJvtCMHK4Z4kqsfWMPR4nkCO1l2g1hZCNKuGp-hMKm2EdcGIb2RjlAY7aybdg6MY6qEISxOEHVTbeeHFO001iB-Mt4Rr3gAmu0xF44"
                width={1440}
                height={810}
                unoptimized
              />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 sm:py-12 lg:px-20">

        {/* ── Conversions grid ── */}
        <section className="mb-16 lg:mb-24" id="features">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl" style={{ color: t.heading }}>Supported conversions</h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 sm:text-xl sm:leading-9" style={{ color: t.text }}>
              Production-ready endpoints for common document and image workflows.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {[
              { icon: 'description',   title: 'PDF to Word',       desc: 'Turn PDFs into editable DOCX files with private download support and conversion history tracking.' },
              { icon: 'table_chart',   title: 'PDF to Excel',      desc: 'Extract tables and structured data from PDFs directly into spreadsheet workflows.' },
              { icon: 'picture_as_pdf',title: 'Office to PDF',     desc: 'Convert DOCX and Excel files into shareable PDFs for archiving, review, and delivery.' },
              { icon: 'auto_fix_high', title: 'Image workflows',   desc: 'Handle image-to-PDF conversion, background removal, and other lightweight media tasks.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className={card.replace('p-8', 'p-6 sm:p-8')} style={{ background: primaryCardBackground, borderColor: t.border }}>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl transition-all group-hover:scale-110"
                  style={{ background: `${t.primary}18`, color: t.primary }}>
                  <span className="material-symbols-outlined text-3xl">{icon}</span>
                </div>
                <h3 className="mt-6 text-xl font-bold" style={{ color: t.heading }}>{title}</h3>
                <p className="mt-3 text-base leading-7" style={{ color: t.text }}>{desc}</p>
              </div>
            ))}
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

      </div>
    </main>
  )
}
