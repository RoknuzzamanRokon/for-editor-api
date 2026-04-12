export default function Page() {
  const markup = `
<!-- Navigation Bar -->
    <header
        class="fixed inset-x-0 top-0 z-50 w-full border-b border-slate-200/60 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-background-dark/80">
        <div class="flex h-24 w-full items-center justify-between px-6 lg:px-8">
            <a class="flex items-center gap-2 group cursor-pointer" href="/">
                <div
                    class="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white transition-transform group-hover:scale-110">
                    <span class="material-symbols-outlined text-[28px]">sync_alt</span>
                </div>
                <span class="text-2xl font-black tracking-tight text-slate-900 dark:text-white">ConvertPro <span
                        class="text-primary">API</span></span>
            </a>
            <nav class="hidden items-center gap-10 lg:flex">
                <a class="text-base font-semibold text-primary" href="/features">Features</a>
                <a class="text-base font-semibold text-slate-600 transition-colors hover:text-primary dark:text-slate-400"
                    href="/pricing">Pricing</a>
                <a class="text-base font-semibold text-slate-600 transition-colors hover:text-primary dark:text-slate-400"
                    href="/docs">Documentation</a>
                <a class="text-base font-semibold text-slate-600 transition-colors hover:text-primary dark:text-slate-400"
                    href="/dashboard">Dashboard</a>
            </nav>
            <div class="flex items-center gap-4">
                <button
                    class="hidden h-12 w-12 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm shadow-slate-200/60 transition-all hover:scale-[1.02] hover:shadow-md dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-black/20 md:inline-flex"
                    data-theme-toggle
                    onclick="window.__toggleMarketingTheme()">
                    <span class="material-symbols-outlined text-[22px]" data-theme-toggle-icon>dark_mode</span>
                </button>
                <a class="hidden text-base font-semibold text-slate-900 hover:text-primary dark:text-white sm:block"
                    href="/login">Login</a>
                <a
                    class="rounded-xl bg-primary px-6 py-3 text-base font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-xl active:scale-95"
                    href="/pricing">Get Started</a>
            </div>
        </div>
    </header>
    <main class="bg-background-light pt-24 dark:bg-background-dark">
        <section class="relative overflow-hidden border-b border-slate-200 bg-white py-24 dark:border-slate-800 dark:bg-slate-950">
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.14),transparent_34%),radial-gradient(circle_at_85%_15%,rgba(14,165,233,0.12),transparent_30%)]"></div>
            <div class="relative mx-auto grid max-w-[1440px] gap-16 px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-20">
                <div>
                    <div
                        class="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.24em] text-primary">
                        <span class="material-symbols-outlined text-sm">auto_awesome</span>
                        Product Features
                    </div>
                    <h1 class="mt-8 max-w-4xl text-5xl font-black tracking-tight text-slate-900 dark:text-white lg:text-7xl">
                        Everything teams need to automate file workflows with one API.
                    </h1>
                    <p class="mt-8 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-400">
                        ConvertPro combines secure conversion pipelines, role-based access, billing controls, history,
                        downloads, and admin insight into one platform built for product teams, internal tools, and
                        customer-facing apps.
                    </p>
                    <div class="mt-10 flex flex-col gap-4 sm:flex-row">
                        <a href="/docs"
                            class="rounded-2xl bg-primary px-8 py-4 text-center text-sm font-bold text-white shadow-xl shadow-primary/25 transition-all hover:bg-primary/90">
                            Explore Docs
                        </a>
                        <a href="/pricing"
                            class="rounded-2xl border border-slate-200 bg-white px-8 py-4 text-center text-sm font-bold text-slate-900 transition-all hover:border-primary/30 hover:text-primary dark:border-slate-800 dark:bg-slate-900 dark:text-white">
                            View Plans
                        </a>
                    </div>
                </div>
                <div class="grid gap-5 sm:grid-cols-2">
                    <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <span class="material-symbols-outlined text-4xl text-primary">transform</span>
                        <h3 class="mt-5 text-xl font-bold text-slate-900 dark:text-white">7 live conversion flows</h3>
                        <p class="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">PDF to Word, PDF to Excel, DOCX to PDF, Excel to PDF, Image to PDF, background removal, and page removal.</p>
                    </div>
                    <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <span class="material-symbols-outlined text-4xl text-primary">admin_panel_settings</span>
                        <h3 class="mt-5 text-xl font-bold text-slate-900 dark:text-white">Role-based control</h3>
                        <p class="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">Built-in super user, admin, general, and demo roles with permission gates for conversion actions.</p>
                    </div>
                    <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <span class="material-symbols-outlined text-4xl text-primary">toll</span>
                        <h3 class="mt-5 text-xl font-bold text-slate-900 dark:text-white">Points and billing</h3>
                        <p class="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">Track balances, top up accounts, inspect ledger history, and enforce per-request charging in v3.</p>
                    </div>
                    <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <span class="material-symbols-outlined text-4xl text-primary">query_stats</span>
                        <h3 class="mt-5 text-xl font-bold text-slate-900 dark:text-white">Operational visibility</h3>
                        <p class="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">Dashboard overview, recent conversion history, success tracking, active-user monitoring, and admin user inspection.</p>
                    </div>
                </div>
            </div>
        </section>

        <section class="bg-slate-50 py-24 dark:bg-slate-950/60">
            <div class="mx-auto max-w-[1440px] px-6 lg:px-20">
                <div class="max-w-3xl">
                    <h2 class="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Core capabilities</h2>
                    <p class="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-400">
                        The platform is structured around practical API building blocks that product and platform teams
                        need in real deployments.
                    </p>
                </div>
                <div class="mt-16 grid gap-6 lg:grid-cols-3">
                    <article class="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <span class="material-symbols-outlined text-3xl">upload_file</span>
                        </div>
                        <h3 class="mt-6 text-2xl font-bold text-slate-900 dark:text-white">Conversion pipeline</h3>
                        <p class="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-400">Upload-based conversion endpoints with private output storage, download-by-conversion-id, idempotency protection, and per-action history feeds.</p>
                        <ul class="mt-6 space-y-3 text-sm text-slate-600 dark:text-slate-400">
                            <li class="flex gap-3"><span class="material-symbols-outlined text-primary">check_circle</span> Multipart uploads for file-based conversion</li>
                            <li class="flex gap-3"><span class="material-symbols-outlined text-primary">check_circle</span> Download URLs generated after success</li>
                            <li class="flex gap-3"><span class="material-symbols-outlined text-primary">check_circle</span> History endpoints for each conversion type</li>
                        </ul>
                    </article>
                    <article class="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <span class="material-symbols-outlined text-3xl">lock</span>
                        </div>
                        <h3 class="mt-6 text-2xl font-bold text-slate-900 dark:text-white">Access and permissions</h3>
                        <p class="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-400">JWT auth, current-user lookup, managed user creation, role changes, and per-user conversion permissions exposed through admin-safe APIs.</p>
                        <ul class="mt-6 space-y-3 text-sm text-slate-600 dark:text-slate-400">
                            <li class="flex gap-3"><span class="material-symbols-outlined text-primary">check_circle</span> Access and refresh token flow</li>
                            <li class="flex gap-3"><span class="material-symbols-outlined text-primary">check_circle</span> Bulk and per-action permission updates</li>
                            <li class="flex gap-3"><span class="material-symbols-outlined text-primary">check_circle</span> Role-gated admin operations</li>
                        </ul>
                    </article>
                    <article class="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <span class="material-symbols-outlined text-3xl">monitoring</span>
                        </div>
                        <h3 class="mt-6 text-2xl font-bold text-slate-900 dark:text-white">Insight and governance</h3>
                        <p class="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-400">Monitor usage with dashboard summaries, per-user API visibility, active-user lists, point-giving history, and detailed user audit views.</p>
                        <ul class="mt-6 space-y-3 text-sm text-slate-600 dark:text-slate-400">
                            <li class="flex gap-3"><span class="material-symbols-outlined text-primary">check_circle</span> Balance and ledger endpoints</li>
                            <li class="flex gap-3"><span class="material-symbols-outlined text-primary">check_circle</span> Dashboard success and latency insights</li>
                            <li class="flex gap-3"><span class="material-symbols-outlined text-primary">check_circle</span> Admin active-user and point history views</li>
                        </ul>
                    </article>
                </div>
            </div>
        </section>

        <section class="bg-white py-24 dark:bg-slate-950">
            <div class="mx-auto max-w-[1440px] px-6 lg:px-20">
                <div class="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
                    <div>
                        <h2 class="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Built for real teams</h2>
                        <p class="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-400">
                            The product covers the entire workflow from authentication to conversion execution to team
                            governance, so you can ship one integrated platform instead of stitching together multiple services.
                        </p>
                    </div>
                    <div class="grid gap-5 sm:grid-cols-2">
                        <div class="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
                            <p class="text-xs font-bold uppercase tracking-[0.24em] text-primary">Developers</p>
                            <h3 class="mt-3 text-xl font-bold text-slate-900 dark:text-white">Simple integration</h3>
                            <p class="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">Clean REST paths, predictable JSON responses, and upload-first conversion flows.</p>
                        </div>
                        <div class="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
                            <p class="text-xs font-bold uppercase tracking-[0.24em] text-primary">Operations</p>
                            <h3 class="mt-3 text-xl font-bold text-slate-900 dark:text-white">Safe retries</h3>
                            <p class="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">Idempotency keys help avoid duplicate charges and repeated conversion work.</p>
                        </div>
                        <div class="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
                            <p class="text-xs font-bold uppercase tracking-[0.24em] text-primary">Admins</p>
                            <h3 class="mt-3 text-xl font-bold text-slate-900 dark:text-white">User governance</h3>
                            <p class="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">Manage roles, conversion permissions, balances, and inspect activity from one place.</p>
                        </div>
                        <div class="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
                            <p class="text-xs font-bold uppercase tracking-[0.24em] text-primary">Product teams</p>
                            <h3 class="mt-3 text-xl font-bold text-slate-900 dark:text-white">Scalable packaging</h3>
                            <p class="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">Support demo users, internal teams, and enterprise customers with one backend model.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="overflow-hidden bg-slate-900 py-24 text-white">
            <div class="mx-auto max-w-[1440px] px-6 lg:px-20">
                <div class="grid items-center gap-12 lg:grid-cols-[1fr_0.95fr]">
                    <div>
                        <p class="text-sm font-bold uppercase tracking-[0.3em] text-primary">API Preview</p>
                        <h2 class="mt-4 text-4xl font-black tracking-tight">One platform, versioned and production-friendly.</h2>
                        <p class="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                            Use v2 for auth and user management, and v3 for points, permissions, dashboard, admin,
                            and conversion workflows.
                        </p>
                    </div>
                    <div class="rounded-3xl border border-slate-800 bg-[#0f172a] p-6 shadow-2xl">
                        <div class="mb-4 flex items-center justify-between border-b border-slate-800 pb-4">
                            <span class="font-mono text-sm font-bold text-primary">POST /api/v3/conversions/pdf-to-word</span>
                            <div class="flex gap-2">
                                <span class="h-2.5 w-2.5 rounded-full bg-red-500"></span>
                                <span class="h-2.5 w-2.5 rounded-full bg-yellow-500"></span>
                                <span class="h-2.5 w-2.5 rounded-full bg-green-500"></span>
                            </div>
                        </div>
                        <pre class="overflow-x-auto text-sm leading-7 text-slate-300"><code><span class="text-pink-400">curl</span> -X POST http://127.0.0.1:8000/api/v3/conversions/pdf-to-word \\
  -H <span class="text-emerald-400">"Authorization: Bearer &lt;token&gt;"</span> \\
  -H <span class="text-emerald-400">"Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000"</span> \\
  -F <span class="text-amber-300">"file=@document.pdf"</span>

<span class="text-slate-500"># response</span>
{
  <span class="text-amber-300">"conversion_id"</span>: <span class="text-blue-400">214</span>,
  <span class="text-amber-300">"status"</span>: <span class="text-emerald-400">"success"</span>,
  <span class="text-amber-300">"download_url"</span>: <span class="text-emerald-400">"/api/v3/conversions/214/download"</span>,
  <span class="text-amber-300">"points_charged"</span>: <span class="text-blue-400">3</span>,
  <span class="text-amber-300">"remaining_balance"</span>: <span class="text-blue-400">97</span>
}</code></pre>
                    </div>
                </div>
            </div>
        </section>

        <section class="bg-white py-24 dark:bg-slate-950">
            <div class="mx-auto max-w-[1440px] px-6 lg:px-20">
                <div class="rounded-[2rem] border border-slate-200 bg-slate-50 px-8 py-14 text-center dark:border-slate-800 dark:bg-slate-900">
                    <h2 class="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Ship faster with a complete conversion stack.</h2>
                    <p class="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-400">
                        Start with the docs, choose a pricing tier, and integrate the endpoints your team needs.
                    </p>
                    <div class="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
                        <a href="/docs"
                            class="rounded-2xl bg-primary px-8 py-4 text-sm font-bold text-white shadow-xl shadow-primary/20 transition-all hover:bg-primary/90">
                            Read Documentation
                        </a>
                        <a href="/pricing"
                            class="rounded-2xl border border-slate-200 bg-white px-8 py-4 text-sm font-bold text-slate-900 transition-all hover:border-primary/30 hover:text-primary dark:border-slate-800 dark:bg-slate-950 dark:text-white">
                            Compare Pricing
                        </a>
                    </div>
                </div>
            </div>
        </section>
    </main>
    <footer class="bg-white border-t border-slate-200 py-16 dark:border-slate-800 dark:bg-slate-950">
        <div class="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-6 px-6 md:flex-row lg:px-20">
            <div class="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                <span>© 2026 ConvertPro API</span>
                <span class="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                <a class="transition-colors hover:text-primary" href="/features">Features</a>
                <span class="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                <a class="transition-colors hover:text-primary" href="/pricing">Pricing</a>
                <span class="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                <a class="transition-colors hover:text-primary" href="/docs">Docs</a>
            </div>
            <div class="flex gap-4">
                <a class="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-all hover:bg-primary/10 hover:text-primary dark:bg-slate-900 dark:text-slate-400"
                    href="#">
                    <svg class="h-4 w-4" fill="currentColor" viewbox="0 0 24 24">
                        <path
                            d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z">
                        </path>
                    </svg>
                </a>
                <a class="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-all hover:bg-primary/10 hover:text-primary dark:bg-slate-900 dark:text-slate-400"
                    href="#">
                    <svg class="h-4 w-4" fill="currentColor" viewbox="0 0 24 24">
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
