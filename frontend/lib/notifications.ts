"use client";

import { API_BASE } from "@/lib/apiBase";

export type NotificationCategory = "info" | "success" | "warning" | "alert";
export type NotificationAudience = "all" | "my_users" | "selected";

export type NotificationSender = {
  id: number;
  email: string;
  username: string | null;
  role: string;
};

export type InboxEntry = {
  id: number;
  notification_id: number;
  title: string;
  message: string;
  category: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  sender: NotificationSender | null;
};

export type InboxList = {
  total: number;
  unread: number;
  limit: number;
  offset: number;
  items: InboxEntry[];
};

export type SentEntry = {
  id: number;
  title: string;
  message: string;
  category: string;
  audience: string;
  recipient_count: number;
  read_count: number;
  created_at: string;
};

export type SentList = {
  total: number;
  limit: number;
  offset: number;
  items: SentEntry[];
};

export type AudienceUser = {
  id: number;
  email: string;
  username: string | null;
  role: string;
};

export type AudienceResponse = {
  scope: string;
  total: number;
  items: AudienceUser[];
};

const UNREAD_EVENT = "notificationunreadchange";

/** Visual treatment per category. Deliberately uses fixed slate/amber/rose/emerald
 *  scales rather than the theme tokens — `bg-primary/10`-style opacity modifiers on
 *  the CSS-variable colors compile to nothing in this Tailwind config. */
export const CATEGORY_STYLES: Record<
  string,
  { icon: string; chip: string; label: string }
> = {
  info: {
    icon: "info",
    chip: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    label: "Info",
  },
  success: {
    icon: "check_circle",
    chip: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    label: "Success",
  },
  warning: {
    icon: "warning",
    chip: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    label: "Warning",
  },
  alert: {
    icon: "priority_high",
    chip: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    label: "Alert",
  },
};

export function categoryStyle(category: string) {
  return CATEGORY_STYLES[category] ?? CATEGORY_STYLES.info;
}

export function authHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = window.localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** Broadcast a new unread count so the bell badge and any open page stay in sync
 *  without a refetch. Mirrors the `accountsettingschange` pattern. */
export function publishUnreadCount(unread: number) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(UNREAD_EVENT, { detail: unread }));
}

export function subscribeUnreadCount(handler: (unread: number) => void) {
  if (typeof window === "undefined") return () => {};
  const listener = (event: Event) => {
    handler((event as CustomEvent<number>).detail);
  };
  window.addEventListener(UNREAD_EVENT, listener);
  return () => window.removeEventListener(UNREAD_EVENT, listener);
}

export async function fetchUnreadCount(): Promise<number> {
  const res = await fetch(`${API_BASE}/api/v3/notifications/unread-count`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to load unread count");
  const data = (await res.json()) as { unread: number };
  return data.unread;
}

export async function fetchInbox(
  limit = 50,
  offset = 0,
  unreadOnly = false,
): Promise<InboxList> {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
    unread_only: String(unreadOnly),
  });
  const res = await fetch(`${API_BASE}/api/v3/notifications/?${params}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to load notifications");
  return (await res.json()) as InboxList;
}

/** Marks the given inbox rows read, or the entire inbox when `ids` is omitted. */
export async function markRead(ids?: number[]): Promise<number> {
  const res = await fetch(`${API_BASE}/api/v3/notifications/read`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(ids ? { ids } : {}),
  });
  if (!res.ok) throw new Error("Failed to update notifications");
  const data = (await res.json()) as { updated: number; unread: number };
  publishUnreadCount(data.unread);
  return data.updated;
}

/** The API sends naive UTC timestamps (no "Z"/offset suffix). Without a zone
 *  marker, `new Date()` parses a date-time string as local time, so every
 *  reading silently drifts by the viewer's UTC offset — e.g. every notification
 *  reads exactly "6h ago" for a viewer at UTC+6. Treat a zone-less string as UTC. */
function parseServerTimestamp(value: string): number {
  const hasTimezone = /Z$|[+-]\d{2}:?\d{2}$/.test(value);
  return new Date(hasTimezone ? value : `${value}Z`).getTime();
}

export function formatNotificationTime(value: string) {
  const then = parseServerTimestamp(value);
  if (Number.isNaN(then)) return "";

  const seconds = Math.floor((Date.now() - then) / 1000);
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(then).toLocaleDateString();
}
