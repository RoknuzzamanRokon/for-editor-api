export default function Page() {
  const markup = `
<div class="flex min-h-screen">
        <!-- Sidebar -->
        <aside
            class="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col fixed h-full z-20">
            <div class="p-6 flex items-center gap-3">
                <div class="bg-primary p-1.5 rounded-lg text-white">
                    <span class="material-symbols-outlined text-2xl">sync_alt</span>
                </div>
                <h2 class="text-xl font-bold tracking-tight">ConvertPro</h2>
            </div>
            <nav class="flex-1 px-4 py-4 space-y-1">
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
                <a class="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    href="/dashboard/usage">
                    <span class="material-symbols-outlined">bar_chart</span>
                    <span class="text-sm font-medium">Usage</span>
                </a>
                <a class="flex items-center gap-3 px-3 py-2 bg-primary/10 text-primary rounded-lg transition-colors"
                    href="/dashboard/team">
                    <span class="material-symbols-outlined">group</span>
                    <span class="text-sm font-medium">Team Members</span>
                </a>
                <a class="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    href="/dashboard/settings">
                    <span class="material-symbols-outlined">settings</span>
                    <span class="text-sm font-medium">Settings</span>
                </a>
            </nav>
            <div class="p-4 border-t border-slate-200 dark:border-slate-800">
                <div class="flex items-center gap-3 p-2">
                    <div class="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <img alt="Avatar" data-alt="User profile avatar circle"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPaNurhJ9A7LZClpJm257zHUUSOz1L7DX6XCm8u5AG78N4OL4jgUyW1LdN-56bMtjLYrxxpr8_7Lw05lvAW-yePs2cs2B_gAGhz8ra4i7s551jns9CT49labT3KuEe8Qlpcvkf6YLrJO0lug5oUjCEqLzn-9sSw2vv_xRgRjnyIqvm_2F9977IXh8psu174zjStyk7pwcQkGc-HDDOk_L13GRd8XmNBLTSRi3RdQ_6n2Y5wACKiG7h6zzJbOYcVW-S5le_Q1TSqD88" />
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-xs font-semibold truncate">Alex Rivera</p>
                        <p class="text-[10px] text-slate-500 truncate">alex@convertpro.io</p>
                    </div>
                </div>
            </div>
        </aside>
        <!-- Main Content -->
        <main class="flex-1 ml-64">
            <!-- Header -->
            <header
                class="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10">
                <div class="relative w-96">
                    <span
                        class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
                    <input
                        class="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-primary text-sm transition-all"
                        placeholder="Search team members..." type="text" />
                </div>
                <div class="flex items-center gap-4">
                    <button
                        class="w-10 h-10 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                        <span class="material-symbols-outlined">notifications</span>
                    </button>
                    <button
                        class="w-10 h-10 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                        <span class="material-symbols-outlined">help</span>
                    </button>
                </div>
            </header>
            <!-- Content Area -->
            <div class="p-8 max-w-6xl mx-auto">
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 class="text-3xl font-bold tracking-tight">Team Members</h1>
                        <p class="text-slate-500 dark:text-slate-400 mt-1">Manage your organization's team members and
                            their permission levels.</p>
                    </div>
                    <button
                        class="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-all shadow-sm">
                        <span class="material-symbols-outlined text-xl">person_add</span>
                        <span>Invite Member</span>
                    </button>
                </div>
                <!-- Tabs -->
                <div class="flex items-center gap-8 border-b border-slate-200 dark:border-slate-800 mb-6">
                    <button
                        class="border-b-2 border-primary pb-4 text-sm font-bold text-slate-900 dark:text-slate-100 px-1">All
                        Members</button>
                    <button
                        class="border-b-2 border-transparent pb-4 text-sm font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 px-1">Pending
                        Invites</button>
                    <button
                        class="border-b-2 border-transparent pb-4 text-sm font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 px-1">Roles
                        &amp; Permissions</button>
                </div>
                <!-- Team Table -->
                <div
                    class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    <div class="overflow-x-auto">
                        <table class="w-full text-left">
                            <thead class="bg-slate-50 dark:bg-slate-800/50">
                                <tr>
                                    <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Name
                                    </th>
                                    <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                                        Email</th>
                                    <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Role
                                    </th>
                                    <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                                        Status</th>
                                    <th
                                        class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">
                                        Actions</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                                <!-- Row 1 -->
                                <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                    <td class="px-6 py-4">
                                        <div class="flex items-center gap-3">
                                            <div
                                                class="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                                                AR</div>
                                            <span class="font-medium">Alex Rivera</span>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">alex@convertpro.io
                                    </td>
                                    <td class="px-6 py-4">
                                        <span
                                            class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                                            Admin
                                        </span>
                                    </td>
                                    <td class="px-6 py-4">
                                        <div class="flex items-center gap-1.5">
                                            <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
                                            <span class="text-sm font-medium">Active</span>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 text-right">
                                        <div class="flex items-center justify-end gap-2">
                                            <button class="p-1.5 text-slate-400 hover:text-primary transition-colors">
                                                <span class="material-symbols-outlined">edit</span>
                                            </button>
                                            <button class="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
                                                <span class="material-symbols-outlined">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                <!-- Row 2 -->
                                <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                    <td class="px-6 py-4">
                                        <div class="flex items-center gap-3">
                                            <div
                                                class="w-9 h-9 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold text-sm">
                                                SC</div>
                                            <span class="font-medium">Sarah Chen</span>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">sarah@convertpro.io
                                    </td>
                                    <td class="px-6 py-4">
                                        <span
                                            class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400">
                                            Developer
                                        </span>
                                    </td>
                                    <td class="px-6 py-4">
                                        <div class="flex items-center gap-1.5">
                                            <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
                                            <span class="text-sm font-medium">Active</span>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 text-right">
                                        <div class="flex items-center justify-end gap-2">
                                            <button class="p-1.5 text-slate-400 hover:text-primary transition-colors">
                                                <span class="material-symbols-outlined">edit</span>
                                            </button>
                                            <button class="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
                                                <span class="material-symbols-outlined">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                <!-- Row 3 -->
                                <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                    <td class="px-6 py-4">
                                        <div class="flex items-center gap-3">
                                            <div
                                                class="w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm">
                                                JW</div>
                                            <span class="font-medium">James Wilson</span>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">james@convertpro.io
                                    </td>
                                    <td class="px-6 py-4">
                                        <span
                                            class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400">
                                            Viewer
                                        </span>
                                    </td>
                                    <td class="px-6 py-4">
                                        <div class="flex items-center gap-1.5">
                                            <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
                                            <span class="text-sm font-medium">Active</span>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 text-right">
                                        <div class="flex items-center justify-end gap-2">
                                            <button class="p-1.5 text-slate-400 hover:text-primary transition-colors">
                                                <span class="material-symbols-outlined">edit</span>
                                            </button>
                                            <button class="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
                                                <span class="material-symbols-outlined">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                <!-- Row 4 -->
                                <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                    <td class="px-6 py-4">
                                        <div class="flex items-center gap-3">
                                            <div
                                                class="w-9 h-9 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-sm">
                                                MG</div>
                                            <span class="font-medium">Maria Garcia</span>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">maria@convertpro.io
                                    </td>
                                    <td class="px-6 py-4">
                                        <span
                                            class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400">
                                            Developer
                                        </span>
                                    </td>
                                    <td class="px-6 py-4">
                                        <div class="flex items-center gap-1.5">
                                            <div class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
                                            <span class="text-sm font-medium">Pending</span>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 text-right">
                                        <div class="flex items-center justify-end gap-2">
                                            <button class="text-primary text-sm font-bold hover:underline">Resend
                                                Invite</button>
                                            <button
                                                class="p-1.5 text-slate-400 hover:text-red-500 transition-colors ml-2">
                                                <span class="material-symbols-outlined">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <!-- Manage Roles Detail Section -->
                <div class="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div
                        class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div class="flex items-center gap-3 mb-4">
                            <span class="material-symbols-outlined text-primary">security</span>
                            <h3 class="font-bold text-lg">Role Descriptions</h3>
                        </div>
                        <div class="space-y-4">
                            <div class="flex gap-4">
                                <div class="w-1.5 bg-indigo-500 rounded-full"></div>
                                <div>
                                    <p class="font-bold text-sm">Admin</p>
                                    <p class="text-xs text-slate-500">Full access to billing, API keys, and team
                                        management.</p>
                                </div>
                            </div>
                            <div class="flex gap-4">
                                <div class="w-1.5 bg-sky-500 rounded-full"></div>
                                <div>
                                    <p class="font-bold text-sm">Developer</p>
                                    <p class="text-xs text-slate-500">Can manage API keys and usage, but cannot view
                                        billing or team settings.</p>
                                </div>
                            </div>
                            <div class="flex gap-4">
                                <div class="w-1.5 bg-slate-400 rounded-full"></div>
                                <div>
                                    <p class="font-bold text-sm">Viewer</p>
                                    <p class="text-xs text-slate-500">Read-only access to dashboard and usage metrics.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div
                        class="bg-primary/5 dark:bg-primary/10 p-6 rounded-xl border border-primary/20 flex flex-col justify-center">
                        <h3 class="font-bold text-lg mb-2">Need a custom role?</h3>
                        <p class="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">Enterprise customers
                            can create granular permissions for specific API endpoints and environments.</p>
                        <button
                            class="self-start text-primary font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all">
                            Learn about Enterprise plans
                            <span class="material-symbols-outlined">arrow_forward</span>
                        </button>
                    </div>
                </div>
            </div>
        </main>
    </div>
    <!-- Hidden Invite Modal Placeholder -->
    <div
        class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center opacity-0 pointer-events-none transition-opacity">
        <div class="bg-white dark:bg-slate-900 w-full max-w-md p-8 rounded-xl shadow-2xl scale-95 transition-transform">
            <h3 class="text-2xl font-bold mb-6">Invite Member</h3>
            <div class="space-y-4">
                <div class="space-y-1.5">
                    <label class="text-sm font-semibold">Email Address</label>
                    <input class="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg p-3"
                        placeholder="colleague@company.com" type="email" />
                </div>
                <div class="space-y-1.5">
                    <label class="text-sm font-semibold">Assign Role</label>
                    <select class="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg p-3">
                        <option>Viewer</option>
                        <option>Developer</option>
                        <option>Admin</option>
                    </select>
                </div>
                <div class="pt-4 flex gap-3">
                    <button class="flex-1 px-4 py-2.5 bg-primary text-white font-bold rounded-lg">Send
                        Invitation</button>
                    <button
                        class="px-4 py-2.5 text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">Cancel</button>
                </div>
            </div>
        </div>
    </div>
`;
  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen">
      <div dangerouslySetInnerHTML={{ __html: markup }} />
    </div>
  );
}
