"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useMarketingTheme } from "@/config/marketingTheme";

const navLinks = [
  ["/", "Home"],
  ["/features", "Features"],
  ["/pricing", "Pricing"],
  ["/docs", "Documentation"],
  ["/user/dashboard", "Dashboard"],
] as const;

export default function MarketingHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme } = useMarketingTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const isActive = (path: string) => pathname === path;

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    navLinks.forEach(([href]) => {
      router.prefetch(href);
    });
    router.prefetch("/login");
  }, [router]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 w-full">
      <div className="px-4 pt-3 sm:px-6 sm:pt-4 lg:px-8 lg:pt-5">
        <div
          className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 rounded-full px-4 backdrop-blur-xl transition-[box-shadow] duration-300 sm:h-16 sm:px-5 lg:px-6"
          style={{
            border: `1px solid ${theme.border}`,
            boxShadow: isScrolled
              ? "0 10px 30px rgba(2,6,23,0.4)"
              : "0 6px 20px rgba(2,6,23,0.28)",
          }}
        >
          <Link
            href="/"
            className="group flex min-w-0 items-center gap-2 cursor-pointer"
          >
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-transform group-hover:scale-110 sm:h-9 sm:w-9"
              style={{ background: theme.primary, color: theme.buttonText }}
            >
              <span className="material-symbols-outlined text-lg sm:text-xl">
                sync_alt
              </span>
            </div>
            <span
              className="truncate text-sm font-black tracking-tight sm:text-base lg:text-lg"
              style={{ color: theme.heading }}
            >
              ConvaterPro<span style={{ color: theme.primary }}>API</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            {navLinks.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                prefetch
                className="group relative py-1.5 text-sm font-semibold tracking-tight transition-colors"
                style={{ color: isActive(href) ? theme.primary : theme.text }}
                onMouseEnter={() => router.prefetch(href)}
              >
                {label}
                <span
                  className="absolute inset-x-0 -bottom-1 h-0.5 origin-left scale-x-0 rounded-full transition-transform duration-300 group-hover:scale-x-100"
                  style={{
                    background: theme.primary,
                    transform: isActive(href) ? "scaleX(1)" : undefined,
                  }}
                />
              </Link>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              prefetch
              className="rounded-full px-3.5 py-1.5 text-xs font-bold shadow-lg transition-all duration-200 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] sm:px-4 sm:py-2 sm:text-sm"
              style={{
                background: theme.buttonBg,
                color: theme.buttonText,
                boxShadow: theme.actionShadow,
              }}
              onMouseEnter={() => router.prefetch("/login")}
            >
              Login
            </Link>

            <button
              type="button"
              aria-label={
                isMobileMenuOpen
                  ? "Close navigation menu"
                  : "Open navigation menu"
              }
              aria-expanded={isMobileMenuOpen}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all lg:hidden"
              style={{
                background: theme.surface,
                borderColor: theme.border,
                color: theme.heading,
                boxShadow: theme.softCardShadow,
              }}
              onClick={() => setIsMobileMenuOpen((current) => !current)}
            >
              <span className="material-symbols-outlined text-xl">
                {isMobileMenuOpen ? "close" : "menu"}
              </span>
            </button>
          </div>
        </div>

        {isMobileMenuOpen ? (
          <div
            className="mx-auto mt-2 w-full max-w-6xl rounded-3xl px-3 py-3 backdrop-blur-xl sm:px-4 lg:hidden"
            style={{
              border: `1px solid ${theme.border}`,
              boxShadow: isScrolled
                ? "0 10px 30px rgba(2,6,23,0.4)"
                : "0 6px 20px rgba(2,6,23,0.28)",
            }}
          >
            <nav className="grid gap-2">
              {navLinks.map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  prefetch
                  className="rounded-2xl border px-4 py-2.5 text-sm font-semibold transition-colors"
                  style={
                    isActive(href)
                      ? {
                          background: `${theme.primary}16`,
                          color: theme.primary,
                          borderColor: `${theme.primary}44`,
                        }
                      : {
                          background: theme.surface,
                          color: theme.text,
                          borderColor: theme.border,
                        }
                  }
                  onMouseEnter={() => router.prefetch(href)}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        ) : null}
      </div>
    </header>
  );
}
