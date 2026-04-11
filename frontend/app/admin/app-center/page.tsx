"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000";

type ActionItem = {
  action: string;
  label: string;
};

const toEditSlug = (action: string) => action.replaceAll("_", "-");

export default function AdminAppCenterPage() {
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

    fetch(`${API_BASE}/api/v3/permissions/actions`, {
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
        const parsed = JSON.parse(body) as ActionItem[];
        setActions(Array.isArray(parsed) ? parsed : []);
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

  return (
    <AdminShell>
      <section className="h-full min-h-full overflow-y-auto bg-background-light px-8 py-6 dark:bg-background-dark">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black tracking-tight">App Center</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Conversion actions from <span className="font-semibold">/api/v3/permissions/actions</span>
              </p>
            </div>
            <div className="rounded-lg border border-primary/10 bg-primary/5 px-4 py-2 text-sm font-semibold">
              Total: {filteredActions.length}
            </div>
          </div>

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
