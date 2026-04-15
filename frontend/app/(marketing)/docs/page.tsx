export default function Page() {
  const markup = `
  <div class="flex min-h-screen items-start  pt-32 [html[data-theme='sunset']_&]:bg-[#451a03] sm:pt-28 md:pt-32">
    <aside class="fixed left-0 top-0 hidden h-screen w-64 overflow-y-auto border-r border-slate-200 bg-white px-6 pb-8 pt-32 [html[data-theme='sunset']_&]:border-[#9a3412] [html[data-theme='sunset']_&]:bg-[#7c2d12] sm:pt-28 md:pt-32 lg:block">
      <div class="space-y-8">
        <div>
          <h5 class="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400 [html[data-theme='sunset']_&]:text-[#fed7aa]/60">Getting Started</h5>
          <ul class="space-y-2">
            <li><a class="flex items-center gap-2 text-sm font-medium text-primary" href="#introduction"><span class="material-symbols-outlined text-lg">info</span> Introduction</a></li>
            <li><a class="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary [html[data-theme='sunset']_&]:text-[#fed7aa]/80" href="#authentication"><span class="material-symbols-outlined text-lg">lock</span> Authentication</a></li>
            <li><a class="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary [html[data-theme='sunset']_&]:text-[#fed7aa]/80" href="#base-url"><span class="material-symbols-outlined text-lg">link</span> Base URL</a></li>
            <li><a class="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary [html[data-theme='sunset']_&]:text-[#fed7aa]/80" href="#versioning"><span class="material-symbols-outlined text-lg">history</span> Versioning</a></li>
          </ul>
        </div>
        <div>
          <h5 class="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400 [html[data-theme='sunset']_&]:text-[#fed7aa]/60">API Reference</h5>
          <ul class="space-y-2">
            <li><a class="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary [html[data-theme='sunset']_&]:text-[#fed7aa]/80" href="#auth-endpoints"><span class="material-symbols-outlined text-lg">fingerprint</span> Auth Endpoints</a></li>
            <li><a class="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary [html[data-theme='sunset']_&]:text-[#fed7aa]/80" href="#converter"><span class="material-symbols-outlined text-lg">transform</span> Converter</a></li>
            <li><a class="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary [html[data-theme='sunset']_&]:text-[#fed7aa]/80" href="#users"><span class="material-symbols-outlined text-lg">group</span> Users</a></li>
            <li><a class="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary [html[data-theme='sunset']_&]:text-[#fed7aa]/80" href="#errors"><span class="material-symbols-outlined text-lg">error</span> Error Codes</a></li>
          </ul>
        </div>
        <div>
          <h5 class="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400 [html[data-theme='sunset']_&]:text-[#fed7aa]/60">Resources</h5>
          <ul class="space-y-2">
            <li><a class="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary [html[data-theme='sunset']_&]:text-[#fed7aa]/80" href="#roles"><span class="material-symbols-outlined text-lg">badge</span> Roles</a></li>
            <li><a class="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary [html[data-theme='sunset']_&]:text-[#fed7aa]/80" href="#rate-limits"><span class="material-symbols-outlined text-lg">speed</span> Rate Limits</a></li>
          </ul>
        </div>
      </div>
    </aside>
    <main class="min-w-0 flex-1 bg-white [html[data-theme='sunset']_&]:bg-[#7c2d12] lg:ml-64">
      <div class="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-16 lg:py-12">
        <section class="mb-16" id="introduction">
          <div class="flex items-center gap-2 mb-2">
            <span class="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">v3 Current</span>
          </div>
          <h1 class="text-4xl font-extrabold tracking-tight text-slate-900 [html[data-theme='sunset']_&]:text-[#fed7aa] sm:text-5xl">ConvertPro API Documentation</h1>
          <p class="mt-6 text-lg text-slate-600 leading-relaxed [html[data-theme='sunset']_&]:text-[#fed7aa]/80">
            Welcome to the ConvertPro API. This page covers authentication, endpoints, conversion routes, user management, permissions, points, dashboard, and admin APIs.
          </p>
          <div class="mt-10 rounded-xl border border-slate-200 bg-slate-50 p-6 [html[data-theme='sunset']_&]:border-[#9a3412] [html[data-theme='sunset']_&]:bg-[#451a03]" id="base-url">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h4 class="text-sm font-bold text-slate-900 uppercase tracking-tight [html[data-theme='sunset']_&]:text-[#fed7aa]">Backend Base URL</h4>
                <code class="mt-2 block text-primary font-mono text-sm">http://127.0.0.1:8000</code>
              </div>
              <button class="flex items-center gap-2 rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 [html[data-theme='sunset']_&]:border-[#9a3412] [html[data-theme='sunset']_&]:bg-[#7c2d12] [html[data-theme='sunset']_&]:text-[#fed7aa]/80 [html[data-theme='sunset']_&]:hover:bg-[#9a3412]">
                <span class="material-symbols-outlined text-sm">content_copy</span> Copy
              </button>
            </div>
          </div>
          <div class="mt-6 rounded-xl border border-slate-200 bg-white p-6 [html[data-theme='sunset']_&]:border-[#9a3412] [html[data-theme='sunset']_&]:bg-[#7c2d12]" id="versioning">
            <h4 class="text-sm font-bold text-slate-900 uppercase tracking-tight [html[data-theme='sunset']_&]:text-[#fed7aa]">Versioning</h4>
            <p class="mt-3 text-sm leading-relaxed text-slate-600 [html[data-theme='sunset']_&]:text-[#fed7aa]/80">
              <span class="font-semibold text-slate-900 [html[data-theme='sunset']_&]:text-[#fed7aa]">v3</span> is the current platform API for conversions, points, permissions, dashboard, and admin workflows. 
              <span class="font-semibold text-slate-900 [html[data-theme='sunset']_&]:text-[#fed7aa]">v2</span> handles auth, users, and legacy authenticated converters. 
              <span class="font-semibold text-slate-900 [html[data-theme='sunset']_&]:text-[#fed7aa]">v1</span> remains available for older conversion integrations.
            </p>
          </div>
        </section>
        
        <hr class="border-slate-100 my-16" />
        
        <section class="mb-16" id="authentication">
          <h2 class="text-3xl font-bold tracking-tight text-slate-900 [html[data-theme='sunset']_&]:text-[#fed7aa]">Authentication</h2>
          <p class="mt-4 text-slate-600 [html[data-theme='sunset']_&]:text-[#fed7aa]/80">
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
            <div class="rounded-xl border border-slate-200 bg-white p-6 [html[data-theme='sunset']_&]:border-[#9a3412] [html[data-theme='sunset']_&]:bg-[#7c2d12]">
              <h4 class="text-sm font-bold text-slate-900 [html[data-theme='sunset']_&]:text-[#fed7aa]">Success Response</h4>
              <pre class="code-block mt-4 text-xs text-slate-600 [html[data-theme='sunset']_&]:text-[#fed7aa]/80"><code>{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}</code></pre>
            </div>
          </div>
        </section>
        
        <section class="mb-16" id="auth-endpoints">
          <h3 class="text-2xl font-bold text-slate-900 [html[data-theme='sunset']_&]:text-[#fed7aa] mb-8">Auth Endpoints</h3>
          <div class="space-y-4">
            <div class="rounded-xl border border-slate-200 bg-white overflow-hidden [html[data-theme='sunset']_&]:border-[#9a3412] [html[data-theme='sunset']_&]:bg-[#7c2d12]">
              <div class="flex flex-wrap items-center gap-3 bg-slate-50 px-6 py-4 border-b border-slate-200 [html[data-theme='sunset']_&]:border-[#9a3412] [html[data-theme='sunset']_&]:bg-[#451a03]">
                <span class="rounded bg-green-600 px-2 py-1 text-[10px] font-bold text-white uppercase tracking-wider">POST</span>
                <code class="text-sm font-bold text-slate-700 [html[data-theme='sunset']_&]:text-[#fed7aa]">/api/v2/auth/login</code>
                <span class="ml-auto text-xs text-slate-400 [html[data-theme='sunset']_&]:text-[#fed7aa]/60">Issue access and refresh tokens</span>
              </div>
              <div class="p-6">
                <p class="text-sm text-slate-600 [html[data-theme='sunset']_&]:text-[#fed7aa]/80">Request body: <code class="font-mono text-xs">email</code>, <code class="font-mono text-xs">password</code>.</p>
              </div>
            </div>
            <div class="rounded-xl border border-slate-200 bg-white overflow-hidden [html[data-theme='sunset']_&]:border-[#9a3412] [html[data-theme='sunset']_&]:bg-[#7c2d12]">
              <div class="flex flex-wrap items-center gap-3 bg-slate-50 px-6 py-4 border-b border-slate-200 [html[data-theme='sunset']_&]:border-[#9a3412] [html[data-theme='sunset']_&]:bg-[#451a03]">
                <span class="rounded bg-green-600 px-2 py-1 text-[10px] font-bold text-white uppercase tracking-wider">POST</span>
                <code class="text-sm font-bold text-slate-700 [html[data-theme='sunset']_&]:text-[#fed7aa]">/api/v2/auth/refresh</code>
                <span class="ml-auto text-xs text-slate-400 [html[data-theme='sunset']_&]:text-[#fed7aa]/60">Refresh an access token</span>
              </div>
              <div class="p-6">
                <p class="text-sm text-slate-600 [html[data-theme='sunset']_&]:text-[#fed7aa]/80">Request body: <code class="font-mono text-xs">refresh_token</code>.</p>
              </div>
            </div>
            <div class="rounded-xl border border-slate-200 bg-white overflow-hidden [html[data-theme='sunset']_&]:border-[#9a3412] [html[data-theme='sunset']_&]:bg-[#7c2d12]">
              <div class="flex flex-wrap items-center gap-3 bg-slate-50 px-6 py-4 border-b border-slate-200 [html[data-theme='sunset']_&]:border-[#9a3412] [html[data-theme='sunset']_&]:bg-[#451a03]">
                <span class="rounded bg-blue-600 px-2 py-1 text-[10px] font-bold text-white uppercase tracking-wider">GET</span>
                <code class="text-sm font-bold text-slate-700 [html[data-theme='sunset']_&]:text-[#fed7aa]">/api/v2/auth/me</code>
                <span class="ml-auto text-xs text-slate-400 [html[data-theme='sunset']_&]:text-[#fed7aa]/60">Get current authenticated user</span>
              </div>
              <div class="p-6">
                <p class="text-sm text-slate-600 [html[data-theme='sunset']_&]:text-[#fed7aa]/80">Requires <code class="font-mono text-xs">Authorization: Bearer &lt;token&gt;</code>.</p>
              </div>
            </div>
          </div>
        </section>
        
        <section class="mb-16" id="roles">
          <h3 class="text-2xl font-bold text-slate-900 [html[data-theme='sunset']_&]:text-[#fed7aa]">User Roles</h3>
          <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div class="rounded-xl border border-slate-200 bg-white p-5 hover:border-primary/30 transition-colors [html[data-theme='sunset']_&]:border-[#9a3412] [html[data-theme='sunset']_&]:bg-[#7c2d12]">
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">shield_person</span>
                <h4 class="font-bold text-slate-900 [html[data-theme='sunset']_&]:text-[#fed7aa]">Super User</h4>
              </div>
              <p class="mt-2 text-sm text-slate-500 italic [html[data-theme='sunset']_&]:text-[#fed7aa]/70">Full access to conversions, billing, admin checks, user role changes, and permission management.</p>
            </div>
            <div class="rounded-xl border border-slate-200 bg-white p-5 hover:border-primary/30 transition-colors [html[data-theme='sunset']_&]:border-[#9a3412] [html[data-theme='sunset']_&]:bg-[#7c2d12]">
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-slate-600 bg-slate-100 p-2 rounded-lg [html[data-theme='sunset']_&]:bg-[#9a3412] [html[data-theme='sunset']_&]:text-[#fed7aa]/80">manage_accounts</span>
                <h4 class="font-bold text-slate-900 [html[data-theme='sunset']_&]:text-[#fed7aa]">Admin</h4>
              </div>
              <p class="mt-2 text-sm text-slate-500 [html[data-theme='sunset']_&]:text-[#fed7aa]/70">Manage general and demo users, top up points, and inspect user activity and permissions.</p>
            </div>
            <div class="rounded-xl border border-slate-200 bg-white p-5 hover:border-primary/30 transition-colors [html[data-theme='sunset']_&]:border-[#9a3412] [html[data-theme='sunset']_&]:bg-[#7c2d12]">
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-slate-600 bg-slate-100 p-2 rounded-lg [html[data-theme='sunset']_&]:bg-[#9a3412] [html[data-theme='sunset']_&]:text-[#fed7aa]/80">person</span>
                <h4 class="font-bold text-slate-900 [html[data-theme='sunset']_&]:text-[#fed7aa]">General</h4>
              </div>
              <p class="mt-2 text-sm text-slate-500 [html[data-theme='sunset']_&]:text-[#fed7aa]/70">Can perform allowed conversions, read dashboard data, check points, and view own history.</p>
            </div>
            <div class="rounded-xl border border-slate-200 bg-white p-5 hover:border-primary/30 transition-colors [html[data-theme='sunset']_&]:border-[#9a3412] [html[data-theme='sunset']_&]:bg-[#7c2d12]">
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-slate-600 bg-slate-100 p-2 rounded-lg [html[data-theme='sunset']_&]:bg-[#9a3412] [html[data-theme='sunset']_&]:text-[#fed7aa]/80">visibility</span>
                <h4 class="font-bold text-slate-900 [html[data-theme='sunset']_&]:text-[#fed7aa]">Demo</h4>
              </div>
              <p class="mt-2 text-sm text-slate-500 [html[data-theme='sunset']_&]:text-[#fed7aa]/70">Read-only mode for protected write actions. Demo users cannot create conversion jobs.</p>
            </div>
          </div>
        </section>
        
        <section class="mb-16" id="converter">
          <h3 class="text-2xl font-bold text-slate-900 [html[data-theme='sunset']_&]:text-[#fed7aa] mb-8">Conversion Endpoints</h3>
          <div class="rounded-xl border border-slate-200 bg-white overflow-hidden mb-6 [html[data-theme='sunset']_&]:border-[#9a3412] [html[data-theme='sunset']_&]:bg-[#7c2d12]">
            <div class="flex flex-wrap items-center gap-3 bg-slate-50 px-6 py-4 border-b border-slate-200 [html[data-theme='sunset']_&]:border-[#9a3412] [html[data-theme='sunset']_&]:bg-[#451a03]">
              <span class="rounded bg-green-600 px-2 py-1 text-[10px] font-bold text-white uppercase tracking-wider">POST</span>
              <code class="text-sm font-bold text-slate-700 [html[data-theme='sunset']_&]:text-[#fed7aa]">/api/v3/conversions/pdf-to-word</code>
              <span class="ml-auto text-xs text-slate-400 [html[data-theme='sunset']_&]:text-[#fed7aa]/60">Convert PDF to DOCX</span>
            </div>
            <div class="p-6">
              <h5 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 [html[data-theme='sunset']_&]:text-[#fed7aa]/60">Body Parameters</h5>
              <div class="space-y-4">
                <div class="flex items-start justify-between pb-4 border-b border-slate-100 [html[data-theme='sunset']_&]:border-[#9a3412]">
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="font-mono text-sm text-slate-900 font-bold [html[data-theme='sunset']_&]:text-[#fed7aa]">file</span>
                      <span class="text-[10px] text-red-500 font-bold">REQUIRED</span>
                    </div>
                    <p class="text-xs text-slate-500 mt-1 [html[data-theme='sunset']_&]:text-[#fed7aa]/70">Upload PDF file as multipart form data.</p>
                  </div>
                  <span class="text-xs text-slate-400 [html[data-theme='sunset']_&]:text-[#fed7aa]/60">UploadFile</span>
                </div>
                <div class="flex items-start justify-between pb-4 border-b border-slate-100 [html[data-theme='sunset']_&]:border-[#9a3412]">
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="font-mono text-sm text-slate-900 font-bold [html[data-theme='sunset']_&]:text-[#fed7aa]">Idempotency-Key</span>
                    </div>
                    <p class="text-xs text-slate-500 mt-1 [html[data-theme='sunset']_&]:text-[#fed7aa]/70">Optional request header recommended for safe retries on v3 conversion POST calls.</p>
                  </div>
                  <span class="text-xs text-slate-400 [html[data-theme='sunset']_&]:text-[#fed7aa]/60">header</span>
                </div>
                <div class="flex items-start justify-between">
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="font-mono text-sm text-slate-900 font-bold [html[data-theme='sunset']_&]:text-[#fed7aa]">points_charged</span>
                    </div>
                    <p class="text-xs text-slate-500 mt-1 [html[data-theme='sunset']_&]:text-[#fed7aa]/70">Successful conversions charge the flat per-request points rule for non-super users.</p>
                  </div>
                  <span class="text-xs text-slate-400 [html[data-theme='sunset']_&]:text-[#fed7aa]/60">integer</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="rounded-xl border border-slate-200 bg-white overflow-hidden mb-6 [html[data-theme='sunset']_&]:border-[#9a3412] [html[data-theme='sunset']_&]:bg-[#7c2d12]">
            <div class="flex flex-wrap items-center gap-3 bg-slate-50 px-6 py-4 border-b border-slate-200 [html[data-theme='sunset']_&]:border-[#9a3412] [html[data-theme='sunset']_&]:bg-[#451a03]">
              <span class="rounded bg-blue-600 px-2 py-1 text-[10px] font-bold text-white uppercase tracking-wider">GET</span>
              <code class="text-sm font-bold text-slate-700 [html[data-theme='sunset']_&]:text-[#fed7aa]">/api/v3/conversions/history</code>
              <span class="ml-auto text-xs text-slate-400 [html[data-theme='sunset']_&]:text-[#fed7aa]/60">Read conversion history</span>
            </div>
            <div class="p-6">
              <p class="text-sm text-slate-600 [html[data-theme='sunset']_&]:text-[#fed7aa]/80">Query params: <code class="font-mono text-xs">limit</code> and optional <code class="font-mono text-xs">user_id</code> for super users.</p>
            </div>
          </div>
          
          <div class="rounded-xl border border-slate-200 bg-white overflow-hidden mb-6 [html[data-theme='sunset']_&]:border-[#9a3412] [html[data-theme='sunset']_&]:bg-[#7c2d12]">
            <div class="flex flex-wrap items-center gap-3 bg-slate-50 px-6 py-4 border-b border-slate-200 [html[data-theme='sunset']_&]:border-[#9a3412] [html[data-theme='sunset']_&]:bg-[#451a03]">
              <span class="rounded bg-blue-600 px-2 py-1 text-[10px] font-bold text-white uppercase tracking-wider">GET</span>
              <code class="text-sm font-bold text-slate-700 [html[data-theme='sunset']_&]:text-[#fed7aa]">/api/v3/conversions/&lt;conversion_id&gt;/download</code>
              <span class="ml-auto text-xs text-slate-400 [html[data-theme='sunset']_&]:text-[#fed7aa]/60">Download completed output file</span>
            </div>
            <div class="p-6">
              <p class="text-sm text-slate-600 [html[data-theme='sunset']_&]:text-[#fed7aa]/80">Downloads the generated file for a successful owned conversion.</p>
            </div>
          </div>
          
          <div class="rounded-xl border border-slate-200 bg-white p-6 [html[data-theme='sunset']_&]:border-[#9a3412] [html[data-theme='sunset']_&]:bg-[#7c2d12]">
            <h4 class="text-sm font-bold text-slate-900 uppercase tracking-tight [html[data-theme='sunset']_&]:text-[#fed7aa]">Available v3 Conversion Routes</h4>
            <div class="mt-4 grid gap-3 sm:grid-cols-2">
              <code class="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700 [html[data-theme='sunset']_&]:bg-[#451a03] [html[data-theme='sunset']_&]:text-[#fed7aa]/80">POST /api/v3/conversions/pdf-to-word</code>
              <code class="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700 [html[data-theme='sunset']_&]:bg-[#451a03] [html[data-theme='sunset']_&]:text-[#fed7aa]/80">POST /api/v3/conversions/pdf-to-excel</code>
              <code class="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700 [html[data-theme='sunset']_&]:bg-[#451a03] [html[data-theme='sunset']_&]:text-[#fed7aa]/80">POST /api/v3/conversions/docx-to-pdf</code>
              <code class="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700 [html[data-theme='sunset']_&]:bg-[#451a03] [html[data-theme='sunset']_&]:text-[#fed7aa]/80">POST /api/v3/conversions/excel-to-pdf</code>
              <code class="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700 [html[data-theme='sunset']_&]:bg-[#451a03] [html[data-theme='sunset']_&]:text-[#fed7aa]/80">POST /api/v3/conversions/image-to-pdf</code>
              <code class="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700 [html[data-theme='sunset']_&]:bg-[#451a03] [html[data-theme='sunset']_&]:text-[#fed7aa]/80">POST /api/v3/conversions/remove-pages-from-pdf</code>
              <code class="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700 [html[data-theme='sunset']_&]:bg-[#451a03] [html[data-theme='sunset']_&]:text-[#fed7aa]/80">POST /api/v3/conversions/remove-background</code>
            </div>
          </div>
        </section>
        
        <section class="mb-16" id="users">
          <h3 class="text-2xl font-bold text-slate-900 [html[data-theme='sunset']_&]:text-[#fed7aa] mb-8">User, Points, Permissions And Admin Endpoints</h3>
          <div class="space-y-4">
            <div class="rounded-xl border border-slate-200 bg-white overflow-hidden [html[data-theme='sunset']_&]:border-[#9a3412] [html[data-theme='sunset']_&]:bg-[#7c2d12]">
              <div class="flex flex-wrap items-center gap-3 bg-slate-50 px-6 py-4 border-b border-slate-200 [html[data-theme='sunset']_&]:border-[#9a3412] [html[data-theme='sunset']_&]:bg-[#451a03]">
                <span class="rounded bg-green-600 px-2 py-1 text-[10px] font-bold text-white uppercase tracking-wider">POST</span>
                <code class="text-sm font-bold text-slate-700 [html[data-theme='sunset']_&]:text-[#fed7aa]">/api/v2/users</code>
                <span class="ml-auto text-xs text-slate-400 [html[data-theme='sunset']_&]:text-[#fed7aa]/60">Create user</span>
              </div>
              <div class="p-6"><p class="text-sm text-slate-600 [html[data-theme='sunset']_&]:text-[#fed7aa]/80">Admin or super user only.</p></div>
            </div>
            <div class="rounded-xl border border-slate-200 bg-white overflow-hidden [html[data-theme='sunset']_&]:border-[#9a3412] [html[data-theme='sunset']_&]:bg-[#7c2d12]">
              <div class="flex flex-wrap items-center gap-3 bg-slate-50 px-6 py-4 border-b border-slate-200 [html[data-theme='sunset']_&]:border-[#9a3412] [html[data-theme='sunset']_&]:bg-[#451a03]">
                <span class="rounded bg-blue-600 px-2 py-1 text-[10px] font-bold text-white uppercase tracking-wider">GET</span>
                <code class="text-sm font-bold text-slate-700 [html[data-theme='sunset']_&]:text-[#fed7aa]">/api/v2/users</code>
                <span class="ml-auto text-xs text-slate-400 [html[data-theme='sunset']_&]:text-[#fed7aa]/60">List users</span>
              </div>
              <div class="p-6"><p class="text-sm text-slate-600 [html[data-theme='sunset']_&]:text-[#fed7aa]/80">Returns an array of UserOut.</p></div>
            </div>
            <div class="rounded-xl border border-slate-200 bg-white overflow-hidden [html[data-theme='sunset']_&]:border-[#9a3412] [html[data-theme='sunset']_&]:bg-[#7c2d12]">
              <div class="flex flex-wrap items-center gap-3 bg-slate-50 px-6 py-4 border-b border-slate-200 [html[data-theme='sunset']_&]:border-[#9a3412] [html[data-theme='sunset']_&]:bg-[#451a03]">
                <span class="rounded bg-fuchsia-600 px-2 py-1 text-[10px] font-bold text-white uppercase tracking-wider">PATCH</span>
                <code class="text-sm font-bold text-slate-700 [html[data-theme='sunset']_&]:text-[#fed7aa]">/api/v2/users/&lt;user_id&gt;/role</code>
                <span class="ml-auto text-xs text-slate-400 [html[data-theme='sunset']_&]:text-[#fed7aa]/60">Update user role</span>
              </div>
              <div class="p-6"><p class="text-sm text-slate-600 [html[data-theme='sunset']_&]:text-[#fed7aa]/80">Super user only.</p></div>
            </div>
            <div class="rounded-xl border border-slate-200 bg-white overflow-hidden [html[data-theme='sunset']_&]:border-[#9a3412] [html[data-theme='sunset']_&]:bg-[#7c2d12]">
              <div class="flex flex-wrap items-center gap-3 bg-slate-50 px-6 py-4 border-b border-slate-200 [html[data-theme='sunset']_&]:border-[#9a3412] [html[data-theme='sunset']_&]:bg-[#451a03]">
                <span class="rounded bg-blue-600 px-2 py-1 text-[10px] font-bold text-white uppercase tracking-wider">GET</span>
                <code class="text-sm font-bold text-slate-700 [html[data-theme='sunset']_&]:text-[#fed7aa]">/api/v3/points/balance</code>
                <span class="ml-auto text-xs text-slate-400 [html[data-theme='sunset']_&]:text-[#fed7aa]/60">Get points balance</span>
              </div>
              <div class="p-6"><p class="text-sm text-slate-600 [html[data-theme='sunset']_&]:text-[#fed7aa]/80">Other points routes: /api/v3/points/ledger, /api/v3/points/topup, /api/v3/points/rules, /api/v3/points/my-point.</p></div>
            </div>
          </div>
        </section>
        
        <section class="mb-16" id="errors">
          <h3 class="text-2xl font-bold text-slate-900 [html[data-theme='sunset']_&]:text-[#fed7aa] mb-6">Error Handling</h3>
          <div class="space-y-4">
            <div class="flex gap-4 rounded-xl border-l-4 border-orange-500 bg-orange-50 p-4 [html[data-theme='sunset']_&]:bg-orange-500/10">
              <span class="material-symbols-outlined text-orange-600">warning</span>
              <div>
                <h5 class="text-sm font-bold text-orange-900 [html[data-theme='sunset']_&]:text-orange-200">401 Unauthorized</h5>
                <p class="text-sm text-orange-700 [html[data-theme='sunset']_&]:text-orange-300">Invalid or missing bearer token.</p>
              </div>
            </div>
            <div class="flex gap-4 rounded-xl border-l-4 border-red-500 bg-red-50 p-4 [html[data-theme='sunset']_&]:bg-red-500/10">
              <span class="material-symbols-outlined text-red-600">block</span>
              <div>
                <h5 class="text-sm font-bold text-red-900 [html[data-theme='sunset']_&]:text-red-200">403 Forbidden</h5>
                <p class="text-sm text-red-700 [html[data-theme='sunset']_&]:text-red-300">Conversion not permitted, role blocked, or insufficient role privileges.</p>
              </div>
            </div>
            <div class="flex gap-4 rounded-xl border-l-4 border-purple-500 bg-purple-50 p-4 [html[data-theme='sunset']_&]:bg-purple-500/10">
              <span class="material-symbols-outlined text-purple-600">hourglass_top</span>
              <div>
                <h5 class="text-sm font-bold text-purple-900 [html[data-theme='sunset']_&]:text-purple-200">402 Payment Required</h5>
                <p class="text-sm text-purple-700 [html[data-theme='sunset']_&]:text-purple-300">Raised when the user has insufficient points for a conversion request.</p>
              </div>
            </div>
            <div class="flex gap-4 rounded-xl border-l-4 border-sky-500 bg-sky-50 p-4 [html[data-theme='sunset']_&]:bg-sky-500/10">
              <span class="material-symbols-outlined text-sky-600">rule</span>
              <div>
                <h5 class="text-sm font-bold text-sky-900 [html[data-theme='sunset']_&]:text-sky-200">422 Validation Error</h5>
                <p class="text-sm text-sky-700 [html[data-theme='sunset']_&]:text-sky-300">Input payload, file upload, or query parameter validation failed.</p>
              </div>
            </div>
          </div>
        </section>
        
        <section class="mb-16" id="rate-limits">
          <h3 class="text-2xl font-bold text-slate-900 [html[data-theme='sunset']_&]:text-[#fed7aa] mb-6">Rate Limits</h3>
          <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white [html[data-theme='sunset']_&]:border-[#9a3412] [html[data-theme='sunset']_&]:bg-[#7c2d12]">
            <table class="min-w-[720px] w-full text-left text-sm">
              <thead class="bg-slate-50 text-xs font-bold uppercase text-slate-500 [html[data-theme='sunset']_&]:bg-[#451a03] [html[data-theme='sunset']_&]:text-[#fed7aa]/70">
                <tr>
                  <th class="px-6 py-4">Scope</th>
                  <th class="px-6 py-4">Current Docs Note</th>
                  <th class="px-6 py-4">Behavior</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 [html[data-theme='sunset']_&]:divide-[#9a3412]">
                <tr>
                  <td class="px-6 py-4 font-medium text-slate-900 [html[data-theme='sunset']_&]:text-[#fed7aa]">v3 Conversions</td>
                  <td class="px-6 py-4 text-slate-600 [html[data-theme='sunset']_&]:text-[#fed7aa]/80">Point-based charging</td>
                  <td class="px-6 py-4 text-slate-600 [html[data-theme='sunset']_&]:text-[#fed7aa]/80">Each successful request uses the flat cost returned by /api/v3/points/rules.</td>
                </tr>
                <tr>
                  <td class="px-6 py-4 font-medium text-slate-900 [html[data-theme='sunset']_&]:text-[#fed7aa]">Retry Safety</td>
                  <td class="px-6 py-4 text-slate-600 [html[data-theme='sunset']_&]:text-[#fed7aa]/80">Idempotency supported</td>
                  <td class="px-6 py-4 text-slate-600 [html[data-theme='sunset']_&]:text-[#fed7aa]/80">Use Idempotency-Key on v3 POST conversions to prevent duplicate charges.</td>
                </tr>
                <tr>
                  <td class="px-6 py-4 font-medium text-slate-900 [html[data-theme='sunset']_&]:text-[#fed7aa]">Admin Reads</td>
                  <td class="px-6 py-4 text-slate-600 [html[data-theme='sunset']_&]:text-[#fed7aa]/80">Role-gated</td>
                  <td class="px-6 py-4 text-slate-600 [html[data-theme='sunset']_&]:text-[#fed7aa]/80">Admin and super user access depends on backend role checks.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
    
    <aside class="fixed right-0 top-0 hidden h-screen w-[400px] flex-col border-l border-slate-200 bg-slate-50 pt-32 [html[data-theme='sunset']_&]:border-[#9a3412] [html[data-theme='sunset']_&]:bg-[#451a03] sm:pt-28 md:pt-32 xl:flex">
      <div class="flex h-full flex-col px-6 py-6">
        <div class="flex-1 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm [html[data-theme='sunset']_&]:border-[#9a3412] [html[data-theme='sunset']_&]:bg-[#7c2d12]">
          <label class="mb-2 block text-xs font-bold uppercase tracking-[0.24em] text-slate-400 [html[data-theme='sunset']_&]:text-[#fed7aa]/60">Endpoint</label>
          <div class="relative mb-4">
            <select class="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 pr-8 text-xs font-medium text-slate-700 focus:border-primary focus:ring-primary [html[data-theme='sunset']_&]:border-[#9a3412] [html[data-theme='sunset']_&]:bg-[#451a03] [html[data-theme='sunset']_&]:text-[#fed7aa]">
              <option>POST /api/v3/conversions/pdf-to-word</option>
              <option>GET /api/v3/conversions/history</option>
              <option>POST /api/v2/auth/login</option>
              <option>GET /api/v2/auth/me</option>
              <option>POST /api/v2/users</option>
              <option>GET /api/v3/points/balance</option>
            </select>
            <span class="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-sm text-slate-400 [html[data-theme='sunset']_&]:text-[#fed7aa]/60">expand_more</span>
          </div>
          
          <label class="mb-2 block text-xs font-bold uppercase tracking-[0.24em] text-slate-400 [html[data-theme='sunset']_&]:text-[#fed7aa]/60">Authorization</label>
          <input class="mb-4 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 placeholder:text-slate-400 [html[data-theme='sunset']_&]:border-[#9a3412] [html[data-theme='sunset']_&]:bg-[#451a03] [html[data-theme='sunset']_&]:text-[#fed7aa]" type="text" placeholder="Bearer token" value="Bearer eyJhbGc..." />
          
          <label class="mb-2 block text-xs font-bold uppercase tracking-[0.24em] text-slate-400 [html[data-theme='sunset']_&]:text-[#fed7aa]/60">Request Body</label>
          <textarea class="mb-4 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-700 placeholder:text-slate-400 [html[data-theme='sunset']_&]:border-[#9a3412] [html[data-theme='sunset']_&]:bg-[#451a03] [html[data-theme='sunset']_&]:text-[#fed7aa]" rows="4" placeholder='{"email": "user@example.com", "password": "..."}'>{
  "file": "(upload)",
  "idempotency_key": "uuid"
}</textarea>
          
          <button class="mb-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary/90">
            <span class="material-symbols-outlined text-base">play_arrow</span> Send Request
          </button>
          
          <div class="flex items-center justify-between mb-2">
            <label class="text-xs font-bold uppercase tracking-[0.24em] text-slate-400 [html[data-theme='sunset']_&]:text-[#fed7aa]/60">Response</label>
            <span class="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-600 [html[data-theme='sunset']_&]:bg-green-500/10 [html[data-theme='sunset']_&]:text-green-300">200 OK</span>
          </div>
          <div class="rounded-lg border border-slate-200 bg-slate-50 p-3 [html[data-theme='sunset']_&]:border-[#9a3412] [html[data-theme='sunset']_&]:bg-[#451a03]">
            <pre class="whitespace-pre-wrap break-words text-[11px] font-mono leading-5 text-slate-600 [html[data-theme='sunset']_&]:text-[#fed7aa]/80"><code>{
  "conversion_id": 214,
  "status": "success",
  "download_url": "/api/v3/conversions/214/download",
  "points_charged": 3,
  "remaining_balance": 97
}</code></pre>
          </div>
        </div>
        
        <div class="mt-4 flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-2.5 [html[data-theme='sunset']_&]:border-[#9a3412] [html[data-theme='sunset']_&]:bg-[#7c2d12]">
          <div class="flex size-8 items-center justify-center rounded-full bg-primary/10">
            <span class="material-symbols-outlined text-primary text-sm">terminal</span>
          </div>
          <div>
            <p class="text-[9px] font-bold text-slate-400 uppercase leading-none [html[data-theme='sunset']_&]:text-[#fed7aa]/60">Environment</p>
            <p class="mt-0.5 text-xs font-bold text-slate-900 leading-tight [html[data-theme='sunset']_&]:text-[#fed7aa]">Local API</p>
          </div>
        </div>
      </div>
    </aside>
  </div>
`;
  return (
    <div className=" text-slate-900 font-display">
      <div dangerouslySetInnerHTML={{ __html: markup }} />
    </div>
  );
}
