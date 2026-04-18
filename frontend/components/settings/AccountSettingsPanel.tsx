"use client";

import type { FormEvent, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AVATAR_PRESETS, AvatarBadge, type AvatarKey } from "@/lib/accountAvatar";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://127.0.0.1:8000";

type ThemeName =
  | "light"
  | "dark"
  | "ocean"
  | "sunset"
  | "forest"
  | "midnight"
  | "livedark";

type AccountSettingsResponse = {
  identity: {
    id: number;
    email: string;
    username: string | null;
    role: string;
    created_at: string;
    last_login: string | null;
  };
  preferences: {
    theme: ThemeName;
    avatar_key: AvatarKey;
    security_alerts_enabled: boolean;
    login_notifications_enabled: boolean;
    profile_private: boolean;
  };
};

function formatDate(value?: string | null) {
  if (!value) return "Never";
  return new Date(value).toLocaleString();
}

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function SectionCard({
  title,
  description,
  action,
  hoverable = true,
  children,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  hoverable?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm dark:border-slate-800/80 dark:bg-slate-900/80",
        hoverable &&
          "transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/20 dark:hover:shadow-slate-900/30",
      )}
    >
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-slate-800/40",
          hoverable
            ? "opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            : "opacity-100",
        )}
      />
      <div className="relative p-6">
        <div className="flex flex-col gap-3 border-b border-slate-200/60 pb-5 dark:border-slate-800/60 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              {title}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {description}
            </p>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
        <div className="pt-5">{children}</div>
      </div>
    </section>
  );
}

function SaveButton({
  label,
  saving,
  disabled,
}: {
  label: string;
  saving?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={disabled || saving}
      className="group relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-primary to-primary/80 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
    >
      <span className="relative z-10 flex items-center gap-2">
        {saving ? (
          <>
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Saving...
          </>
        ) : (
          label
        )}
      </span>
    </button>
  );
}

function TextField({
  label,
  value,
  onChange,
  readOnly = false,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange?: (next: string) => void;
  readOnly?: boolean;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </span>
      <input
        type={type}
        value={value}
        readOnly={readOnly}
        placeholder={placeholder}
        onChange={(event) => onChange?.(event.target.value)}
        className={cn(
          "w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all duration-200 focus:ring-2",
          readOnly
            ? "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400"
            : "border-slate-200 bg-white text-slate-900 focus:border-primary/50 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-primary/50",
        )}
      />
    </label>
  );
}

function ToggleRow({
  title,
  description,
  checked,
  onChange,
  disabled = false,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-slate-200/60 bg-slate-50/50 p-4 transition-all duration-200 hover:bg-slate-100/80 dark:border-slate-800/60 dark:bg-slate-800/30 dark:hover:bg-slate-800/50">
      <div className="pr-4">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">
          {title}
        </p>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
          className="sr-only"
        />
        <div
          className={cn(
            "h-6 w-11 rounded-full transition-all duration-300",
            checked ? "bg-primary" : "bg-slate-300 dark:bg-slate-600",
            disabled && "opacity-50",
          )}
        >
          <div
            className={cn(
              "absolute mt-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-all duration-300",
              checked ? "translate-x-5" : "translate-x-0.5",
            )}
          />
        </div>
      </div>
    </label>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200/60 bg-slate-50/50 px-4 py-3 dark:border-slate-800/60 dark:bg-slate-800/30">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}

function ActionLauncherCard({
  title,
  description,
  icon,
  active,
  onClick,
}: {
  title: string;
  description: string;
  icon: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group rounded-2xl border p-5 text-left transition-all duration-300",
        active
          ? "border-primary bg-primary/10 shadow-lg shadow-primary/15"
          : "border-slate-200/80 bg-white/80 hover:border-primary/30 hover:bg-primary/5 hover:shadow-lg dark:border-slate-800/80 dark:bg-slate-900/80",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div
            className={cn(
              "mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-lg",
              active ? "bg-primary" : "bg-slate-900 dark:bg-slate-700",
            )}
          >
            <span className="material-symbols-outlined">{icon}</span>
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {title}
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {description}
          </p>
        </div>
        <span
          className={cn(
            "material-symbols-outlined text-lg transition-transform duration-300",
            active ? "rotate-90 text-primary" : "text-slate-400",
          )}
        >
          chevron_right
        </span>
      </div>
    </button>
  );
}

export default function AccountSettingsPanel({
  area,
}: {
  area: "admin" | "dashboard";
}) {
  const [openPanel, setOpenPanel] = useState<"profile" | "password" | "avatar" | null>(null);
  const [settings, setSettings] = useState<AccountSettingsResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profileNotice, setProfileNotice] = useState("");
  const [privacyNotice, setPrivacyNotice] = useState("");
  const [passwordNotice, setPasswordNotice] = useState("");
  const [username, setUsername] = useState("");
  const [avatarKey, setAvatarKey] = useState<AvatarKey>("avatar_1");
  const [securityAlertsEnabled, setSecurityAlertsEnabled] = useState(true);
  const [loginNotificationsEnabled, setLoginNotificationsEnabled] =
    useState(true);
  const [profilePrivate, setProfilePrivate] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [savingPrivacy, setSavingPrivacy] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [avatarNotice, setAvatarNotice] = useState("");

  const title = area === "admin" ? "Admin Settings" : "Account Settings";
  const subtitle =
    area === "admin"
      ? "Manage your admin account, password, and privacy preferences."
      : "Manage your account profile, password, and privacy preferences.";

  const syncLocalState = useCallback((payload: AccountSettingsResponse) => {
    setSettings(payload);
    setUsername(payload.identity.username ?? "");
    setAvatarKey(payload.preferences.avatar_key);
    setSecurityAlertsEnabled(payload.preferences.security_alerts_enabled);
    setLoginNotificationsEnabled(
      payload.preferences.login_notifications_enabled,
    );
    setProfilePrivate(payload.preferences.profile_private);
    window.dispatchEvent(
      new CustomEvent("accountsettingschange", {
        detail: payload,
      }),
    );
  }, []);

  const getToken = useCallback(() => {
    const token = window.localStorage.getItem("access_token");
    if (!token) {
      throw new Error("No access token found.");
    }
    return token;
  }, []);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/api/v2/auth/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await response.text();
      if (!response.ok) {
        throw new Error(body || "Failed to load account settings");
      }
      const parsed = JSON.parse(body) as AccountSettingsResponse;
      syncLocalState(parsed);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to load account settings",
      );
    } finally {
      setLoading(false);
    }
  }, [getToken, syncLocalState]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const profileDirty = useMemo(() => {
    return username.trim() !== (settings?.identity.username ?? "");
  }, [settings?.identity.username, username]);

  const privacyDirty =
    securityAlertsEnabled !==
      (settings?.preferences.security_alerts_enabled ?? true) ||
    loginNotificationsEnabled !==
      (settings?.preferences.login_notifications_enabled ?? true) ||
    profilePrivate !== (settings?.preferences.profile_private ?? false);
  const avatarDirty = avatarKey !== (settings?.preferences.avatar_key ?? "avatar_1");
  const openPanelAnimationClass =
    openPanel === "profile"
      ? "settings-panel-enter-left"
      : openPanel === "password"
        ? "settings-panel-enter-center"
        : openPanel === "avatar"
          ? "settings-panel-enter-right"
          : "";

  const updateProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingProfile(true);
    setProfileNotice("");
    setError("");
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/api/v2/auth/settings/profile`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: username.trim() || null }),
      });
      const body = await response.text();
      if (!response.ok) {
        throw new Error(body || "Failed to update profile");
      }
      const parsed = JSON.parse(body) as AccountSettingsResponse;
      syncLocalState(parsed);
      setProfileNotice("Profile updated successfully.");
      setTimeout(() => setProfileNotice(""), 3000);
      setOpenPanel(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const updatePrivacy = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingPrivacy(true);
    setPrivacyNotice("");
    setError("");
    try {
      const token = getToken();
      const response = await fetch(
        `${API_BASE}/api/v2/auth/settings/preferences`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            security_alerts_enabled: securityAlertsEnabled,
            login_notifications_enabled: loginNotificationsEnabled,
            profile_private: profilePrivate,
          }),
        },
      );
      const body = await response.text();
      if (!response.ok) {
        throw new Error(
          body || "Failed to update security and privacy settings",
        );
      }
      const parsed = JSON.parse(body) as AccountSettingsResponse;
      syncLocalState(parsed);
      setPrivacyNotice("Security and privacy settings updated.");
      setTimeout(() => setPrivacyNotice(""), 3000);
      setOpenPanel(null);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update security and privacy settings",
      );
    } finally {
      setSavingPrivacy(false);
    }
  };

  const updateAvatar = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingAvatar(true);
    setAvatarNotice("");
    setError("");
    try {
      const token = getToken();
      const response = await fetch(
        `${API_BASE}/api/v2/auth/settings/preferences`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ avatar_key: avatarKey }),
        },
      );
      const body = await response.text();
      if (!response.ok) {
        throw new Error(body || "Failed to update avatar");
      }
      const parsed = JSON.parse(body) as AccountSettingsResponse;
      syncLocalState(parsed);
      setAvatarNotice("Avatar updated successfully.");
      setTimeout(() => setAvatarNotice(""), 3000);
      setOpenPanel(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update avatar");
    } finally {
      setSavingAvatar(false);
    }
  };

  const updatePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordNotice("");
    setError("");
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setSavingPassword(true);
    try {
      const token = getToken();
      const response = await fetch(
        `${API_BASE}/api/v2/auth/settings/change-password`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            current_password: currentPassword,
            new_password: newPassword,
          }),
        },
      );
      const body = await response.text();
      if (!response.ok) {
        throw new Error(body || "Failed to update password");
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordNotice("Password updated successfully.");
      setTimeout(() => setPasswordNotice(""), 3000);
      setOpenPanel(null);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to update password",
      );
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6 md:p-8">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 p-8 backdrop-blur-sm dark:border-slate-800/80 dark:bg-slate-900/80">
          <div className="h-8 w-56 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
          <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 p-6 backdrop-blur-sm dark:border-slate-800/80 dark:bg-slate-900/80"
            >
              <div className="h-6 w-40 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
              <div className="mt-3 h-4 w-72 max-w-full animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
              <div className="mt-6 space-y-3">
                <div className="h-12 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
                <div className="h-12 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
                <div className="h-12 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-8xl space-y-8 p-6 md:p-8">
      {/* Header Section */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-primary p-8 text-white shadow-xl dark:border-slate-800">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-12 left-0 h-32 w-32 rounded-full bg-primary-foreground/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur">
              <span className="material-symbols-outlined text-base">settings</span>
              Personal Settings
            </p>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-white/80">
              {subtitle}
            </p>
          </div>
          {settings && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
                  Email
                </p>
                <p className="mt-1 text-sm font-medium text-white">
                  {settings.identity.email}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
                  Role
                </p>
                <p className="mt-1 text-sm font-medium text-white">
                  {settings.identity.role}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Error Alert */}
      {error && (
        <div className="animate-in slide-in-from-top-2 fade-in duration-300 rounded-xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm text-rose-700 backdrop-blur-sm dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
          {error}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <ActionLauncherCard
          title="Profile Card"
          description="Open profile details and privacy controls."
          icon="person"
          active={openPanel === "profile"}
          onClick={() =>
            setOpenPanel((current) =>
              current === "profile" ? null : "profile",
            )
          }
        />
        <ActionLauncherCard
          title="Password Manage"
          description="Open password change tools for this account."
          icon="password"
          active={openPanel === "password"}
          onClick={() =>
            setOpenPanel((current) =>
              current === "password" ? null : "password",
            )
          }
        />
        <ActionLauncherCard
          title="Avatar Add"
          description="Open the avatar picker and choose a new look."
          icon="imagesmode"
          active={openPanel === "avatar"}
          onClick={() =>
            setOpenPanel((current) => (current === "avatar" ? null : "avatar"))
          }
        />
      </div>

      <div
        className={cn(
          "overflow-hidden transition-all duration-500 ease-out",
          openPanel
            ? "max-h-[2200px] opacity-100 translate-y-0"
            : "max-h-0 opacity-0 -translate-y-2",
        )}
      >
        <div className={cn("pt-2", openPanelAnimationClass)} key={openPanel ?? "closed"}>
          {openPanel === "avatar" ? (
            <SectionCard
              title="Avatar Add"
              description="Pick the avatar shown in the navbar profile area and account menu."
            >
              <form className="space-y-5" onSubmit={updateAvatar}>
                <div className="flex items-center gap-4 rounded-xl border border-slate-200/60 bg-slate-50/50 p-4 dark:border-slate-800/60 dark:bg-slate-800/30">
                  <AvatarBadge avatarKey={avatarKey} size="lg" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      Selected Avatar
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Changes apply to the top-right profile area and dropdown
                      menu.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {AVATAR_PRESETS.map((avatar) => (
                    <button
                      key={avatar.key}
                      type="button"
                      onClick={() => setAvatarKey(avatar.key)}
                      className={cn(
                        "rounded-xl border p-3 text-center transition-all",
                        avatarKey === avatar.key
                          ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
                          : "border-slate-200/80 bg-slate-50/50 hover:border-primary/30 hover:bg-primary/5 dark:border-slate-800/80 dark:bg-slate-800/30",
                      )}
                    >
                      <AvatarBadge avatarKey={avatar.key} className="mx-auto" />
                      <p className="mt-2 text-xs font-semibold text-slate-900 dark:text-white">
                        {avatar.label}
                      </p>
                    </button>
                  ))}
                </div>
                {avatarNotice && (
                  <p className="animate-in slide-in-from-top-1 fade-in text-sm text-emerald-600 dark:text-emerald-400">
                    {avatarNotice}
                  </p>
                )}
                <div className="flex justify-end">
                  <SaveButton
                    label="Save Avatar"
                    saving={savingAvatar}
                    disabled={!avatarDirty}
                  />
                </div>
              </form>
            </SectionCard>
          ) : null}

          {openPanel === "profile" ? (
            <div className="space-y-6">
              <SectionCard
                title="Profile Card"
                description="Update your username while keeping your email fixed."
              >
                <form className="space-y-4" onSubmit={updateProfile}>
                  <div className="grid gap-4 xl:grid-cols-3">
                    <div className="rounded-xl border border-slate-200/60 bg-slate-50/50 p-4 dark:border-slate-800/60 dark:bg-slate-800/30">
                      <p className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">
                        Profile Info
                      </p>
                      <div className="space-y-3">
                        <InfoCard
                          label="Name"
                          value={settings?.identity.username || "Not set"}
                        />
                        <InfoCard
                          label="Email"
                          value={settings?.identity.email ?? ""}
                        />
                        <InfoCard
                          label="Created At"
                          value={formatDate(settings?.identity.created_at)}
                        />
                        <InfoCard
                          label="Last Login"
                          value={formatDate(settings?.identity.last_login)}
                        />
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200/60 bg-slate-50/50 p-4 dark:border-slate-800/60 dark:bg-slate-800/30">
                      <p className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">
                        Current Name
                      </p>
                      <div className="rounded-xl border border-primary/15 bg-primary/5 px-4 py-5">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Active Username
                        </p>
                        <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
                          {settings?.identity.username || "Not set"}
                        </p>
                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                          This name appears in the navbar and account views.
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200/60 bg-slate-50/50 p-4 dark:border-slate-800/60 dark:bg-slate-800/30">
                      <p className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">
                        Change Name
                      </p>
                      <TextField
                        label="New Username"
                        value={username}
                        onChange={setUsername}
                        placeholder="Enter your username"
                      />
                      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                        Update the username used across your account.
                      </p>
                    </div>
                  </div>
                  {profileNotice && (
                    <p className="animate-in slide-in-from-top-1 fade-in text-sm text-emerald-600 dark:text-emerald-400">
                      {profileNotice}
                    </p>
                  )}
                  <div className="flex justify-end">
                    <SaveButton
                      label="Save Profile"
                      saving={savingProfile}
                      disabled={!profileDirty}
                    />
                  </div>
                </form>
              </SectionCard>
            </div>
          ) : null}

          {openPanel === "password" ? (
            <SectionCard
              title="Password Manage"
              description="Change your password here. Forgot-password email reset is planned for phase 2."
            >
              <form className="space-y-4" onSubmit={updatePassword}>
                <TextField
                  label="Current Password"
                  value={currentPassword}
                  onChange={setCurrentPassword}
                  type="password"
                  placeholder="Enter your current password"
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                    label="New Password"
                    value={newPassword}
                    onChange={setNewPassword}
                    type="password"
                    placeholder="Minimum 8 characters"
                  />
                  <TextField
                    label="Confirm New Password"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    type="password"
                    placeholder="Repeat the new password"
                  />
                </div>
                <div className="rounded-xl border border-dashed border-slate-300/60 bg-slate-50/50 px-4 py-3 text-xs text-slate-600 dark:border-slate-700/60 dark:bg-slate-800/30 dark:text-slate-300">
                  Forgot password is not live yet. The reset-token and email
                  delivery flow is planned for the next backend phase.
                </div>
                {passwordNotice && (
                  <p className="animate-in slide-in-from-top-1 fade-in text-sm text-emerald-600 dark:text-emerald-400">
                    {passwordNotice}
                  </p>
                )}
                <div className="flex justify-end">
                  <SaveButton
                    label="Change Password"
                    saving={savingPassword}
                    disabled={
                      !currentPassword || !newPassword || !confirmPassword
                    }
                  />
                </div>
              </form>
            </SectionCard>
          ) : null}
        </div>
      </div>

      <SectionCard
        title="Privacy Controls"
        description="Control personal notifications and privacy behavior for this account."
        hoverable={false}
      >
        <form className="space-y-4" onSubmit={updatePrivacy}>
          <ToggleRow
            title="Security alerts"
            description="Notify me when the system detects a security-relevant event on my account."
            checked={securityAlertsEnabled}
            onChange={setSecurityAlertsEnabled}
            disabled={savingPrivacy}
          />
          <ToggleRow
            title="Login notifications"
            description="Send me a notification when this account signs in successfully."
            checked={loginNotificationsEnabled}
            onChange={setLoginNotificationsEnabled}
            disabled={savingPrivacy}
          />
          <ToggleRow
            title="Private profile"
            description="Reduce profile visibility in internal account listings where supported."
            checked={profilePrivate}
            onChange={setProfilePrivate}
            disabled={savingPrivacy}
          />
          {privacyNotice && (
            <p className="animate-in slide-in-from-top-1 fade-in text-sm text-emerald-600 dark:text-emerald-400">
              {privacyNotice}
            </p>
          )}
          <div className="flex justify-end">
            <SaveButton
              label="Save Preferences"
              saving={savingPrivacy}
              disabled={!privacyDirty}
            />
          </div>
        </form>
      </SectionCard>
    </div>
  );
}
