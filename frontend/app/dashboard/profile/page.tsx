"use client";

import { useEffect, useMemo, useState } from "react";

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

type MyApiResponse = {
  user_id: number;
  apis: Array<{
    action: string;
    label: string;
  }>;
};

export default function DashboardProfilePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [me, setMe] = useState<MeResponse | null>(null);
  const [myPoints, setMyPoints] = useState<MyPointResponse | null>(null);
  const [myApis, setMyApis] = useState<MyApiResponse | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("No access token found");
      setLoading(false);
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch(`${API_BASE}/api/v2/auth/me`, { headers }),
      fetch(`${API_BASE}/api/v3/points/my-point`, { headers }),
      fetch(`${API_BASE}/api/v3/permissions/my-api`, { headers }),
    ])
      .then(async ([meRes, pointRes, apiRes]) => {
        if (!meRes.ok || !pointRes.ok || !apiRes.ok) {
          throw new Error("Failed to load profile data");
        }

        const [meData, pointData, apiData] = await Promise.all([
          meRes.json() as Promise<MeResponse>,
          pointRes.json() as Promise<MyPointResponse>,
          apiRes.json() as Promise<MyApiResponse>,
        ]);

        setMe(meData);
        setMyPoints(pointData);
        setMyApis(apiData);
      })
      .catch((err: unknown) => {
        setError(
          err instanceof Error ? err.message : "Failed to load profile data",
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const displayName = useMemo(() => {
    if (!me) return "User";
    return me.username || me.email;
  }, [me]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl p-8">
        <p className="text-sm text-slate-500">Loading profile...</p>
      </div>
    );
  }

  if (error || !me || !myPoints || !myApis) {
    return (
      <div className="mx-auto max-w-7xl p-8">
        <p className="text-sm text-red-600">
          {error || "Profile data not available"}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-8">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">
          Welcome back, {displayName}
        </h2>
        <p className="mt-1 text-slate-500">
          Your account and API profile from live backend data.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-medium text-slate-500">Role</p>
          <p className="mt-1 text-2xl font-bold">{me.role}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-medium text-slate-500">Account Status</p>
          <p className="mt-1 text-2xl font-bold">
            {me.is_active ? "active" : "inactive"}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-medium text-slate-500">Available Points</p>
          <p className="mt-1 text-2xl font-bold">{myPoints.available_points}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-medium text-slate-500">Active APIs</p>
          <p className="mt-1 text-2xl font-bold">{myApis.apis.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-bold">Personal Information</h3>
            <div className="mt-4 space-y-3 text-sm">
              <p>
                <span className="font-semibold">User ID:</span> {me.id}
              </p>
              <p>
                <span className="font-semibold">Username:</span>{" "}
                {me.username || "-"}
              </p>
              <p>
                <span className="font-semibold">Email:</span> {me.email}
              </p>
              <p>
                <span className="font-semibold">Joined:</span>{" "}
                {new Date(me.created_at).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h4 className="font-bold">Point Status</h4>
            <p className="mt-2 text-sm text-slate-500">
              Current: {myPoints.point_status} | Expiry:{" "}
              {myPoints.expiry_status}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Expires At:{" "}
              {myPoints.expires_at
                ? new Date(myPoints.expires_at).toLocaleString()
                : "Not configured"}
            </p>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-100 p-6 dark:border-slate-800">
              <h3 className="text-lg font-bold">My Active APIs</h3>
            </div>
            <div className="p-6">
              {myApis.apis.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No active API permission found.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {myApis.apis.map((item) => (
                    <div
                      key={item.action}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-800/40"
                    >
                      <p className="font-semibold">{item.label}</p>
                      <p className="text-xs text-slate-500">{item.action}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-100 p-6 dark:border-slate-800">
              <h3 className="text-lg font-bold">Point History</h3>
              <p className="mt-1 text-xs text-slate-500">
                Total entries: {myPoints.total}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-800/50">
                    <th className="px-6 py-3">Action</th>
                    <th className="px-6 py-3">Amount</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {myPoints.history.map((entry) => (
                    <tr key={entry.id}>
                      <td className="px-6 py-4">{entry.action}</td>
                      <td className="px-6 py-4">{entry.amount}</td>
                      <td className="px-6 py-4">{entry.status}</td>
                      <td className="px-6 py-4">
                        {new Date(entry.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {myPoints.history.length === 0 && (
                <div className="p-6 text-sm text-slate-500">
                  No point history found.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
