"use client";

import { useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://127.0.0.1:8000";

type MeResponse = {
  id: number;
  email: string;
  username?: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
};

type LedgerEntry = {
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
  history: LedgerEntry[];
  total: number;
};

function formatDate(value?: string | null) {
  if (!value) return "Not available";
  return new Date(value).toLocaleString();
}

function GlassStatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-[28px] border border-white/40 bg-white/55 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.12)] dark:border-white/10 dark:bg-white/5">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-white/30 to-transparent dark:from-primary/10 dark:via-white/5 dark:to-transparent" />
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary/15 blur-3xl" />
      <div className="relative">
        <div className="mb-4 inline-flex rounded-2xl border border-white/40 bg-white/60 p-3 text-primary shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/10">
          <span className="material-symbols-outlined">{icon}</span>
        </div>

        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
          {title}
        </p>
        <p className="mt-2 text-xl font-black tracking-tight text-slate-900 dark:text-white">
          {value}
        </p>
      </div>
    </div>
  );
}

function GlassInfoRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/40 bg-white/55 px-4 py-3.5 shadow-sm backdrop-blur-lg dark:border-white/10 dark:bg-white/5">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent" />
      <div className="relative">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
          {label}
        </p>
        <p
          className={`mt-1 text-sm font-semibold text-slate-900 dark:text-white ${
            mono ? "break-all font-mono text-[13px]" : ""
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

export default function AdminProfilePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [me, setMe] = useState<MeResponse | null>(null);
  const [points, setPoints] = useState<MyPointResponse | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState("account_circle");

  const AVATARS = ["account_circle","face","person","sentiment_satisfied","mood","supervised_user_circle","manage_accounts","engineering","support_agent","psychology"];

  useEffect(() => {
    const saved = localStorage.getItem("admin_avatar");
    if (saved) setSelectedAvatar(saved);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    fetch(`${API_BASE}/api/v3/points/my-point`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data) setPoints(data as MyPointResponse); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("No access token found");
      setLoading(false);
      return;
    }

    fetch(`${API_BASE}/api/v2/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Failed to load profile");
        }
        const data = (await res.json()) as MeResponse;
        setMe(data);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      })
      .finally(() => setLoading(false));
  }, []);

  const displayName = useMemo(() => {
    if (!me) return "Admin User";
    return me.username || me.email || "Admin User";
  }, [me]);

  return (
    <AdminShell>
      <div className="mx-auto max-w-8xl space-y-8 p-6 md:p-8">
        <section className="relative overflow-hidden rounded-[32px] border border-white/40 bg-white/55 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.10)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-white/40 to-transparent dark:from-primary/10 dark:via-white/5 dark:to-transparent" />
          <div className="absolute -left-16 top-0 h-40 w-40 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute -right-10 bottom-0 h-44 w-44 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/20" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="relative flex h-20 w-20 items-center justify-center rounded-[28px] border border-white/40 bg-white/60 text-primary shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-white/10">
                <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-primary/15 via-transparent to-transparent" />
                <span className="material-symbols-outlined relative text-4xl">
                  {selectedAvatar}
                </span>
              </div>

              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/60 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-primary backdrop-blur-md dark:border-white/10 dark:bg-white/10">
                  <span className="material-symbols-outlined text-sm">
                    shield
                  </span>
                  Admin Profile
                </div>

                <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 dark:text-white md:text-4xl">
                  {displayName}
                </h1>

                <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
                  Manage your admin identity, account status, and profile
                  details with a polished liquid glass interface that follows
                  your current theme color.
                </p>
              </div>
            </div>

            {!loading && !error && me ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/40 bg-white/60 px-4 py-3 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/10">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    Role
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                    {me.role}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/40 bg-white/60 px-4 py-3 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/10">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    Status
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                    {me.is_active ? "Active" : "Inactive"}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/40 bg-white/60 px-4 py-3 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/10">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    Joined
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                    {new Date(me.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        {loading ? (
          <div className="relative overflow-hidden rounded-[28px] border border-white/40 bg-white/55 p-6 shadow-[0_12px_32px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-white/30 to-transparent dark:from-primary/10 dark:via-white/5 dark:to-transparent" />
            <div className="relative flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
              <span className="material-symbols-outlined animate-pulse text-primary">
                progress_activity
              </span>
              Loading profile...
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="relative overflow-hidden rounded-[28px] border border-rose-200/70 bg-rose-50/80 p-6 shadow-sm backdrop-blur-xl dark:border-rose-900/40 dark:bg-rose-950/20">
            <div className="flex items-center gap-3 text-sm text-rose-700 dark:text-rose-300">
              <span className="material-symbols-outlined">error</span>
              {error}
            </div>
          </div>
        ) : null}

        {!loading && !error && me ? (
          <>
            <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <GlassStatCard title="Role" value={me.role} icon="badge" />
              <GlassStatCard
                title="Status"
                value={me.is_active ? "Active" : "Inactive"}
                icon="verified_user"
              />
              <GlassStatCard
                title="Member Since"
                value={new Date(me.created_at).toLocaleDateString()}
                icon="calendar_month"
              />
            </section>

            <section className="relative overflow-hidden rounded-[32px] border border-white/40 bg-white/55 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.10)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-white/30 to-transparent dark:from-primary/10 dark:via-white/5 dark:to-transparent" />
              <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-primary/10 blur-3xl" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/20" />

              <div className="relative">
                <div className="mb-6 flex items-center gap-3">
                  <div className="inline-flex rounded-2xl border border-white/40 bg-white/60 p-3 text-primary shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/10">
                    <span className="material-symbols-outlined">person</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      Account Details
                    </h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Administrative identity and account metadata
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <GlassInfoRow
                    label="Full Name / Username"
                    value={me.username || "Not set"}
                  />
                  <GlassInfoRow label="Email" value={me.email} mono />
                  <GlassInfoRow label="Role" value={me.role.toUpperCase()} />
                  <GlassInfoRow
                    label="Created At"
                    value={formatDate(me.created_at)}
                  />
                </div>

                <div className="mt-6">
                  <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Avatar</p>
                  <div className="flex flex-wrap gap-2">
                    {AVATARS.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => { setSelectedAvatar(icon); localStorage.setItem("admin_avatar", icon); }}
                        className={`flex h-11 w-11 items-center justify-center rounded-2xl border transition ${selectedAvatar === icon ? "border-primary bg-primary/10 text-primary" : "border-white/40 bg-white/60 text-slate-500 hover:border-primary/40 dark:border-white/10 dark:bg-white/10 dark:text-slate-400"}`}
                      >
                        <span className="material-symbols-outlined text-2xl">{icon}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>
            <section className="relative overflow-hidden rounded-[32px] border border-white/40 bg-white/55 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.10)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-white/30 to-transparent dark:from-primary/10 dark:via-white/5 dark:to-transparent" />
              <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-primary/10 blur-3xl" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/20" />

              <div className="relative">
                <div className="mb-6 flex items-center gap-3">
                  <div className="inline-flex rounded-2xl border border-white/40 bg-white/60 p-3 text-primary shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/10">
                    <span className="material-symbols-outlined">toll</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Points</h2>
                    <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Your balance and transaction history</p>
                  </div>
                </div>

                {points ? (
                  <>
                    <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                      {[
                        { label: "Balance", value: points.available_points, icon: "account_balance_wallet" },
                        { label: "Status", value: points.point_status, icon: "check_circle" },
                        { label: "Expiry", value: points.expiry_status.replace(/_/g, " "), icon: "schedule" },
                        { label: "Transactions", value: points.total, icon: "receipt_long" },
                      ].map(({ label, value, icon }) => (
                        <div key={label} className="relative overflow-hidden rounded-2xl border border-white/40 bg-white/55 px-4 py-4 shadow-sm backdrop-blur-lg dark:border-white/10 dark:bg-white/5">
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
                          <div className="relative flex items-center gap-3">
                            <span className="material-symbols-outlined text-xl text-primary">{icon}</span>
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</p>
                              <p className="text-base font-black text-slate-900 dark:text-white">{value}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-white/40 bg-white/40 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                      <div className="border-b border-white/30 px-4 py-3 dark:border-white/10">
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Recent History</p>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead>
                            <tr className="border-b border-white/20 dark:border-white/5">
                              <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Action</th>
                              <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Amount</th>
                              <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Status</th>
                              <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/20 dark:divide-white/5">
                            {points.history.length === 0 ? (
                              <tr><td colSpan={4} className="px-4 py-6 text-slate-400 dark:text-slate-500">No transactions yet.</td></tr>
                            ) : points.history.map((entry) => (
                              <tr key={entry.id} className="hover:bg-white/30 dark:hover:bg-white/5">
                                <td className="px-4 py-2.5 font-medium text-slate-800 dark:text-slate-100">{entry.action}</td>
                                <td className="px-4 py-2.5">
                                  <span className={`font-bold ${entry.amount >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                                    {entry.amount >= 0 ? "+" : ""}{entry.amount}
                                  </span>
                                </td>
                                <td className="px-4 py-2.5">
                                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${entry.status === "success" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300"}`}>
                                    {entry.status}
                                  </span>
                                </td>
                                <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">{formatDate(entry.created_at)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-slate-400 dark:text-slate-500">Loading points...</p>
                )}
              </div>
            </section>
          </>
        ) : null}
      </div>
    </AdminShell>
  );
}
