"use client";

import { useState } from "react";
import AdminHeader from './AdminHeader'
import AdminSidebar from './AdminSidebar'

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen overflow-hidden bg-[#f6f7f7] text-slate-900 dark:bg-[#16181c] dark:text-slate-100">
      <AdminSidebar collapsed={sidebarCollapsed} />
      <div className="flex min-h-screen flex-1 flex-col overflow-hidden">
        <AdminHeader
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)}
        />
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
