"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import UserSidebar from "./UserSidebar";
import UserHeader from "./UserHeader";
import ExpiredDemoCard from "./ExpiredDemoCard";
import { API_BASE } from "@/lib/apiBase";

interface UserData {
  role?: string;
  demo_expires_at?: string | null;
  active_apis?: Array<{ action: string; label: string }>;
}

export default function UserShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("user_sidebar_collapsed") === "true";
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      try {
        const res = await fetch(`${API_BASE}/api/v2/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUserData(data);

          if (data.role === "demo_user" && data.demo_expires_at) {
            const expiryDate = new Date(data.demo_expires_at);
            const now = new Date();
            setIsExpired(expiryDate <= now);
          }
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove("login-fullscreen");
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
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

  if (isExpired) {
    return (
      <div className="min-h-screen bg-background-light text-foreground dark:bg-slate-950/55">
        <UserHeader onOpenMobileMenu={() => {}} />
        <div className="pt-16">
          <ExpiredDemoCard
            demoExpiresAt={userData?.demo_expires_at}
            activeApis={userData?.active_apis}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light text-foreground dark:bg-slate-950/55">
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
          <main className="min-w-0 flex-1 bg-background-light/80 dark:bg-slate-950/40">{children}</main>
          <footer className="border-t border-slate-200/70 bg-white/60 px-4 py-3 text-center text-[11px] font-medium text-slate-600 backdrop-blur sm:px-6 sm:py-4 sm:text-xs dark:border-slate-800/70 dark:bg-slate-900/50 dark:text-slate-300">
            Developed by Md.Rokunuzzaman.
          </footer>
        </div>
      </div>
    </div>
  );
}
