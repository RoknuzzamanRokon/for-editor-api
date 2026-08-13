"use client";

import { useEffect, useState } from "react";
import {
  fetchMyPages,
  matchPage,
  publishPageAccessCache,
  readPageAccessCache,
  type PageAccessEntry,
} from "@/lib/pageAccess";

/**
 * Page access for the signed-in user, kept in sync across sidebars via the
 * "pageaccesschange" event that RequirePageAccess also publishes to.
 *
 * Returns null until resolved so callers can render their full nav rather
 * than flashing an empty one.
 */
export function usePageAccess(): PageAccessEntry[] | null {
  // Starts null rather than seeding from sessionStorage in the initializer:
  // the server renders null, so reading storage during the first client
  // render would be a hydration mismatch. The cache is picked up below.
  const [pages, setPages] = useState<PageAccessEntry[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    const cached = readPageAccessCache();
    if (cached) setPages(cached);

    // Registered unconditionally so the sidebar still reacts to a sign-in
    // that publishes access after this hook mounted.
    const handleChange = (event: Event) => {
      const detail = (event as CustomEvent<PageAccessEntry[]>).detail;
      if (Array.isArray(detail)) setPages(detail);
    };
    window.addEventListener("pageaccesschange", handleChange);

    const token = window.localStorage.getItem("access_token");
    if (token) {
      void fetchMyPages(token)
        .then((next) => {
          if (cancelled) return;
          publishPageAccessCache(next);
          setPages(next);
        })
        .catch(() => {
          // Keep whatever the cache gave us; nav stays usable when offline.
        });
    }

    return () => {
      cancelled = true;
      window.removeEventListener("pageaccesschange", handleChange);
    };
  }, []);

  return pages;
}

/**
 * Filters nav items by page access. Items whose href has no registry entry
 * are always kept — the registry covers revocable pages, not every route.
 */
export function useVisibleNavItems<T extends { href: string }>(items: T[]): T[] {
  const pages = usePageAccess();

  if (!pages) return items;

  return items.filter((item) => {
    const page = matchPage(pages, item.href);
    return page ? page.allowed : true;
  });
}
