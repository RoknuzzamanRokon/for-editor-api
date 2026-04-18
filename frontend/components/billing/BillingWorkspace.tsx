"use client";

import { useEffect, useMemo, useState } from "react";
import { formatRoleLabel } from "@/lib/roleLabel";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000";
const POINT_ACTIVITY_CHART_WIDTH = 1920;
const POINT_ACTIVITY_CHART_HEIGHT = 240;
const POINT_ACTIVITY_CHART_PADDING = { top: 16, right: 18, bottom: 34, left: 18 };

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
    <div className="relative overflow-hidden rounded-[28px] border border-white/40 bg-white/55 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-white/30 to-transparent dark:from-primary/10 dark:via-white/5 dark:to-transparent" />
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative">
        <div className="mb-4 inline-flex rounded-2xl border border-white/40 bg-white/65 p-3 text-primary shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/10">
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">{label}</p>
        <p className="mt-1 text-3xl font-black tracking-tight text-slate-900 dark:text-white">{value}</p>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{caption}</p>
      </div>
    </div>
  );
}

export default function BillingWorkspace({ audience }: { audience: "dashboard" | "admin" }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [me, setMe] = useState<MeResponse | null>(null);
  const [points, setPoints] = useState<MyPointResponse | null>(null);
  const [activitySummary, setActivitySummary] = useState<PointActivitySummaryResponse | null>(null);
  const [requests, setRequests] = useState<TopupRequestList | null>(null);
  const [requestLoading, setRequestLoading] = useState(false);
  const [cancelRequestId, setCancelRequestId] = useState<number | null>(null);
  const [requestError, setRequestError] = useState("");
  const [requestSuccess, setRequestSuccess] = useState("");
  const [form, setForm] = useState({
    requested_admin_user_id: "",
    amount: "",
    note: "",
  });

  const token = () => localStorage.getItem("access_token") ?? "";

  const refreshPageData = async () => {
    const auth = token();
    const [meRes, pointsRes, activitySummaryRes, requestsRes] = await Promise.all([
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
  };

  useEffect(() => {
    const auth = token();
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
  }, []);

  const pendingRequests = useMemo(
    () => requests?.items.filter((entry) => entry.status === "pending").length ?? 0,
    [requests],
  );

  const requestHint = useMemo(() => {
    if (!me) return "Send a topup request to a specific admin by admin ID.";
    if (me.role === "admin_user") {
      return "As an admin, you can request points from another admin or from a super admin by entering their ID.";
    }
    if (me.role === "super_user") {
      return "As a super admin, you can still log and route a request to another admin or super admin if needed.";
    }
    return "Send a topup request to the admin or super admin responsible for your account.";
  }, [me]);

  const profilePill = useMemo(() => {
    if (!me || !points) return "Loading profile";
    return `${formatRoleLabel(me.role)} • User #${points.user_id}`;
  }, [me, points]);
  const pointActivityChart = useMemo(() => {
    if (!activitySummary) return [];
    return activitySummary.items.map((item) => ({
      date: item.date,
      label: formatCompactDate(item.date),
      spent: item.spent,
    }));
  }, [activitySummary]);
  const pointActivityLabelIndexes = useMemo(() => {
    if (pointActivityChart.length === 0) return new Set<number>();
    return new Set(pointActivityChart.map((_, index) => index));
  }, [pointActivityChart]);

  const handlePrefillCreator = () => {
    if (!me?.created_by) return;
    setForm((prev) => ({
      ...prev,
      requested_admin_user_id: String(me.created_by?.id ?? ""),
    }));
  };

  const handleCreateRequest = async () => {
    setRequestError("");
    setRequestSuccess("");
    if (!form.requested_admin_user_id || !form.amount || !points) {
      setRequestError("Target admin ID and amount are required.");
      return;
    }
    setRequestLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v3/points/topup-requests`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: points.user_id,
          requested_admin_user_id: Number(form.requested_admin_user_id),
          amount: Number(form.amount),
          note: form.note || undefined,
        }),
      });
      const body = await res.text();
      if (!res.ok) {
        throw new Error(body || "Failed to create topup request");
      }
      setRequestSuccess("Topup request submitted successfully.");
      setForm({ requested_admin_user_id: "", amount: "", note: "" });
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
      const res = await fetch(`${API_BASE}/api/v3/points/topup-cancel/request/${requestId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token()}`,
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
        <div className="rounded-[13px] border border-white/40 bg-white/55 p-6 text-sm text-slate-500 backdrop-blur-2xl dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
          Loading billing...
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
      <section className="relative overflow-hidden rounded-[13px] border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-primary p-8 text-white shadow-xl dark:border-slate-800">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-12 left-0 h-32 w-32 rounded-full bg-primary-foreground/10 blur-3xl" />
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
              <p className="mt-3 max-w-3xl text-sm leading-7 text-white/80">
                Track your point balance, request more credits from a target admin or super admin, and monitor every request status from one place.
              </p>
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
          caption="Current balance ready for conversions and account activity."
        />
        <MetricCard
          label="Pending Requests"
          value={pendingRequests}
          icon="pending_actions"
          caption="Requests still waiting for an assigned admin or super admin response."
        />
        <MetricCard
          label="Last Login"
          value={formatDate(me.last_login)}
          icon="schedule"
          caption="Most recent successful login recorded for this account."
        />
      </section>

      <section className="relative overflow-hidden rounded-[13px] border border-slate-200/80 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.10)] dark:border-slate-800 dark:bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.16),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.10),transparent_28%)]" />
        <div className="relative grid grid-cols-1 xl:grid-cols-[360px_1fr]">
          <div className="relative overflow-hidden border-b border-slate-200/80 bg-slate-950 px-6 py-7 text-white dark:border-slate-800 xl:border-b-0 xl:border-r">
            <div className="absolute -right-16 top-8 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="relative">
              <div className="inline-flex rounded-2xl border border-white/15 bg-white/10 p-3 text-white shadow-sm backdrop-blur-md">
                <span className="material-symbols-outlined">outgoing_mail</span>
              </div>
              <h2 className="mt-5 text-2xl font-black tracking-tight">
                Create Topup Request
              </h2>
              <p className="mt-3 text-sm leading-7 text-white/75">
                {requestHint}
              </p>

              <div className="mt-6 space-y-3">
                <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/55">
                    Point Status
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">{points.point_status}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/55">
                    Total Requests
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">{requests?.total ?? 0}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/55">
                    Creator Route
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white/90">
                    {me.created_by ? `#${me.created_by.id} ${me.created_by.email}` : "Not recorded"}
                  </p>
                </div>
              </div>

              {me.created_by ? (
                <button
                  type="button"
                  onClick={handlePrefillCreator}
                  className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:border-white/30 hover:bg-white/15"
                >
                  <span className="material-symbols-outlined text-sm">north_east</span>
                  Request Creator #{me.created_by.id}
                </button>
              ) : null}
            </div>
          </div>

          <div className="relative p-6">
            {requestError ? (
              <div className="rounded-2xl border border-rose-200/70 bg-rose-50/80 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300">
                {requestError}
              </div>
            ) : null}
            {requestSuccess ? (
              <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300">
                {requestSuccess}
              </div>
            ) : null}

            <div className={`${requestError || requestSuccess ? "mt-5" : ""}`}>
              <div className="grid grid-cols-1 gap-4">
                <label className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    Target Admin ID
                  </span>
                  <input
                    type="number"
                    min={1}
                    value={form.requested_admin_user_id}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, requested_admin_user_id: e.target.value }))
                    }
                    placeholder="Target admin / super admin ID"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none shadow-sm transition focus:border-primary/40 focus:ring-4 focus:ring-primary/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    Requested Points
                  </span>
                  <input
                    type="number"
                    min={1}
                    value={form.amount}
                    onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
                    placeholder="Requested point amount"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none shadow-sm transition focus:border-primary/40 focus:ring-4 focus:ring-primary/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    Request Note
                  </span>
                  <input
                    type="text"
                    value={form.note}
                    onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
                    placeholder="Reason or project note"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none shadow-sm transition focus:border-primary/40 focus:ring-4 focus:ring-primary/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </label>
              </div>

              <div className="mt-5 flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 dark:border-slate-700 dark:bg-slate-900">
                  Audience: admin or super admin
                </span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 dark:border-slate-700 dark:bg-slate-900">
                  Status: {points.point_status}
                </span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 dark:border-slate-700 dark:bg-slate-900">
                  Pending: {pendingRequests}
                </span>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                <p className="max-w-xl text-sm text-slate-500 dark:text-slate-400">
                  Submit a request when your current balance is not enough for upcoming conversions or team usage.
                </p>
                <button
                  type="button"
                  onClick={handleCreateRequest}
                  disabled={requestLoading}
                  className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="material-symbols-outlined text-base">send</span>
                  {requestLoading ? "Submitting..." : "Submit Topup Request"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6">
        <section className="relative overflow-hidden rounded-[13px] border border-white/40 bg-white/55 shadow-[0_20px_50px_rgba(15,23,42,0.10)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-white/30 to-transparent dark:from-primary/10 dark:via-white/5 dark:to-transparent" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/20" />
          <div className="relative border-b border-white/30 px-6 py-5 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="inline-flex rounded-2xl border border-white/40 bg-white/60 p-3 text-primary shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/10">
                <span className="material-symbols-outlined">receipt_long</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">My Topup Requests</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Outgoing request queue with live status tracking.</p>
              </div>
            </div>
          </div>
          <div className="relative p-6">
            <div className="overflow-hidden rounded-2xl border border-white/40 bg-white/40 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/30 dark:border-white/10">
                      {["ID", "Target", "Amount", "Status", "Note", "Created", "Action"].map((head) => (
                        <th key={head} className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/20 dark:divide-white/5">
                    {!requests?.items.length ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-slate-400 dark:text-slate-500">
                          No topup requests submitted yet.
                        </td>
                      </tr>
                    ) : (
                      requests.items.map((entry) => (
                        <tr key={entry.id} className="hover:bg-white/30 dark:hover:bg-white/5">
                          <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{entry.id}</td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300">#{entry.requested_admin_user_id}</td>
                          <td className="px-4 py-3 font-black text-primary">{entry.amount}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${getStatusClass(entry.status)}`}>
                              {entry.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{entry.note || "-"}</td>
                          <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{formatDate(entry.created_at)}</td>
                          <td className="px-4 py-3">
                            {entry.status === "pending" ? (
                              <button
                                type="button"
                                onClick={() => handleCancelRequest(entry.id)}
                                disabled={cancelRequestId === entry.id}
                                className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300"
                              >
                                <span className="material-symbols-outlined text-sm">delete</span>
                                {cancelRequestId === entry.id ? "Cancelling..." : "Cancel"}
                              </button>
                            ) : (
                              <span className="text-xs text-slate-400 dark:text-slate-500">-</span>
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

        <section className="relative overflow-hidden rounded-[13px] border border-white/40 bg-white/55 shadow-[0_20px_50px_rgba(15,23,42,0.10)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-white/30 to-transparent dark:from-primary/10 dark:via-white/5 dark:to-transparent" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/20" />
          <div className="relative border-b border-white/30 px-6 py-5 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="inline-flex rounded-2xl border border-white/40 bg-white/60 p-3 text-primary shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/10">
                <span className="material-symbols-outlined">history</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Point Activity</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Every charge, refund, and balance change tied to this account.</p>
              </div>
            </div>
          </div>
          <div className="relative p-6">
            <div className="mb-6 rounded-2xl border border-white/40 bg-white/40 p-5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              <div className="overflow-x-auto">
                <div className="w-full">
                  <svg
                    viewBox={`0 0 ${POINT_ACTIVITY_CHART_WIDTH} ${POINT_ACTIVITY_CHART_HEIGHT}`}
                    className="h-72 w-full"
                    role="img"
                    aria-label="Point activity 30 day usage chart"
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
                        No point usage in the last 30 days
                      </text>
                    ) : null}
                  </svg>
                </div>
              </div>

            </div>
            
          </div>
        </section>
      </section>
    </div>
  );
}
