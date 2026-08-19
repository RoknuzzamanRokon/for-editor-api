"use client";

import { useState } from "react";
import { createContact, STATUS_STYLES, type Contact, type ContactStatus } from "@/lib/marketing";
import { formatRelativeTime } from "@/lib/time";
import ContactThread from "./ContactThread";

const STATUS_FILTERS: Array<{ value: ContactStatus | ""; label: string }> = [
  { value: "", label: "All" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "responded", label: "Responded" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
  { value: "unsubscribed", label: "Unsubscribed" },
];

export default function ContactsTab({
  contacts,
  loading,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onRefresh,
}: {
  contacts: Contact[];
  loading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: ContactStatus | "";
  onStatusFilterChange: (value: ContactStatus | "") => void;
  onRefresh: () => void;
}) {
  const [openContactId, setOpenContactId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newContactName, setNewContactName] = useState("");
  const [addError, setAddError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!newEmail.trim()) return;
    setSaving(true);
    setAddError("");
    try {
      await createContact({
        email: newEmail.trim(),
        company_name: newCompany.trim() || undefined,
        contact_name: newContactName.trim() || undefined,
      });
      setNewEmail("");
      setNewCompany("");
      setNewContactName("");
      setAdding(false);
      onRefresh();
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Failed to add contact");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <span className="material-symbols-outlined pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-lg text-slate-400">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search contacts..."
              className="w-56 rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>
          <div className="flex flex-wrap gap-1">
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.value || "all"}
                type="button"
                onClick={() => onStatusFilterChange(filter.value)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  statusFilter === filter.value
                    ? "bg-primary text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white transition hover:opacity-90"
        >
          <span className="material-symbols-outlined text-base">person_add</span>
          Add Contact
        </button>
      </div>

      {adding ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/40">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Email *"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
            <input
              type="text"
              value={newContactName}
              onChange={(e) => setNewContactName(e.target.value)}
              placeholder="Contact name"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
            <input
              type="text"
              value={newCompany}
              onChange={(e) => setNewCompany(e.target.value)}
              placeholder="Company"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>
          {addError ? <p className="mt-2 text-sm text-rose-600">{addError}</p> : null}
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="rounded-lg px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saving || !newEmail.trim()}
              onClick={handleAdd}
              className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              Save
            </button>
          </div>
        </div>
      ) : null}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800/70" />
          ))}
        </div>
      ) : contacts.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-400 dark:text-slate-500">
          No contacts match this filter yet.
        </p>
      ) : (
        <>
          <div className="max-h-[760px] space-y-2 overflow-y-auto pr-1">
            {contacts.map((contact) => {
              const style = STATUS_STYLES[contact.status];
              return (
                <button
                  key={contact.id}
                  type="button"
                  onClick={() => setOpenContactId(contact.id)}
                  className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white/60 p-4 text-left transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:bg-slate-800/70"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                      {contact.contact_name || contact.company_name || contact.email}
                    </p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {contact.email}
                      {contact.company_name && contact.contact_name ? ` · ${contact.company_name}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    {contact.last_activity_at ? (
                      <span className="text-xs text-slate-400">
                        {formatRelativeTime(contact.last_activity_at)}
                      </span>
                    ) : null}
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${style.chip}`}
                    >
                      {style.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
          {contacts.length > 10 ? (
            <p className="pt-2 text-center text-xs text-slate-400 dark:text-slate-500">
              {contacts.length} contacts — scroll for more
            </p>
          ) : null}
        </>
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
