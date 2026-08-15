"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { API_BASE } from "@/lib/apiBase";
import { capitalizeProfileName, formatProfileName } from "@/lib/profileName";
import { formatRoleLabel } from "@/lib/roleLabel";

type UserItem = {
  id: number;
  email: string;
  username: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
};

type MeResponse = {
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

// Fixed neutral tone (not tied to the ocean/sunset/forest/paper/crimson/burgundy
// site theme) — only the primary accent color should follow the active theme here.
const MUTED_FG = "text-slate-500 dark:text-slate-400";

// Tailwind can't apply opacity modifiers to the var()-based theme colors, so
// `bg-primary/10` and `via-primary/50` compile to no CSS at all. color-mix
// renders the same intent for real, and stays reactive to the active theme.
const PRIMARY_TINT = "bg-[color-mix(in_srgb,var(--primary)_12%,transparent)]";
const ACCENT_RAIL_STOPS =
  "bg-gradient-to-b from-transparent via-[color-mix(in_srgb,var(--primary)_50%,transparent)] to-transparent";

const ROLE_OPTIONS = [
  {
    value: "general_user",
    label: "General User",
    icon: "person",
    description: "Standard access for everyday conversion work.",
    tint: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  {
    value: "admin_user",
    label: "Admin User",
    icon: "admin_panel_settings",
    description: "Operational control with elevated management access.",
    tint: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  {
    value: "demo_user",
    label: "Demo User",
    icon: "smart_display",
    description: "Restricted access suited for guided demos and trials.",
    tint: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  },
  {
    value: "super_user",
    label: "Super User",
    icon: "shield",
    description: "Full platform access with highest-level privileges.",
    tint: "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400",
  },
] as const;

function formatDate(value?: string | null) {
  if (!value) return "N/A";
  return new Date(value).toLocaleString();
}

function getStatusBadgeClass(active: boolean) {
  return active
    ? "bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/20"
    : "bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/20";
}

/** Reuses the role picker's own tints so the directory and the create form
 *  always agree on what each role looks like. */
function getRoleMeta(role: string) {
  return (
    ROLE_OPTIONS.find((option) => option.value === role) ?? {
      icon: "person",
      tint: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
    }
  );
}

// Mirrors the table's own active/inactive badge colors (getStatusBadgeClass)
// so the summary cards and the directory below always agree on what
// "active" and "inactive" look like, instead of every card reading identical.
const STAT_TONES = {
  neutral: `text-primary ${PRIMARY_TINT}`,
  positive: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300",
  negative: "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300",
} as const;

function GlassStatCard({
  title,
  value,
  icon,
  tone = "neutral",
  subtext,
  loading = false,
}: {
  title: string;
  value: string | number;
  icon: string;
  tone?: keyof typeof STAT_TONES;
  subtext?: string;
  loading?: boolean;
}) {
  return (
    <div className="relative overflow-hidden rounded-[13px] border border-border bg-white/30 p-6 backdrop-blur-2xl [box-shadow:4px_4px_0px_0px_var(--border)] dark:bg-white/[0.03]">
      <div className={`absolute inset-y-6 left-6 w-px ${ACCENT_RAIL_STOPS}`} />

      <div className={`mb-4 inline-flex rounded-xl p-2 ${STAT_TONES[tone]}`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>

      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
        {title}
      </p>
      {loading ? (
        <div className="mt-2.5 h-7 w-14 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      ) : (
        <p className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          {value}
        </p>
      )}
      {!loading && subtext ? (
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{subtext}</p>
      ) : null}
    </div>
  );
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
    <section className="relative overflow-hidden rounded-[13px] border border-border bg-white/30 backdrop-blur-2xl [box-shadow:4px_4px_0px_0px_var(--border)] dark:bg-white/[0.03]">
      <div
        className={`absolute inset-y-5 left-5 w-px sm:inset-y-6 sm:left-6 ${ACCENT_RAIL_STOPS}`}
      />

      <div className="relative border-b border-slate-200/70 px-5 py-4 dark:border-white/10 sm:px-6 sm:py-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
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

      <div className="relative p-5 sm:p-6">{children}</div>
    </section>
  );
}

function GlassInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-2xl border border-white/40 bg-white/65 px-4 py-3 text-sm text-slate-900 outline-none shadow-sm backdrop-blur-md transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-[color-mix(in_srgb,var(--primary)_35%,transparent)] dark:border-white/10 dark:bg-white/10 dark:text-white dark:placeholder:text-slate-500 ${
        props.className ?? ""
      }`}
    />
  );
}

function GlassSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full rounded-2xl border border-white/40 bg-white/65 px-4 py-3 text-sm text-slate-900 outline-none shadow-sm backdrop-blur-md transition focus:border-primary focus:ring-2 focus:ring-[color-mix(in_srgb,var(--primary)_35%,transparent)] dark:border-white/10 dark:bg-white/10 dark:text-white ${
        props.className ?? ""
      }`}
    />
  );
}

function RolePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-900 dark:text-white">User role</label>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {ROLE_OPTIONS.map((role) => {
          const selected = value === role.value;

          return (
            <button
              key={role.value}
              type="button"
              onClick={() => onChange(role.value)}
              aria-pressed={selected}
              className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                selected
                  ? "border-primary bg-white ring-1 ring-inset ring-primary dark:bg-slate-900"
                  : "border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:bg-slate-800"
              }`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${role.tint}`}
              >
                <span className="material-symbols-outlined text-[19px]">
                  {role.icon}
                </span>
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-slate-900 dark:text-white">
                  {role.label}
                </span>
                <span className={`block truncate text-xs ${MUTED_FG}`}>
                  {role.description}
                </span>
              </span>

              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                  selected ? "border-primary bg-primary" : "border-slate-300 dark:border-slate-600"
                }`}
              >
                {selected ? <span className="h-1.5 w-1.5 rounded-full bg-white" /> : null}
              </span>
            </button>
          );
        })}
      </div>
    </div>
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
    <div className="relative overflow-hidden rounded-2xl border border-white/40 bg-gradient-to-r from-[rgb(255,255,255)] via-[rgb(246,251,255)] to-[rgb(240,249,255)] px-4 py-3.5 shadow-sm backdrop-blur-lg dark:border-white/10 dark:bg-gradient-to-r dark:from-[rgb(19,27,41)] dark:via-[rgb(20,31,49)] dark:to-[rgb(26,24,43)]">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/8 via-transparent to-[rgb(59,130,246)]/8 dark:from-primary/12 dark:to-[rgb(59,130,246)]/10" />
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

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [me, setMe] = useState<MeResponse | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  const [resetPasswordError, setResetPasswordError] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [selectedUserDetails, setSelectedUserDetails] =
    useState<UserDetails | null>(null);
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

    fetch(`${API_BASE}/api/v2/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        const body = await res.text();
        if (!res.ok) {
          throw new Error(body || "Failed to fetch current user");
        }
        setMe(JSON.parse(body) as MeResponse);
      })
      .catch(() => {
        setMe(null);
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

  const activeCount = useMemo(
    () => users.filter((user) => user.is_active).length,
    [users],
  );

  const inactiveCount = useMemo(
    () => users.filter((user) => !user.is_active).length,
    [users],
  );

  const formatSharePct = (count: number) =>
    users.length === 0 ? "No users yet" : `${Math.round((count / users.length) * 100)}% of total`;

  const allowedApiPermissions = useMemo(
    () =>
      selectedUserDetails?.api_permissions.filter((api) => api.allowed) ?? [],
    [selectedUserDetails],
  );

  const closeCreateModal = () => {
    setShowCreate(false);
    setShowCreatePassword(false);
    setCreateError("");
    setForm({ email: "", password: "", username: "", role: "general_user" });
  };

  useEffect(() => {
    if (!showCreate) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowCreate(false);
        setShowCreatePassword(false);
        setCreateError("");
        setForm({ email: "", password: "", username: "", role: "general_user" });
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [showCreate]);

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
        payload.username = capitalizeProfileName(form.username);
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
      setCreateError(
        err instanceof Error ? err.message : "Failed to create user",
      );
    } finally {
      setCreating(false);
    }
  };

  const handleOpenUserDetails = async (userId: number) => {
    setShowDetails(true);
    setDetailsLoading(true);
    setDetailsError("");
    setDeleteError("");
    setSelectedUserDetails(null);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No access token found.");
      }

      const res = await fetch(
        `${API_BASE}/api/v3/admin/check-users/${userId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const body = await res.text();
      if (!res.ok) {
        throw new Error(body || "Failed to fetch user details");
      }

      setSelectedUserDetails(JSON.parse(body) as UserDetails);
    } catch (err: unknown) {
      setDetailsError(
        err instanceof Error ? err.message : "Failed to fetch user details",
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUserDetails) return;

    const confirmed = window.confirm(
      `Delete user "${selectedUserDetails.email}" permanently? This cannot be undone.`,
    );
    if (!confirmed) return;

    try {
      setDeleteLoading(true);
      setDeleteError("");
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No access token found.");
      }

      const res = await fetch(`${API_BASE}/api/v2/users/${selectedUserDetails.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const body = await res.text();
      if (!res.ok) {
        throw new Error(body || "Failed to delete user");
      }

      setUsers((prev) => prev.filter((user) => user.id !== selectedUserDetails.id));
      setShowDetails(false);
      setSelectedUserDetails(null);
      setCreateSuccess("User deleted successfully.");
    } catch (err: unknown) {
      setDeleteError(
        err instanceof Error ? err.message : "Failed to delete user",
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleOpenResetPassword = () => {
    setNewPassword("");
    setConfirmNewPassword("");
    setResetPasswordError("");
    setShowResetPassword(true);
  };

  const handleResetPassword = async () => {
    if (!selectedUserDetails) return;

    if (newPassword.length < 8) {
      setResetPasswordError("Password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setResetPasswordError("Passwords do not match.");
      return;
    }

    try {
      setResetPasswordLoading(true);
      setResetPasswordError("");
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No access token found.");
      }

      const res = await fetch(
        `${API_BASE}/api/v2/users/${selectedUserDetails.id}/reset-password`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ new_password: newPassword }),
        },
      );

      const body = await res.text();
      if (!res.ok) {
        throw new Error(body || "Failed to reset password");
      }

      setShowResetPassword(false);
      setNewPassword("");
      setConfirmNewPassword("");
      setCreateSuccess(`Password reset for ${selectedUserDetails.email}.`);
    } catch (err: unknown) {
      setResetPasswordError(
        err instanceof Error ? err.message : "Failed to reset password",
      );
    } finally {
      setResetPasswordLoading(false);
    }
  };

  const canDeleteSelectedUser =
    me?.role === "super_user" &&
    !!selectedUserDetails &&
    me.id !== selectedUserDetails.id;

  const canResetSelectedUserPassword =
    me?.role === "super_user" && !!selectedUserDetails;

  return (
    <>
      <div className="mx-auto max-w-8xl space-y-8 p-6 md:p-8">
        <section className="app-hero-card relative overflow-hidden rounded-[13px] border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-primary p-8 text-white shadow-xl dark:border-slate-800">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-12 left-0 h-32 w-32 rounded-full bg-primary-foreground/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur">
                <span className="material-symbols-outlined text-sm">group</span>
                Users Management
              </div>

              <h1 className="mt-4 text-3xl font-black tracking-tight text-white md:text-4xl">
                Admin Users
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  setCreateError("");
                  setCreateSuccess("");
                  setShowCreate(true);
                }}
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:opacity-90"
                type="button"
              >
                <span className="material-symbols-outlined text-base">
                  person_add
                </span>
                Add User
              </button>

              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white backdrop-blur">
                Total: {filteredUsers.length}
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <GlassStatCard
            title="Total Users"
            value={users.length}
            icon="groups"
            loading={loading}
          />
          <GlassStatCard
            title="Active Users"
            value={activeCount}
            icon="verified_user"
            tone="positive"
            subtext={formatSharePct(activeCount)}
            loading={loading}
          />
          <GlassStatCard
            title="Inactive Users"
            value={inactiveCount}
            icon="person_off"
            tone="negative"
            subtext={formatSharePct(inactiveCount)}
            loading={loading}
          />
        </section>

        {createSuccess ? (
          <div className="relative overflow-hidden rounded-[28px] border border-emerald-200/70 bg-emerald-50/80 p-4 shadow-sm backdrop-blur-xl dark:border-emerald-900/40 dark:bg-emerald-950/20">
            <div className="flex items-center gap-3 text-sm text-emerald-700 dark:text-emerald-300">
              <span className="material-symbols-outlined">check_circle</span>
              {createSuccess}
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="relative overflow-hidden rounded-[28px] border border-rose-200/70 bg-rose-50/80 p-4 shadow-sm backdrop-blur-xl dark:border-rose-900/40 dark:bg-rose-950/20">
            <div className="flex items-center gap-3 text-sm text-rose-700 dark:text-rose-300">
              <span className="material-symbols-outlined">error</span>
              {error}
            </div>
          </div>
        ) : null}

        <GlassSection
          title="Users Directory"
          description="Live list from /api/v2/users"
          action={
            <div className="w-full md:w-[320px]">
              <GlassInput
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by email, username, or role..."
                type="text"
              />
            </div>
          }
        >
          <div className="overflow-hidden rounded-[18px] border border-slate-200/70 dark:border-white/10">
            <div className="max-h-[580px] overflow-auto">
              <table className="w-full text-left">
                <thead className="sticky top-0 z-10 bg-slate-50 text-[11px] uppercase tracking-[0.16em] text-slate-500 backdrop-blur dark:bg-slate-800/80 dark:text-slate-400">
                  <tr>
                    <th className="px-5 py-3.5 font-bold">User</th>
                    <th className="px-5 py-3.5 font-bold">Role</th>
                    <th className="px-5 py-3.5 font-bold">Status</th>
                    <th className="px-5 py-3.5 font-bold">Created</th>
                    <th className="w-10 px-5 py-3.5" />
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index}>
                        {Array.from({ length: 5 }).map((__, cellIndex) => (
                          <td key={cellIndex} className="px-5 py-3.5">
                            <div className="h-4 animate-pulse rounded bg-slate-100 dark:bg-slate-800/70" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-14 text-center">
                        <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600">
                          person_search
                        </span>
                        <p className="mt-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
                          No users found
                        </p>
                        <p className={`mt-1 text-xs ${MUTED_FG}`}>
                          {search
                            ? "Try a different search term."
                            : "Create your first user to get started."}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                      const role = getRoleMeta(user.role);
                      return (
                        <tr
                          key={user.id}
                          className="group cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40"
                          onClick={() => handleOpenUserDetails(user.id)}
                        >
                          {/* Identity reads as one unit — avatar, name, email —
                              instead of three columns the eye has to reassemble. */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <span
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-black uppercase ${role.tint}`}
                              >
                                {(user.username || user.email).slice(0, 1)}
                              </span>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                                  {formatProfileName(user.username, user.email)}
                                </p>
                                <p className={`truncate text-xs ${MUTED_FG}`}>
                                  {user.email}
                                  <span className="ml-2 tabular-nums opacity-60">
                                    #{user.id}
                                  </span>
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-3.5">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${role.tint}`}
                            >
                              <span className="material-symbols-outlined text-[14px]">
                                {role.icon}
                              </span>
                              {formatRoleLabel(user.role)}
                            </span>
                          </td>

                          <td className="px-5 py-3.5">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusBadgeClass(
                                user.is_active,
                              )}`}
                            >
                              <span className="material-symbols-outlined text-[14px]">
                                {user.is_active ? "check_circle" : "cancel"}
                              </span>
                              {user.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>

                          <td
                            className={`whitespace-nowrap px-5 py-3.5 text-xs tabular-nums ${MUTED_FG}`}
                          >
                            {formatDate(user.created_at)}
                          </td>

                          {/* Rows open a detail modal on click; this makes that
                              affordance visible instead of leaving it hidden. */}
                          <td className="px-5 py-3.5 text-right">
                            <span className="material-symbols-outlined text-lg text-slate-300 transition-colors group-hover:text-primary dark:text-slate-600">
                              chevron_right
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </GlassSection>
      </div>

      {showCreate ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeCreateModal();
          }}
        >
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200 dark:border-slate-800 dark:bg-slate-900">
            <div className="h-1 w-full bg-primary" />

            <div className="flex items-start justify-between gap-4 px-6 pt-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
                  <span className="material-symbols-outlined text-[20px]">
                    person_add
                  </span>
                </span>
                <div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                    Create user
                  </h3>
                  <p className={`text-xs ${MUTED_FG}`}>
                    Add a new account to the platform
                  </p>
                </div>
              </div>

              <button
                onClick={closeCreateModal}
                className={`rounded-lg p-1.5 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white ${MUTED_FG}`}
                type="button"
                aria-label="Close"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
              {createError ? (
                <div className="mb-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
                  <span className="material-symbols-outlined text-base">error</span>
                  <span>{createError}</span>
                </div>
              ) : null}

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="new-user-email"
                    className="text-sm font-medium text-slate-900 dark:text-white"
                  >
                    Email
                  </label>
                  <GlassInput
                    id="new-user-email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="name@company.com"
                    type="email"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="new-user-password"
                    className="text-sm font-medium text-slate-900 dark:text-white"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <GlassInput
                      id="new-user-password"
                      value={form.password}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, password: e.target.value }))
                      }
                      placeholder="Minimum 8 characters"
                      type={showCreatePassword ? "text" : "password"}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCreatePassword((prev) => !prev)}
                      className={`absolute inset-y-0 right-0 flex items-center pr-3 transition hover:text-slate-900 dark:hover:text-white ${MUTED_FG}`}
                      aria-label={showCreatePassword ? "Hide password" : "Show password"}
                    >
                      <span className="material-symbols-outlined text-lg">
                        {showCreatePassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="new-user-username"
                    className="text-sm font-medium text-slate-900 dark:text-white"
                  >
                    Username <span className={`font-normal ${MUTED_FG}`}>(optional)</span>
                  </label>
                  <GlassInput
                    id="new-user-username"
                    value={form.username}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        username: capitalizeProfileName(e.target.value),
                      }))
                    }
                    placeholder="Display name"
                    type="text"
                  />
                </div>

                <RolePicker
                  value={form.role}
                  onChange={(role) =>
                    setForm((prev) => ({ ...prev, role }))
                  }
                />

                <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                      {formatProfileName(
                        form.username,
                        form.email.trim() || "New user",
                      )}
                    </p>
                    <p className={`truncate text-xs ${MUTED_FG}`}>
                      {form.email.trim() || "No email yet"}
                    </p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
                    <span className="material-symbols-outlined text-sm">shield</span>
                    {ROLE_OPTIONS.find((item) => item.value === form.role)?.label ??
                      form.role}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4 dark:border-slate-800">
              <button
                onClick={closeCreateModal}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateUser}
                disabled={creating}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                type="button"
              >
                {creating ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Creating...
                  </>
                ) : (
                  "Create user"
                )}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showDetails ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-md">
          <div className="relative flex max-h-[96vh] w-full max-w-5xl flex-col overflow-hidden rounded-[13px] border border-white/40 bg-gradient-to-br from-[rgb(255,255,255)]/95 via-[rgb(244,249,255)]/90 to-[rgb(233,246,255)]/85 shadow-[0_24px_80px_rgba(15,23,42,0.20)] backdrop-blur-2xl dark:border-white/10 dark:from-[rgb(18,26,42)]/95 dark:via-[rgb(21,31,49)]/92 dark:to-[rgb(31,23,43)]/90">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/15 via-[rgb(255,255,255)]/35 to-[rgb(125,211,252)]/20 dark:from-primary/12 dark:via-white/5 dark:to-[rgb(56,189,248)]/10" />
            <div className="pointer-events-none absolute right-0 top-0 h-36 w-36 rounded-full bg-[rgb(56,189,248)]/20 blur-3xl dark:bg-[rgb(14,165,233)]/20" />

            {/* Header */}
            <div className="relative shrink-0 border-b border-white/30 px-6 py-4 dark:border-white/10">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">User Details</h3>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="rounded-xl border border-white/40 bg-white/60 px-3 py-2 text-xs font-bold text-slate-700 backdrop-blur-md dark:border-white/10 dark:bg-white/10 dark:text-slate-200"
                  type="button"
                >
                  Close
                </button>
              </div>

              {deleteError ? (
                <div className="mt-4 rounded-2xl border border-rose-200/70 bg-rose-50/80 px-4 py-3 text-sm text-rose-700 backdrop-blur-md dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300">
                  {deleteError}
                </div>
              ) : null}

              {selectedUserDetails ? (
                <div className="mt-4 relative overflow-hidden rounded-2xl border border-white/40 bg-white/55 p-4 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/10">
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-[rgb(56,189,248)]/10 dark:from-primary/15 dark:to-[rgb(56,189,248)]/10" />
                  <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="mt-1 truncate text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                        {formatProfileName(
                          selectedUserDetails.username,
                          selectedUserDetails.email,
                        )}
                      </p>
                    </div>
                    <div className="shrink-0">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                        Role
                      </p>
                      <span className="mt-1 inline-flex items-center gap-1.5 rounded-xl bg-primary/10 px-4 py-2 text-sm font-black text-primary">
                        <span className="material-symbols-outlined text-base">shield</span>
                        {formatRoleLabel(selectedUserDetails.role)}
                      </span>
                    </div>
                  </div>

                  {canResetSelectedUserPassword || canDeleteSelectedUser ? (
                    <div className="relative mt-4 flex flex-wrap justify-end gap-2">
                      {canResetSelectedUserPassword ? (
                        <button
                          onClick={handleOpenResetPassword}
                          className="inline-flex items-center gap-2 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-2.5 text-sm font-bold text-primary shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-primary/15"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-base">lock_reset</span>
                          Reset Password
                        </button>
                      ) : null}
                      {canDeleteSelectedUser ? (
                        <button
                          onClick={handleDeleteUser}
                          disabled={deleteLoading}
                          className="inline-flex items-center gap-2 rounded-2xl border border-rose-400/20 bg-rose-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-rose-500/20 transition duration-200 hover:-translate-y-0.5 hover:border-rose-300/40 hover:bg-rose-600 hover:shadow-[0_16px_36px_rgba(244,63,94,0.28)] disabled:cursor-not-allowed disabled:opacity-60"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                          {deleteLoading ? "Deleting..." : "Delete User"}
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

            {/* Body */}
            <div className="relative flex-1 overflow-y-auto p-6">
              {detailsLoading ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="rounded-2xl border border-white/40 bg-white/55 p-4 backdrop-blur-lg dark:border-white/10 dark:bg-white/5">
                        <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                        <div className="mt-3 h-6 w-20 animate-pulse rounded bg-slate-100 dark:bg-slate-800/70" />
                      </div>
                    ))}
                  </div>
                  <div className="rounded-2xl border border-white/40 bg-white/55 p-5 backdrop-blur-lg dark:border-white/10 dark:bg-white/5">
                    <div className="h-4 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                      {Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className="h-12 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800/70" />
                      ))}
                    </div>
                  </div>
                </div>
              ) : detailsError ? (
                <div className="rounded-2xl border border-rose-200/70 bg-rose-50/80 p-4 text-sm text-rose-700 backdrop-blur-md dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300">
                  {detailsError}
                </div>
              ) : selectedUserDetails ? (
                <div className="space-y-0 divide-y divide-white/30 overflow-hidden rounded-[24px] border border-white/40 bg-white/40 backdrop-blur-xl dark:divide-white/10 dark:border-white/10 dark:bg-white/5">

                  {/* Profile */}
                  <div className="px-5 py-4">
                    <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Profile</p>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-3 md:grid-cols-3">
                      {[
                        { label: "ID", value: selectedUserDetails.id },
                        { label: "Email", value: selectedUserDetails.email },
                        {
                          label: "Username",
                          value: formatProfileName(
                            selectedUserDetails.username,
                            "-",
                          ),
                        },
                        { label: "Role", value: formatRoleLabel(selectedUserDetails.role) },
                        { label: "Position", value: selectedUserDetails.position },
                        { label: "Status", value: selectedUserDetails.is_active ? "Active" : "Inactive" },
                        { label: "Created", value: formatDate(selectedUserDetails.created_at) },
                        { label: "Last Login", value: formatDate(selectedUserDetails.last_login) },
                        { label: "Last Active", value: formatDate(selectedUserDetails.last_active_at) },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</p>
                          <p className="mt-0.5 text-sm font-medium text-slate-800 dark:text-slate-100 break-all">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Points + Conversions */}
                  <div className="grid grid-cols-1 divide-y divide-white/30 md:grid-cols-2 md:divide-x md:divide-y-0 dark:divide-white/10">
                    <div className="px-5 py-4">
                      <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Points</p>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                        {[
                          { label: "Balance", value: selectedUserDetails.points.balance },
                          { label: "Total Topup", value: selectedUserDetails.points.total_topup },
                          { label: "Total Spent", value: selectedUserDetails.points.total_spent },
                          { label: "Total Refunded", value: selectedUserDetails.points.total_refunded },
                          { label: "Last Activity", value: formatDate(selectedUserDetails.points.last_points_activity_at) },
                        ].map(({ label, value }) => (
                          <div key={label}>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</p>
                            <p className="mt-0.5 text-sm font-medium text-slate-800 dark:text-slate-100">{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="px-5 py-4">
                      <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Conversions</p>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                        {[
                          { label: "Total", value: selectedUserDetails.conversions.total },
                          { label: "Success", value: selectedUserDetails.conversions.success },
                          { label: "Failed", value: selectedUserDetails.conversions.failed },
                          { label: "Processing", value: selectedUserDetails.conversions.processing },
                          { label: "Last Conversion", value: formatDate(selectedUserDetails.conversions.last_conversion_at) },
                        ].map(({ label, value }) => (
                          <div key={label}>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</p>
                            <p className="mt-0.5 text-sm font-medium text-slate-800 dark:text-slate-100">{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Active APIs */}
                  <div className="px-5 py-4">
                    <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Active APIs</p>
                    {selectedUserDetails.active_apis.length === 0 ? (
                      <p className="text-sm text-slate-400 dark:text-slate-500">No active APIs.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {selectedUserDetails.active_apis.map((api) => (
                          <span key={api.action} className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            {api.label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* All API Permissions */}
                  <div className="px-5 py-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">All API Permissions</p>
                      <Link
                        href={`/admin/api-permissions?userId=${selectedUserDetails.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/40 bg-white/60 px-3 py-1.5 text-[11px] font-bold text-primary shadow-sm backdrop-blur-md transition hover:bg-white/80 dark:border-white/10 dark:bg-white/10"
                      >
                        <span className="material-symbols-outlined text-sm">manage_search</span>
                        Lookup User
                      </Link>
                    </div>
                    {allowedApiPermissions.length === 0 ? (
                      <p className="text-sm text-slate-400 dark:text-slate-500">
                        No allowed API permissions.
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead>
                            <tr className="border-b border-white/30 dark:border-white/10">
                              <th className="pb-2 pr-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Action</th>
                              <th className="pb-2 pr-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Allowed</th>
                              <th className="pb-2 pr-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Success Rate</th>
                              <th className="pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Last Used</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/20 dark:divide-white/5">
                            {allowedApiPermissions.map((api) => (
                              <tr key={api.action}>
                                <td className="py-2.5 pr-4 font-medium text-slate-800 dark:text-slate-100">{api.label}</td>
                                <td className="py-2.5 pr-4">
                                  <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                                    Yes
                                  </span>
                                </td>
                                <td className="py-2.5 pr-4 text-slate-600 dark:text-slate-300">{api.success_rate.toFixed(1)}%</td>
                                <td className="py-2.5 text-slate-500 dark:text-slate-400">{formatDate(api.last_used_at)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {showResetPassword && selectedUserDetails ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/35 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-md overflow-hidden rounded-[13px] border border-white/40 bg-gradient-to-br from-[rgb(255,255,255)]/95 via-[rgb(244,249,255)]/90 to-[rgb(233,246,255)]/85 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.20)] backdrop-blur-2xl dark:border-white/10 dark:bg-gradient-to-br dark:from-[rgb(18,26,42)]/95 dark:via-[rgb(21,31,49)]/92 dark:to-[rgb(31,23,43)]/90">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/15 via-[rgb(255,255,255)]/35 to-[rgb(125,211,252)]/20 dark:from-primary/12 dark:via-white/5 dark:to-[rgb(56,189,248)]/10" />

            <div className="relative flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Reset Password
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Set a new password for{" "}
                  <span className="font-semibold">
                    {selectedUserDetails.email}
                  </span>
                  . They won&apos;t need their old password.
                </p>
              </div>
              <button
                onClick={() => setShowResetPassword(false)}
                className="rounded-xl border border-white/40 bg-white/60 px-3 py-2 text-xs font-bold text-slate-700 backdrop-blur-md dark:border-white/10 dark:bg-white/10 dark:text-slate-200"
                type="button"
              >
                Close
              </button>
            </div>

            {resetPasswordError ? (
              <div className="relative mt-4 rounded-2xl border border-rose-200/70 bg-rose-50/80 px-4 py-3 text-sm text-rose-700 backdrop-blur-md dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300">
                {resetPasswordError}
              </div>
            ) : null}

            <div className="relative mt-5 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  New Password
                </label>
                <GlassInput
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Confirm New Password
                </label>
                <GlassInput
                  type="password"
                  autoComplete="new-password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Re-enter the new password"
                />
              </div>
            </div>

            <div className="relative mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowResetPassword(false)}
                disabled={resetPasswordLoading}
                className="rounded-xl border border-white/40 bg-white/60 px-4 py-2.5 text-sm font-bold text-slate-700 backdrop-blur-md disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/10 dark:text-slate-200"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={handleResetPassword}
                disabled={
                  resetPasswordLoading ||
                  !newPassword ||
                  !confirmNewPassword
                }
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                type="button"
              >
                <span className="material-symbols-outlined text-base">
                  lock_reset
                </span>
                {resetPasswordLoading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
