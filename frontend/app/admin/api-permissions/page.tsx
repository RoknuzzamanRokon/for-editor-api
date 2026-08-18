"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { API_BASE } from "@/lib/apiBase";
import { formatRoleLabel } from "@/lib/roleLabel";

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

type PageAccessEntry = {
  page_key: string;
  label: string;
  path: string;
  area: string;
  icon: string;
  locked: boolean;
  description: string;
  allowed: boolean;
};

type PageAccessResponse = {
  user_id: number;
  role: string;
  pages: PageAccessEntry[];
};

type RoleOption = {
  value: string;
  label: string;
  icon: string;
  description: string;
};

const ROLE_OPTIONS: RoleOption[] = [
  {
    value: "demo_user",
    label: "Demo User",
    icon: "smart_display",
    description: "Read-only trial account",
  },
  {
    value: "general_user",
    label: "General User",
    icon: "person",
    description: "Standard workspace access",
  },
  {
    value: "admin_user",
    label: "Admin User",
    icon: "admin_panel_settings",
    description: "Manages users and permissions",
  },
  {
    value: "super_user",
    label: "Super User",
    icon: "shield",
    description: "Unrestricted access",
  },
];

// Mirrors ADMIN_ASSIGNABLE_ROLES in backend/api/v3/endpoints/admin.py so the
// UI disables what the API would reject rather than surfacing a 403.
const ADMIN_ASSIGNABLE_ROLES = new Set(["general_user", "demo_user"]);

const ACCENT_RAIL =
  "absolute inset-y-4 left-4 w-[1.5px] bg-[linear-gradient(to_bottom,transparent,color-mix(in_srgb,var(--primary)_50%,transparent),transparent)]";

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
    <section className="relative overflow-hidden rounded-[13px] border border-border bg-transparent backdrop-blur-sm [box-shadow:4px_4px_0px_0px_var(--border)]">
      <div className={ACCENT_RAIL} />
      <div className="relative border-b border-border px-5 py-4">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground">
              {title}
            </h3>
            {description ? (
              <p className="mt-0.5 text-xs text-foreground/60">
                {description}
              </p>
            ) : null}
          </div>
          {action ? <div>{action}</div> : null}
        </div>
      </div>
      <div className="relative p-5">{children}</div>
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
    <div className="relative overflow-hidden rounded-[13px] border border-border bg-transparent p-6 transition duration-300 hover:-translate-y-1 [box-shadow:4px_4px_0px_0px_var(--border)]">
      <div className={ACCENT_RAIL} />
      <div className="relative">
        <div className="mb-3 inline-flex rounded-2xl border border-border bg-transparent p-2 text-primary">
          <span className="material-symbols-outlined text-sm">{icon}</span>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-foreground/60">
          {title}
        </p>
        <p className="mt-1 text-lg font-black tracking-tight text-foreground">
          {value}
        </p>
        {subtext ? (
          <p className="mt-0.5 text-xs text-foreground/60">{subtext}</p>
        ) : null}
      </div>
    </div>
  );
}

function GlassInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-2xl border border-border bg-transparent px-3 py-2 text-xs text-foreground outline-none transition placeholder:text-foreground/40 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 ${props.className ?? ""}`}
    />
  );
}

function GlassSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      // `bg-transparent` looks fine on the closed box (the panel behind it shows
      // through), but the native option list is a separate rendering layer that
      // "transparent" never reaches — browsers paint it with a default white
      // background instead. A real, theme-aware color here fixes both.
      className={`w-full rounded-2xl border border-border bg-card px-3 py-2 text-xs text-foreground outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10 [&>option]:bg-card [&>option]:text-foreground ${props.className ?? ""}`}
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
    <div className="px-1 py-1">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-foreground/60">
        {label}
      </p>
      <p className={`mt-0.5 text-xs font-semibold text-foreground ${mono ? "break-all font-mono text-[11px]" : ""}`}>
        {value}
      </p>
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
  const [pages, setPages] = useState<PageAccessEntry[]>([]);
  const [loadingPages, setLoadingPages] = useState(false);
  const [savingPage, setSavingPage] = useState<string | null>(null);
  const [roleDraft, setRoleDraft] = useState("");
  const [savingRole, setSavingRole] = useState(false);
  const [viewerId, setViewerId] = useState<number | null>(null);
  const [viewerRole, setViewerRole] = useState("");

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

  const loadPages = useCallback(async (userId: number) => {
    setLoadingPages(true);
    try {
      const token = getToken();
      const res = await fetch(
        `${API_BASE}/api/v3/pages/users/${userId}/pages`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const body = await res.text();
      if (!res.ok) {
        throw new Error(body || "Failed to load page access");
      }
      const parsed = JSON.parse(body) as PageAccessResponse;
      setPages(Array.isArray(parsed.pages) ? parsed.pages : []);
    } catch (err: unknown) {
      setPages([]);
      setError(
        err instanceof Error ? err.message : "Failed to load page access",
      );
    } finally {
      setLoadingPages(false);
    }
  }, [getToken]);

  useEffect(() => {
    void loadActions();
  }, [loadActions]);

  // The signed-in admin's own identity, so the UI can hide role options the
  // API would reject and stop them editing their own role.
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    fetch(`${API_BASE}/api/v2/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((me: { id?: number; role?: string } | null) => {
        if (!me) return;
        setViewerId(me.id ?? null);
        setViewerRole(me.role ?? "");
      })
      .catch(() => {
        setViewerId(null);
        setViewerRole("");
      });
  }, []);

  useEffect(() => {
    const queryUserId = searchParams.get("userId");
    if (!queryUserId) return;
    setUserIdInput(queryUserId);
    void loadUserDetails(queryUserId);
  }, [loadUserDetails, searchParams]);

  // Keyed on id/role rather than `details` itself — permission toggles replace
  // that object wholesale and would otherwise refetch pages on every click.
  const detailsId = details?.id ?? null;
  const detailsRole = details?.role ?? "";

  useEffect(() => {
    if (detailsId === null) {
      setPages([]);
      setRoleDraft("");
      return;
    }
    setRoleDraft(detailsRole);
    void loadPages(detailsId);
  }, [detailsId, detailsRole, loadPages]);

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

  const handleUpdateRole = async () => {
    if (!details || !roleDraft || roleDraft === details.role) return;
    setError("");
    setSuccess("");
    setSavingRole(true);

    try {
      const token = getToken();
      const res = await fetch(
        `${API_BASE}/api/v3/admin/users/${details.id}/role`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role: roleDraft }),
        },
      );
      const body = await res.text();
      if (!res.ok) {
        throw new Error(body || "Failed to update role");
      }

      const parsed = JSON.parse(body) as { role: string; previous_role: string };
      setSuccess(
        `Role changed from ${formatRoleLabel(parsed.previous_role)} to ${formatRoleLabel(parsed.role)}`,
      );

      // Role drives which pages exist for this user, so reload from scratch.
      await loadUserDetails(String(details.id));
    } catch (err: unknown) {
      setRoleDraft(details.role);
      setError(err instanceof Error ? err.message : "Failed to update role");
    } finally {
      setSavingRole(false);
    }
  };

  const handleTogglePage = async (page: PageAccessEntry) => {
    if (!details || page.locked) return;
    setError("");
    setSuccess("");
    setSavingPage(page.page_key);

    try {
      const token = getToken();
      const res = await fetch(
        `${API_BASE}/api/v3/pages/users/${details.id}/pages/${page.page_key}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ is_allowed: !page.allowed }),
        },
      );
      const body = await res.text();
      if (!res.ok) {
        throw new Error(body || "Failed to update page access");
      }

      const parsed = JSON.parse(body) as PageAccessResponse;
      setPages(Array.isArray(parsed.pages) ? parsed.pages : []);
      setSuccess(
        `${page.label} is now ${page.allowed ? "hidden from" : "visible to"} this user`,
      );
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to update page access",
      );
    } finally {
      setSavingPage(null);
    }
  };

  const actionLookup = useMemo(() => {
    return new Map(actions.map((a) => [a.action, a.label]));
  }, [actions]);

  const isSelf = details !== null && viewerId !== null && details.id === viewerId;

  const assignableRoles = useMemo(() => {
    if (viewerRole === "admin_user") {
      return ROLE_OPTIONS.filter((option) =>
        ADMIN_ASSIGNABLE_ROLES.has(option.value),
      );
    }
    return ROLE_OPTIONS;
  }, [viewerRole]);

  const pageStats = useMemo(() => {
    const total = pages.length;
    const allowed = pages.filter((p) => p.allowed).length;
    return { total, allowed, blocked: total - allowed };
  }, [pages]);

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
      <div className="mx-auto max-w-8xl space-y-5 p-4 md:p-6">
        <section className="app-hero-card relative overflow-hidden rounded-[13px] border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-primary p-6 text-white shadow-xl dark:border-slate-800">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-12 left-0 h-32 w-32 rounded-full bg-primary-foreground/10 blur-3xl" />

          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur">
                <span className="material-symbols-outlined text-sm">
                  vpn_key
                </span>
                Permissions Control
              </div>

              <h1 className="mt-3 text-2xl font-black tracking-tight text-white md:text-3xl">
                API Permissions
              </h1>

              
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 shadow-sm backdrop-blur">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">
                  Actions
                </p>
                <p className="mt-1 text-sm font-bold text-white">
                  {actions.length}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 shadow-sm backdrop-blur">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">
                  Allowed
                </p>
                <p className="mt-1 text-sm font-bold text-white">
                  {permissionStats.allowed}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 shadow-sm backdrop-blur">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">
                  Blocked
                </p>
                <p className="mt-1 text-sm font-bold text-white">
                  {permissionStats.blocked}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
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
          <div className="relative overflow-hidden rounded-[13px] border border-rose-200/70 bg-rose-50/80 p-4 shadow-sm backdrop-blur-xl dark:border-rose-900/40 dark:bg-rose-950/20">
            <div className="flex items-center gap-3 text-sm text-rose-700 dark:text-rose-300">
              <span className="material-symbols-outlined">error</span>
              {error}
            </div>
          </div>
        ) : null}

        {success ? (
          <div className="relative overflow-hidden rounded-[13px] border border-emerald-200/70 bg-emerald-50/80 p-4 shadow-sm backdrop-blur-xl dark:border-emerald-900/40 dark:bg-emerald-950/20">
            <div className="flex items-center gap-3 text-sm text-emerald-700 dark:text-emerald-300">
              <span className="material-symbols-outlined">check_circle</span>
              {success}
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <GlassSection
          title="Lookup User"
          description="Enter a user ID and load their permission profile."
          action={
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleLoadUser}
                disabled={loadingDetails}
                className="inline-flex items-center gap-1.5 rounded-2xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-lg shadow-primary/20 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                type="button"
              >
                <span className="material-symbols-outlined text-sm">
                  manage_search
                </span>
                {loadingDetails ? "Loading..." : "Check User"}
              </button>

              <button
                onClick={() => void loadActions()}
                disabled={loadingActions}
                className="inline-flex items-center gap-1.5 rounded-2xl border border-white/40 bg-white/60 px-4 py-2 text-xs font-bold text-slate-700 shadow-sm backdrop-blur-md transition hover:bg-white/70 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/10 dark:text-slate-100"
                type="button"
              >
                <span className="material-symbols-outlined text-sm">
                  refresh
                </span>
                {loadingActions ? "Refreshing..." : "Refresh Actions"}
              </button>
            </div>
          }
        >
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(180px,260px)_1fr]">
            <GlassInput
              value={userIdInput}
              onChange={(e) => setUserIdInput(e.target.value)}
              placeholder="Enter user ID, e.g. 3"
              type="number"
            />

            <div className="rounded-2xl border border-border bg-transparent px-3 py-2">
              <p className="text-[11px] text-foreground/60">
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
            <div className="flex flex-col gap-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="rounded-2xl border border-border bg-transparent p-4">
                  <div className="h-4 w-32 animate-pulse rounded bg-foreground/10" />
                  <div className="mt-2 h-3 w-24 animate-pulse rounded bg-foreground/10" />
                </div>
              ))}
            </div>
          ) : filteredActions.length === 0 ? (
            <div className="rounded-2xl border border-border bg-transparent p-6 text-sm text-foreground/60">
              No actions found.
            </div>
          ) : (
            <div className="flex max-h-[336px] flex-col gap-2 overflow-y-auto pr-1">
              {filteredActions.map((item) => (
                <div key={item.action} className="flex items-center justify-between px-4 py-3">
                  <p className="text-sm font-semibold text-foreground">{item.label}</p>
                  <p className="text-xs text-foreground/50">{item.action}</p>
                </div>
              ))}
            </div>
          )}
        </GlassSection>
        </div>

        {details ? (
          <>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <GlassSection
                title="User Details"
                description="Identity and activity data for the selected user."
              >
                <div className="grid grid-cols-2 gap-3">
                  <InfoTile label="ID" value={details.id} />
                  <InfoTile label="Email" value={details.email} mono />
                  <InfoTile label="Username" value={details.username ?? "-"} />
                  <InfoTile label="Role" value={formatRoleLabel(details.role)} />
                  <InfoTile label="Position" value={details.position} />
                  <InfoTile label="Status" value={details.is_active ? "Active" : "Inactive"} />
                  <InfoTile label="Created" value={formatDate(details.created_at)} />
                  <InfoTile label="Last Login" value={formatDate(details.last_login)} />
                  <InfoTile label="Last Active" value={formatDate(details.last_active_at)} />
                </div>
              </GlassSection>

              <GlassSection
                title="Points & Conversion Summary"
                description="Wallet activity and conversion health."
              >
                <div className="grid grid-cols-2 gap-3">
                  <InfoTile label="Balance" value={details.points.balance} />
                  <InfoTile label="Topup" value={details.points.total_topup} />
                  <InfoTile label="Spent" value={details.points.total_spent} />
                  <InfoTile label="Refunded" value={details.points.total_refunded} />
                  <InfoTile label="Points Activity" value={formatDate(details.points.last_points_activity_at)} />
                  <InfoTile label="Conversions" value={details.conversions.total} />
                  <InfoTile label="Success" value={details.conversions.success} />
                  <InfoTile label="Failed" value={details.conversions.failed} />
                  <InfoTile label="Processing" value={details.conversions.processing} />
                  <InfoTile label="Last Conversion" value={formatDate(details.conversions.last_conversion_at)} />
                </div>
              </GlassSection>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <GlassSection
                title="User Role"
                description="Promote or restrict this account. Role decides which workspace they land in."
              >
                {isSelf ? (
                  <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-500">
                    You cannot change your own role. Ask another admin to do it.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-foreground/60">
                        Current
                      </span>
                      <span className="rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary">
                        {formatRoleLabel(details.role)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {assignableRoles.map((option) => {
                        const selected = roleDraft === option.value;
                        return (
                          <button
                            key={option.value}
                            onClick={() => setRoleDraft(option.value)}
                            disabled={savingRole}
                            type="button"
                            className={`flex items-start gap-2 rounded-2xl border px-3 py-2 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
                              selected
                                ? "border-primary/60 bg-primary/10"
                                : "border-border bg-transparent hover:border-primary/30"
                            }`}
                          >
                            <span
                              className={`material-symbols-outlined text-sm ${selected ? "text-primary" : "text-foreground/50"}`}
                            >
                              {option.icon}
                            </span>
                            <span className="min-w-0">
                              <span className="block text-xs font-semibold text-foreground">
                                {option.label}
                              </span>
                              <span className="block text-[10px] text-foreground/50">
                                {option.description}
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => void handleUpdateRole()}
                        disabled={savingRole || roleDraft === details.role}
                        type="button"
                        className="inline-flex items-center gap-1.5 rounded-2xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-lg shadow-primary/20 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <span className="material-symbols-outlined text-sm">
                          published_with_changes
                        </span>
                        {savingRole ? "Updating..." : "Update Role"}
                      </button>
                      {roleDraft !== details.role ? (
                        <span className="text-[10px] text-foreground/50">
                          {formatRoleLabel(details.role)} &rarr; {formatRoleLabel(roleDraft)}
                        </span>
                      ) : null}
                    </div>

                    {viewerRole === "admin_user" ? (
                      <p className="text-[10px] text-foreground/40">
                        Admins can assign General User and Demo User only.
                      </p>
                    ) : null}
                  </div>
                )}
              </GlassSection>

              <GlassSection
                title="Page Permissions"
                description="Choose which pages this user can open and see in their sidebar."
              >
                <div className="mb-3 flex flex-wrap gap-1.5">
                  <span className="rounded-full border border-border bg-transparent px-2.5 py-0.5 text-[10px] font-semibold text-foreground">
                    Total: {pageStats.total}
                  </span>
                  <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400">
                    Visible: {pageStats.allowed}
                  </span>
                  <span className="rounded-full border border-rose-500/40 bg-rose-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-rose-400">
                    Hidden: {pageStats.blocked}
                  </span>
                </div>

                {loadingPages ? (
                  <div className="flex flex-col gap-2">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <div key={index} className="rounded-2xl border border-border p-3">
                        <div className="h-3 w-28 animate-pulse rounded bg-foreground/10" />
                        <div className="mt-2 h-2 w-40 animate-pulse rounded bg-foreground/10" />
                      </div>
                    ))}
                  </div>
                ) : pages.length === 0 ? (
                  <div className="rounded-2xl border border-border bg-transparent p-4 text-xs text-foreground/60">
                    No configurable pages for this role.
                  </div>
                ) : (
                  <div className="flex max-h-[336px] flex-col gap-1.5 overflow-y-auto pr-1">
                    {pages.map((page) => (
                      <div
                        key={page.page_key}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-border px-3 py-2"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="material-symbols-outlined text-sm text-foreground/50">
                            {page.icon}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-foreground">
                              {page.label}
                            </p>
                            <p className="truncate text-[10px] text-foreground/50">
                              {page.path}
                            </p>
                          </div>
                        </div>

                        {page.locked ? (
                          <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-[10px] font-semibold text-foreground/50">
                            Always on
                          </span>
                        ) : (
                          <button
                            onClick={() => void handleTogglePage(page)}
                            disabled={savingPage === page.page_key}
                            type="button"
                            className={`inline-flex shrink-0 items-center gap-1.5 rounded-2xl px-3 py-1.5 text-[10px] font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                              page.allowed
                                ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                                : "bg-rose-500/20 text-rose-400 hover:bg-rose-500/30"
                            }`}
                          >
                            <span className="material-symbols-outlined text-sm">
                              {page.allowed ? "visibility" : "visibility_off"}
                            </span>
                            {savingPage === page.page_key
                              ? "Saving..."
                              : page.allowed
                                ? "Visible"
                                : "Hidden"}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </GlassSection>
            </div>

            <GlassSection
              title={`API Permissions (${details.api_permissions.length})`}
              description="Search, filter, and toggle permissions for this user."
              action={
                <div className="flex w-full flex-col gap-2 lg:w-auto lg:flex-row">
                  <div className="w-full lg:w-[220px]">
                    <GlassInput
                      value={permissionSearch}
                      onChange={(e) => setPermissionSearch(e.target.value)}
                      placeholder="Search permission..."
                      type="text"
                    />
                  </div>
                  <div className="w-full lg:w-[150px]">
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
              <div className="mb-3 flex flex-wrap gap-1.5">
                <span className="rounded-full border border-border bg-transparent px-2.5 py-0.5 text-[10px] font-semibold text-foreground">
                  Total: {permissionStats.total}
                </span>
                <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400">
                  Allowed: {permissionStats.allowed}
                </span>
                <span className="rounded-full border border-rose-500/40 bg-rose-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-rose-400">
                  Blocked: {permissionStats.blocked}
                </span>
              </div>

              <div className="overflow-hidden rounded-[24px] bg-transparent">
                <div className="max-h-[760px] overflow-auto">
                  <table className="w-full text-left">
                    <thead className="sticky top-0 border-b border-border bg-background text-[10px] uppercase tracking-[0.16em] text-foreground/60">
                      <tr>
                        <th className="px-3 py-2">API</th>
                        <th className="px-3 py-2">Allowed</th>
                        <th className="px-3 py-2">Points</th>
                        <th className="px-3 py-2">Success Rate</th>
                        <th className="px-3 py-2">Last Used</th>
                        <th className="px-3 py-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-transparent">
                      {filteredPermissions.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-3 py-4 text-xs text-foreground/60">
                            No permissions match your current filters.
                          </td>
                        </tr>
                      ) : (
                        filteredPermissions.map((item) => (
                          <tr key={item.action} className="transition hover:bg-card/40">
                            <td className="px-3 py-3 text-xs">
                              <p className="font-semibold text-foreground">
                                {actionLookup.get(item.action) || item.label}
                              </p>
                              <p className="mt-0.5 break-all text-[10px] text-foreground/60">
                                {item.action}
                              </p>
                              <p className="mt-0.5 text-[10px] text-foreground/40">
                                {item.method} {item.route}
                              </p>
                            </td>
                            <td className="px-3 py-3 text-xs">
                              <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusBadgeClass(item.allowed)}`}>
                                {item.allowed ? "Yes" : "No"}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-xs text-foreground/80">{item.points}</td>
                            <td className="px-3 py-3 text-xs text-foreground/80">{item.success_rate.toFixed(1)}%</td>
                            <td className="px-3 py-3 text-xs text-foreground/70">{formatDate(item.last_used_at)}</td>
                            <td className="px-3 py-3 text-right">
                              <button
                                onClick={() => void handleTogglePermission(item)}
                                disabled={savingAction === item.action}
                                className={`inline-flex items-center gap-1.5 rounded-2xl px-3 py-1.5 text-[10px] font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                  item.allowed
                                    ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                                    : "bg-rose-500/20 text-rose-400 hover:bg-rose-500/30"
                                }`}
                                type="button"
                              >
                                <span className="material-symbols-outlined text-sm">
                                  {item.allowed ? "toggle_off" : "toggle_on"}
                                </span>
                                {savingAction === item.action ? "Saving..." : item.allowed ? "Disable" : "Enable"}
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
  );
}
