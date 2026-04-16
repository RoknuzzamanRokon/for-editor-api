"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://127.0.0.1:8000";

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

function formatDate(value?: string | null) {
  if (!value) return "N/A";
  return new Date(value).toLocaleString();
}

function statusBadgeClass(active: boolean) {
  return active
    ? "border border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-300"
    : "border border-rose-200 bg-rose-100 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/15 dark:text-rose-300";
}

function GlassSection({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden rounded-[32px] border border-white/40 bg-white/55 shadow-[0_20px_50px_rgba(15,23,42,0.10)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-white/30 to-transparent dark:from-primary/10 dark:via-white/5 dark:to-transparent" />
      <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/20" />

      <div className="relative border-b border-white/30 px-6 py-5 dark:border-white/10">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {title}
            </h3>
            {description ? (
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {description}
              </p>
            ) : null}
          </div>
          {action ? <div>{action}</div> : null}
        </div>
      </div>

      <div className="relative p-6">{children}</div>
    </section>
  );
}

function GlassStatCard({
  title,
  value,
  icon,
  subtext,
}: {
  title: string;
  value: string | number;
  icon: string;
  subtext?: string;
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
        {subtext ? (
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {subtext}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function GlassInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-2xl border border-white/40 bg-white/65 px-4 py-3 text-sm text-slate-900 outline-none shadow-sm backdrop-blur-md transition placeholder:text-slate-400 focus:border-primary/30 focus:ring-4 focus:ring-primary/10 dark:border-white/10 dark:bg-white/10 dark:text-white dark:placeholder:text-slate-500 ${
        props.className ?? ""
      }`}
    />
  );
}

function GlassSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full rounded-2xl border border-white/40 bg-white/65 px-4 py-3 text-sm text-slate-900 outline-none shadow-sm backdrop-blur-md transition focus:border-primary/30 focus:ring-4 focus:ring-primary/10 dark:border-white/10 dark:bg-white/10 dark:text-white ${
        props.className ?? ""
      }`}
    />
  );
}

function InfoTile({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string | number;
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

export default function AdminApiPermissionsPage() {
  const searchParams = useSearchParams();
  const [userIdInput, setUserIdInput] = useState("");
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [details, setDetails] = useState<UserDetails | null>(null);
  const [loadingActions, setLoadingActions] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [savingAction, setSavingAction] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [actionSearch, setActionSearch] = useState("");
  const [permissionSearch, setPermissionSearch] = useState("");
  const [permissionFilter, setPermissionFilter] = useState<
    "all" | "allowed" | "blocked"
  >("all");

  const getToken = useCallback(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      throw new Error("No access token found.");
    }
    return token;
  }, []);

  const loadActions = useCallback(async () => {
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
      setError(
        err instanceof Error ? err.message : "Failed to load action list",
      );
    } finally {
      setLoadingActions(false);
    }
  }, [getToken]);

  const loadUserDetails = useCallback(async (userId: string) => {
    setLoadingDetails(true);
    setError("");
    setSuccess("");
    try {
      const token = getToken();
      const res = await fetch(
        `${API_BASE}/api/v3/admin/check-users/${userId}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const body = await res.text();
      if (!res.ok) {
        throw new Error(body || "Failed to load user details");
      }
      setDetails(JSON.parse(body) as UserDetails);
    } catch (err: unknown) {
      setDetails(null);
      setError(
        err instanceof Error ? err.message : "Failed to load user details",
      );
    } finally {
      setLoadingDetails(false);
    }
  }, [getToken]);

  useEffect(() => {
    void loadActions();
  }, [loadActions]);

  useEffect(() => {
    const queryUserId = searchParams.get("userId");
    if (!queryUserId) return;
    setUserIdInput(queryUserId);
    void loadUserDetails(queryUserId);
  }, [loadUserDetails, searchParams]);

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
      const latestMap = new Map(
        parsed.permissions.map((p) => [p.action, p.is_allowed]),
      );

      setDetails((prev) => {
        if (!prev) return prev;
        const nextPermissions = prev.api_permissions.map((p) => ({
          ...p,
          allowed: latestMap.has(p.action)
            ? Boolean(latestMap.get(p.action))
            : p.allowed,
        }));
        return {
          ...prev,
          api_permissions: nextPermissions,
          active_apis: nextPermissions.filter((p) => p.allowed),
        };
      });

      setSuccess(`Permission updated for "${item.action}"`);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to update permission",
      );
    } finally {
      setSavingAction(null);
    }
  };

  const actionLookup = useMemo(() => {
    return new Map(actions.map((a) => [a.action, a.label]));
  }, [actions]);

  const filteredActions = useMemo(() => {
    const q = actionSearch.trim().toLowerCase();
    if (!q) return actions;
    return actions.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.action.toLowerCase().includes(q),
    );
  }, [actions, actionSearch]);

  const filteredPermissions = useMemo(() => {
    if (!details) return [];
    const q = permissionSearch.trim().toLowerCase();

    return details.api_permissions.filter((item) => {
      const matchesSearch =
        !q ||
        item.label.toLowerCase().includes(q) ||
        item.action.toLowerCase().includes(q) ||
        item.route.toLowerCase().includes(q);

      const matchesFilter =
        permissionFilter === "all" ||
        (permissionFilter === "allowed" && item.allowed) ||
        (permissionFilter === "blocked" && !item.allowed);

      return matchesSearch && matchesFilter;
    });
  }, [details, permissionSearch, permissionFilter]);

  const permissionStats = useMemo(() => {
    if (!details) {
      return { total: 0, allowed: 0, blocked: 0 };
    }
    const total = details.api_permissions.length;
    const allowed = details.api_permissions.filter((p) => p.allowed).length;
    return {
      total,
      allowed,
      blocked: total - allowed,
    };
  }, [details]);

  return (
    <AdminShell>
      <div className="mx-auto max-w-8xl space-y-8 p-6 md:p-8">
        <section className="relative overflow-hidden rounded-[32px] border border-white/40 bg-white/55 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.10)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-white/40 to-transparent dark:from-primary/10 dark:via-white/5 dark:to-transparent" />
          <div className="absolute -left-16 top-0 h-40 w-40 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute -right-10 bottom-0 h-44 w-44 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/20" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/60 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-primary backdrop-blur-md dark:border-white/10 dark:bg-white/10">
                <span className="material-symbols-outlined text-sm">
                  vpn_key
                </span>
                Permissions Control
              </div>

              <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 dark:text-white md:text-4xl">
                API Permissions
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
                Check user details, inspect permission coverage, and enable or
                disable conversion APIs with a clean liquid glass admin
                workflow.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/40 bg-white/60 px-4 py-3 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/10">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Actions
                </p>
                <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                  {actions.length}
                </p>
              </div>
              <div className="rounded-2xl border border-white/40 bg-white/60 px-4 py-3 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/10">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Allowed
                </p>
                <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                  {permissionStats.allowed}
                </p>
              </div>
              <div className="rounded-2xl border border-white/40 bg-white/60 px-4 py-3 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/10">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Blocked
                </p>
                <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                  {permissionStats.blocked}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <GlassStatCard
            title="Loaded Actions"
            value={actions.length}
            icon="list_alt"
          />
          <GlassStatCard
            title="Total Permissions"
            value={permissionStats.total}
            icon="rule_settings"
          />
          <GlassStatCard
            title="Enabled APIs"
            value={permissionStats.allowed}
            icon="verified"
          />
          <GlassStatCard
            title="Disabled APIs"
            value={permissionStats.blocked}
            icon="block"
          />
        </section>

        {error ? (
          <div className="relative overflow-hidden rounded-[28px] border border-rose-200/70 bg-rose-50/80 p-4 shadow-sm backdrop-blur-xl dark:border-rose-900/40 dark:bg-rose-950/20">
            <div className="flex items-center gap-3 text-sm text-rose-700 dark:text-rose-300">
              <span className="material-symbols-outlined">error</span>
              {error}
            </div>
          </div>
        ) : null}

        {success ? (
          <div className="relative overflow-hidden rounded-[28px] border border-emerald-200/70 bg-emerald-50/80 p-4 shadow-sm backdrop-blur-xl dark:border-emerald-900/40 dark:bg-emerald-950/20">
            <div className="flex items-center gap-3 text-sm text-emerald-700 dark:text-emerald-300">
              <span className="material-symbols-outlined">check_circle</span>
              {success}
            </div>
          </div>
        ) : null}

        <GlassSection
          title="Lookup User"
          description="Enter a user ID and load their permission profile."
          action={
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleLoadUser}
                disabled={loadingDetails}
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                type="button"
              >
                <span className="material-symbols-outlined text-base">
                  manage_search
                </span>
                {loadingDetails ? "Loading..." : "Check User"}
              </button>

              <button
                onClick={() => void loadActions()}
                disabled={loadingActions}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/40 bg-white/60 px-5 py-3 text-sm font-bold text-slate-700 shadow-sm backdrop-blur-md transition hover:bg-white/70 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/10 dark:text-slate-100"
                type="button"
              >
                <span className="material-symbols-outlined text-base">
                  refresh
                </span>
                {loadingActions ? "Refreshing..." : "Refresh Actions"}
              </button>
            </div>
          }
        >
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(220px,320px)_1fr]">
            <GlassInput
              value={userIdInput}
              onChange={(e) => setUserIdInput(e.target.value)}
              placeholder="Enter user ID, e.g. 3"
              type="number"
            />

            <div className="rounded-2xl border border-white/40 bg-white/55 px-4 py-3 shadow-sm backdrop-blur-lg dark:border-white/10 dark:bg-white/5">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tip: after loading a user, you can search permissions, filter by
                allowed state, and toggle access directly from the table below.
              </p>
            </div>
          </div>
        </GlassSection>

        <GlassSection
          title="Action List"
          description="Available permission actions from /api/v3/permissions/actions"
          action={
            <div className="w-full md:w-[320px]">
              <GlassInput
                value={actionSearch}
                onChange={(e) => setActionSearch(e.target.value)}
                placeholder="Search action or label..."
                type="text"
              />
            </div>
          }
        >
          {loadingActions ? (
            <div className="rounded-2xl border border-white/40 bg-white/50 p-6 text-sm text-slate-500 backdrop-blur-lg dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
              Loading actions...
            </div>
          ) : filteredActions.length === 0 ? (
            <div className="rounded-2xl border border-white/40 bg-white/50 p-6 text-sm text-slate-500 backdrop-blur-lg dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
              No actions found.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {filteredActions.map((item) => (
                <div
                  key={item.action}
                  className="rounded-2xl border border-white/40 bg-white/55 p-4 shadow-sm backdrop-blur-lg dark:border-white/10 dark:bg-white/5"
                >
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {item.label}
                  </p>
                  <p className="mt-1 break-all text-xs text-slate-500 dark:text-slate-400">
                    {item.action}
                  </p>
                </div>
              ))}
            </div>
          )}
        </GlassSection>

        {details ? (
          <>
            <GlassSection
              title="User Details"
              description="Identity and activity data for the selected user."
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <InfoTile label="ID" value={details.id} />
                <InfoTile label="Email" value={details.email} mono />
                <InfoTile label="Username" value={details.username || "-"} />
                <InfoTile label="Role" value={details.role} />
                <InfoTile label="Position" value={details.position} />
                <InfoTile
                  label="Status"
                  value={details.is_active ? "Active" : "Inactive"}
                />
                <InfoTile
                  label="Created"
                  value={formatDate(details.created_at)}
                />
                <InfoTile
                  label="Last Login"
                  value={formatDate(details.last_login)}
                />
                <InfoTile
                  label="Last Active"
                  value={formatDate(details.last_active_at)}
                />
              </div>
            </GlassSection>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <GlassSection
                title="Points Summary"
                description="Wallet and points activity."
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <InfoTile label="Balance" value={details.points.balance} />
                  <InfoTile label="Topup" value={details.points.total_topup} />
                  <InfoTile label="Spent" value={details.points.total_spent} />
                  <InfoTile
                    label="Refunded"
                    value={details.points.total_refunded}
                  />
                  <InfoTile
                    label="Last Activity"
                    value={formatDate(details.points.last_points_activity_at)}
                  />
                </div>
              </GlassSection>

              <GlassSection
                title="Conversion Summary"
                description="Usage and conversion health."
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <InfoTile label="Total" value={details.conversions.total} />
                  <InfoTile
                    label="Success"
                    value={details.conversions.success}
                  />
                  <InfoTile label="Failed" value={details.conversions.failed} />
                  <InfoTile
                    label="Processing"
                    value={details.conversions.processing}
                  />
                  <InfoTile
                    label="Last Conversion"
                    value={formatDate(details.conversions.last_conversion_at)}
                  />
                </div>
              </GlassSection>
            </div>

            <GlassSection
              title={`API Permissions (${details.api_permissions.length})`}
              description="Search, filter, and toggle permissions for this user."
              action={
                <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row">
                  <div className="w-full lg:w-[260px]">
                    <GlassInput
                      value={permissionSearch}
                      onChange={(e) => setPermissionSearch(e.target.value)}
                      placeholder="Search permission..."
                      type="text"
                    />
                  </div>
                  <div className="w-full lg:w-[180px]">
                    <GlassSelect
                      value={permissionFilter}
                      onChange={(e) =>
                        setPermissionFilter(
                          e.target.value as "all" | "allowed" | "blocked",
                        )
                      }
                    >
                      <option value="all">All</option>
                      <option value="allowed">Allowed only</option>
                      <option value="blocked">Blocked only</option>
                    </GlassSelect>
                  </div>
                </div>
              }
            >
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/40 bg-white/60 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur-md dark:border-white/10 dark:bg-white/10 dark:text-slate-200">
                  Total: {permissionStats.total}
                </span>
                <span className="rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-300">
                  Allowed: {permissionStats.allowed}
                </span>
                <span className="rounded-full border border-rose-200 bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/15 dark:text-rose-300">
                  Blocked: {permissionStats.blocked}
                </span>
              </div>

              <div className="overflow-hidden rounded-[24px] border border-white/40 bg-white/45 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-white/50 text-xs uppercase tracking-[0.16em] text-slate-500 backdrop-blur-md dark:bg-white/5 dark:text-slate-400">
                      <tr>
                        <th className="px-4 py-4">API</th>
                        <th className="px-4 py-4">Allowed</th>
                        <th className="px-4 py-4">Points</th>
                        <th className="px-4 py-4">Success Rate</th>
                        <th className="px-4 py-4">Last Used</th>
                        <th className="px-4 py-4 text-right">Action</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-white/30 dark:divide-white/10">
                      {filteredPermissions.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-4 py-8 text-sm text-slate-500 dark:text-slate-400"
                          >
                            No permissions match your current filters.
                          </td>
                        </tr>
                      ) : (
                        filteredPermissions.map((item) => (
                          <tr
                            key={item.action}
                            className="transition hover:bg-white/30 dark:hover:bg-white/5"
                          >
                            <td className="px-4 py-4 text-sm">
                              <p className="font-semibold text-slate-900 dark:text-white">
                                {actionLookup.get(item.action) || item.label}
                              </p>
                              <p className="mt-1 break-all text-xs text-slate-500 dark:text-slate-400">
                                {item.action}
                              </p>
                              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                                {item.method} {item.route}
                              </p>
                            </td>

                            <td className="px-4 py-4 text-sm">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(
                                  item.allowed,
                                )}`}
                              >
                                {item.allowed ? "Yes" : "No"}
                              </span>
                            </td>

                            <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-200">
                              {item.points}
                            </td>

                            <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-200">
                              {item.success_rate.toFixed(1)}%
                            </td>

                            <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300">
                              {formatDate(item.last_used_at)}
                            </td>

                            <td className="px-4 py-4 text-right">
                              <button
                                onClick={() =>
                                  void handleTogglePermission(item)
                                }
                                disabled={savingAction === item.action}
                                className={`inline-flex items-center gap-2 rounded-2xl border border-primary/20 px-4 py-2 text-xs font-bold text-primary shadow-sm backdrop-blur-md transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                  item.allowed
                                    ? "bg-primary/10 shadow-[0_10px_24px_rgba(59,130,246,0.14)] hover:bg-primary/15 hover:shadow-[0_14px_30px_rgba(59,130,246,0.18)]"
                                    : "bg-gradient-to-r from-primary/12 via-white/60 to-primary/6 shadow-[0_10px_24px_rgba(59,130,246,0.12)] hover:from-primary/18 hover:via-white/75 hover:to-primary/10 hover:shadow-[0_14px_30px_rgba(59,130,246,0.16)] dark:via-white/10"
                                }`}
                                type="button"
                              >
                                <span className="material-symbols-outlined text-sm">
                                  {item.allowed ? "toggle_off" : "toggle_on"}
                                </span>
                                {savingAction === item.action
                                  ? "Saving..."
                                  : item.allowed
                                    ? "Disable"
                                    : "Enable"}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </GlassSection>
          </>
        ) : null}
      </div>
    </AdminShell>
  );
}
