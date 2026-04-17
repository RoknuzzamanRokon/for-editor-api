"use client";

import { useEffect, useState } from "react";

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

function formatDate(value?: string | null) {
  if (!value) return "Not configured";
  return new Date(value).toLocaleString();
}

function getStatusClass(status: string) {
  const normalized = status.toLowerCase();
  if (normalized.includes("success") || normalized.includes("active") || normalized.includes("available")) {
    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300";
  }
  if (normalized.includes("pending")) {
    return "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300";
  }
  if (normalized.includes("expired") || normalized.includes("failed") || normalized.includes("inactive")) {
    return "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300";
  }
  return "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300";
}

export default function DashboardBillingPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [points, setPoints] = useState<MyPointResponse | null>(null);
  const [requests, setRequests] = useState<TopupRequestList | null>(null);
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [requestSuccess, setRequestSuccess] = useState("");
  const [form, setForm] = useState({ requested_admin_user_id: "", amount: "", note: "" });

  const token = () => localStorage.getItem("access_token") ?? "";

  const refreshPageData = async () => {
    const auth = token();
    const [pointsRes, requestsRes] = await Promise.all([
      fetch(`${API_BASE}/api/v3/points/my-point`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${auth}`,
        },
      }),
      fetch(`${API_BASE}/api/v3/points/topup-requests/mine`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${auth}`,
        },
      }),
    ]);

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

  const handleCreateRequest = async () => {
    setRequestError("");
    setRequestSuccess("");
    if (!form.requested_admin_user_id || !form.amount) {
      setRequestError("Admin ID and amount are required.");
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
          user_id: points?.user_id,
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
      <div className="mx-auto max-w-8xl p-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
          Loading billing...
        </div>
      </div>
    );
  }

  if (error || !points) {
    return (
      <div className="mx-auto max-w-8xl p-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-300">
          {error || "Billing data not available"}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-8xl space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Billing</h1>
        <p className="mt-1 text-slate-500">Track points, usage, and billing-related activity.</p>
      </div>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-primary/10 bg-primary/5 p-6">
          <p className="text-xs uppercase tracking-wider text-slate-500">Available Points</p>
          <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{points.available_points}</p>
        </div>
        <div className="rounded-2xl border border-primary/10 bg-primary/5 p-6">
          <p className="text-xs uppercase tracking-wider text-slate-500">Point Status</p>
          <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(points.point_status)}`}>
            {points.point_status}
          </span>
        </div>
        <div className="rounded-2xl border border-primary/10 bg-primary/5 p-6">
          <p className="text-xs uppercase tracking-wider text-slate-500">Expiry</p>
          <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-100">{formatDate(points.expires_at)}</p>
          <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(points.expiry_status)}`}>
            {points.expiry_status}
          </span>
        </div>
      </section>

      <section className="rounded-2xl border border-primary/10 bg-primary/5 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Topup Request</h2>
            <p className="mt-1 text-sm text-slate-500">Send a topup request to a specific admin by admin ID.</p>
          </div>
          <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-bold text-primary dark:bg-slate-900/70">
            User #{points.user_id}
          </span>
        </div>

        {requestError ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-300">
            {requestError}
          </div>
        ) : null}
        {requestSuccess ? (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/30 dark:bg-emerald-900/20 dark:text-emerald-300">
            {requestSuccess}
          </div>
        ) : null}

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <input
            type="number"
            min={1}
            value={form.requested_admin_user_id}
            onChange={(e) => setForm((prev) => ({ ...prev, requested_admin_user_id: e.target.value }))}
            placeholder="Admin ID"
            className="rounded-xl border border-primary/10 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 dark:bg-slate-900"
          />
          <input
            type="number"
            min={1}
            value={form.amount}
            onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
            placeholder="Amount"
            className="rounded-xl border border-primary/10 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 dark:bg-slate-900"
          />
          <input
            type="text"
            value={form.note}
            onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
            placeholder="Note (optional)"
            className="rounded-xl border border-primary/10 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 dark:bg-slate-900"
          />
        </div>

        <button
          type="button"
          onClick={handleCreateRequest}
          disabled={requestLoading}
          className="mt-5 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
        >
          {requestLoading ? "Submitting..." : "Submit Request"}
        </button>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-800">
          <h2 className="text-lg font-bold">Billing History</h2>
          <span className="text-xs text-slate-500">Total entries: {points.total}</span>
        </div>
        <div className="max-h-[560px] overflow-y-auto overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-800/50">
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Request ID</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {points.history.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-sm text-slate-500">
                    No billing history found.
                  </td>
                </tr>
              ) : (
                points.history.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{entry.action}</td>
                    <td className="px-6 py-4">{entry.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(entry.status)}`}>
                        {entry.status}
                      </span>
                    </td>
                    <td className="max-w-[260px] px-6 py-4">
                      <div className="truncate text-slate-500" title={entry.request_id}>
                        {entry.request_id}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{formatDate(entry.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-800">
          <h2 className="text-lg font-bold">My Topup Requests</h2>
          <span className="text-xs text-slate-500">Total requests: {requests?.total ?? 0}</span>
        </div>
        <div className="max-h-[420px] overflow-y-auto overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-800/50">
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Admin</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Note</th>
                <th className="px-6 py-4">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {!requests?.items.length ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-sm text-slate-500">
                    No topup requests found.
                  </td>
                </tr>
              ) : (
                requests.items.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{entry.id}</td>
                    <td className="px-6 py-4 text-slate-500">#{entry.requested_admin_user_id}</td>
                    <td className="px-6 py-4">{entry.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(entry.status)}`}>
                        {entry.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{entry.note || "-"}</td>
                    <td className="px-6 py-4 text-slate-500">{formatDate(entry.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
