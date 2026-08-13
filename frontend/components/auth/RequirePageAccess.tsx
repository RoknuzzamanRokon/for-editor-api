"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  fallbackPathForArea,
  fetchMyPages,
  isPathAllowed,
  publishPageAccessCache,
  readPageAccessCache,
} from "@/lib/pageAccess";

/**
 * Per-page gate that sits inside RequireRole: the role check decides which
 * workspace you belong to, this decides which pages within it an admin has
 * left open to you.
 *
 * Like RequireRole this is client-side. It keeps navigation honest; the APIs
 * behind each page remain guarded by their own role checks server-side.
 */
export default function RequirePageAccess({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const currentPath = pathname || "/";

    const evaluate = (pages: ReturnType<typeof readPageAccessCache>) => {
      if (cancelled || !pages) return true;

      const allowed = isPathAllowed(pages, currentPath);
      if (allowed) {
        // Must clear on every allowed path: after a redirect this effect
        // re-runs for the fallback route, and a stale `blocked` would leave
        // the user stranded on "Redirecting..." forever.
        setBlocked(false);
      } else {
        setBlocked(true);
        router.replace(fallbackPathForArea(currentPath));
      }
      return allowed;
    };

    // Decide from cache first so an allowed page renders without a flash,
    // then revalidate against the server.
    const cached = readPageAccessCache();
    if (cached && !evaluate(cached)) return;

    const token = window.localStorage.getItem("access_token");
    if (!token) return;

    void fetchMyPages(token)
      .then((pages) => {
        if (cancelled) return;
        publishPageAccessCache(pages);
        evaluate(pages);
      })
      .catch(() => {
        // Network/auth failures fall through to RequireRole's own handling
        // rather than locking the user out of a page they may well own.
      });

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (blocked) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-foreground/60">
        Redirecting...
      </div>
    );
  }

  return <>{children}</>;
}
