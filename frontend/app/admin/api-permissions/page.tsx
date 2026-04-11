"use client";

import { useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000";

type ActionItem = {
  action: string;
  label: string;
};

type ApiPermissionItem = {
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
  active_apis: ApiPermissionItem[];
  api_permissions: ApiPermissionItem[];
};

type PermissionListResponse = {
  user_id: number;
  permissions: Array<{
    action: string;
    is_allowed: boolean;
  }>;
};

export default function AdminApiPermissionsPage() {
  const [userIdInput, setUserIdInput] = useState("");
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [details, setDetails] = useState<UserDetails | null>(null);
  const [loadingActions, setLoadingActions] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [savingAction, setSavingAction] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const getToken = () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      throw new Error("No access token found.");
    }
    return token;
  };

  const loadActions = async () => {
    setLoadingActions(true);
    setError("");
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/v3/permissions/actions`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await res.text();
      if (!res.ok) {
        throw new Error(body || "Failed to load action list");
      }
      const parsed = JSON.parse(body) as ActionItem[];
      setActions(Array.isArray(parsed) ? parsed : []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load action list");
    } finally {
      setLoadingActions(false);
    }
  };

  const loadUserDetails = async (userId: string) => {
    setLoadingDetails(true);
    setError("");
    setSuccess("");
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/v3/admin/check-users/${userId}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await res.text();
      if (!res.ok) {
        throw new Error(body || "Failed to load user details");
      }
      setDetails(JSON.parse(body) as UserDetails);
    } catch (err: unknown) {
      setDetails(null);
      setError(err instanceof Error ? err.message : "Failed to load user details");
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    void loadActions();
  }, []);

  const handleLoadUser = async () => {
    if (!userIdInput.trim()) {
      setError("Enter a user ID first.");
      return;
    }
    await loadUserDetails(userIdInput.trim());
  };

  const handleTogglePermission = async (item: ApiPermissionItem) => {
    if (!details) return;
    setError("");
    setSuccess("");
    setSavingAction(item.action);
    const nextAllowed = !item.allowed;

    try {
      const token = getToken();
      const res = await fetch(
        `${API_BASE}/api/v3/permissions/users/${details.id}/permissions/${item.action}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ is_allowed: nextAllowed }),
        },
      );
      const body = await res.text();
      if (!res.ok) {
        throw new Error(body || "Failed to update permission");
      }

      const parsed = JSON.parse(body) as PermissionListResponse;
      const latestMap = new Map(parsed.permissions.map((p) => [p.action, p.is_allowed]));

      setDetails((prev) => {
        if (!prev) return prev;
        const nextPermissions = prev.api_permissions.map((p) => ({
          ...p,
          allowed: latestMap.has(p.action) ? Boolean(latestMap.get(p.action)) : p.allowed,
        }));
        return {
          ...prev,
          api_permissions: nextPermissions,
          active_apis: nextPermissions.filter((p) => p.allowed),
        };
      });

      setSuccess(`Permission updated for "${item.action}"`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update permission");
    } finally {
      setSavingAction(null);
    }
  };

  const actionLookup = useMemo(() => {
    return new Map(actions.map((a) => [a.action, a.label]));
  }, [actions]);

  return (
    <AdminShell>
      <section className="px-8 py-6">
        <div className="mx-auto max-w-7xl space-y-5">
          <div>
            <h1 className="text-3xl font-black tracking-tight">API Permissions</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Check user details and update API permissions using v3 admin/permissions APIs.
            </p>
          </div>

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}
          {success ? (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
              {success}
            </div>
          ) : null}

          <div className="rounded-xl border border-primary/10 bg-primary/5 p-4">
            <div className="flex flex-wrap items-end gap-3">
              <div className="min-w-[220px] flex-1">
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  User ID
                </label>
                <input
                  value={userIdInput}
                  onChange={(e) => setUserIdInput(e.target.value)}
                  placeholder="e.g. 3"
                  className="w-full rounded-lg border border-primary/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 dark:bg-slate-900"
                  type="number"
                />
              </div>
              <button
                onClick={handleLoadUser}
                disabled={loadingDetails}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                type="button"
              >
                {loadingDetails ? "Loading..." : "Check User"}
              </button>
              <button
                onClick={() => void loadActions()}
                disabled={loadingActions}
                className="rounded-lg border border-primary/20 bg-white px-4 py-2 text-sm font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-900 dark:text-slate-100"
                type="button"
              >
                {loadingActions ? "Refreshing..." : "Refresh Actions"}
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-primary/10 bg-primary/5 p-4">
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wider">Action List</h2>
            {loadingActions ? (
              <p className="text-sm text-slate-500">Loading actions...</p>
            ) : actions.length === 0 ? (
              <p className="text-sm text-slate-500">No actions found.</p>
            ) : (
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                {actions.map((item) => (
                  <div key={item.action} className="rounded border border-primary/10 bg-white px-3 py-2 text-sm dark:bg-slate-900">
                    <p className="font-semibold">{item.label}</p>
                    <p className="text-xs text-slate-500">{item.action}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {details ? (
            <>
              <div className="rounded-xl border border-primary/10 bg-primary/5 p-4">
                <h2 className="mb-3 text-sm font-bold uppercase tracking-wider">User Details</h2>
                <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2 lg:grid-cols-3">
                  <p><span className="font-semibold">ID:</span> {details.id}</p>
                  <p><span className="font-semibold">Email:</span> {details.email}</p>
                  <p><span className="font-semibold">Username:</span> {details.username || "-"}</p>
                  <p><span className="font-semibold">Role:</span> {details.role}</p>
                  <p><span className="font-semibold">Position:</span> {details.position}</p>
                  <p><span className="font-semibold">Status:</span> {details.is_active ? "Active" : "Inactive"}</p>
                  <p><span className="font-semibold">Created:</span> {new Date(details.created_at).toLocaleString()}</p>
                  <p><span className="font-semibold">Last Login:</span> {details.last_login ? new Date(details.last_login).toLocaleString() : "N/A"}</p>
                  <p><span className="font-semibold">Last Active:</span> {details.last_active_at ? new Date(details.last_active_at).toLocaleString() : "N/A"}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-xl border border-primary/10 bg-primary/5 p-4">
                  <h3 className="mb-2 text-sm font-bold uppercase tracking-wider">Points</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-semibold">Balance:</span> {details.points.balance}</p>
                    <p><span className="font-semibold">Topup:</span> {details.points.total_topup}</p>
                    <p><span className="font-semibold">Spent:</span> {details.points.total_spent}</p>
                    <p><span className="font-semibold">Refunded:</span> {details.points.total_refunded}</p>
                    <p><span className="font-semibold">Last Activity:</span> {details.points.last_points_activity_at ? new Date(details.points.last_points_activity_at).toLocaleString() : "N/A"}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-primary/10 bg-primary/5 p-4">
                  <h3 className="mb-2 text-sm font-bold uppercase tracking-wider">Conversions</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-semibold">Total:</span> {details.conversions.total}</p>
                    <p><span className="font-semibold">Success:</span> {details.conversions.success}</p>
                    <p><span className="font-semibold">Failed:</span> {details.conversions.failed}</p>
                    <p><span className="font-semibold">Processing:</span> {details.conversions.processing}</p>
                    <p><span className="font-semibold">Last Conversion:</span> {details.conversions.last_conversion_at ? new Date(details.conversions.last_conversion_at).toLocaleString() : "N/A"}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-primary/10 bg-primary/5 p-4">
                <h3 className="mb-2 text-sm font-bold uppercase tracking-wider">
                  API Permissions ({details.api_permissions.length})
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="text-xs uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="px-3 py-2">API</th>
                        <th className="px-3 py-2">Allowed</th>
                        <th className="px-3 py-2">Points</th>
                        <th className="px-3 py-2">Success Rate</th>
                        <th className="px-3 py-2">Last Used</th>
                        <th className="px-3 py-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-primary/10">
                      {details.api_permissions.map((item) => (
                        <tr key={item.action}>
                          <td className="px-3 py-2 text-sm">
                            <p className="font-semibold">{actionLookup.get(item.action) || item.label}</p>
                            <p className="text-xs text-slate-500">{item.action}</p>
                          </td>
                          <td className="px-3 py-2 text-sm">
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                                item.allowed
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              }`}
                            >
                              {item.allowed ? "Yes" : "No"}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-sm">{item.points}</td>
                          <td className="px-3 py-2 text-sm">{item.success_rate.toFixed(1)}%</td>
                          <td className="px-3 py-2 text-sm">
                            {item.last_used_at ? new Date(item.last_used_at).toLocaleString() : "Never"}
                          </td>
                          <td className="px-3 py-2 text-right">
                            <button
                              onClick={() => void handleTogglePermission(item)}
                              disabled={savingAction === item.action}
                              className="rounded-lg border border-primary/20 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-900 dark:text-slate-100"
                              type="button"
                            >
                              {savingAction === item.action
                                ? "Saving..."
                                : item.allowed
                                  ? "Disable"
                                  : "Enable"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </section>
    </AdminShell>
  );
}
