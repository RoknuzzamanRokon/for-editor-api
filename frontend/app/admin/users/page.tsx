"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://127.0.0.1:8000";

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

const ROLE_OPTIONS = [
  {
    value: "general_user",
    label: "General User",
    icon: "person",
    description: "Standard access for everyday conversion work.",
    classes:
      "from-[rgba(59,130,246,0.18)] via-[rgba(56,189,248,0.10)] to-[rgba(255,255,255,0.72)] text-blue-700 border-blue-200/70 dark:from-[rgba(37,99,235,0.28)] dark:via-[rgba(14,165,233,0.18)] dark:to-[rgba(15,23,42,0.72)] dark:text-blue-200 dark:border-blue-400/20",
    glow: "bg-[rgba(59,130,246,0.22)] dark:bg-[rgba(37,99,235,0.32)]",
  },
  {
    value: "admin_user",
    label: "Admin User",
    icon: "admin_panel_settings",
    description: "Operational control with elevated management access.",
    classes:
      "from-[rgba(16,185,129,0.18)] via-[rgba(34,197,94,0.10)] to-[rgba(255,255,255,0.72)] text-emerald-700 border-emerald-200/70 dark:from-[rgba(5,150,105,0.28)] dark:via-[rgba(34,197,94,0.16)] dark:to-[rgba(15,23,42,0.72)] dark:text-emerald-200 dark:border-emerald-400/20",
    glow: "bg-[rgba(16,185,129,0.22)] dark:bg-[rgba(5,150,105,0.32)]",
  },
  {
    value: "demo_user",
    label: "Demo User",
    icon: "smart_display",
    description: "Restricted access suited for guided demos and trials.",
    classes:
      "from-[rgba(249,115,22,0.18)] via-[rgba(251,191,36,0.10)] to-[rgba(255,255,255,0.72)] text-orange-700 border-orange-200/70 dark:from-[rgba(194,65,12,0.30)] dark:via-[rgba(249,115,22,0.16)] dark:to-[rgba(15,23,42,0.72)] dark:text-orange-200 dark:border-orange-400/20",
    glow: "bg-[rgba(249,115,22,0.22)] dark:bg-[rgba(194,65,12,0.32)]",
  },
  {
    value: "super_user",
    label: "Super User",
    icon: "shield",
    description: "Full platform access with highest-level privileges.",
    classes:
      "from-[rgba(168,85,247,0.18)] via-[rgba(236,72,153,0.10)] to-[rgba(255,255,255,0.72)] text-fuchsia-700 border-fuchsia-200/70 dark:from-[rgba(147,51,234,0.28)] dark:via-[rgba(236,72,153,0.16)] dark:to-[rgba(15,23,42,0.72)] dark:text-fuchsia-200 dark:border-fuchsia-400/20",
    glow: "bg-[rgba(168,85,247,0.22)] dark:bg-[rgba(147,51,234,0.32)]",
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

function GlassStatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-[28px] border border-white/40 bg-gradient-to-br from-[rgb(255,255,255)] via-[rgb(240,248,255)] to-[rgb(232,246,255)] p-5 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.12)] dark:border-white/10 dark:bg-gradient-to-br dark:from-[rgb(20,27,40)] dark:via-[rgb(19,31,51)] dark:to-[rgb(31,21,43)]">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/18 via-[rgb(255,255,255)]/45 to-[rgb(125,211,252)]/25 dark:from-primary/20 dark:via-white/5 dark:to-[rgb(56,189,248)]/10" />
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[rgb(56,189,248)]/20 blur-3xl dark:bg-[rgb(14,165,233)]/20" />

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
      </div>
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
    <section className="relative overflow-hidden rounded-[32px] border border-white/40 bg-gradient-to-br from-[rgb(255,255,255)] via-[rgb(244,250,255)] to-[rgb(236,247,255)] shadow-[0_20px_50px_rgba(15,23,42,0.10)] backdrop-blur-2xl dark:border-white/10 dark:bg-gradient-to-br dark:from-[rgb(17,24,39)] dark:via-[rgb(21,30,48)] dark:to-[rgb(31,23,46)]">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/12 via-[rgb(255,255,255)]/35 to-[rgb(147,197,253)]/20 dark:from-primary/15 dark:via-white/5 dark:to-[rgb(96,165,250)]/10" />
      <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-[rgb(96,165,250)]/18 blur-3xl dark:bg-[rgb(59,130,246)]/20" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/20" />

      <div className="relative border-b border-white/30 px-6 py-5 dark:border-white/10">
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

      <div className="relative p-6">{children}</div>
    </section>
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

function RolePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          User Type
        </p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Choose a role with the right permission level.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {ROLE_OPTIONS.map((role) => {
          const selected = value === role.value;

          return (
            <button
              key={role.value}
              type="button"
              onClick={() => onChange(role.value)}
              className={`group relative overflow-hidden rounded-[26px] border bg-gradient-to-br p-4 text-left shadow-[0_12px_35px_rgba(15,23,42,0.08)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.12)] dark:shadow-[0_14px_36px_rgba(2,6,23,0.22)] ${role.classes} ${
                selected
                  ? "ring-4 ring-primary/20"
                  : "border-white/40 dark:border-white/10"
              }`}
            >
              <div
                className={`absolute -right-8 -top-8 h-24 w-24 rounded-full blur-3xl transition ${role.glow}`}
              />
              <div className="relative flex items-start justify-between gap-3">
                <div>
                  <div className="inline-flex rounded-2xl border border-white/50 bg-white/65 p-3 backdrop-blur-md dark:border-white/10 dark:bg-white/10">
                    <span className="material-symbols-outlined text-[22px]">
                      {role.icon}
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-black tracking-tight">
                    {role.label}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">
                    {role.description}
                  </p>
                </div>

                <div
                  className={`mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs ${
                    selected
                      ? "border-primary bg-primary text-white"
                      : "border-slate-300/70 bg-white/70 text-slate-400 dark:border-white/15 dark:bg-white/10 dark:text-slate-500"
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">
                    {selected ? "check" : "add"}
                  </span>
                </div>
              </div>
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
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
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

  const canDeleteSelectedUser =
    me?.role === "super_user" &&
    !!selectedUserDetails &&
    me.id !== selectedUserDetails.id;

  return (
    <AdminShell>
      <div className="mx-auto max-w-8xl space-y-8 p-6 md:p-8">
        <section className="relative overflow-hidden rounded-[32px] border border-white/40 bg-gradient-to-br from-[rgb(255,255,255)] via-[rgb(242,249,255)] to-[rgb(232,244,255)] p-8 shadow-[0_20px_60px_rgba(15,23,42,0.10)] backdrop-blur-2xl dark:border-white/10 dark:bg-gradient-to-br dark:from-[rgb(18,24,38)] dark:via-[rgb(19,30,50)] dark:to-[rgb(36,23,46)]">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/18 via-[rgb(255,255,255)]/45 to-[rgb(125,211,252)]/30 dark:from-primary/15 dark:via-white/5 dark:to-[rgb(56,189,248)]/12" />
          <div className="absolute -left-16 top-0 h-40 w-40 rounded-full bg-[rgb(59,130,246)]/20 blur-3xl dark:bg-[rgb(37,99,235)]/20" />
          <div className="absolute -right-10 bottom-0 h-44 w-44 rounded-full bg-[rgb(56,189,248)]/20 blur-3xl dark:bg-[rgb(14,165,233)]/20" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/20" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/60 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-primary backdrop-blur-md dark:border-white/10 dark:bg-white/10">
                <span className="material-symbols-outlined text-sm">group</span>
                Users Management
              </div>

              <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 dark:text-white md:text-4xl">
                Admin Users
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
                Manage users, inspect account details, and create new accounts
                with the same liquid glass design system as the admin profile
                page.
              </p>
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

              <div className="rounded-2xl border border-white/40 bg-white/60 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/10 dark:text-slate-200">
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
          />
          <GlassStatCard
            title="Active Users"
            value={activeCount}
            icon="verified_user"
          />
          <GlassStatCard
            title="Inactive Users"
            value={inactiveCount}
            icon="person_off"
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
          <div className="overflow-hidden rounded-[24px] border border-white/40 bg-gradient-to-br from-[rgb(255,255,255)]/85 via-[rgb(245,250,255)]/85 to-[rgb(238,247,255)]/80 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-gradient-to-br dark:from-[rgb(18,25,39)]/80 dark:via-[rgb(22,30,47)]/85 dark:to-[rgb(30,23,44)]/85">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/50 text-xs uppercase tracking-[0.16em] text-slate-500 backdrop-blur-md dark:bg-white/5 dark:text-slate-400">
                  <tr>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Username</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Created At</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/30 dark:divide-white/10">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-8 text-sm text-slate-500 dark:text-slate-400"
                      >
                        Loading users...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-8 text-sm text-slate-500 dark:text-slate-400"
                      >
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="cursor-pointer transition hover:bg-white/40 dark:hover:bg-white/5"
                        onClick={() => handleOpenUserDetails(user.id)}
                      >
                        <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">
                          {user.id}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-200">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-200">
                          {user.username || "-"}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-200">
                          {user.role}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusBadgeClass(
                              user.is_active,
                            )}`}
                          >
                            {user.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                          {new Date(user.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </GlassSection>
      </div>

      {showCreate ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-lg overflow-hidden rounded-[32px] border border-white/40 bg-gradient-to-br from-[rgb(255,255,255)]/95 via-[rgb(244,249,255)]/90 to-[rgb(233,246,255)]/85 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.20)] backdrop-blur-2xl dark:border-white/10 dark:bg-gradient-to-br dark:from-[rgb(18,26,42)]/95 dark:via-[rgb(21,31,49)]/92 dark:to-[rgb(31,23,43)]/90">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-[rgb(255,255,255)]/35 to-[rgb(125,211,252)]/20 dark:from-primary/12 dark:via-white/5 dark:to-[rgb(56,189,248)]/10" />
            <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-[rgb(56,189,248)]/20 blur-3xl dark:bg-[rgb(14,165,233)]/20" />

            <div className="relative">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Create User
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    POST /api/v2/users
                  </p>
                </div>

                <button
                  onClick={() => setShowCreate(false)}
                  className="rounded-xl border border-white/40 bg-white/60 px-3 py-2 text-xs font-bold text-slate-700 backdrop-blur-md dark:border-white/10 dark:bg-white/10 dark:text-slate-200"
                  type="button"
                >
                  Close
                </button>
              </div>

              {createError ? (
                <div className="mt-4 rounded-2xl border border-rose-200/70 bg-rose-50/80 px-4 py-3 text-sm text-rose-700 backdrop-blur-md dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300">
                  {createError}
                </div>
              ) : null}

              <div className="mt-5 space-y-3">
                <GlassInput
                  value={form.email}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="Email"
                  type="email"
                />
                <GlassInput
                  value={form.password}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, password: e.target.value }))
                  }
                  placeholder="Password"
                  type="password"
                />
                <GlassInput
                  value={form.username}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, username: e.target.value }))
                  }
                  placeholder="Username (optional)"
                  type="text"
                />
                <RolePicker
                  value={form.role}
                  onChange={(role) =>
                    setForm((prev) => ({ ...prev, role }))
                  }
                />

                <div className="relative overflow-hidden rounded-[26px] border border-white/40 bg-gradient-to-br from-[rgb(255,255,255)]/80 via-[rgb(244,249,255)]/85 to-[rgb(232,244,255)]/80 p-5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-gradient-to-br dark:from-[rgb(19,27,41)]/85 dark:via-[rgb(21,31,49)]/88 dark:to-[rgb(29,24,44)]/88">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-[rgb(56,189,248)]/10 dark:from-primary/15 dark:to-[rgb(56,189,248)]/10" />
                  <div className="relative">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                      User Preview
                    </p>

                    <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                          Username
                        </p>
                        <p className="mt-1 truncate text-xl font-black tracking-tight text-slate-900 dark:text-white">
                          {form.username.trim() || form.email.trim() || "New User"}
                        </p>
                      </div>

                      <div className="shrink-0">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                          Role
                        </p>
                        <span className="mt-1 inline-flex items-center gap-1.5 rounded-xl bg-primary/10 px-4 py-2 text-sm font-black text-primary">
                          <span className="material-symbols-outlined text-base">
                            shield
                          </span>
                          {ROLE_OPTIONS.find((item) => item.value === form.role)?.label ??
                            form.role}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowCreate(false)}
                  className="rounded-2xl border border-white/40 bg-white/60 px-4 py-2.5 text-sm font-semibold text-slate-700 backdrop-blur-md dark:border-white/10 dark:bg-white/10 dark:text-slate-200"
                  type="button"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateUser}
                  disabled={creating}
                  className="rounded-2xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  type="button"
                >
                  {creating ? "Creating..." : "Create User"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {showDetails ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-md">
          <div className="relative flex max-h-[96vh] w-full max-w-5xl flex-col overflow-hidden rounded-[32px] border border-white/40 bg-gradient-to-br from-[rgb(255,255,255)]/95 via-[rgb(244,249,255)]/90 to-[rgb(233,246,255)]/85 shadow-[0_24px_80px_rgba(15,23,42,0.20)] backdrop-blur-2xl dark:border-white/10 dark:from-[rgb(18,26,42)]/95 dark:via-[rgb(21,31,49)]/92 dark:to-[rgb(31,23,43)]/90">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/15 via-[rgb(255,255,255)]/35 to-[rgb(125,211,252)]/20 dark:from-primary/12 dark:via-white/5 dark:to-[rgb(56,189,248)]/10" />
            <div className="pointer-events-none absolute right-0 top-0 h-36 w-36 rounded-full bg-[rgb(56,189,248)]/20 blur-3xl dark:bg-[rgb(14,165,233)]/20" />

            {/* Header */}
            <div className="relative shrink-0 border-b border-white/30 px-6 py-4 dark:border-white/10">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">User Details</h3>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    GET /api/v3/admin/check-users/{selectedUserDetails?.id ?? ""}
                  </p>
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
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                        Username
                      </p>
                      <p className="mt-1 truncate text-xl font-black tracking-tight text-slate-900 dark:text-white">
                        {selectedUserDetails.username || selectedUserDetails.email}
                      </p>
                    </div>
                    <div className="shrink-0">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                        Role
                      </p>
                      <span className="mt-1 inline-flex items-center gap-1.5 rounded-xl bg-primary/10 px-4 py-2 text-sm font-black text-primary">
                        <span className="material-symbols-outlined text-base">shield</span>
                        {selectedUserDetails.role}
                      </span>
                    </div>
                  </div>

                  {canDeleteSelectedUser ? (
                    <div className="relative mt-4 flex justify-end">
                      <button
                        onClick={handleDeleteUser}
                        disabled={deleteLoading}
                        className="inline-flex items-center gap-2 rounded-2xl border border-rose-400/20 bg-rose-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-rose-500/20 transition duration-200 hover:-translate-y-0.5 hover:border-rose-300/40 hover:bg-rose-600 hover:shadow-[0_16px_36px_rgba(244,63,94,0.28)] disabled:cursor-not-allowed disabled:opacity-60"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                        {deleteLoading ? "Deleting..." : "Delete User"}
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

            {/* Body */}
            <div className="relative flex-1 overflow-y-auto p-6">
              {detailsLoading ? (
                <div className="rounded-2xl border border-white/40 bg-white/55 p-4 text-sm text-slate-500 backdrop-blur-lg dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                  Loading user details...
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
                        { label: "Username", value: selectedUserDetails.username || "-" },
                        { label: "Role", value: selectedUserDetails.role },
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
                          {selectedUserDetails.api_permissions.map((api) => (
                            <tr key={api.action}>
                              <td className="py-2.5 pr-4 font-medium text-slate-800 dark:text-slate-100">{api.label}</td>
                              <td className="py-2.5 pr-4">
                                <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${api.allowed ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" : "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300"}`}>
                                  {api.allowed ? "Yes" : "No"}
                                </span>
                              </td>
                              <td className="py-2.5 pr-4 text-slate-600 dark:text-slate-300">{api.success_rate.toFixed(1)}%</td>
                              <td className="py-2.5 text-slate-500 dark:text-slate-400">{formatDate(api.last_used_at)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </AdminShell>
  );
}
