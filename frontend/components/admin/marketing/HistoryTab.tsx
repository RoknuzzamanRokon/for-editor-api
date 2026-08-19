"use client";

import { type Campaign } from "@/lib/marketing";
import { formatRelativeTime } from "@/lib/time";

export default function HistoryTab({ campaigns, loading }: { campaigns: Campaign[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800/70" />
        ))}
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="py-14 text-center">
        <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600">
          outgoing_mail
        </span>
        <p className="mt-3 text-sm font-semibold text-slate-600 dark:text-slate-300">Nothing sent yet</p>
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
          Campaigns you send will appear here with their delivery status.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {campaigns.map((campaign) => {
        const pending = campaign.recipient_count - campaign.sent_count - campaign.failed_count;
        return (
          <div
            key={campaign.id}
            className="rounded-xl border border-slate-200 bg-white/60 p-4 dark:border-slate-700 dark:bg-slate-800/40"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-bold text-slate-900 dark:text-white">{campaign.subject}</p>
              <span className="text-xs text-slate-400">{formatRelativeTime(campaign.created_at)}</span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">group</span>
                {campaign.recipient_count} recipients
              </span>
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                {campaign.sent_count} sent
              </span>
              {campaign.failed_count > 0 ? (
                <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400">
                  <span className="material-symbols-outlined text-sm">error</span>
                  {campaign.failed_count} failed
                </span>
              ) : null}
              {pending > 0 ? (
                <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
                  {pending} sending...
                </span>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
