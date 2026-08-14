"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  categoryStyle,
  fetchInbox,
  formatNotificationTime,
  markRead,
  subscribeUnreadCount,
  type InboxEntry,
} from "@/lib/notifications";

const POLL_INTERVAL_MS = 60_000;
const PREVIEW_LIMIT = 6;

export default function NotificationBell({ basePath }: { basePath: string }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<InboxEntry[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const data = await fetchInbox(PREVIEW_LIMIT, 0, false);
      setItems(data.items);
      setUnread(data.unread);
    } catch {
      // Header chrome must never surface a fetch error — leave the last good state.
    }
  }, []);

  useEffect(() => {
    if (!localStorage.getItem("access_token")) return;

    void load();
    const timer = window.setInterval(() => void load(), POLL_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [load]);

  // Keep in sync when another surface (the notifications page) marks things read.
  useEffect(() => subscribeUnreadCount(setUnread), []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    if (next) void load();
  };

  const handleMarkAll = async () => {
    setLoading(true);
    try {
      await markRead();
      await load();
    } catch {
      // Non-fatal: the badge simply stays until the next poll.
    } finally {
      setLoading(false);
    }
  };

  const handleOpenItem = async (entry: InboxEntry) => {
    setOpen(false);
    if (entry.is_read) return;
    try {
      await markRead([entry.id]);
      await load();
    } catch {
      // Navigation still proceeds; the page will show the true read state.
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={handleToggle}
        aria-label={unread > 0 ? `Notifications (${unread} unread)` : "Notifications"}
        className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        <span className="material-symbols-outlined">notifications</span>
        {unread > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[10px] font-bold leading-none text-white dark:border-slate-900">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                Notifications
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {unread > 0 ? `${unread} unread` : "You're all caught up"}
              </p>
            </div>
            {unread > 0 ? (
              <button
                type="button"
                onClick={handleMarkAll}
                disabled={loading}
                className="rounded-lg px-2 py-1 text-xs font-semibold text-primary transition hover:bg-slate-100 disabled:opacity-60 dark:hover:bg-slate-800"
              >
                Mark all read
              </button>
            ) : null}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <span className="material-symbols-outlined text-3xl text-slate-300 dark:text-slate-600">
                  notifications_off
                </span>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  No notifications yet
                </p>
              </div>
            ) : (
              items.map((entry) => {
                const style = categoryStyle(entry.category);
                return (
                  <Link
                    key={entry.id}
                    href={`${basePath}/notifications`}
                    onClick={() => void handleOpenItem(entry)}
                    className={`flex gap-3 border-b border-slate-100 px-4 py-3 transition-colors last:border-b-0 hover:bg-slate-50 dark:border-slate-800/60 dark:hover:bg-slate-800/60 ${
                      entry.is_read ? "" : "bg-slate-50/60 dark:bg-slate-800/30"
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${style.chip}`}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {style.icon}
                      </span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                          {entry.title}
                        </span>
                        {entry.is_read ? null : (
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        )}
                      </span>
                      <span className="mt-0.5 line-clamp-2 block text-xs text-slate-500 dark:text-slate-400">
                        {entry.message}
                      </span>
                      <span className="mt-1 block text-[11px] text-slate-400 dark:text-slate-500">
                        {formatNotificationTime(entry.created_at)}
                      </span>
                    </span>
                  </Link>
                );
              })
            )}
          </div>

          <Link
            href={`${basePath}/notifications`}
            onClick={() => setOpen(false)}
            className="block border-t border-slate-200 px-4 py-3 text-center text-xs font-semibold text-primary transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60"
          >
            View all notifications
          </Link>
        </div>
      ) : null}
    </div>
  );
}
