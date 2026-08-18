"use client";

import { useCallback, useEffect, useState } from "react";
import { EmptyState, InboxRow } from "@/components/notifications/InboxItems";
import {
  fetchInbox,
  markRead,
  type InboxEntry,
} from "@/lib/notifications";

const CARD =
  "relative overflow-hidden rounded-[13px] border border-border bg-white/30 backdrop-blur-2xl [box-shadow:4px_4px_0px_0px_var(--border)] dark:bg-white/[0.03]";

// `bg-primary/12` compiles to nothing in this Tailwind config, so tint via color-mix.
const PRIMARY_TINT = "bg-[color-mix(in_srgb,var(--primary)_12%,transparent)]";
const ACCENT_RAIL =
  "absolute inset-y-4 left-4 w-[1.5px] bg-[linear-gradient(to_bottom,transparent,color-mix(in_srgb,var(--primary)_50%,transparent),transparent)]";

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

export default function UserNotificationsPage() {
  const [items, setItems] = useState<InboxEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [unreadOnly, setUnreadOnly] = useState(false);

  const refresh = useCallback(async (onlyUnread: boolean) => {
    try {
      const data = await fetchInbox(100, 0, onlyUnread);
      setItems(data.items);
      setTotal(data.total);
      setUnread(data.unread);
    } catch {
      // Keep the last good state rather than blanking the page.
    }
  }, []);

  useEffect(() => {
    void refresh(unreadOnly).finally(() => setLoading(false));
  }, [refresh, unreadOnly]);

  const handleMarkAll = async () => {
    try {
      await markRead();
      await refresh(unreadOnly);
    } catch {
      // Non-fatal.
    }
  };

  const handleOpen = async (entry: InboxEntry) => {
    if (entry.is_read) return;
    try {
      await markRead([entry.id]);
      await refresh(unreadOnly);
    } catch {
      // Non-fatal.
    }
  };

  return (
    <div className="mx-auto max-w-8xl space-y-8 p-6 md:p-8">
      <section className="app-hero-card relative overflow-hidden rounded-[13px] border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-primary p-8 text-white shadow-xl dark:border-slate-800">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-12 left-0 h-32 w-32 rounded-full bg-white/5 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur">
              <span className="material-symbols-outlined text-sm">notifications</span>
              Inbox
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-white md:text-4xl">
              Notifications
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-white/80">
              Messages from your administrator and the platform team.
            </p>
          </div>

          {unread > 0 ? (
            <button
              type="button"
              onClick={handleMarkAll}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"
            >
              <span className="material-symbols-outlined text-base">done_all</span>
              Mark all read
            </button>
          ) : null}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <StatTile label="Total Notifications" value={total} icon="inbox" />
        <StatTile label="Unread" value={unread} icon="mark_email_unread" />
      </section>

      <section className={CARD}>
        <div className={ACCENT_RAIL} />
        <div className="relative flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/70 px-5 py-4 dark:border-white/10 sm:px-6 sm:py-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Your Messages
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {unread > 0 ? `${unread} unread` : "You're all caught up"}
            </p>
          </div>

          <div className="flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800/60">
            {[
              { key: false, label: "All" },
              { key: true, label: "Unread" },
            ].map((option) => (
              <button
                key={String(option.key)}
                type="button"
                onClick={() => setUnreadOnly(option.key)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  unreadOnly === option.key
                    ? "bg-white text-primary shadow-sm dark:bg-slate-900"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative p-5 sm:p-6">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-20 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800/70"
                />
              ))}
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              icon={unreadOnly ? "mark_email_read" : "notifications_off"}
              title={unreadOnly ? "No unread notifications" : "No notifications yet"}
              hint={
                unreadOnly
                  ? "Everything has been read."
                  : "Messages from your administrator will appear here."
              }
            />
          ) : (
            <div className="space-y-2">
              {items.map((entry) => (
                <InboxRow key={entry.id} entry={entry} onOpen={handleOpen} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
