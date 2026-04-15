export default function Page() {
  const markup = `
    <main class="pt-36 lg:pt-24">
        <div class="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 sm:py-12 lg:px-20">
        <section class="relative mb-16 flex flex-col items-center text-center lg:mb-20">
            <div class="absolute -top-24 left-1/2 -z-10 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]"></div>
            <div class="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
                <span class="mr-2">✨</span> New: Enterprise-grade infrastructure
            </div>
            <h1 class="max-w-3xl text-4xl font-black tracking-tight text-slate-900 [html[data-theme='sunset']_&]:text-[#fed7aa] sm:text-5xl lg:text-6xl">
                Simple, Transparent <span class="text-primary">Pricing</span>
            </h1>
            <p class="mt-6 max-w-2xl text-base leading-7 text-slate-600 [html[data-theme='sunset']_&]:text-[#fed7aa]/80 sm:text-lg sm:leading-relaxed">
                Choose the plan that fits your integration needs. Scale as you grow with our powerful API, built for developers by developers.
            </p>
        </section>
        
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            <div class="group flex flex-col rounded-xl border border-slate-200 bg-white p-8 transition-all hover:shadow-2xl hover:shadow-slate-200/50 [html[data-theme='sunset']_&]:border-[#9a3412] [html[data-theme='sunset']_&]:bg-[#7c2d12] [html[data-theme='sunset']_&]:hover:shadow-[#f97316]/20">
                <div class="mb-6">
                    <h3 class="text-lg font-bold text-slate-900 [html[data-theme='sunset']_&]:text-[#fed7aa]">Demo</h3>
                    <div class="mt-4 flex items-baseline">
                        <span class="text-4xl font-black text-slate-900 [html[data-theme='sunset']_&]:text-[#fed7aa]">$0</span>
                        <span class="ml-1 text-slate-500 [html[data-theme='sunset']_&]:text-[#fed7aa]/60">/mo</span>
                    </div>
                    <p class="mt-2 text-xs text-slate-500 [html[data-theme='sunset']_&]:text-[#fed7aa]/70">Perfect for testing and small personal projects.</p>
                </div>
                <button class="w-full rounded-xl bg-slate-100 py-3 text-sm font-bold text-slate-900 transition-colors hover:bg-slate-200 [html[data-theme='sunset']_&]:bg-[#451a03] [html[data-theme='sunset']_&]:text-[#fed7aa] [html[data-theme='sunset']_&]:hover:bg-[#9a3412]">
                    Start Free
                </button>
                <div class="mt-8 flex flex-col gap-4">
                    <div class="flex items-center gap-3 text-sm text-slate-600 [html[data-theme='sunset']_&]:text-[#fed7aa]/80">
                        <span class="material-symbols-outlined text-primary text-xl">check_circle</span>
                        100 requests / month
                    </div>
                    <div class="flex items-center gap-3 text-sm text-slate-600 [html[data-theme='sunset']_&]:text-[#fed7aa]/80">
                        <span class="material-symbols-outlined text-primary text-xl">check_circle</span>
                        Basic Converters
                    </div>
                    <div class="flex items-center gap-3 text-sm text-slate-600 [html[data-theme='sunset']_&]:text-[#fed7aa]/80">
                        <span class="material-symbols-outlined text-primary text-xl">check_circle</span>
                        Community Support
                    </div>
                </div>
            </div>
            
            <div class="group flex flex-col rounded-xl border border-slate-200 bg-white p-8 transition-all hover:shadow-2xl hover:shadow-slate-200/50 [html[data-theme='sunset']_&]:border-[#9a3412] [html[data-theme='sunset']_&]:bg-[#7c2d12] [html[data-theme='sunset']_&]:hover:shadow-[#f97316]/20">
                <div class="mb-6">
                    <h3 class="text-lg font-bold text-slate-900 [html[data-theme='sunset']_&]:text-[#fed7aa]">General</h3>
                    <div class="mt-4 flex items-baseline">
                        <span class="text-4xl font-black text-slate-900 [html[data-theme='sunset']_&]:text-[#fed7aa]">$19</span>
                        <span class="ml-1 text-slate-500 [html[data-theme='sunset']_&]:text-[#fed7aa]/60">/mo</span>
                    </div>
                    <p class="mt-2 text-xs text-slate-500 [html[data-theme='sunset']_&]:text-[#fed7aa]/70">Ideal for professional developers and startups.</p>
                </div>
                <button class="w-full rounded-xl bg-slate-100 py-3 text-sm font-bold text-slate-900 transition-colors hover:bg-slate-200 [html[data-theme='sunset']_&]:bg-[#451a03] [html[data-theme='sunset']_&]:text-[#fed7aa] [html[data-theme='sunset']_&]:hover:bg-[#9a3412]">
                    Get Started
                </button>
                <div class="mt-8 flex flex-col gap-4">
                    <div class="flex items-center gap-3 text-sm text-slate-600 [html[data-theme='sunset']_&]:text-[#fed7aa]/80">
                        <span class="material-symbols-outlined text-primary text-xl">check_circle</span>
                        10k requests / month
                    </div>
                    <div class="flex items-center gap-3 text-sm text-slate-600 [html[data-theme='sunset']_&]:text-[#fed7aa]/80">
                        <span class="material-symbols-outlined text-primary text-xl">check_circle</span>
                        All Converters
                    </div>
                    <div class="flex items-center gap-3 text-sm text-slate-600 [html[data-theme='sunset']_&]:text-[#fed7aa]/80">
                        <span class="material-symbols-outlined text-primary text-xl">check_circle</span>
                        Email Support
                    </div>
                </div>
            </div>
            
            <div class="relative flex flex-col rounded-xl border-2 border-primary bg-white p-8 shadow-2xl shadow-primary/10 transition-all hover:shadow-primary/20 [html[data-theme='sunset']_&]:bg-[#7c2d12]">
                <div class="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-black uppercase tracking-wider text-white">
                    Most Popular
                </div>
                <div class="mb-6">
                    <h3 class="text-lg font-bold text-slate-900 [html[data-theme='sunset']_&]:text-[#fed7aa]">Admin</h3>
                    <div class="mt-4 flex items-baseline">
                        <span class="text-4xl font-black text-slate-900 [html[data-theme='sunset']_&]:text-[#fed7aa]">$49</span>
                        <span class="ml-1 text-slate-500 [html[data-theme='sunset']_&]:text-[#fed7aa]/60">/mo</span>
                    </div>
                    <p class="mt-2 text-xs text-slate-500 [html[data-theme='sunset']_&]:text-[#fed7aa]/70">Scale your business with high-volume access.</p>
                </div>
                <button class="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-xl">
                    Get Started
                </button>
                <div class="mt-8 flex flex-col gap-4">
                    <div class="flex items-center gap-3 text-sm text-slate-600 [html[data-theme='sunset']_&]:text-[#fed7aa]/80">
                        <span class="material-symbols-outlined text-primary text-xl">check_circle</span>
                        50k requests / month
                    </div>
                    <div class="flex items-center gap-3 text-sm text-slate-600 [html[data-theme='sunset']_&]:text-[#fed7aa]/80">
                        <span class="material-symbols-outlined text-primary text-xl">check_circle</span>
                        Priority Access
                    </div>
                    <div class="flex items-center gap-3 text-sm text-slate-600 [html[data-theme='sunset']_&]:text-[#fed7aa]/80">
                        <span class="material-symbols-outlined text-primary text-xl">check_circle</span>
                        24/7 Priority Support
                    </div>
                    <div class="flex items-center gap-3 text-sm text-slate-600 [html[data-theme='sunset']_&]:text-[#fed7aa]/80">
                        <span class="material-symbols-outlined text-primary text-xl">check_circle</span>
                        Advanced Analytics
                    </div>
                </div>
            </div>
            
            <div class="group flex flex-col rounded-xl border border-slate-200 bg-white p-8 transition-all hover:shadow-2xl hover:shadow-slate-200/50 [html[data-theme='sunset']_&]:border-[#9a3412] [html[data-theme='sunset']_&]:bg-[#7c2d12] [html[data-theme='sunset']_&]:hover:shadow-[#f97316]/20">
                <div class="mb-6">
                    <h3 class="text-lg font-bold text-slate-900 [html[data-theme='sunset']_&]:text-[#fed7aa]">Enterprise</h3>
                    <div class="mt-4 flex items-baseline">
                        <span class="text-4xl font-black text-slate-900 [html[data-theme='sunset']_&]:text-[#fed7aa]">Custom</span>
                    </div>
                    <p class="mt-2 text-xs text-slate-500 [html[data-theme='sunset']_&]:text-[#fed7aa]/70">Dedicated solutions for large organizations.</p>
                </div>
                <button class="w-full rounded-xl bg-slate-100 py-3 text-sm font-bold text-slate-900 transition-colors hover:bg-slate-200 [html[data-theme='sunset']_&]:bg-[#451a03] [html[data-theme='sunset']_&]:text-[#fed7aa] [html[data-theme='sunset']_&]:hover:bg-[#9a3412]">
                    Contact Sales
                </button>
                <div class="mt-8 flex flex-col gap-4">
                    <div class="flex items-center gap-3 text-sm text-slate-600 [html[data-theme='sunset']_&]:text-[#fed7aa]/80">
                        <span class="material-symbols-outlined text-primary text-xl">check_circle</span>
                        Unlimited requests
                    </div>
                    <div class="flex items-center gap-3 text-sm text-slate-600 [html[data-theme='sunset']_&]:text-[#fed7aa]/80">
                        <span class="material-symbols-outlined text-primary text-xl">check_circle</span>
                        Custom Integrations
                    </div>
                    <div class="flex items-center gap-3 text-sm text-slate-600 [html[data-theme='sunset']_&]:text-[#fed7aa]/80">
                        <span class="material-symbols-outlined text-primary text-xl">check_circle</span>
                        Dedicated Manager
                    </div>
                    <div class="flex items-center gap-3 text-sm text-slate-600 [html[data-theme='sunset']_&]:text-[#fed7aa]/80">
                        <span class="material-symbols-outlined text-primary text-xl">check_circle</span>
                        SLA Guarantee
                    </div>
                </div>
            </div>
        </div>
        </div>
    </main>
`;
  return (
    <div className="text-slate-900 font-display">
      <div dangerouslySetInnerHTML={{ __html: markup }} />
    </div>
  );
}
