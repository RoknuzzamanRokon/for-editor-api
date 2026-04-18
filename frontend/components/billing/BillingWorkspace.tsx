"use client";

import { useEffect, useMemo, useState } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000";

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
  const [requests, setRequests] = useState<TopupRequestList | null>(null);
  const [requestLoading, setRequestLoading] = useState(false);
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
    const [meRes, pointsRes, requestsRes] = await Promise.all([
      fetch(`${API_BASE}/api/v2/auth/me`, {
        method: "GET",
        headers: { Authorization: `Bearer ${auth}` },
      }),
      fetch(`${API_BASE}/api/v3/points/my-point`, {
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
    return `${me.role.replace(/_/g, " ")} • User #${points.user_id}`;
  }, [me, points]);

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

  if (loading) {
    return (
      <div className="mx-auto max-w-8xl p-6 md:p-8">
        <div className="rounded-[28px] border border-white/40 bg-white/55 p-6 text-sm text-slate-500 backdrop-blur-2xl dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
          Loading billing...
        </div>
      </div>
    );
  }

  if (error || !points || !me) {
    return (
      <div className="mx-auto max-w-8xl p-6 md:p-8">
        <div className="rounded-[28px] border border-rose-200/70 bg-rose-50/80 p-6 text-sm text-rose-700 backdrop-blur-2xl dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300">
          {error || "Billing data not available"}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-8xl space-y-8 p-6 md:p-8">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-primary p-8 text-white shadow-xl dark:border-slate-800">
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

      <section className="relative overflow-hidden rounded-[32px] border border-white/40 bg-white/55 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.10)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-white/30 to-transparent dark:from-primary/10 dark:via-white/5 dark:to-transparent" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/20" />
        <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="inline-flex rounded-2xl border border-white/40 bg-white/60 p-3 text-primary shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/10">
                <span className="material-symbols-outlined">outgoing_mail</span>
              </div>
              <h2 className="mt-4 text-xl font-black tracking-tight text-slate-900 dark:text-white">
                Create Topup Request
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
                {requestHint}
              </p>
            </div>
            {me.created_by ? (
              <button
                type="button"
                onClick={handlePrefillCreator}
                className="inline-flex items-center gap-2 self-start rounded-full border border-white/45 bg-white/65 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-700 transition hover:border-primary/40 hover:text-primary dark:border-white/10 dark:bg-white/10 dark:text-slate-200"
              >
                <span className="material-symbols-outlined text-sm">north_east</span>
                Request Creator #{me.created_by.id}
              </button>
            ) : null}
          </div>

          {requestError ? (
            <div className="mt-5 rounded-2xl border border-rose-200/70 bg-rose-50/80 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300">
              {requestError}
            </div>
          ) : null}
          {requestSuccess ? (
            <div className="mt-5 rounded-2xl border border-emerald-200/70 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300">
              {requestSuccess}
            </div>
          ) : null}

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <input
              type="number"
              min={1}
              value={form.requested_admin_user_id}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, requested_admin_user_id: e.target.value }))
              }
              placeholder="Target admin / super admin ID"
              className="rounded-2xl border border-white/40 bg-white/65 px-4 py-3 text-sm text-slate-900 outline-none shadow-sm backdrop-blur-md transition focus:border-primary/40 focus:ring-4 focus:ring-primary/10 dark:border-white/10 dark:bg-white/10 dark:text-white"
            />
            <input
              type="number"
              min={1}
              value={form.amount}
              onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
              placeholder="Requested point amount"
              className="rounded-2xl border border-white/40 bg-white/65 px-4 py-3 text-sm text-slate-900 outline-none shadow-sm backdrop-blur-md transition focus:border-primary/40 focus:ring-4 focus:ring-primary/10 dark:border-white/10 dark:bg-white/10 dark:text-white"
            />
            <input
              type="text"
              value={form.note}
              onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
              placeholder="Reason or project note"
              className="rounded-2xl border border-white/40 bg-white/65 px-4 py-3 text-sm text-slate-900 outline-none shadow-sm backdrop-blur-md transition focus:border-primary/40 focus:ring-4 focus:ring-primary/10 dark:border-white/10 dark:bg-white/10 dark:text-white"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="rounded-full border border-white/40 bg-white/60 px-3 py-1.5 dark:border-white/10 dark:bg-white/10">
              Creator: {me.created_by ? `#${me.created_by.id} ${me.created_by.email}` : "Not recorded"}
            </span>
            <span className="rounded-full border border-white/40 bg-white/60 px-3 py-1.5 dark:border-white/10 dark:bg-white/10">
              Status: {points.point_status}
            </span>
            <span className="rounded-full border border-white/40 bg-white/60 px-3 py-1.5 dark:border-white/10 dark:bg-white/10">
              Requests: {requests?.total ?? 0}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCreateRequest}
            disabled={requestLoading}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-base">send</span>
            {requestLoading ? "Submitting..." : "Submit Topup Request"}
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_1fr]">
        <section className="relative overflow-hidden rounded-[32px] border border-white/40 bg-white/55 shadow-[0_20px_50px_rgba(15,23,42,0.10)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5">
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
                      {["ID", "Target", "Amount", "Status", "Note", "Created"].map((head) => (
                        <th key={head} className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/20 dark:divide-white/5">
                    {!requests?.items.length ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-slate-400 dark:text-slate-500">
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
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden rounded-[32px] border border-white/40 bg-white/55 shadow-[0_20px_50px_rgba(15,23,42,0.10)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5">
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
            <div className="overflow-hidden rounded-2xl border border-white/40 bg-white/40 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              <div className="max-h-[460px] overflow-y-auto overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/30 dark:border-white/10">
                      {["Action", "Amount", "Status", "Request ID", "Date"].map((head) => (
                        <th key={head} className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/20 dark:divide-white/5">
                    {points.history.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-slate-400 dark:text-slate-500">
                          No billing history found.
                        </td>
                      </tr>
                    ) : (
                      points.history.map((entry) => (
                        <tr key={entry.id} className="hover:bg-white/30 dark:hover:bg-white/5">
                          <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{entry.action}</td>
                          <td className="px-4 py-3 font-black text-slate-700 dark:text-slate-200">{entry.amount}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${getStatusClass(entry.status)}`}>
                              {entry.status}
                            </span>
                          </td>
                          <td className="max-w-[220px] px-4 py-3 text-slate-500 dark:text-slate-400">
                            <div className="truncate" title={entry.request_id}>
                              {entry.request_id}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{formatDate(entry.created_at)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </section>
    </div>
  );
}
