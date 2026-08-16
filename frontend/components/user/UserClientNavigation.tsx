"use client";

import { startTransition, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

const PREFETCH_PATHS = ["dashboard", "points", "profile", "app-center", "billing", "settings"];

export default function UserClientNavigation({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const basePath = pathname?.startsWith("/demo-user") ? "/demo-user" : "/user";

  useEffect(() => {
    PREFETCH_PATHS.forEach((path) => {
      router.prefetch(`${basePath}/${path}`);
    });

    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented) {
        return;
      }

      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest("a");
      if (!(anchor instanceof HTMLAnchorElement)) {
        return;
      }

      if (anchor.target && anchor.target !== "_self") {
        return;
      }

      if (anchor.hasAttribute("download")) {
        return;
      }

      const href = anchor.getAttribute("href");
      if (!href || !href.startsWith("/")) {
        return;
      }

      if (href === window.location.pathname) {
        return;
      }

      event.preventDefault();
      startTransition(() => {
        router.push(href);
      });
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [router, basePath]);

  return <>{children}</>;
}
