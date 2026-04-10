export default function Page() {
  const markup = `
<div class="flex h-screen overflow-hidden">
        <!-- Sidebar -->
        <aside class="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col">
            <div class="p-6">
                <div class="flex items-center gap-3">
                    <div
                        class="size-10 rounded-full bg-primary flex items-center justify-center text-white overflow-hidden">
                        <img class="w-full h-full object-cover" data-alt="Admin Panel Brand Logo"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhm2V1h0FMTHSkfIXHvBvRD9EiEGgkt3nCz7lLIimyWAHm9Fry92471mIu_rNh7Vwm4deANk83z1VGoOqbwCNqZD0usRfNVy3KxNCdhgTmXSNIcZ5P04WUu_O6ZsFKziC7LV_pFFlr0XzKEvTlkgHi4VLcKpySdDRyMC8JfsIi_Rg7Xh69U03YLjl8OC5r6wBeUNB5vbbNpNlHY7tS0cBf-7d-VLdsGSVUK2ToK3y4efD_mm2HHcQ2rhIPNVByvnqF9vUUccGeF5gX" />
                    </div>
                    <div class="flex flex-col">
                        <h1 class="text-slate-900 dark:text-white text-base font-semibold leading-tight">Admin Panel
                        </h1>
                        <p class="text-slate-500 dark:text-slate-400 text-xs font-normal">Management Console</p>
                    </div>
                </div>
            </div>
            <nav class="flex-1 px-4 space-y-1">
                <a class="flex items-center gap-3 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    href="/admin">
                    <span class="material-symbols-outlined text-[24px]">dashboard</span>
                    <span class="text-sm font-medium">Dashboard</span>
                </a>
                <a class="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors bg-black text-white" href="/admin/history/transactions">
                    <span class="material-symbols-outlined text-[24px]">history</span>
                    <span class="text-sm font-medium">History</span>
                </a>
                <a class="flex items-center gap-3 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    href="/admin/api-permissions">
                    <span class="material-symbols-outlined text-[24px]">group</span>
                    <span class="text-sm font-medium">Users</span>
                </a>
                <a class="flex items-center gap-3 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    href="/admin/ip-whitelist">
                    <span class="material-symbols-outlined text-[24px]">vpn_key</span>
                    <span class="text-sm font-medium">API Permissions</span>
                </a>
                <a class="flex items-center gap-3 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    href="/admin/settings">
                    <span class="material-symbols-outlined text-[24px]">shield_person</span>
                    <span class="text-sm font-medium">IP Whitelisting</span>
                </a>
                <a class="flex items-center gap-3 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    href="#">
                    <span class="material-symbols-outlined text-[24px]">settings</span>
                    <span class="text-sm font-medium">Settings</span>
                </a>
            </nav>
        </aside>
        <!-- Main Content Area -->
        <div class="flex-1 flex flex-col overflow-hidden">
            <!-- Header -->
            <header
                class="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-8">
                <div class="flex-1 max-w-md">
                    <div class="relative">
                        <span
                            class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                        <input
                            class="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary dark:text-white placeholder:text-slate-500"
                            placeholder="Search" type="text" />
                    </div>
                </div>
                <div class="flex items-center gap-4">
                    <button
                        class="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors relative">
                        <span class="material-symbols-outlined text-[22px]">notifications</span>
                        <span
                            class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                    </button>
                    <button
                        class="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <span class="material-symbols-outlined text-[22px]">help</span>
                    </button>
                    <div class="h-8 w-[1px] bg-slate-200 dark:bg-slate-700 mx-2"></div>
                    <button
                        class="flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-800 p-1 pr-3 rounded-full transition-colors">
                        <div class="size-8 rounded-full bg-slate-200 overflow-hidden">
                            <img class="w-full h-full object-cover" data-alt="User Avatar Image"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC0h9G1394tPDe7cQCWA_bZ6iVWVKwxFRYq1akWybFiGPJH3nooJWFZiJpafFYp5yLcWMeaoTZawDIqFeGc3ug6DzGw5Ob10j6PMoy2QNoNelob2ms-wNmj_AhRfLreHAQVf1X5M9u0KDibpZuNeR8Q0o5h9ROOGsdF_GW3s8Y8Vu4okE06rz8xUK7dzhyDSXjzbYpRy0CbAIOlGtHFO4w7HaIsfqqGTaxPLzx4ZjUBaZmGhFqu_4Pyee8Y3grp3L18_b7mNCfBkL74" />
                        </div>
                        <span class="text-sm font-medium text-slate-700 dark:text-slate-200">Admin User</span>
                    </button>
                </div>
            </header>
            <!-- Page Content -->
            <main class="flex-1 overflow-y-auto p-8 bg-background-light dark:bg-background-dark">
                <!-- Breadcrumbs -->
                <nav class="flex items-center gap-2 mb-6 text-sm">
                    <a class="text-slate-500 hover:text-primary transition-colors" href="/admin">Home</a>
                    <span class="material-symbols-outlined text-slate-400 text-xs">chevron_right</span>
                    <span class="text-slate-900 dark:text-slate-200 font-medium">Point History</span>
                </nav>
                <!-- Page Header -->
                <div class="mb-8">
                    <h2 class="text-3xl font-bold text-slate-900 dark:text-white mb-2">Point History</h2>
                    <p class="text-slate-600 dark:text-slate-400">View and manage user reward points transactions.</p>
                </div>
                <!-- Content Table Card -->
                <div
                    class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-slate-50 dark:bg-slate-800/50">
                                    <th
                                        class="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Transaction ID</th>
                                    <th
                                        class="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        User</th>
                                    <th
                                        class="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Date</th>
                                    <th
                                        class="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">
                                        Type</th>
                                    <th
                                        class="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Amount</th>
                                    <th
                                        class="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">
                                        Status</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
                                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                    <td class="px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-400">
                                        #TXN-8821</td>
                                    <td class="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Alex
                                        Rivera</td>
                                    <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">Oct 24, 2023</td>
                                    <td class="px-6 py-4">
                                        <span class="flex justify-center">
                                            <span
                                                class="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Earned</span>
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 text-sm font-bold text-green-600 dark:text-green-400">+500</td>
                                    <td class="px-6 py-4">
                                        <span class="flex justify-center">
                                            <span
                                                class="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">Completed</span>
                                        </span>
                                    </td>
                                </tr>
                                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                    <td class="px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-400">
                                        #TXN-8820</td>
                                    <td class="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                        Jordan Smith</td>
                                    <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">Oct 23, 2023</td>
                                    <td class="px-6 py-4">
                                        <span class="flex justify-center">
                                            <span
                                                class="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary dark:bg-primary/30 dark:text-slate-200">Redeemed</span>
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 text-sm font-bold text-red-600 dark:text-red-400">-200</td>
                                    <td class="px-6 py-4">
                                        <span class="flex justify-center">
                                            <span
                                                class="px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Pending</span>
                                        </span>
                                    </td>
                                </tr>
                                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                    <td class="px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-400">
                                        #TXN-8819</td>
                                    <td class="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                        Taylor Swift</td>
                                    <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">Oct 22, 2023</td>
                                    <td class="px-6 py-4">
                                        <span class="flex justify-center">
                                            <span
                                                class="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Earned</span>
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 text-sm font-bold text-green-600 dark:text-green-400">+1000
                                    </td>
                                    <td class="px-6 py-4">
                                        <span class="flex justify-center">
                                            <span
                                                class="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">Completed</span>
                                        </span>
                                    </td>
                                </tr>
                                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                    <td class="px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-400">
                                        #TXN-8818</td>
                                    <td class="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                        Morgan Freeman</td>
                                    <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">Oct 21, 2023</td>
                                    <td class="px-6 py-4">
                                        <span class="flex justify-center">
                                            <span
                                                class="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Refunded</span>
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 text-sm font-bold text-blue-600 dark:text-blue-400">+150</td>
                                    <td class="px-6 py-4">
                                        <span class="flex justify-center">
                                            <span
                                                class="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Cancelled</span>
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <!-- Pagination Footer -->
                    <div
                        class="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <span class="text-sm text-slate-500">Showing 1 to 4 of 48 results</span>
                        <div class="flex gap-2">
                            <button
                                class="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Previous</button>
                            <button
                                class="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Next</button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    </div>
`;
  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
      <div dangerouslySetInnerHTML={{ __html: markup }} />
    </div>
  );
}
