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
                <a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-primary/10 transition-colors"
                    href="/admin">
                    <span class="material-symbols-outlined">dashboard</span>
                    <span class="text-sm font-medium">Dashboard</span>
                </a>
                <a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-primary/10 transition-colors"
                    href="/admin/api-permissions">
                    <span class="material-symbols-outlined">key</span>
                    <span class="text-sm font-medium">API Permissions</span>
                </a>
                <a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-primary/10 transition-colors"
                    href="/admin/ip-whitelist">
                    <span class="material-symbols-outlined">shield_person</span>
                    <span class="text-sm font-medium">IP Whitelisting</span>
                </a>
                <a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-primary/10 transition-colors"
                    href="/admin/users">
                    <span class="material-symbols-outlined">group</span>
                    <span class="text-sm font-medium">Users</span>
                </a>
                <a class="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary text-white" href="/admin/settings">
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
        <main class="flex-1 flex flex-col overflow-hidden bg-background-light dark:bg-background-dark">
            <!-- Header -->
            <header
                class="h-16 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-8">
                <div class="flex-1 max-w-2xl">
                    <div class="relative">
                        <span
                            class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
                        <input
                            class="w-full pl-11 pr-4 py-2.5 bg-slate-100/50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary"
                            placeholder="Search transactions, users or API keys..." type="text" />
                    </div>
                </div>
                <div class="flex items-center gap-6">
                    <button class="relative p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <span class="material-symbols-outlined">notifications</span>
                        <span
                            class="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full border-2 border-white dark:border-slate-900"></span>
                    </button>
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
                                <button id="logout-button" type="button" class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-sm font-medium">
                                    <span class="material-symbols-outlined text-lg">logout</span>
                                    <span>Logout</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            <!-- Content Area -->
            <div class="flex-1 overflow-y-auto p-8 max-w-5xl mx-auto w-full">
                <div class="mb-8">
                    <h1 class="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Settings</h1>
                    <p class="text-slate-500 dark:text-slate-400 mt-2">Manage your point system, security preferences,
                        and administrative configurations.</p>
                </div>
                <div class="space-y-8 pb-12">
                    <!-- General Settings Section -->
                    <section
                        class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div
                            class="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                            <h3 class="text-base font-bold text-slate-900 dark:text-white">General Settings</h3>
                        </div>
                        <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="flex flex-col gap-2">
                                <label class="text-sm font-semibold text-slate-700 dark:text-slate-300">System
                                    Name</label>
                                <input
                                    class="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-primary focus:ring-primary"
                                    type="text" value="Point Control HQ" />
                            </div>
                            <div class="flex flex-col gap-2">
                                <label class="text-sm font-semibold text-slate-700 dark:text-slate-300">Admin Contact
                                    Email</label>
                                <input
                                    class="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-primary focus:ring-primary"
                                    type="email" value="admin@pointcontrol.com" />
                            </div>
                            <div class="flex flex-col gap-2 md:col-span-2">
                                <label class="text-sm font-semibold text-slate-700 dark:text-slate-300">System
                                    Timezone</label>
                                <select
                                    class="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-primary focus:ring-primary">
                                    <option>(GMT-08:00) Pacific Time (US &amp; Canada)</option>
                                    <option>(GMT-05:00) Eastern Time (US &amp; Canada)</option>
                                    <option>(GMT+00:00) UTC</option>
                                    <option>(GMT+01:00) London, Paris, Berlin</option>
                                </select>
                            </div>
                        </div>
                    </section>
                    <!-- Point System Configuration -->
                    <section
                        class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div
                            class="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                            <h3 class="text-base font-bold text-slate-900 dark:text-white">Point System Configuration
                            </h3>
                        </div>
                        <div class="p-6 space-y-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div class="flex flex-col gap-2">
                                    <label class="text-sm font-semibold text-slate-700 dark:text-slate-300">Default
                                        Point Value ($1.00 USD)</label>
                                    <div class="relative">
                                        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">pts</span>
                                        <input
                                            class="pl-10 w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-primary focus:ring-primary"
                                            type="number" value="100" />
                                    </div>
                                    <p class="text-[11px] text-slate-500">The amount of points equal to 1 USD.</p>
                                </div>
                                <div class="flex flex-col gap-2">
                                    <label class="text-sm font-semibold text-slate-700 dark:text-slate-300">Maximum
                                        Points per Transaction</label>
                                    <input
                                        class="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-primary focus:ring-primary"
                                        type="number" value="50000" />
                                    <p class="text-[11px] text-slate-500">Limit to prevent accidental massive point
                                        grants.</p>
                                </div>
                            </div>
                            <div
                                class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                <div>
                                    <p class="text-sm font-semibold text-slate-900 dark:text-white">Require Admin
                                        Approval for large point grants</p>
                                    <p class="text-xs text-slate-500 mt-0.5">Transactions over 10,000 points will
                                        require a second administrator to approve.</p>
                                </div>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input checked="" class="sr-only peer" type="checkbox" />
                                    <div
                                        class="w-11 h-6 bg-slate-200 peer-focus:outline-none dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary">
                                    </div>
                                </label>
                            </div>
                        </div>
                    </section>
                    <!-- Security & Privacy Section -->
                    <section
                        class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div
                            class="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                            <h3 class="text-base font-bold text-slate-900 dark:text-white">Security &amp; Privacy</h3>
                        </div>
                        <div class="p-6 space-y-6">
                            <div class="flex flex-col gap-2">
                                <label class="text-sm font-semibold text-slate-700 dark:text-slate-300">Session Timeout
                                    Duration</label>
                                <select
                                    class="w-full md:w-1/2 rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-primary focus:ring-primary">
                                    <option>15 Minutes</option>
                                    <option selected="">30 Minutes</option>
                                    <option>1 Hour</option>
                                    <option>4 Hours</option>
                                    <option>24 Hours</option>
                                </select>
                                <p class="text-[11px] text-slate-500">Automatically logs out the admin after a period of
                                    inactivity.</p>
                            </div>
                            <div
                                class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
                                <div class="flex items-center gap-3">
                                    <span class="material-symbols-outlined text-primary">verified_user</span>
                                    <div>
                                        <p class="text-sm font-semibold text-slate-900 dark:text-white">Enforce
                                            Two-Factor Authentication (2FA)</p>
                                        <p class="text-xs text-slate-500 mt-0.5">Require all admin users to use a 2FA
                                            method to log in.</p>
                                    </div>
                                </div>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input class="sr-only peer" type="checkbox" />
                                    <div
                                        class="w-11 h-6 bg-slate-200 peer-focus:outline-none dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary">
                                    </div>
                                </label>
                            </div>
                        </div>
                    </section>
                    <!-- Action Buttons -->
                    <div
                        class="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                        <button
                            class="w-full sm:w-auto px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                            Reset to Defaults
                        </button>
                        <button
                            class="w-full sm:w-auto px-10 py-2.5 bg-primary text-white font-bold text-sm rounded-lg hover:bg-opacity-90 shadow-lg shadow-primary/20 transition-all">
                            Save Changes
                        </button>
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
