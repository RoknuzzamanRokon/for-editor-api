"use client";

import { useEffect } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000";

export default function Page() {
  useEffect(() => {
    const menuButton = document.getElementById('user-menu-button');
    const menuDropdown = document.getElementById('user-menu-dropdown');
    const logoutButton = document.getElementById('logout-button');
    
    const toggleMenu = (e: Event) => {
      e.stopPropagation();
      menuDropdown?.classList.toggle('hidden');
    };
    
    const closeMenu = () => {
      menuDropdown?.classList.add('hidden');
    };
    
    const stopPropagation = (e: Event) => {
      e.stopPropagation();
    };
    
    const handleLogout = () => {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_role');
      window.location.href = '/';
    };
    
    menuButton?.addEventListener('click', toggleMenu);
    document.addEventListener('click', closeMenu);
    menuDropdown?.addEventListener('click', stopPropagation);
    logoutButton?.addEventListener('click', handleLogout);
    
    // Fetch user data
    const token = localStorage.getItem('access_token');
    if (token) {
      fetch(`${API_BASE}/api/v2/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        const userName = document.getElementById('user-name');
        const userEmail = document.getElementById('user-email');
        const userRole = document.getElementById('user-role');
        
        if (userName) userName.textContent = data.full_name || data.email || 'User';
        if (userEmail) userEmail.textContent = data.email || '';
        if (userRole) userRole.textContent = data.role || 'Admin';
      })
      .catch(err => console.error('Failed to fetch user:', err));
    }
    
    return () => {
      menuButton?.removeEventListener('click', toggleMenu);
      document.removeEventListener('click', closeMenu);
      menuDropdown?.removeEventListener('click', stopPropagation);
      logoutButton?.removeEventListener('click', handleLogout);
    };
  }, []);

  const markup = `
<div class="flex h-screen overflow-hidden">
        <!-- Sidebar -->
        <aside
            class="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between shrink-0">
            <div class="flex flex-col gap-6 p-4">
                <div class="flex items-center gap-3 px-2 mb-2">
                    <div class="bg-primary rounded-lg size-10 flex items-center justify-center text-white">
                        <span class="material-symbols-outlined">inventory_2</span>
                    </div>
                    <div class="flex flex-col">
                        <h1 class="text-slate-900 dark:text-slate-100 text-base font-bold leading-none">Point Control
                        </h1>
                        <p class="text-slate-500 dark:text-slate-400 text-xs mt-1">Admin Panel</p>
                    </div>
                </div>
                <nav class="flex flex-col gap-1"><a
                        class="flex items-center gap-3 px-3 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        href="/admin">
                        <span class="material-symbols-outlined">dashboard</span>
                        <span class="text-sm font-medium">Dashboard</span>
                    </a>
                    <a class="flex items-center gap-3 px-3 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        href="/admin/history/transactions">
                        <span class="material-symbols-outlined">history</span>
                        <span class="text-sm font-medium">History</span>
                    </a>
                    <a class="flex items-center gap-3 px-3 py-2.5 bg-primary text-white rounded-lg" href="/admin/api-permissions">
                        <span class="material-symbols-outlined">vpn_key</span>
                        <span class="text-sm font-bold">API Permissions</span>
                    </a>
                    <a class="flex items-center gap-3 px-3 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        href="/admin/ip-whitelist">
                        <span class="material-symbols-outlined">verified_user</span>
                        <span class="text-sm font-medium">IP Whitelisting</span>
                    </a>
                    <a class="flex items-center gap-3 px-3 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        href="/admin/users">
                        <span class="material-symbols-outlined">group</span>
                        <span class="text-sm font-medium">Users</span>
                    </a>
                    <a class="flex items-center gap-3 px-3 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        href="/admin/settings">
                        <span class="material-symbols-outlined">settings</span>
                        <span class="text-sm font-medium">Settings</span>
                    </a>
                </nav>
            </div>
            <div class="flex items-center gap-3 px-2 py-4 border-t border-slate-100 dark:border-slate-800">
                <div class="size-10 rounded-full bg-slate-200 flex items-center justify-center">
                    <span class="material-symbols-outlined text-slate-500">person</span>
                </div>
                <div class="flex flex-col">
                    <p class="text-sm font-bold text-slate-900 dark:text-white leading-none">Alex Smith</p>
                    <p class="text-[10px] text-slate-500 font-medium mt-1 uppercase tracking-wider">System Admin</p>
                </div>
            </div>
        </aside>
        <!-- Main Content Wrapper -->
        <div class="flex flex-col flex-1 overflow-hidden">
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
                        <button id="user-menu-button" class="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/10 hover:bg-primary/30 transition-colors">
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
            <!-- Scrollable Content -->
            <main class="flex-1 overflow-y-auto p-8">
                <div class="max-w-7xl mx-auto space-y-6">
                    <!-- Title Section -->
                    <div class="flex flex-wrap items-end justify-between gap-4">
                        <div class="space-y-1">
                            <h1 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">API Keys &amp;
                                Permissions</h1>
                            <p class="text-slate-500 dark:text-slate-400">Manage and monitor user API access levels
                                across all modules.</p>
                        </div>
                        <button
                            class="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:shadow-lg transition-all active:scale-95">
                            <span class="material-symbols-outlined text-sm">add_circle</span>
                            Generate New Key
                        </button>
                    </div>
                    <!-- Tabs -->
                    <div class="border-b border-slate-200 dark:border-slate-800 flex gap-8">
                        <button
                            class="px-2 py-4 border-b-2 border-primary text-primary dark:text-white text-sm font-bold">All
                            Keys</button>
                        <button
                            class="px-2 py-4 border-b-2 border-transparent text-slate-500 dark:text-slate-400 text-sm font-bold hover:text-slate-700">Active</button>
                        <button
                            class="px-2 py-4 border-b-2 border-transparent text-slate-500 dark:text-slate-400 text-sm font-bold hover:text-slate-700">Revoked</button>
                    </div>
                    <!-- Filter Bar -->
                    <div
                        class="flex items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                        <div class="flex gap-2">
                            <div class="relative">
                                <span
                                    class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">filter_list</span>
                                <select
                                    class="bg-slate-50 dark:bg-slate-800 border-none rounded-lg pl-9 pr-8 py-2 text-sm focus:ring-2 focus:ring-primary/20 appearance-none text-slate-600 dark:text-slate-400 font-medium">
                                    <option>Filter by Role</option>
                                    <option>Developer</option>
                                    <option>Internal</option>
                                    <option>Third Party</option>
                                </select>
                            </div>
                            <div class="relative">
                                <span
                                    class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">history</span>
                                <select
                                    class="bg-slate-50 dark:bg-slate-800 border-none rounded-lg pl-9 pr-8 py-2 text-sm focus:ring-2 focus:ring-primary/20 appearance-none text-slate-600 dark:text-slate-400 font-medium">
                                    <option>Last 30 Days</option>
                                    <option>Last 7 Days</option>
                                    <option>Last 24 Hours</option>
                                </select>
                            </div>
                        </div>
                        <p class="text-xs text-slate-500 font-medium">Showing 4 of 12 keys</p>
                    </div>
                    <!-- Table Container -->
                    <div
                        class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-slate-50 dark:bg-slate-800/50">
                                    <th
                                        class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                        User</th>
                                    <th
                                        class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                        API Key</th>
                                    <th
                                        class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                        Scopes</th>
                                    <th
                                        class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-center">
                                        Status</th>
                                    <th
                                        class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">
                                        Action</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                                <!-- Row 1 -->
                                <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                    <td class="px-6 py-5">
                                        <div class="flex items-center gap-3">
                                            <img alt="Alex Avatar" class="size-10 rounded-full bg-blue-100"
                                                data-alt="Cartoon avatar of a user named Alex"
                                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGw-ZxGW5GxiMzhjF0ArqoTy1ty30S3EFh6ArWGRX9iv-wMnD0g5ehSAaJOBAiTwwvdcggX-SvfbaUt5awYdF3b5OHh5t16eLtMGTDgLTPjTKIAeREC7d8LmMCFDG3k_gFkqxE9YxWKM9Px7oTY6nan5Rel9CTwe8t0VUQTXEcUTWriDra94u0TEfOXBmWxyttsooRmNrIDZQRYZaN6ZE6C0ugAsXvsohP3IoJ6jBblISRh0PcySXE6WZNLWKuYKDu8ogwzrZ_95vh" />
                                            <div>
                                                <p class="text-sm font-bold leading-none">Alex Rivera</p>
                                                <p class="text-xs text-slate-500 mt-1">alex.r@company.io</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="px-6 py-5">
                                        <div class="flex items-center gap-2 group">
                                            <code
                                                class="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-700 dark:text-slate-300">sk-••••4291</code>
                                            <button
                                                class="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-primary">
                                                <span class="material-symbols-outlined text-base">content_copy</span>
                                            </button>
                                        </div>
                                    </td>
                                    <td class="px-6 py-5">
                                        <div class="flex flex-wrap gap-1">
                                            <span
                                                class="px-2 py-1 bg-primary/5 text-primary dark:text-slate-300 text-[10px] font-bold rounded uppercase tracking-wide">Read
                                                Points</span>
                                            <span
                                                class="px-2 py-1 bg-primary/5 text-primary dark:text-slate-300 text-[10px] font-bold rounded uppercase tracking-wide">Issue
                                                Points</span>
                                        </div>
                                    </td>
                                    <td class="px-6 py-5">
                                        <div class="flex justify-center">
                                            <span
                                                class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                                                <span class="size-1.5 rounded-full bg-emerald-500"></span>
                                                Active
                                            </span>
                                        </div>
                                    </td>
                                    <td class="px-6 py-5 text-right">
                                        <button
                                            class="text-primary dark:text-slate-300 text-sm font-bold hover:underline">Manage</button>
                                    </td>
                                </tr>
                                <!-- Row 2 -->
                                <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                    <td class="px-6 py-5">
                                        <div class="flex items-center gap-3">
                                            <img alt="Jordan Avatar" class="size-10 rounded-full bg-purple-100"
                                                data-alt="Cartoon avatar of a user named Jordan"
                                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCuoBtehNCBz5bTfLZ5vv8AkOLSyUrWfjQ39O8pxkRd70Ey5eczgCUsMYKVL_pg72Ue-Q9WzkChSKwOSETv81y9wLJ5gq5W11mS7TPxKRV2ARK2oGssvvJahZ_r-I5JQzePOcVRUEDIzzQvmM5QMQpWuDL8X5vrGrb81XuOLucj4WF9VRPVXPyTHCc5UZ-EQOP6X1Y6bpJM53L9D4M2Vrgn1LX204zrgmNnLH5ByPkaP02ePpqYDzXQmWRLBKNfKbpf8abcwLEeUzYr" />
                                            <div>
                                                <p class="text-sm font-bold leading-none">Jordan Smith</p>
                                                <p class="text-xs text-slate-500 mt-1">jordan.s@dev.org</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="px-6 py-5">
                                        <div class="flex items-center gap-2 group">
                                            <code
                                                class="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-700 dark:text-slate-300">sk-••••8823</code>
                                            <button
                                                class="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-primary">
                                                <span class="material-symbols-outlined text-base">content_copy</span>
                                            </button>
                                        </div>
                                    </td>
                                    <td class="px-6 py-5">
                                        <div class="flex flex-wrap gap-1">
                                            <span
                                                class="px-2 py-1 bg-primary/5 text-primary dark:text-slate-300 text-[10px] font-bold rounded uppercase tracking-wide">Read
                                                Points</span>
                                        </div>
                                    </td>
                                    <td class="px-6 py-5">
                                        <div class="flex justify-center">
                                            <span
                                                class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                                                <span class="size-1.5 rounded-full bg-emerald-500"></span>
                                                Active
                                            </span>
                                        </div>
                                    </td>
                                    <td class="px-6 py-5 text-right">
                                        <button
                                            class="text-primary dark:text-slate-300 text-sm font-bold hover:underline">Manage</button>
                                    </td>
                                </tr>
                                <!-- Row 3 -->
                                <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                    <td class="px-6 py-5">
                                        <div class="flex items-center gap-3">
                                            <img alt="Casey Avatar" class="size-10 rounded-full bg-orange-100"
                                                data-alt="Cartoon avatar of a user named Casey"
                                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBntHFwDRmAKLM-zLZevSwKBIT6bzZv3NPP7YJGQoah5e6fswq5NWlceWKXxKIxOxH07I4e8Jk-Bftn4759wUH08X-TRDiNL0GEC2S6I3n-9uZtTMms8z-KZ3hKnDN__n_uNp03An_zOuEv4K6bo2doKXvL5hGdguIIktlLPiP7Jbj9HJCYEjrqPY8jKnOGI4OobxobULZVQ_np8Ofry_LAHJuWjS_33X9p7IZ-5wVo65KKn3ei2HRgjVSbSShoWHSttrL2kTkURixP" />
                                            <div>
                                                <p class="text-sm font-bold leading-none">Casey Jones</p>
                                                <p class="text-xs text-slate-500 mt-1">casey.j@agency.com</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="px-6 py-5">
                                        <div class="flex items-center gap-2 group">
                                            <code
                                                class="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-700 dark:text-slate-300">sk-••••1102</code>
                                            <button
                                                class="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-primary">
                                                <span class="material-symbols-outlined text-base">content_copy</span>
                                            </button>
                                        </div>
                                    </td>
                                    <td class="px-6 py-5">
                                        <div class="flex flex-wrap gap-1">
                                            <span
                                                class="px-2 py-1 bg-primary/5 text-primary dark:text-slate-300 text-[10px] font-bold rounded uppercase tracking-wide">Issue
                                                Points</span>
                                        </div>
                                    </td>
                                    <td class="px-6 py-5">
                                        <div class="flex justify-center">
                                            <span
                                                class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold">
                                                <span class="size-1.5 rounded-full bg-slate-400"></span>
                                                Revoked
                                            </span>
                                        </div>
                                    </td>
                                    <td class="px-6 py-5 text-right">
                                        <button
                                            class="text-primary dark:text-slate-300 text-sm font-bold hover:underline">Manage</button>
                                    </td>
                                </tr>
                                <!-- Row 4 -->
                                <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                    <td class="px-6 py-5">
                                        <div class="flex items-center gap-3">
                                            <img alt="Sam Avatar" class="size-10 rounded-full bg-teal-100"
                                                data-alt="Cartoon avatar of a user named Sam"
                                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-F4NLuzzWBwPEerrElb7IvUbkupGnTlV_9LFfBo4x5tVNDrzvdvjd_ughWwNeoWmHt8EV3Kc-KPlnNmJ8VvBo0_g2QIfZMOOCL1ikVK6KrNOyMob83mYDZWLj0OiDGXWAxuSvPHHkvrBZkn4mCIUn7Av4tYqG5Nj4sVxrHpl9TTGmbjKZW98t6NwfpnRCmjCHzFwqTtIjGpqE-0EoKPMNw6ytYI50aKUfBDh7zTxXZGfdx70rJsYVQNxfEK06By0o30F9PSTD0tNL" />
                                            <div>
                                                <p class="text-sm font-bold leading-none">Sam Taylor</p>
                                                <p class="text-xs text-slate-500 mt-1">s.taylor@enterprise.net</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="px-6 py-5">
                                        <div class="flex items-center gap-2 group">
                                            <code
                                                class="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-700 dark:text-slate-300">sk-••••5590</code>
                                            <button
                                                class="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-primary">
                                                <span class="material-symbols-outlined text-base">content_copy</span>
                                            </button>
                                        </div>
                                    </td>
                                    <td class="px-6 py-5">
                                        <div class="flex flex-wrap gap-1">
                                            <span
                                                class="px-2 py-1 bg-primary/10 text-primary dark:text-slate-100 text-[10px] font-black rounded uppercase tracking-widest border border-primary/20">Admin
                                                Access</span>
                                        </div>
                                    </td>
                                    <td class="px-6 py-5">
                                        <div class="flex justify-center">
                                            <span
                                                class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                                                <span class="size-1.5 rounded-full bg-emerald-500"></span>
                                                Active
                                            </span>
                                        </div>
                                    </td>
                                    <td class="px-6 py-5 text-right">
                                        <button
                                            class="text-primary dark:text-slate-300 text-sm font-bold hover:underline">Manage</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <!-- Pagination -->
                        <div
                            class="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                            <span class="text-xs font-medium text-slate-500">Page 1 of 3</span>
                            <div class="flex gap-2">
                                <button
                                    class="p-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-400 cursor-not-allowed">
                                    <span class="material-symbols-outlined text-base">chevron_left</span>
                                </button>
                                <button
                                    class="p-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700">
                                    <span class="material-symbols-outlined text-base">chevron_right</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <!-- Usage Stats Section (Supplementary) -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                        <div
                            class="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
                            <p class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total API Calls
                            </p>
                            <div class="flex items-end justify-between">
                                <h3 class="text-2xl font-black">2.4M</h3>
                                <span class="text-emerald-500 text-xs font-bold flex items-center">+12% <span
                                        class="material-symbols-outlined text-xs">trending_up</span></span>
                            </div>
                        </div>
                        <div
                            class="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
                            <p class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Avg Response Time
                            </p>
                            <div class="flex items-end justify-between">
                                <h3 class="text-2xl font-black">142ms</h3>
                                <span class="text-emerald-500 text-xs font-bold flex items-center">-8% <span
                                        class="material-symbols-outlined text-xs">trending_down</span></span>
                            </div>
                        </div>
                        <div
                            class="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
                            <p class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Active Keys</p>
                            <div class="flex items-end justify-between">
                                <h3 class="text-2xl font-black">104</h3>
                                <span class="text-slate-400 text-xs font-bold">Stable</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    </div>
`;
  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen">
      <div dangerouslySetInnerHTML={{ __html: markup }} />
    </div>
  );
}
