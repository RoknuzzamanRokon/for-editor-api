export default function Page() {
  const markup = `
<div class="flex h-screen overflow-hidden">
        <!-- Sidebar -->
        <aside
            class="w-64 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between p-4">
            <div class="flex flex-col gap-8">
                <div class="flex items-center gap-3 px-2">
                    <div class="bg-primary rounded-lg size-10 flex items-center justify-center text-white">
                        <span class="material-symbols-outlined">sync_alt</span>
                    </div>
                    <div class="flex flex-col">
                        <h1 class="text-slate-900 dark:text-white text-base font-bold leading-none">ConvertPro</h1>
                        <p class="text-slate-500 dark:text-slate-400 text-xs font-medium">API Management</p>
                    </div>
                </div>
                <nav class="flex flex-col gap-1">
                    <a class="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        href="/dashboard">
                        <span class="material-symbols-outlined text-[22px]">dashboard</span>
                        <span class="text-sm font-medium">Dashboard</span>
                    </a>
                    <a class="flex items-center gap-3 px-3 py-2 bg-primary/10 text-primary rounded-lg transition-colors"
                        href="/dashboard/api-keys">
                        <span class="material-symbols-outlined text-[22px]">history</span>
                        <span class="text-sm font-semibold">Request History</span>
                    </a>
                    <a class="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        href="/dashboard/settings">
                        <span class="material-symbols-outlined text-[22px]">vpn_key</span>
                        <span class="text-sm font-medium">API Keys</span>
                    </a>
                    <a class="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        href="#">
                        <span class="material-symbols-outlined text-[22px]">webhook</span>
                        <span class="text-sm font-medium">Webhooks</span>
                    </a>
                    <a class="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        href="#">
                        <span class="material-symbols-outlined text-[22px]">settings</span>
                        <span class="text-sm font-medium">Settings</span>
                    </a>
                </nav>
            </div>
            <div class="flex flex-col gap-4">
                <div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                        Usage</p>
                    <div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mb-2">
                        <div class="bg-primary h-1.5 rounded-full" style="width: 75%"></div>
                    </div>
                    <p class="text-xs text-slate-600 dark:text-slate-300">7,500 / 10,000 requests</p>
                </div>
                <button
                    class="w-full bg-primary hover:bg-primary/90 text-white py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all">
                    <span class="material-symbols-outlined text-sm">upgrade</span>
                    Upgrade Plan
                </button>
            </div>
        </aside>
        <!-- Main Content -->
        <main class="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark">
            <header
                class="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10">
                <div class="flex items-center gap-2">
                    <span class="text-slate-400">Pages</span>
                    <span class="text-slate-400">/</span>
                    <span class="text-slate-900 dark:text-white font-medium">Request History</span>
                </div>
                <div class="flex items-center gap-4">
                    <div class="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                        <div class="size-2 bg-green-500 rounded-full"></div>
                        <span class="text-xs font-medium text-slate-600 dark:text-slate-300">System Operational</span>
                    </div>
                    <button
                        class="size-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                        <span class="material-symbols-outlined text-xl">notifications</span>
                    </button>
                    <div class="size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30 font-bold text-xs"
                        data-alt="User profile avatar placeholder">
                        JD
                    </div>
                </div>
            </header>
            <div class="p-8 max-w-7xl mx-auto">
                <!-- Header Section -->
                <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div class="space-y-1">
                        <h2 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Request History
                        </h2>
                        <p class="text-slate-500 dark:text-slate-400">Monitor, filter, and debug your API traffic across
                            all endpoints.</p>
                    </div>
                    <button
                        class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-slate-50 transition-colors">
                        <span class="material-symbols-outlined text-lg">download</span>
                        Export CSV
                    </button>
                </div>
                <!-- Filters & Search -->
                <div
                    class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 mb-6">
                    <div class="flex flex-wrap items-center gap-3">
                        <div class="flex-1 min-w-[300px] relative">
                            <span
                                class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                            <input
                                class="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-primary/20 text-sm"
                                placeholder="Search by Request ID or Endpoint..." type="text" />
                        </div>
                        <div class="flex flex-wrap items-center gap-2">
                            <button
                                class="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                <span class="material-symbols-outlined text-sm">calendar_today</span>
                                Date: Last 24h
                                <span class="material-symbols-outlined text-sm">keyboard_arrow_down</span>
                            </button>
                            <button
                                class="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                <span class="material-symbols-outlined text-sm">filter_list</span>
                                Status: All
                                <span class="material-symbols-outlined text-sm">keyboard_arrow_down</span>
                            </button>
                            <button
                                class="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                <span class="material-symbols-outlined text-sm">api</span>
                                Endpoint: All
                                <span class="material-symbols-outlined text-sm">keyboard_arrow_down</span>
                            </button>
                            <button class="text-primary text-xs font-bold hover:underline px-2">Clear All</button>
                        </div>
                    </div>
                </div>
                <!-- Table Container -->
                <div
                    class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden overflow-x-auto">
                    <table class="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr
                                class="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                <th
                                    class="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Timestamp</th>
                                <th
                                    class="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Request ID</th>
                                <th
                                    class="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Endpoint</th>
                                <th
                                    class="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Method</th>
                                <th
                                    class="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Status</th>
                                <th
                                    class="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">
                                    Latency</th>
                                <th
                                    class="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">
                                    Size</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
                            <!-- Row 1 -->
                            <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                <td class="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 font-medium">Oct 27,
                                    14:30:05</td>
                                <td class="px-6 py-4 text-sm text-slate-900 dark:text-white font-mono">req_8f2d1a</td>
                                <td class="px-6 py-4 text-sm">
                                    <span
                                        class="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-700 dark:text-slate-300 font-medium">/pdf-to-docx</span>
                                </td>
                                <td class="px-6 py-4 text-sm font-bold text-slate-600 dark:text-slate-400">POST</td>
                                <td class="px-6 py-4 text-sm">
                                    <span
                                        class="inline-flex items-center gap-1.5 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 px-2.5 py-1 rounded-full font-bold text-xs border border-green-100 dark:border-green-500/20">
                                        <span class="size-1.5 bg-green-500 rounded-full"></span>
                                        200 OK
                                    </span>
                                </td>
                                <td class="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 text-right font-medium">
                                    142ms</td>
                                <td class="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 text-right font-medium">
                                    1.2MB</td>
                            </tr>
                            <!-- Row 2 -->
                            <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                <td class="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 font-medium">Oct 27,
                                    14:28:12</td>
                                <td class="px-6 py-4 text-sm text-slate-900 dark:text-white font-mono">req_3c4e9b</td>
                                <td class="px-6 py-4 text-sm">
                                    <span
                                        class="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-700 dark:text-slate-300 font-medium">/image-resize</span>
                                </td>
                                <td class="px-6 py-4 text-sm font-bold text-slate-600 dark:text-slate-400">POST</td>
                                <td class="px-6 py-4 text-sm">
                                    <span
                                        class="inline-flex items-center gap-1.5 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-full font-bold text-xs border border-amber-100 dark:border-amber-500/20">
                                        <span class="size-1.5 bg-amber-500 rounded-full"></span>
                                        400 Bad Request
                                    </span>
                                </td>
                                <td class="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 text-right font-medium">
                                    45ms</td>
                                <td class="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 text-right font-medium">
                                    204KB</td>
                            </tr>
                            <!-- Row 3 -->
                            <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                <td class="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 font-medium">Oct 27,
                                    14:25:55</td>
                                <td class="px-6 py-4 text-sm text-slate-900 dark:text-white font-mono">req_9a1f2c</td>
                                <td class="px-6 py-4 text-sm">
                                    <span
                                        class="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-700 dark:text-slate-300 font-medium">/html-to-pdf</span>
                                </td>
                                <td class="px-6 py-4 text-sm font-bold text-slate-600 dark:text-slate-400">GET</td>
                                <td class="px-6 py-4 text-sm">
                                    <span
                                        class="inline-flex items-center gap-1.5 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 px-2.5 py-1 rounded-full font-bold text-xs border border-green-100 dark:border-green-500/20">
                                        <span class="size-1.5 bg-green-500 rounded-full"></span>
                                        200 OK
                                    </span>
                                </td>
                                <td class="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 text-right font-medium">
                                    310ms</td>
                                <td class="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 text-right font-medium">
                                    4.5MB</td>
                            </tr>
                            <!-- Row 4 -->
                            <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                <td class="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 font-medium">Oct 27,
                                    14:20:01</td>
                                <td class="px-6 py-4 text-sm text-slate-900 dark:text-white font-mono">req_7b6d5e</td>
                                <td class="px-6 py-4 text-sm">
                                    <span
                                        class="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-700 dark:text-slate-300 font-medium">/pdf-to-docx</span>
                                </td>
                                <td class="px-6 py-4 text-sm font-bold text-slate-600 dark:text-slate-400">POST</td>
                                <td class="px-6 py-4 text-sm">
                                    <span
                                        class="inline-flex items-center gap-1.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 px-2.5 py-1 rounded-full font-bold text-xs border border-red-100 dark:border-red-500/20">
                                        <span class="size-1.5 bg-red-500 rounded-full"></span>
                                        500 Error
                                    </span>
                                </td>
                                <td class="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 text-right font-medium">
                                    1.2s</td>
                                <td class="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 text-right font-medium">
                                    0B</td>
                            </tr>
                            <!-- Row 5 -->
                            <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                <td class="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 font-medium">Oct 27,
                                    14:15:30</td>
                                <td class="px-6 py-4 text-sm text-slate-900 dark:text-white font-mono">req_2f8a4d</td>
                                <td class="px-6 py-4 text-sm">
                                    <span
                                        class="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-700 dark:text-slate-300 font-medium">/word-to-pdf</span>
                                </td>
                                <td class="px-6 py-4 text-sm font-bold text-slate-600 dark:text-slate-400">POST</td>
                                <td class="px-6 py-4 text-sm">
                                    <span
                                        class="inline-flex items-center gap-1.5 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 px-2.5 py-1 rounded-full font-bold text-xs border border-green-100 dark:border-green-500/20">
                                        <span class="size-1.5 bg-green-500 rounded-full"></span>
                                        200 OK
                                    </span>
                                </td>
                                <td class="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 text-right font-medium">
                                    89ms</td>
                                <td class="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 text-right font-medium">
                                    850KB</td>
                            </tr>
                        </tbody>
                    </table>
                    <!-- Pagination -->
                    <div
                        class="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
                        <p class="text-sm text-slate-500 dark:text-slate-400 font-medium">
                            Showing <span class="font-bold text-slate-900 dark:text-white">1</span> to <span
                                class="font-bold text-slate-900 dark:text-white">5</span> of <span
                                class="font-bold text-slate-900 dark:text-white">1,240</span> requests
                        </p>
                        <div class="flex items-center gap-2">
                            <button
                                class="size-8 rounded border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400 cursor-not-allowed">
                                <span class="material-symbols-outlined text-lg">chevron_left</span>
                            </button>
                            <button
                                class="size-8 rounded bg-primary text-white flex items-center justify-center font-bold text-sm">1</button>
                            <button
                                class="size-8 rounded hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center font-medium text-sm transition-colors text-slate-600 dark:text-slate-300">2</button>
                            <button
                                class="size-8 rounded hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center font-medium text-sm transition-colors text-slate-600 dark:text-slate-300">3</button>
                            <span class="text-slate-400">...</span>
                            <button
                                class="size-8 rounded hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center font-medium text-sm transition-colors text-slate-600 dark:text-slate-300">248</button>
                            <button
                                class="size-8 rounded border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                <span class="material-symbols-outlined text-lg">chevron_right</span>
                            </button>
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
