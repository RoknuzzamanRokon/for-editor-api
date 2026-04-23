"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";

export default function RouteHtmlState() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const isFullscreenAuthRoute = pathname === "/login" || pathname === "/register";
    const html = document.documentElement;
    const body = document.body;

    if (isFullscreenAuthRoute) {
      html.classList.add("login-fullscreen");
      html.style.overflow = "hidden";
      body.style.overflow = "hidden";
    } else {
      html.classList.remove("login-fullscreen");
      html.style.overflow = "";
      body.style.overflow = "";
    }

    return () => {
      html.classList.remove("login-fullscreen");
      html.style.overflow = "";
      body.style.overflow = "";
    };
  }, [pathname]);

  return null;
}
