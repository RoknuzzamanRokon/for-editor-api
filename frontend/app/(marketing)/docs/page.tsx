'use client'
import { useMarketingTheme } from '@/config/marketingTheme'

const navSections = [
  { label: 'Getting Started', links: [
    { href: '#introduction',   icon: 'info',        label: 'Introduction' },
    { href: '#authentication', icon: 'lock',        label: 'Authentication' },
    { href: '#base-url',       icon: 'link',        label: 'Base URL' },
    { href: '#versioning',     icon: 'history',     label: 'Versioning' },
  ]},
  { label: 'API Reference', links: [
    { href: '#auth-endpoints', icon: 'fingerprint', label: 'Auth Endpoints' },
    { href: '#converter',      icon: 'transform',   label: 'Converter' },
    { href: '#users',          icon: 'group',       label: 'Users' },
    { href: '#errors',         icon: 'error',       label: 'Error Codes' },
  ]},
  { label: 'Resources', links: [
    { href: '#roles',          icon: 'badge',       label: 'Roles' },
    { href: '#rate-limits',    icon: 'speed',       label: 'Rate Limits' },
  ]},
]

const authEndpoints = [
  { method: 'POST', color: '#16a34a', path: '/api/v2/auth/login',   desc: 'Issue access and refresh tokens', body: 'Request body: email, password.' },
  { method: 'POST', color: '#16a34a', path: '/api/v2/auth/refresh', desc: 'Refresh an access token',        body: 'Request body: refresh_token.' },
  { method: 'GET',  color: '#2563eb', path: '/api/v2/auth/me',      desc: 'Get current authenticated user', body: 'Requires Authorization: Bearer <token>.' },
]

const conversionRoutes = [
  'POST /api/v3/conversions/pdf-to-word',
  'POST /api/v3/conversions/pdf-to-excel',
  'POST /api/v3/conversions/docx-to-pdf',
  'POST /api/v3/conversions/excel-to-pdf',
  'POST /api/v3/conversions/image-to-pdf',
  'POST /api/v3/conversions/remove-pages-from-pdf',
  'POST /api/v3/conversions/remove-background',
]

const roles = [
  { icon: 'shield_person', title: 'Super User', desc: 'Full access to conversions, billing, admin checks, user role changes, and permission management.' },
  { icon: 'manage_accounts', title: 'Admin',    desc: 'Manage general and demo users, top up points, and inspect user activity and permissions.' },
  { icon: 'person',          title: 'General',  desc: 'Can perform allowed conversions, read dashboard data, check points, and view own history.' },
  { icon: 'visibility',      title: 'Demo',     desc: 'Read-only mode for protected write actions. Demo users cannot create conversion jobs.' },
]

const errors = [
  { color: '#f97316', bg: 'rgba(249,115,22,0.08)', icon: 'warning',      code: '401 Unauthorized',      desc: 'Invalid or missing bearer token.' },
  { color: '#ef4444', bg: 'rgba(239,68,68,0.08)',  icon: 'block',        code: '403 Forbidden',         desc: 'Conversion not permitted, role blocked, or insufficient role privileges.' },
  { color: '#a855f7', bg: 'rgba(168,85,247,0.08)', icon: 'hourglass_top',code: '402 Payment Required',  desc: 'Raised when the user has insufficient points for a conversion request.' },
  { color: '#0ea5e9', bg: 'rgba(14,165,233,0.08)', icon: 'rule',         code: '422 Validation Error',  desc: 'Input payload, file upload, or query parameter validation failed.' },
]

export default function Page() {
  const { theme: t } = useMarketingTheme()

  const endpointCard = { background: t.card, borderColor: t.border }
  const endpointHead = { background: t.surface, borderColor: t.divider }

  return (
    <div
      className="mx-2 mb-4 flex min-h-screen items-start overflow-hidden rounded-[24px] pt-28 transition-colors duration-300 sm:mx-3 sm:mb-6 sm:rounded-[32px] sm:pt-28 md:pt-32 lg:mx-6"
      style={{ background: t.card, boxShadow: t.panelShadow }}
    >

      {/* ── Left sidebar ── */}
      <aside className="fixed left-0 top-0 hidden h-screen w-64 overflow-y-auto border-r px-6 pb-8 pt-32 sm:pt-28 md:pt-32 lg:block"
        style={{ background: t.bgSecondary, borderColor: t.border }}>
        <div className="space-y-8">
          {navSections.map(s => (
            <div key={s.label}>
              <h5 className="mb-3 text-xs font-bold uppercase tracking-wider" style={{ color: t.textMuted }}>{s.label}</h5>
              <ul className="space-y-2">
                {s.links.map(l => (
                  <li key={l.href}>
                    <a href={l.href} className="flex items-center gap-2 text-sm font-medium hover:opacity-80 transition-colors" style={{ color: t.text }}>
                      <span className="material-symbols-outlined text-lg">{l.icon}</span> {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="min-w-0 flex-1 lg:ml-64 xl:mr-[420px]" style={{ background: t.bg }}>
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-16 lg:py-12">
          <section className="mb-8 lg:hidden">
            <div className="flex items-center gap-3 overflow-x-auto pb-1 text-xs font-semibold sm:text-sm">
              {navSections.flatMap((section) => section.links).map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="shrink-0 rounded-full px-3 py-1.5 transition-colors"
                  style={{ background: t.surface, color: t.text }}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </section>

          {/* Introduction */}
          <section className="mb-16" id="introduction">
            <span className="rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider" style={{ background: `${t.primary}18`, color: t.primary }}>v3 Current</span>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl" style={{ color: t.heading }}>ConvertPro API Documentation</h1>
            <p className="mt-6 text-lg leading-relaxed" style={{ color: t.text }}>
              Welcome to the ConvertPro API. This page covers authentication, endpoints, conversion routes, user management, permissions, points, dashboard, and admin APIs.
            </p>
            <div className="mt-10 rounded-xl border p-6" id="base-url" style={{ background: t.surface, borderColor: t.border }}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-tight" style={{ color: t.heading }}>Backend Base URL</h4>
                  <code className="mt-2 block font-mono text-sm" style={{ color: t.primary }}>http://127.0.0.1:8000</code>
                </div>
                <button className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors hover:opacity-80"
                  style={{ background: t.card, borderColor: t.border, color: t.text }}>
                  <span className="material-symbols-outlined text-sm">content_copy</span> Copy
                </button>
              </div>
            </div>
            <div className="mt-6 rounded-xl border p-6" id="versioning" style={{ background: t.card, borderColor: t.border }}>
              <h4 className="text-sm font-bold uppercase tracking-tight" style={{ color: t.heading }}>Versioning</h4>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: t.text }}>
                <strong style={{ color: t.heading }}>v3</strong> is the current platform API for conversions, points, permissions, dashboard, and admin workflows.{' '}
                <strong style={{ color: t.heading }}>v2</strong> handles auth, users, and legacy authenticated converters.{' '}
                <strong style={{ color: t.heading }}>v1</strong> remains available for older conversion integrations.
              </p>
            </div>
          </section>

          <hr className="my-16" style={{ borderColor: t.divider }} />

          {/* Authentication */}
          <section className="mb-16" id="authentication">
            <h2 className="text-3xl font-bold tracking-tight" style={{ color: t.heading }}>Authentication</h2>
            <p className="mt-4" style={{ color: t.text }}>
              The ConvertPro API uses bearer tokens. Login on <code className="font-mono text-sm" style={{ color: t.primary }}>/api/v2/auth/login</code>, refresh on{' '}
              <code className="font-mono text-sm" style={{ color: t.primary }}>/api/v2/auth/refresh</code>, and pass the access token in the{' '}
              <code className="font-mono text-sm" style={{ color: t.primary }}>Authorization</code> header for protected endpoints.
            </p>
            <div className="mt-8 space-y-4">
              <div
                className="rounded-xl p-6 shadow-xl"
                style={{
                  background: t.codeBlockBg,
                  boxShadow: t.elevatedCardShadow,
                }}
              >
                <div className="mb-4 flex items-center justify-between border-b pb-4" style={{ borderColor: t.codeBlockBorder }}>
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: t.textMuted }}>POST /api/v2/auth/login</span>
                  <div className="flex gap-2">
                    <span className="size-2.5 rounded-full bg-red-500" /><span className="size-2.5 rounded-full bg-yellow-500" /><span className="size-2.5 rounded-full bg-green-500" />
                  </div>
                </div>
                <pre className="text-sm leading-relaxed" style={{ color: t.codeBlockText }}><code>{`curl -X POST http://127.0.0.1:8000/api/v2/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email": "user@example.com", "password": "password123"}'`}</code></pre>
              </div>
              <div className="rounded-xl border p-6" style={endpointCard}>
                <h4 className="text-sm font-bold" style={{ color: t.heading }}>Success Response</h4>
                <pre className="mt-4 text-xs" style={{ color: t.textMuted }}><code>{`{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}`}</code></pre>
              </div>
            </div>
          </section>

          <section className="mb-16 xl:hidden">
            <div
              className="rounded-2xl border p-5 shadow-sm"
              style={{
                background: t.card,
                borderColor: t.border,
                boxShadow: t.softCardShadow,
              }}
            >
              <h3 className="text-xl font-bold" style={{ color: t.heading }}>API Tester</h3>
              <p className="mt-2 text-sm" style={{ color: t.textMuted }}>
                Quick request sandbox for mobile and tablet.
              </p>
              <label className="mb-2 mt-5 block text-xs font-bold uppercase tracking-[0.24em]" style={{ color: t.textMuted }}>Endpoint</label>
              <div className="relative mb-4">
                <select className="w-full appearance-none rounded-lg border px-3 py-2 pr-8 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                  style={{ background: t.surface, borderColor: t.border, color: t.text }}>
                  <option>POST /api/v3/conversions/pdf-to-word</option>
                  <option>GET /api/v3/conversions/history</option>
                  <option>POST /api/v2/auth/login</option>
                  <option>GET /api/v2/auth/me</option>
                  <option>POST /api/v2/users</option>
                  <option>GET /api/v3/points/balance</option>
                </select>
                <span className="material-symbols-outlined absolute right-2 top-1/2 pointer-events-none -translate-y-1/2 text-sm" style={{ color: t.textMuted }}>expand_more</span>
              </div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.24em]" style={{ color: t.textMuted }}>Authorization</label>
              <input className="mb-4 w-full rounded-lg border px-3 py-2 text-xs placeholder:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary"
                style={{ background: t.surface, borderColor: t.border, color: t.text }}
                type="text" placeholder="Bearer token" defaultValue="Bearer eyJhbGc..." />
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.24em]" style={{ color: t.textMuted }}>Request Body</label>
              <textarea className="mb-4 w-full rounded-lg border px-3 py-2 text-xs font-mono placeholder:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary"
                style={{ background: t.surface, borderColor: t.border, color: t.text }}
                rows={4} placeholder='{"email": "user@example.com", "password": "..."}' defaultValue={`{\n  "file": "(upload)",\n  "idempotency_key": "uuid"\n}`} />
              <button className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold shadow-lg transition-all hover:opacity-90"
                style={{
                  background: t.buttonBg,
                  color: t.buttonText,
                  boxShadow: t.actionShadow,
                }}>
                <span className="material-symbols-outlined text-base">play_arrow</span> Send Request
              </button>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-[0.24em]" style={{ color: t.textMuted }}>Response</label>
                <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: `${t.success}20`, color: t.success }}>200 OK</span>
              </div>
              <div className="rounded-lg border p-3" style={{ background: t.surface, borderColor: t.border }}>
                <pre className="whitespace-pre-wrap break-words text-[11px] font-mono leading-5" style={{ color: t.text }}><code>{`{
  "conversion_id": 214,
  "status": "success",
  "download_url": "/api/v3/conversions/214/download",
  "points_charged": 3,
  "remaining_balance": 97
}`}</code></pre>
              </div>
            </div>
          </section>

          {/* Auth endpoints */}
          <section className="mb-16" id="auth-endpoints">
            <h3 className="mb-8 text-2xl font-bold" style={{ color: t.heading }}>Auth Endpoints</h3>
            <div className="space-y-4">
              {authEndpoints.map(e => (
                <div key={e.path} className="overflow-hidden rounded-xl border" style={endpointCard}>
                  <div className="flex flex-wrap items-center gap-3 border-b px-6 py-4" style={endpointHead}>
                    <span className="rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wider" style={{ background: e.color }}>{e.method}</span>
                    <code className="text-sm font-bold" style={{ color: t.heading }}>{e.path}</code>
                    <span className="ml-auto text-xs" style={{ color: t.textMuted }}>{e.desc}</span>
                  </div>
                  <div className="p-6"><p className="text-sm" style={{ color: t.text }}>{e.body}</p></div>
                </div>
              ))}
            </div>
          </section>

          {/* Roles */}
          <section className="mb-16" id="roles">
            <h3 className="text-2xl font-bold" style={{ color: t.heading }}>User Roles</h3>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {roles.map(r => (
                <div key={r.title} className="rounded-xl border p-5 transition-colors hover:opacity-90" style={endpointCard}>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined rounded-lg p-2" style={{ background: t.surface, color: t.primary }}>{r.icon}</span>
                    <h4 className="font-bold" style={{ color: t.heading }}>{r.title}</h4>
                  </div>
                  <p className="mt-2 text-sm" style={{ color: t.textMuted }}>{r.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Conversion endpoints */}
          <section className="mb-16" id="converter">
            <h3 className="mb-8 text-2xl font-bold" style={{ color: t.heading }}>Conversion Endpoints</h3>
            <div className="overflow-hidden rounded-xl border mb-6" style={endpointCard}>
              <div className="flex flex-wrap items-center gap-3 border-b px-6 py-4" style={endpointHead}>
                <span className="rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wider" style={{ background: '#16a34a', color: '#fff' }}>POST</span>
                <code className="text-sm font-bold" style={{ color: t.heading }}>/api/v3/conversions/pdf-to-word</code>
                <span className="ml-auto text-xs" style={{ color: t.textMuted }}>Convert PDF to DOCX</span>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { name: 'file',            req: true,  type: 'UploadFile', desc: 'Upload PDF file as multipart form data.' },
                  { name: 'Idempotency-Key', req: false, type: 'header',     desc: 'Optional request header recommended for safe retries on v3 conversion POST calls.' },
                  { name: 'points_charged',  req: false, type: 'integer',    desc: 'Successful conversions charge the flat per-request points rule for non-super users.' },
                ].map(p => (
                  <div key={p.name} className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0" style={{ borderColor: t.divider }}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold" style={{ color: t.heading }}>{p.name}</span>
                        {p.req && <span className="text-[10px] font-bold" style={{ color: t.error }}>REQUIRED</span>}
                      </div>
                      <p className="mt-1 text-xs" style={{ color: t.textMuted }}>{p.desc}</p>
                    </div>
                    <span className="text-xs" style={{ color: t.textMuted }}>{p.type}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border p-6" style={endpointCard}>
              <h4 className="text-sm font-bold uppercase tracking-tight" style={{ color: t.heading }}>Available v3 Conversion Routes</h4>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {conversionRoutes.map(r => (
                  <code key={r} className="rounded-lg px-3 py-2 text-xs" style={{ background: t.surface, color: t.text }}>{r}</code>
                ))}
              </div>
            </div>
          </section>

          {/* Users / Points */}
          <section className="mb-16" id="users">
            <h3 className="mb-8 text-2xl font-bold" style={{ color: t.heading }}>User, Points, Permissions And Admin Endpoints</h3>
            <div className="space-y-4">
              {[
                { method: 'POST',  color: '#16a34a', path: '/api/v2/users',                    desc: 'Create user',        body: 'Admin or super user only.' },
                { method: 'GET',   color: '#2563eb', path: '/api/v2/users',                    desc: 'List users',         body: 'Returns an array of UserOut.' },
                { method: 'PATCH', color: '#a855f7', path: '/api/v2/users/<user_id>/role',     desc: 'Update user role',   body: 'Super user only.' },
                { method: 'GET',   color: '#2563eb', path: '/api/v3/points/balance',           desc: 'Get points balance', body: 'Other points routes: /api/v3/points/ledger, /topup, /rules, /my-point.' },
              ].map(e => (
                <div key={e.path} className="overflow-hidden rounded-xl border" style={endpointCard}>
                  <div className="flex flex-wrap items-center gap-3 border-b px-6 py-4" style={endpointHead}>
                    <span className="rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wider" style={{ background: e.color }}>{e.method}</span>
                    <code className="text-sm font-bold" style={{ color: t.heading }}>{e.path}</code>
                    <span className="ml-auto text-xs" style={{ color: t.textMuted }}>{e.desc}</span>
                  </div>
                  <div className="p-6"><p className="text-sm" style={{ color: t.text }}>{e.body}</p></div>
                </div>
              ))}
            </div>
          </section>

          {/* Errors */}
          <section className="mb-16" id="errors">
            <h3 className="mb-6 text-2xl font-bold" style={{ color: t.heading }}>Error Handling</h3>
            <div className="space-y-4">
              {errors.map(e => (
                <div key={e.code} className="flex gap-4 rounded-xl border-l-4 p-4" style={{ background: e.bg, borderColor: e.color }}>
                  <span className="material-symbols-outlined" style={{ color: e.color }}>{e.icon}</span>
                  <div>
                    <h5 className="text-sm font-bold" style={{ color: e.color }}>{e.code}</h5>
                    <p className="text-sm" style={{ color: t.text }}>{e.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Rate limits */}
          <section className="mb-16" id="rate-limits">
            <h3 className="mb-6 text-2xl font-bold" style={{ color: t.heading }}>Rate Limits</h3>
            <div className="overflow-x-auto rounded-xl border" style={endpointCard}>
              <table className="min-w-[720px] w-full text-left text-sm">
                <thead style={{ background: t.surface }}>
                  <tr>
                    {['Scope', 'Current Docs Note', 'Behavior'].map(h => (
                      <th key={h} className="px-6 py-4 text-xs font-bold uppercase" style={{ color: t.textMuted }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody style={{ borderColor: t.divider }}>
                  {[
                    ['v3 Conversions', 'Point-based charging',    'Each successful request uses the flat cost returned by /api/v3/points/rules.'],
                    ['Retry Safety',   'Idempotency supported',   'Use Idempotency-Key on v3 POST conversions to prevent duplicate charges.'],
                    ['Admin Reads',    'Role-gated',              'Admin and super user access depends on backend role checks.'],
                  ].map(([scope, note, behavior]) => (
                    <tr key={scope} className="border-t" style={{ borderColor: t.divider }}>
                      <td className="px-6 py-4 font-medium" style={{ color: t.heading }}>{scope}</td>
                      <td className="px-6 py-4" style={{ color: t.text }}>{note}</td>
                      <td className="px-6 py-4" style={{ color: t.text }}>{behavior}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

        </div>
      </main>

      {/* ── Right sidebar — API tester ── */}
      <aside className="fixed right-0 top-0 hidden h-screen w-[400px] flex-col border-l pt-32 sm:pt-28 md:pt-32 xl:flex"
        style={{ background: t.bgSecondary, borderColor: t.border }}>
        <div className="flex h-full flex-col px-6 py-6">
            <div
            className="flex-1 rounded-2xl border p-5 shadow-sm"
            style={{
              background: t.card,
              borderColor: t.border,
              boxShadow: t.softCardShadow,
            }}
          >
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.24em]" style={{ color: t.textMuted }}>Endpoint</label>
            <div className="relative mb-4">
              <select className="w-full appearance-none rounded-lg border px-3 py-2 pr-8 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                style={{ background: t.surface, borderColor: t.border, color: t.text }}>
                <option>POST /api/v3/conversions/pdf-to-word</option>
                <option>GET /api/v3/conversions/history</option>
                <option>POST /api/v2/auth/login</option>
                <option>GET /api/v2/auth/me</option>
                <option>POST /api/v2/users</option>
                <option>GET /api/v3/points/balance</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-sm" style={{ color: t.textMuted }}>expand_more</span>
            </div>

            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.24em]" style={{ color: t.textMuted }}>Authorization</label>
            <input className="mb-4 w-full rounded-lg border px-3 py-2 text-xs placeholder:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary"
              style={{ background: t.surface, borderColor: t.border, color: t.text }}
              type="text" placeholder="Bearer token" defaultValue="Bearer eyJhbGc..." />

            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.24em]" style={{ color: t.textMuted }}>Request Body</label>
            <textarea className="mb-4 w-full rounded-lg border px-3 py-2 text-xs font-mono placeholder:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary"
              style={{ background: t.surface, borderColor: t.border, color: t.text }}
              rows={4} placeholder='{"email": "user@example.com", "password": "..."}' defaultValue={`{\n  "file": "(upload)",\n  "idempotency_key": "uuid"\n}`} />

            <button className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold shadow-lg transition-all hover:opacity-90"
              style={{
                background: t.buttonBg,
                color: t.buttonText,
                boxShadow: t.actionShadow,
              }}>
              <span className="material-symbols-outlined text-base">play_arrow</span> Send Request
            </button>

            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-[0.24em]" style={{ color: t.textMuted }}>Response</label>
              <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: `${t.success}20`, color: t.success }}>200 OK</span>
            </div>
            <div className="rounded-lg border p-3" style={{ background: t.surface, borderColor: t.border }}>
              <pre className="whitespace-pre-wrap break-words text-[11px] font-mono leading-5" style={{ color: t.text }}><code>{`{
  "conversion_id": 214,
  "status": "success",
  "download_url": "/api/v3/conversions/214/download",
  "points_charged": 3,
  "remaining_balance": 97
}`}</code></pre>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-lg border px-4 py-2.5" style={{ background: t.card, borderColor: t.border }}>
            <div className="flex size-8 items-center justify-center rounded-full" style={{ background: `${t.primary}20` }}>
              <span className="material-symbols-outlined text-sm" style={{ color: t.primary }}>terminal</span>
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase leading-none" style={{ color: t.textMuted }}>Environment</p>
              <p className="mt-0.5 text-xs font-bold leading-tight" style={{ color: t.heading }}>Local API</p>
            </div>
          </div>
        </div>
      </aside>

    </div>
  )
}
