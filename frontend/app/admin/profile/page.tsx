"use client";

import { useEffect } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000";

export default function Page() {
  useEffect(() => {
    const menuButton = document.getElementById("user-menu-button");
    const menuDropdown = document.getElementById("user-menu-dropdown");
    const logoutButton = document.getElementById("logout-button");

    const toggleMenu = (e: Event) => {
      e.stopPropagation();
      menuDropdown?.classList.toggle("hidden");
    };
    const closeMenu = () => menuDropdown?.classList.add("hidden");
    const stopProp = (e: Event) => e.stopPropagation();
    const handleLogout = () => {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user_role");
      window.location.href = "/";
    };

    menuButton?.addEventListener("click", toggleMenu);
    menuDropdown?.addEventListener("click", stopProp);
    document.addEventListener("click", closeMenu);
    logoutButton?.addEventListener("click", handleLogout);

    const token = localStorage.getItem("access_token");
    if (token) {
      fetch(`${API_BASE}/api/v2/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          ["user-name", "profile-name", "profile-name-2", "detail-name"].forEach((id) => {
            const el = document.getElementById(id);
            if (el) el.textContent = data.full_name || data.email || "User";
          });
          ["user-email", "profile-email", "detail-email"].forEach((id) => {
            const el = document.getElementById(id);
            if (el) el.textContent = data.email || "";
          });
          ["user-role", "profile-role", "detail-role"].forEach((id) => {
            const el = document.getElementById(id);
            if (el) el.textContent = data.role || "Admin";
          });
        })
        .catch((err) => console.error("Failed to fetch user:", err));
    }

    return () => {
      menuButton?.removeEventListener("click", toggleMenu);
      menuDropdown?.removeEventListener("click", stopProp);
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
      <a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-primary/10 transition-colors" href="/admin/history/transactions">
        <span class="material-symbols-outlined">history</span>
        <span class="text-sm font-medium">History</span>
      </a>
      <a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-primary/10 transition-colors" href="/admin/api-permissions">
        <span class="material-symbols-outlined">key</span>
        <span class="text-sm font-medium">API Permissions</span>
      </a>
      <a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-primary/10 transition-colors" href="/admin/ip-whitelist">
        <span class="material-symbols-outlined">shield_person</span>
        <span class="text-sm font-medium">IP Whitelisting</span>
      </a>
      <a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-primary/10 transition-colors" href="/admin/users">
        <span class="material-symbols-outlined">group</span>
        <span class="text-sm font-medium">Users</span>
      </a>
      <a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-primary/10 transition-colors" href="/admin/settings">
        <span class="material-symbols-outlined">settings</span>
        <span class="text-sm font-medium">Settings</span>
      </a>
    </nav>
    <div class="p-4 border-t border-primary/10 space-y-1">
      <a href="/admin/profile" class="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary text-white">
        <span class="material-symbols-outlined">manage_accounts</span>
        <span class="text-sm font-medium">Profile</span>
      </a>
      <a href="/admin/profile" class="flex items-center gap-3 p-2 rounded-lg bg-primary/10 cursor-pointer">
        <div class="size-9 rounded-full bg-primary/20 flex items-center justify-center text-primary">
          <span class="material-symbols-outlined">person</span>
        </div>
        <div class="flex-1 truncate">
          <p id="profile-name" class="text-xs font-bold truncate">Loading...</p>
          <p id="profile-role" class="text-[10px] text-slate-500 font-medium uppercase tracking-wider"></p>
        </div>
      </a>
    </div>
  </aside>

  <!-- Main Content -->
  <main class="flex-1 flex flex-col overflow-y-auto">
    <!-- Header -->
    <header class="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-8 shrink-0">
      <div class="flex-1 max-w-2xl">
        <div class="relative">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input class="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm placeholder:text-slate-400" placeholder="Search transactions, users or API keys..." type="text" />
        </div>
      </div>
      <div class="flex items-center gap-6">
        <div class="relative">
          <button class="text-slate-400 hover:text-primary transition-colors">
            <span class="material-symbols-outlined">notifications</span>
          </button>
          <span class="absolute top-0 right-0 size-2 bg-primary rounded-full border-2 border-white dark:border-slate-900"></span>
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

    <!-- Page Content -->
    <div class="p-8 space-y-6">
      <div>
        <h2 class="text-2xl font-bold">My Profile</h2>
        <p class="text-sm text-slate-500 mt-1">Manage your account information.</p>
      </div>

      <!-- Profile Card -->
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-primary/10 shadow-sm p-6 flex items-center gap-6">
        <div class="size-20 rounded-full bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
          <span class="material-symbols-outlined text-4xl">person</span>
        </div>
        <div>
          <p id="profile-name-2" class="text-xl font-bold">Loading...</p>
          <p id="profile-email" class="text-sm text-slate-500 mt-1"></p>
          <span id="profile-role" class="mt-2 inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wider"></span>
        </div>
      </div>

      <!-- Info Fields -->
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-primary/10 shadow-sm p-6 space-y-4">
        <h3 class="font-bold text-slate-700 dark:text-slate-300">Account Details</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-xs font-bold uppercase text-slate-500">Full Name</label>
            <p id="detail-name" class="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 rounded-lg px-4 py-2.5">—</p>
          </div>
          <div>
            <label class="text-xs font-bold uppercase text-slate-500">Email</label>
            <p id="detail-email" class="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 rounded-lg px-4 py-2.5">—</p>
          </div>
          <div>
            <label class="text-xs font-bold uppercase text-slate-500">Role</label>
            <p id="detail-role" class="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 rounded-lg px-4 py-2.5">—</p>
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
