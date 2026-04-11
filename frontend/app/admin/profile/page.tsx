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

function formatDate(value?: string | null) {
  if (!value) return "Not available";
  return new Date(value).toLocaleString();
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-primary/10 bg-primary/5 p-5 shadow-sm">
      <div className="mb-3 inline-flex rounded-xl bg-primary/10 p-2 text-primary">
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <p className="text-xs uppercase tracking-wider text-slate-500">{title}</p>
      <p className="mt-1 text-lg font-black text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}

export default function AdminProfilePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [me, setMe] = useState<MeResponse | null>(null);

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
      <div className="mx-auto max-w-7xl space-y-8 p-6 md:p-8">
        <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-8 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:to-slate-950">
          <div className="absolute right-0 top-0 h-28 w-28 translate-x-6 -translate-y-6 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <span className="material-symbols-outlined text-4xl">person</span>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                  Admin Profile
                </p>
                <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                  {displayName}
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Manage your admin account details and status.
                </p>
              </div>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
            Loading profile...
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
            {error}
          </div>
        ) : null}

        {!loading && !error && me ? (
          <>
            <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <StatCard title="Role" value={me.role} icon="badge" />
              <StatCard
                title="Status"
                value={me.is_active ? "Active" : "Inactive"}
                icon="verified_user"
              />
              <StatCard
                title="Member Since"
                value={new Date(me.created_at).toLocaleDateString()}
                icon="calendar_month"
              />
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-lg font-bold">Account Details</h2>
              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Full Name / Username
                  </p>
                  <div className="mt-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium dark:border-slate-800 dark:bg-slate-800/50">
                    {me.username || "Not set"}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Email
                  </p>
                  <div className="mt-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium dark:border-slate-800 dark:bg-slate-800/50">
                    {me.email}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Role
                  </p>
                  <div className="mt-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium uppercase dark:border-slate-800 dark:bg-slate-800/50">
                    {me.role}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Created At
                  </p>
                  <div className="mt-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium dark:border-slate-800 dark:bg-slate-800/50">
                    {formatDate(me.created_at)}
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : null}
      </div>
    </AdminShell>
  );
}
