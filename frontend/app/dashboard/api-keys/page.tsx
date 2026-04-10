export default function Page() {
  const markup = `
<div class="flex min-h-screen">
        <!-- Sidebar -->
        <aside
            class="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hidden lg:flex flex-col">
            <div class="p-6 flex items-center gap-3">
                <div class="size-10 rounded-lg bg-primary flex items-center justify-center text-white">
                    <span class="material-symbols-outlined">api</span>
                </div>
                <div>
                    <h1 class="font-bold text-slate-900 dark:text-white leading-tight">ConvertPro</h1>
                    <p class="text-xs text-slate-500">API Management</p>
                </div>
            </div>
            <nav class="flex-1 px-4 space-y-1">
                <a class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    href="/dashboard">
                    <span class="material-symbols-outlined">dashboard</span>
                    <span class="text-sm font-medium">Dashboard</span>
                </a>
                <a class="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary transition-colors"
                    href="/dashboard/api-keys">
                    <span class="material-symbols-outlined fill-[1]">key</span>
                    <span class="text-sm font-medium">API Keys</span>
                </a>
                <a class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    href="/dashboard/usage">
                    <span class="material-symbols-outlined">bar_chart</span>
                    <span class="text-sm font-medium">Usage</span>
                </a>
                <a class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    href="/dashboard/settings">
                    <span class="material-symbols-outlined">description</span>
                    <span class="text-sm font-medium">Documentation</span>
                </a>
                <a class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    href="#">
                    <span class="material-symbols-outlined">settings</span>
                    <span class="text-sm font-medium">Settings</span>
                </a>
            </nav>
            <div class="p-4 mt-auto">
                <div class="bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
                    <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                        Usage Limits</p>
                    <div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mb-2">
                        <div class="bg-primary h-1.5 rounded-full w-3/4"></div>
                    </div>
                    <p class="text-xs text-slate-600 dark:text-slate-400">75% of your plan used</p>
                </div>
            </div>
        </aside>
        <!-- Main Content -->
        <main class="flex-1 flex flex-col min-w-0 overflow-hidden">
            <!-- Header -->
            <header
                class="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-8">
                <div class="flex items-center gap-4 flex-1">
                    <div class="relative w-full max-w-md hidden sm:block">
                        <span
                            class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                        <input
                            class="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/20"
                            placeholder="Search keys or logs..." type="text" />
                    </div>
                </div>
                <div class="flex items-center gap-4">
                    <button
                        class="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors relative">
                        <span class="material-symbols-outlined">notifications</span>
                        <span
                            class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                    </button>
                    <button
                        class="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <span class="material-symbols-outlined">chat_bubble</span>
                    </button>
                    <div class="h-8 w-px bg-slate-200 dark:border-slate-800 mx-2"></div>
                    <div class="flex items-center gap-3">
                        <div class="text-right hidden sm:block">
                            <p class="text-sm font-semibold leading-none">Alex Rivera</p>
                            <p class="text-xs text-slate-500">Pro Developer</p>
                        </div>
                        <div class="size-10 rounded-full bg-slate-200 overflow-hidden" data-alt="User profile avatar"
                            style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuAQuL_zuppH32JdK3F8uZNI0e2YQWTj1vhCOusPCDZp66Bv2IZiQaVl49QR3vcVqoMeEKa6wo1tY9VUm7pQjAH8FN4aCNrvPXJ67ZexefV947gXZ1j79x5a2I5pOO0hADR2Yif9o6w2V5ZkiQ_UG9EfNjVTT_aYt4bxwwaBzAH9D-JiztWGdcNWaYDfyjnovc5yL3ATcd9BaA8FAwnRlt76KbZl8rFLSaJMRHu8KYD8CNZZGxK_PwYrV1iTsaGNaWh6Dlr0vQXN7YB3')">
                        </div>
                    </div>
                </div>
            </header>
            <!-- Page Body -->
            <div class="flex-1 overflow-y-auto p-8 space-y-8">
                <!-- Title and CTA -->
                <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h2 class="text-3xl font-bold tracking-tight">API Keys</h2>
                        <p class="text-slate-500 mt-1">Manage, create and rotate your API authentication keys for
                            ConvertPro.</p>
                    </div>
                    <button
                        class="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-all shadow-lg shadow-primary/20">
                        <span class="material-symbols-outlined text-lg">add</span>
                        Create New Key
                    </button>
                </div>
                <!-- Stats Grid -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div
                        class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl">
                        <div class="flex items-center justify-between mb-4">
                            <span class="text-slate-500 font-medium">Total Requests (24h)</span>
                            <span
                                class="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">analytics</span>
                        </div>
                        <div class="flex items-baseline gap-2">
                            <span class="text-3xl font-bold">1.2M</span>
                            <span class="text-emerald-500 text-sm font-semibold flex items-center">
                                <span class="material-symbols-outlined text-xs">arrow_upward</span> 12%
                            </span>
                        </div>
                    </div>
                    <div
                        class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl">
                        <div class="flex items-center justify-between mb-4">
                            <span class="text-slate-500 font-medium">Active Keys</span>
                            <span class="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">key</span>
                        </div>
                        <div class="flex items-baseline gap-2">
                            <span class="text-3xl font-bold">4</span>
                            <span class="text-slate-500 text-sm">/ 10 available</span>
                        </div>
                    </div>
                    <div
                        class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl">
                        <div class="flex items-center justify-between mb-4">
                            <span class="text-slate-500 font-medium">Avg. Latency</span>
                            <span
                                class="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">speed</span>
                        </div>
                        <div class="flex items-baseline gap-2">
                            <span class="text-3xl font-bold">124ms</span>
                            <span class="text-emerald-500 text-sm font-semibold flex items-center">
                                <span class="material-symbols-outlined text-xs">arrow_downward</span> 5ms
                            </span>
                        </div>
                    </div>
                </div>
                <!-- API Keys Table -->
                <div
                    class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                    <div
                        class="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                        <h3 class="font-bold">Active API Keys</h3>
                        <div class="flex items-center gap-2">
                            <button class="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors">
                                <span class="material-symbols-outlined text-slate-500">filter_list</span>
                            </button>
                        </div>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left">
                            <thead
                                class="bg-slate-50 dark:bg-slate-800/30 text-slate-500 text-xs uppercase tracking-wider">
                                <tr>
                                    <th class="px-6 py-4 font-semibold">Key Name</th>
                                    <th class="px-6 py-4 font-semibold">API Key</th>
                                    <th class="px-6 py-4 font-semibold">Created</th>
                                    <th class="px-6 py-4 font-semibold">Last Used</th>
                                    <th class="px-6 py-4 font-semibold">Status</th>
                                    <th class="px-6 py-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
                                <tr>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div class="font-medium">Production Main</div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div
                                            class="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded w-fit group">
                                            <code
                                                class="text-xs text-slate-600 dark:text-slate-400 font-mono">sk_live_••••••••4f21</code>
                                            <button class="text-slate-400 hover:text-primary"><span
                                                    class="material-symbols-outlined text-sm">visibility</span></button>
                                            <button class="text-slate-400 hover:text-primary"><span
                                                    class="material-symbols-outlined text-sm">content_copy</span></button>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">Oct 12, 2023</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">2 mins ago</td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span
                                            class="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                            Active
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-right">
                                        <button
                                            class="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                                            <span class="material-symbols-outlined">more_horiz</span>
                                        </button>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div class="font-medium">Staging Env</div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div
                                            class="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded w-fit group">
                                            <code
                                                class="text-xs text-slate-600 dark:text-slate-400 font-mono">sk_test_••••••••9a8b</code>
                                            <button class="text-slate-400 hover:text-primary"><span
                                                    class="material-symbols-outlined text-sm">visibility</span></button>
                                            <button class="text-slate-400 hover:text-primary"><span
                                                    class="material-symbols-outlined text-sm">content_copy</span></button>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">Nov 05, 2023</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">1 day ago</td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span
                                            class="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                            Active
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-right">
                                        <button
                                            class="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                                            <span class="material-symbols-outlined">more_horiz</span>
                                        </button>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div class="font-medium">Mobile App Legacy</div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div
                                            class="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded w-fit group">
                                            <code
                                                class="text-xs text-slate-400 dark:text-slate-600 font-mono">sk_live_••••••••1122</code>
                                            <button class="text-slate-400 hover:text-primary"><span
                                                    class="material-symbols-outlined text-sm">visibility</span></button>
                                            <button class="text-slate-400 hover:text-primary"><span
                                                    class="material-symbols-outlined text-sm">content_copy</span></button>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">Jan 20, 2023</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">6 months ago</td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span
                                            class="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400">
                                            <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                            Revoked
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-right">
                                        <button
                                            class="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                                            <span class="material-symbols-outlined">more_horiz</span>
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <!-- Quick Implementation -->
                    <div class="bg-slate-900 text-slate-300 rounded-xl overflow-hidden border border-slate-800">
                        <div class="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                            <h3 class="font-semibold text-white">Quick Implementation</h3>
                            <div class="flex gap-2">
                                <span class="size-3 rounded-full bg-slate-700"></span>
                                <span class="size-3 rounded-full bg-slate-700"></span>
                                <span class="size-3 rounded-full bg-slate-700"></span>
                            </div>
                        </div>
                        <div class="p-6 font-mono text-sm leading-relaxed overflow-x-auto">
                            <div class="mb-4">
                                <span class="text-pink-400">import</span> axios <span class="text-pink-400">from</span>
                                <span class="text-emerald-400">'axios'</span>;
                            </div>
                            <div class="mb-4">
                                <span class="text-slate-500">// Initialize client</span><br />
                                <span class="text-pink-400">const</span> client = axios.<span
                                    class="text-blue-400">create</span>({<br />
                                  baseURL: <span class="text-emerald-400">'https://api.convertpro.com/v1'</span>,<br />
                                  headers: { <span class="text-emerald-400">'X-API-KEY'</span>: <span
                                    class="text-yellow-400">'sk_live_••••••••4f21'</span> }<br />
                                });
                            </div>
                            <div>
                                <span class="text-slate-500">// Run conversion</span><br />
                                <span class="text-pink-400">await</span> client.<span
                                    class="text-blue-400">post</span>(<span class="text-emerald-400">'/convert'</span>,
                                {<br />
                                  from: <span class="text-emerald-400">'USD'</span>,<br />
                                  to: <span class="text-emerald-400">'EUR'</span>,<br />
                                  amount: <span class="text-yellow-400">100</span><br />
                                });
                            </div>
                        </div>
                        <div class="bg-slate-800/50 px-6 py-3 flex items-center justify-between text-xs">
                            <span class="flex items-center gap-1"><span
                                    class="material-symbols-outlined text-sm">javascript</span> node_sample.js</span>
                            <button class="hover:text-white transition-colors flex items-center gap-1">
                                <span class="material-symbols-outlined text-sm">content_copy</span> Copy Code
                            </button>
                        </div>
                    </div>
                    <!-- Usage Statistics Chart -->
                    <div
                        class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
                        <div class="flex items-center justify-between mb-8">
                            <div>
                                <h3 class="font-bold">Requests by Key</h3>
                                <p class="text-xs text-slate-500">Distribution over the last 7 days</p>
                            </div>
                            <select
                                class="text-xs bg-slate-100 dark:bg-slate-800 border-none rounded p-1.5 focus:ring-0">
                                <option>Last 7 Days</option>
                                <option>Last 30 Days</option>
                            </select>
                        </div>
                        <div class="space-y-6">
                            <div class="space-y-2">
                                <div class="flex justify-between text-xs">
                                    <span class="font-medium">Production Main</span>
                                    <span class="text-slate-500 font-semibold">842,000 (72%)</span>
                                </div>
                                <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3">
                                    <div class="bg-primary h-3 rounded-full" style="width: 72%"></div>
                                </div>
                            </div>
                            <div class="space-y-2">
                                <div class="flex justify-between text-xs">
                                    <span class="font-medium">Staging Env</span>
                                    <span class="text-slate-500 font-semibold">245,000 (21%)</span>
                                </div>
                                <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3">
                                    <div class="bg-primary/60 h-3 rounded-full" style="width: 21%"></div>
                                </div>
                            </div>
                            <div class="space-y-2">
                                <div class="flex justify-between text-xs">
                                    <span class="font-medium">Mobile App Legacy</span>
                                    <span class="text-slate-500 font-semibold">82,000 (7%)</span>
                                </div>
                                <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3">
                                    <div class="bg-primary/20 h-3 rounded-full" style="width: 7%"></div>
                                </div>
                            </div>
                        </div>
                        <div class="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                            <a class="text-primary text-sm font-semibold flex items-center gap-1 hover:underline"
                                href="#">
                                View detailed analytics <span
                                    class="material-symbols-outlined text-sm">arrow_forward</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
`;
  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
      <div dangerouslySetInnerHTML={{ __html: markup }} />
    </div>
  );
}
