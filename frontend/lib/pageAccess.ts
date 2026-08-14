"use client";

import { API_BASE } from "@/lib/apiBase";

const PAGE_ACCESS_CACHE_KEY = "page_access_cache_v1";

export type PageAccessEntry = {
  page_key: string;
  label: string;
  path: string;
  area: string;
  icon: string;
  locked: boolean;
  description: string;
  allowed: boolean;
};

export type PageAccessResponse = {
  user_id: number;
  role: string;
  pages: PageAccessEntry[];
};

export function readPageAccessCache(): PageAccessEntry[] | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(PAGE_ACCESS_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PageAccessEntry[];
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function publishPageAccessCache(pages: PageAccessEntry[]) {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(PAGE_ACCESS_CACHE_KEY, JSON.stringify(pages));
  } catch {
    // Ignore storage failures; the live event below still updates listeners.
  }

  window.dispatchEvent(
    new CustomEvent("pageaccesschange", { detail: pages }),
  );
}

export function clearPageAccessCache() {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.removeItem(PAGE_ACCESS_CACHE_KEY);
  } catch {
    // Ignore cleanup failures during logout.
  }
}

export async function fetchMyPages(token: string): Promise<PageAccessEntry[]> {
  const res = await fetch(`${API_BASE}/api/v3/pages/my-pages`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to load page access");

  const data = (await res.json()) as PageAccessResponse;
  return Array.isArray(data.pages) ? data.pages : [];
}

/**
 * Longest-prefix match, so /user/app-center/view/x resolves to the
 * App Center entry rather than the Dashboard root.
 */
export function matchPage(
  pages: PageAccessEntry[],
  pathname: string,
): PageAccessEntry | null {
  let best: PageAccessEntry | null = null;

  for (const page of pages) {
    const isMatch =
      pathname === page.path || pathname.startsWith(`${page.path}/`);
    if (isMatch && (!best || page.path.length > best.path.length)) {
      best = page;
    }
  }

  return best;
}

/**
 * Routes with no registry entry stay reachable — the registry lists what can
 * be revoked, not an allow-list of every valid URL.
 */
export function isPathAllowed(
  pages: PageAccessEntry[],
  pathname: string,
): boolean {
  const page = matchPage(pages, pathname);
  return page ? page.allowed : true;
}

/** Where to send someone bounced off a page they may not open. */
export function fallbackPathForArea(pathname: string) {
  return pathname.startsWith("/admin") ? "/admin" : "/user/dashboard";
}
