export default function Page() {
  const markup = `
<!-- Navigation Bar -->
    <header
        class="fixed inset-x-0 top-0 z-50 w-full border-b border-slate-200/60 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-background-dark/80">
        <div class="flex h-20 w-full items-center justify-between px-4 sm:h-24 sm:px-6 lg:px-8">
            <a class="flex items-center gap-2 group cursor-pointer" href="/">
                <div
                    class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white transition-transform group-hover:scale-110 sm:h-12 sm:w-12">
                    <span class="material-symbols-outlined text-2xl sm:text-[28px]">sync_alt</span>
                </div>
                <span class="text-lg font-black tracking-tight text-slate-900 dark:text-white sm:text-2xl">ConvertPro <span
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
            <div class="flex items-center gap-2 sm:gap-4">
                <button
                    class="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm shadow-slate-200/60 transition-all hover:scale-[1.02] hover:shadow-md dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-black/20 sm:h-12 sm:w-12"
                    data-theme-toggle
                    onclick="window.__toggleMarketingTheme()">
                    <span class="material-symbols-outlined text-xl sm:text-[22px]" data-theme-toggle-icon>dark_mode</span>
                </button>
                <a
                    class="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all duration-200 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] sm:px-6 sm:py-3 sm:text-base"
                    href="/login">Login</a>
            </div>
        </div>
        <div class="border-t border-slate-200/70 px-4 py-3 dark:border-slate-800 lg:hidden">
            <nav class="flex items-center gap-3 overflow-x-auto whitespace-nowrap text-sm font-semibold">
                <a class="rounded-full bg-primary/10 px-3 py-1.5 text-primary" href="/features">Features</a>
                <a class="rounded-full bg-slate-100 px-3 py-1.5 text-slate-700 dark:bg-slate-900 dark:text-slate-300" href="/pricing">Pricing</a>
                <a class="rounded-full bg-slate-100 px-3 py-1.5 text-slate-700 dark:bg-slate-900 dark:text-slate-300" href="/docs">Documentation</a>
                <a class="rounded-full bg-slate-100 px-3 py-1.5 text-slate-700 dark:bg-slate-900 dark:text-slate-300" href="/dashboard">Dashboard</a>
            </nav>
        </div>
    </header>
    <main class="bg-background-light pt-36 dark:bg-background-dark lg:pt-24">
        <section class="relative mb-16 w-full overflow-hidden border-y border-slate-200 bg-white px-4 py-10 shadow-[0_24px_70px_-28px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-950 dark:shadow-[0_24px_70px_-28px_rgba(2,6,23,0.72)] sm:px-6 sm:py-14 lg:mb-24 lg:px-8 lg:py-20">
            <div
                class="absolute -top-24 left-16 h-64 w-64 rounded-full bg-primary/10 blur-[120px]"></div>
            <div
                class="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-primary/10 blur-[140px]"></div>
            <!-- Floating decorative elements -->
            <div class="absolute inset-0 overflow-hidden pointer-events-none">
                <div class="absolute top-1/4 left-10 h-2 w-2 rounded-full bg-primary/30 animate-pulse"></div>
                <div class="absolute top-1/3 right-1/4 h-3 w-3 rounded-full bg-primary/30 animate-pulse delay-1000"></div>
                <div class="absolute bottom-1/3 left-1/3 h-1.5 w-1.5 rounded-full bg-primary/50 animate-pulse delay-700"></div>
            </div>
            <div class="relative mx-auto grid max-w-[1440px] items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14 lg:px-12">
                <div>
                    <div
                        class="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary sm:text-sm">
                        <span class="material-symbols-outlined text-sm">verified</span> Now processing 1M+ files daily
                    </div>
                    <h1 class="mt-6 max-w-5xl text-6xl font-black tracking-tight text-slate-900 dark:text-white sm:mt-8 sm:text-7xl lg:text-[6.8rem] lg:leading-[1.02]">
                        Powerful file conversion API for <span class="text-primary">modern applications</span>
                    </h1>
                    <p class="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-400 sm:mt-8 sm:text-xl sm:leading-9 lg:text-2xl lg:leading-10">
                        Secure, fast, role-based infrastructure for document conversion, permissions, billing controls,
                        and operational visibility. Launch workflow automation in days, not months.
                    </p>
                    <div class="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:gap-4">
                        <a href="/pricing"
                            class="group relative rounded-2xl bg-primary px-8 py-4 text-center text-base font-bold text-white shadow-xl shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-2xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] sm:text-lg">
                            <span class="relative z-10">Try API Free</span>
                            <span class="absolute inset-0 rounded-2xl bg-white/20 opacity-0 blur transition-opacity group-hover:opacity-100"></span>
                        </a>
                        <a href="/docs"
                            class="rounded-2xl border border-slate-200 bg-white px-8 py-4 text-center text-base font-bold text-slate-900 transition-all hover:border-primary/50 hover:text-primary hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:text-white sm:text-lg">
                            View Documentation
                        </a>
                    </div>
                </div>
                <div class="w-full">
                    <div class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl transition-transform hover:scale-[1.02] dark:border-slate-800 dark:bg-slate-900">
                        <div class="flex h-10 items-center gap-2 border-b border-slate-100 bg-slate-50 px-5 dark:border-slate-800 dark:bg-slate-900/60">
                            <span class="h-3 w-3 rounded-full bg-red-400"></span>
                            <span class="h-3 w-3 rounded-full bg-amber-400"></span>
                            <span class="h-3 w-3 rounded-full bg-emerald-400"></span>
                        </div>
                        <img alt="Dashboard Mockup" class="aspect-video w-full object-cover"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAD5wujvbMWRNdzjqN5AGPZDPPvibfQIV_qqgwbvq2I04UpQ8hIteazbjnyYm5nTW3A7PuGIVFJq2mgs0dWVCUzxlKWf3lOJcefbBBbQ7iNa4vR4iLxqOxXI7FFyF1P305W3nA4b0a2HbGDSlFwQWChRQq_5Bz6BHqnmckyOiMJvtCMHK4Z4kqsfWMPR4nkCO1l2g1hZCNKuGp-hMKm2EdcGIb2RjlAY7aybdg6MY6qEISxOEHVTbeeHFO001iB-Mt4Rr3gAmu0xF44" />
                    </div>
                </div>
            </div>
        </section>

        <div class="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 sm:py-12 lg:px-20">

        <section class="mb-16 lg:mb-24" id="features">
            <div class="text-center mb-14">
                <h2 class="text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">Supported conversions</h2>
                <p class="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-400 sm:text-xl sm:leading-9">
                    Production-ready endpoints for common document and image workflows, with consistent responses and
                    clean integration paths.
                </p>
            </div>
            <div class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                <div class="group rounded-3xl border border-slate-200 bg-white p-8 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:shadow-slate-800/50">
                    <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all group-hover:scale-110 group-hover:bg-primary group-hover:text-white">
                        <span class="material-symbols-outlined text-3xl">description</span>
                    </div>
                    <h3 class="mt-6 text-xl font-bold text-slate-900 dark:text-white">PDF to Word</h3>
                    <p class="mt-3 text-base leading-7 text-slate-600 dark:text-slate-400">Turn PDFs into editable DOCX files with private download support and conversion history tracking.</p>
                </div>
                <div class="group rounded-3xl border border-slate-200 bg-white p-8 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:shadow-slate-800/50">
                    <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all group-hover:scale-110 group-hover:bg-primary group-hover:text-white">
                        <span class="material-symbols-outlined text-3xl">table_chart</span>
                    </div>
                    <h3 class="mt-6 text-xl font-bold text-slate-900 dark:text-white">PDF to Excel</h3>
                    <p class="mt-3 text-base leading-7 text-slate-600 dark:text-slate-400">Extract tables and structured data from PDFs directly into spreadsheet workflows.</p>
                </div>
                <div class="group rounded-3xl border border-slate-200 bg-white p-8 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:shadow-slate-800/50">
                    <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all group-hover:scale-110 group-hover:bg-primary group-hover:text-white">
                        <span class="material-symbols-outlined text-3xl">picture_as_pdf</span>
                    </div>
                    <h3 class="mt-6 text-xl font-bold text-slate-900 dark:text-white">Office to PDF</h3>
                    <p class="mt-3 text-base leading-7 text-slate-600 dark:text-slate-400">Convert DOCX and Excel files into shareable PDFs for archiving, review, and delivery.</p>
                </div>
                <div class="group rounded-3xl border border-slate-200 bg-white p-8 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:shadow-slate-800/50">
                    <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all group-hover:scale-110 group-hover:bg-primary group-hover:text-white">
                        <span class="material-symbols-outlined text-3xl">auto_fix_high</span>
                    </div>
                    <h3 class="mt-6 text-xl font-bold text-slate-900 dark:text-white">Image workflows</h3>
                    <p class="mt-3 text-base leading-7 text-slate-600 dark:text-slate-400">Handle image-to-PDF conversion, background removal, and other lightweight media tasks in one API surface.</p>
                </div>
            </div>
        </section>

        <section class="mb-16 grid gap-6 lg:mb-24 lg:gap-8 lg:grid-cols-3">
            <div class="group rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
                <p class="text-xs font-bold uppercase tracking-[0.24em] text-primary">Security</p>
                <h3 class="mt-4 text-2xl font-bold text-slate-900 dark:text-white">JWT and role-based access</h3>
                <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-400">Protect write actions with bearer tokens, enforce role checks, and expose only the conversion actions each user is allowed to run.</p>
            </div>
            <div class="group rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
                <p class="text-xs font-bold uppercase tracking-[0.24em] text-primary">Billing</p>
                <h3 class="mt-4 text-2xl font-bold text-slate-900 dark:text-white">Points and usage controls</h3>
                <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-400">Track point balances, top up users, inspect ledgers, and prevent duplicate charges with idempotency keys on conversion requests.</p>
            </div>
            <div class="group rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
                <p class="text-xs font-bold uppercase tracking-[0.24em] text-primary">Operations</p>
                <h3 class="mt-4 text-2xl font-bold text-slate-900 dark:text-white">Dashboard and admin insight</h3>
                <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-400">Monitor recent history, conversion success, user activity, point-giving history, and per-user API permissions from one platform.</p>
            </div>
        </section>

        <section class="mb-16 overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900 to-slate-800 py-12 text-white shadow-2xl sm:py-16 lg:mb-24 lg:py-20">
            <div class="grid items-center gap-10 px-5 sm:px-8 lg:grid-cols-[1fr_0.95fr] lg:gap-14 lg:px-14">
                <div>
                    <h2 class="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">Built for product, platform, and internal tools teams.</h2>
                    <div class="mt-10 space-y-8">
                        <div class="flex gap-4">
                            <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary">
                                <span class="material-symbols-outlined">key</span>
                            </div>
                            <div>
                                <h4 class="text-xl font-bold">Auth and user management</h4>
                                <p class="mt-2 text-lg text-slate-300">Sign in, refresh access, create users, update roles, and manage access without building separate admin plumbing.</p>
                            </div>
                        </div>
                        <div class="flex gap-4">
                            <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary">
                                <span class="material-symbols-outlined">sync</span>
                            </div>
                            <div>
                                <h4 class="text-xl font-bold">Safe conversion retries</h4>
                                <p class="mt-2 text-lg text-slate-300">Use idempotency keys on v3 conversion requests to protect billing and avoid repeated background work.</p>
                            </div>
                        </div>
                        <div class="flex gap-4">
                            <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary">
                                <span class="material-symbols-outlined">monitoring</span>
                            </div>
                            <div>
                                <h4 class="text-xl font-bold">Live operational visibility</h4>
                                <p class="mt-2 text-lg text-slate-300">Recent history, success rates, balances, and activity views make the API easier to run at team scale.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="rounded-3xl border border-slate-700 bg-[#0f172a] p-6 shadow-2xl transition-transform hover:scale-[1.01]">
                    <div class="mb-4 flex items-center justify-between border-b border-slate-800 pb-4">
                        <span class="font-mono text-sm font-bold text-primary">POST /api/v3/conversions/pdf-to-word</span>
                        <div class="flex gap-2">
                            <span class="h-2.5 w-2.5 rounded-full bg-slate-700"></span>
                            <span class="h-2.5 w-2.5 rounded-full bg-slate-700"></span>
                            <span class="h-2.5 w-2.5 rounded-full bg-slate-700"></span>
                        </div>
                    </div>
                    <pre class="overflow-x-auto whitespace-pre-wrap break-words text-base leading-7 text-slate-300"><code><span class="text-pink-400">curl</span> -X POST http://127.0.0.1:8000/api/v3/conversions/pdf-to-word \\
  -H <span class="text-emerald-400">"Authorization: Bearer &lt;token&gt;"</span> \\
  -H <span class="text-emerald-400">"Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000"</span> \\
  -F <span class="text-amber-300">"file=@document.pdf"</span>

{
  <span class="text-amber-300">"conversion_id"</span>: <span class="text-blue-400">214</span>,
  <span class="text-amber-300">"status"</span>: <span class="text-emerald-400">"success"</span>,
  <span class="text-amber-300">"download_url"</span>: <span class="text-emerald-400">"/api/v3/conversions/214/download"</span>,
  <span class="text-amber-300">"points_charged"</span>: <span class="text-blue-400">3</span>,
  <span class="text-amber-300">"remaining_balance"</span>: <span class="text-blue-400">97</span>
}</code></pre>
                </div>
            </div>
        </section>

        <section class="mb-16 lg:mb-24">
            <h2 class="mb-12 text-center text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">Why teams choose ConvertPro</h2>
            <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                <div class="group rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
                    <span class="material-symbols-outlined text-4xl text-primary transition-transform group-hover:scale-110">speed</span>
                    <h3 class="mt-5 text-xl font-bold text-slate-900 dark:text-white">Fast delivery</h3>
                    <p class="mt-3 text-base leading-7 text-slate-600 dark:text-slate-400">Versioned endpoints and predictable request shapes reduce integration time.</p>
                </div>
                <div class="group rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
                    <span class="material-symbols-outlined text-4xl text-primary transition-transform group-hover:scale-110">group</span>
                    <h3 class="mt-5 text-xl font-bold text-slate-900 dark:text-white">Team-ready roles</h3>
                    <p class="mt-3 text-base leading-7 text-slate-600 dark:text-slate-400">Support demo, general, admin, and super user workflows in one system.</p>
                </div>
                <div class="group rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
                    <span class="material-symbols-outlined text-4xl text-primary transition-transform group-hover:scale-110">paid</span>
                    <h3 class="mt-5 text-xl font-bold text-slate-900 dark:text-white">Usage clarity</h3>
                    <p class="mt-3 text-base leading-7 text-slate-600 dark:text-slate-400">Balances, ledgers, and top-ups make cost control understandable for every account.</p>
                </div>
                <div class="group rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
                    <span class="material-symbols-outlined text-4xl text-primary transition-transform group-hover:scale-110">manage_search</span>
                    <h3 class="mt-5 text-xl font-bold text-slate-900 dark:text-white">Admin visibility</h3>
                    <p class="mt-3 text-base leading-7 text-slate-600 dark:text-slate-400">Inspect users, permissions, and conversion performance without leaving the platform.</p>
                </div>
            </div>
        </section>
        </div>
    </main>
    <footer class="bg-white border-t border-slate-200 py-16 dark:border-slate-800 dark:bg-slate-950">
        <div class="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-6 px-6 md:flex-row lg:px-20">
            <div class="flex items-center gap-4 text-base text-slate-500 dark:text-slate-400">
                <span>© 2026 ConvertPro API</span>
                <span class="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                <a class="transition-colors hover:text-primary" href="/features">Features</a>
                <span class="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                <a class="transition-colors hover:text-primary" href="/pricing">Pricing</a>
                <span class="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                <a class="transition-colors hover:text-primary" href="/docs">Docs</a>
            </div>
            <div class="flex gap-4">
                <a class="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-all hover:bg-primary/10 hover:text-primary hover:scale-110 dark:bg-slate-900 dark:text-slate-400"
                    href="#">
                    <svg class="h-4 w-4" fill="currentColor" viewbox="0 0 24 24">
                        <path
                            d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z">
                        </path>
                    </svg>
                </a>
                <a class="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-all hover:bg-primary/10 hover:text-primary hover:scale-110 dark:bg-slate-900 dark:text-slate-400"
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
