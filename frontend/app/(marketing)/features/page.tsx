'use client'
import { getTheme, cardClass } from '@/config/marketingTheme'

export default function Page() {
  const t = getTheme()
  const mode = 'light'
  const card = cardClass(mode, 'p-6 shadow-sm')
  const card8 = cardClass(mode, 'p-8 shadow-sm')

  return (
    <main className="mx-3 mb-6 overflow-hidden rounded-[32px] bg-white pt-36 shadow-[0_24px_80px_rgba(15,23,42,0.12)] lg:mx-6 lg:pt-24">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b py-16 sm:py-24" style={{ background: t.bgSecondary, borderColor: t.border }}>
        <div className="relative mx-auto grid max-w-[1440px] gap-10 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:px-20">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[0.24em]"
              style={{ background: `${t.primary}18`, color: t.primary }}>
              <span className="material-symbols-outlined text-sm">auto_awesome</span> Product Features
            </div>
            <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-tight sm:mt-8 sm:text-5xl lg:text-7xl" style={{ color: t.heading }}>
              Everything teams need to automate file workflows with one API.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 sm:mt-8 sm:text-lg sm:leading-8" style={{ color: t.text }}>
              ConvertPro combines secure conversion pipelines, role-based access, billing controls, history, downloads, and admin insight into one platform.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a href="/docs" className="rounded-2xl px-8 py-4 text-center text-sm font-bold shadow-xl transition-all hover:opacity-90"
                style={{ background: t.buttonBg, color: t.buttonText }}>Explore Docs</a>
              <a href="/pricing" className="rounded-2xl border px-8 py-4 text-center text-sm font-bold transition-all hover:opacity-90"
                style={{ background: t.buttonOutlineBg, color: t.buttonOutlineText, borderColor: t.buttonOutlineBorder }}>
                View Plans
              </a>
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {[
              { icon: 'transform',           title: '7 live conversion flows', desc: 'PDF to Word, PDF to Excel, DOCX to PDF, Excel to PDF, Image to PDF, background removal, and page removal.' },
              { icon: 'admin_panel_settings', title: 'Role-based control',     desc: 'Built-in super user, admin, general, and demo roles with permission gates for conversion actions.' },
              { icon: 'toll',                title: 'Points and billing',      desc: 'Track balances, top up accounts, inspect ledger history, and enforce per-request charging in v3.' },
              { icon: 'query_stats',         title: 'Operational visibility',  desc: 'Dashboard overview, recent conversion history, success tracking, active-user monitoring.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className={card} style={{ background: t.card, borderColor: t.border }}>
                <span className="material-symbols-outlined text-4xl" style={{ color: t.primary }}>{icon}</span>
                <h3 className="mt-5 text-xl font-bold" style={{ color: t.heading }}>{title}</h3>
                <p className="mt-3 text-sm leading-7" style={{ color: t.text }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Core capabilities ── */}
      <section className="py-16 sm:py-24" style={{ background: t.bg }}>
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-20">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl" style={{ color: t.heading }}>Core capabilities</h2>
            <p className="mt-5 text-base leading-7 sm:text-lg sm:leading-8" style={{ color: t.text }}>
              The platform is structured around practical API building blocks that product and platform teams need in real deployments.
            </p>
          </div>
          <div className="mt-16 grid gap-6 lg:grid-cols-3">
            {[
              { icon: 'upload_file', title: 'Conversion pipeline',    desc: 'Upload-based conversion endpoints with private output storage, download-by-conversion-id, idempotency protection, and per-action history feeds.',
                checks: ['Multipart uploads for file-based conversion', 'Download URLs generated after success', 'History endpoints for each conversion type'] },
              { icon: 'lock',        title: 'Access and permissions', desc: 'JWT auth, current-user lookup, managed user creation, role changes, and per-user conversion permissions exposed through admin-safe APIs.',
                checks: ['Access and refresh token flow', 'Bulk and per-action permission updates', 'Role-gated admin operations'] },
              { icon: 'monitoring',  title: 'Insight and governance', desc: 'Monitor usage with dashboard summaries, per-user API visibility, active-user lists, point-giving history, and detailed user audit views.',
                checks: ['Balance and ledger endpoints', 'Dashboard success and latency insights', 'Admin active-user and point history views'] },
            ].map(({ icon, title, desc, checks }) => (
              <article key={title} className={card8} style={{ background: t.card, borderColor: t.border }}>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{ background: `${t.primary}18`, color: t.primary }}>
                  <span className="material-symbols-outlined text-3xl">{icon}</span>
                </div>
                <h3 className="mt-6 text-2xl font-bold" style={{ color: t.heading }}>{title}</h3>
                <p className="mt-4 text-sm leading-7" style={{ color: t.text }}>{desc}</p>
                <ul className="mt-6 space-y-3 text-sm">
                  {checks.map(c => (
                    <li key={c} className="flex gap-3" style={{ color: t.text }}>
                      <span className="material-symbols-outlined" style={{ color: t.primary }}>check_circle</span> {c}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Built for real teams ── */}
      <section className="py-16 sm:py-24" style={{ background: t.bgSecondary }}>
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-20">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <h2 className="text-3xl font-black tracking-tight sm:text-4xl" style={{ color: t.heading }}>Built for real teams</h2>
              <p className="mt-6 text-base leading-7 sm:text-lg sm:leading-8" style={{ color: t.text }}>
                The product covers the entire workflow from authentication to conversion execution to team governance.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {[
                { label: 'Developers',    title: 'Simple integration', desc: 'Clean REST paths, predictable JSON responses, and upload-first conversion flows.' },
                { label: 'Operations',    title: 'Safe retries',       desc: 'Idempotency keys help avoid duplicate charges and repeated conversion work.' },
                { label: 'Admins',        title: 'User governance',    desc: 'Manage roles, conversion permissions, balances, and inspect activity from one place.' },
                { label: 'Product teams', title: 'Scalable packaging', desc: 'Support demo users, internal teams, and enterprise customers with one backend model.' },
              ].map(({ label, title, desc }) => (
                <div key={title} className="rounded-3xl border p-6 backdrop-blur-sm" style={{ background: t.surface, borderColor: t.border }}>
                  <p className="text-xs font-bold uppercase tracking-[0.24em]" style={{ color: t.primary }}>{label}</p>
                  <h3 className="mt-3 text-xl font-bold" style={{ color: t.heading }}>{title}</h3>
                  <p className="mt-3 text-sm leading-7" style={{ color: t.text }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── API preview ── */}
      <section className="overflow-hidden py-16 sm:py-24" style={{ background: t.surface }}>
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-20">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_0.95fr] lg:gap-12">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.3em]" style={{ color: t.primary }}>API Preview</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl" style={{ color: t.heading }}>One platform, versioned and production-friendly.</h2>
              <p className="mt-6 max-w-2xl text-base leading-7 sm:text-lg sm:leading-8" style={{ color: t.textMuted }}>
                Use v2 for auth and user management, and v3 for points, permissions, dashboard, admin, and conversion workflows.
              </p>
            </div>
            <div className="rounded-3xl border p-6 shadow-2xl" style={{ background: t.card, borderColor: t.border }}>
              <div className="mb-4 flex items-center justify-between border-b pb-4" style={{ borderColor: t.divider }}>
                <span className="font-mono text-sm font-bold" style={{ color: t.primary }}>POST /api/v3/conversions/pdf-to-word</span>
                <div className="flex gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                </div>
              </div>
              <pre className="overflow-x-auto whitespace-pre-wrap break-words text-sm leading-7" style={{ color: t.textMuted }}>
                <code>{`curl -X POST .../api/v3/conversions/pdf-to-word \\
  -H "Authorization: Bearer <token>" \\
  -F "file=@document.pdf"

{ "status": "success", "points_charged": 3 }`}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 sm:py-24" style={{ background: t.bgSecondary }}>
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-20">
          <div className="rounded-[2rem] border px-5 py-10 text-center sm:px-8 sm:py-14" style={{ background: t.surface, borderColor: t.border }}>
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl" style={{ color: t.heading }}>Ship faster with a complete conversion stack.</h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 sm:text-lg sm:leading-8" style={{ color: t.text }}>
              Start with the docs, choose a pricing tier, and integrate the endpoints your team needs.
            </p>
            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <a href="/docs" className="rounded-2xl px-8 py-4 text-sm font-bold shadow-xl transition-all hover:opacity-90"
                style={{ background: t.buttonBg, color: t.buttonText }}>Read Documentation</a>
              <a href="/pricing" className="rounded-2xl border px-8 py-4 text-sm font-bold transition-all hover:opacity-90"
                style={{ background: t.buttonOutlineBg, color: t.buttonOutlineText, borderColor: t.buttonOutlineBorder }}>
                Compare Pricing
              </a>
            </div>
          </div>
        </div>
      </section>

    </main>
  )
}
