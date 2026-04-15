export default function Page() {
  const markup = `
    <main class="pt-36 lg:pt-24">
        <section class="relative mb-16 w-full overflow-hidden border-y border-slate-200 bg-white/80 backdrop-blur-sm px-4 py-10 shadow-[0_24px_70px_-28px_rgba(15,23,42,0.28)] [html[data-theme='sunset']_&]:border-[#9a3412]/40 [html[data-theme='sunset']_&]:bg-[#000000]/90 [html[data-theme='sunset']_&]:backdrop-blur-md [html[data-theme='sunset']_&]:shadow-[0_24px_70px_-28px_rgba(249,115,22,0.4)] sm:px-6 sm:py-14 lg:mb-24 lg:px-8 lg:py-20">
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
                    <h1 class="mt-6 max-w-5xl text-6xl font-black tracking-tight text-slate-900 [html[data-theme='sunset']_&]:text-[#fed7aa] sm:mt-8 sm:text-7xl lg:text-[6.8rem] lg:leading-[1.02]">
                        Powerful file conversion API for <span class="text-primary">modern applications</span>
                    </h1>
                    <p class="mt-6 max-w-2xl text-lg leading-8 text-slate-600 [html[data-theme='sunset']_&]:text-[#fed7aa]/80 sm:mt-8 sm:text-xl sm:leading-9 lg:text-2xl lg:leading-10">
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
                            class="rounded-2xl border border-slate-200 bg-white/90 backdrop-blur-sm px-8 py-4 text-center text-base font-bold text-slate-900 transition-all hover:border-primary/50 hover:text-primary hover:shadow-lg [html[data-theme='sunset']_&]:border-[#9a3412]/40 [html[data-theme='sunset']_&]:bg-[#7c2d12]/20 [html[data-theme='sunset']_&]:backdrop-blur-md [html[data-theme='sunset']_&]:text-[#fed7aa] sm:text-lg">
                            View Documentation
                        </a>
                    </div>
                </div>
                <div class="w-full">
                    <div class="overflow-hidden rounded-3xl border border-slate-200 bg-white/90 backdrop-blur-sm shadow-2xl transition-transform hover:scale-[1.02] [html[data-theme='sunset']_&]:border-[#9a3412]/40 [html[data-theme='sunset']_&]:bg-[#7c2d12]/20 [html[data-theme='sunset']_&]:backdrop-blur-md">
                        <div class="flex h-10 items-center gap-2 border-b border-slate-100 bg-slate-50/80 backdrop-blur-sm px-5 [html[data-theme='sunset']_&]:border-[#9a3412]/40 [html[data-theme='sunset']_&]:bg-[#451a03]/30">
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
                <h2 class="text-3xl font-black tracking-tight text-slate-900 [html[data-theme='sunset']_&]:text-[#fed7aa] sm:text-4xl lg:text-5xl">Supported conversions</h2>
                <p class="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600 [html[data-theme='sunset']_&]:text-[#fed7aa]/80 sm:text-xl sm:leading-9">
                    Production-ready endpoints for common document and image workflows, with consistent responses and
                    clean integration paths.
                </p>
            </div>
            <div class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                <div class="group rounded-3xl border border-slate-200 bg-white/90 backdrop-blur-sm p-8 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200/50 [html[data-theme='sunset']_&]:border-[#9a3412]/40 [html[data-theme='sunset']_&]:bg-[#7c2d12]/20 [html[data-theme='sunset']_&]:backdrop-blur-md [html[data-theme='sunset']_&]:hover:shadow-[#f97316]/20">
                    <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all group-hover:scale-110 group-hover:bg-primary group-hover:text-white">
                        <span class="material-symbols-outlined text-3xl">description</span>
                    </div>
                    <h3 class="mt-6 text-xl font-bold text-slate-900 [html[data-theme='sunset']_&]:text-[#fed7aa]">PDF to Word</h3>
                    <p class="mt-3 text-base leading-7 text-slate-600 [html[data-theme='sunset']_&]:text-[#fed7aa]/80">Turn PDFs into editable DOCX files with private download support and conversion history tracking.</p>
                </div>
                <div class="group rounded-3xl border border-slate-200 bg-white/90 backdrop-blur-sm p-8 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200/50 [html[data-theme='sunset']_&]:border-[#9a3412]/40 [html[data-theme='sunset']_&]:bg-[#7c2d12]/20 [html[data-theme='sunset']_&]:backdrop-blur-md [html[data-theme='sunset']_&]:hover:shadow-[#f97316]/20">
                    <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all group-hover:scale-110 group-hover:bg-primary group-hover:text-white">
                        <span class="material-symbols-outlined text-3xl">table_chart</span>
                    </div>
                    <h3 class="mt-6 text-xl font-bold text-slate-900 [html[data-theme='sunset']_&]:text-[#fed7aa]">PDF to Excel</h3>
                    <p class="mt-3 text-base leading-7 text-slate-600 [html[data-theme='sunset']_&]:text-[#fed7aa]/80">Extract tables and structured data from PDFs directly into spreadsheet workflows.</p>
                </div>
                <div class="group rounded-3xl border border-slate-200 bg-white/90 backdrop-blur-sm p-8 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200/50 [html[data-theme='sunset']_&]:border-[#9a3412]/40 [html[data-theme='sunset']_&]:bg-[#7c2d12]/20 [html[data-theme='sunset']_&]:backdrop-blur-md [html[data-theme='sunset']_&]:hover:shadow-[#f97316]/20">
                    <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all group-hover:scale-110 group-hover:bg-primary group-hover:text-white">
                        <span class="material-symbols-outlined text-3xl">picture_as_pdf</span>
                    </div>
                    <h3 class="mt-6 text-xl font-bold text-slate-900 [html[data-theme='sunset']_&]:text-[#fed7aa]">Office to PDF</h3>
                    <p class="mt-3 text-base leading-7 text-slate-600 [html[data-theme='sunset']_&]:text-[#fed7aa]/80">Convert DOCX and Excel files into shareable PDFs for archiving, review, and delivery.</p>
                </div>
                <div class="group rounded-3xl border border-slate-200 bg-white/90 backdrop-blur-sm p-8 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200/50 [html[data-theme='sunset']_&]:border-[#9a3412]/40 [html[data-theme='sunset']_&]:bg-[#7c2d12]/20 [html[data-theme='sunset']_&]:backdrop-blur-md [html[data-theme='sunset']_&]:hover:shadow-[#f97316]/20">
                    <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all group-hover:scale-110 group-hover:bg-primary group-hover:text-white">
                        <span class="material-symbols-outlined text-3xl">auto_fix_high</span>
                    </div>
                    <h3 class="mt-6 text-xl font-bold text-slate-900 [html[data-theme='sunset']_&]:text-[#fed7aa]">Image workflows</h3>
                    <p class="mt-3 text-base leading-7 text-slate-600 [html[data-theme='sunset']_&]:text-[#fed7aa]/80">Handle image-to-PDF conversion, background removal, and other lightweight media tasks in one API surface.</p>
                </div>
            </div>
        </section>

        <section class="mb-16 grid gap-6 lg:mb-24 lg:gap-8 lg:grid-cols-3">
            <div class="group rounded-3xl border border-slate-200 bg-white/90 backdrop-blur-sm p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl [html[data-theme='sunset']_&]:border-[#9a3412]/40 [html[data-theme='sunset']_&]:bg-[#7c2d12]/20 [html[data-theme='sunset']_&]:backdrop-blur-md">
                <p class="text-xs font-bold uppercase tracking-[0.24em] text-primary">Security</p>
                <h3 class="mt-4 text-2xl font-bold text-slate-900 [html[data-theme='sunset']_&]:text-[#fed7aa]">JWT and role-based access</h3>
                <p class="mt-4 text-base leading-7 text-slate-600 [html[data-theme='sunset']_&]:text-[#fed7aa]/80">Protect write actions with bearer tokens, enforce role checks, and expose only the conversion actions each user is allowed to run.</p>
            </div>
            <div class="group rounded-3xl border border-slate-200 bg-white/90 backdrop-blur-sm p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl [html[data-theme='sunset']_&]:border-[#9a3412]/40 [html[data-theme='sunset']_&]:bg-[#7c2d12]/20 [html[data-theme='sunset']_&]:backdrop-blur-md">
                <p class="text-xs font-bold uppercase tracking-[0.24em] text-primary">Billing</p>
                <h3 class="mt-4 text-2xl font-bold text-slate-900 [html[data-theme='sunset']_&]:text-[#fed7aa]">Points and usage controls</h3>
                <p class="mt-4 text-base leading-7 text-slate-600 [html[data-theme='sunset']_&]:text-[#fed7aa]/80">Track point balances, top up users, inspect ledgers, and prevent duplicate charges with idempotency keys on conversion requests.</p>
            </div>
            <div class="group rounded-3xl border border-slate-200 bg-white/90 backdrop-blur-sm p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl [html[data-theme='sunset']_&]:border-[#9a3412]/40 [html[data-theme='sunset']_&]:bg-[#7c2d12]/20 [html[data-theme='sunset']_&]:backdrop-blur-md">
                <p class="text-xs font-bold uppercase tracking-[0.24em] text-primary">Operations</p>
                <h3 class="mt-4 text-2xl font-bold text-slate-900 [html[data-theme='sunset']_&]:text-[#fed7aa]">Dashboard and admin insight</h3>
                <p class="mt-4 text-base leading-7 text-slate-600 [html[data-theme='sunset']_&]:text-[#fed7aa]/80">Monitor recent history, conversion success, user activity, point-giving history, and per-user API permissions from one platform.</p>
            </div>
        </section>

        <section class="mb-16 overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900 to-slate-800 py-12 text-white shadow-2xl [html[data-theme='sunset']_&]:from-[#7c2d12] [html[data-theme='sunset']_&]:to-[#451a03] sm:py-16 lg:mb-24 lg:py-20">
            <div class="grid items-center gap-10 px-5 sm:px-8 lg:grid-cols-[1fr_0.95fr] lg:gap-14 lg:px-14">
                <div>
                    <h2 class="text-3xl font-black tracking-tight [html[data-theme='sunset']_&]:text-[#fed7aa] sm:text-4xl lg:text-5xl">Built for product, platform, and internal tools teams.</h2>
                    <div class="mt-10 space-y-8">
                        <div class="flex gap-4">
                            <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary">
                                <span class="material-symbols-outlined">key</span>
                            </div>
                            <div>
                                <h4 class="text-xl font-bold [html[data-theme='sunset']_&]:text-[#fed7aa]">Auth and user management</h4>
                                <p class="mt-2 text-lg text-slate-300 [html[data-theme='sunset']_&]:text-[#fed7aa]/80">Sign in, refresh access, create users, update roles, and manage access without building separate admin plumbing.</p>
                            </div>
                        </div>
                        <div class="flex gap-4">
                            <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary">
                                <span class="material-symbols-outlined">sync</span>
                            </div>
                            <div>
                                <h4 class="text-xl font-bold [html[data-theme='sunset']_&]:text-[#fed7aa]">Safe conversion retries</h4>
                                <p class="mt-2 text-lg text-slate-300 [html[data-theme='sunset']_&]:text-[#fed7aa]/80">Use idempotency keys on v3 conversion requests to protect billing and avoid repeated background work.</p>
                            </div>
                        </div>
                        <div class="flex gap-4">
                            <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary">
                                <span class="material-symbols-outlined">monitoring</span>
                            </div>
                            <div>
                                <h4 class="text-xl font-bold [html[data-theme='sunset']_&]:text-[#fed7aa]">Live operational visibility</h4>
                                <p class="mt-2 text-lg text-slate-300 [html[data-theme='sunset']_&]:text-[#fed7aa]/80">Recent history, success rates, balances, and activity views make the API easier to run at team scale.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="rounded-3xl border border-slate-700 bg-[#0f172a] p-6 shadow-2xl transition-transform hover:scale-[1.01] [html[data-theme='sunset']_&]:border-[#9a3412]/40 [html[data-theme='sunset']_&]:bg-[#451a03]">
                    <div class="mb-4 flex items-center justify-between border-b border-slate-800 pb-4 [html[data-theme='sunset']_&]:border-[#9a3412]/40">
                        <span class="font-mono text-sm font-bold text-primary">POST /api/v3/conversions/pdf-to-word</span>
                        <div class="flex gap-2">
                            <span class="h-2.5 w-2.5 rounded-full bg-slate-700 [html[data-theme='sunset']_&]:bg-[#9a3412]"></span>
                            <span class="h-2.5 w-2.5 rounded-full bg-slate-700 [html[data-theme='sunset']_&]:bg-[#9a3412]"></span>
                            <span class="h-2.5 w-2.5 rounded-full bg-slate-700 [html[data-theme='sunset']_&]:bg-[#9a3412]"></span>
                        </div>
                    </div>
                    <pre class="overflow-x-auto whitespace-pre-wrap break-words text-base leading-7 text-slate-300 [html[data-theme='sunset']_&]:text-[#fed7aa]/90"><code><span class="text-pink-400">curl</span> -X POST http://127.0.0.1:8000/api/v3/conversions/pdf-to-word \\
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
            <h2 class="mb-12 text-center text-3xl font-black tracking-tight text-slate-900 [html[data-theme='sunset']_&]:text-[#fed7aa] sm:text-4xl lg:text-5xl">Why teams choose ConvertPro</h2>
            <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                <div class="group rounded-3xl border border-slate-200 bg-white/90 backdrop-blur-sm p-8 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl [html[data-theme='sunset']_&]:border-[#9a3412]/40 [html[data-theme='sunset']_&]:bg-[#7c2d12]/20 [html[data-theme='sunset']_&]:backdrop-blur-md">
                    <span class="material-symbols-outlined text-4xl text-primary transition-transform group-hover:scale-110">speed</span>
                    <h3 class="mt-5 text-xl font-bold text-slate-900 [html[data-theme='sunset']_&]:text-[#fed7aa]">Fast delivery</h3>
                    <p class="mt-3 text-base leading-7 text-slate-600 [html[data-theme='sunset']_&]:text-[#fed7aa]/80">Versioned endpoints and predictable request shapes reduce integration time.</p>
                </div>
                <div class="group rounded-3xl border border-slate-200 bg-white/90 backdrop-blur-sm p-8 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl [html[data-theme='sunset']_&]:border-[#9a3412]/40 [html[data-theme='sunset']_&]:bg-[#7c2d12]/20 [html[data-theme='sunset']_&]:backdrop-blur-md">
                    <span class="material-symbols-outlined text-4xl text-primary transition-transform group-hover:scale-110">group</span>
                    <h3 class="mt-5 text-xl font-bold text-slate-900 [html[data-theme='sunset']_&]:text-[#fed7aa]">Team-ready roles</h3>
                    <p class="mt-3 text-base leading-7 text-slate-600 [html[data-theme='sunset']_&]:text-[#fed7aa]/80">Support demo, general, admin, and super user workflows in one system.</p>
                </div>
                <div class="group rounded-3xl border border-slate-200 bg-white/90 backdrop-blur-sm p-8 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl [html[data-theme='sunset']_&]:border-[#9a3412]/40 [html[data-theme='sunset']_&]:bg-[#7c2d12]/20 [html[data-theme='sunset']_&]:backdrop-blur-md">
                    <span class="material-symbols-outlined text-4xl text-primary transition-transform group-hover:scale-110">paid</span>
                    <h3 class="mt-5 text-xl font-bold text-slate-900 [html[data-theme='sunset']_&]:text-[#fed7aa]">Usage clarity</h3>
                    <p class="mt-3 text-base leading-7 text-slate-600 [html[data-theme='sunset']_&]:text-[#fed7aa]/80">Balances, ledgers, and top-ups make cost control understandable for every account.</p>
                </div>
                <div class="group rounded-3xl border border-slate-200 bg-white/90 backdrop-blur-sm p-8 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl [html[data-theme='sunset']_&]:border-[#9a3412]/40 [html[data-theme='sunset']_&]:bg-[#7c2d12]/20 [html[data-theme='sunset']_&]:backdrop-blur-md">
                    <span class="material-symbols-outlined text-4xl text-primary transition-transform group-hover:scale-110">manage_search</span>
                    <h3 class="mt-5 text-xl font-bold text-slate-900 [html[data-theme='sunset']_&]:text-[#fed7aa]">Admin visibility</h3>
                    <p class="mt-3 text-base leading-7 text-slate-600 [html[data-theme='sunset']_&]:text-[#fed7aa]/80">Inspect users, permissions, and conversion performance without leaving the platform.</p>
                </div>
            </div>
        </section>
        </div>
    </main>
`;

  return (
    <div className="text-slate-900 font-display">
      <div dangerouslySetInnerHTML={{ __html: markup }} />
    </div>
  );
}
