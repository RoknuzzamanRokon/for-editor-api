export default function Page() {
  const markup = `
<div class="flex h-screen overflow-hidden">
        <!-- Sidebar -->
        <aside class="w-64 border-r border-primary/10 bg-white dark:bg-primary flex flex-col">
            <div class="p-6 flex flex-col gap-6">
                <div class="flex items-center gap-3">
                    <div class="bg-primary rounded-lg p-2 text-white">
                        <span class="material-symbols-outlined">grid_view</span>
                    </div>
                    <div>
                        <h1 class="text-sm font-bold text-primary dark:text-white">Point Control</h1>
                        <p class="text-[10px] text-primary/60 dark:text-slate-400 font-medium uppercase tracking-tight">
                            Admin Panel</p>
                    </div>
                </div>
                <nav class="flex flex-col gap-1"><a
                        class="flex items-center gap-3 px-3 py-2 rounded-lg text-primary/70 dark:text-slate-400 hover:bg-primary/5 dark:hover:bg-white/5 transition-colors"
                        href="/admin">
                        <span class="material-symbols-outlined text-[20px]">dashboard</span>
                        <span class="text-sm font-medium">Dashboard</span>
                    </a>
                    <a class="flex items-center gap-3 px-3 py-2 rounded-lg text-primary/70 dark:text-slate-400 hover:bg-primary/5 dark:hover:bg-white/5 transition-colors"
                        href="/admin/history/transactions">
                        <span class="material-symbols-outlined text-[20px]">history</span>
                        <span class="text-sm font-medium">History</span>
                    </a>
                    <a class="flex items-center gap-3 px-3 py-2 rounded-lg text-primary/70 dark:text-slate-400 hover:bg-primary/5 dark:hover:bg-white/5 transition-colors"
                        href="/admin/api-permissions">
                        <span class="material-symbols-outlined text-[20px]">key</span>
                        <span class="text-sm font-medium">API Permissions</span>
                    </a>
                    <a class="flex items-center gap-3 px-3 py-2 rounded-lg text-primary/70 dark:text-slate-400 hover:bg-primary/5 dark:hover:bg-white/5 transition-colors"
                        href="/admin/ip-whitelist">
                        <span class="material-symbols-outlined text-[20px]">security</span>
                        <span class="text-sm font-medium">IP Whitelisting</span>
                    </a>
                    <a class="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary text-white shadow-sm" href="/admin/users">
                        <span class="material-symbols-outlined text-[20px]">group</span>
                        <span class="text-sm font-medium">Users</span>
                    </a>
                    <a class="flex items-center gap-3 px-3 py-2 rounded-lg text-primary/70 dark:text-slate-400 hover:bg-primary/5 dark:hover:bg-white/5 transition-colors"
                        href="/admin/settings">
                        <span class="material-symbols-outlined text-[20px]">settings</span>
                        <span class="text-sm font-medium">Settings</span>
                    </a>
                </nav>
            </div>
            <div class="mt-auto p-4 border-t border-primary/10 dark:border-white/10">
                <div class="flex items-center gap-3 px-2">
                    <div class="size-8 rounded-full bg-primary/20 dark:bg-white/10 flex items-center justify-center">
                        <span class="material-symbols-outlined text-sm">person</span>
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-semibold truncate">Alex Smith</p>
                        <p class="text-[10px] text-primary/60 dark:text-slate-400 truncate">SYSTEM ADMIN</p>
                    </div>
                </div>
            </div>
        </aside>
        <!-- Main Content -->
        <main class="flex-1 flex flex-col overflow-hidden">
            <!-- Header Section -->
            <header class="bg-white dark:bg-primary/95 border-b border-primary/10 dark:border-white/10 px-8 py-3">
                <div class="flex items-center justify-between gap-4">
                    <div class="flex-1 max-w-2xl relative">
                        <span
                            class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary/40 text-[20px]">search</span>
                        <input class="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-100 border-none text-sm"
                            placeholder="Search transactions, users or API keys..." type="text" />
                    </div>
                    <div class="flex items-center gap-4">
                        <button class="relative p-1 text-primary/60 hover:text-primary">
                            <span class="material-symbols-outlined">notifications</span>
                            <span
                                class="absolute top-1 right-1 size-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <div class="h-8 w-[1px] bg-slate-200 mx-2"></div>
                        <div class="size-10 rounded-lg overflow-hidden border border-slate-200">
                            <img alt="User Avatar" class="size-full object-cover"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCIjI4ZqThvb2l796iq7NG_xBxByLRYprvlL2Y_nbrJMXiLhAFfYhEwlD5r492uEMAi4g9qD4vx8ztz2yTymGj9a6fGXX3yvAN0WzLhEuZ8PYxeIzvKKGsYDL4lIP9YXBr2oJEAnh9Ry5zKSWXQAa_hIeoUk8a9Xot4iKQEeJ2Geadc9qjlhBHQUe1bME5qpOUFFyL-mAxADVeILlipbeEu3Hxp4a3d9pPaRaqaUesPh1pUW3CrgJDpn3wayTwQRevIiq-gfkOyi9W" />
                        </div>
                    </div>
                </div>
            </header>
            <!-- Search and Filters -->
            <section class="px-8 py-6 bg-background-light dark:bg-background-dark/50">
                <div class="max-w-6xl mx-auto mb-6 flex items-center justify-between">
                    <div>
                        <h2 class="text-2xl font-black text-primary dark:text-white tracking-tight">Users</h2>
                        <p class="text-primary/60 dark:text-slate-400 text-sm">Manage and oversee all user accounts and
                            their point balances.</p>
                    </div>
                    <button
                        class="bg-primary text-white dark:bg-white dark:text-primary px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-lg shadow-primary/20">
                        <span class="material-symbols-outlined text-[18px]">person_add</span>
                        Add New User
                    </button>
                </div>
                <div class="max-w-6xl mx-auto flex flex-col md:flex-row gap-4">
                    <div class="relative flex-1">
                        <span
                            class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary/40 dark:text-slate-500 text-[20px]">search</span>
                        <input
                            class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-primary/10 dark:border-white/10 bg-white dark:bg-primary/40 focus:ring-2 focus:ring-primary/20 dark:focus:ring-white/10 transition-all outline-none text-sm"
                            placeholder="Search users by name or email..." type="text" />
                    </div>
                    <div class="flex items-center gap-3">
                        <div class="relative inline-block">
                            <button
                                class="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-primary/40 border border-primary/10 dark:border-white/10 rounded-xl text-sm font-medium hover:bg-primary/5 dark:hover:bg-white/5 transition-colors">
                                <span class="text-primary/60 dark:text-slate-400">Role:</span>
                                <span>All Roles</span>
                                <span class="material-symbols-outlined text-[18px]">expand_more</span>
                            </button>
                        </div>
                        <div class="relative inline-block">
                            <button
                                class="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-primary/40 border border-primary/10 dark:border-white/10 rounded-xl text-sm font-medium hover:bg-primary/5 dark:hover:bg-white/5 transition-colors">
                                <span class="text-primary/60 dark:text-slate-400">Status:</span>
                                <span>Active</span>
                                <span class="material-symbols-outlined text-[18px]">expand_more</span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>
            <!-- Table Section -->
            <section class="flex-1 overflow-auto px-8 pb-8">
                <div
                    class="max-w-6xl mx-auto bg-white dark:bg-primary/40 rounded-xl border border-primary/10 dark:border-white/10 shadow-sm overflow-hidden">
                    <table class="w-full text-left border-collapse">
                        <thead class="bg-primary/5 dark:bg-white/5 border-b border-primary/10 dark:border-white/10">
                            <tr>
                                <th
                                    class="px-6 py-4 text-xs font-bold text-primary/60 dark:text-slate-400 uppercase tracking-wider">
                                    User</th>
                                <th
                                    class="px-6 py-4 text-xs font-bold text-primary/60 dark:text-slate-400 uppercase tracking-wider">
                                    Role</th>
                                <th
                                    class="px-6 py-4 text-xs font-bold text-primary/60 dark:text-slate-400 uppercase tracking-wider">
                                    Status</th>
                                <th
                                    class="px-6 py-4 text-xs font-bold text-primary/60 dark:text-slate-400 uppercase tracking-wider text-right">
                                    Point Balance</th>
                                <th
                                    class="px-6 py-4 text-xs font-bold text-primary/60 dark:text-slate-400 uppercase tracking-wider text-right">
                                    Action</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-primary/5 dark:divide-white/5">
                            <tr class="hover:bg-primary/5 dark:hover:bg-white/5 transition-colors">
                                <td class="px-6 py-4">
                                    <div class="flex items-center gap-3">
                                        <div
                                            class="size-10 rounded-full bg-primary/10 dark:bg-white/10 flex items-center justify-center overflow-hidden">
                                            <img alt="Avatar" class="size-full object-cover"
                                                data-alt="Profile avatar for Alex Rivera"
                                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCIjI4ZqThvb2l796iq7NG_xBxByLRYprvlL2Y_nbrJMXiLhAFfYhEwlD5r492uEMAi4g9qD4vx8ztz2yTymGj9a6fGXX3yvAN0WzLhEuZ8PYxeIzvKKGsYDL4lIP9YXBr2oJEAnh9Ry5zKSWXQAa_hIeoUk8a9Xot4iKQEeJ2Geadc9qjlhBHQUe1bME5qpOUFFyL-mAxADVeILlipbeEu3Hxp4a3d9pPaRaqaUesPh1pUW3CrgJDpn3wayTwQRevIiq-gfkOyi9W" />
                                        </div>
                                        <div>
                                            <p class="text-sm font-bold">Alex Rivera</p>
                                            <p class="text-xs text-primary/60 dark:text-slate-400">alex@example.com</p>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-6 py-4">
                                    <span
                                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 dark:bg-white/10 text-primary dark:text-white">
                                        Administrator
                                    </span>
                                </td>
                                <td class="px-6 py-4">
                                    <span
                                        class="inline-flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-400">
                                        <span class="size-1.5 rounded-full bg-green-600 dark:bg-green-400"></span>
                                        Active
                                    </span>
                                </td>
                                <td class="px-6 py-4 text-right">
                                    <p class="text-sm font-bold">1,250 <span
                                            class="text-primary/50 dark:text-slate-500 font-medium">pts</span></p>
                                </td>
                                <td class="px-6 py-4 text-right">
                                    <button
                                        class="text-sm font-bold text-primary/70 dark:text-slate-300 hover:text-primary dark:hover:text-white underline underline-offset-4 decoration-primary/20">Manage</button>
                                </td>
                            </tr>
                            <tr class="hover:bg-primary/5 dark:hover:bg-white/5 transition-colors">
                                <td class="px-6 py-4">
                                    <div class="flex items-center gap-3">
                                        <div
                                            class="size-10 rounded-full bg-primary/10 dark:bg-white/10 flex items-center justify-center overflow-hidden">
                                            <img alt="Avatar" class="size-full object-cover"
                                                data-alt="Profile avatar for Sarah Chen"
                                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDF_ToRtF1H1iqAwCVBmKiYwbAz6Vvuk2Nv3P4SHh2vLYVWmx07NeKhcHy6NTnPPBqEiNqYWZBcgrcCpttzGRQ4Yc3WyUi_AcZi4x_vs6V8i887slM001pc8E9wbXvuJLemoiGUX74SOIj2Y60KeINFBRlOMXjq_Kii_rc_iiqVfWDhWN_e26S1b4uOKCWfbDR6hDpqD1_OvJC9E4sexPpcL8kJ19SpIZvJuuH-HmGH4rB4ozouALD0R3TorMBUZM-U1zr-L8au5qHU" />
                                        </div>
                                        <div>
                                            <p class="text-sm font-bold">Sarah Chen</p>
                                            <p class="text-xs text-primary/60 dark:text-slate-400">sarah@example.com</p>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-6 py-4">
                                    <span
                                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 dark:bg-white/10 text-primary dark:text-white">
                                        Moderator
                                    </span>
                                </td>
                                <td class="px-6 py-4">
                                    <span
                                        class="inline-flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-400">
                                        <span class="size-1.5 rounded-full bg-green-600 dark:bg-green-400"></span>
                                        Active
                                    </span>
                                </td>
                                <td class="px-6 py-4 text-right">
                                    <p class="text-sm font-bold">850 <span
                                            class="text-primary/50 dark:text-slate-500 font-medium">pts</span></p>
                                </td>
                                <td class="px-6 py-4 text-right">
                                    <button
                                        class="text-sm font-bold text-primary/70 dark:text-slate-300 hover:text-primary dark:hover:text-white underline underline-offset-4 decoration-primary/20">Manage</button>
                                </td>
                            </tr>
                            <tr class="hover:bg-primary/5 dark:hover:bg-white/5 transition-colors">
                                <td class="px-6 py-4">
                                    <div class="flex items-center gap-3">
                                        <div
                                            class="size-10 rounded-full bg-primary/10 dark:bg-white/10 flex items-center justify-center overflow-hidden">
                                            <img alt="Avatar" class="size-full object-cover"
                                                data-alt="Profile avatar for James Wilson"
                                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCxScVDTywWGr9xIznxRuPx_XSOqop0HJc9R3zMxr0RR3VkFd3YwmlFz-grXKHqpXt4izrYCL0ukjXN2COx0933zTmV9nhZvDgeEs7GPNJtIX0dz0detScNMUVTasNmd8107_QzfCUt3WU22AOA0EMvao2CjkqODgnImcki9TtLZogOAH2d3hzxIf5nRbuwqJMj9WSFe0fPerEaKkcq89FkQpT62cs_PSiq00PSXsILpPmYSmfGKU0hYGP0m5Z3UGInVNN9_bwd6nRk" />
                                        </div>
                                        <div>
                                            <p class="text-sm font-bold">James Wilson</p>
                                            <p class="text-xs text-primary/60 dark:text-slate-400">james@example.com</p>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-6 py-4">
                                    <span
                                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 dark:bg-white/10 text-primary dark:text-white">
                                        User
                                    </span>
                                </td>
                                <td class="px-6 py-4">
                                    <span
                                        class="inline-flex items-center gap-1.5 text-xs font-medium text-red-500 dark:text-red-400">
                                        <span class="size-1.5 rounded-full bg-red-500 dark:bg-red-400"></span>
                                        Suspended
                                    </span>
                                </td>
                                <td class="px-6 py-4 text-right">
                                    <p class="text-sm font-bold">420 <span
                                            class="text-primary/50 dark:text-slate-500 font-medium">pts</span></p>
                                </td>
                                <td class="px-6 py-4 text-right">
                                    <button
                                        class="text-sm font-bold text-primary/70 dark:text-slate-300 hover:text-primary dark:hover:text-white underline underline-offset-4 decoration-primary/20">Manage</button>
                                </td>
                            </tr>
                            <tr class="hover:bg-primary/5 dark:hover:bg-white/5 transition-colors">
                                <td class="px-6 py-4">
                                    <div class="flex items-center gap-3">
                                        <div
                                            class="size-10 rounded-full bg-primary/10 dark:bg-white/10 flex items-center justify-center overflow-hidden">
                                            <img alt="Avatar" class="size-full object-cover"
                                                data-alt="Profile avatar for Maria Garcia"
                                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCEI2q-PxCoLJW2FKoyRjNNay63tD8Y85kCeSSToGzI6b9uafdIWfq6w8awfunVPvTlo_CgLdTTzvMaIM0kgq7bBmf0P6H8dqwUqOq17ZalLqiCWaCtfA42Zu7G9mqXwEKFXY1TkDdaZfLGph2QuOvQVe6rR54_uD9sD7qMXfUK-4vsq6Gp9NJrF7ZJ4yJ7r3f5M50anYP4ZEIi7YU8RO7n2zaTXiat797QD3p5aL8xRXF_d-X1pz0ixjgfstg4P_IXy_nX66-VT9Iu" />
                                        </div>
                                        <div>
                                            <p class="text-sm font-bold">Maria Garcia</p>
                                            <p class="text-xs text-primary/60 dark:text-slate-400">maria@example.com</p>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-6 py-4">
                                    <span
                                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 dark:bg-white/10 text-primary dark:text-white">
                                        User
                                    </span>
                                </td>
                                <td class="px-6 py-4">
                                    <span
                                        class="inline-flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-400">
                                        <span class="size-1.5 rounded-full bg-green-600 dark:bg-green-400"></span>
                                        Active
                                    </span>
                                </td>
                                <td class="px-6 py-4 text-right">
                                    <p class="text-sm font-bold">2,100 <span
                                            class="text-primary/50 dark:text-slate-500 font-medium">pts</span></p>
                                </td>
                                <td class="px-6 py-4 text-right">
                                    <button
                                        class="text-sm font-bold text-primary/70 dark:text-slate-300 hover:text-primary dark:hover:text-white underline underline-offset-4 decoration-primary/20">Manage</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div
                        class="px-6 py-4 bg-primary/5 dark:bg-white/5 border-t border-primary/10 dark:border-white/10 flex items-center justify-between">
                        <p class="text-xs text-primary/60 dark:text-slate-400 font-medium">Showing 1 to 4 of 25 users
                        </p>
                        <div class="flex gap-2">
                            <button
                                class="p-2 rounded-lg border border-primary/10 dark:border-white/10 hover:bg-white dark:hover:bg-primary/50 transition-colors disabled:opacity-50"
                                disabled="">
                                <span class="material-symbols-outlined text-[18px]">chevron_left</span>
                            </button>
                            <button
                                class="p-2 rounded-lg border border-primary/10 dark:border-white/10 hover:bg-white dark:hover:bg-primary/50 transition-colors">
                                <span class="material-symbols-outlined text-[18px]">chevron_right</span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    </div>
`;
  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
      <div dangerouslySetInnerHTML={{ __html: markup }} />
    </div>
  );
}
