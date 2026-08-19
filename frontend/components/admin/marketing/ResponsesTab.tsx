"use client";

import { useMemo, useState } from "react";
import { type Contact } from "@/lib/marketing";
import { formatRelativeTime } from "@/lib/time";
import ContactThread from "./ContactThread";

export default function ResponsesTab({
  contacts,
  loading,
  onRefresh,
}: {
  contacts: Contact[];
  loading: boolean;
  onRefresh: () => void;
}) {
  const [openContactId, setOpenContactId] = useState<number | null>(null);

  // "Responded and not yet resolved" is the actionable inbox here — once a
  // lead is marked Won/Lost from the thread view, it drops off this list.
  const awaitingAction = useMemo(
    () => contacts.filter((c) => c.status === "responded"),
    [contacts],
  );

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Leads who replied and are still waiting on a decision. Mark a thread Won or Lost from its
        detail view once it&apos;s resolved.
      </p>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800/70" />
          ))}
        </div>
      ) : awaitingAction.length === 0 ? (
        <div className="py-14 text-center">
          <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600">
            mark_email_read
          </span>
          <p className="mt-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
            Nothing waiting on you
          </p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            Replies you log against a contact will show up here.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {awaitingAction.map((contact) => (
            <button
              key={contact.id}
              type="button"
              onClick={() => setOpenContactId(contact.id)}
              className="flex w-full items-center justify-between gap-3 rounded-xl border border-violet-200 bg-violet-50/50 p-4 text-left transition hover:bg-violet-50 dark:border-violet-900/40 dark:bg-violet-950/10 dark:hover:bg-violet-950/20"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                  {contact.contact_name || contact.company_name || contact.email}
                </p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">{contact.email}</p>
              </div>
              {contact.last_activity_at ? (
                <span className="shrink-0 text-xs text-slate-400">
                  {formatRelativeTime(contact.last_activity_at)}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      )}

      {openContactId !== null ? (
        <ContactThread
          contactId={openContactId}
          onClose={() => setOpenContactId(null)}
          onChanged={onRefresh}
        />
      ) : null}
    </div>
  );
}
