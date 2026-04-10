'use client'

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ThemeSwitcher from "@/components/ui/ThemeSwitcher";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000";

export default function UserHeader() {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [user, setUser] = useState<{ full_name?: string; email?: string; role?: string } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    fetch(`${API_BASE}/api/v2/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setUser(data))
      .catch(err => console.error("Failed to fetch user:", err));
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_role");
    router.push("/");
  };

  return (
    <header className="fixed left-72 right-0 top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-8 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
      <div className="flex items-center gap-4">
        <span className="rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
          Admin Plan
        </span>
        <div className="h-4 w-px bg-slate-300 dark:bg-slate-700" />
        <div className="hidden items-center gap-2 text-sm text-slate-500 md:flex">
          <span className="material-symbols-outlined text-sm">cloud_done</span>
          <span>API Status: Healthy</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-red-500 dark:border-slate-900" />
        </button>
        <ThemeSwitcher />
        <div className="flex items-center gap-3 border-l border-slate-200 pl-4 dark:border-slate-800">
          <div className="text-right">
            <p className="text-sm font-bold leading-none">{user?.full_name || user?.email || "User"}</p>
            <p className="mt-1 text-[10px] font-medium uppercase text-slate-500">{user?.role || "Admin"}</p>
          </div>
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setShowMenu(prev => !prev)}
              className="h-10 w-10 overflow-hidden rounded-full border-2 border-slate-100 bg-slate-200 dark:border-slate-800 hover:ring-2 hover:ring-primary/30 transition-all"
            >
              <img
                alt="User Profile"
                className="h-full w-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBP8t9xa83PyPsCqbQ1lPQTqu_9nsY0kLpxsfIaeUdyFagI3hv8IftRqU1z5S2-uEx8Lh_3dxRQZq4iDENdIReJJK91AUFAwjcLGAMGu8a1AHbVzqVVEWbi0EuZSIl-o2qXnk9Gj-6HufCZfURzPpwRQMuHZQ7rxsGQjflgRLII-BKKicAhSu9FeDUtb6Wkxc_mxOsdvKEZd4nU03v_aCDESSsKx3Of1zM7nty7Bzr9jtsS0HpJTTB2pa2YrWIcQlTx3msnZErrfU8E"
              />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                  <p className="text-sm font-bold truncate">{user?.full_name || user?.email || "User"}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-1">{user?.role || "Admin"}</p>
                </div>
                <div className="p-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-sm font-medium"
                  >
                    <span className="material-symbols-outlined text-lg">logout</span>
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
