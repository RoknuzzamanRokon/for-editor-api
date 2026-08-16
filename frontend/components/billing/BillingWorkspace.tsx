"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { API_BASE } from "@/lib/apiBase";
import { formatRoleLabel } from "@/lib/roleLabel";
// Mirrors MAX_PENDING_TOPUP_REQUESTS_PER_USER in backend/api/v3/endpoints/points.py —
// the server is the source of truth, this only lets the UI pre-empt the 400.
const MAX_PENDING_TOPUP_REQUESTS = 2;
const POINT_ACTIVITY_CHART_WIDTH = 1920;
const POINT_ACTIVITY_CHART_HEIGHT = 240;
const POINT_ACTIVITY_CHART_PADDING = { top: 16, right: 18, bottom: 34, left: 18 };

// Tailwind can't apply opacity modifiers to the var()-based theme colors, so
// `bg-primary/10`, `via-primary/50` and `text-foreground/60` all compile to no
// CSS at all. color-mix expresses the same intent and stays theme-reactive.
const PRIMARY_TINT = "bg-[color-mix(in_srgb,var(--primary)_12%,transparent)]";
const ACCENT_RAIL_STOPS =
  "bg-gradient-to-b from-transparent via-[color-mix(in_srgb,var(--primary)_50%,transparent)] to-transparent";
const FOCUS_RING =
  "focus:border-primary focus:ring-2 focus:ring-[color-mix(in_srgb,var(--primary)_35%,transparent)]";
// Fixed neutral muted tone — the theme's own foreground can't take an opacity
// modifier, and these sit on neutral surfaces anyway.
const MUTED_FG = "text-slate-500 dark:text-slate-400";

// --- Modal-only tones -------------------------------------------------------
// The dialog sits on `bg-card`, whose lightness varies enormously per theme:
// near-black in crimson/burgundy, white in paper, but MID-TONE in ocean
// (#075985), sunset (#7c2d12) and forest (#14532d). Fixed slate text scores
// 2.95 / 3.65 / 3.55 against those three — below the 4.5 WCAG floor, which is
// exactly why only those themes looked wrong. Deriving from --foreground
// instead tracks whatever card the theme supplies; 80% is the lowest step that
// clears 4.5 on all six (worst case ocean, 4.83).
const MODAL_MUTED = "text-[color-mix(in_srgb,var(--foreground)_80%,transparent)]";
// Inner panels lift off the card using the theme's own second surface.
const MODAL_PANEL = "border border-border bg-card-hover";

type PointHistoryEntry = {
  id: number;
  action: string;
  amount: number;
  status: string;
  request_id: string;
  created_at: string;
};

type MyPointResponse = {
  user_id: number;
  available_points: number;
  point_status: string;
  expires_at: string | null;
  expiry_status: string;
  history: PointHistoryEntry[];
  total: number;
  limit: number;
  offset: number;
};

type PointActivitySummaryDay = {
  date: string;
  topup: number;
  refunded: number;
  spent: number;
  net: number;
};

type PointActivitySummaryResponse = {
  days: number;
  items: PointActivitySummaryDay[];
};

type TopupRequestEntry = {
  id: number;
  user_id: number;
  requested_admin_user_id: number;
  amount: number;
  package_key: string;
  price_cents: number;
  grants_admin_access: boolean;
  note: string | null;
  status: string;
  created_by_user_id: number;
  resolved_by_user_id: number | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
};

type TopupRequestList = {
  items: TopupRequestEntry[];
  total: number;
  limit: number;
  offset: number;
};

type TopupPackage = {
  key: string;
  label: string;
  price_cents: number;
  points: number;
  grants_admin_access: boolean;
  description: string;
};

type TopupTarget = {
  id: number;
  email: string;
  username: string | null;
  role: string;
  routing: string;
};

type TopupPackagesResponse = {
  min_price_cents: number;
  min_points: number;
  packages: TopupPackage[];
  target: TopupTarget;
};

type MeResponse = {
  id: number;
  email: string;
  username: string | null;
  role: "super_user" | "admin_user" | "general_user" | "demo_user";
  is_active: boolean;
  created_at: string;
  last_login: string | null;
  created_by: {
    id: number;
    email: string;
    username: string | null;
    role: "super_user" | "admin_user" | "general_user" | "demo_user";
  } | null;
};

type PointActivityChartItem = {
  date: string;
  label: string;
  spent: number;
};

function formatDate(value?: string | null) {
  if (!value) return "Not configured";
  return new Date(value).toLocaleString();
}

function getStatusClass(status: string) {
  const normalized = status.toLowerCase();
  if (normalized.includes("success") || normalized.includes("active") || normalized.includes("available") || normalized.includes("approved")) {
    return "border-emerald-200/70 bg-emerald-50/80 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300";
  }
  if (normalized.includes("pending")) {
    return "border-amber-200/70 bg-amber-50/80 text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300";
  }
  if (normalized.includes("expired") || normalized.includes("failed") || normalized.includes("inactive") || normalized.includes("rejected")) {
    return "border-rose-200/70 bg-rose-50/80 text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300";
  }
  return "border-slate-200/70 bg-slate-50/80 text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300";
}

/** Pairs each status tone with an icon, so state is never carried by color alone. */
function getStatusIcon(status: string) {
  const normalized = status.toLowerCase();
  if (
    normalized.includes("success") ||
    normalized.includes("active") ||
    normalized.includes("available") ||
    normalized.includes("approved")
  ) {
    return "check_circle";
  }
  if (normalized.includes("pending")) return "schedule";
  if (
    normalized.includes("expired") ||
    normalized.includes("failed") ||
    normalized.includes("inactive") ||
    normalized.includes("rejected")
  ) {
    return "cancel";
  }
  return "info";
}

/** "Aug 12, 10:04 AM" — the requests table lives in a half-width column, where a
 *  full toLocaleString() overflows and gets clipped. */
function formatShortDateTime(value?: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

/** Integer cents -> "$30" / "$4.99". Money never becomes a float on the way in. */
function formatUsd(cents: number) {
  const dollars = cents / 100;
  return `$${Number.isInteger(dollars) ? dollars : dollars.toFixed(2)}`;
}

function formatCompactDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

function MetricCard({
  label,
  value,
  icon,
  caption,
}: {
  label: string;
  value: string | number;
  icon: string;
  caption: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-[13px] border border-border bg-white/30 p-6 backdrop-blur-2xl [box-shadow:4px_4px_0px_0px_var(--border)] dark:bg-white/[0.03]">
      <div className={`absolute inset-y-6 left-6 w-px ${ACCENT_RAIL_STOPS}`} />
      <div className={`mb-4 inline-flex rounded-xl p-2 text-primary ${PRIMARY_TINT}`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-3xl font-black tracking-tight text-slate-900 dark:text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{caption}</p>
    </div>
  );
}

export default function BillingWorkspace({ audience }: { audience: "dashboard" | "admin" }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isMobileChart, setIsMobileChart] = useState(false);
  const [me, setMe] = useState<MeResponse | null>(null);
  const [points, setPoints] = useState<MyPointResponse | null>(null);
  const [activitySummary, setActivitySummary] = useState<PointActivitySummaryResponse | null>(null);
  const [requests, setRequests] = useState<TopupRequestList | null>(null);
  const [requestLoading, setRequestLoading] = useState(false);
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [cancelRequestId, setCancelRequestId] = useState<number | null>(null);
  const [requestError, setRequestError] = useState("");
  const [requestSuccess, setRequestSuccess] = useState("");
  const [form, setForm] = useState({ note: "" });
  const [catalog, setCatalog] = useState<TopupPackagesResponse | null>(null);
  const [selectedPackage, setSelectedPackage] = useState("small");
  // Custom tier only: dollars as typed, converted to integer cents on submit.
  const [customDollars, setCustomDollars] = useState("5");
  // The modal portals into document.body, which only exists after mount.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const closeTopupModal = useCallback(() => {
    setShowTopupModal(false);
    setRequestError("");
    setRequestSuccess("");
  }, []);

  useEffect(() => {
    if (!showTopupModal) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeTopupModal();
    };

    // Lock the page behind the overlay so scrolling doesn't run underneath it.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [showTopupModal, closeTopupModal]);

  const refreshPageData = useCallback(async () => {
    const auth = localStorage.getItem("access_token") ?? "";
    const [meRes, pointsRes, activitySummaryRes, requestsRes, packagesRes] = await Promise.all([
      fetch(`${API_BASE}/api/v2/auth/me`, {
        method: "GET",
        headers: { Authorization: `Bearer ${auth}` },
      }),
      fetch(`${API_BASE}/api/v3/points/my-point`, {
        method: "GET",
        headers: { Authorization: `Bearer ${auth}` },
      }),
      fetch(`${API_BASE}/api/v3/points/activity-summary?days=30`, {
        method: "GET",
        headers: { Authorization: `Bearer ${auth}` },
      }),
      fetch(`${API_BASE}/api/v3/points/topup-requests/mine`, {
        method: "GET",
        headers: { Authorization: `Bearer ${auth}` },
      }),
      fetch(`${API_BASE}/api/v3/points/topup-packages`, {
        method: "GET",
        headers: { Authorization: `Bearer ${auth}` },
      }),
    ]);

    const meBody = await meRes.text();
    if (!meRes.ok) {
      throw new Error(meBody || "Failed to load profile");
    }
    setMe(JSON.parse(meBody) as MeResponse);

    const pointsBody = await pointsRes.text();
    if (!pointsRes.ok) {
      throw new Error(pointsBody || "Failed to load billing data");
    }
    setPoints(JSON.parse(pointsBody) as MyPointResponse);

    const summaryBody = await activitySummaryRes.text();
    if (!activitySummaryRes.ok) {
      throw new Error(summaryBody || "Failed to load point activity summary");
    }
    setActivitySummary(JSON.parse(summaryBody) as PointActivitySummaryResponse);

    if (requestsRes.ok) {
      setRequests(await requestsRes.json() as TopupRequestList);
    }

    if (packagesRes.ok) {
      setCatalog(await packagesRes.json() as TopupPackagesResponse);
    }
  }, []);

  useEffect(() => {
    const auth = localStorage.getItem("access_token") ?? "";
    if (!auth) {
      setError("No access token found");
      setLoading(false);
      return;
    }

    refreshPageData()
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load billing data");
      })
      .finally(() => setLoading(false));
  }, [refreshPageData]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const syncViewport = () => setIsMobileChart(mediaQuery.matches);

    syncViewport();
    mediaQuery.addEventListener("change", syncViewport);

    return () => {
      mediaQuery.removeEventListener("change", syncViewport);
    };
  }, []);

  const pendingRequests = useMemo(
    () => requests?.items.filter((entry) => entry.status === "pending").length ?? 0,
    [requests],
  );
  const pendingLimitReached = pendingRequests >= MAX_PENDING_TOPUP_REQUESTS;

  // Routing is resolved server-side from who created the account, so this copy
  // explains where the request lands rather than asking for an admin ID.
  const requestHint = useMemo(() => {
    if (!catalog) return "Pick a package and submit your request for approval.";
    return catalog.target.routing === "creator"
      ? "Your request goes to the administrator who created your account."
      : "Your account is self-registered, so your request goes to a super admin.";
  }, [catalog]);

  const profilePill = useMemo(() => {
    if (!me || !points) return "Loading profile";
    return `${formatRoleLabel(me.role)} • User #${points.user_id}`;
  }, [me, points]);
  const pointActivityChart = useMemo(() => {
    if (!activitySummary) return [];
    const visibleItems = isMobileChart
      ? activitySummary.items.slice(-7)
      : activitySummary.items;

    return visibleItems.map((item) => ({
      date: item.date,
      label: formatCompactDate(item.date),
      spent: item.spent,
    }));
  }, [activitySummary, isMobileChart]);
  const pointActivityLabelIndexes = useMemo(() => {
    if (pointActivityChart.length === 0) return new Set<number>();
    return new Set(pointActivityChart.map((_, index) => index));
  }, [pointActivityChart]);
  const pointActivityDays = isMobileChart ? 7 : 30;

  const activePackage = useMemo(
    () => catalog?.packages.find((item) => item.key === selectedPackage) ?? null,
    [catalog, selectedPackage],
  );

  /** What the selected tier actually costs and yields. For the custom tier this
   *  previews the server's own base rate; the server still recomputes on submit,
   *  so this is display-only and can never set the real price. */
  const quote = useMemo(() => {
    if (!catalog || !activePackage) return null;
    if (activePackage.key !== "custom") {
      return {
        cents: activePackage.price_cents,
        points: activePackage.points,
        grantsAdmin: activePackage.grants_admin_access,
      };
    }
    const cents = Math.round((Number(customDollars) || 0) * 100);
    return {
      cents,
      points: Math.floor((cents * catalog.min_points) / catalog.min_price_cents),
      grantsAdmin: false,
    };
  }, [catalog, activePackage, customDollars]);

  const belowMinimum = Boolean(
    catalog && quote && quote.cents < catalog.min_price_cents,
  );

  const handleCreateRequest = async () => {
    setRequestError("");
    setRequestSuccess("");
    if (!points || !quote) return;
    if (belowMinimum) {
      setRequestError(
        `Minimum top-up is ${formatUsd(catalog!.min_price_cents)} (${catalog!.min_points} points).`,
      );
      return;
    }

    setRequestLoading(true);
    try {
      const auth = localStorage.getItem("access_token") ?? "";
      const res = await fetch(`${API_BASE}/api/v3/points/topup-requests`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${auth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: points.user_id,
          package_key: selectedPackage,
          // Only meaningful for the custom tier; the server ignores it otherwise.
          price_cents: selectedPackage === "custom" ? quote.cents : undefined,
          note: form.note || undefined,
        }),
      });
      const body = await res.text();
      if (!res.ok) {
        let detail = body;
        try {
          detail = (JSON.parse(body) as { detail?: string }).detail ?? body;
        } catch {
          // Non-JSON error body — surface it verbatim.
        }
        throw new Error(detail || "Failed to create topup request");
      }
      setRequestSuccess("Topup request submitted successfully.");
      setForm({ note: "" });
      await refreshPageData();
    } catch (err) {
      setRequestError(err instanceof Error ? err.message : "Failed to create topup request");
    } finally {
      setRequestLoading(false);
    }
  };

  const handleCancelRequest = async (requestId: number) => {
    setRequestError("");
    setRequestSuccess("");
    setCancelRequestId(requestId);

    try {
      const auth = localStorage.getItem("access_token") ?? "";
      const res = await fetch(`${API_BASE}/api/v3/points/topup-cancel/request/${requestId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${auth}`,
        },
      });
      const body = await res.text();
      if (!res.ok) {
        throw new Error(body || "Failed to cancel topup request");
      }

      setRequestSuccess("Topup request cancelled successfully.");
      await refreshPageData();
    } catch (err) {
      setRequestError(err instanceof Error ? err.message : "Failed to cancel topup request");
    } finally {
      setCancelRequestId(null);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-8xl p-6 md:p-8">
        <div className="space-y-6">
          <div className="app-hero-card rounded-[13px] border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-primary p-6 shadow-xl dark:border-slate-800">
            <div className="h-5 w-40 animate-pulse rounded bg-white/20" />
            <div className="mt-4 h-10 w-80 max-w-full animate-pulse rounded bg-white/20" />
            <div className="mt-3 h-4 w-full max-w-2xl animate-pulse rounded bg-white/15" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="relative overflow-hidden rounded-[13px] border border-border bg-white/30 p-6 backdrop-blur-2xl [box-shadow:4px_4px_0px_0px_var(--border)] dark:bg-white/[0.03]">
                <div className="h-12 w-12 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
                <div className="mt-4 h-4 w-28 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                <div className="mt-3 h-8 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              </div>
            ))}
          </div>
          <div className="grid gap-6 xl:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="relative overflow-hidden rounded-[13px] border border-border bg-white/30 p-6 backdrop-blur-2xl [box-shadow:4px_4px_0px_0px_var(--border)] dark:bg-white/[0.03]">
                <div className="h-5 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                <div className="mt-3 h-4 w-52 animate-pulse rounded bg-slate-100 dark:bg-slate-800/70" />
                <div className="mt-6 h-56 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800/70" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !points || !me) {
    return (
      <div className="mx-auto max-w-8xl p-6 md:p-8">
        <div className="rounded-[13px] border border-rose-200/70 bg-rose-50/80 p-6 text-sm text-rose-700 backdrop-blur-2xl dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300">
          {error || "Billing data not available"}
        </div>
      </div>
    );
  }

  const maxSpentPointAmount = Math.max(...pointActivityChart.map((item) => item.spent), 1);
  const pointActivityUsableWidth =
    POINT_ACTIVITY_CHART_WIDTH - POINT_ACTIVITY_CHART_PADDING.left - POINT_ACTIVITY_CHART_PADDING.right;
  const pointActivityUsableHeight =
    POINT_ACTIVITY_CHART_HEIGHT - POINT_ACTIVITY_CHART_PADDING.top - POINT_ACTIVITY_CHART_PADDING.bottom;
  const pointActivityBars = pointActivityChart.map((item, index) => {
    const totalBars = Math.max(pointActivityChart.length, 1);
    const slotWidth = pointActivityUsableWidth / totalBars;
    const barWidth = Math.max(Math.min(slotWidth * 0.8, 26), 10);
    const x =
      POINT_ACTIVITY_CHART_PADDING.left + slotWidth * index + (slotWidth - barWidth) / 2;
    const height =
      item.spent > 0 ? Math.max((item.spent / maxSpentPointAmount) * pointActivityUsableHeight, 6) : 0;
    const y = POINT_ACTIVITY_CHART_HEIGHT - POINT_ACTIVITY_CHART_PADDING.bottom - height;

    return {
      ...item,
      x,
      y,
      width: barWidth,
      height,
    };
  });
  const pointActivityTicks = Array.from({ length: 4 }, (_, index) => {
    const value = Math.round((maxSpentPointAmount * (3 - index)) / 3);
    const y =
      POINT_ACTIVITY_CHART_PADDING.top + (pointActivityUsableHeight * index) / 3;

    return { value, y };
  });

  return (
    <div className="mx-auto max-w-8xl space-y-8 p-6 md:p-8">
      <section className="app-hero-card relative overflow-hidden rounded-[13px] border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-primary p-8 text-white shadow-xl dark:border-slate-800">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-12 left-0 h-32 w-32 rounded-full bg-white/5 blur-3xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur">
            <span className="material-symbols-outlined text-sm">credit_card</span>
            {audience === "admin" ? "Admin Billing" : "Billing Center"}
          </div>
          <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
                Point wallet, request routing, and usage timeline
              </h1>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white backdrop-blur">
              <span className="material-symbols-outlined text-sm text-white/80">shield_person</span>
              {profilePill}
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <MetricCard
          label="Available Points"
          value={points.available_points}
          icon="account_balance_wallet"
          caption="Current balance ready for conversions."
        />
        <MetricCard
          label="Pending Requests"
          value={pendingRequests}
          icon="pending_actions"
          caption="Requests waiting for admin response."
        />
        <MetricCard
          label="Last Login"
          value={formatDate(me.last_login)}
          icon="schedule"
          caption="Most recent successful login."
        />
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <section className="relative overflow-hidden rounded-[13px] border border-border bg-white/30 backdrop-blur-2xl [box-shadow:4px_4px_0px_0px_var(--border)] dark:bg-white/[0.03]">
        <div className={`absolute inset-y-6 left-6 w-px ${ACCENT_RAIL_STOPS}`} />
        <div className="relative flex h-full flex-col justify-center gap-5 p-6">
          <div className="flex items-center gap-3">
            <div className={`inline-flex rounded-xl p-2 text-primary ${PRIMARY_TINT}`}>
              <span className="material-symbols-outlined">add_card</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Request a Top-up
              </h2>
              <p className={`text-xs ${MUTED_FG}`}>
                Ask your administrator to add points to this account.
              </p>
            </div>
          </div>

          <div className="rounded-[18px] border border-slate-200/70 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.04]">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
              Current Balance
            </p>
            <p className="mt-1 text-3xl font-black tracking-tight tabular-nums text-slate-900 dark:text-white">
              {points ? points.available_points.toLocaleString() : "—"}
              <span className={`ml-2 text-sm font-semibold ${MUTED_FG}`}>points</span>
            </p>
            {pendingRequests > 0 ? (
              <p
                className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                  pendingLimitReached
                    ? "border-rose-200/70 bg-rose-50/80 text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300"
                    : "border-amber-200/70 bg-amber-50/80 text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300"
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">schedule</span>
                {pendingRequests} request{pendingRequests === 1 ? "" : "s"} pending
                {pendingLimitReached ? " — cancel one to send another" : ""}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => setShowTopupModal(true)}
            disabled={pendingLimitReached}
            title={pendingLimitReached ? "Cancel a pending request before sending another." : undefined}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-base">add</span>
            {pendingLimitReached ? "Pending Limit Reached" : "New Top-up Request"}
          </button>
        </div>

      </section>

      <section className="relative overflow-hidden rounded-[13px] border border-border bg-white/30 backdrop-blur-2xl [box-shadow:4px_4px_0px_0px_var(--border)] dark:bg-white/[0.03]">
          <div className={`absolute inset-y-6 left-6 w-px ${ACCENT_RAIL_STOPS}`} />
          <div className="relative border-b border-slate-200/70 px-6 py-5 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className={`inline-flex rounded-xl p-2 text-primary ${PRIMARY_TINT}`}>
                <span className="material-symbols-outlined">receipt_long</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">My Topup Requests</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Outgoing request queue with live status tracking.</p>
              </div>
            </div>
          </div>
          <div className="relative p-5 sm:p-6">
            <div className="overflow-hidden rounded-[18px] border border-slate-200/70 dark:border-white/10">
              <div className="max-h-[420px] overflow-auto">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 z-10 bg-slate-50 backdrop-blur dark:bg-slate-800/80">
                    <tr>
                      {["Request", "Amount", "Status", "Created", ""].map((head, index) => (
                        <th
                          key={head || index}
                          className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400"
                        >
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {!requests?.items.length ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-14 text-center">
                          <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600">
                            receipt_long
                          </span>
                          <p className="mt-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
                            No top-up requests yet
                          </p>
                          <p className={`mt-1 text-xs ${MUTED_FG}`}>
                            Submit one above and track its status here.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      requests.items.map((entry) => (
                        <tr
                          key={entry.id}
                          className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40"
                        >
                          {/* Request identity as one unit: who it went to, the
                              note, and the id — instead of three thin columns. */}
                          <td className="px-5 py-3.5">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                              To admin #{entry.requested_admin_user_id}
                              <span className={`ml-2 text-xs font-normal tabular-nums ${MUTED_FG}`}>
                                #{entry.id}
                              </span>
                            </p>
                            <p className={`mt-0.5 truncate text-xs ${MUTED_FG}`}>
                              {entry.note || "No note provided"}
                            </p>
                          </td>

                          <td className="whitespace-nowrap px-5 py-3.5">
                            <p className="text-sm font-black tabular-nums text-primary">
                              +{entry.amount.toLocaleString()}
                            </p>
                            <p className={`mt-0.5 text-xs capitalize ${MUTED_FG}`}>
                              {entry.package_key}
                              {entry.price_cents ? ` · ${formatUsd(entry.price_cents)}` : ""}
                              {entry.grants_admin_access ? " · admin" : ""}
                            </p>
                          </td>

                          <td className="px-5 py-3.5">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${getStatusClass(
                                entry.status,
                              )}`}
                            >
                              <span className="material-symbols-outlined text-[14px]">
                                {getStatusIcon(entry.status)}
                              </span>
                              {entry.status}
                            </span>
                          </td>

                          <td
                            className={`whitespace-nowrap px-5 py-3.5 text-xs tabular-nums ${MUTED_FG}`}
                            title={formatDate(entry.created_at)}
                          >
                            {formatShortDateTime(entry.created_at)}
                          </td>

                          <td className="px-5 py-3.5 text-right">
                            {entry.status === "pending" ? (
                              <button
                                type="button"
                                onClick={() => handleCancelRequest(entry.id)}
                                disabled={cancelRequestId === entry.id}
                                className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300"
                              >
                                <span className="material-symbols-outlined text-sm">close</span>
                                {cancelRequestId === entry.id ? "Cancelling…" : "Cancel"}
                              </button>
                            ) : (
                              <span className={`text-xs ${MUTED_FG}`}>—</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="relative overflow-hidden rounded-[13px] border border-border bg-white/30 backdrop-blur-2xl [box-shadow:4px_4px_0px_0px_var(--border)] dark:bg-white/[0.03]">
          <div className={`absolute inset-y-6 left-6 w-px ${ACCENT_RAIL_STOPS}`} />
          <div className="relative border-b border-slate-200/70 px-6 py-5 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className={`inline-flex rounded-xl p-2 text-primary ${PRIMARY_TINT}`}>
                <span className="material-symbols-outlined">history</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Point Activity</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Every charge, refund, and balance change tied to this account.</p>
              </div>
            </div>
          </div>
          <div className="relative p-6">
            <div className="transparent">
              <div className="overflow-x-auto">
                <div className="w-full">
                  <svg
                    viewBox={`0 0 ${POINT_ACTIVITY_CHART_WIDTH} ${POINT_ACTIVITY_CHART_HEIGHT}`}
                    className="h-72 w-full"
                    role="img"
                    aria-label={`Point activity ${pointActivityDays} day usage chart`}
                    preserveAspectRatio="none"
                  >
                    {pointActivityTicks.map((tick) => (
                      <g key={`${tick.value}-${tick.y}`}>
                        <line
                          x1={POINT_ACTIVITY_CHART_PADDING.left}
                          y1={tick.y}
                          x2={POINT_ACTIVITY_CHART_WIDTH - POINT_ACTIVITY_CHART_PADDING.right}
                          y2={tick.y}
                          stroke="currentColor"
                          strokeOpacity="0.12"
                          strokeDasharray="4 6"
                        />
                        <text
                          x={POINT_ACTIVITY_CHART_PADDING.left}
                          y={tick.y - 6}
                          fontSize="11"
                          fill="currentColor"
                          opacity="0.55"
                        >
                          {tick.value}
                        </text>
                      </g>
                    ))}

                    <line
                      x1={POINT_ACTIVITY_CHART_PADDING.left}
                      y1={POINT_ACTIVITY_CHART_HEIGHT - POINT_ACTIVITY_CHART_PADDING.bottom}
                      x2={POINT_ACTIVITY_CHART_WIDTH - POINT_ACTIVITY_CHART_PADDING.right}
                      y2={POINT_ACTIVITY_CHART_HEIGHT - POINT_ACTIVITY_CHART_PADDING.bottom}
                      stroke="currentColor"
                      strokeOpacity="0.18"
                    />

                    {pointActivityBars.map((item, index) => (
                      <g key={item.date}>
                        <rect
                          x={item.x}
                          y={item.y}
                          width={item.width}
                          height={item.height}
                          rx="6"
                          fill="var(--primary)"
                        >
                          <title>{`${item.date}: ${item.spent}`}</title>
                        </rect>

                        {pointActivityLabelIndexes.has(index) ? (
                          <>
                            <text
                              x={item.x + item.width / 2}
                              y={POINT_ACTIVITY_CHART_HEIGHT - 12}
                              textAnchor="middle"
                              fontSize="11"
                              fill="currentColor"
                              opacity="0.6"
                            >
                              {item.label}
                            </text>
                            <text
                              x={item.x + item.width / 2}
                              y={Math.max(item.y - 8, POINT_ACTIVITY_CHART_PADDING.top + 12)}
                              textAnchor="middle"
                              fontSize="11"
                              fill="currentColor"
                              opacity="0.75"
                            >
                              {item.spent}
                            </text>
                          </>
                        ) : null}
                      </g>
                    ))}

                    {pointActivityBars.every((item) => item.spent === 0) ? (
                      <text
                        x={POINT_ACTIVITY_CHART_WIDTH / 2}
                        y={POINT_ACTIVITY_CHART_HEIGHT / 2}
                        textAnchor="middle"
                        fontSize="14"
                        fill="currentColor"
                        opacity="0.55"
                      >
                        {`No point usage in the last ${pointActivityDays} days`}
                      </text>
                    ) : null}
                  </svg>
                </div>
              </div>

            </div>

          </div>
        </section>

      {/* Portaled to <body>. The card this modal used to live in has
          `backdrop-blur-2xl`, and a backdrop-filter makes an element the
          containing block for its `position: fixed` descendants — so
          `fixed inset-0` resolved against that half-width card instead of the
          viewport, and the card's `overflow-hidden` then clipped it. */}
      {mounted && showTopupModal
        ? createPortal(
            <div
              // No `overflow-y-auto` here: an overflow container that also
              // centres with flex puts everything above the centre line out of
              // reach — you cannot scroll up to it. The dialog caps its own
              // height and scrolls internally instead.
              // Deliberately no click-to-close on the backdrop: this form holds
              // a package choice and a note, and a stray click outside it should
              // not discard that. Closing is an explicit act — the X or Cancel.
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            >
              {/* Column layout with a capped height: header and footer stay put,
                  only the middle scrolls, so the submit button is always
                  reachable. dvh (not vh) so mobile browser chrome doesn't cut
                  the bottom off. */}
              <div
                role="dialog"
                aria-modal="true"
                aria-label="Topup Request"
                className="flex max-h-[calc(100dvh-2rem)] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200"
              >
                <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-5 py-4 sm:px-6">
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-foreground">Topup Request</h3>
                    <p className={`mt-0.5 text-xs ${MODAL_MUTED}`}>{requestHint}</p>
                  </div>
                  <button
                    type="button"
                    onClick={closeTopupModal}
                    aria-label="Close"
                    className={`-mr-1 shrink-0 rounded-lg p-1 transition hover:bg-card-hover hover:text-foreground ${MODAL_MUTED}`}
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                {/* min-h-0 lets this flex child shrink below its content height —
                    without it the overflow never engages. */}
                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
                {pendingLimitReached && (
                  <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
                    You already have {MAX_PENDING_TOPUP_REQUESTS} pending requests. Cancel one below before sending another.
                  </div>
                )}
                {requestError && (
                  <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
                    {requestError}
                  </div>
                )}
                {requestSuccess && (
                  <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
                    {requestSuccess}
                  </div>
                )}

                {/* Routing is decided by the server from who created this
                    account — shown, never entered. */}
                {catalog ? (
                  <div className={`mb-5 flex items-start gap-3 rounded-xl p-3 ${MODAL_PANEL}`}>
                    <span className={`material-symbols-outlined text-lg ${MODAL_MUTED}`}>
                      {catalog.target.routing === "creator" ? "supervisor_account" : "shield"}
                    </span>
                    <div className="min-w-0">
                      <p className={`text-xs font-bold uppercase tracking-widest ${MODAL_MUTED}`}>
                        Goes to
                      </p>
                      <p className="truncate text-sm font-semibold text-foreground">
                        {catalog.target.username || catalog.target.email}
                        <span className={`ml-2 text-xs font-normal ${MODAL_MUTED}`}>
                          {formatRoleLabel(catalog.target.role)}
                        </span>
                      </p>
                      <p className={`mt-0.5 text-xs ${MODAL_MUTED}`}>
                        {catalog.target.routing === "creator"
                          ? "The administrator who created your account."
                          : "Your account is self-registered, so this goes to a super admin."}
                      </p>
                    </div>
                  </div>
                ) : null}

                <div className="space-y-4">
                  <div className="space-y-2">
                    <span className={`text-xs font-bold uppercase tracking-widest ${MODAL_MUTED}`}>
                      Choose a package
                    </span>
                    <div className="grid grid-cols-1 gap-2">
                      {catalog?.packages.map((pkg) => {
                        const active = selectedPackage === pkg.key;
                        const isCustom = pkg.key === "custom";
                        return (
                          <button
                            key={pkg.key}
                            type="button"
                            onClick={() => setSelectedPackage(pkg.key)}
                            aria-pressed={active}
                            className={`flex items-center justify-between gap-3 rounded-xl border p-3 text-left transition ${
                              active
                                ? "border-primary ring-1 ring-inset ring-primary"
                                : "border-border hover:bg-card-hover"
                            }`}
                          >
                            <span className="min-w-0 flex-1">
                              <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                <span className="text-sm font-bold text-foreground">
                                  {isCustom ? "Custom" : `${pkg.label} · ${formatUsd(pkg.price_cents)}`}
                                </span>
                                {pkg.grants_admin_access ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                                    <span className="material-symbols-outlined text-[12px]">
                                      shield
                                    </span>
                                    Admin access
                                  </span>
                                ) : null}
                              </span>
                              <span className={`mt-0.5 block text-xs ${MODAL_MUTED}`}>
                                {pkg.description}
                              </span>
                            </span>
                            {!isCustom ? (
                              <span className="shrink-0 text-right">
                                <span className="block text-sm font-black tabular-nums text-primary">
                                  {pkg.points.toLocaleString()}
                                </span>
                                <span className={`block text-[10px] uppercase tracking-wider ${MODAL_MUTED}`}>
                                  points
                                </span>
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {selectedPackage === "custom" ? (
                    <label className="block space-y-1.5">
                      <span className={`text-xs font-bold uppercase tracking-widest ${MODAL_MUTED}`}>
                        Amount in USD
                      </span>
                      <div className="relative">
                        <span className={`pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm ${MODAL_MUTED}`}>
                          $
                        </span>
                        <input
                          type="number"
                          min={catalog ? catalog.min_price_cents / 100 : 5}
                          step="1"
                          value={customDollars}
                          onChange={(e) => setCustomDollars(e.target.value)}
                          className={`w-full rounded-xl border border-border bg-transparent py-3 pl-8 pr-4 text-sm text-foreground outline-none transition placeholder:text-[color-mix(in_srgb,var(--foreground)_50%,transparent)] ${FOCUS_RING}`}
                        />
                      </div>
                    </label>
                  ) : null}

                  <label className="block space-y-1.5">
                    <span className={`text-xs font-bold uppercase tracking-widest ${MODAL_MUTED}`}>
                      Request Note <span className="font-normal normal-case">(optional)</span>
                    </span>
                    <input
                      type="text"
                      value={form.note}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, note: e.target.value }))
                      }
                      placeholder="Reason or project note"
                      className={`w-full rounded-xl border border-border bg-transparent px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-[color-mix(in_srgb,var(--foreground)_50%,transparent)] ${FOCUS_RING}`}
                    />
                  </label>
                </div>

                {/* Running total, so the terms are explicit before submitting. */}
                {quote ? (
                  <div
                    className={`mt-5 rounded-xl border p-3 ${
                      belowMinimum
                        ? "border-rose-200 bg-rose-50 dark:border-rose-900/40 dark:bg-rose-950/30"
                        : `${MODAL_PANEL}`
                    }`}
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <span className={`text-xs font-bold uppercase tracking-widest ${MODAL_MUTED}`}>
                        You receive
                      </span>
                      <span className="text-lg font-black tabular-nums text-foreground">
                        {quote.points.toLocaleString()}
                        <span className={`ml-1 text-xs font-semibold ${MODAL_MUTED}`}>pts</span>
                        <span className={`mx-2 text-xs font-normal ${MODAL_MUTED}`}>for</span>
                        {formatUsd(quote.cents)}
                      </span>
                    </div>
                    {belowMinimum && catalog ? (
                      <p className="mt-1 text-xs font-semibold text-rose-700 dark:text-rose-300">
                        Minimum is {formatUsd(catalog.min_price_cents)} ({catalog.min_points} points).
                      </p>
                    ) : quote.grantsAdmin ? (
                      <p className="mt-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                        Includes admin access once approved.
                      </p>
                    ) : null}
                  </div>
                ) : null}
                </div>

                {/* Pinned footer — the primary action never scrolls away. */}
                <div className="flex shrink-0 gap-3 border-t border-border px-5 py-4 sm:px-6">
                  <button
                    type="button"
                    onClick={closeTopupModal}
                    className="flex-1 rounded-xl border border-border py-2.5 text-sm font-semibold text-foreground transition hover:bg-card-hover"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await handleCreateRequest();
                      if (!requestError) setShowTopupModal(false);
                    }}
                    disabled={requestLoading || belowMinimum || pendingLimitReached}
                    className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-bold text-white shadow-lg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {requestLoading ? "Submitting..." : "Submit Request"}
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
