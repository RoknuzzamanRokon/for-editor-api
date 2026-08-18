"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { API_BASE } from "@/lib/apiBase";
import { EmptyState, InboxRow } from "@/components/notifications/InboxItems";
import { formatProfileName } from "@/lib/profileName";
import { formatRoleLabel } from "@/lib/roleLabel";
import {
  categoryStyle,
  fetchInbox,
  formatNotificationTime,
  markRead,
  publishUnreadCount,
  type AudienceResponse,
  type AudienceUser,
  type InboxEntry,
  type NotificationAudience,
  type NotificationCategory,
  type SentEntry,
  type SentList,
} from "@/lib/notifications";

const CATEGORIES: { value: NotificationCategory; label: string; icon: string }[] = [
  { value: "info", label: "Info", icon: "info" },
  { value: "success", label: "Success", icon: "check_circle" },
  { value: "warning", label: "Warning", icon: "warning" },
  { value: "alert", label: "Alert", icon: "priority_high" },
];

const CARD =
  "relative overflow-hidden rounded-[13px] border border-border bg-white/30 backdrop-blur-2xl [box-shadow:4px_4px_0px_0px_var(--border)] dark:bg-white/[0.03]";

// The theme tokens can't take Tailwind opacity modifiers in this config
// (`bg-primary/10` compiles to nothing), so tints go through color-mix instead.
const PRIMARY_TINT = "bg-[color-mix(in_srgb,var(--primary)_12%,transparent)]";
const ACCENT_RAIL =
  "absolute inset-y-4 left-4 w-[1.5px] bg-[linear-gradient(to_bottom,transparent,color-mix(in_srgb,var(--primary)_50%,transparent),transparent)]";

const token = () =>
  typeof window === "undefined" ? "" : localStorage.getItem("access_token") ?? "";

function StatTile({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: string;
}) {
  return (
    <div className={`${CARD} p-6`}>
      <div className={ACCENT_RAIL} />
      <div className={`mb-4 inline-flex rounded-xl p-2 text-primary ${PRIMARY_TINT}`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-xl font-black tracking-tight text-slate-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}

export default function AdminNotificationsPage() {
  const [role, setRole] = useState("");
  const [audience, setAudience] = useState<AudienceResponse | null>(null);
  const [sent, setSent] = useState<SentList | null>(null);
  const [inbox, setInbox] = useState<InboxEntry[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"sent" | "inbox">("sent");

  const [form, setForm] = useState<{
    title: string;
    message: string;
    category: NotificationCategory;
    audience: NotificationAudience;
  }>({ title: "", message: "", category: "info", audience: "my_users" });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [sendSuccess, setSendSuccess] = useState("");

  const isSuperUser = role === "super_user";

  const refresh = useCallback(async () => {
    const headers = { Authorization: `Bearer ${token()}` };
    try {
      const [audienceRes, sentRes, inboxRes] = await Promise.all([
        fetch(`${API_BASE}/api/v3/notifications/audience`, { headers }),
        fetch(`${API_BASE}/api/v3/notifications/sent?limit=50&offset=0`, { headers }),
        fetchInbox(50, 0, false),
      ]);
      if (audienceRes.ok) setAudience((await audienceRes.json()) as AudienceResponse);
      if (sentRes.ok) setSent((await sentRes.json()) as SentList);
      setInbox(inboxRes.items);
      setUnread(inboxRes.unread);
    } catch {
      // Leave the last good state; the banner below only covers send failures.
    }
  }, []);

  useEffect(() => {
    setRole(localStorage.getItem("user_role") ?? "");
    void refresh().finally(() => setLoading(false));
  }, [refresh]);

  const visibleAudience = useMemo(() => {
    const users = audience?.items ?? [];
    const term = search.trim().toLowerCase();
    if (!term) return users;
    return users.filter(
      (user) =>
        user.email.toLowerCase().includes(term) ||
        (user.username ?? "").toLowerCase().includes(term),
    );
  }, [audience, search]);

  const recipientPreview = useMemo(() => {
    if (form.audience === "all") return audience?.total ?? 0;
    if (form.audience === "my_users") {
      if (!isSuperUser) return audience?.total ?? 0;
      return 0; // super_user's "my_users" pool is resolved server-side.
    }
    return selectedIds.length;
  }, [form.audience, audience, isSuperUser, selectedIds]);

  const toggleRecipient = (userId: number) => {
    setSelectedIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    );
  };

  const handleSend = async () => {
    setSendError("");
    setSendSuccess("");

    if (!form.title.trim() || !form.message.trim()) {
      setSendError("Title and message are both required.");
      return;
    }
    if (form.audience === "selected" && selectedIds.length === 0) {
      setSendError("Select at least one recipient.");
      return;
    }

    setSending(true);
    try {
      const res = await fetch(`${API_BASE}/api/v3/notifications/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: form.title.trim(),
          message: form.message.trim(),
          category: form.category,
          audience: form.audience,
          user_ids: form.audience === "selected" ? selectedIds : [],
        }),
      });

      const body = await res.text();
      if (!res.ok) {
        let detail = body;
        try {
          detail = (JSON.parse(body) as { detail?: string }).detail ?? body;
        } catch {
          // Non-JSON error body — show it verbatim.
        }
        throw new Error(detail || "Failed to send notification");
      }

      const created = JSON.parse(body) as { recipient_count: number };
      setSendSuccess(
        `Notification sent to ${created.recipient_count} ${
          created.recipient_count === 1 ? "user" : "users"
        }.`,
      );
      setForm({ title: "", message: "", category: "info", audience: form.audience });
      setSelectedIds([]);
      await refresh();
    } catch (err: unknown) {
      setSendError(err instanceof Error ? err.message : "Failed to send notification");
    } finally {
      setSending(false);
    }
  };

  const handleMarkAll = async () => {
    try {
      await markRead();
      await refresh();
    } catch {
      // Badge simply stays until the next poll.
    }
  };

  const handleMarkOne = async (entry: InboxEntry) => {
    if (entry.is_read) return;
    try {
      await markRead([entry.id]);
      await refresh();
    } catch {
      // Non-fatal.
    }
  };

  const handleDelete = async (notificationId: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/v3/notifications/${notificationId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (res.ok) {
        await refresh();
        publishUnreadCount(unread);
      }
    } catch {
      // Non-fatal.
    }
  };

  const totalReach = (sent?.items ?? []).reduce((acc, row) => acc + row.recipient_count, 0);

  return (
    <div className="mx-auto max-w-8xl space-y-8 p-6 md:p-8">
      <section className="app-hero-card relative overflow-hidden rounded-[13px] border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-primary p-8 text-white shadow-xl dark:border-slate-800">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-12 left-0 h-32 w-32 rounded-full bg-white/5 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur">
              <span className="material-symbols-outlined text-sm">campaign</span>
              Notifications
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-white md:text-4xl">
              Send Notifications
            </h1>
           
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white backdrop-blur">
            Audience: {audience?.total ?? 0} users
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatTile label="Notifications Sent" value={sent?.total ?? 0} icon="send" />
        <StatTile label="Total Reach" value={totalReach} icon="groups" />
        <StatTile label="Unread In Your Inbox" value={unread} icon="mark_email_unread" />
      </section>

      {/* Compose */}
      <section className={`${CARD} p-6`}>
        <div className={ACCENT_RAIL} />
        <div className="relative mb-5 flex items-center gap-3">
          <div className={`inline-flex rounded-xl p-2 text-primary ${PRIMARY_TINT}`}>
            <span className="material-symbols-outlined">edit_notifications</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Compose Notification
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              POST /api/v3/notifications
            </p>
          </div>
        </div>

        {sendError ? (
          <div className="relative mb-4 flex items-start gap-2 rounded-2xl border border-rose-200/70 bg-rose-50/80 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300">
            <span className="material-symbols-outlined text-base">error</span>
            <span>{sendError}</span>
          </div>
        ) : null}
        {sendSuccess ? (
          <div className="relative mb-4 flex items-start gap-2 rounded-2xl border border-emerald-200/70 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300">
            <span className="material-symbols-outlined text-base">check_circle</span>
            <span>{sendSuccess}</span>
          </div>
        ) : null}

        <div className="relative space-y-4">
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Title
            </label>
            <input
              type="text"
              value={form.title}
              maxLength={200}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="Scheduled maintenance this weekend"
              className="w-full rounded-2xl border border-white/40 bg-white/65 px-4 py-3 text-sm text-slate-900 outline-none shadow-sm backdrop-blur-md transition placeholder:text-slate-400 focus:border-primary dark:border-white/10 dark:bg-white/10 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Message
            </label>
            <textarea
              value={form.message}
              maxLength={2000}
              rows={4}
              onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
              placeholder="Write the message your users will see..."
              className="w-full resize-y rounded-2xl border border-white/40 bg-white/65 px-4 py-3 text-sm text-slate-900 outline-none shadow-sm backdrop-blur-md transition placeholder:text-slate-400 focus:border-primary dark:border-white/10 dark:bg-white/10 dark:text-white"
            />
            <p className="mt-1 text-right text-[11px] text-slate-400 dark:text-slate-500">
              {form.message.length}/2000
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Category
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {CATEGORIES.map((item) => {
                const active = form.category === item.value;
                const style = categoryStyle(item.value);
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, category: item.value }))}
                    className={`flex items-center gap-2 rounded-xl border p-3 text-left text-sm font-semibold transition ${
                      active
                        ? "border-primary text-slate-900 ring-1 ring-inset ring-primary dark:text-white"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${style.chip}`}
                    >
                      <span className="material-symbols-outlined text-[17px]">
                        {item.icon}
                      </span>
                    </span>
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Audience
            </label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {(
                [
                  {
                    value: "all" as const,
                    label: "All users",
                    hint: "Everyone on the platform",
                    icon: "public",
                    disabled: !isSuperUser,
                  },
                  {
                    value: "my_users" as const,
                    label: isSuperUser ? "Users I created" : "My users",
                    hint: isSuperUser
                      ? "Accounts you created directly"
                      : `All ${audience?.total ?? 0} of your users`,
                    icon: "group",
                    disabled: false,
                  },
                  {
                    value: "selected" as const,
                    label: "Specific users",
                    hint: "Pick from your audience",
                    icon: "person_check",
                    disabled: false,
                  },
                ]
              ).map((option) => {
                const active = form.audience === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    disabled={option.disabled}
                    onClick={() => setForm((p) => ({ ...p, audience: option.value }))}
                    title={
                      option.disabled
                        ? "Only a super user can notify every account"
                        : undefined
                    }
                    className={`flex items-start gap-3 rounded-xl border p-3 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
                      active
                        ? "border-primary ring-1 ring-inset ring-primary"
                        : "border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-primary ${PRIMARY_TINT}`}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {option.icon}
                      </span>
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-slate-900 dark:text-white">
                        {option.label}
                      </span>
                      <span className="block text-xs text-slate-500 dark:text-slate-400">
                        {option.hint}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {form.audience === "selected" ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/40">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Recipients ({selectedIds.length} selected)
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedIds(visibleAudience.map((u) => u.id))}
                    className="rounded-lg px-2 py-1 text-xs font-semibold text-primary hover:bg-white dark:hover:bg-slate-800"
                  >
                    Select all
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedIds([])}
                    className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-white dark:text-slate-400 dark:hover:bg-slate-800"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by email or username..."
                className="mb-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />

              <div className="max-h-60 space-y-1 overflow-y-auto">
                {visibleAudience.length === 0 ? (
                  <p className="py-6 text-center text-sm text-slate-400 dark:text-slate-500">
                    {audience?.total === 0
                      ? "You have not created any users yet."
                      : "No users match that search."}
                  </p>
                ) : (
                  visibleAudience.map((user: AudienceUser) => {
                    const checked = selectedIds.includes(user.id);
                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => toggleRecipient(user.id)}
                        className={`flex w-full items-center gap-3 rounded-lg border p-2.5 text-left transition ${
                          checked
                            ? "border-primary bg-white dark:bg-slate-900"
                            : "border-transparent hover:bg-white dark:hover:bg-slate-800"
                        }`}
                      >
                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                            checked
                              ? "border-primary bg-primary"
                              : "border-slate-300 dark:border-slate-600"
                          }`}
                        >
                          {checked ? (
                            <span className="material-symbols-outlined text-[12px] text-white">
                              check
                            </span>
                          ) : null}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-slate-900 dark:text-white">
                            {formatProfileName(user.username, user.email)}
                          </span>
                          <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                            {user.email}
                          </span>
                        </span>
                        <span className="shrink-0 rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                          {formatRoleLabel(user.role)}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {form.audience === "all"
                ? `Will reach all ${audience?.total ?? 0} users.`
                : form.audience === "selected"
                  ? `Will reach ${recipientPreview} selected ${recipientPreview === 1 ? "user" : "users"}.`
                  : isSuperUser
                    ? "Will reach the accounts you created."
                    : `Will reach all ${audience?.total ?? 0} of your users.`}
            </p>
            <button
              type="button"
              onClick={handleSend}
              disabled={sending}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {sending ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Sending...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">send</span>
                  Send Notification
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* History */}
      <section className={CARD}>
        <div className={ACCENT_RAIL} />
        <div className="relative flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/70 px-5 py-4 dark:border-white/10 sm:px-6 sm:py-5">
          <div className="flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800/60">
            {(["sent", "inbox"] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize transition ${
                  tab === key
                    ? "bg-white text-primary shadow-sm dark:bg-slate-900"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                {key === "sent" ? "Sent" : `Inbox${unread > 0 ? ` (${unread})` : ""}`}
              </button>
            ))}
          </div>

          {tab === "inbox" && unread > 0 ? (
            <button
              type="button"
              onClick={handleMarkAll}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Mark all read
            </button>
          ) : null}
        </div>

        <div className="relative p-5 sm:p-6">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-16 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800/70"
                />
              ))}
            </div>
          ) : tab === "sent" ? (
            (sent?.items.length ?? 0) === 0 ? (
              <EmptyState
                icon="outgoing_mail"
                title="Nothing sent yet"
                hint="Notifications you send will appear here with their read counts."
              />
            ) : (
              <div className="space-y-3">
                {sent!.items.map((row: SentEntry) => {
                  const style = categoryStyle(row.category);
                  const readPct = row.recipient_count
                    ? Math.round((row.read_count / row.recipient_count) * 100)
                    : 0;
                  return (
                    <div
                      key={row.id}
                      className="rounded-xl border border-slate-200 bg-white/60 p-4 dark:border-slate-700 dark:bg-slate-800/40"
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${style.chip}`}
                        >
                          <span className="material-symbols-outlined text-[19px]">
                            {style.icon}
                          </span>
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                              {row.title}
                            </p>
                            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                              {row.audience === "all"
                                ? "All users"
                                : row.audience === "my_users"
                                  ? "My users"
                                  : "Selected"}
                            </span>
                          </div>
                          <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">
                            {row.message}
                          </p>
                          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                            <span className="inline-flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">
                                group
                              </span>
                              {row.recipient_count} recipients
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">
                                drafts
                              </span>
                              {row.read_count} read ({readPct}%)
                            </span>
                            <span>{formatNotificationTime(row.created_at)}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => void handleDelete(row.id)}
                          title="Retract this notification"
                          className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : inbox.length === 0 ? (
            <EmptyState
              icon="notifications_off"
              title="Your inbox is empty"
              hint="Notifications sent to you will appear here."
            />
          ) : (
            <div className="space-y-2">
              {inbox.map((entry) => (
                <InboxRow key={entry.id} entry={entry} onOpen={handleMarkOne} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

