export default function Page() {
  const markup = `
<div class="flex h-screen overflow-hidden">
        <!-- Sidebar -->
        <aside
            class="w-64 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto">
            <div class="p-6">
                <div class="flex items-center gap-2 mb-8">
                    <div class="w-8 h-8 bg-primary rounded flex items-center justify-center text-white">
                        <span class="material-symbols-outlined text-xl">transform</span>
                    </div>
                    <div>
                        <h1 class="text-sm font-bold tracking-tight">ConvertPro API</h1>
                        <p class="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Enterprise Plan</p>
                    </div>
                </div>
                <nav class="space-y-1">
                    <a class="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        href="/dashboard">
                        <span class="material-symbols-outlined">dashboard</span>
                        <span class="text-sm font-medium">Dashboard</span>
                    </a>
                    <a class="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        href="/dashboard/api-keys">
                        <span class="material-symbols-outlined">key</span>
                        <span class="text-sm font-medium">API Keys</span>
                    </a>
                    <a class="flex items-center gap-3 px-3 py-2 bg-primary/10 text-primary rounded-lg" href="/dashboard/usage">
                        <span class="material-symbols-outlined">monitoring</span>
                        <span class="text-sm font-medium">Usage Statistics</span>
                    </a>
                    <a class="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        href="/dashboard/request-history">
                        <span class="material-symbols-outlined">history</span>
                        <span class="text-sm font-medium">Request History</span>
                    </a>
                    <div class="my-4 border-t border-slate-100 dark:border-slate-800"></div>
                    <a class="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        href="/dashboard/billing">
                        <span class="material-symbols-outlined">payments</span>
                        <span class="text-sm font-medium">Billing</span>
                    </a>
                    <a class="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        href="/dashboard/team">
                        <span class="material-symbols-outlined">group</span>
                        <span class="text-sm font-medium">Team</span>
                    </a>
                    <a class="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        href="/dashboard/settings">
                        <span class="material-symbols-outlined">settings</span>
                        <span class="text-sm font-medium">Settings</span>
                    </a>
                </nav>
            </div>
        </aside>
        <!-- Main Content -->
        <main class="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark">
            <!-- Top Header -->
            <header
                class="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-8">
                <div class="flex items-center gap-4">
                    <h2 class="text-lg font-semibold">Usage Statistics</h2>
                </div>
                <div class="flex items-center gap-4">
                    <div class="relative w-64">
                        <span
                            class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                        <input
                            class="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg py-1.5 pl-10 text-sm focus:ring-2 focus:ring-primary/20"
                            placeholder="Search stats..." type="text" />
                    </div>
                    <button
                        class="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                        <span class="material-symbols-outlined">notifications</span>
                    </button>
                    <div class="h-8 w-8 rounded-full bg-primary/20 overflow-hidden">
                        <img alt="Profile" class="w-full h-full object-cover" data-alt="User profile avatar placeholder"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuByp0McHqhVMShtWjheRyDOb8gebIQQ5zPk7EAXt47cF2QGQ4Cox4m74CmrUVgZ7URMfIbHG0tldhWJzbZs5E5TZvqovviu9c2HE7zx-85GQGSYmkVM-l243jy1hDote4dTWlFPqt52GQP9IR9bbdktuZEat4v1AecXxD4wfMDz8Wzc7FIozeAyzhh1Nh8sXKAF9ablbuygTX-efvrp0Vs9MVeF3xemoPhEldrIRQ2t1P76JeEg3DCxZXk8sAblLN-m36lBzKBoKfn4" />
                    </div>
                </div>
            </header>
            <div class="p-8 space-y-8">
                <!-- Stat Cards -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div
                        class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-sm font-medium text-slate-500">Total Requests</span>
                            <span
                                class="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full">+12%</span>
                        </div>
                        <div class="flex items-baseline gap-2">
                            <h3 class="text-2xl font-bold">1,204,500</h3>
                            <span class="text-xs text-slate-400">last 30 days</span>
                        </div>
                    </div>
                    <div
                        class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-sm font-medium text-slate-500">Error Rate</span>
                            <span
                                class="bg-rose-50 text-rose-600 text-[10px] font-bold px-2 py-0.5 rounded-full">-2%</span>
                        </div>
                        <div class="flex items-baseline gap-2">
                            <h3 class="text-2xl font-bold">0.04%</h3>
                            <span class="text-xs text-slate-400">stable</span>
                        </div>
                    </div>
                    <div
                        class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-sm font-medium text-slate-500">Avg Latency</span>
                            <span
                                class="bg-rose-50 text-rose-600 text-[10px] font-bold px-2 py-0.5 rounded-full">-5ms</span>
                        </div>
                        <div class="flex items-baseline gap-2">
                            <h3 class="text-2xl font-bold">124ms</h3>
                            <span class="text-xs text-slate-400">p95</span>
                        </div>
                    </div>
                </div>
                <!-- Main Chart Section -->
                <div
                    class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div class="flex items-center justify-between mb-6">
                        <div>
                            <h4 class="font-bold text-lg">Request Volume Over Time</h4>
                            <p class="text-sm text-slate-500">Visualizing total API calls per hour for the current month
                            </p>
                        </div>
                        <select
                            class="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium focus:ring-primary/20">
                            <option>Last 30 Days</option>
                            <option>Last 7 Days</option>
                            <option>Last 24 Hours</option>
                        </select>
                    </div>
                    <div class="h-64 relative">
                        <svg class="w-full h-full" preserveaspectratio="none" viewbox="0 0 1000 200">
                            <defs>
                                <lineargradient id="gradient-area" x1="0" x2="0" y1="0" y2="1">
                                    <stop offset="0%" stop-color="#2463eb" stop-opacity="0.2"></stop>
                                    <stop offset="100%" stop-color="#2463eb" stop-opacity="0"></stop>
                                </lineargradient>
                            </defs>
                            <!-- Grid lines -->
                            <line class="text-slate-100 dark:text-slate-800" stroke="currentColor" stroke-width="1"
                                x1="0" x2="1000" y1="50" y2="50"></line>
                            <line class="text-slate-100 dark:text-slate-800" stroke="currentColor" stroke-width="1"
                                x1="0" x2="1000" y1="100" y2="100"></line>
                            <line class="text-slate-100 dark:text-slate-800" stroke="currentColor" stroke-width="1"
                                x1="0" x2="1000" y1="150" y2="150"></line>
                            <!-- Area -->
                            <path
                                d="M0,150 C100,120 150,180 250,140 C350,100 450,40 550,60 C650,80 750,160 850,120 C950,80 1000,100 1000,100 V200 H0 Z"
                                fill="url(#gradient-area)"></path>
                            <!-- Line -->
                            <path
                                d="M0,150 C100,120 150,180 250,140 C350,100 450,40 550,60 C650,80 750,160 850,120 C950,80 1000,100 1000,100"
                                fill="none" stroke="#2463eb" stroke-linecap="round" stroke-width="3"></path>
                        </svg>
                        <div
                            class="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-slate-400 font-medium px-2 pt-2">
                            <span>OCT 01</span>
                            <span>OCT 07</span>
                            <span>OCT 14</span>
                            <span>OCT 21</span>
                            <span>OCT 30</span>
                        </div>
                    </div>
                </div>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <!-- Distribution Chart -->
                    <div
                        class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div class="mb-6">
                            <h4 class="font-bold text-lg">Endpoint Distribution</h4>
                            <p class="text-sm text-slate-500">Comparison of activity across major endpoints</p>
                        </div>
                        <div class="space-y-4">
                            <div class="space-y-1">
                                <div class="flex justify-between text-xs font-medium">
                                    <span>/v1/convert/pdf</span>
                                    <span>42%</span>
                                </div>
                                <div class="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div class="h-full bg-primary w-[42%]"></div>
                                </div>
                            </div>
                            <div class="space-y-1">
                                <div class="flex justify-between text-xs font-medium">
                                    <span>/v1/optimize/image</span>
                                    <span>28%</span>
                                </div>
                                <div class="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div class="h-full bg-primary/80 w-[28%]"></div>
                                </div>
                            </div>
                            <div class="space-y-1">
                                <div class="flex justify-between text-xs font-medium">
                                    <span>/v1/ocr/scan</span>
                                    <span>18%</span>
                                </div>
                                <div class="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div class="h-full bg-primary/60 w-[18%]"></div>
                                </div>
                            </div>
                            <div class="space-y-1">
                                <div class="flex justify-between text-xs font-medium">
                                    <span>/v1/metadata/extract</span>
                                    <span>12%</span>
                                </div>
                                <div class="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div class="h-full bg-primary/40 w-[12%]"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- Top Keys List -->
                    <div
                        class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div class="mb-6">
                            <h4 class="font-bold text-lg">Top API Keys by Usage</h4>
                            <p class="text-sm text-slate-500">Most active integrations for the current period</p>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="w-full text-left text-sm">
                                <thead class="border-b border-slate-100 dark:border-slate-800">
                                    <tr>
                                        <th class="pb-3 font-semibold text-slate-500 uppercase text-[10px]">Key Label
                                        </th>
                                        <th class="pb-3 font-semibold text-slate-500 uppercase text-[10px]">Requests
                                        </th>
                                        <th class="pb-3 font-semibold text-slate-500 uppercase text-[10px]">Status</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-50 dark:divide-slate-800">
                                    <tr>
                                        <td class="py-3">
                                            <div class="flex items-center gap-2">
                                                <span
                                                    class="material-symbols-outlined text-slate-400 text-sm">key</span>
                                                <span
                                                    class="font-medium text-slate-700 dark:text-slate-300">Production-Main</span>
                                            </div>
                                        </td>
                                        <td class="py-3 font-mono text-xs">842,102</td>
                                        <td class="py-3">
                                            <span
                                                class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">ACTIVE</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="py-3">
                                            <div class="flex items-center gap-2">
                                                <span
                                                    class="material-symbols-outlined text-slate-400 text-sm">key</span>
                                                <span
                                                    class="font-medium text-slate-700 dark:text-slate-300">Staging-Internal</span>
                                            </div>
                                        </td>
                                        <td class="py-3 font-mono text-xs">210,443</td>
                                        <td class="py-3">
                                            <span
                                                class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">ACTIVE</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="py-3">
                                            <div class="flex items-center gap-2">
                                                <span
                                                    class="material-symbols-outlined text-slate-400 text-sm">key</span>
                                                <span
                                                    class="font-medium text-slate-700 dark:text-slate-300">Development-Local</span>
                                            </div>
                                        </td>
                                        <td class="py-3 font-mono text-xs">151,955</td>
                                        <td class="py-3">
                                            <span
                                                class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700">THROTTLED</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="py-3">
                                            <div class="flex items-center gap-2">
                                                <span
                                                    class="material-symbols-outlined text-slate-400 text-sm">key</span>
                                                <span
                                                    class="font-medium text-slate-700 dark:text-slate-300">Archive-Test</span>
                                            </div>
                                        </td>
                                        <td class="py-3 font-mono text-xs">0</td>
                                        <td class="py-3">
                                            <span
                                                class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500">INACTIVE</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
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
