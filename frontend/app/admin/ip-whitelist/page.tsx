 "use client";

import { useEffect } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000";

export default function Page() {
  useEffect(() => {
    const menuButton = document.getElementById("user-menu-button");
    const menuDropdown = document.getElementById("user-menu-dropdown");
    const logoutButton = document.getElementById("logout-button");

    if (!(menuButton instanceof HTMLButtonElement) || !(menuDropdown instanceof HTMLDivElement)) {
      return;
    }

    const toggleMenu = (e: Event) => {
      e.stopPropagation();
      menuDropdown.classList.toggle("hidden");
    };

    const closeMenu = () => {
      menuDropdown.classList.add("hidden");
    };

    const stopPropagation = (e: Event) => {
      e.stopPropagation();
    };

    const handleLogout = () => {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user_role");
      window.location.href = "/";
    };

    menuButton.addEventListener("click", toggleMenu);
    menuDropdown.addEventListener("click", stopPropagation);
    document.addEventListener("click", closeMenu);
    logoutButton?.addEventListener("click", handleLogout);

    const token = localStorage.getItem("access_token");
    if (token) {
      fetch(`${API_BASE}/api/v2/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          const userName = document.getElementById("user-name");
          const userEmail = document.getElementById("user-email");
          const userRole = document.getElementById("user-role");

          if (userName) userName.textContent = data.full_name || data.email || "User";
          if (userEmail) userEmail.textContent = data.email || "";
          if (userRole) userRole.textContent = data.role || "Admin";
        })
        .catch((err) => console.error("Failed to fetch user:", err));
    }

    return () => {
      menuButton.removeEventListener("click", toggleMenu);
      menuDropdown.removeEventListener("click", stopPropagation);
      document.removeEventListener("click", closeMenu);
      logoutButton?.removeEventListener("click", handleLogout);
    };
  }, []);

  const markup = `
<div class="flex h-screen overflow-hidden">
        <!-- Sidebar -->
        <aside class="w-64 flex-shrink-0 bg-white dark:bg-slate-900 border-r border-primary/10 flex flex-col">
            <div class="p-6 flex items-center gap-3">
                <div class="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
                    <span class="material-symbols-outlined text-xl">token</span>
                </div>
                <div>
                    <h1 class="text-lg font-bold leading-none">Point Control</h1>
                    <p class="text-xs text-slate-500 font-medium">Admin Panel</p>
                </div>
            </div>
            <nav class="flex-1 px-4 space-y-1 mt-4">
                <a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-primary/10 transition-colors" href="/admin">
                    <span class="material-symbols-outlined">dashboard</span>
                    <span class="text-sm font-medium">Dashboard</span>
                </a>
                <a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-primary/10 transition-colors"
                    href="/admin/app-center">
                    <span class="material-symbols-outlined">apps</span>
                    <span class="text-sm font-medium">App Center</span>
                </a>
                <a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-primary/10 transition-colors"
                    href="/admin/api-permissions">
                    <span class="material-symbols-outlined">key</span>
                    <span class="text-sm font-medium">API Permissions</span>
                </a>
                <a class="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary text-white"
                    href="/admin/ip-whitelist">
                    <span class="material-symbols-outlined">shield_person</span>
                    <span class="text-sm font-medium">IP Whitelisting</span>
                </a>
                <a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-primary/10 transition-colors"
                    href="/admin/users">
                    <span class="material-symbols-outlined">group</span>
                    <span class="text-sm font-medium">Users</span>
                </a>
                <a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-primary/10 transition-colors mt-auto"
                    href="/admin/settings">
                    <span class="material-symbols-outlined">settings</span>
                    <span class="text-sm font-medium">Settings</span>
                </a>
            </nav>
            <div class="p-4 border-t border-primary/10">
                <div class="flex items-center gap-3 p-2 rounded-lg hover:bg-primary/5 cursor-pointer">
                    <div class="size-9 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                        <span class="material-symbols-outlined">person</span>
                    </div>
                    <div class="flex-1 truncate">
                        <p class="text-xs font-bold truncate">Alex Smith</p>
                        <p class="text-[10px] text-slate-500 font-medium uppercase tracking-wider">System Admin</p>
                    </div>
                </div>
            </div>
        </aside>
        <!-- Main Content -->
        <main class="flex-1 flex flex-col overflow-hidden">
            <!-- Header -->
            <header
                class="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-8 shrink-0">
                <div class="flex-1 max-w-2xl">
                    <div class="relative">
                        <span
                            class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input
                            class="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm placeholder:text-slate-400"
                            placeholder="Search transactions, users or API keys..." type="text" />
                    </div>
                </div>
                <div class="flex items-center gap-6">
                    <div class="relative">
                        <button class="text-slate-400 hover:text-primary transition-colors">
                            <span class="material-symbols-outlined">notifications</span>
                        </button>
                        <span
                            class="absolute top-0 right-0 size-2 bg-primary rounded-full border-2 border-white dark:border-slate-900"></span>
                    </div>
                    <div class="h-8 w-px bg-slate-200 dark:bg-slate-800"></div>
                    <div class="relative">
                        <button id="user-menu-button" type="button" aria-haspopup="menu" aria-expanded="false" class="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/10 hover:bg-primary/30 transition-colors cursor-pointer">
                            <span class="material-symbols-outlined">person</span>
                        </button>
                        <div id="user-menu-dropdown" class="hidden absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl z-[9999]">
                            <div class="p-4 border-b border-slate-200 dark:border-slate-800">
                                <p id="user-name" class="text-sm font-bold truncate">Loading...</p>
                                <p id="user-email" class="text-xs text-slate-500 truncate"></p>
                                <p id="user-role" class="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-1"></p>
                            </div>
                            <div class="p-2">
                                <button id="logout-button" class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-sm font-medium">
                                    <span class="material-symbols-outlined text-lg">logout</span>
                                    <span>Logout</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            <!-- Content Area -->
            <div class="flex-1 overflow-y-auto p-8">
                <div class="max-w-6xl mx-auto space-y-8">
                    <!-- Top Actions & Subheader -->
                    <div class="flex justify-between items-start">
                        <div class="max-w-xl">
                            <h3 class="text-2xl font-bold tracking-tight mb-2">Security Rules</h3>
                            <p class="text-primary/60 dark:text-slate-400">Manage and restrict API access to trusted IP
                                addresses or CIDR ranges. Only requests from these addresses will be permitted.</p>
                        </div>
                        <button
                            class="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-semibold text-sm hover:opacity-90 shadow-sm transition-opacity">
                            <span class="material-symbols-outlined text-[20px]">add</span>
                            Add New IP
                        </button>
                    </div>
                    <!-- Statistics Bar (Extra component for clean UI) -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div class="bg-white dark:bg-primary/80 p-6 rounded-xl border border-primary/10 shadow-sm">
                            <p
                                class="text-xs font-bold text-primary/50 dark:text-white/40 uppercase tracking-widest mb-1">
                                Total IPs</p>
                            <p class="text-2xl font-bold">12</p>
                        </div>
                        <div class="bg-white dark:bg-primary/80 p-6 rounded-xl border border-primary/10 shadow-sm">
                            <p
                                class="text-xs font-bold text-primary/50 dark:text-white/40 uppercase tracking-widest mb-1">
                                Active Rules</p>
                            <p class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">11</p>
                        </div>
                        <div class="bg-white dark:bg-primary/80 p-6 rounded-xl border border-primary/10 shadow-sm">
                            <p
                                class="text-xs font-bold text-primary/50 dark:text-white/40 uppercase tracking-widest mb-1">
                                Last Update</p>
                            <p class="text-2xl font-bold">2h ago</p>
                        </div>
                    </div>
                    <!-- IP Table -->
                    <div
                        class="bg-white dark:bg-primary/80 border border-primary/10 rounded-xl shadow-sm overflow-hidden">
                        <div class="overflow-x-auto">
                            <table class="w-full text-left border-collapse">
                                <thead>
                                    <tr class="bg-primary/5 dark:bg-white/5 border-b border-primary/10">
                                        <th
                                            class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-primary/70 dark:text-white/70">
                                            IP Address/Range</th>
                                        <th
                                            class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-primary/70 dark:text-white/70">
                                            Label/Description</th>
                                        <th
                                            class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-primary/70 dark:text-white/70">
                                            Status</th>
                                        <th
                                            class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-primary/70 dark:text-white/70">
                                            Added On</th>
                                        <th
                                            class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-primary/70 dark:text-white/70 text-right">
                                            Action</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-primary/5 dark:divide-white/5">
                                    <tr class="hover:bg-primary/5 dark:hover:bg-white/5 transition-colors">
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <span
                                                class="font-mono text-sm text-primary dark:text-white">192.168.1.1</span>
                                        </td>
                                        <td class="px-6 py-4 text-sm text-primary/70 dark:text-white/70">Office Main
                                            Headquarters</td>
                                        <td class="px-6 py-4">
                                            <span
                                                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400">
                                                Active
                                            </span>
                                        </td>
                                        <td class="px-6 py-4 text-sm text-primary/60 dark:text-white/40">2023-10-01</td>
                                        <td class="px-6 py-4 text-right">
                                            <div class="flex justify-end gap-2">
                                                <button
                                                    class="p-1.5 hover:bg-primary/10 dark:hover:bg-white/10 rounded text-primary/60 hover:text-primary dark:text-white/40 dark:hover:text-white transition-colors">
                                                    <span class="material-symbols-outlined text-[18px]">edit</span>
                                                </button>
                                                <button
                                                    class="p-1.5 hover:bg-red-500/10 rounded text-primary/60 hover:text-red-500 dark:text-white/40 dark:hover:text-red-400 transition-colors">
                                                    <span class="material-symbols-outlined text-[18px]">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr class="hover:bg-primary/5 dark:hover:bg-white/5 transition-colors">
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <span
                                                class="font-mono text-sm text-primary dark:text-white">10.0.0.5/24</span>
                                        </td>
                                        <td class="px-6 py-4 text-sm text-primary/70 dark:text-white/70">Staging
                                            Environment VPN</td>
                                        <td class="px-6 py-4">
                                            <span
                                                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400">
                                                Active
                                            </span>
                                        </td>
                                        <td class="px-6 py-4 text-sm text-primary/60 dark:text-white/40">2023-10-05</td>
                                        <td class="px-6 py-4 text-right">
                                            <div class="flex justify-end gap-2">
                                                <button
                                                    class="p-1.5 hover:bg-primary/10 dark:hover:bg-white/10 rounded text-primary/60 hover:text-primary dark:text-white/40 dark:hover:text-white transition-colors">
                                                    <span class="material-symbols-outlined text-[18px]">edit</span>
                                                </button>
                                                <button
                                                    class="p-1.5 hover:bg-red-500/10 rounded text-primary/60 hover:text-red-500 dark:text-white/40 dark:hover:text-red-400 transition-colors">
                                                    <span class="material-symbols-outlined text-[18px]">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr class="hover:bg-primary/5 dark:hover:bg-white/5 transition-colors">
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <span
                                                class="font-mono text-sm text-primary dark:text-white">172.16.0.1</span>
                                        </td>
                                        <td class="px-6 py-4 text-sm text-primary/70 dark:text-white/70">Backup Remote
                                            Server</td>
                                        <td class="px-6 py-4">
                                            <span
                                                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-500/20 dark:text-slate-400">
                                                Inactive
                                            </span>
                                        </td>
                                        <td class="px-6 py-4 text-sm text-primary/60 dark:text-white/40">2023-10-12</td>
                                        <td class="px-6 py-4 text-right">
                                            <div class="flex justify-end gap-2">
                                                <button
                                                    class="p-1.5 hover:bg-primary/10 dark:hover:bg-white/10 rounded text-primary/60 hover:text-primary dark:text-white/40 dark:hover:text-white transition-colors">
                                                    <span class="material-symbols-outlined text-[18px]">edit</span>
                                                </button>
                                                <button
                                                    class="p-1.5 hover:bg-red-500/10 rounded text-primary/60 hover:text-red-500 dark:text-white/40 dark:hover:text-red-400 transition-colors">
                                                    <span class="material-symbols-outlined text-[18px]">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <!-- Placeholder Empty State (Commented out but structured for use) -->
                    <!-- 
                    <div class="flex flex-col items-center justify-center p-20 border-2 border-dashed border-primary/20 rounded-xl bg-white/50 dark:bg-primary/20">
                        <div class="h-20 w-20 rounded-full bg-primary/5 flex items-center justify-center mb-6">
                            <span class="material-symbols-outlined text-4xl text-primary/20">lock_open</span>
                        </div>
                        <h4 class="text-xl font-bold mb-2">No Whitelisted IPs</h4>
                        <p class="text-primary/60 dark:text-white/40 text-center max-w-sm mb-8">Secure your system by adding your first trusted IP address or CIDR range to restrict access.</p>
                        <button class="px-6 py-3 bg-primary text-white rounded-lg font-bold hover:opacity-90 shadow transition-all">
                            Add Your First IP
                        </button>
                    </div>
                    -->
                    <!-- Quick Note -->
                    <div class="p-4 bg-primary/5 dark:bg-white/5 border border-primary/10 rounded-lg flex gap-3">
                        <span class="material-symbols-outlined text-primary/40 dark:text-white/40">info</span>
                        <p class="text-xs text-primary/70 dark:text-white/60 leading-relaxed">
                            Pro-tip: Use CIDR notation (e.g., /24) to whitelist entire subnets. Changes to IP rules
                            usually take effect within 60 seconds across all edge nodes.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    </div>
`;
  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen">
      <div dangerouslySetInnerHTML={{ __html: markup }} />
    </div>
  );
}
