"use client";

import type { FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000";

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
    security_alerts_enabled: boolean;
    login_notifications_enabled: boolean;
    profile_private: boolean;
  };
};

const THEMES: Array<{
  id: ThemeName;
  label: string;
  description: string;
  preview: string;
}> = [
  { id: "light", label: "Light", description: "Clean and bright", preview: "linear-gradient(135deg, #ffffff, #e2e8f0)" },
  { id: "dark", label: "Dark", description: "Focused contrast", preview: "linear-gradient(135deg, #0f172a, #334155)" },
  { id: "ocean", label: "Ocean", description: "Cool cyan depth", preview: "linear-gradient(135deg, #0c4a6e, #06b6d4)" },
  { id: "sunset", label: "Sunset", description: "Warm orange glow", preview: "linear-gradient(135deg, #7c2d12, #fb923c)" },
  { id: "forest", label: "Forest", description: "Natural green mood", preview: "linear-gradient(135deg, #14532d, #22c55e)" },
  { id: "midnight", label: "Midnight", description: "Deep blue atmosphere", preview: "linear-gradient(135deg, #0f172a, #2563eb)" },
  { id: "livedark", label: "Live Dark", description: "Black with electric blue", preview: "linear-gradient(135deg, #020617, #3b82f6)" },
];

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
  children,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 dark:border-slate-800 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">{title}</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
        </div>
        {action ? <div>{action}</div> : null}
      </div>
      <div className="pt-5">{children}</div>
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
      className="inline-flex items-center justify-center rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {saving ? "Saving..." : label}
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
      <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</span>
      <input
        type={type}
        value={value}
        readOnly={readOnly}
        placeholder={placeholder}
        onChange={(event) => onChange?.(event.target.value)}
        className={cn(
          "w-full rounded-2xl border px-4 py-3 text-sm outline-none transition",
          readOnly
            ? "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400"
            : "border-slate-200 bg-white text-slate-900 focus:border-primary focus:ring-4 focus:ring-primary/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white",
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
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-800 dark:bg-slate-800/50">
      <div>
        <p className="text-sm font-bold text-slate-900 dark:text-white">{title}</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      <span
        className={cn(
          "relative mt-1 inline-flex h-7 w-12 shrink-0 rounded-full transition",
          checked ? "bg-primary" : "bg-slate-300 dark:bg-slate-700",
          disabled && "opacity-60",
        )}
      >
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
          className="sr-only"
        />
        <span
          className={cn(
            "absolute top-1 h-5 w-5 rounded-full bg-white shadow transition",
            checked ? "left-6" : "left-1",
          )}
        />
      </span>
    </label>
  );
}

export default function AccountSettingsPanel({
  area,
}: {
  area: "admin" | "dashboard";
}) {
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState<AccountSettingsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profileNotice, setProfileNotice] = useState("");
  const [themeNotice, setThemeNotice] = useState("");
  const [privacyNotice, setPrivacyNotice] = useState("");
  const [passwordNotice, setPasswordNotice] = useState("");
  const [username, setUsername] = useState("");
  const [selectedTheme, setSelectedTheme] = useState<ThemeName>("light");
  const [securityAlertsEnabled, setSecurityAlertsEnabled] = useState(true);
  const [loginNotificationsEnabled, setLoginNotificationsEnabled] = useState(true);
  const [profilePrivate, setProfilePrivate] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingTheme, setSavingTheme] = useState(false);
  const [savingPrivacy, setSavingPrivacy] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const title = area === "admin" ? "Admin Settings" : "Account Settings";
  const subtitle =
    area === "admin"
      ? "Manage your own admin account, theme, password, and privacy preferences."
      : "Manage your own account profile, theme, password, and privacy preferences.";

  const syncLocalState = (payload: AccountSettingsResponse) => {
    setSettings(payload);
    setUsername(payload.identity.username ?? "");
    setSelectedTheme(payload.preferences.theme);
    setSecurityAlertsEnabled(payload.preferences.security_alerts_enabled);
    setLoginNotificationsEnabled(payload.preferences.login_notifications_enabled);
    setProfilePrivate(payload.preferences.profile_private);
  };

  const getToken = () => {
    const token = window.localStorage.getItem("access_token");
    if (!token) {
      throw new Error("No access token found.");
    }
    return token;
  };

  const loadSettings = async () => {
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
      setError(err instanceof Error ? err.message : "Failed to load account settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (settings?.preferences.theme && settings.preferences.theme !== theme) {
      setTheme(settings.preferences.theme);
    }
  }, [settings?.preferences.theme, theme, setTheme]);

  const profileDirty = useMemo(() => {
    return username.trim() !== (settings?.identity.username ?? "");
  }, [settings?.identity.username, username]);

  const themeDirty = selectedTheme !== (settings?.preferences.theme ?? "light");

  const privacyDirty =
    securityAlertsEnabled !== (settings?.preferences.security_alerts_enabled ?? true) ||
    loginNotificationsEnabled !== (settings?.preferences.login_notifications_enabled ?? true) ||
    profilePrivate !== (settings?.preferences.profile_private ?? false);

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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const updateTheme = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingTheme(true);
    setThemeNotice("");
    setError("");
    const previousTheme = settings?.preferences.theme ?? theme;
    setTheme(selectedTheme);
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/api/v2/auth/settings/preferences`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ theme: selectedTheme }),
      });
      const body = await response.text();
      if (!response.ok) {
        throw new Error(body || "Failed to save theme");
      }
      const parsed = JSON.parse(body) as AccountSettingsResponse;
      syncLocalState(parsed);
      setTheme(parsed.preferences.theme);
      setThemeNotice("Theme preference saved.");
    } catch (err: unknown) {
      setTheme(previousTheme as ThemeName);
      setError(err instanceof Error ? err.message : "Failed to save theme");
    } finally {
      setSavingTheme(false);
    }
  };

  const updatePrivacy = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingPrivacy(true);
    setPrivacyNotice("");
    setError("");
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/api/v2/auth/settings/preferences`, {
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
      });
      const body = await response.text();
      if (!response.ok) {
        throw new Error(body || "Failed to update security and privacy settings");
      }
      const parsed = JSON.parse(body) as AccountSettingsResponse;
      syncLocalState(parsed);
      setPrivacyNotice("Security and privacy settings updated.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update security and privacy settings");
    } finally {
      setSavingPrivacy(false);
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
    setSavingPassword(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/api/v2/auth/settings/change-password`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });
      const body = await response.text();
      if (!response.ok) {
        throw new Error(body || "Failed to update password");
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordNotice("Password updated successfully.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6 md:p-8">
        <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="h-8 w-56 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="h-6 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              <div className="mt-3 h-4 w-72 max-w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              <div className="mt-6 space-y-3">
                <div className="h-14 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
                <div className="h-14 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
                <div className="h-14 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 md:p-8">
      <section className="rounded-[32px] border border-primary/10 bg-primary/5 p-8 shadow-sm">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-primary">
              <span className="material-symbols-outlined text-sm">tune</span>
              Personal Settings
            </p>
            <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              {title}
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-300">{subtitle}</p>
          </div>
          {settings ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/40 bg-white/70 px-4 py-3 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/60">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Email</p>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{settings.identity.email}</p>
              </div>
              <div className="rounded-2xl border border-white/40 bg-white/70 px-4 py-3 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/60">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Role</p>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{settings.identity.role}</p>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 2xl:grid-cols-2">
        <SectionCard title="Theme" description="Choose the theme used across your account.">
          <form className="space-y-5" onSubmit={updateTheme}>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {THEMES.map((themeItem) => (
                <button
                  key={themeItem.id}
                  type="button"
                  onClick={() => setSelectedTheme(themeItem.id)}
                  className={cn(
                    "rounded-2xl border p-4 text-left transition",
                    selectedTheme === themeItem.id
                      ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
                      : "border-slate-200 bg-slate-50 hover:border-primary/30 hover:bg-primary/5 dark:border-slate-800 dark:bg-slate-800/50",
                  )}
                >
                  <span
                    className="mb-4 block h-12 rounded-xl border border-white/40"
                    style={{ background: themeItem.preview }}
                  />
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{themeItem.label}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{themeItem.description}</p>
                </button>
              ))}
            </div>
            {themeNotice ? <p className="text-sm text-emerald-600">{themeNotice}</p> : null}
            <div className="flex justify-end">
              <SaveButton label="Save Theme" saving={savingTheme} disabled={!themeDirty} />
            </div>
          </form>
        </SectionCard>

        <SectionCard title="Profile" description="Update your username while keeping your email fixed.">
          <form className="space-y-4" onSubmit={updateProfile}>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Email" value={settings?.identity.email ?? ""} readOnly />
              <TextField
                label="Username"
                value={username}
                onChange={setUsername}
                placeholder="Enter your username"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/50">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Created</p>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                  {formatDate(settings?.identity.created_at)}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/50">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Last Login</p>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                  {formatDate(settings?.identity.last_login)}
                </p>
              </div>
            </div>
            {profileNotice ? <p className="text-sm text-emerald-600">{profileNotice}</p> : null}
            <div className="flex justify-end">
              <SaveButton label="Save Profile" saving={savingProfile} disabled={!profileDirty} />
            </div>
          </form>
        </SectionCard>

        <SectionCard
          title="Security & Privacy"
          description="Control personal notifications and privacy behavior for this account."
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
            {privacyNotice ? <p className="text-sm text-emerald-600">{privacyNotice}</p> : null}
            <div className="flex justify-end">
              <SaveButton label="Save Preferences" saving={savingPrivacy} disabled={!privacyDirty} />
            </div>
          </form>
        </SectionCard>

        <SectionCard
          title="Password"
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
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300">
              Forgot password is not live yet. The reset-token and email delivery flow is planned for the next backend phase.
            </div>
            {passwordNotice ? <p className="text-sm text-emerald-600">{passwordNotice}</p> : null}
            <div className="flex justify-end">
              <SaveButton
                label="Change Password"
                saving={savingPassword}
                disabled={!currentPassword || !newPassword || !confirmPassword}
              />
            </div>
          </form>
        </SectionCard>
      </div>
    </div>
  );
}
