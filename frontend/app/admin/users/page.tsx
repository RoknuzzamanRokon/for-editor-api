"use client";

import { useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000";

type UserItem = {
  id: number;
  email: string;
  username: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
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

    fetch(`${API_BASE}/api/v2/users`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        const body = await res.text();
        if (!res.ok) {
          throw new Error(body || "Failed to fetch users");
        }
        const parsed = JSON.parse(body) as UserItem[];
        setUsers(Array.isArray(parsed) ? parsed : []);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to fetch users");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return users;
    return users.filter((user) => {
      return (
        user.email.toLowerCase().includes(keyword) ||
        (user.username || "").toLowerCase().includes(keyword) ||
        user.role.toLowerCase().includes(keyword)
      );
    });
  }, [search, users]);

  return (
    <AdminShell>
      <section className="px-8 py-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black tracking-tight">Users</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Live list from <span className="font-semibold">/api/v2/users</span>
              </p>
            </div>
            <div className="rounded-lg border border-primary/10 bg-primary/5 px-4 py-2 text-sm font-semibold">
              Total: {filteredUsers.length}
            </div>
          </div>

          <div className="mb-4">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email, username, or role..."
              className="w-full rounded-xl border border-primary/10 bg-white px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-primary/20 dark:bg-slate-900"
              type="text"
            />
          </div>

          <div className="overflow-hidden rounded-xl border border-primary/10 bg-white shadow-sm dark:bg-slate-900">
            <table className="w-full text-left">
              <thead className="bg-primary/5 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Username</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Created At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/10">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-6 text-sm text-slate-500">
                      Loading users...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-6 text-sm text-red-600">
                      {error}
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-6 text-sm text-slate-500">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-primary/5">
                      <td className="px-6 py-4 text-sm font-bold">{user.id}</td>
                      <td className="px-6 py-4 text-sm">{user.email}</td>
                      <td className="px-6 py-4 text-sm">{user.username || "-"}</td>
                      <td className="px-6 py-4 text-sm">{user.role}</td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            user.is_active
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          }`}
                        >
                          {user.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {new Date(user.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </AdminShell>
  );
}
