export default function Page() {
  const markup = `
<header class="fixed inset-x-0 top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-background-dark/80">
    <div class="flex h-20 w-full items-center justify-between px-4 sm:h-16 sm:px-6 lg:px-8">
      <div class="flex items-center gap-4 sm:gap-8">
        <a class="flex items-center gap-2 text-primary cursor-pointer" href="/">
          <span class="material-symbols-outlined text-2xl font-bold sm:text-3xl">sync_alt</span>
          <span class="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-xl">ConvertPro <span
              class="text-primary">API</span></span>
        </a>
        <div class="hidden md:flex items-center gap-8">
          <a class="text-sm font-medium text-slate-600 hover:text-primary transition-colors dark:text-slate-400" href="/features">Features</a>
          <a class="text-sm font-medium text-slate-600 hover:text-primary transition-colors dark:text-slate-400" href="/pricing">Pricing</a>
          <a class="text-sm font-medium text-slate-900 transition-colors dark:text-white" href="/docs">Documentation</a>
          <a class="text-sm font-medium text-slate-600 hover:text-primary transition-colors dark:text-slate-400" href="/dashboard">Dashboard</a>
        </div>
      </div>
      <div class="flex items-center gap-2 sm:gap-3">
        <div class="relative hidden sm:block">
          <span
            class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm dark:text-slate-500">search</span>
          <input
            class="h-9 w-64 rounded-lg border-slate-200 bg-slate-50 pl-10 text-sm focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            placeholder="Search documentation..." type="text" />
          <kbd
            class="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-slate-300 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 dark:border-slate-700 dark:text-slate-500">⌘K</kbd>
        </div>
        <button
          class="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm shadow-slate-200/60 transition-all hover:scale-[1.02] hover:shadow-md dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-black/20 sm:h-11 sm:w-11 md:inline-flex"
          data-theme-toggle
          onclick="window.__toggleMarketingTheme()">
          <span class="material-symbols-outlined text-xl sm:text-[22px]" data-theme-toggle-icon>dark_mode</span>
        </button>
        <a href="/login" class="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all duration-200 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/25 hover:ring-4 hover:ring-primary/15 active:scale-[0.98]">Login</a>
      </div>
    </div>
    <div class="border-t border-slate-200/70 px-4 py-3 dark:border-slate-800 md:hidden">
      <nav class="flex items-center gap-3 overflow-x-auto whitespace-nowrap text-sm font-semibold">
        <a class="rounded-full bg-slate-100 px-3 py-1.5 text-slate-700 dark:bg-slate-900 dark:text-slate-300" href="/features">Features</a>
        <a class="rounded-full bg-slate-100 px-3 py-1.5 text-slate-700 dark:bg-slate-900 dark:text-slate-300" href="/pricing">Pricing</a>
        <a class="rounded-full bg-primary/10 px-3 py-1.5 text-primary" href="/docs">Documentation</a>
        <a class="rounded-full bg-slate-100 px-3 py-1.5 text-slate-700 dark:bg-slate-900 dark:text-slate-300" href="/dashboard">Dashboard</a>
      </nav>
    </div>
  </header>
  <div class="flex min-h-[calc(100vh-64px)] items-start bg-background-light pt-32 dark:bg-background-dark sm:pt-20 md:pt-16">
    <aside
      class="fixed left-0 top-0 hidden h-screen w-64 overflow-y-auto border-r border-slate-200 bg-white px-6 pb-8 pt-24 dark:border-slate-800 dark:bg-slate-950 lg:block">
      <div class="space-y-8">
        <div>
          <h5 class="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Getting Started</h5>
          <ul class="space-y-2">
            <li><a class="flex items-center gap-2 text-sm font-medium text-primary" href="#introduction"><span
                  class="material-symbols-outlined text-lg">info</span> Introduction</a></li>
            <li><a class="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-300"
                href="#authentication"><span class="material-symbols-outlined text-lg">lock</span> Authentication</a>
            </li>
            <li><a class="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-300"
                href="#base-url"><span class="material-symbols-outlined text-lg">link</span> Base URL</a></li>
            <li><a class="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-300"
                href="#versioning"><span class="material-symbols-outlined text-lg">history</span> Versioning</a></li>
          </ul>
        </div>
        <div>
          <h5 class="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">API Reference</h5>
          <ul class="space-y-2">
            <li><a class="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-300"
                href="#auth-endpoints"><span class="material-symbols-outlined text-lg">fingerprint</span> Auth
                Endpoints</a></li>
            <li><a class="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-300"
                href="#converter"><span class="material-symbols-outlined text-lg">transform</span> Converter</a></li>
            <li><a class="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-300"
                href="#users"><span class="material-symbols-outlined text-lg">group</span> Users</a></li>
            <li><a class="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-300"
                href="#errors"><span class="material-symbols-outlined text-lg">error</span> Error Codes</a></li>
          </ul>
        </div>
        <div>
          <h5 class="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Resources</h5>
          <ul class="space-y-2">
            <li><a class="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-300"
                href="#roles"><span class="material-symbols-outlined text-lg">badge</span> Roles</a></li>
            <li><a class="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-300"
                href="#rate-limits"><span class="material-symbols-outlined text-lg">speed</span> Rate Limits</a></li>
            <li><a class="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-300"
                href="#sdks"><span class="material-symbols-outlined text-lg">package</span> SDKs</a></li>
          </ul>
        </div>
      </div>
    </aside>
    <main class="min-w-0 flex-1 bg-white dark:bg-slate-950 lg:ml-64 xl:mr-[400px]">
      <div class="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-16 lg:py-12">
        <section class="mb-16" id="introduction">
          <div class="flex items-center gap-2 mb-2">
            <span
              class="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">v3
              Current</span>
          </div>
          <h1 class="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">ConvertPro API Documentation
          </h1>
          <p class="mt-6 text-lg text-slate-600 leading-relaxed dark:text-slate-300">
            Welcome to the ConvertPro API. This page keeps the current documentation layout while updating the real
            API values, active endpoints, auth flow, conversion routes, user management routes, permissions, points,
            dashboard, and admin APIs used by the backend.
          </p>
          <div class="mt-10 rounded-xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900" id="base-url">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h4 class="text-sm font-bold text-slate-900 uppercase tracking-tight dark:text-white">Backend Base URL</h4>
                <code class="mt-2 block text-primary font-mono text-sm">http://127.0.0.1:8000</code>
              </div>
              <button
                  class="flex items-center gap-2 rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800">
                <span class="material-symbols-outlined text-sm">content_copy</span> Copy
              </button>
            </div>
          </div>
          <div class="mt-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950" id="versioning">
            <h4 class="text-sm font-bold text-slate-900 uppercase tracking-tight dark:text-white">Versioning</h4>
            <p class="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              <span class="font-semibold text-slate-900 dark:text-white">v3</span> is the current platform API for conversions,
              points, permissions, dashboard, and admin workflows. <span class="font-semibold text-slate-900 dark:text-white">v2</span>
              handles auth, users, and legacy authenticated converters. <span class="font-semibold text-slate-900 dark:text-white">v1</span>
              remains available for older conversion integrations.
            </p>
          </div>
        </section>
        <hr class="border-slate-100 my-16" />
        <section class="mb-16" id="authentication">
          <h2 class="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Authentication</h2>
          <p class="mt-4 text-slate-600 dark:text-slate-300">
            The ConvertPro API uses bearer tokens. Login on <code class="font-mono text-sm">/api/v2/auth/login</code>,
            refresh on <code class="font-mono text-sm">/api/v2/auth/refresh</code>, and pass the access token in the
            <code class="font-mono text-sm">Authorization</code> header for protected endpoints.
          </p>
          <div class="mt-8 space-y-4">
            <div class="rounded-xl bg-[#1e293b] p-6 shadow-xl">
              <div class="mb-4 flex items-center justify-between border-b border-slate-700 pb-4">
                <span class="text-xs font-bold uppercase tracking-widest text-slate-400">POST /api/v2/auth/login</span>
                <div class="flex gap-2">
                  <span class="size-2.5 rounded-full bg-red-500"></span>
                  <span class="size-2.5 rounded-full bg-yellow-500"></span>
                  <span class="size-2.5 rounded-full bg-green-500"></span>
                </div>
              </div>
              <pre class="code-block text-sm leading-relaxed text-slate-300"><code><span class="text-primary">curl</span> -X POST http://127.0.0.1:8000/api/v2/auth/login \\
  -H <span class="text-green-400">"Content-Type: application/json"</span> \\
  -d '{
    <span class="text-yellow-400">"email"</span>: <span class="text-green-400">"user@example.com"</span>,
    <span class="text-yellow-400">"password"</span>: <span class="text-green-400">"password123"</span>
  }'</code></pre>
            </div>
            <div class="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
              <h4 class="text-sm font-bold text-slate-900 dark:text-white">Success Response</h4>
              <pre class="code-block mt-4 text-xs text-slate-600 dark:text-slate-300"><code>{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}</code></pre>
            </div>
          </div>
        </section>
        <section class="mb-16" id="auth-endpoints">
          <h3 class="text-2xl font-bold text-slate-900 dark:text-white mb-8">Auth Endpoints</h3>
          <div class="space-y-4">
            <div class="rounded-xl border border-slate-200 bg-white overflow-hidden dark:border-slate-800 dark:bg-slate-950">
              <div class="flex flex-wrap items-center gap-3 bg-slate-50 px-6 py-4 border-b border-slate-200 dark:border-slate-800 dark:bg-slate-900">
                <span class="rounded bg-green-600 px-2 py-1 text-[10px] font-bold text-white uppercase tracking-wider">POST</span>
                <code class="text-sm font-bold text-slate-700 dark:text-slate-200">/api/v2/auth/login</code>
                <span class="ml-auto text-xs text-slate-400 dark:text-slate-500">Issue access and refresh tokens</span>
              </div>
              <div class="p-6">
                <p class="text-sm text-slate-600 dark:text-slate-300">Request body: <code class="font-mono text-xs">email</code>,
                  <code class="font-mono text-xs">password</code>.</p>
              </div>
            </div>
            <div class="rounded-xl border border-slate-200 bg-white overflow-hidden dark:border-slate-800 dark:bg-slate-950">
              <div class="flex flex-wrap items-center gap-3 bg-slate-50 px-6 py-4 border-b border-slate-200 dark:border-slate-800 dark:bg-slate-900">
                <span class="rounded bg-green-600 px-2 py-1 text-[10px] font-bold text-white uppercase tracking-wider">POST</span>
                <code class="text-sm font-bold text-slate-700 dark:text-slate-200">/api/v2/auth/refresh</code>
                <span class="ml-auto text-xs text-slate-400 dark:text-slate-500">Refresh an access token</span>
              </div>
              <div class="p-6">
                <p class="text-sm text-slate-600 dark:text-slate-300">Request body: <code class="font-mono text-xs">refresh_token</code>.</p>
              </div>
            </div>
            <div class="rounded-xl border border-slate-200 bg-white overflow-hidden dark:border-slate-800 dark:bg-slate-950">
              <div class="flex flex-wrap items-center gap-3 bg-slate-50 px-6 py-4 border-b border-slate-200 dark:border-slate-800 dark:bg-slate-900">
                <span class="rounded bg-blue-600 px-2 py-1 text-[10px] font-bold text-white uppercase tracking-wider">GET</span>
                <code class="text-sm font-bold text-slate-700 dark:text-slate-200">/api/v2/auth/me</code>
                <span class="ml-auto text-xs text-slate-400 dark:text-slate-500">Get current authenticated user</span>
              </div>
              <div class="p-6">
                <p class="text-sm text-slate-600 dark:text-slate-300">Requires <code class="font-mono text-xs">Authorization: Bearer &lt;token&gt;</code>.</p>
              </div>
            </div>
          </div>
        </section>
        <section class="mb-16" id="roles">
          <h3 class="text-2xl font-bold text-slate-900 dark:text-white">User Roles</h3>
          <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div class="rounded-xl border border-slate-200 bg-white p-5 hover:border-primary/30 transition-colors dark:border-slate-800 dark:bg-slate-950">
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">shield_person</span>
                <h4 class="font-bold text-slate-900 dark:text-white">Super User</h4>
              </div>
              <p class="mt-2 text-sm text-slate-500 italic dark:text-slate-400">Full access to conversions, billing, admin checks, user role changes, and permission management.</p>
            </div>
            <div class="rounded-xl border border-slate-200 bg-white p-5 hover:border-primary/30 transition-colors dark:border-slate-800 dark:bg-slate-950">
              <div class="flex items-center gap-3">
                <span
                  class="material-symbols-outlined text-slate-600 bg-slate-100 p-2 rounded-lg dark:bg-slate-800 dark:text-slate-300">manage_accounts</span>
                <h4 class="font-bold text-slate-900 dark:text-white">Admin</h4>
              </div>
              <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Manage general and demo users, top up points, and inspect user activity and permissions.</p>
            </div>
            <div class="rounded-xl border border-slate-200 bg-white p-5 hover:border-primary/30 transition-colors dark:border-slate-800 dark:bg-slate-950">
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-slate-600 bg-slate-100 p-2 rounded-lg dark:bg-slate-800 dark:text-slate-300">person</span>
                <h4 class="font-bold text-slate-900 dark:text-white">General</h4>
              </div>
              <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Can perform allowed conversions, read dashboard data, check points, and view own history.</p>
            </div>
            <div class="rounded-xl border border-slate-200 bg-white p-5 hover:border-primary/30 transition-colors dark:border-slate-800 dark:bg-slate-950">
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-slate-600 bg-slate-100 p-2 rounded-lg dark:bg-slate-800 dark:text-slate-300">visibility</span>
                <h4 class="font-bold text-slate-900 dark:text-white">Demo</h4>
              </div>
              <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Read-only mode for protected write actions. Demo users cannot create conversion jobs.</p>
            </div>
          </div>
        </section>
        <section class="mb-16" id="converter">
          <h3 class="text-2xl font-bold text-slate-900 dark:text-white mb-8">Conversion Endpoints</h3>
          <div class="rounded-xl border border-slate-200 bg-white overflow-hidden mb-6 dark:border-slate-800 dark:bg-slate-950">
            <div class="flex flex-wrap items-center gap-3 bg-slate-50 px-6 py-4 border-b border-slate-200 dark:border-slate-800 dark:bg-slate-900">
              <span
                class="rounded bg-green-600 px-2 py-1 text-[10px] font-bold text-white uppercase tracking-wider">POST</span>
              <code class="text-sm font-bold text-slate-700 dark:text-slate-200">/api/v3/conversions/pdf-to-word</code>
              <span class="ml-auto text-xs text-slate-400 dark:text-slate-500">Convert PDF to DOCX</span>
            </div>
            <div class="p-6">
              <h5 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 dark:text-slate-500">Body Parameters</h5>
              <div class="space-y-4">
                <div class="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="font-mono text-sm text-slate-900 font-bold dark:text-white">file</span>
                      <span class="text-[10px] text-red-500 font-bold">REQUIRED</span>
                    </div>
                    <p class="text-xs text-slate-500 mt-1 dark:text-slate-400">Upload PDF file as multipart form data.</p>
                  </div>
                  <span class="text-xs text-slate-400 dark:text-slate-500">UploadFile</span>
                </div>
                <div class="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="font-mono text-sm text-slate-900 font-bold dark:text-white">Idempotency-Key</span>
                    </div>
                    <p class="text-xs text-slate-500 mt-1 dark:text-slate-400">Optional request header recommended for safe retries on v3 conversion POST calls.</p>
                  </div>
                  <span class="text-xs text-slate-400 dark:text-slate-500">header</span>
                </div>
                <div class="flex items-start justify-between">
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="font-mono text-sm text-slate-900 font-bold dark:text-white">points_charged</span>
                    </div>
                    <p class="text-xs text-slate-500 mt-1 dark:text-slate-400">Successful conversions charge the flat per-request points rule for non-super users.</p>
                  </div>
                  <span class="text-xs text-slate-400 dark:text-slate-500">integer</span>
                </div>
              </div>
            </div>
          </div>
          <div class="rounded-xl border border-slate-200 bg-white overflow-hidden mb-6 dark:border-slate-800 dark:bg-slate-950">
            <div class="flex flex-wrap items-center gap-3 bg-slate-50 px-6 py-4 border-b border-slate-200 dark:border-slate-800 dark:bg-slate-900">
              <span
                class="rounded bg-blue-600 px-2 py-1 text-[10px] font-bold text-white uppercase tracking-wider">GET</span>
              <code class="text-sm font-bold text-slate-700 dark:text-slate-200">/api/v3/conversions/history</code>
              <span class="ml-auto text-xs text-slate-400 dark:text-slate-500">Read conversion history</span>
            </div>
            <div class="p-6">
              <p class="text-sm text-slate-600 dark:text-slate-300">Query params: <code class="font-mono text-xs">limit</code> and optional
                <code class="font-mono text-xs">user_id</code> for super users.</p>
            </div>
          </div>
          <div class="rounded-xl border border-slate-200 bg-white overflow-hidden mb-6 dark:border-slate-800 dark:bg-slate-950">
            <div class="flex flex-wrap items-center gap-3 bg-slate-50 px-6 py-4 border-b border-slate-200 dark:border-slate-800 dark:bg-slate-900">
              <span
                class="rounded bg-blue-600 px-2 py-1 text-[10px] font-bold text-white uppercase tracking-wider">GET</span>
              <code class="text-sm font-bold text-slate-700 dark:text-slate-200">/api/v3/conversions/&lt;conversion_id&gt;/download</code>
              <span class="ml-auto text-xs text-slate-400 dark:text-slate-500">Download one completed output file</span>
            </div>
            <div class="p-6">
              <p class="text-sm text-slate-600 dark:text-slate-300">Downloads the generated file for a successful owned conversion.</p>
            </div>
          </div>
          <div class="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
            <h4 class="text-sm font-bold text-slate-900 uppercase tracking-tight dark:text-white">Available v3 Conversion Routes</h4>
            <div class="mt-4 grid gap-3 sm:grid-cols-2">
              <code class="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700 dark:bg-slate-900 dark:text-slate-300">POST /api/v3/conversions/pdf-to-word</code>
              <code class="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700 dark:bg-slate-900 dark:text-slate-300">POST /api/v3/conversions/pdf-to-excel</code>
              <code class="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700 dark:bg-slate-900 dark:text-slate-300">POST /api/v3/conversions/docx-to-pdf</code>
              <code class="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700 dark:bg-slate-900 dark:text-slate-300">POST /api/v3/conversions/excel-to-pdf</code>
              <code class="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700 dark:bg-slate-900 dark:text-slate-300">POST /api/v3/conversions/image-to-pdf</code>
              <code class="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700 dark:bg-slate-900 dark:text-slate-300">POST /api/v3/conversions/remove-pages-from-pdf</code>
              <code class="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700 dark:bg-slate-900 dark:text-slate-300">POST /api/v3/conversions/remove-background</code>
              <code class="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700 dark:bg-slate-900 dark:text-slate-300">GET /api/v3/conversions/*/files/history</code>
            </div>
          </div>
        </section>
        <section class="mb-16" id="users">
          <h3 class="text-2xl font-bold text-slate-900 dark:text-white mb-8">User, Points, Permissions And Admin Endpoints</h3>
          <div class="space-y-4">
            <div class="rounded-xl border border-slate-200 bg-white overflow-hidden dark:border-slate-800 dark:bg-slate-950">
              <div class="flex flex-wrap items-center gap-3 bg-slate-50 px-6 py-4 border-b border-slate-200 dark:border-slate-800 dark:bg-slate-900">
                <span class="rounded bg-green-600 px-2 py-1 text-[10px] font-bold text-white uppercase tracking-wider">POST</span>
                <code class="text-sm font-bold text-slate-700 dark:text-slate-200">/api/v2/users</code>
                <span class="ml-auto text-xs text-slate-400 dark:text-slate-500">Create user</span>
              </div>
              <div class="p-6"><p class="text-sm text-slate-600 dark:text-slate-300">Admin or super user only.</p></div>
            </div>
            <div class="rounded-xl border border-slate-200 bg-white overflow-hidden dark:border-slate-800 dark:bg-slate-950">
              <div class="flex flex-wrap items-center gap-3 bg-slate-50 px-6 py-4 border-b border-slate-200 dark:border-slate-800 dark:bg-slate-900">
                <span class="rounded bg-blue-600 px-2 py-1 text-[10px] font-bold text-white uppercase tracking-wider">GET</span>
                <code class="text-sm font-bold text-slate-700 dark:text-slate-200">/api/v2/users</code>
                <span class="ml-auto text-xs text-slate-400 dark:text-slate-500">List users</span>
              </div>
              <div class="p-6"><p class="text-sm text-slate-600 dark:text-slate-300">Returns an array of <code class="font-mono text-xs">UserOut</code>.</p></div>
            </div>
            <div class="rounded-xl border border-slate-200 bg-white overflow-hidden dark:border-slate-800 dark:bg-slate-950">
              <div class="flex flex-wrap items-center gap-3 bg-slate-50 px-6 py-4 border-b border-slate-200 dark:border-slate-800 dark:bg-slate-900">
                <span class="rounded bg-fuchsia-600 px-2 py-1 text-[10px] font-bold text-white uppercase tracking-wider">PATCH</span>
                <code class="text-sm font-bold text-slate-700 dark:text-slate-200">/api/v2/users/&lt;user_id&gt;/role</code>
                <span class="ml-auto text-xs text-slate-400 dark:text-slate-500">Update user role</span>
              </div>
              <div class="p-6"><p class="text-sm text-slate-600 dark:text-slate-300">Super user only.</p></div>
            </div>
            <div class="rounded-xl border border-slate-200 bg-white overflow-hidden dark:border-slate-800 dark:bg-slate-950">
              <div class="flex flex-wrap items-center gap-3 bg-slate-50 px-6 py-4 border-b border-slate-200 dark:border-slate-800 dark:bg-slate-900">
                <span class="rounded bg-blue-600 px-2 py-1 text-[10px] font-bold text-white uppercase tracking-wider">GET</span>
                <code class="text-sm font-bold text-slate-700 dark:text-slate-200">/api/v3/points/balance</code>
                <span class="ml-auto text-xs text-slate-400 dark:text-slate-500">Get points balance</span>
              </div>
              <div class="p-6"><p class="text-sm text-slate-600 dark:text-slate-300">Other points routes:
                <code class="font-mono text-xs"> /api/v3/points/ledger</code>,
                <code class="font-mono text-xs"> /api/v3/points/topup</code>,
                <code class="font-mono text-xs"> /api/v3/points/rules</code>,
                <code class="font-mono text-xs"> /api/v3/points/my-point</code>.</p></div>
            </div>
            <div class="rounded-xl border border-slate-200 bg-white overflow-hidden dark:border-slate-800 dark:bg-slate-950">
              <div class="flex flex-wrap items-center gap-3 bg-slate-50 px-6 py-4 border-b border-slate-200 dark:border-slate-800 dark:bg-slate-900">
                <span class="rounded bg-blue-600 px-2 py-1 text-[10px] font-bold text-white uppercase tracking-wider">GET</span>
                <code class="text-sm font-bold text-slate-700 dark:text-slate-200">/api/v3/permissions/actions</code>
                <span class="ml-auto text-xs text-slate-400 dark:text-slate-500">List available conversion actions</span>
              </div>
              <div class="p-6"><p class="text-sm text-slate-600 dark:text-slate-300">Also available:
                <code class="font-mono text-xs"> /api/v3/permissions/my-api</code>,
                <code class="font-mono text-xs"> /api/v3/permissions/users/&lt;user_id&gt;/permissions</code>,
                <code class="font-mono text-xs"> /api/v3/permissions/users/&lt;user_id&gt;/permissions/&lt;action&gt;</code>.</p></div>
            </div>
            <div class="rounded-xl border border-slate-200 bg-white overflow-hidden dark:border-slate-800 dark:bg-slate-950">
              <div class="flex flex-wrap items-center gap-3 bg-slate-50 px-6 py-4 border-b border-slate-200 dark:border-slate-800 dark:bg-slate-900">
                <span class="rounded bg-blue-600 px-2 py-1 text-[10px] font-bold text-white uppercase tracking-wider">GET</span>
                <code class="text-sm font-bold text-slate-700 dark:text-slate-200">/api/v3/dashboard/overview</code>
                <span class="ml-auto text-xs text-slate-400 dark:text-slate-500">Dashboard overview</span>
              </div>
              <div class="p-6"><p class="text-sm text-slate-600 dark:text-slate-300">Summaries, active APIs, performance, and recent history for the current user.</p></div>
            </div>
            <div class="rounded-xl border border-slate-200 bg-white overflow-hidden dark:border-slate-800 dark:bg-slate-950">
              <div class="flex flex-wrap items-center gap-3 bg-slate-50 px-6 py-4 border-b border-slate-200 dark:border-slate-800 dark:bg-slate-900">
                <span class="rounded bg-blue-600 px-2 py-1 text-[10px] font-bold text-white uppercase tracking-wider">GET</span>
                <code class="text-sm font-bold text-slate-700 dark:text-slate-200">/api/v3/admin/active-users</code>
                <span class="ml-auto text-xs text-slate-400 dark:text-slate-500">Admin active users list</span>
              </div>
              <div class="p-6"><p class="text-sm text-slate-600 dark:text-slate-300">Other admin routes:
                <code class="font-mono text-xs"> /api/v3/admin/points/giving-history</code> and
                <code class="font-mono text-xs"> /api/v3/admin/check-users/&lt;user_id&gt;</code>.</p></div>
            </div>
          </div>
        </section>
        <section class="mb-16" id="errors">
          <h3 class="text-2xl font-bold text-slate-900 dark:text-white mb-6">Error Handling</h3>
          <div class="space-y-4">
            <div class="flex gap-4 rounded-xl border-l-4 border-orange-500 bg-orange-50 p-4 dark:bg-orange-500/10">
              <span class="material-symbols-outlined text-orange-600">warning</span>
              <div>
                <h5 class="text-sm font-bold text-orange-900 dark:text-orange-200">401 Unauthorized</h5>
                <p class="text-sm text-orange-700 dark:text-orange-300">Invalid or missing bearer token.</p>
              </div>
            </div>
            <div class="flex gap-4 rounded-xl border-l-4 border-red-500 bg-red-50 p-4 dark:bg-red-500/10">
              <span class="material-symbols-outlined text-red-600">block</span>
              <div>
                <h5 class="text-sm font-bold text-red-900 dark:text-red-200">403 Forbidden</h5>
                <p class="text-sm text-red-700 dark:text-red-300">Conversion not permitted, role blocked, or insufficient role privileges.</p>
              </div>
            </div>
            <div class="flex gap-4 rounded-xl border-l-4 border-purple-500 bg-purple-50 p-4 dark:bg-purple-500/10">
              <span class="material-symbols-outlined text-purple-600">hourglass_top</span>
              <div>
                <h5 class="text-sm font-bold text-purple-900 dark:text-purple-200">402 Payment Required</h5>
                <p class="text-sm text-purple-700 dark:text-purple-300">Raised by the backend when the user has insufficient points for a conversion request.</p>
              </div>
            </div>
            <div class="flex gap-4 rounded-xl border-l-4 border-sky-500 bg-sky-50 p-4 dark:bg-sky-500/10">
              <span class="material-symbols-outlined text-sky-600">rule</span>
              <div>
                <h5 class="text-sm font-bold text-sky-900 dark:text-sky-200">422 Validation Error</h5>
                <p class="text-sm text-sky-700 dark:text-sky-300">Input payload, file upload, or query parameter validation failed.</p>
              </div>
            </div>
          </div>
        </section>
        <section class="mb-16" id="rate-limits">
          <h3 class="text-2xl font-bold text-slate-900 dark:text-white mb-6">Rate Limits</h3>
          <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
            <table class="min-w-[720px] w-full text-left text-sm">
              <thead class="bg-slate-50 text-xs font-bold uppercase text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                <tr>
                  <th class="px-6 py-4">Scope</th>
                  <th class="px-6 py-4">Current Docs Note</th>
                  <th class="px-6 py-4">Behavior</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                <tr>
                  <td class="px-6 py-4 font-medium text-slate-900 dark:text-white">v3 Conversions</td>
                  <td class="px-6 py-4 text-slate-600 dark:text-slate-300">Point-based charging</td>
                  <td class="px-6 py-4 text-slate-600 dark:text-slate-300">Each successful request uses the flat cost returned by <code class="font-mono text-xs">/api/v3/points/rules</code>.</td>
                </tr>
                <tr>
                  <td class="px-6 py-4 font-medium text-slate-900 dark:text-white">Retry Safety</td>
                  <td class="px-6 py-4 text-slate-600 dark:text-slate-300">Idempotency supported</td>
                  <td class="px-6 py-4 text-slate-600 dark:text-slate-300">Use <code class="font-mono text-xs">Idempotency-Key</code> on v3 POST conversions to prevent duplicate charges.</td>
                </tr>
                <tr>
                  <td class="px-6 py-4 font-medium text-slate-900 dark:text-white">Admin Reads</td>
                  <td class="px-6 py-4 text-slate-600 dark:text-slate-300">Role-gated</td>
                  <td class="px-6 py-4 text-slate-600 dark:text-slate-300">Admin and super user access depends on backend role checks rather than public anonymous limits.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
    <aside
      class="fixed right-0 top-0 hidden h-screen w-[400px] flex-col border-l border-slate-200 bg-slate-50 pt-24 dark:border-slate-800 dark:bg-slate-900 xl:flex">
      <div class="flex items-center justify-between border-b border-slate-200 bg-white/70 px-6 py-4 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/70">
        <div>
          <p class="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">Interactive Panel</p>
          <h4 class="mt-1 text-sm font-bold text-slate-900 uppercase tracking-tight dark:text-white">Try It Now</h4>
        </div>
        <div class="flex gap-1">
          <button class="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"><span
              class="material-symbols-outlined text-lg">settings</span></button>
          <button class="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"><span
              class="material-symbols-outlined text-lg">close</span></button>
        </div>
      </div>
      <div class="flex-1 overflow-y-auto px-6 py-6">
        <div class="space-y-5">
          <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-950 dark:shadow-none">
            <label class="mb-3 block text-xs font-bold uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">Endpoint</label>
          <div class="relative">
            <select
              class="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-10 text-sm font-medium text-slate-700 focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white">
              <option>POST /api/v3/conversions/pdf-to-word</option>
              <option>GET /api/v3/conversions/history</option>
              <option>POST /api/v2/auth/login</option>
            </select>
            <span
              class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-500">expand_more</span>
          </div>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-950 dark:shadow-none">
            <div class="mb-3 flex items-center justify-between">
              <label class="text-xs font-bold uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">Headers</label>
              <button class="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold tracking-wide text-primary transition-colors hover:bg-primary/15">+ ADD HEADER</button>
            </div>
            <div class="space-y-3">
              <div class="flex gap-2">
                <input class="w-[38%] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300" disabled="" type="text"
                value="Authorization" />
                <input class="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-white" type="text" value="Bearer {{token}}" />
              </div>
              <div class="flex gap-2">
                <input class="w-[38%] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300" disabled="" type="text"
                value="Idempotency-Key" />
                <input class="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-white" type="text" value="550e8400-e29b-41d4-a716-446655440000" />
              </div>
            </div>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-950 dark:shadow-none">
            <div class="mb-3 flex items-center justify-between">
              <label class="text-xs font-bold uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">Request Body</label>
              <span class="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-300">multipart/form-data</span>
            </div>
            <div class="rounded-2xl border border-slate-800 bg-[#0f172a] p-4 shadow-inner shadow-black/20">
              <pre class="whitespace-pre-wrap break-words text-xs font-mono leading-6 text-slate-200"><code>{
  <span class="text-amber-300">"file"</span>: <span class="text-emerald-400">"(multipart upload)"</span>,
  <span class="text-amber-300">"endpoint"</span>: <span class="text-sky-400">"/api/v3/conversions/pdf-to-word"</span>
}</code></pre>
            </div>
          </div>
          <button
            class="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/30 transition-all hover:translate-y-[-1px] hover:bg-primary/90">
            <span class="material-symbols-outlined text-lg">play_arrow</span> SEND REQUEST
          </button>
          <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-950 dark:shadow-none">
            <div class="mb-3 flex items-center justify-between">
              <label class="text-xs font-bold uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">Response</label>
              <span class="rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-bold tracking-wide text-green-600 dark:bg-green-500/10 dark:text-green-300">200 OK</span>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 h-48 overflow-y-auto dark:border-slate-700 dark:bg-slate-900">
              <pre class="text-xs font-mono leading-6 text-slate-600 dark:text-slate-300"><code>{
  "conversion_id": 214,
  "status": "success",
  "download_url": "/api/v3/conversions/214/download",
  "points_charged": 3,
  "remaining_balance": 97
}</code></pre>
            </div>
          </div>
        </div>
      </div>
      <div class="border-t border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
        <div class="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
          <div class="flex size-10 items-center justify-center rounded-full bg-primary/10">
            <span class="material-symbols-outlined text-primary text-sm">terminal</span>
          </div>
          <div>
            <p class="text-[10px] font-bold text-slate-400 uppercase leading-none dark:text-slate-500">Environment</p>
            <p class="mt-1 text-xs font-bold text-slate-900 leading-tight dark:text-white">Local API</p>
          </div>
          <span class="material-symbols-outlined ml-auto text-slate-400 dark:text-slate-500">expand_more</span>
        </div>
      </div>
    </aside>
  </div>
  <footer class="border-t border-slate-200 bg-white py-8 dark:border-slate-800 dark:bg-slate-950">
    <div class="mx-auto max-w-7xl px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
      <div class="flex items-center gap-4 text-slate-400 text-sm dark:text-slate-500">
        <span>© 2024 ConvertPro Inc.</span>
        <span class="size-1 rounded-full bg-slate-300"></span>
        <a class="hover:text-primary" href="#">Privacy</a>
        <span class="size-1 rounded-full bg-slate-300"></span>
        <a class="hover:text-primary" href="#">Terms</a>
      </div>
      <div class="flex gap-4">
        <a class="size-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:text-primary hover:bg-primary/10"
          href="#">
          <svg class="size-4" fill="currentColor" viewbox="0 0 24 24">
            <path
              d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z">
            </path>
          </svg>
        </a>
        <a class="size-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:text-primary hover:bg-primary/10"
          href="#">
          <svg class="size-4" fill="currentColor" viewbox="0 0 24 24">
            <path
              d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z">
            </path>
          </svg>
        </a>
      </div>
    </div>
  </footer>
`;
  return (
    <div className="bg-background-light text-slate-900 font-display">
      <div dangerouslySetInnerHTML={{ __html: markup }} />
    </div>
  );
}
