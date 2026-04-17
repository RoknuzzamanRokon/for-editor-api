"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://127.0.0.1:8000";

const AVATARS = [
  "account_circle",
  "face",
  "person",
  "sentiment_satisfied",
  "mood",
  "supervised_user_circle",
  "manage_accounts",
  "engineering",
  "support_agent",
  "psychology",
] as const;

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

type MyApiEntry = {
  action: string;
  label: string;
  route?: string;
  method?: string;
  allowed: boolean;
};

type MyApiResponse = {
  user_id: number;
  apis: MyApiEntry[];
};

type ProfileState = {
  me: MeResponse | null;
  points: MyPointResponse | null;
  apis: MyApiEntry[];
  loading: boolean;
  error: string;
  pointsError: string;
  apisError: string;
};

function formatDate(value?: string | null, fallback = "Not available") {
  if (!value) return fallback;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function capitalizeFirstLetter(value: string) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getApiIcon(action: string) {
  if (action.includes("pdf")) return "picture_as_pdf";
  if (action.includes("doc")) return "description";
  if (action.includes("excel") || action.includes("xlsx")) return "table_view";
  if (action.includes("image")) return "image";
  return "api";
}

async function fetchJson<T>(
  url: string,
  token: string,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    signal,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function SectionKicker({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-white/45 text-primary shadow-[0_0_25px_rgba(59,130,246,0.10)] backdrop-blur-xl dark:border-cyan-300/10 dark:bg-white/5 dark:shadow-[0_0_28px_rgba(59,130,246,0.14)]">
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
          {title}
        </p>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          {description}
        </p>
      </div>
    </div>
  );
}

function ProfileLine({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="grid gap-2 border-b border-slate-200/70 py-4 last:border-b-0 dark:border-white/10 md:grid-cols-[180px_minmax(0,1fr)]">
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p
        className={`text-sm font-semibold text-slate-900 dark:text-white ${
          mono ? "break-all font-mono text-[13px]" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function SignalMetric({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="relative min-w-0 overflow-hidden rounded-[24px] border border-white/35 bg-white/40 px-4 py-4 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
      <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-primary/0 via-primary/70 to-primary/0" />
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-primary">{icon}</span>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <p className="truncate text-base font-black text-slate-900 dark:text-white">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] ${
        active
          ? "border border-emerald-400/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
          : "border border-amber-400/25 bg-amber-500/10 text-amber-600 dark:text-amber-300"
      }`}
    >
      <span className="material-symbols-outlined text-sm">
        {active ? "verified" : "pause_circle"}
      </span>
      {active ? "System Active" : "System Paused"}
    </span>
  );
}

function AvatarPicker({
  selectedAvatar,
  onSelect,
}: {
  selectedAvatar: string;
  onSelect: (icon: string) => void;
}) {
  return (
    <div className="mt-8 grid grid-cols-4 gap-3 sm:grid-cols-5">
      {AVATARS.map((icon) => {
        const active = selectedAvatar === icon;

        return (
          <button
            key={icon}
            type="button"
            onClick={() => onSelect(icon)}
            aria-pressed={active}
            className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition-all ${
              active
                ? "border-primary bg-primary/12 text-primary shadow-[0_0_24px_rgba(59,130,246,0.22)]"
                : "border-white/35 bg-white/45 text-slate-500 hover:border-primary/40 hover:text-primary dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-400"
            }`}
          >
            <span className="material-symbols-outlined text-2xl">{icon}</span>
          </button>
        );
      })}
    </div>
  );
}

function TransactionTable({ points }: { points: MyPointResponse | null }) {
  if (!points) {
    return (
      <p className="mt-8 text-sm text-slate-400 dark:text-slate-500">
        Points data is not available right now.
      </p>
    );
  }

  return (
    <>
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SignalMetric
          icon="account_balance_wallet"
          label="Balance"
          value={String(points.available_points)}
        />
        <SignalMetric
          icon="check_circle"
          label="Status"
          value={points.point_status}
        />
        <SignalMetric
          icon="schedule"
          label="Expiry"
          value={points.expiry_status.replace(/_/g, " ")}
        />
        <SignalMetric
          icon="receipt_long"
          label="Transactions"
          value={String(points.total)}
        />
      </div>

      <div className="mt-8 overflow-hidden rounded-[28px] border border-white/35 bg-white/30 backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.03]">
        <div className="border-b border-slate-200/70 px-4 py-3 dark:border-white/10">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            Recent History
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200/70 dark:border-white/5">
                <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Action
                </th>
                <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Amount
                </th>
                <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Status
                </th>
                <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Date
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200/70 dark:divide-white/5">
              {points.history.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-slate-400 dark:text-slate-500"
                  >
                    No transactions yet.
                  </td>
                </tr>
              ) : (
                points.history.map((entry) => (
                  <tr
                    key={entry.id}
                    className="hover:bg-slate-100/60 dark:hover:bg-white/5"
                  >
                    <td className="px-4 py-2.5 font-medium text-slate-800 dark:text-slate-100">
                      {entry.action}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`font-bold ${
                          entry.amount >= 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {entry.amount >= 0 ? "+" : ""}
                        {entry.amount}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          entry.status === "success"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                            : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300"
                        }`}
                      >
                        {entry.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">
                      {formatDate(entry.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default function AdminProfilePage() {
  const [state, setState] = useState<ProfileState>({
    me: null,
    points: null,
    apis: [],
    loading: true,
    error: "",
    pointsError: "",
    apisError: "",
  });

  const [selectedAvatar, setSelectedAvatar] = useState("account_circle");

  useEffect(() => {
    const saved = window.localStorage.getItem("admin_avatar");
    if (saved) setSelectedAvatar(saved);
  }, []);

  useEffect(() => {
    const token = window.localStorage.getItem("access_token");

    if (!token) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "No access token found",
        apis: [],
      }));
      return;
    }

    const accessToken = token;

    const controller = new AbortController();

    async function loadProfile() {
      try {
        setState((prev) => ({
          ...prev,
          loading: true,
          error: "",
          pointsError: "",
          apisError: "",
        }));

        const [meResult, pointsResult, apisResult] = await Promise.allSettled([
          fetchJson<MeResponse>(
            `${API_BASE}/api/v2/auth/me`,
            accessToken,
            controller.signal,
          ),
          fetchJson<MyPointResponse>(
            `${API_BASE}/api/v3/points/my-point`,
            accessToken,
            controller.signal,
          ),
          fetchJson<MyApiResponse>(
            `${API_BASE}/api/v3/permissions/my-api`,
            accessToken,
            controller.signal,
          ),
        ]);

        const me = meResult.status === "fulfilled" ? meResult.value : null;
        const points =
          pointsResult.status === "fulfilled" ? pointsResult.value : null;
        const apis =
          apisResult.status === "fulfilled"
            ? (apisResult.value.apis ?? []).filter((item) => item.allowed)
            : [];

        if (!me) {
          throw new Error("Failed to load profile");
        }

        setState({
          me,
          points,
          apis,
          loading: false,
          error: "",
          pointsError:
            pointsResult.status === "rejected"
              ? "Points data could not be loaded."
              : "",
          apisError:
            apisResult.status === "rejected"
              ? "Active endpoints could not be loaded."
              : "",
        });
      } catch (error) {
        if (controller.signal.aborted) return;

        setState({
          me: null,
          points: null,
          apis: [],
          loading: false,
          error:
            error instanceof Error ? error.message : "Failed to load profile",
          pointsError: "",
          apisError: "",
        });
      }
    }

    loadProfile();

    return () => controller.abort();
  }, []);

  const displayName = useMemo(() => {
    if (!state.me) return "Admin User";
    return capitalizeFirstLetter(
      state.me.username?.trim() || state.me.email || "Admin User",
    );
  }, [state.me]);

  const handleAvatarSelect = (icon: string) => {
    setSelectedAvatar(icon);
    window.localStorage.setItem("admin_avatar", icon);
  };

  const endpointCount = state.apis.length;

  return (
    <AdminShell>
      <div className="mx-auto max-w-8xl space-y-8 p-6 md:p-8">
        <section className="relative overflow-hidden rounded-[13px] border border-white/40 bg-white/40 px-6 py-7 shadow-[0_28px_90px_rgba(15,23,42,0.12)] backdrop-blur-2xl md:px-8 md:py-8 dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(15,23,42,0.68),rgba(15,23,42,0.28))]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(59,130,246,0.20),transparent_32%),radial-gradient(circle_at_100%_100%,rgba(34,211,238,0.14),transparent_28%),linear-gradient(120deg,rgba(255,255,255,0.12),transparent_40%)] dark:bg-[radial-gradient(circle_at_0%_0%,rgba(59,130,246,0.24),transparent_34%),radial-gradient(circle_at_100%_100%,rgba(34,211,238,0.16),transparent_28%),linear-gradient(120deg,rgba(255,255,255,0.04),transparent_40%)]" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/80 to-transparent" />
          <div className="absolute left-0 top-10 h-40 w-px bg-gradient-to-b from-primary/0 via-primary/50 to-primary/0" />
          <div className="absolute right-8 top-8 h-24 w-24 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-20 w-20 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative">
            <div className="flex  flex-col gap-5 sm:flex-row sm:items-start">
              <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-[30px] border border-primary/25 bg-white/55 text-primary shadow-[0_0_50px_rgba(59,130,246,0.18)] backdrop-blur-xl dark:border-cyan-300/10 dark:bg-white/5 dark:shadow-[0_0_56px_rgba(59,130,246,0.20)]">
                <span className="material-symbols-outlined relative text-5xl">
                  {selectedAvatar}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/65 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.24em] text-primary backdrop-blur-md dark:border-white/10 dark:bg-white/10">
                  <span className="material-symbols-outlined text-sm">
                    shield
                  </span>
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {(state.me?.role ?? "").toUpperCase()}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white md:text-5xl">
                    {displayName}
                  </h1>
                  {/* {state.me ? (
                      <StatusBadge active={state.me.is_active} />
                    ) : null} */}
                </div>

                {/* <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300 md:text-base">
                    Command center for your admin identity, access state, and
                    account telemetry with sharper hierarchy and cleaner
                    production-ready structure.
                  </p> */}

                {/* {state.me ? (
                    <div className="mt-6 flex flex-wrap gap-3">
                      <div className="inline-flex items-center gap-2 rounded-2xl border border-white/45 bg-white/55 px-4 py-2 backdrop-blur-md dark:border-white/10 dark:bg-white/10">
                        <span className="material-symbols-outlined text-primary">
                          alternate_email
                        </span>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                            Secure Mail
                          </p>
                          <p className="max-w-[220px] truncate text-sm font-semibold text-slate-900 dark:text-white">
                            {state.me.email}
                          </p>
                        </div>
                      </div>

                      <div className="inline-flex items-center gap-2 rounded-2xl border border-white/45 bg-white/55 px-4 py-2 backdrop-blur-md dark:border-white/10 dark:bg-white/10">
                        <span className="material-symbols-outlined text-primary">
                          fingerprint
                        </span>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                            Admin ID
                          </p>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            #{state.me.id}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null} */}
              </div>
            </div>
          </div>
        </section>

        {!state.loading && !state.error && state.me ? (
          <section className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[13px] border border-white/40 bg-white/45 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.05]">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                Role Channel
              </p>
              <div className="mt-3 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">
                  badge
                </span>
                <p className="text-lg font-black text-slate-900 dark:text-white">
                  {state.me.role}
                </p>
              </div>
            </div>

            <div className="rounded-[13px] border border-white/40 bg-white/45 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.05]">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                Point
              </p>
              <div className="mt-3 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">
                  badge
                </span>
                <p className="text-lg font-black text-slate-900 dark:text-white">
                  {state.points ? String(state.points.available_points) : "N/A"}
                </p>
              </div>
            </div>

            <div className="rounded-[13px] border border-white/40 bg-white/45 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.05]">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                Access State
              </p>
              <div className="mt-3 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">
                  verified_user
                </span>
                <p className="text-lg font-black text-slate-900 dark:text-white">
                  {state.me.is_active ? "Active" : "Inactive"}
                </p>
              </div>
            </div>

            <div className="rounded-[13px] border border-white/40 bg-white/45 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.05] sm:col-span-2 xl:col-span-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                Joined Signal
              </p>
              <div className="mt-3 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">
                  calendar_month
                </span>
                <p className="text-lg font-black text-slate-900 dark:text-white">
                  {formatDate(state.me.created_at, "Unknown")}
                </p>
              </div>
            </div>
          </section>
        ) : null}

        {state.loading ? (
          <div className="relative overflow-hidden rounded-[28px] border border-white/40 bg-white/40 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
              <span className="material-symbols-outlined animate-pulse text-primary">
                progress_activity
              </span>
              Loading profile...
            </div>
          </div>
        ) : null}

        {state.error ? (
          <div className="relative overflow-hidden rounded-[28px] border border-rose-200/70 bg-rose-50/80 p-6 shadow-sm backdrop-blur-xl dark:border-rose-900/40 dark:bg-rose-950/20">
            <div className="flex items-center gap-3 text-sm text-rose-700 dark:text-rose-300">
              <span className="material-symbols-outlined">error</span>
              {state.error}
            </div>
          </div>
        ) : null}

        {!state.loading && !state.error && state.me ? (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <section className="w-full relative overflow-hidden rounded-[13px] border border-white/35 bg-white/30 p-6 backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.03]">
              <div className="absolute inset-y-6 left-6 w-px bg-gradient-to-b from-primary/0 via-primary/50 to-primary/0" />
              <SectionKicker
                icon="person"
                title="Identity Matrix"
                description="Administrative identity and account metadata arranged with cleaner hierarchy and leaner rendering."
              />

              <div className="mt-8">
                <ProfileLine
                  label="Full Name / Username"
                  value={state.me.username || "Not set"}
                />
                <ProfileLine label="Email" value={state.me.email} mono />
                <ProfileLine label="Role" value={state.me.role.toUpperCase()} />
                <ProfileLine
                  label="Created At"
                  value={formatDate(state.me.created_at)}
                />
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <SignalMetric
                  icon="fingerprint"
                  label="User ID"
                  value={String(state.me.id)}
                />
                <SignalMetric
                  icon="mark_email_read"
                  label="Mailbox"
                  value={state.me.email.includes("@") ? "Linked" : "Unknown"}
                />
                <SignalMetric
                  icon="admin_panel_settings"
                  label="Access"
                  value={state.me.is_active ? "Granted" : "Paused"}
                />
                <SignalMetric
                  icon="deployed_code"
                  label="Profile Mode"
                  value="Admin"
                />
              </div>
              </section>
              
            <section className="w-full relative overflow-hidden rounded-[13px] border border-white/35 bg-white/30 p-6 backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.03]">
              <div className="absolute inset-y-6 left-6 w-px bg-gradient-to-b from-primary/0 via-primary/50 to-primary/0" />
              <SectionKicker
                icon="api"
                title="Application active status"
                description="All active endpoints available for this admin account."
              />

              <div className="mt-8 flex items-center justify-between rounded-[18px] border border-white/40 bg-white/40 px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    Active Endpoints
                  </p>
                  <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                    {endpointCount}
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-300">
                  <span className="material-symbols-outlined text-sm">
                    check_circle
                  </span>
                  Live Access
                </span>
              </div>

              <div className="mt-6 space-y-3">
                {state.apisError ? (
                  <p className="rounded-[18px] border border-amber-300/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
                    {state.apisError}
                  </p>
                ) : endpointCount === 0 ? (
                  <p className="rounded-[18px] border border-dashed border-slate-300/70 px-4 py-4 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
                    No active endpoints found for this account.
                  </p>
                ) : (
                  state.apis.map((api) => (
                    <div
                      key={api.action}
                      className="flex items-center justify-between gap-3 rounded-[18px] border border-white/40 bg-white/40 px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="material-symbols-outlined text-primary">
                          {getApiIcon(api.action)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                            {api.label}
                          </p>
                          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                            {api.route || api.action}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        {api.method ? (
                          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                            {api.method}
                          </span>
                        ) : null}
                        <Link
                          href={`/admin/app-center/edit/${api.action.replace(/_/g, "-")}`}
                          className="rounded-full border border-white/40 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-700 transition hover:border-primary/40 hover:text-primary dark:border-white/10 dark:text-slate-200"
                        >
                          Open
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
         </div>  
         </> 
        ) : null}
      </div>
    </AdminShell>
  );
}
