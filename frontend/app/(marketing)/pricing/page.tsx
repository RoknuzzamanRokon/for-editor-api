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
                <a class="text-base font-semibold text-slate-600 transition-colors hover:text-primary dark:text-slate-400"
                    href="/features">Features</a>
                <a class="text-base font-semibold text-primary" href="/pricing">Pricing</a>
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
                    class="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all duration-200 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/25 hover:ring-4 hover:ring-primary/15 active:scale-[0.98] sm:px-6 sm:py-3 sm:text-base"
                    href="/login">Login</a>
            </div>
        </div>
        <div class="border-t border-slate-200/70 px-4 py-3 dark:border-slate-800 lg:hidden">
            <nav class="flex items-center gap-3 overflow-x-auto whitespace-nowrap text-sm font-semibold">
                <a class="rounded-full bg-slate-100 px-3 py-1.5 text-slate-700 dark:bg-slate-900 dark:text-slate-300" href="/features">Features</a>
                <a class="rounded-full bg-primary/10 px-3 py-1.5 text-primary" href="/pricing">Pricing</a>
                <a class="rounded-full bg-slate-100 px-3 py-1.5 text-slate-700 dark:bg-slate-900 dark:text-slate-300" href="/docs">Documentation</a>
                <a class="rounded-full bg-slate-100 px-3 py-1.5 text-slate-700 dark:bg-slate-900 dark:text-slate-300" href="/dashboard">Dashboard</a>
            </nav>
        </div>
    </header>
    <main class="bg-background-light pt-36 dark:bg-background-dark lg:pt-24">
        <div class="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 sm:py-12 lg:px-20">
        <!-- Hero Section -->
        <section class="relative mb-16 flex flex-col items-center text-center lg:mb-20">
            <div
                class="absolute -top-24 left-1/2 -z-10 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]">
            </div>
            <div
                class="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
                <span class="mr-2">✨</span> New: Enterprise-grade infrastructure
            </div>
            <h1 class="max-w-3xl text-4xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
                Simple, Transparent <span class="text-primary">Pricing</span>
            </h1>
            <p class="mt-6 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400 sm:text-lg sm:leading-relaxed">
                Choose the plan that fits your integration needs. Scale as you grow with our powerful API, built for
                developers by developers.
            </p>
            <!-- Toggle -->
            <div class="mt-10 flex flex-col items-center justify-center gap-4 sm:mt-12 sm:flex-row">
                <span class="text-sm font-medium text-slate-600 dark:text-slate-400">Monthly</span>
                <div
                    class="flex h-10 w-full max-w-[16rem] items-center justify-center rounded-xl bg-slate-200/50 p-1 dark:bg-slate-800">
                    <button
                        class="h-full w-1/2 rounded-lg bg-white text-sm font-bold text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white">Yearly</button>
                    <button
                        class="h-full w-1/2 text-sm font-medium text-slate-600 transition-colors hover:text-primary dark:text-slate-400">Monthly</button>
                </div>
                <div class="flex items-center gap-1">
                    <span class="text-sm font-medium text-slate-600 dark:text-slate-400">Yearly</span>
                    <span
                        class="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">Save
                        20%</span>
                </div>
            </div>
        </section>
        <!-- Pricing Cards -->
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            <!-- Demo -->
            <div
                class="group flex flex-col rounded-xl border border-slate-200 bg-white p-8 transition-all hover:shadow-2xl hover:shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900/50">
                <div class="mb-6">
                    <h3 class="text-lg font-bold text-slate-900 dark:text-white">Demo</h3>
                    <div class="mt-4 flex items-baseline">
                        <span class="text-4xl font-black text-slate-900 dark:text-white">$0</span>
                        <span class="ml-1 text-slate-500">/mo</span>
                    </div>
                    <p class="mt-2 text-xs text-slate-500">Perfect for testing and small personal projects.</p>
                </div>
                <button
                    class="w-full rounded-xl bg-slate-100 py-3 text-sm font-bold text-slate-900 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700">
                    Start Free
                </button>
                <div class="mt-8 flex flex-col gap-4">
                    <div class="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                        <span class="material-symbols-outlined text-primary text-xl">check_circle</span>
                        100 requests / month
                    </div>
                    <div class="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                        <span class="material-symbols-outlined text-primary text-xl">check_circle</span>
                        Basic Converters
                    </div>
                    <div class="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                        <span class="material-symbols-outlined text-primary text-xl">check_circle</span>
                        Community Support
                    </div>
                </div>
            </div>
            <!-- General -->
            <div
                class="group flex flex-col rounded-xl border border-slate-200 bg-white p-8 transition-all hover:shadow-2xl hover:shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900/50">
                <div class="mb-6">
                    <h3 class="text-lg font-bold text-slate-900 dark:text-white">General</h3>
                    <div class="mt-4 flex items-baseline">
                        <span class="text-4xl font-black text-slate-900 dark:text-white">$19</span>
                        <span class="ml-1 text-slate-500">/mo</span>
                    </div>
                    <p class="mt-2 text-xs text-slate-500">Ideal for professional developers and startups.</p>
                </div>
                <button
                    class="w-full rounded-xl bg-slate-100 py-3 text-sm font-bold text-slate-900 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700">
                    Get Started
                </button>
                <div class="mt-8 flex flex-col gap-4">
                    <div class="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                        <span class="material-symbols-outlined text-primary text-xl">check_circle</span>
                        10k requests / month
                    </div>
                    <div class="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                        <span class="material-symbols-outlined text-primary text-xl">check_circle</span>
                        All Converters
                    </div>
                    <div class="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                        <span class="material-symbols-outlined text-primary text-xl">check_circle</span>
                        Email Support
                    </div>
                </div>
            </div>
            <!-- Admin (Most Popular) -->
            <div
                class="relative flex flex-col rounded-xl border-2 border-primary bg-white p-8 shadow-2xl shadow-primary/10 transition-all hover:shadow-primary/20 dark:bg-slate-900">
                <div
                    class="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-black uppercase tracking-wider text-white">
                    Most Popular
                </div>
                <div class="mb-6">
                    <h3 class="text-lg font-bold text-slate-900 dark:text-white">Admin</h3>
                    <div class="mt-4 flex items-baseline">
                        <span class="text-4xl font-black text-slate-900 dark:text-white">$49</span>
                        <span class="ml-1 text-slate-500">/mo</span>
                    </div>
                    <p class="mt-2 text-xs text-slate-500">Scale your business with high-volume access.</p>
                </div>
                <button
                    class="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-xl">
                    Get Started
                </button>
                <div class="mt-8 flex flex-col gap-4">
                    <div class="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                        <span class="material-symbols-outlined text-primary text-xl">check_circle</span>
                        50k requests / month
                    </div>
                    <div class="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                        <span class="material-symbols-outlined text-primary text-xl">check_circle</span>
                        Priority Access
                    </div>
                    <div class="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                        <span class="material-symbols-outlined text-primary text-xl">check_circle</span>
                        24/7 Priority Support
                    </div>
                    <div class="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                        <span class="material-symbols-outlined text-primary text-xl">check_circle</span>
                        Advanced Analytics
                    </div>
                </div>
            </div>
            <!-- Enterprise -->
            <div
                class="group flex flex-col rounded-xl border border-slate-200 bg-white p-8 transition-all hover:shadow-2xl hover:shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900/50">
                <div class="mb-6">
                    <h3 class="text-lg font-bold text-slate-900 dark:text-white">Enterprise</h3>
                    <div class="mt-4 flex items-baseline">
                        <span class="text-4xl font-black text-slate-900 dark:text-white">Custom</span>
                    </div>
                    <p class="mt-2 text-xs text-slate-500">Dedicated solutions for large organizations.</p>
                </div>
                <button
                    class="w-full rounded-xl bg-slate-100 py-3 text-sm font-bold text-slate-900 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700">
                    Contact Sales
                </button>
                <div class="mt-8 flex flex-col gap-4">
                    <div class="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                        <span class="material-symbols-outlined text-primary text-xl">check_circle</span>
                        Unlimited requests
                    </div>
                    <div class="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                        <span class="material-symbols-outlined text-primary text-xl">check_circle</span>
                        Custom Integrations
                    </div>
                    <div class="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                        <span class="material-symbols-outlined text-primary text-xl">check_circle</span>
                        Dedicated Manager
                    </div>
                    <div class="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                        <span class="material-symbols-outlined text-primary text-xl">check_circle</span>
                        SLA Guarantee
                    </div>
                </div>
            </div>
        </div>
        <!-- Comparison Table Section -->
        <section class="mt-20 sm:mt-32">
            <h2 class="mb-12 text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Compare Plan
                Features</h2>
            <div class="overflow-x-auto"
                ><div
                class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <table class="min-w-[760px] w-full text-left">
                    <thead>
                        <tr class="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
                            <th class="px-8 py-5 text-sm font-bold text-slate-900 dark:text-white">Feature</th>
                            <th class="px-8 py-5 text-sm font-bold text-slate-900 dark:text-white">Demo</th>
                            <th class="px-8 py-5 text-sm font-bold text-slate-900 dark:text-white">General</th>
                            <th class="px-8 py-5 text-sm font-bold text-slate-900 dark:text-white">Admin</th>
                            <th class="px-8 py-5 text-sm font-bold text-slate-900 dark:text-white">Enterprise</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
                        <tr>
                            <td class="px-8 py-5 text-sm text-slate-600 dark:text-slate-400">Monthly Request Limit</td>
                            <td class="px-8 py-5 text-sm text-slate-900 dark:text-white">100</td>
                            <td class="px-8 py-5 text-sm text-slate-900 dark:text-white">10,000</td>
                            <td class="px-8 py-5 text-sm text-slate-900 dark:text-white font-bold">50,000</td>
                            <td class="px-8 py-5 text-sm text-slate-900 dark:text-white">Unlimited</td>
                        </tr>
                        <tr>
                            <td class="px-8 py-5 text-sm text-slate-600 dark:text-slate-400">API Speed Rate Limit</td>
                            <td class="px-8 py-5 text-sm text-slate-900 dark:text-white">5 req/s</td>
                            <td class="px-8 py-5 text-sm text-slate-900 dark:text-white">20 req/s</td>
                            <td class="px-8 py-5 text-sm text-slate-900 dark:text-white">100 req/s</td>
                            <td class="px-8 py-5 text-sm text-slate-900 dark:text-white">Custom</td>
                        </tr>
                        <tr>
                            <td class="px-8 py-5 text-sm text-slate-600 dark:text-slate-400">Data Formats</td>
                            <td class="px-8 py-5 text-sm text-slate-900 dark:text-white">Basic (JSON/CSV)</td>
                            <td class="px-8 py-5 text-sm text-slate-900 dark:text-white">All Standard</td>
                            <td class="px-8 py-5 text-sm text-slate-900 dark:text-white">All Standard</td>
                            <td class="px-8 py-5 text-sm text-slate-900 dark:text-white">Full Access</td>
                        </tr>
                        <tr>
                            <td class="px-8 py-5 text-sm text-slate-600 dark:text-slate-400">Team Members</td>
                            <td class="px-8 py-5 text-sm text-slate-900 dark:text-white">1</td>
                            <td class="px-8 py-5 text-sm text-slate-900 dark:text-white">3</td>
                            <td class="px-8 py-5 text-sm text-slate-900 dark:text-white">10</td>
                            <td class="px-8 py-5 text-sm text-slate-900 dark:text-white">Unlimited</td>
                        </tr>
                        <tr>
                            <td class="px-8 py-5 text-sm text-slate-600 dark:text-slate-400">Analytics Dashboard</td>
                            <td class="px-8 py-5 text-sm text-slate-900 dark:text-white"><span
                                    class="material-symbols-outlined text-slate-300">remove</span></td>
                            <td class="px-8 py-5 text-sm text-slate-900 dark:text-white">Basic</td>
                            <td class="px-8 py-5 text-sm text-slate-900 dark:text-white font-bold">Advanced</td>
                            <td class="px-8 py-5 text-sm text-slate-900 dark:text-white font-bold">Real-time</td>
                        </tr>
                    </tbody>
                </table>
            </div></div>
        </section>
        <!-- FAQ Section -->
        <section class="mt-20 max-w-4xl mx-auto sm:mt-32">
            <h2 class="mb-12 text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Frequently
                Asked Questions</h2>
            <div class="space-y-4">
                <div
                    class="group rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                    <button class="flex w-full items-center justify-between text-left">
                        <span class="pr-4 text-base font-bold text-slate-900 dark:text-white sm:text-lg">Can I switch plans
                            anytime?</span>
                        <span
                            class="material-symbols-outlined transition-transform group-hover:rotate-180">expand_more</span>
                    </button>
                    <div class="mt-4 text-slate-600 dark:text-slate-400">
                        Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next
                        billing cycle.
                    </div>
                </div>
                <div
                    class="group rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                    <button class="flex w-full items-center justify-between text-left">
                        <span class="pr-4 text-base font-bold text-slate-900 dark:text-white sm:text-lg">What happens if I exceed my
                            request limit?</span>
                        <span
                            class="material-symbols-outlined transition-transform group-hover:rotate-180">expand_more</span>
                    </button>
                    <div class="mt-4 text-slate-600 dark:text-slate-400">
                        Once you reach your limit, additional requests will be billed at a small overage rate or paused
                        depending on your settings.
                    </div>
                </div>
                <div
                    class="group rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                    <button class="flex w-full items-center justify-between text-left">
                        <span class="pr-4 text-base font-bold text-slate-900 dark:text-white sm:text-lg">Do you offer custom API
                            endpoints?</span>
                        <span
                            class="material-symbols-outlined transition-transform group-hover:rotate-180">expand_more</span>
                    </button>
                    <div class="mt-4 text-slate-600 dark:text-slate-400">
                        Custom endpoints and tailored transformation logic are available exclusively on our Enterprise
                        plan.
                    </div>
                </div>
            </div>
        </section>
        <!-- CTA Section -->
        <section class="mt-20 mb-16 sm:mt-32 sm:mb-20">
            <div
                class="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary to-blue-700 p-6 text-center text-white sm:p-12 lg:p-20">
                <div class="absolute inset-0 bg-grid-pattern opacity-10"></div>
                <div class="relative z-10 flex flex-col items-center">
                    <h2 class="text-3xl font-black sm:text-4xl lg:text-5xl">Ready to integrate?</h2>
                    <p class="mt-6 max-w-xl text-base text-blue-100 sm:text-lg">
                        Get your API key in minutes and start transforming your data with the most reliable converter
                        API on the market.
                    </p>
                    <div class="mt-10 flex flex-col items-center gap-4 sm:flex-row">
                        <button
                            class="rounded-xl bg-white px-6 py-4 text-base font-bold text-primary shadow-xl transition-transform hover:scale-105 active:scale-95 sm:px-8 sm:text-lg">
                            Get Your API Key Now
                        </button>
                        <button
                            class="rounded-xl bg-primary/20 border border-white/20 px-6 py-4 text-base font-bold text-white transition-colors hover:bg-primary/30 sm:px-8 sm:text-lg">
                            Book a Demo
                        </button>
                    </div>
                </div>
            </div>
        </section>
        </div>
    </main>
    <!-- Footer -->
    <footer class="border-t border-slate-200 bg-white py-16 dark:border-slate-800 dark:bg-background-dark">
        <div class="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-20">
            <div class="grid grid-cols-2 gap-12 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
                <div class="col-span-2">
                    <div class="flex items-center gap-2 mb-6">
                        <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
                            <span class="material-symbols-outlined text-sm">sync_alt</span>
                        </div>
                        <span class="text-lg font-bold tracking-tight text-slate-900 dark:text-white">ConvertPro <span
                                class="text-primary">API</span></span>
                    </div>
                    <p class="max-w-xs text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                        The world's most flexible data conversion API for modern applications. Scale with confidence.
                    </p>
                </div>
                <div>
                    <h4 class="mb-6 text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">Product
                    </h4>
                    <ul class="space-y-4 text-sm text-slate-600 dark:text-slate-400">
                        <li><a class="hover:text-primary transition-colors" href="/features">Features</a></li>
                        <li><a class="hover:text-primary transition-colors" href="#">Security</a></li>
                        <li><a class="hover:text-primary transition-colors" href="#">Roadmap</a></li>
                        <li><a class="hover:text-primary transition-colors" href="/pricing">Pricing</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="mb-6 text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">Resources
                    </h4>
                    <ul class="space-y-4 text-sm text-slate-600 dark:text-slate-400">
                        <li><a class="hover:text-primary transition-colors" href="#">API Docs</a></li>
                        <li><a class="hover:text-primary transition-colors" href="#">Guides</a></li>
                        <li><a class="hover:text-primary transition-colors" href="#">Community</a></li>
                        <li><a class="hover:text-primary transition-colors" href="#">Support</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="mb-6 text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">Company
                    </h4>
                    <ul class="space-y-4 text-sm text-slate-600 dark:text-slate-400">
                        <li><a class="hover:text-primary transition-colors" href="#">About Us</a></li>
                        <li><a class="hover:text-primary transition-colors" href="#">Contact</a></li>
                        <li><a class="hover:text-primary transition-colors" href="#">Privacy Policy</a></li>
                        <li><a class="hover:text-primary transition-colors" href="#">Terms of Service</a></li>
                    </ul>
                </div>
            </div>
            <div
                class="mt-20 flex flex-col items-center justify-between gap-6 border-t border-slate-100 pt-8 dark:border-slate-800 sm:flex-row">
                <p class="text-sm text-slate-500">© 2026 ConvertPro Inc. All rights reserved.</p>
                <div class="flex items-center gap-6">
                    <a class="text-slate-400 hover:text-primary transition-colors" href="#">
                        <span class="material-symbols-outlined">public</span>
                    </a>
                    <a class="text-slate-400 hover:text-primary transition-colors" href="#">
                        <span class="material-symbols-outlined">alternate_email</span>
                    </a>
                    <a class="text-slate-400 hover:text-primary transition-colors" href="#">
                        <span class="material-symbols-outlined">chat_bubble</span>
                    </a>
                </div>
            </div>
        </div>
    </footer>
`;
  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display selection:bg-primary/30">
      <div dangerouslySetInnerHTML={{ __html: markup }} />
    </div>
  );
}
