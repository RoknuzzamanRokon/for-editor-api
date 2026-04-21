"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import UserSidebar from "./UserSidebar";
import UserHeader from "./UserHeader";

export default function UserShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      document.body.style.overflow = "";
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  return (
    <div className="min-h-screen bg-background-light text-slate-900 dark:bg-background-dark dark:text-slate-100">
      {isMobileMenuOpen ? (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm lg:hidden"
        />
      ) : null}
      <UserSidebar
        collapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)}
        mobileOpen={isMobileMenuOpen}
        onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
      />
      <div
        className={`min-h-screen transition-[margin] duration-300 ${
          sidebarCollapsed ? "lg:ml-20" : "lg:ml-72"
        }`}
      >
        <UserHeader onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />
        <div className="flex min-h-screen flex-col pt-16">
          <main className="min-w-0 flex-1">{children}</main>
          <footer className="border-t border-slate-200/70 bg-white/60 px-4 py-3 text-center text-[11px] font-medium text-slate-600 backdrop-blur sm:px-6 sm:py-4 sm:text-xs dark:border-slate-800/70 dark:bg-slate-900/50 dark:text-slate-300">
            Developed by Md.Rokunuzzaman.
          </footer>
        </div>
      </div>
    </div>
  );
}
