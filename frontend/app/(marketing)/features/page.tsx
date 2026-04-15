export default function Page() {
  const markup = `
    <main class="pt-36 lg:pt-24">
        <section class="relative overflow-hidden border-b border-slate-200 bg-white py-16 [html[data-theme='sunset']_&]:border-[#9a3412] [html[data-theme='sunset']_&]:bg-[#7c2d12] sm:py-24">
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.14),transparent_34%),radial-gradient(circle_at_85%_15%,rgba(14,165,233,0.12),transparent_30%)]"></div>
            <div class="relative mx-auto grid max-w-[1440px] gap-10 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:px-20">
                <div>
                    <div
                        class="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.24em] text-primary">
                        <span class="material-symbols-outlined text-sm">auto_awesome</span>
                        Product Features
                    </div>
                    <h1 class="mt-6 max-w-4xl text-4xl font-black tracking-tight text-slate-900 [html[data-theme='sunset']_&]:text-[#fed7aa] sm:mt-8 sm:text-5xl lg:text-7xl">
                        Everything teams need to automate file workflows with one API.
                    </h1>
                    <p class="mt-6 max-w-2xl text-base leading-7 text-slate-600 [html[data-theme='sunset']_&]:text-[#fed7aa]/80 sm:mt-8 sm:text-lg sm:leading-8">
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
                            class="rounded-2xl border border-slate-200 bg-white px-8 py-4 text-center text-sm font-bold text-slate-900 transition-all hover:border-primary/30 hover:text-primary [html[data-theme='sunset']_&]:border-[#9a3412] [html[data-theme='sunset']_&]:bg-[#7c2d12] [html[data-theme='sunset']_&]:text-[#fed7aa]">
                            View Plans
                        </a>
                    </div>
                </div>
                <div class="grid gap-5 sm:grid-cols-2">
                    <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm [html[data-theme='sunset']_&]:border-[#9a3412] [html[data-theme='sunset']_&]:bg-[#7c2d12]">
                        <span class="material-symbols-outlined text-4xl text-primary">transform</span>
                        <h3 class="mt-5 text-xl font-bold text-slate-900 [html[data-theme='sunset']_&]:text-[#fed7aa]">7 live conversion flows</h3>
                        <p class="mt-3 text-sm leading-7 text-slate-600 [html[data-theme='sunset']_&]:text-[#fed7aa]/80">PDF to Word, PDF to Excel, DOCX to PDF, Excel to PDF, Image to PDF, background removal, and page removal.</p>
                    </div>
                    <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm [html[data-theme='sunset']_&]:border-[#9a3412] [html[data-theme='sunset']_&]:bg-[#7c2d12]">
                        <span class="material-symbols-outlined text-4xl text-primary">admin_panel_settings</span>
                        <h3 class="mt-5 text-xl font-bold text-slate-900 [html[data-theme='sunset']_&]:text-[#fed7aa]">Role-based control</h3>
                        <p class="mt-3 text-sm leading-7 text-slate-600 [html[data-theme='sunset']_&]:text-[#fed7aa]/80">Built-in super user, admin, general, and demo roles with permission gates for conversion actions.</p>
                    </div>
                    <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm [html[data-theme='sunset']_&]:border-[#9a3412] [html[data-theme='sunset']_&]:bg-[#7c2d12]">
                        <span class="material-symbols-outlined text-4xl text-primary">toll</span>
                        <h3 class="mt-5 text-xl font-bold text-slate-900 [html[data-theme='sunset']_&]:text-[#fed7aa]">Points and billing</h3>
                        <p class="mt-3 text-sm leading-7 text-slate-600 [html[data-theme='sunset']_&]:text-[#fed7aa]/80">Track balances, top up accounts, inspect ledger history, and enforce per-request charging in v3.</p>
                    </div>
                    <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm [html[data-theme='sunset']_&]:border-[#9a3412] [html[data-theme='sunset']_&]:bg-[#7c2d12]">
                        <span class="material-symbols-outlined text-4xl text-primary">query_stats</span>
                        <h3 class="mt-5 text-xl font-bold text-slate-900 [html[data-theme='sunset']_&]:text-[#fed7aa]">Operational visibility</h3>
                        <p class="mt-3 text-sm leading-7 text-slate-600 [html[data-theme='sunset']_&]:text-[#fed7aa]/80">Dashboard overview, recent conversion history, success tracking, active-user monitoring, and admin user inspection.</p>
                    </div>
                </div>
            </div>
        </section>

        <section class="bg-slate-50 py-16 [html[data-theme='sunset']_&]:bg-[#451a03] sm:py-24">
            <div class="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-20">
                <div class="max-w-3xl">
                    <h2 class="text-3xl font-black tracking-tight text-slate-900 [html[data-theme='sunset']_&]:text-[#fed7aa] sm:text-4xl">Core capabilities</h2>
                    <p class="mt-5 text-base leading-7 text-slate-600 [html[data-theme='sunset']_&]:text-[#fed7aa]/80 sm:text-lg sm:leading-8">
                        The platform is structured around practical API building blocks that product and platform teams
                        need in real deployments.
                    </p>
                </div>
                <div class="mt-16 grid gap-6 lg:grid-cols-3">
                    <article class="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm [html[data-theme='sunset']_&]:border-[#9a3412] [html[data-theme='sunset']_&]:bg-[#7c2d12]">
                        <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <span class="material-symbols-outlined text-3xl">upload_file</span>
                        </div>
                        <h3 class="mt-6 text-2xl font-bold text-slate-900 [html[data-theme='sunset']_&]:text-[#fed7aa]">Conversion pipeline</h3>
                        <p class="mt-4 text-sm leading-7 text-slate-600 [html[data-theme='sunset']_&]:text-[#fed7aa]/80">Upload-based conversion endpoints with private output storage, download-by-conversion-id, idempotency protection, and per-action history feeds.</p>
                        <ul class="mt-6 space-y-3 text-sm text-slate-600 [html[data-theme='sunset']_&]:text-[#fed7aa]/80">
                            <li class="flex gap-3"><span class="material-symbols-outlined text-primary">check_circle</span> Multipart uploads for file-based conversion</li>
                            <li class="flex gap-3"><span class="material-symbols-outlined text-primary">check_circle</span> Download URLs generated after success</li>
                            <li class="flex gap-3"><span class="material-symbols-outlined text-primary">check_circle</span> History endpoints for each conversion type</li>
                        </ul>
                    </article>
                    <article class="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm [html[data-theme='sunset']_&]:border-[#9a3412] [html[data-theme='sunset']_&]:bg-[#7c2d12]">
                        <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <span class="material-symbols-outlined text-3xl">lock</span>
                        </div>
                        <h3 class="mt-6 text-2xl font-bold text-slate-900 [html[data-theme='sunset']_&]:text-[#fed7aa]">Access and permissions</h3>
                        <p class="mt-4 text-sm leading-7 text-slate-600 [html[data-theme='sunset']_&]:text-[#fed7aa]/80">JWT auth, current-user lookup, managed user creation, role changes, and per-user conversion permissions exposed through admin-safe APIs.</p>
                        <ul class="mt-6 space-y-3 text-sm text-slate-600 [html[data-theme='sunset']_&]:text-[#fed7aa]/80">
                            <li class="flex gap-3"><span class="material-symbols-outlined text-primary">check_circle</span> Access and refresh token flow</li>
                            <li class="flex gap-3"><span class="material-symbols-outlined text-primary">check_circle</span> Bulk and per-action permission updates</li>
                            <li class="flex gap-3"><span class="material-symbols-outlined text-primary">check_circle</span> Role-gated admin operations</li>
                        </ul>
                    </article>
                    <article class="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm [html[data-theme='sunset']_&]:border-[#9a3412] [html[data-theme='sunset']_&]:bg-[#7c2d12]">
                        <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <span class="material-symbols-outlined text-3xl">monitoring</span>
                        </div>
                        <h3 class="mt-6 text-2xl font-bold text-slate-900 [html[data-theme='sunset']_&]:text-[#fed7aa]">Insight and governance</h3>
                        <p class="mt-4 text-sm leading-7 text-slate-600 [html[data-theme='sunset']_&]:text-[#fed7aa]/80">Monitor usage with dashboard summaries, per-user API visibility, active-user lists, point-giving history, and detailed user audit views.</p>
                        <ul class="mt-6 space-y-3 text-sm text-slate-600 [html[data-theme='sunset']_&]:text-[#fed7aa]/80">
                            <li class="flex gap-3"><span class="material-symbols-outlined text-primary">check_circle</span> Balance and ledger endpoints</li>
                            <li class="flex gap-3"><span class="material-symbols-outlined text-primary">check_circle</span> Dashboard success and latency insights</li>
                            <li class="flex gap-3"><span class="material-symbols-outlined text-primary">check_circle</span> Admin active-user and point history views</li>
                        </ul>
                    </article>
                </div>
            </div>
        </section>

        <section class="bg-white py-16 [html[data-theme='sunset']_&]:bg-[#7c2d12] sm:py-24">
            <div class="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-20">
                <div class="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
                    <div>
                        <h2 class="text-3xl font-black tracking-tight text-slate-900 [html[data-theme='sunset']_&]:text-[#fed7aa] sm:text-4xl">Built for real teams</h2>
                        <p class="mt-6 text-base leading-7 text-slate-600 [html[data-theme='sunset']_&]:text-[#fed7aa]/80 sm:text-lg sm:leading-8">
                            The product covers the entire workflow from authentication to conversion execution to team
                            governance, so you can ship one integrated platform instead of stitching together multiple services.
                        </p>
                    </div>
                    <div class="grid gap-5 sm:grid-cols-2">
                        <div class="rounded-3xl border border-slate-200 bg-slate-50 p-6 [html[data-theme='sunset']_&]:border-[#9a3412] [html[data-theme='sunset']_&]:bg-[#451a03]">
                            <p class="text-xs font-bold uppercase tracking-[0.24em] text-primary">Developers</p>
                            <h3 class="mt-3 text-xl font-bold text-slate-900 [html[data-theme='sunset']_&]:text-[#fed7aa]">Simple integration</h3>
                            <p class="mt-3 text-sm leading-7 text-slate-600 [html[data-theme='sunset']_&]:text-[#fed7aa]/80">Clean REST paths, predictable JSON responses, and upload-first conversion flows.</p>
                        </div>
                        <div class="rounded-3xl border border-slate-200 bg-slate-50 p-6 [html[data-theme='sunset']_&]:border-[#9a3412] [html[data-theme='sunset']_&]:bg-[#451a03]">
                            <p class="text-xs font-bold uppercase tracking-[0.24em] text-primary">Operations</p>
                            <h3 class="mt-3 text-xl font-bold text-slate-900 [html[data-theme='sunset']_&]:text-[#fed7aa]">Safe retries</h3>
                            <p class="mt-3 text-sm leading-7 text-slate-600 [html[data-theme='sunset']_&]:text-[#fed7aa]/80">Idempotency keys help avoid duplicate charges and repeated conversion work.</p>
                        </div>
                        <div class="rounded-3xl border border-slate-200 bg-slate-50 p-6 [html[data-theme='sunset']_&]:border-[#9a3412] [html[data-theme='sunset']_&]:bg-[#451a03]">
                            <p class="text-xs font-bold uppercase tracking-[0.24em] text-primary">Admins</p>
                            <h3 class="mt-3 text-xl font-bold text-slate-900 [html[data-theme='sunset']_&]:text-[#fed7aa]">User governance</h3>
                            <p class="mt-3 text-sm leading-7 text-slate-600 [html[data-theme='sunset']_&]:text-[#fed7aa]/80">Manage roles, conversion permissions, balances, and inspect activity from one place.</p>
                        </div>
                        <div class="rounded-3xl border border-slate-200 bg-slate-50 p-6 [html[data-theme='sunset']_&]:border-[#9a3412] [html[data-theme='sunset']_&]:bg-[#451a03]">
                            <p class="text-xs font-bold uppercase tracking-[0.24em] text-primary">Product teams</p>
                            <h3 class="mt-3 text-xl font-bold text-slate-900 [html[data-theme='sunset']_&]:text-[#fed7aa]">Scalable packaging</h3>
                            <p class="mt-3 text-sm leading-7 text-slate-600 [html[data-theme='sunset']_&]:text-[#fed7aa]/80">Support demo users, internal teams, and enterprise customers with one backend model.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="overflow-hidden bg-slate-900 py-16 text-white [html[data-theme='sunset']_&]:bg-[#451a03] sm:py-24">
            <div class="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-20">
                <div class="grid items-center gap-10 lg:grid-cols-[1fr_0.95fr] lg:gap-12">
                    <div>
                        <p class="text-sm font-bold uppercase tracking-[0.3em] text-primary">API Preview</p>
                        <h2 class="mt-4 text-3xl font-black tracking-tight [html[data-theme='sunset']_&]:text-[#fed7aa] sm:text-4xl">One platform, versioned and production-friendly.</h2>
                        <p class="mt-6 max-w-2xl text-base leading-7 text-slate-300 [html[data-theme='sunset']_&]:text-[#fed7aa]/80 sm:text-lg sm:leading-8">
                            Use v2 for auth and user management, and v3 for points, permissions, dashboard, admin,
                            and conversion workflows.
                        </p>
                    </div>
                    <div class="rounded-3xl border border-slate-800 bg-[#0f172a] p-6 shadow-2xl [html[data-theme='sunset']_&]:border-[#9a3412] [html[data-theme='sunset']_&]:bg-[#7c2d12]">
                        <div class="mb-4 flex items-center justify-between border-b border-slate-800 pb-4 [html[data-theme='sunset']_&]:border-[#9a3412]">
                            <span class="font-mono text-sm font-bold text-primary">POST /api/v3/conversions/pdf-to-word</span>
                            <div class="flex gap-2">
                                <span class="h-2.5 w-2.5 rounded-full bg-red-500"></span>
                                <span class="h-2.5 w-2.5 rounded-full bg-yellow-500"></span>
                                <span class="h-2.5 w-2.5 rounded-full bg-green-500"></span>
                            </div>
                        </div>
                        <pre class="overflow-x-auto whitespace-pre-wrap break-words text-sm leading-7 text-slate-300 [html[data-theme='sunset']_&]:text-[#fed7aa]/90"><code><span class="text-pink-400">curl</span> -X POST http://127.0.0.1:8000/api/v3/conversions/pdf-to-word \\
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

        <section class="bg-white py-16 [html[data-theme='sunset']_&]:bg-[#7c2d12] sm:py-24">
            <div class="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-20">
                <div class="rounded-[2rem] border border-slate-200 bg-slate-50 px-5 py-10 text-center [html[data-theme='sunset']_&]:border-[#9a3412] [html[data-theme='sunset']_&]:bg-[#451a03] sm:px-8 sm:py-14">
                    <h2 class="text-3xl font-black tracking-tight text-slate-900 [html[data-theme='sunset']_&]:text-[#fed7aa] sm:text-4xl">Ship faster with a complete conversion stack.</h2>
                    <p class="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 [html[data-theme='sunset']_&]:text-[#fed7aa]/80 sm:text-lg sm:leading-8">
                        Start with the docs, choose a pricing tier, and integrate the endpoints your team needs.
                    </p>
                    <div class="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
                        <a href="/docs"
                            class="rounded-2xl bg-primary px-8 py-4 text-sm font-bold text-white shadow-xl shadow-primary/20 transition-all hover:bg-primary/90">
                            Read Documentation
                        </a>
                        <a href="/pricing"
                            class="rounded-2xl border border-slate-200 bg-white px-8 py-4 text-sm font-bold text-slate-900 transition-all hover:border-primary/30 hover:text-primary [html[data-theme='sunset']_&]:border-[#9a3412] [html[data-theme='sunset']_&]:bg-[#7c2d12] [html[data-theme='sunset']_&]:text-[#fed7aa]">
                            Compare Pricing
                        </a>
                    </div>
                </div>
            </div>
        </section>
    </main>
`;

  return (
    <div className="text-slate-900 font-display">
      <div dangerouslySetInnerHTML={{ __html: markup }} />
    </div>
  );
}
