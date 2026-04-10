export default function Page() {
  const markup = `
<div class="flex min-h-screen">
        <!-- Sidebar Navigation -->
        <aside
            class="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col fixed h-full">
            <div class="p-6 flex items-center gap-3">
                <div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white">
                    <span class="material-symbols-outlined">sync_alt</span>
                </div>
                <div>
                    <h1 class="font-bold text-lg leading-tight">ConvertPro</h1>
                    <p class="text-xs text-slate-500 font-medium uppercase tracking-wider">Premium SaaS Tool</p>
                </div>
            </div>
            <nav class="flex-1 px-4 space-y-1">
                <a class="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary font-semibold"
                    href="/dashboard">
                    <span class="material-symbols-outlined">dashboard</span>
                    Dashboard
                </a>
                <a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors"
                    href="/dashboard/api-keys">
                    <span class="material-symbols-outlined">key</span>
                    API Keys
                </a>
                <a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors"
                    href="/dashboard/usage">
                    <span class="material-symbols-outlined">bar_chart</span>
                    Usage Statistics
                </a>
                <a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors"
                    href="/dashboard/request-history">
                    <span class="material-symbols-outlined">history</span>
                    Request History
                </a>
                <a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors"
                    href="/dashboard/billing">
                    <span class="material-symbols-outlined">credit_card</span>
                    Billing &amp; Plan
                </a>
                <a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors"
                    href="/dashboard/team">
                    <span class="material-symbols-outlined">group</span>
                    Team Members
                </a>
            </nav>
            <div class="p-4 mt-auto border-t border-slate-200 dark:border-slate-800">
                <a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors"
                    href="/dashboard/settings">
                    <span class="material-symbols-outlined">settings</span>
                    Settings
                </a>
                <div class="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <div class="flex justify-between text-xs font-bold mb-2">
                        <span>PLAN LIMIT</span>
                        <span>43%</span>
                    </div>
                    <div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mb-2">
                        <div class="bg-primary h-1.5 rounded-full" style="width: 43%"></div>
                    </div>
                    <p class="text-[10px] text-slate-500 uppercase">4,320 / 10,000 Requests</p>
                </div>
            </div>
        </aside>
        <!-- Main Content Area -->
        <main class="flex-1 ml-72">
            <!-- Top Navigation -->
            <header
                class="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10 px-8 flex items-center justify-between">
                <div class="flex items-center gap-4">
                    <span
                        class="px-3 py-1 bg-primary text-white text-[10px] font-bold rounded-full uppercase tracking-widest">Admin
                        Plan</span>
                    <div class="h-4 w-px bg-slate-300 dark:bg-slate-700"></div>
                    <div class="hidden md:flex items-center gap-2 text-sm text-slate-500">
                        <span class="material-symbols-outlined text-sm">cloud_done</span>
                        <span>API Status: Healthy</span>
                    </div>
                </div>
                <div class="flex items-center gap-4">
                    <button class="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg relative">
                        <span class="material-symbols-outlined">notifications</span>
                        <span
                            class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                    </button>
                    <div class="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
                        <div class="text-right">
                            <p class="text-sm font-bold leading-none">Alex Rivera</p>
                            <p class="text-[10px] text-slate-500 font-medium uppercase mt-1">Technical Lead</p>
                        </div>
                        <div
                            class="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-slate-100 dark:border-slate-800">
                            <img alt="User Profile" data-alt="Professional portrait of a male developer"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBP8t9xa83PyPsCqbQ1lPQTqu_9nsY0kLpxsfIaeUdyFagI3hv8IftRqU1z5S2-uEx8Lh_3dxRQZq4iDENdIReJJK91AUFAwjcLGAMGu8a1AHbVzqVVEWbi0EuZSIl-o2qXnk9Gj-6HufCZfURzPpwRQMuHZQ7rxsGQjflgRLII-BKKicAhSu9FeDUtb6Wkxc_mxOsdvKEZd4nU03v_aCDESSsKx3Of1zM7nty7Bzr9jtsS0HpJTTB2pa2YrWIcQlTx3msnZErrfU8E" />
                        </div>
                    </div>
                </div>
            </header>
            <div class="p-8 max-w-7xl mx-auto space-y-8">
                <!-- Welcome Header -->
                <div>
                    <h2 class="text-3xl font-extrabold tracking-tight">Welcome back, Alex</h2>
                    <p class="text-slate-500 mt-1">Here is what's happening with your API integrations today.</p>
                </div>
                <!-- Stats Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div
                        class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div class="flex justify-between items-start mb-4">
                            <span class="p-2 bg-primary/10 text-primary rounded-lg">
                                <span class="material-symbols-outlined">api</span>
                            </span>
                            <span class="text-emerald-500 text-xs font-bold flex items-center gap-1">
                                <span class="material-symbols-outlined text-xs">trending_up</span>
                                +12%
                            </span>
                        </div>
                        <p class="text-sm font-medium text-slate-500">Monthly Requests</p>
                        <p class="text-2xl font-bold mt-1">5,680</p>
                    </div>
                    <div
                        class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div class="flex justify-between items-start mb-4">
                            <span
                                class="p-2 bg-orange-100 text-orange-600 rounded-lg dark:bg-orange-900/20 dark:text-orange-400">
                                <span class="material-symbols-outlined">hourglass_empty</span>
                            </span>
                        </div>
                        <p class="text-sm font-medium text-slate-500">Remaining</p>
                        <p class="text-2xl font-bold mt-1">4,320</p>
                    </div>
                    <div
                        class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div class="flex justify-between items-start mb-4">
                            <span
                                class="p-2 bg-emerald-100 text-emerald-600 rounded-lg dark:bg-emerald-900/20 dark:text-emerald-400">
                                <span class="material-symbols-outlined">check_circle</span>
                            </span>
                        </div>
                        <p class="text-sm font-medium text-slate-500">Success Rate</p>
                        <p class="text-2xl font-bold mt-1">99.2%</p>
                    </div>
                    <div
                        class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div class="flex justify-between items-start mb-4">
                            <span
                                class="p-2 bg-purple-100 text-purple-600 rounded-lg dark:bg-purple-900/20 dark:text-purple-400">
                                <span class="material-symbols-outlined">bolt</span>
                            </span>
                        </div>
                        <p class="text-sm font-medium text-slate-500">Avg. Latency</p>
                        <p class="text-2xl font-bold mt-1">142ms</p>
                    </div>
                </div>
                <!-- Usage Chart Placeholder -->
                <div
                    class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div class="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <h3 class="font-bold text-lg">API Performance (30 Days)</h3>
                        <div class="flex gap-2">
                            <button
                                class="px-3 py-1 text-xs font-semibold bg-primary text-white rounded-lg">Daily</button>
                            <button
                                class="px-3 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">Weekly</button>
                        </div>
                    </div>
                    <div class="p-8 h-64 flex items-end gap-2">
                        <!-- Simulated Chart Bars/Line with Tailwind -->
                        <div class="flex-1 bg-primary/20 hover:bg-primary transition-all rounded-t-lg h-[40%]"></div>
                        <div class="flex-1 bg-primary/20 hover:bg-primary transition-all rounded-t-lg h-[55%]"></div>
                        <div class="flex-1 bg-primary/20 hover:bg-primary transition-all rounded-t-lg h-[30%]"></div>
                        <div class="flex-1 bg-primary/20 hover:bg-primary transition-all rounded-t-lg h-[45%]"></div>
                        <div class="flex-1 bg-primary/20 hover:bg-primary transition-all rounded-t-lg h-[70%]"></div>
                        <div class="flex-1 bg-primary/20 hover:bg-primary transition-all rounded-t-lg h-[85%]"></div>
                        <div class="flex-1 bg-primary/20 hover:bg-primary transition-all rounded-t-lg h-[60%]"></div>
                        <div class="flex-1 bg-primary/20 hover:bg-primary transition-all rounded-t-lg h-[45%]"></div>
                        <div class="flex-1 bg-primary/20 hover:bg-primary transition-all rounded-t-lg h-[35%]"></div>
                        <div class="flex-1 bg-primary/20 hover:bg-primary transition-all rounded-t-lg h-[50%]"></div>
                        <div class="flex-1 bg-primary/20 hover:bg-primary transition-all rounded-t-lg h-[90%]"></div>
                        <div class="flex-1 bg-primary/20 hover:bg-primary transition-all rounded-t-lg h-[75%]"></div>
                        <div class="flex-1 bg-primary/20 hover:bg-primary transition-all rounded-t-lg h-[40%]"></div>
                        <div class="flex-1 bg-primary/20 hover:bg-primary transition-all rounded-t-lg h-[25%]"></div>
                    </div>
                </div>
                <!-- API Keys & History Layout -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <!-- API Keys Section -->
                    <div class="lg:col-span-1 space-y-6">
                        <div
                            class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div class="flex items-center justify-between mb-6">
                                <h3 class="font-bold">Primary API Key</h3>
                                <button class="text-primary text-sm font-bold hover:underline">Manage All</button>
                            </div>
                            <div class="space-y-4">
                                <div
                                    class="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-between group">
                                    <code
                                        class="text-sm font-mono text-slate-600 dark:text-slate-300">pk_live_••••••••••••4f2a</code>
                                    <div class="flex gap-1">
                                        <button class="p-1.5 text-slate-400 hover:text-primary transition-colors">
                                            <span class="material-symbols-outlined text-sm">content_copy</span>
                                        </button>
                                        <button class="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
                                            <span class="material-symbols-outlined text-sm">refresh</span>
                                        </button>
                                    </div>
                                </div>
                                <button
                                    class="w-full py-3 bg-primary text-white rounded-lg font-bold text-sm shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:bg-primary/90 transition-all">
                                    <span class="material-symbols-outlined text-lg">add</span>
                                    Create New Key
                                </button>
                            </div>
                        </div>
                        <!-- Mini Documentation -->
                        <div class="bg-slate-900 text-white p-6 rounded-xl border border-slate-800 shadow-sm">
                            <h4 class="font-bold mb-2">Quick Implementation</h4>
                            <p class="text-xs text-slate-400 mb-4">Integrate ConvertPro into your workflow in minutes
                                using our SDK.</p>
                            <div class="bg-black/50 p-3 rounded-lg font-mono text-[11px] leading-relaxed text-blue-300">
                                <span class="text-purple-400">curl</span> -X POST https://api.convertpro.com/v1/convert
                                \<br />
                                  -H <span class="text-emerald-400">"Authorization: Bearer YOUR_KEY"</span>
                            </div>
                        </div>
                    </div>
                    <!-- Recent History Table -->
                    <div class="lg:col-span-2">
                        <div
                            class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                            <div
                                class="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <h3 class="font-bold text-lg">Recent History</h3>
                                <button
                                    class="p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all">
                                    <span class="material-symbols-outlined">filter_list</span>
                                </button>
                            </div>
                            <div class="overflow-x-auto">
                                <table class="w-full text-left">
                                    <thead>
                                        <tr
                                            class="text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/50">
                                            <th class="px-6 py-4">Endpoint</th>
                                            <th class="px-6 py-4">Status</th>
                                            <th class="px-6 py-4">Time</th>
                                            <th class="px-6 py-4">Size</th>
                                            <th class="px-6 py-4">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                                        <tr>
                                            <td class="px-6 py-4">
                                                <div class="flex items-center gap-2">
                                                    <span class="w-2 h-2 rounded-full bg-blue-500"></span>
                                                    <span class="font-medium text-sm">/pdf-to-docx</span>
                                                </div>
                                            </td>
                                            <td class="px-6 py-4">
                                                <span
                                                    class="px-2.5 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full text-[11px] font-bold">Success</span>
                                            </td>
                                            <td class="px-6 py-4 text-sm text-slate-500">1.2s</td>
                                            <td class="px-6 py-4 text-sm text-slate-500">4.5 MB</td>
                                            <td class="px-6 py-4 text-sm text-slate-500">Oct 24, 14:22</td>
                                        </tr>
                                        <tr>
                                            <td class="px-6 py-4">
                                                <div class="flex items-center gap-2">
                                                    <span class="w-2 h-2 rounded-full bg-purple-500"></span>
                                                    <span class="font-medium text-sm">/img-optimize</span>
                                                </div>
                                            </td>
                                            <td class="px-6 py-4">
                                                <span
                                                    class="px-2.5 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-[11px] font-bold">Processing</span>
                                            </td>
                                            <td class="px-6 py-4 text-sm text-slate-500">0.8s</td>
                                            <td class="px-6 py-4 text-sm text-slate-500">12.1 MB</td>
                                            <td class="px-6 py-4 text-sm text-slate-500">Oct 24, 14:15</td>
                                        </tr>
                                        <tr>
                                            <td class="px-6 py-4">
                                                <div class="flex items-center gap-2">
                                                    <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                                                    <span class="font-medium text-sm">/doc-to-html</span>
                                                </div>
                                            </td>
                                            <td class="px-6 py-4">
                                                <span
                                                    class="px-2.5 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full text-[11px] font-bold">Failed</span>
                                            </td>
                                            <td class="px-6 py-4 text-sm text-slate-500">--</td>
                                            <td class="px-6 py-4 text-sm text-slate-500">2.1 MB</td>
                                            <td class="px-6 py-4 text-sm text-slate-500">Oct 24, 13:58</td>
                                        </tr>
                                        <tr>
                                            <td class="px-6 py-4">
                                                <div class="flex items-center gap-2">
                                                    <span class="w-2 h-2 rounded-full bg-blue-500"></span>
                                                    <span class="font-medium text-sm">/pdf-to-docx</span>
                                                </div>
                                            </td>
                                            <td class="px-6 py-4">
                                                <span
                                                    class="px-2.5 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full text-[11px] font-bold">Success</span>
                                            </td>
                                            <td class="px-6 py-4 text-sm text-slate-500">1.4s</td>
                                            <td class="px-6 py-4 text-sm text-slate-500">3.8 MB</td>
                                            <td class="px-6 py-4 text-sm text-slate-500">Oct 24, 13:45</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div class="p-4 bg-slate-50 dark:bg-slate-800/50 text-center">
                                <button class="text-sm font-bold text-primary hover:underline">View Full Logs</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
`;
  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
      <div dangerouslySetInnerHTML={{ __html: markup }} />
    </div>
  );
}
