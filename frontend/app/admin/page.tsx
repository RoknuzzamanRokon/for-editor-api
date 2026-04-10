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

    // Fetch user data
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
                <a class="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary text-white" href="/admin">
                    <span class="material-symbols-outlined">dashboard</span>
                    <span class="text-sm font-medium">Dashboard</span>
                </a>
                <a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-primary/10 transition-colors"
                    href="/admin/history/transactions">
                    <span class="material-symbols-outlined">history</span>
                    <span class="text-sm font-medium">History</span>
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
                <a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-primary/10 transition-colors"
                    href="/admin/settings">
                    <span class="material-symbols-outlined">settings</span>
                    <span class="text-sm font-medium">Settings</span>
                </a>
            </nav>
            <div class="p-4 border-t border-primary/10 space-y-1">
                <a href="/admin/profile" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-primary/10 transition-colors">
                    <span class="material-symbols-outlined">manage_accounts</span>
                    <span class="text-sm font-medium">Profile</span>
                </a>
                <a href="/admin/profile" class="flex items-center gap-3 p-2 rounded-lg hover:bg-primary/5 cursor-pointer">
                    <div class="size-9 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                        <span class="material-symbols-outlined">person</span>
                    </div>
                    <div class="flex-1 truncate">
                        <p id="sidebar-name" class="text-xs font-bold truncate">Alex Smith</p>
                        <p class="text-[10px] text-slate-500 font-medium uppercase tracking-wider">System Admin</p>
                    </div>
                </a>
            </div>
        </aside>
        <!-- Main Content -->
        <main class="flex-1 flex flex-col overflow-y-auto">
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
            <!-- Page Content -->
            <div class="p-8 space-y-8">
                <!-- Stats Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-primary/10 shadow-sm">
                        <div class="flex justify-between items-start mb-4">
                            <div class="p-2 bg-primary/10 rounded-lg text-primary">
                                <span class="material-symbols-outlined">toll</span>
                            </div>
                            <span
                                class="text-emerald-500 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-full">+12.5%</span>
                        </div>
                        <p class="text-sm text-slate-500 font-medium">Total Points Issued</p>
                        <h3 class="text-2xl font-bold mt-1">1,240,500</h3>
                    </div>
                    <div class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-primary/10 shadow-sm">
                        <div class="flex justify-between items-start mb-4">
                            <div class="p-2 bg-primary/10 rounded-lg text-primary">
                                <span class="material-symbols-outlined">person_add</span>
                            </div>
                            <span
                                class="text-emerald-500 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-full">+5.2%</span>
                        </div>
                        <p class="text-sm text-slate-500 font-medium">Active Users</p>
                        <h3 class="text-2xl font-bold mt-1">12,450</h3>
                    </div>
                    <div class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-primary/10 shadow-sm">
                        <div class="flex justify-between items-start mb-4">
                            <div class="p-2 bg-primary/10 rounded-lg text-primary">
                                <span class="material-symbols-outlined">api</span>
                            </div>
                            <span class="text-orange-500 text-xs font-bold bg-orange-50 px-2 py-1 rounded-full">18
                                Pending</span>
                        </div>
                        <p class="text-sm text-slate-500 font-medium">API Requests</p>
                        <h3 class="text-2xl font-bold mt-1">1,892</h3>
                    </div>
                    <div class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-primary/10 shadow-sm">
                        <div class="flex justify-between items-start mb-4">
                            <div class="p-2 bg-primary/10 rounded-lg text-primary">
                                <span class="material-symbols-outlined">report_problem</span>
                            </div>
                            <span class="text-red-500 text-xs font-bold bg-red-50 px-2 py-1 rounded-full">High
                                Alert</span>
                        </div>
                        <p class="text-sm text-slate-500 font-medium">Flagged Activities</p>
                        <h3 class="text-2xl font-bold mt-1">4</h3>
                    </div>
                </div>
                <!-- Dashboard Body -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <!-- Main Controls & Form -->
                    <div class="lg:col-span-2 space-y-8">
                        <!-- Point Distribution Chart (Simplified Visual) -->
                        <div class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-primary/10 shadow-sm">
                            <div class="flex items-center justify-between mb-6">
                                <h4 class="font-bold">Point Distribution</h4>
                                <select
                                    class="text-xs border-primary/10 rounded-lg bg-background-light dark:bg-background-dark">
                                    <option>Last 7 Days</option>
                                    <option>Last 30 Days</option>
                                </select>
                            </div>
                            <div class="flex items-end justify-between h-48 px-4">
                                <div class="flex flex-col items-center gap-2 flex-1">
                                    <div class="w-full bg-primary/10 rounded-t-lg transition-all hover:bg-primary/30"
                                        style="height: 60%"></div>
                                    <span class="text-[10px] text-slate-400 font-bold uppercase">Mon</span>
                                </div>
                                <div class="w-4"></div>
                                <div class="flex flex-col items-center gap-2 flex-1">
                                    <div class="w-full bg-primary/10 rounded-t-lg transition-all hover:bg-primary/30"
                                        style="height: 80%"></div>
                                    <span class="text-[10px] text-slate-400 font-bold uppercase">Tue</span>
                                </div>
                                <div class="w-4"></div>
                                <div class="flex flex-col items-center gap-2 flex-1">
                                    <div class="w-full bg-primary/10 rounded-t-lg transition-all hover:bg-primary/30"
                                        style="height: 45%"></div>
                                    <span class="text-[10px] text-slate-400 font-bold uppercase">Wed</span>
                                </div>
                                <div class="w-4"></div>
                                <div class="flex flex-col items-center gap-2 flex-1">
                                    <div class="w-full bg-primary/10 rounded-t-lg transition-all hover:bg-primary/30"
                                        style="height: 95%"></div>
                                    <span class="text-[10px] text-slate-400 font-bold uppercase">Thu</span>
                                </div>
                                <div class="w-4"></div>
                                <div class="flex flex-col items-center gap-2 flex-1">
                                    <div class="w-full bg-primary/10 rounded-t-lg transition-all hover:bg-primary/30"
                                        style="height: 70%"></div>
                                    <span class="text-[10px] text-slate-400 font-bold uppercase">Fri</span>
                                </div>
                                <div class="w-4"></div>
                                <div class="flex flex-col items-center gap-2 flex-1">
                                    <div class="w-full bg-primary rounded-t-lg transition-all" style="height: 85%">
                                    </div>
                                    <span class="text-[10px] text-slate-400 font-bold uppercase">Sat</span>
                                </div>
                                <div class="w-4"></div>
                                <div class="flex flex-col items-center gap-2 flex-1">
                                    <div class="w-full bg-primary/10 rounded-t-lg transition-all hover:bg-primary/30"
                                        style="height: 55%"></div>
                                    <span class="text-[10px] text-slate-400 font-bold uppercase">Sun</span>
                                </div>
                            </div>
                        </div>
                        <!-- Recent Activity Table -->
                        <div
                            class="bg-white dark:bg-slate-900 rounded-xl border border-primary/10 shadow-sm overflow-hidden">
                            <div class="p-6 border-b border-primary/10 flex items-center justify-between">
                                <h4 class="font-bold">Recent Activity</h4>
                                <a class="text-xs text-primary font-bold hover:underline" href="#">View All</a>
                            </div>
                            <div class="overflow-x-auto">
                                <table class="w-full text-left">
                                    <thead>
                                        <tr
                                            class="bg-background-light dark:bg-background-dark text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                                            <th class="px-6 py-3">User</th>
                                            <th class="px-6 py-3 text-right">Points</th>
                                            <th class="px-6 py-3">Action</th>
                                            <th class="px-6 py-3">Timestamp</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-primary/5">
                                        <tr class="text-sm">
                                            <td class="px-6 py-4 flex items-center gap-3">
                                                <div
                                                    class="size-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold">
                                                    JD</div>
                                                <span class="font-medium">John Doe</span>
                                            </td>
                                            <td class="px-6 py-4 text-right font-bold text-emerald-600">+1,500</td>
                                            <td class="px-6 py-4">
                                                <span
                                                    class="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full">Reward</span>
                                            </td>
                                            <td class="px-6 py-4 text-slate-500 text-xs">2 mins ago</td>
                                        </tr>
                                        <tr class="text-sm">
                                            <td class="px-6 py-4 flex items-center gap-3">
                                                <div
                                                    class="size-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold">
                                                    SM</div>
                                                <span class="font-medium">Sarah Miller</span>
                                            </td>
                                            <td class="px-6 py-4 text-right font-bold text-emerald-600">+500</td>
                                            <td class="px-6 py-4">
                                                <span
                                                    class="px-2 py-1 bg-emerald-50 text-emerald-600 text-xs rounded-full">Adjustment</span>
                                            </td>
                                            <td class="px-6 py-4 text-slate-500 text-xs">15 mins ago</td>
                                        </tr>
                                        <tr class="text-sm">
                                            <td class="px-6 py-4 flex items-center gap-3">
                                                <div
                                                    class="size-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold">
                                                    BK</div>
                                                <span class="font-medium">Brian King</span>
                                            </td>
                                            <td class="px-6 py-4 text-right font-bold text-red-600">-2,000</td>
                                            <td class="px-6 py-4">
                                                <span
                                                    class="px-2 py-1 bg-red-50 text-red-600 text-xs rounded-full">Deduction</span>
                                            </td>
                                            <td class="px-6 py-4 text-slate-500 text-xs">1 hour ago</td>
                                        </tr>
                                        <tr class="text-sm">
                                            <td class="px-6 py-4 flex items-center gap-3">
                                                <div
                                                    class="size-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold">
                                                    CW</div>
                                                <span class="font-medium">Chris Wong</span>
                                            </td>
                                            <td class="px-6 py-4 text-right font-bold text-emerald-600">+100</td>
                                            <td class="px-6 py-4">
                                                <span
                                                    class="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full">Reward</span>
                                            </td>
                                            <td class="px-6 py-4 text-slate-500 text-xs">2 hours ago</td>
                                        </tr>
                                        <tr class="text-sm">
                                            <td class="px-6 py-4 flex items-center gap-3">
                                                <div
                                                    class="size-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold">
                                                    EL</div>
                                                <span class="font-medium">Emma Lee</span>
                                            </td>
                                            <td class="px-6 py-4 text-right font-bold text-emerald-600">+2,500</td>
                                            <td class="px-6 py-4">
                                                <span
                                                    class="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full">Reward</span>
                                            </td>
                                            <td class="px-6 py-4 text-slate-500 text-xs">5 hours ago</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <!-- Quick Action Sidebar -->
                    <div class="space-y-8">
                        <div class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-primary/10 shadow-sm">
                            <h4 class="font-bold mb-6 flex items-center gap-2">
                                <span class="material-symbols-outlined text-primary">send_money</span>
                                Give Points Quick Action
                            </h4>
                            <form class="space-y-4">
                                <div>
                                    <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Select
                                        User</label>
                                    <select
                                        class="w-full bg-background-light dark:bg-background-dark border-primary/10 rounded-lg text-sm p-3 focus:ring-primary focus:border-primary">
                                        <option>Search and select user...</option>
                                        <option>John Doe (ID: 4821)</option>
                                        <option>Sarah Miller (ID: 9021)</option>
                                        <option>Brian King (ID: 3321)</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Point
                                        Amount</label>
                                    <div class="relative">
                                        <input
                                            class="w-full bg-background-light dark:bg-background-dark border-primary/10 rounded-lg text-sm p-3 pr-10 focus:ring-primary focus:border-primary"
                                            placeholder="0" type="number" />
                                        <span
                                            class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">PTS</span>
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Reason</label>
                                    <textarea
                                        class="w-full bg-background-light dark:bg-background-dark border-primary/10 rounded-lg text-sm p-3 focus:ring-primary focus:border-primary"
                                        placeholder="Explain the reason for adjustment..." rows="3"></textarea>
                                </div>
                                <button
                                    class="w-full bg-primary text-white py-3 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                                    type="submit">
                                    <span class="material-symbols-outlined text-sm">check_circle</span>
                                    Submit Point Allocation
                                </button>
                            </form>
                        </div>
                        <!-- System Status -->
                        <div class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-primary/10 shadow-sm">
                            <h4 class="font-bold mb-4">System Status</h4>
                            <div class="space-y-4">
                                <div class="flex items-center justify-between text-sm">
                                    <span class="text-slate-500">API Health</span>
                                    <div class="flex items-center gap-2">
                                        <span class="size-2 bg-emerald-500 rounded-full"></span>
                                        <span class="font-medium">99.9%</span>
                                    </div>
                                </div>
                                <div class="flex items-center justify-between text-sm">
                                    <span class="text-slate-500">Database Load</span>
                                    <div class="flex items-center gap-2">
                                        <div class="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div class="h-full bg-primary" style="width: 24%"></div>
                                        </div>
                                        <span class="font-medium">24%</span>
                                    </div>
                                </div>
                                <div class="flex items-center justify-between text-sm">
                                    <span class="text-slate-500">Pending Approvals</span>
                                    <span
                                        class="px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-bold rounded">12
                                        Required</span>
                                </div>
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
