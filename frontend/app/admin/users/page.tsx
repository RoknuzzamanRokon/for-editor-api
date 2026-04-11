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

type UserApiPermission = {
  action: string;
  label: string;
  route: string;
  method: string;
  allowed: boolean;
  points: number;
  last_used_at: string | null;
  success_rate: number;
  description: string;
};

type UserDetails = {
  id: number;
  email: string;
  username: string | null;
  role: string;
  position: string;
  is_active: boolean;
  created_at: string;
  last_login: string | null;
  last_active_at: string | null;
  points: {
    balance: number;
    total_topup: number;
    total_spent: number;
    total_refunded: number;
    last_points_activity_at: string | null;
  };
  conversions: {
    total: number;
    success: number;
    failed: number;
    processing: number;
    last_conversion_at: string | null;
  };
  active_apis: UserApiPermission[];
  api_permissions: UserApiPermission[];
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const [selectedUserDetails, setSelectedUserDetails] = useState<UserDetails | null>(null);
  const [form, setForm] = useState({
    email: "",
    password: "",
    username: "",
    role: "general_user",
  });

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

  const handleCreateUser = async () => {
    setCreateError("");
    setCreateSuccess("");

    if (!form.email || !form.password) {
      setCreateError("Email and password are required.");
      return;
    }

    try {
      setCreating(true);
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No access token found.");
      }

      const payload: {
        email: string;
        password: string;
        username?: string;
        role: string;
      } = {
        email: form.email,
        password: form.password,
        role: form.role,
      };
      if (form.username.trim()) {
        payload.username = form.username.trim();
      }

      const res = await fetch(`${API_BASE}/api/v2/users`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const body = await res.text();
      if (!res.ok) {
        throw new Error(body || "Failed to create user");
      }

      const created = JSON.parse(body) as UserItem;
      setUsers((prev) => [created, ...prev]);
      setCreateSuccess("User created successfully.");
      setForm({
        email: "",
        password: "",
        username: "",
        role: "general_user",
      });
      setShowCreate(false);
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setCreating(false);
    }
  };

  const handleOpenUserDetails = async (userId: number) => {
    setShowDetails(true);
    setDetailsLoading(true);
    setDetailsError("");
    setSelectedUserDetails(null);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No access token found.");
      }

      const res = await fetch(`${API_BASE}/api/v3/admin/check-users/${userId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const body = await res.text();
      if (!res.ok) {
        throw new Error(body || "Failed to fetch user details");
      }
      setSelectedUserDetails(JSON.parse(body) as UserDetails);
    } catch (err: unknown) {
      setDetailsError(err instanceof Error ? err.message : "Failed to fetch user details");
    } finally {
      setDetailsLoading(false);
    }
  };

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
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setCreateError("");
                  setCreateSuccess("");
                  setShowCreate(true);
                }}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white"
                type="button"
              >
                Add User
              </button>
              <div className="rounded-lg border border-primary/10 bg-primary/5 px-4 py-2 text-sm font-semibold">
                Total: {filteredUsers.length}
              </div>
            </div>
          </div>

          {createSuccess ? (
            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
              {createSuccess}
            </div>
          ) : null}

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
                    <tr
                      key={user.id}
                      className="cursor-pointer hover:bg-primary/5"
                      onClick={() => handleOpenUserDetails(user.id)}
                    >
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

      {showCreate ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl border border-primary/10 bg-white p-6 shadow-xl dark:bg-slate-900">
            <h3 className="text-lg font-bold">Create User</h3>
            <p className="mt-1 text-xs text-slate-500">POST /api/v2/users</p>

            {createError ? (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {createError}
              </div>
            ) : null}

            <div className="mt-4 space-y-3">
              <input
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                className="w-full rounded-lg border border-primary/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 dark:bg-slate-800"
                placeholder="Email"
                type="email"
              />
              <input
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                className="w-full rounded-lg border border-primary/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 dark:bg-slate-800"
                placeholder="Password"
                type="password"
              />
              <input
                value={form.username}
                onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
                className="w-full rounded-lg border border-primary/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 dark:bg-slate-800"
                placeholder="Username (optional)"
                type="text"
              />
              <select
                value={form.role}
                onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
                className="w-full rounded-lg border border-primary/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 dark:bg-slate-800"
              >
                <option value="general_user">general_user</option>
                <option value="admin_user">admin_user</option>
                <option value="demo_user">demo_user</option>
                <option value="super_user">super_user</option>
              </select>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowCreate(false)}
                className="rounded-lg border border-primary/10 px-4 py-2 text-sm font-semibold"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateUser}
                disabled={creating}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                type="button"
              >
                {creating ? "Creating..." : "Create User"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showDetails ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-auto rounded-xl border border-primary/10 bg-white p-6 shadow-xl dark:bg-slate-900">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold">User Details</h3>
                <p className="mt-1 text-xs text-slate-500">GET /api/v3/admin/check-users/{selectedUserDetails?.id ?? ""}</p>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="rounded-lg border border-primary/10 px-3 py-1.5 text-xs font-bold"
                type="button"
              >
                Close
              </button>
            </div>

            {detailsLoading ? (
              <div className="rounded-lg border border-primary/10 bg-primary/5 p-4 text-sm text-slate-500">
                Loading user details...
              </div>
            ) : detailsError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {detailsError}
              </div>
            ) : selectedUserDetails ? (
              <div className="space-y-5">
                <section className="rounded-lg border border-primary/10 bg-primary/5 p-4">
                  <h4 className="mb-3 text-sm font-bold uppercase tracking-wider">Profile</h4>
                  <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                    <p><span className="font-semibold">ID:</span> {selectedUserDetails.id}</p>
                    <p><span className="font-semibold">Email:</span> {selectedUserDetails.email}</p>
                    <p><span className="font-semibold">Username:</span> {selectedUserDetails.username || "-"}</p>
                    <p><span className="font-semibold">Role:</span> {selectedUserDetails.role}</p>
                    <p><span className="font-semibold">Position:</span> {selectedUserDetails.position}</p>
                    <p><span className="font-semibold">Status:</span> {selectedUserDetails.is_active ? "Active" : "Inactive"}</p>
                    <p><span className="font-semibold">Created:</span> {new Date(selectedUserDetails.created_at).toLocaleString()}</p>
                    <p><span className="font-semibold">Last Login:</span> {selectedUserDetails.last_login ? new Date(selectedUserDetails.last_login).toLocaleString() : "N/A"}</p>
                    <p><span className="font-semibold">Last Active:</span> {selectedUserDetails.last_active_at ? new Date(selectedUserDetails.last_active_at).toLocaleString() : "N/A"}</p>
                  </div>
                </section>

                <section className="rounded-lg border border-primary/10 bg-primary/5 p-4">
                  <h4 className="mb-3 text-sm font-bold uppercase tracking-wider">Points</h4>
                  <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                    <p><span className="font-semibold">Balance:</span> {selectedUserDetails.points.balance}</p>
                    <p><span className="font-semibold">Total Topup:</span> {selectedUserDetails.points.total_topup}</p>
                    <p><span className="font-semibold">Total Spent:</span> {selectedUserDetails.points.total_spent}</p>
                    <p><span className="font-semibold">Total Refunded:</span> {selectedUserDetails.points.total_refunded}</p>
                    <p><span className="font-semibold">Last Points Activity:</span> {selectedUserDetails.points.last_points_activity_at ? new Date(selectedUserDetails.points.last_points_activity_at).toLocaleString() : "N/A"}</p>
                  </div>
                </section>

                <section className="rounded-lg border border-primary/10 bg-primary/5 p-4">
                  <h4 className="mb-3 text-sm font-bold uppercase tracking-wider">Conversions</h4>
                  <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                    <p><span className="font-semibold">Total:</span> {selectedUserDetails.conversions.total}</p>
                    <p><span className="font-semibold">Success:</span> {selectedUserDetails.conversions.success}</p>
                    <p><span className="font-semibold">Failed:</span> {selectedUserDetails.conversions.failed}</p>
                    <p><span className="font-semibold">Processing:</span> {selectedUserDetails.conversions.processing}</p>
                    <p><span className="font-semibold">Last Conversion:</span> {selectedUserDetails.conversions.last_conversion_at ? new Date(selectedUserDetails.conversions.last_conversion_at).toLocaleString() : "N/A"}</p>
                  </div>
                </section>

                <section className="rounded-lg border border-primary/10 bg-primary/5 p-4">
                  <h4 className="mb-3 text-sm font-bold uppercase tracking-wider">Active APIs</h4>
                  {selectedUserDetails.active_apis.length === 0 ? (
                    <p className="text-sm text-slate-500">No active APIs.</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedUserDetails.active_apis.map((api) => (
                        <div key={api.action} className="rounded border border-primary/10 bg-white px-3 py-2 text-sm dark:bg-slate-800">
                          <p className="font-semibold">{api.label}</p>
                          <p className="text-xs text-slate-500">{api.method} {api.route}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section className="rounded-lg border border-primary/10 bg-primary/5 p-4">
                  <h4 className="mb-3 text-sm font-bold uppercase tracking-wider">All API Permissions</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="text-xs uppercase tracking-wider text-slate-500">
                        <tr>
                          <th className="px-3 py-2">Action</th>
                          <th className="px-3 py-2">Allowed</th>
                          <th className="px-3 py-2">Success Rate</th>
                          <th className="px-3 py-2">Last Used</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-primary/10">
                        {selectedUserDetails.api_permissions.map((api) => (
                          <tr key={api.action}>
                            <td className="px-3 py-2 text-sm">{api.label}</td>
                            <td className="px-3 py-2 text-sm">{api.allowed ? "Yes" : "No"}</td>
                            <td className="px-3 py-2 text-sm">{api.success_rate.toFixed(1)}%</td>
                            <td className="px-3 py-2 text-sm">
                              {api.last_used_at ? new Date(api.last_used_at).toLocaleString() : "Never"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </AdminShell>
  );
}
