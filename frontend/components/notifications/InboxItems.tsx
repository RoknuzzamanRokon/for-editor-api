"use client";

import { formatProfileName } from "@/lib/profileName";
import {
  categoryStyle,
  formatNotificationTime,
  type InboxEntry,
} from "@/lib/notifications";

export function EmptyState({
  icon,
  title,
  hint,
}: {
  icon: string;
  title: string;
  hint: string;
}) {
  return (
    <div className="py-14 text-center">
      <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600">
        {icon}
      </span>
      <p className="mt-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
        {title}
      </p>
      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{hint}</p>
    </div>
  );
}

export function InboxRow({
  entry,
  onOpen,
}: {
  entry: InboxEntry;
  onOpen: (entry: InboxEntry) => void;
}) {
  const style = categoryStyle(entry.category);

  return (
    <button
      type="button"
      onClick={() => onOpen(entry)}
      className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition ${
        entry.is_read
          ? "border-slate-200 bg-white/40 dark:border-slate-700 dark:bg-slate-800/20"
          : "border-primary bg-white/70 dark:bg-slate-800/50"
      }`}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${style.chip}`}
      >
        <span className="material-symbols-outlined text-[19px]">{style.icon}</span>
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            {entry.title}
          </span>
          {entry.is_read ? null : (
            <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
              New
            </span>
          )}
        </span>

        <span className="mt-1 block whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">
          {entry.message}
        </span>

        <span className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          {entry.sender ? (
            <span className="inline-flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">person</span>
              {formatProfileName(entry.sender.username, entry.sender.email)}
            </span>
          ) : null}
          <span>{formatNotificationTime(entry.created_at)}</span>
        </span>
      </span>
    </button>
  );
}
