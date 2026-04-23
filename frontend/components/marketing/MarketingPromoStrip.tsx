"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useMarketingTheme } from "@/config/marketingTheme";

type PromoItem = {
  id: string;
  badge: string;
  message: string;
  href: string;
  cta: string;
};

const promoItems: PromoItem[] = [
  {
    id: "launch-offer",
    badge: "Current Offer",
    message: "Launch week pricing unlocks 20% off Admin access for new teams.",
    href: "/pricing",
    cta: "Claim Offer",
  },
  {
    id: "free-trial",
    badge: "Free Trial",
    message:
      "Test document conversions free before you move production traffic.",
    href: "/register",
    cta: "Start Free",
  },
  {
    id: "docs-boost",
    badge: "New",
    message:
      "Explore the latest API docs, permissions, and deploy workflow guides.",
    href: "/docs",
    cta: "View Docs",
  },
];

const ROTATION_MS = 7000;

type BadgeThemeStyle = {
  background: string;
  color: string;
  borderColor: string;
  boxShadow: string;
};

function getBadgeStyle(badge: string, theme: any): BadgeThemeStyle {
  switch (badge) {
    case "Current Offer":
      return {
        background:
          "linear-gradient(135deg, rgba(34,197,94,0.18), rgba(34,197,94,0.1))",
        color: "#22c55e",
        borderColor: "rgba(34,197,94,0.32)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.16), 0 0 0 1px rgba(34,197,94,0.08)",
      };

    case "Free Trial":
      return {
        background:
          "linear-gradient(135deg, rgba(59,130,246,0.18), rgba(59,130,246,0.1))",
        color: "#3b82f6",
        borderColor: "rgba(59,130,246,0.3)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.16), 0 0 0 1px rgba(59,130,246,0.08)",
      };

    case "New":
      return {
        background:
          "linear-gradient(135deg, rgba(168,85,247,0.18), rgba(168,85,247,0.1))",
        color: "#a855f7",
        borderColor: "rgba(168,85,247,0.32)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.16), 0 0 0 1px rgba(168,85,247,0.08)",
      };

    default:
      return {
        background: `linear-gradient(135deg, ${theme.primary}22, ${theme.primary}12)`,
        color: theme.primary,
        borderColor: `${theme.primary}40`,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.12), 0 0 0 1px ${theme.primary}14`,
      };
  }
}

export default function MarketingPromoStrip() {
  const { theme } = useMarketingTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % promoItems.length);
    }, ROTATION_MS);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsHidden(window.scrollY > 24);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const item = promoItems[activeIndex];
  const badgeStyle = getBadgeStyle(item.badge, theme);

  return (
    <div
      aria-hidden={isHidden}
      className={`relative overflow-hidden transition-all duration-300 ease-out ${
        isHidden ? "max-h-0 opacity-0" : "max-h-10 opacity-100"
      }`}
      style={{
        background: `linear-gradient(90deg, ${theme.bgSecondary} 0%, ${theme.surface} 52%, ${theme.bgSecondary} 100%)`,
        borderTop: isHidden ? "1px solid transparent" : `1px solid ${theme.divider}`,
        borderBottom: isHidden ? "1px solid transparent" : `1px solid ${theme.divider}`,
        boxShadow: isHidden
          ? "none"
          : `inset 0 1px 0 ${theme.divider}, 0 10px 24px rgba(2,6,23,0.2)`,
      }}
    >
      <div className="mx-auto flex h-10 max-w-[1440px] items-center px-3 sm:px-10 lg:px-8">
        <div className="relative h-full w-full overflow-hidden">
          <Link
            key={item.id}
            href={item.href}
            className="promo-strip-item promo-strip-item-enter absolute inset-0 flex items-center justify-between gap-3"
            style={{ color: theme.text }}
          >
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="hidden rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.18em] sm:inline-flex"
                style={{
                  background: badgeStyle.background,
                  color: badgeStyle.color,
                  borderColor: badgeStyle.borderColor,
                  boxShadow: badgeStyle.boxShadow,
                }}
              >
                {item.badge}
              </span>

              <span
                className="block min-w-0 truncate text-[11px] font-semibold leading-none sm:text-xs"
                style={{ color: theme.text }}
              >
                {item.message}
              </span>
            </div>

            <span
              className="shrink-0 text-[10px] font-black uppercase tracking-[0.16em] sm:text-[11px]"
              style={{ color: theme.primary }}
            >
              {item.cta}
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
