"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatRoleLabel } from "@/lib/roleLabel";
import { API_BASE } from "@/lib/apiBase";
import { formatProfileName } from "@/lib/profileName";

type MeResponse = {
  id: number;
  email: string;
  username?: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
  demo_expires_at?: string | null;
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
    allowed: boolean;
  }>;
};

function formatDate(value?: string | null) {
  if (!value) return "Not configured";
  return new Date(value).toLocaleString();
}

function getApiIcon(action: string) {
  if (action.includes("pdf")) return "picture_as_pdf";
  if (action.includes("doc") || action.includes("docx")) return "description";
  if (action.includes("excel") || action.includes("xlsx")) return "table_view";
  return "api";
}

function getApiColor(action: string) {
  if (action.includes("pdf") && action.includes("excel")) {
    return "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300";
  }
  if (action.includes("doc") || action.includes("docx")) {
    return "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300";
  }
  if (action.includes("pdf")) {
    return "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300";
  }
  return "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300";
}

function getStatusBadge(status: string) {
  const value = status.toLowerCase();

  if (value === "success" || value === "active" || value === "valid") {
    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300";
  }

  if (value === "pending") {
    return "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300";
  }

  if (value === "failed" || value === "inactive" || value === "expired") {
    return "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300";
  }

  return "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300";
}

function toEditSlug(action: string) {
  return action.replace(/_/g, "-");
}

function buildTrialCountdown(expiresAt?: string | null, nowMs = Date.now()) {
  if (!expiresAt) return null;

  const expiryMs = new Date(expiresAt).getTime();
  if (Number.isNaN(expiryMs)) return null;

  const remainingSeconds = Math.max(
    0,
    Math.floor((expiryMs - nowMs) / 1000),
  );
  const days = Math.floor(remainingSeconds / 86400);
  const hours = Math.floor((remainingSeconds % 86400) / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;

  return {
    isExpired: expiryMs <= nowMs,
    parts: [
      { label: "Days", value: String(days).padStart(2, "0") },
      { label: "Hours", value: String(hours).padStart(2, "0") },
      { label: "Min", value: String(minutes).padStart(2, "0") },
      { label: "Sec", value: String(seconds).padStart(2, "0") },
    ],
  };
}

function StatCard({
  title,
  value,
  subtext,
  icon,
}: {
  title: string;
  value: string | number;
  subtext?: string;
  icon: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
      <div className="absolute right-0 top-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-primary/10 blur-2xl" />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {value}
          </p>
          {subtext ? (
            <p className="mt-1 text-xs text-slate-500">{subtext}</p>
          ) : null}
        </div>

        <div className="rounded-2xl bg-primary/10 p-3 text-primary">
          <span className="material-symbols-outlined">{icon}</span>
        </div>
      </div>
    </div>
  );
}

export default function DashboardProfilePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [me, setMe] = useState<MeResponse | null>(null);
  const [myPoints, setMyPoints] = useState<MyPointResponse | null>(null);
  const [myApis, setMyApis] = useState<MyApiResponse | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());

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

  useEffect(() => {
    if (me?.role !== "demo_user" || !me.demo_expires_at) return;

    setNowMs(Date.now());
    const timer = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, [me?.demo_expires_at, me?.role]);

  const displayName = useMemo(() => {
    if (!me) return "User";
    return formatProfileName(me.username, me.email);
  }, [me]);

  const activeApis = useMemo(
    () => (myApis?.apis ?? []).filter((api) => api.allowed),
    [myApis],
  );

  const isDemoUser = me?.role === "demo_user";
  const trialCountdown = useMemo(
    () =>
      isDemoUser ? buildTrialCountdown(me?.demo_expires_at, nowMs) : null,
    [isDemoUser, me?.demo_expires_at, nowMs],
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-8xl p-4 sm:p-6 lg:p-8">
        <div className="rounded-[13px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 animate-pulse rounded-2xl bg-primary/20" />
            <div className="space-y-2">
              <div className="h-4 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-3 w-64 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                <div className="mt-3 h-8 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !me || !myPoints || !myApis) {
    return (
      <div className="mx-auto max-w-8xl p-4 sm:p-6 lg:p-8">
        <div className="rounded-[13px] border border-rose-200 bg-rose-50 p-6 text-rose-700 sm:p-8 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined">error</span>
            <p className="font-semibold">
              {error || "Profile data not available"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-8xl space-y-6 p-4 sm:space-y-8 sm:p-6 lg:p-8">
      <section className="app-hero-card relative overflow-hidden rounded-[13px] border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-primary p-5 text-white shadow-xl sm:p-8 dark:border-slate-800">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-12 left-0 h-32 w-32 rounded-full bg-primary-foreground/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
              <span className="material-symbols-outlined text-base">
                verified_user
              </span>
              Live account overview
            </div>

            <h1 className="text-3xl font-black tracking-tight md:text-5xl">
              {displayName}
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-white/80 md:text-base">
              Manage your profile, point balance, API access, and recent
              activity from one clean dashboard.
            </p>
          </div>

          {isDemoUser ? (
            <div className="w-full rounded-2xl border border-white/20 bg-white/10 p-4 shadow-lg backdrop-blur lg:w-[31rem]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">
                    Demo Trial Limit
                  </p>
                  <h2 className="mt-1 text-xl font-black tracking-tight">
                    {trialCountdown?.isExpired
                      ? "Trial expired"
                      : "Time remaining"}
                  </h2>
                </div>
                <span className="material-symbols-outlined rounded-2xl border border-white/15 bg-white/10 p-3 text-white/85">
                  hourglass_top
                </span>
              </div>

              {trialCountdown ? (
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {trialCountdown.parts.map((part) => (
                    <div
                      key={part.label}
                      className="min-h-[74px] rounded-xl border border-white/15 bg-slate-950/20 px-2 py-3 text-center"
                    >
                      <p className="font-mono text-2xl font-black leading-none tracking-normal text-white sm:text-3xl">
                        {part.value}
                      </p>
                      <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/65">
                        {part.label}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-white/15 bg-slate-950/20 px-4 py-3 text-sm font-semibold text-white/80">
                  Trial expiration is not configured.
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-white/80">
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
                  Expires {formatDate(me.demo_expires_at)}
                </span>
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
                  {activeApis.length} trial APIs
                </span>
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
                  {myPoints.available_points} points
                </span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-white bg-white/10 px-4 py-3 backdrop-blur">
                <p className="text-xs uppercase tracking-wider text-white/70">
                  Role
                </p>
                <p className="mt-1 text-sm font-bold">
                  {formatRoleLabel(me.role)}
                </p>
              </div>
              <div className="rounded-2xl border border-white bg-white/10 px-4 py-3 backdrop-blur">
                <p className="text-xs uppercase tracking-wider text-white/70">
                  Status
                </p>
                <p className="mt-1 text-sm font-bold">
                  {me.is_active ? "Active" : "Inactive"}
                </p>
              </div>
              <div className="rounded-2xl border border-white bg-white/10 px-4 py-3 backdrop-blur">
                <p className="text-xs uppercase tracking-wider text-white/70">
                  Points
                </p>
                <p className="mt-1 text-sm font-bold">
                  {myPoints.available_points}
                </p>
              </div>
              <div className="rounded-2xl border border-white bg-white/10 px-4 py-3 backdrop-blur">
                <p className="text-xs uppercase tracking-wider text-white/70">
                  APIs
                </p>
                <p className="mt-1 text-sm font-bold">{activeApis.length}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Available Points"
          value={myPoints.available_points}
          subtext="Ready for your next conversion"
          icon="toll"
        />
        <StatCard
          title="Active APIs"
          value={activeApis.length}
          subtext="Currently enabled for your account"
          icon="hub"
        />
        <StatCard
          title="Account Status"
          value={me.is_active ? "Active" : "Inactive"}
          subtext="Your current profile state"
          icon="verified"
        />
        <StatCard
          title="Point Entries"
          value={myPoints.total}
          subtext="Tracked usage records"
          icon="history"
        />
      </section>

      <section className="grid grid-cols-1 gap-8 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-4">
          <div className="rounded-[13px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <span className="material-symbols-outlined">person</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Personal Information
                </h3>
                <p className="text-sm text-slate-500">
                  Your live backend account details
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  User ID
                </p>
                <p className="mt-1 text-sm font-semibold">{me.id}</p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Username
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {formatProfileName(me.username, "-")}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Email
                </p>
                <p className="mt-1 break-all text-sm font-semibold">
                  {me.email}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Joined
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {formatDate(me.created_at)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[13px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <span className="material-symbols-outlined">schedule</span>
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                  Point Status
                </h4>
                <p className="text-sm text-slate-500">
                  Expiration and availability
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Available Points
                </p>
                <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
                  {myPoints.available_points}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Point Status
                </p>
                <span
                  className={`mt-2 inline-flex rounded-full px-3 py-1.5 text-sm font-semibold ${getStatusBadge(
                    myPoints.point_status,
                  )}`}
                >
                  {myPoints.point_status}
                </span>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Expiry Status
                </p>
                <span
                  className={`mt-2 inline-flex rounded-full px-3 py-1.5 text-sm font-semibold ${getStatusBadge(
                    myPoints.expiry_status,
                  )}`}
                >
                  {myPoints.expiry_status.replace(/_/g, " ")}
                </span>
              </div>

              {myPoints.expires_at && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/50 dark:bg-amber-900/20">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-amber-600 dark:text-amber-400">
                      warning
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                        Points Expiration
                      </p>
                      <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                        Your points will expire on{" "}
                        <span className="font-bold">
                          {formatDate(myPoints.expires_at)}
                        </span>
                      </p>
                      <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                        {(() => {
                          const now = new Date();
                          const expiry = new Date(myPoints.expires_at);
                          const days = Math.ceil(
                            (expiry.getTime() - now.getTime()) /
                              (1000 * 60 * 60 * 24),
                          );
                          if (days <= 0) return "Expired";
                          if (days === 1) return "Expires tomorrow";
                          if (days <= 7)
                            return `Expires in ${days} days`;
                          return `${days} days remaining`;
                        })()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {!myPoints.expires_at && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800/50 dark:bg-emerald-900/20">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400">
                      check_circle
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                        No Expiration
                      </p>
                      <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">
                        Your points do not have an expiration date
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6 xl:col-span-8">
          <div className="overflow-hidden rounded-[13px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  My Active APIs
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Services currently available for your account
                </p>
              </div>
              <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {activeApis.length} total
              </div>
            </div>

            <div className="p-6">
              {activeApis.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700">
                  No active API permission found.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {activeApis.map((item) => (
                    <Link
                      key={item.action}
                      href={`/dashboard/app-center/edit/${toEditSlug(item.action)}`}
                      className="group block rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:border-slate-800 dark:from-slate-900 dark:to-slate-800/60 dark:focus-visible:ring-offset-slate-900"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div
                          className={`rounded-2xl p-3 ${getApiColor(item.action)}`}
                        >
                          <span className="material-symbols-outlined">
                            {getApiIcon(item.action)}
                          </span>
                        </div>

                        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                          Enabled
                        </span>
                      </div>

                      <div className="mt-4">
                        <p className="text-base font-bold text-slate-900 dark:text-white">
                          {item.label}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {item.action}
                        </p>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-2">
                        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                          Ready to use
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 transition-colors group-hover:text-primary dark:text-slate-400 dark:group-hover:text-primary">
                          Open
                          <span className="material-symbols-outlined text-sm">
                            arrow_forward
                          </span>
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-[13px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-3 border-b border-slate-100 p-6 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Point History
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Total entries: {myPoints.total}
                </p>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <span className="material-symbols-outlined text-sm">
                  schedule
                </span>
                Live usage records
              </div>
            </div>

            <div className="max-h-[560px] overflow-y-auto overflow-x-auto">
              {myPoints.history.length === 0 ? (
                <div className="p-8 text-sm text-slate-500">
                  No point history found.
                </div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-800/50">
                      <th className="px-6 py-4">Action</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Date</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {myPoints.history.map((entry) => (
                      <tr
                        key={entry.id}
                        className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {entry.action}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-500">
                              Request ID: {entry.request_id}
                            </p>
                          </div>
                        </td>

                        <td className="px-6 py-4 font-semibold">
                          {entry.amount}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusBadge(
                              entry.status,
                            )}`}
                          >
                            {entry.status}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                          {formatDate(entry.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
