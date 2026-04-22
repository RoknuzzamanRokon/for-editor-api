"use client";

import { useEffect, useState } from "react";
import { API_BASE } from "@/lib/apiBase";

type GivingEntry = {
  id: number;
  user_id: number;
  user_email: string;
  user_username: string | null;
  amount: number;
  note: string | null;
  created_at: string;
  created_by_user_id: number | null;
  created_by_email: string | null;
  created_by_username: string | null;
};

type GivingHistory = {
  total: number;
  limit: number;
  offset: number;
  items: GivingEntry[];
};

type TopupRequestEntry = {
  id: number;
  user_id: number;
  user_email: string;
  user_username: string | null;
  requested_admin_user_id: number;
  requested_admin_email: string;
  requested_admin_username: string | null;
  amount: number;
  note: string | null;
  status: string;
  created_by_user_id: number;
  created_by_email: string;
  created_by_username: string | null;
  resolved_by_user_id: number | null;
  resolved_by_email: string | null;
  resolved_by_username: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
};

type TopupRequestList = {
  total: number;
  limit: number;
  offset: number;
  items: TopupRequestEntry[];
};

type UserItem = { id: number; email: string; username: string | null };

function formatDate(v: string) {
  return new Date(v).toLocaleString();
}

function StatTile({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/40 bg-white/55 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-white/30 to-transparent dark:from-primary/10 dark:via-white/5 dark:to-transparent" />
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative">
        <div className="mb-3 inline-flex rounded-2xl border border-white/40 bg-white/60 p-3 text-primary shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/10">
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">{label}</p>
        <p className="mt-1 text-2xl font-black tracking-tight text-slate-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}

export default function AdminPointPage() {
  const [history, setHistory] = useState<GivingHistory | null>(null);
  const [requests, setRequests] = useState<TopupRequestList | null>(null);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [topupLoading, setTopupLoading] = useState(false);
  const [requestActionId, setRequestActionId] = useState<number | null>(null);
  const [topupError, setTopupError] = useState("");
  const [topupSuccess, setTopupSuccess] = useState("");
  const [form, setForm] = useState({ user_id: "", amount: "", note: "" });

  const token = () => localStorage.getItem("access_token") ?? "";

  useEffect(() => {
    const t = token();
    if (!t) return;
    const h = { Authorization: `Bearer ${t}` };

    Promise.all([
      fetch(`${API_BASE}/api/v3/admin/points/giving-history?limit=50&offset=0`, { headers: h }),
      fetch(`${API_BASE}/api/v3/admin/points/topup-requests?limit=50&offset=0`, { headers: h }),
      fetch(`${API_BASE}/api/v2/users`, { headers: h }),
    ])
      .then(async ([hr, rr, ur]) => {
        if (hr.ok) setHistory(await hr.json() as GivingHistory);
        if (rr.ok) setRequests(await rr.json() as TopupRequestList);
        if (ur.ok) setUsers(await ur.json() as UserItem[]);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalGiven = history?.items.reduce((s, i) => s + i.amount, 0) ?? 0;
  const pendingRequests = requests?.items.filter((item) => item.status === "pending").length ?? 0;

  const refreshData = async () => {
    const h = { Authorization: `Bearer ${token()}` };
    const [hr, rr] = await Promise.all([
      fetch(`${API_BASE}/api/v3/admin/points/giving-history?limit=50&offset=0`, { headers: h }),
      fetch(`${API_BASE}/api/v3/admin/points/topup-requests?limit=50&offset=0`, { headers: h }),
    ]);
    if (hr.ok) setHistory(await hr.json() as GivingHistory);
    if (rr.ok) setRequests(await rr.json() as TopupRequestList);
  };

  const handleTopup = async () => {
    setTopupError(""); setTopupSuccess("");
    if (!form.user_id || !form.amount) { setTopupError("User and amount are required."); return; }
    setTopupLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v3/points/topup`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: Number(form.user_id), amount: Number(form.amount), note: form.note || undefined }),
      });
      const body = await res.text();
      if (!res.ok) throw new Error(body || "Failed");
      setTopupSuccess(`Points distributed successfully.`);
      setForm({ user_id: "", amount: "", note: "" });
      await refreshData();
    } catch (e) {
      setTopupError(e instanceof Error ? e.message : "Failed");
    } finally {
      setTopupLoading(false);
    }
  };

  const handleRequestAction = async (requestId: number, action: "approve" | "reject") => {
    setTopupError("");
    setTopupSuccess("");
    setRequestActionId(requestId);
    try {
      const res = await fetch(`${API_BASE}/api/v3/admin/points/topup-requests/${requestId}/${action}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}` },
      });
      const body = await res.text();
      if (!res.ok) throw new Error(body || `Failed to ${action} request`);
      setTopupSuccess(`Request ${action}d successfully.`);
      await refreshData();
    } catch (e) {
      setTopupError(e instanceof Error ? e.message : `Failed to ${action} request`);
    } finally {
      setRequestActionId(null);
    }
  };

  return (
      <div className="mx-auto max-w-8xl space-y-8 p-6 md:p-8">

        {/* Header */}
        <section className="relative overflow-hidden rounded-[13px] border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-primary p-8 text-white shadow-xl dark:border-slate-800">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-12 left-0 h-32 w-32 rounded-full bg-primary-foreground/10 blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur">
              <span className="material-symbols-outlined text-sm">toll</span>
              Points Management
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-white md:text-4xl">Point Distribution</h1>
            <p className="mt-2 text-sm text-white/80">Distribute points to users, review incoming requests, and monitor the full giving history from one admin control surface.</p>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <StatTile label="Total Distributed" value={totalGiven.toLocaleString()} icon="account_balance_wallet" />
          <StatTile label="Transactions" value={history?.total ?? 0} icon="receipt_long" />
          <StatTile label="Pending Requests" value={pendingRequests} icon="notifications_active" />
        </section>

        {/* Distribute form */}
        <section className="relative overflow-hidden rounded-[13px] border border-white/40 bg-white/55 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.10)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-white/30 to-transparent dark:from-primary/10 dark:via-white/5 dark:to-transparent" />
          <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/20" />
          <div className="relative">
            <div className="mb-5 flex items-center gap-3">
              <div className="inline-flex rounded-2xl border border-white/40 bg-white/60 p-3 text-primary shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/10">
                <span className="material-symbols-outlined">add_circle</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Distribute Points</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">POST /api/v3/points/topup</p>
              </div>
            </div>

            {topupError && (
              <div className="mb-4 rounded-2xl border border-rose-200/70 bg-rose-50/80 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300">{topupError}</div>
            )}
            {topupSuccess && (
              <div className="mb-4 rounded-2xl border border-emerald-200/70 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300">{topupSuccess}</div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">User</label>
                <select
                  value={form.user_id}
                  onChange={(e) => setForm((p) => ({ ...p, user_id: e.target.value }))}
                  className="w-full rounded-2xl border border-white/40 bg-white/65 px-4 py-3 text-sm text-slate-900 outline-none shadow-sm backdrop-blur-md transition focus:border-primary/40 focus:ring-4 focus:ring-primary/10 dark:border-white/10 dark:bg-white/10 dark:text-white"
                >
                  <option value="">Select user...</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.username || u.email} (#{u.id})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Amount</label>
                <input
                  type="number"
                  min={1}
                  value={form.amount}
                  onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
                  placeholder="e.g. 100"
                  className="w-full rounded-2xl border border-white/40 bg-white/65 px-4 py-3 text-sm text-slate-900 outline-none shadow-sm backdrop-blur-md transition focus:border-primary/40 focus:ring-4 focus:ring-primary/10 dark:border-white/10 dark:bg-white/10 dark:text-white placeholder:text-slate-400"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Note (optional)</label>
                <input
                  type="text"
                  value={form.note}
                  onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
                  placeholder="Reason..."
                  className="w-full rounded-2xl border border-white/40 bg-white/65 px-4 py-3 text-sm text-slate-900 outline-none shadow-sm backdrop-blur-md transition focus:border-primary/40 focus:ring-4 focus:ring-primary/10 dark:border-white/10 dark:bg-white/10 dark:text-white placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="mt-5">
              <button
                type="button"
                onClick={handleTopup}
                disabled={topupLoading}
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-base">send</span>
                {topupLoading ? "Distributing..." : "Distribute Points"}
              </button>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden rounded-[13px] border border-white/40 bg-white/55 shadow-[0_20px_50px_rgba(15,23,42,0.10)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-white/30 to-transparent dark:from-primary/10 dark:via-white/5 dark:to-transparent" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/20" />
          <div className="relative border-b border-white/30 px-6 py-5 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="inline-flex rounded-2xl border border-white/40 bg-white/60 p-3 text-primary shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/10">
                <span className="material-symbols-outlined">pending_actions</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Incoming Topup Requests</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">GET /api/v3/admin/points/topup-requests</p>
              </div>
            </div>
          </div>
          <div className="relative p-6">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="grid grid-cols-2 gap-3 md:grid-cols-7">
                    {Array.from({ length: 7 }).map((__, cellIndex) => (
                      <div key={cellIndex} className="h-10 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800/70" />
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-white/40 bg-white/40 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/30 dark:border-white/10">
                        {["#", "User", "Amount", "Requested By", "Status", "Date", "Action"].map((h) => (
                          <th key={h} className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/20 dark:divide-white/5">
                      {!requests?.items.length ? (
                        <tr><td colSpan={7} className="px-4 py-8 text-slate-400 dark:text-slate-500">No incoming requests.</td></tr>
                      ) : requests.items.map((entry) => (
                        <tr key={entry.id} className="hover:bg-white/30 dark:hover:bg-white/5">
                          <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{entry.id}</td>
                          <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{entry.user_username || entry.user_email}</td>
                          <td className="px-4 py-3 font-black text-primary">{entry.amount}</td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{entry.created_by_username || entry.created_by_email}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${
                              entry.status === "pending"
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
                                : entry.status === "approved"
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                                  : "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300"
                            }`}>
                              {entry.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{formatDate(entry.created_at)}</td>
                          <td className="px-4 py-3">
                            {entry.status === "pending" ? (
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleRequestAction(entry.id, "approve")}
                                  disabled={requestActionId === entry.id}
                                  className="rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60"
                                >
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRequestAction(entry.id, "reject")}
                                  disabled={requestActionId === entry.id}
                                  className="rounded-xl bg-rose-500 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60"
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                {entry.resolved_by_username || entry.resolved_by_email || "-"}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* History */}
        <section className="relative overflow-hidden rounded-[13px] border border-white/40 bg-white/55 shadow-[0_20px_50px_rgba(15,23,42,0.10)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-white/30 to-transparent dark:from-primary/10 dark:via-white/5 dark:to-transparent" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/20" />
          <div className="relative border-b border-white/30 px-6 py-5 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="inline-flex rounded-2xl border border-white/40 bg-white/60 p-3 text-primary shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/10">
                <span className="material-symbols-outlined">history</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Giving History</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">GET /api/v3/admin/points/giving-history</p>
              </div>
            </div>
          </div>
          <div className="relative p-6">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="grid grid-cols-2 gap-3 md:grid-cols-6">
                    {Array.from({ length: 6 }).map((__, cellIndex) => (
                      <div key={cellIndex} className="h-10 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800/70" />
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-white/40 bg-white/40 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/30 dark:border-white/10">
                        {["#", "Recipient", "Amount", "Note", "Given By", "Date"].map((h) => (
                          <th key={h} className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/20 dark:divide-white/5">
                      {!history?.items.length ? (
                        <tr><td colSpan={6} className="px-4 py-8 text-slate-400 dark:text-slate-500">No history yet.</td></tr>
                      ) : history.items.map((entry) => (
                        <tr key={entry.id} className="hover:bg-white/30 dark:hover:bg-white/5">
                          <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{entry.id}</td>
                          <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{entry.user_username || entry.user_email}</td>
                          <td className="px-4 py-3 font-black text-emerald-600 dark:text-emerald-400">+{entry.amount}</td>
                          <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{entry.note || "-"}</td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{entry.created_by_username || entry.created_by_email || "-"}</td>
                          <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{formatDate(entry.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </section>

      </div>
  );
}
