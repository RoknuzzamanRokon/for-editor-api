"use client";

import { useState } from "react";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background-light text-slate-900 dark:bg-background-dark dark:text-slate-100">
      <AdminSidebar
        collapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)}
      />
      <div
        className={`min-h-screen transition-[margin] duration-300 ${
          sidebarCollapsed ? "ml-20" : "ml-72"
        }`}
      >
        <AdminHeader />
        <main className="min-h-screen pt-16">{children}</main>
      </div>
    </div>
  );
}
