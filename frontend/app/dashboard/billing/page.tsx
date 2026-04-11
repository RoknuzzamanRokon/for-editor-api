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

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("No access token found");
      setLoading(false);
      return;
    }

    fetch(`${API_BASE}/api/v3/points/my-point`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        const bodyText = await res.text();
        if (!res.ok) {
          throw new Error(bodyText || "Failed to load billing data");
        }
        return JSON.parse(bodyText) as MyPointResponse;
      })
      .then((data) => setPoints(data))
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load billing data");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl p-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
          Loading billing...
        </div>
      </div>
    );
  }

  if (error || !points) {
    return (
      <div className="mx-auto max-w-7xl p-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-300">
          {error || "Billing data not available"}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-8">
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
    </div>
  );
}

