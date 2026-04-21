"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { API_BASE } from "@/lib/apiBase";

type ActionItem = {
  action: string;
  label: string;
};

type MyApiEntry = {
  action: string;
  label: string;
  allowed: boolean;
};

const toEditSlug = (action: string) => action.replace(/_/g, "-");

export default function AdminAppCenterPage() {
  const router = useRouter();
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("No access token found.");
      setLoading(false);
      return;
    }

    fetch(`${API_BASE}/api/v3/permissions/my-api`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        const body = await res.text();
        if (!res.ok) {
          throw new Error(body || "Failed to load actions");
        }
        const parsed = JSON.parse(body) as { user_id: number; apis: MyApiEntry[] };
        const activeOnly = Array.isArray(parsed.apis)
          ? parsed.apis
              .filter((item) => item.allowed)
              .map((item) => ({
                action: item.action,
                label: item.label,
              }))
          : [];
        setActions(activeOnly);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load actions");
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredActions = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return actions;
    return actions.filter((item) => {
      return (
        item.action.toLowerCase().includes(keyword) ||
        item.label.toLowerCase().includes(keyword)
      );
    });
  }, [actions, search]);

  useEffect(() => {
    actions.slice(0, 24).forEach((item) => {
      router.prefetch(`/admin/app-center/edit/${toEditSlug(item.action)}`);
    });
  }, [actions, router]);

  return (
    <AdminShell>
      <section className="h-full min-h-full overflow-y-auto bg-background-light px-4 py-4 sm:px-6 sm:py-6 lg:px-8 dark:bg-background-dark">
        <div className="mx-auto w-full max-w-8xl">
          <section className="relative mb-6 overflow-hidden rounded-[13px] border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-primary p-5 text-white shadow-xl sm:p-8 dark:border-slate-800">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-12 left-0 h-32 w-32 rounded-full bg-primary-foreground/10 blur-3xl" />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur">
                  <span className="material-symbols-outlined text-sm">apps</span>
                  App Center
                </div>
                <h1 className="mt-4 text-3xl font-black tracking-tight text-white md:text-4xl">
                  App Center
                </h1>
                <p className="mt-2 max-w-3xl text-sm text-white/80 md:text-base">
                  Active conversion APIs from <span className="font-semibold text-white">/api/v3/permissions/my-api</span>, organized for fast launch, confident testing, and cleaner admin operations.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white backdrop-blur">
                Total: {filteredActions.length}
              </div>
            </div>
          </section>

          <div className="mb-5">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by action or label..."
              className="w-full rounded-xl border border-primary/10 bg-white px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-primary/20 dark:bg-slate-900"
              type="text"
            />
          </div>

          {loading ? (
            <div className="rounded-xl border border-primary/10 bg-primary/5 p-5 text-sm text-slate-500">
              Loading app actions...
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
              {error}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredActions.map((item) => {
                const editHref = `/admin/app-center/edit/${toEditSlug(item.action)}`;
                return (
                  <div
                    key={item.action}
                    className="rounded-xl border border-primary/10 bg-primary/5 p-5 shadow-sm"
                  >
                    <p className="text-lg font-bold">{item.label}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.action}</p>
                    <div className="mt-4 flex items-center gap-2">
                      <Link
                        href={editHref}
                        prefetch
                        onMouseEnter={() => router.prefetch(editHref)}
                        onFocus={() => router.prefetch(editHref)}
                        className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white"
                      >
                        Open Editor
                      </Link>
                    </div>
                  </div>
                );
              })}
              {filteredActions.length === 0 ? (
                <div className="rounded-xl border border-primary/10 bg-primary/5 p-5 text-sm text-slate-500">
                  No actions found.
                </div>
              ) : null}
            </div>
          )}
        </div>
      </section>
    </AdminShell>
  );
}
