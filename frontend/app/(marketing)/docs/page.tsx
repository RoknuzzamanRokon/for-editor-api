'use client'

import { useEffect, useState } from 'react'

import { useMarketingTheme } from '@/config/marketingTheme'

type EndpointItem = {
  method: 'GET' | 'POST' | 'PATCH' | 'PUT'
  path: string
  desc: string
  detail: string
  color: string
}

type SectionDefinition = {
  id: string
  title: string
  navLabel: string
  group: string
  icon: string
  eyebrow: string
  summary: string
  bullets?: string[]
  highlights?: string[]
  endpointItems?: EndpointItem[]
  codeSample?: {
    label: string
    content: string
  }
  table?: {
    headers: [string, string, string]
    rows: [string, string, string][]
  }
}

type TesterEndpoint = {
  id: string
  label: string
  method: 'GET' | 'POST'
  path: string
  requiresAuth: boolean
  defaultBody: string
}

const baseUrl = 'https://api.convaterpro.innovatedemo.com'

const testerEndpoints: TesterEndpoint[] = [
  {
    id: 'login',
    label: 'Login',
    method: 'POST',
    path: '/api/v2/auth/login',
    requiresAuth: false,
    defaultBody: '{\n  "email": "user@example.com",\n  "password": "password123"\n}',
  },
  {
    id: 'refresh',
    label: 'Refresh Token',
    method: 'POST',
    path: '/api/v2/auth/refresh',
    requiresAuth: false,
    defaultBody: '{\n  "refresh_token": "paste-refresh-token-here"\n}',
  },
  {
    id: 'me',
    label: 'Current User',
    method: 'GET',
    path: '/api/v2/auth/me',
    requiresAuth: true,
    defaultBody: '',
  },
  {
    id: 'points-balance',
    label: 'Points Balance',
    method: 'GET',
    path: '/api/v3/points/balance',
    requiresAuth: true,
    defaultBody: '',
  },
  {
    id: 'permissions-actions',
    label: 'Permission Actions',
    method: 'GET',
    path: '/api/v3/permissions/actions',
    requiresAuth: true,
    defaultBody: '',
  },
  {
    id: 'dashboard-overview',
    label: 'Dashboard Overview',
    method: 'GET',
    path: '/api/v3/dashboard/overview',
    requiresAuth: true,
    defaultBody: '',
  },
  {
    id: 'deploy-status',
    label: 'Deploy Status',
    method: 'GET',
    path: '/api/v3/live-project-push/status',
    requiresAuth: true,
    defaultBody: '',
  },
]

const sections: SectionDefinition[] = [
  {
    id: 'introduction',
    title: 'Introduction',
    navLabel: 'Introduction',
    group: 'Overview',
    icon: 'library_books',
    eyebrow: 'Current Platform',
    summary:
      'Convater Pro exposes versioned API groups for authentication, user management, conversions, points, permissions, dashboards, admin workflows, and deployment operations.',
    bullets: [
      'Use v2 for authentication and user lifecycle routes.',
      'Use v3 for conversion workloads, points, permissions, dashboard views, admin summaries, and deploy automation.',
      'All protected routes require a bearer token issued from the v2 auth flow.',
    ],
    highlights: [
      'Current docs target the active server environment, not localhost-only development usage.',
      'Navigation on this page is section-linked on desktop and mobile.',
      'The docs structure now mirrors the backend router grouping.',
    ],
  },
  {
    id: 'authentication',
    title: 'Authentication',
    navLabel: 'Authentication',
    group: 'Overview',
    icon: 'lock',
    eyebrow: 'Access Control',
    summary:
      'The platform uses bearer authentication. Log in with v2 auth routes, refresh access tokens when needed, and pass the access token in the Authorization header for protected endpoints.',
    bullets: [
      'Login: POST /api/v2/auth/login',
      'Refresh: POST /api/v2/auth/refresh',
      'Profile check: GET /api/v2/auth/me',
      'Header format: Authorization: Bearer <access_token>',
    ],
    codeSample: {
      label: 'POST /api/v2/auth/login',
      content: `curl -X POST ${baseUrl}/api/v2/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"user@example.com","password":"password123"}'`,
    },
    highlights: [
      'Refresh tokens are exchanged on the dedicated refresh route.',
      'Protected v2 and v3 routes both depend on the issued bearer token.',
    ],
  },
  {
    id: 'base-url-versioning',
    title: 'Base URL And Versioning',
    navLabel: 'Base URL',
    group: 'Overview',
    icon: 'link',
    eyebrow: 'Routing Model',
    summary:
      'Requests should be built against the server environment and then routed into the correct version namespace.',
    bullets: [
      `Server base URL: ${baseUrl}`,
      'v2 namespace: /api/v2 for auth, users, and legacy authenticated converter flows.',
      'v3 namespace: /api/v3 for conversions, points, permissions, dashboard, admin, and deploy.',
      'v1 remains for older conversion compatibility paths but is not the primary current integration surface.',
    ],
    highlights: [
      'Present integrations as server-hosted, not 127.0.0.1.',
      'Version boundaries are explicit and stable in the router layer.',
    ],
  },
  {
    id: 'auth-users',
    title: 'Auth And User APIs',
    navLabel: 'Auth & Users',
    group: 'Core APIs',
    icon: 'manage_accounts',
    eyebrow: 'v2 Router',
    summary:
      'The v2 router includes authentication, user management, and protected home/converter routes for existing integrations.',
    endpointItems: [
      {
        method: 'POST',
        path: '/api/v2/auth/login',
        desc: 'Issue access and refresh tokens',
        detail: 'Accepts login credentials and returns the token pair used across v2 and v3 APIs.',
        color: '#16a34a',
      },
      {
        method: 'POST',
        path: '/api/v2/auth/refresh',
        desc: 'Mint a new access token',
        detail: 'Accepts a refresh token payload and returns a fresh access token response.',
        color: '#16a34a',
      },
      {
        method: 'GET',
        path: '/api/v2/auth/me',
        desc: 'Inspect the current authenticated user',
        detail: 'Returns profile, points, creator metadata, and active API visibility for the signed-in user.',
        color: '#2563eb',
      },
      {
        method: 'POST',
        path: '/api/v2/users',
        desc: 'Create a user',
        detail: 'Used by admin or super user roles to create managed users.',
        color: '#16a34a',
      },
      {
        method: 'GET',
        path: '/api/v2/users',
        desc: 'List users',
        detail: 'Returns the current visible user set based on role access.',
        color: '#2563eb',
      },
      {
        method: 'PATCH',
        path: '/api/v2/users/{user_id}/role',
        desc: 'Update user role',
        detail: 'Restricted role-management route for promoting or changing user access.',
        color: '#a855f7',
      },
    ],
    highlights: [
      'v2 remains the entrypoint for authentication and identity lifecycle operations.',
      'The /auth/me response is richer than a minimal identity check and surfaces active API state.',
    ],
  },
  {
    id: 'conversions',
    title: 'Conversion APIs',
    navLabel: 'Conversions',
    group: 'Core APIs',
    icon: 'transform',
    eyebrow: 'v3 Router',
    summary:
      'The v3 conversions router handles the primary document and image transformations plus download and history-style workflows.',
    endpointItems: [
      {
        method: 'POST',
        path: '/api/v3/conversions/pdf-to-word',
        desc: 'Convert PDF to Word document',
        detail: 'Multipart upload flow for PDF to DOCX conversion.',
        color: '#16a34a',
      },
      {
        method: 'POST',
        path: '/api/v3/conversions/pdf-to-excel',
        desc: 'Convert PDF to Excel spreadsheet',
        detail: 'Processes tabular PDF data into spreadsheet output.',
        color: '#16a34a',
      },
      {
        method: 'POST',
        path: '/api/v3/conversions/docx-to-pdf',
        desc: 'Convert Word to PDF',
        detail: 'Used for DOCX to PDF rendering in the current v3 stack.',
        color: '#16a34a',
      },
      {
        method: 'POST',
        path: '/api/v3/conversions/excel-to-pdf',
        desc: 'Convert Excel to PDF',
        detail: 'Converts spreadsheet uploads to PDF output.',
        color: '#16a34a',
      },
      {
        method: 'POST',
        path: '/api/v3/conversions/image-to-pdf',
        desc: 'Convert image to PDF',
        detail: 'Builds PDF output from image uploads.',
        color: '#16a34a',
      },
      {
        method: 'POST',
        path: '/api/v3/conversions/remove-background',
        desc: 'Remove image background',
        detail: 'Image cleanup flow exposed through the same v3 conversion family.',
        color: '#16a34a',
      },
      {
        method: 'POST',
        path: '/api/v3/conversions/remove-pages-from-pdf',
        desc: 'Remove selected PDF pages',
        detail: 'Accepts page-removal input and returns a refined PDF output.',
        color: '#16a34a',
      },
      {
        method: 'GET',
        path: '/api/v3/conversions/{conversion_id}/download',
        desc: 'Download converted output',
        detail: 'Uses the conversion id returned from a successful job result.',
        color: '#2563eb',
      },
    ],
    bullets: [
      'Idempotency-Key is recommended on v3 POST conversion requests.',
      'Successful jobs return conversion metadata, points charged, and a download URL.',
      'Conversion permissions and role checks can block access before processing begins.',
    ],
  },
  {
    id: 'points',
    title: 'Points APIs',
    navLabel: 'Points',
    group: 'Core APIs',
    icon: 'toll',
    eyebrow: 'v3 Router',
    summary:
      'Points routes cover balance inspection, ledger history, direct top-ups, and top-up request workflows for managed accounts.',
    endpointItems: [
      {
        method: 'GET',
        path: '/api/v3/points/balance',
        desc: 'Get current balance',
        detail: 'Returns the effective points balance for the authenticated user.',
        color: '#2563eb',
      },
      {
        method: 'GET',
        path: '/api/v3/points/ledger',
        desc: 'Read points ledger history',
        detail: 'Paginated view of topups, spending, and refunds.',
        color: '#2563eb',
      },
      {
        method: 'POST',
        path: '/api/v3/points/topup',
        desc: 'Top up a user balance',
        detail: 'Restricted to admin and super user roles, with ownership checks for admin users.',
        color: '#16a34a',
      },
      {
        method: 'POST',
        path: '/api/v3/points/topup-requests',
        desc: 'Create a top-up request',
        detail: 'Allows a user or manager to request balance approval from an eligible admin.',
        color: '#16a34a',
      },
      {
        method: 'GET',
        path: '/api/v3/points/topup-requests/mine',
        desc: 'List my top-up requests',
        detail: 'Returns the current user request history with paging metadata.',
        color: '#2563eb',
      },
    ],
    highlights: [
      'Points charging is the primary v3 usage model.',
      'Admin user management is scoped to the accounts they are allowed to manage.',
    ],
  },
  {
    id: 'permissions',
    title: 'Permissions APIs',
    navLabel: 'Permissions',
    group: 'Core APIs',
    icon: 'verified_user',
    eyebrow: 'v3 Router',
    summary:
      'Permissions routes expose allowed action metadata, current API visibility, and per-user permission editing for managed access.',
    endpointItems: [
      {
        method: 'GET',
        path: '/api/v3/permissions/actions',
        desc: 'List allowed action definitions',
        detail: 'Returns the canonical conversion actions used across permissions and dashboards.',
        color: '#2563eb',
      },
      {
        method: 'GET',
        path: '/api/v3/permissions/my-api',
        desc: 'Get the current user API catalog',
        detail: 'Returns active APIs, permission state, points cost, and usage insights.',
        color: '#2563eb',
      },
      {
        method: 'GET',
        path: '/api/v3/permissions/users/{user_id}/permissions',
        desc: 'Read a user permission set',
        detail: 'Loads the permission matrix for a target managed user.',
        color: '#2563eb',
      },
      {
        method: 'PUT',
        path: '/api/v3/permissions/users/{user_id}/permissions',
        desc: 'Replace a user permission set',
        detail: 'Bulk-update route for managed conversion permissions.',
        color: '#0ea5e9',
      },
      {
        method: 'PATCH',
        path: '/api/v3/permissions/users/{user_id}/permissions/{action}',
        desc: 'Patch one permission',
        detail: 'Toggles a single action without replacing the entire permission set.',
        color: '#a855f7',
      },
    ],
    bullets: [
      'Super users effectively see all actions as allowed.',
      'Admin users cannot modify super user permissions and are scoped to lower-level targets.',
    ],
  },
  {
    id: 'dashboard',
    title: 'Dashboard APIs',
    navLabel: 'Dashboard',
    group: 'Core APIs',
    icon: 'monitoring',
    eyebrow: 'v3 Router',
    summary:
      'Dashboard routes assemble usage summaries, active APIs, performance snapshots, and recent history for the signed-in user.',
    endpointItems: [
      {
        method: 'GET',
        path: '/api/v3/dashboard/overview',
        desc: 'Load dashboard overview',
        detail: 'Returns user-facing summary metrics, per-action performance data, and recent activity snapshots.',
        color: '#2563eb',
      },
    ],
    bullets: [
      'Dashboard API data is composed from conversions, permission visibility, and points state.',
      'Success rate and last-used values are derived per action from recent conversion history.',
    ],
  },
  {
    id: 'admin',
    title: 'Admin APIs',
    navLabel: 'Admin',
    group: 'Admin',
    icon: 'admin_panel_settings',
    eyebrow: 'v3 Router',
    summary:
      'Admin routes provide system summaries, active-user analytics, top-up request handling, managed user inspection, and operational history.',
    endpointItems: [
      {
        method: 'GET',
        path: '/api/v3/admin/dashboard-summary',
        desc: 'Read admin summary metrics',
        detail: 'Returns system-wide quick stats, recent activity, and top-level operational signals.',
        color: '#2563eb',
      },
      {
        method: 'GET',
        path: '/api/v3/admin/active-users',
        desc: 'List active users',
        detail: 'Surfaces user activity visibility for admin and super user workflows.',
        color: '#2563eb',
      },
      {
        method: 'GET',
        path: '/api/v3/admin/points/topup-requests',
        desc: 'Review point top-up requests',
        detail: 'Admin tooling for pending, approved, or rejected request queues.',
        color: '#2563eb',
      },
      {
        method: 'POST',
        path: '/api/v3/admin/points/topup-requests/{request_id}/approve',
        desc: 'Approve a top-up request',
        detail: 'Approves queued point requests within the caller’s allowed management scope.',
        color: '#16a34a',
      },
      {
        method: 'POST',
        path: '/api/v3/admin/points/topup-requests/{request_id}/reject',
        desc: 'Reject a top-up request',
        detail: 'Rejects queued requests while preserving audit visibility.',
        color: '#ef4444',
      },
    ],
    highlights: [
      'Admin routes are role-gated at the router entrypoint.',
      'Some admin behaviors are further restricted by ownership and requested-admin checks.',
    ],
  },
  {
    id: 'deploy',
    title: 'Deploy API',
    navLabel: 'Deploy',
    group: 'Admin',
    icon: 'rocket_launch',
    eyebrow: 'v3 Router',
    summary:
      'Deploy routes allow super users to trigger backend or frontend deployment scripts and inspect deployment status information.',
    endpointItems: [
      {
        method: 'POST',
        path: '/api/v3/live-project-push/backend',
        desc: 'Trigger backend deployment',
        detail: 'Starts the configured backend deploy script and records process metadata.',
        color: '#16a34a',
      },
      {
        method: 'POST',
        path: '/api/v3/live-project-push/frontend',
        desc: 'Trigger frontend deployment',
        detail: 'Starts the configured frontend deploy script and captures log state.',
        color: '#16a34a',
      },
      {
        method: 'GET',
        path: '/api/v3/live-project-push/status',
        desc: 'Read deployment status',
        detail: 'Returns pid, timestamps, and log tail information for current deploy activity.',
        color: '#2563eb',
      },
    ],
    bullets: [
      'Deploy access is restricted to super_user only.',
      'Deploy log and pid locations are server-side script configuration concerns.',
    ],
  },
  {
    id: 'roles',
    title: 'Roles',
    navLabel: 'Roles',
    group: 'Resources',
    icon: 'badge',
    eyebrow: 'Access Model',
    summary:
      'Role behavior determines which APIs are visible, which users can be managed, and which actions are allowed across points, permissions, and admin flows.',
    highlights: [
      'Super User: full access across conversion, admin, points, permission, and deploy operations.',
      'Admin: manages assigned users, permissions, and point operations within ownership scope.',
      'General User: can use permitted APIs, inspect dashboard data, and request point operations for self.',
      'Demo User: restricted from protected write flows and conversion creation.',
    ],
  },
  {
    id: 'errors',
    title: 'Error Handling',
    navLabel: 'Errors',
    group: 'Resources',
    icon: 'error',
    eyebrow: 'Response Patterns',
    summary:
      'Common failures are driven by missing auth, permission denial, point exhaustion, validation issues, and backend processing errors.',
    table: {
      headers: ['Status', 'Typical Cause', 'Current Meaning'],
      rows: [
        ['401 Unauthorized', 'Missing or invalid token', 'The bearer token was not supplied, expired, or could not be validated.'],
        ['403 Forbidden', 'Role or permission block', 'The caller is authenticated but cannot access the route or action.'],
        ['404 Not Found', 'Missing user, request, or deploy resource', 'Target entities are validated and missing resources return explicit not-found errors.'],
        ['422 Validation Error', 'Bad payload or query shape', 'Input schema, paging values, or upload constraints failed validation.'],
        ['500 Internal Server Error', 'Server-side processing or deploy issue', 'Unexpected backend failures, conversion engine problems, or deploy script problems.'],
      ],
    },
  },
  {
    id: 'rate-limits',
    title: 'Rate Limits And Request Safety',
    navLabel: 'Rate Limits',
    group: 'Resources',
    icon: 'speed',
    eyebrow: 'Operational Guidance',
    summary:
      'The platform currently emphasizes points-based charging, role checks, and safe retry behavior more than a published public throttle matrix.',
    table: {
      headers: ['Scope', 'Current Note', 'Behavior'],
      rows: [
        ['v3 conversions', 'Points-based cost', 'Successful requests consume the configured per-request points rule for eligible users.'],
        ['Retry safety', 'Idempotency advised', 'Send Idempotency-Key on conversion POST calls to avoid duplicate processing or duplicate charging.'],
        ['Admin and deploy', 'Role-gated access', 'Administrative reads and deploy operations are protected before execution.'],
      ],
    },
  },
]

const navGroups = Array.from(new Set(sections.map((section) => section.group))).map((group) => ({
  label: group,
  links: sections.filter((section) => section.group === group),
}))

const methodTextColor: Record<EndpointItem['method'], string> = {
  GET: '#ffffff',
  POST: '#ffffff',
  PATCH: '#ffffff',
  PUT: '#ffffff',
}

function EndpointCards({
  items,
  headingColor,
  textColor,
  mutedColor,
  cardStyle,
  headStyle,
}: {
  items: EndpointItem[]
  headingColor: string
  textColor: string
  mutedColor: string
  cardStyle: { background: string; borderColor: string }
  headStyle: { background: string; borderColor: string }
}) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.path} className="overflow-hidden rounded-2xl border" style={cardStyle}>
          <div className="flex flex-wrap items-center gap-3 border-b px-5 py-4 sm:px-6" style={headStyle}>
            <span
              className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em]"
              style={{ background: item.color, color: methodTextColor[item.method] }}
            >
              {item.method}
            </span>
            <code className="text-sm font-bold" style={{ color: headingColor }}>
              {item.path}
            </code>
            <span className="text-xs sm:ml-auto" style={{ color: mutedColor }}>
              {item.desc}
            </span>
          </div>
          <div className="px-5 py-4 sm:px-6">
            <p className="text-sm leading-6" style={{ color: textColor }}>
              {item.detail}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

function InfoTable({
  table,
  headingColor,
  textColor,
  mutedColor,
  surfaceColor,
  dividerColor,
  cardStyle,
}: {
  table: NonNullable<SectionDefinition['table']>
  headingColor: string
  textColor: string
  mutedColor: string
  surfaceColor: string
  dividerColor: string
  cardStyle: { background: string; borderColor: string }
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border" style={cardStyle}>
      <table className="min-w-[720px] w-full text-left text-sm">
        <thead style={{ background: surfaceColor }}>
          <tr>
            {table.headers.map((header) => (
              <th key={header} className="px-5 py-4 text-xs font-bold uppercase tracking-[0.2em] sm:px-6" style={{ color: mutedColor }}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row) => (
            <tr key={row[0]} className="border-t" style={{ borderColor: dividerColor }}>
              <td className="px-5 py-4 font-semibold sm:px-6" style={{ color: headingColor }}>
                {row[0]}
              </td>
              <td className="px-5 py-4 sm:px-6" style={{ color: textColor }}>
                {row[1]}
              </td>
              <td className="px-5 py-4 sm:px-6" style={{ color: textColor }}>
                {row[2]}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function Page() {
  const { theme: t } = useMarketingTheme()
  const [activeSection, setActiveSection] = useState(sections[0]?.id ?? '')
  const [selectedTesterId, setSelectedTesterId] = useState(testerEndpoints[0].id)
  const [authToken, setAuthToken] = useState('')
  const [requestBody, setRequestBody] = useState(testerEndpoints[0].defaultBody)
  const [responseStatus, setResponseStatus] = useState('Ready')
  const [responseOutput, setResponseOutput] = useState('{\n  "message": "Select an endpoint and send a request."\n}')
  const [isSending, setIsSending] = useState(false)

  const endpointCard = { background: t.card, borderColor: t.border }
  const endpointHead = { background: t.surface, borderColor: t.divider }
  const selectedTesterEndpoint = testerEndpoints.find((endpoint) => endpoint.id === selectedTesterId) ?? testerEndpoints[0]

  useEffect(() => {
    const targets = sections
      .map((section) => document.getElementById(section.id))
      .filter((node): node is HTMLElement => Boolean(node))

    if (!targets.length) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

        if (visible[0]?.target?.id) {
          setActiveSection(visible[0].target.id)
        }
      },
      {
        rootMargin: '-20% 0px -55% 0px',
        threshold: [0.2, 0.4, 0.7],
      },
    )

    targets.forEach((target) => observer.observe(target))

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    setRequestBody(selectedTesterEndpoint.defaultBody)
    setResponseStatus('Ready')
    setResponseOutput(
      JSON.stringify(
        {
          endpoint: `${selectedTesterEndpoint.method} ${selectedTesterEndpoint.path}`,
          message: 'Request preview loaded.',
        },
        null,
        2,
      ),
    )
  }, [selectedTesterEndpoint])

  function scrollToSection(id: string) {
    const element = document.getElementById(id)
    if (!element) {
      return
    }

    const top = element.getBoundingClientRect().top + window.scrollY - 132
    window.history.replaceState(null, '', `#${id}`)
    window.scrollTo({ top, behavior: 'smooth' })
    setActiveSection(id)
  }

  async function sendTestRequest() {
    const headers: Record<string, string> = {}
    const init: RequestInit = {
      method: selectedTesterEndpoint.method,
    }

    if (authToken.trim()) {
      headers.Authorization = authToken.trim()
    }

    if (selectedTesterEndpoint.method !== 'GET' && requestBody.trim()) {
      try {
        const parsed = JSON.parse(requestBody)
        headers['Content-Type'] = 'application/json'
        init.body = JSON.stringify(parsed)
      } catch {
        setResponseStatus('Invalid JSON')
        setResponseOutput(
          JSON.stringify(
            {
              error: 'Request body must be valid JSON before sending.',
            },
            null,
            2,
          ),
        )
        return
      }
    }

    if (Object.keys(headers).length) {
      init.headers = headers
    }

    setIsSending(true)
    setResponseStatus('Sending...')

    try {
      const response = await fetch(`${baseUrl}${selectedTesterEndpoint.path}`, init)
      const rawText = await response.text()
      let formattedOutput = rawText

      try {
        formattedOutput = JSON.stringify(JSON.parse(rawText), null, 2)
      } catch {
        formattedOutput = rawText || '{}'
      }

      setResponseStatus(`${response.status} ${response.statusText}`)
      setResponseOutput(formattedOutput)
    } catch (error) {
      setResponseStatus('Request Failed')
      setResponseOutput(
        JSON.stringify(
          {
            error: error instanceof Error ? error.message : 'Unknown request error',
          },
          null,
          2,
        ),
      )
    } finally {
      setIsSending(false)
    }
  }

  function renderSection(section: SectionDefinition) {
    return (
      <section key={section.id} id={section.id} className="scroll-mt-32 md:scroll-mt-36 lg:scroll-mt-40">
        <div className="rounded-[28px] border px-5 py-6 sm:px-7 sm:py-8 lg:px-9" style={endpointCard}>
          <div className="flex flex-wrap items-center gap-3">
            <span
              className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em]"
              style={{ background: `${t.primary}18`, color: t.primary }}
            >
              {section.eyebrow}
            </span>
            <span
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em]"
              style={{ background: t.surface, color: t.textMuted }}
            >
              <span className="material-symbols-outlined text-sm">{section.icon}</span>
              {section.group}
            </span>
          </div>

          <h2 className="mt-5 text-2xl font-extrabold tracking-tight sm:text-3xl" style={{ color: t.heading }}>
            {section.title}
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 sm:text-base" style={{ color: t.text }}>
            {section.summary}
          </p>

          {section.bullets?.length ? (
            <div className="mt-6 rounded-2xl border p-5" style={{ background: t.surface, borderColor: t.border }}>
              <h3 className="text-sm font-bold uppercase tracking-[0.2em]" style={{ color: t.heading }}>
                Key Notes
              </h3>
              <ul className="mt-4 space-y-3">
                {section.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-3 text-sm leading-6" style={{ color: t.text }}>
                    <span className="material-symbols-outlined text-base" style={{ color: t.primary }}>
                      arrow_right_alt
                    </span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {section.codeSample ? (
            <div
              className="mt-6 rounded-2xl p-5 sm:p-6"
              style={{
                background: t.codeBlockBg,
                boxShadow: t.elevatedCardShadow,
              }}
            >
              <div className="mb-4 flex items-center justify-between border-b pb-4" style={{ borderColor: t.codeBlockBorder }}>
                <span className="text-xs font-bold uppercase tracking-[0.24em]" style={{ color: t.textMuted }}>
                  {section.codeSample.label}
                </span>
                <div className="flex gap-2">
                  <span className="size-2.5 rounded-full bg-red-500" />
                  <span className="size-2.5 rounded-full bg-yellow-500" />
                  <span className="size-2.5 rounded-full bg-green-500" />
                </div>
              </div>
              <pre className="overflow-x-auto text-sm leading-7" style={{ color: t.codeBlockText }}>
                <code>{section.codeSample.content}</code>
              </pre>
            </div>
          ) : null}

          {section.endpointItems?.length ? (
            <div className="mt-6">
              <EndpointCards
                items={section.endpointItems}
                headingColor={t.heading}
                textColor={t.text}
                mutedColor={t.textMuted}
                cardStyle={endpointCard}
                headStyle={endpointHead}
              />
            </div>
          ) : null}

          {section.highlights?.length ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {section.highlights.map((highlight) => (
                <div key={highlight} className="rounded-2xl border p-5" style={{ background: t.surface, borderColor: t.border }}>
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined" style={{ color: t.primary }}>
                      verified
                    </span>
                    <p className="text-sm leading-6" style={{ color: t.text }}>
                      {highlight}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {section.table ? (
            <div className="mt-6">
              <InfoTable
                table={section.table}
                headingColor={t.heading}
                textColor={t.text}
                mutedColor={t.textMuted}
                surfaceColor={t.surface}
                dividerColor={t.divider}
                cardStyle={endpointCard}
              />
            </div>
          ) : null}
        </div>
      </section>
    )
  }

  return (
    <div
      className="mx-2 mb-4 rounded-[13px] pt-28 transition-colors duration-300 sm:mx-3 sm:mb-6 sm:rounded-[13px] md:pt-32 lg:mx-6"
      style={{ background: t.card, boxShadow: t.panelShadow }}
    >
      <div className="mx-auto max-w-10xl px-3 pb-6 sm:px-4 sm:pb-8 lg:px-6">
        <aside className="fixed bottom-6 left-6 top-32 hidden w-[260px] lg:block">
          <div className="h-full overflow-y-auto rounded-[28px] border px-5 py-6" style={{ background: t.bgSecondary, borderColor: t.border }}>
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-[0.22em]" style={{ color: t.textMuted }}>
                Docs Navigation
              </p>
              <h2 className="mt-3 text-lg font-bold" style={{ color: t.heading }}>
                Current API Sections
              </h2>
            </div>

            <div className="space-y-7">
              {navGroups.map((group) => (
                <div key={group.label}>
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.2em]" style={{ color: t.textMuted }}>
                    {group.label}
                  </h3>
                  <div className="space-y-2">
                    {group.links.map((item) => {
                      const isActive = activeSection === item.id

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => scrollToSection(item.id)}
                          className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-semibold transition-colors"
                          style={{
                            background: isActive ? `${t.primary}18` : 'transparent',
                            color: isActive ? t.primary : t.text,
                          }}
                        >
                          <span className="material-symbols-outlined text-lg">{item.icon}</span>
                          <span>{item.navLabel}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <aside className="fixed bottom-6 right-6 top-32 hidden w-[300px] xl:block">
          <div className="flex h-full flex-col gap-4 overflow-hidden rounded-[13px] border px-5 py-5" style={{ background: t.bgSecondary, borderColor: t.border }}>
            <div className="flex items-start justify-between gap-3">
              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-[0.22em]" style={{ color: t.textMuted }}>
                  API Tester
                </p>
                <h2 className="mt-3 text-lg font-bold" style={{ color: t.heading }}>
                  Live Request Panel
                </h2>
              </div>
              <span className="material-symbols-outlined mt-1" style={{ color: t.primary }}>
                terminal
              </span>
            </div>

            <div className="rounded-2xl border p-4" style={{ background: t.card, borderColor: t.border }}>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: t.textMuted }}>
                Environment
              </p>
              <p className="mt-2 text-sm font-bold" style={{ color: t.heading }}>
                Server
              </p>
              <p className="mt-1 text-xs leading-5" style={{ color: t.text }}>
                Requests go to the hosted API base URL.
              </p>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto pr-1">
              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: t.textMuted }}>
                  Endpoint
                </label>
                <div className="relative">
                  <select
                    value={selectedTesterId}
                    onChange={(event) => setSelectedTesterId(event.target.value)}
                    className="w-full appearance-none rounded-2xl border px-4 py-3 pr-10 text-sm font-medium focus:outline-none"
                    style={{ background: t.card, borderColor: t.border, color: t.text }}
                  >
                    {testerEndpoints.map((endpoint) => (
                      <option key={endpoint.id} value={endpoint.id}>
                        {endpoint.method} {endpoint.path}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-base" style={{ color: t.textMuted }}>
                    expand_more
                  </span>
                </div>
                <p className="mt-2 text-xs leading-5" style={{ color: t.textMuted }}>
                  {selectedTesterEndpoint.label}
                </p>
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: t.textMuted }}>
                  Authorization
                </label>
                <input
                  type="text"
                  value={authToken}
                  onChange={(event) => setAuthToken(event.target.value)}
                  placeholder={selectedTesterEndpoint.requiresAuth ? 'Bearer your-access-token' : 'Optional'}
                  className="w-full rounded-2xl border px-4 py-3 text-sm focus:outline-none"
                  style={{ background: t.card, borderColor: t.border, color: t.text }}
                />
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: t.textMuted }}>
                  Request Body
                </label>
                <textarea
                  value={requestBody}
                  onChange={(event) => setRequestBody(event.target.value)}
                  rows={selectedTesterEndpoint.method === 'GET' ? 4 : 8}
                  placeholder={selectedTesterEndpoint.method === 'GET' ? 'GET requests usually do not need a JSON body.' : '{\n  "key": "value"\n}'}
                  className="w-full rounded-2xl border px-4 py-3 font-mono text-xs leading-6 focus:outline-none"
                  style={{ background: t.card, borderColor: t.border, color: t.text }}
                />
              </div>

              <button
                type="button"
                onClick={sendTestRequest}
                disabled={isSending}
                className="flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
                style={{ background: t.buttonBg, color: t.buttonText, boxShadow: t.actionShadow }}
              >
                <span className="material-symbols-outlined text-base">{isSending ? 'progress_activity' : 'play_arrow'}</span>
                {isSending ? 'Sending...' : 'Send Request'}
              </button>

              <div className="rounded-2xl border p-4" style={{ background: t.card, borderColor: t.border }}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: t.textMuted }}>
                    Response
                  </p>
                  <span className="rounded-full px-2.5 py-1 text-[10px] font-bold" style={{ background: `${t.primary}18`, color: t.primary }}>
                    {responseStatus}
                  </span>
                </div>
                <pre className="mt-4 overflow-x-auto whitespace-pre-wrap break-words text-[11px] leading-6" style={{ color: t.text }}>
                  <code>{responseOutput}</code>
                </pre>
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 lg:ml-[284px] xl:mr-[324px]">
            <div
              className="sticky top-24 z-20 mb-6 rounded-[24px] border px-4 py-4 shadow-sm lg:hidden"
              style={{ background: `${t.card}F2`, borderColor: t.border, backdropFilter: 'blur(14px)' }}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: t.textMuted }}>
                    Section Nav
                  </p>
                  <p className="mt-1 text-sm font-semibold" style={{ color: t.heading }}>
                    {sections.find((section) => section.id === activeSection)?.title ?? 'Introduction'}
                  </p>
                </div>
                <div className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ background: `${t.primary}18`, color: t.primary }}>
                  Mobile Ready
                </div>
              </div>
              <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                {sections.map((section) => {
                  const isActive = activeSection === section.id

                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => scrollToSection(section.id)}
                      className="shrink-0 rounded-full px-3 py-2 text-xs font-bold transition-colors"
                      style={{
                        background: isActive ? t.primary : t.surface,
                        color: isActive ? t.buttonText : t.text,
                      }}
                    >
                      {section.navLabel}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-6">
              <section className="rounded-[13px] border px-5 py-7 sm:px-7 sm:py-8 lg:px-10" style={{ background: t.bgSecondary, borderColor: t.border }}>
                <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                  <div className="max-w-3xl">
       
                    <h1 className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl" style={{ color: t.heading }}>
                      Convater Pro API Documentation
                    </h1>
                    <p className="mt-5 text-base leading-7 sm:text-lg" style={{ color: t.text }}>
                      This page now tracks the current backend structure, with grouped docs for v2 auth and users plus the active v3 platform routes for conversions, points, permissions, dashboards, admin tooling, and deployment.
                    </p>
                  </div>

                  
                </div>
              </section>

              {sections.map((section) => renderSection(section))}
            </div>
        </main>
      </div>
    </div>
  )
}
