"use client";

import { useState } from "react";
import UserSidebar from "./UserSidebar";
import UserHeader from "./UserHeader";

export default function UserShell({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background-light text-slate-900 dark:bg-background-dark dark:text-slate-100">
      <UserSidebar collapsed={sidebarCollapsed} />
      <div
        className={`min-h-screen transition-[margin] duration-300 ${
          sidebarCollapsed ? "ml-0" : "ml-72"
        }`}
      >
        <UserHeader
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)}
        />
        <main className="min-h-screen pt-16">{children}</main>
      </div>
    </div>
  )
}
