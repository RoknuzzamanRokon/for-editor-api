"use client";

import { useEffect, useState } from "react";
import UserSidebar from "./UserSidebar";
import UserHeader from "./UserHeader";

export default function UserShell({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const savedValue = window.localStorage.getItem("user_sidebar_collapsed");
    if (savedValue === "true") {
      setSidebarCollapsed(true);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      "user_sidebar_collapsed",
      String(sidebarCollapsed),
    );
  }, [sidebarCollapsed]);

  return (
    <div className="min-h-screen bg-background-light text-slate-900 dark:bg-background-dark dark:text-slate-100">
      <UserSidebar
        collapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)}
      />
      <div
        className={`min-h-screen transition-[margin] duration-300 ${
          sidebarCollapsed ? "ml-20" : "ml-72"
        }`}
      >
        <UserHeader />
        <div className="flex min-h-screen flex-col pt-16">
          <main className="flex-1">{children}</main>
          <footer className="border-t border-slate-200/70 bg-white/60 px-6 py-4 text-center text-xs font-medium text-slate-600 backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/50 dark:text-slate-300">
            Developed by Md.Rokunuzzaman.
          </footer>
        </div>
      </div>
    </div>
  );
}
