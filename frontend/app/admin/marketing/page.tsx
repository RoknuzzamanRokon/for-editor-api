"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchCampaigns, fetchContacts, type Campaign, type Contact, type ContactStatus } from "@/lib/marketing";
import ComposeTab from "@/components/admin/marketing/ComposeTab";
import ContactsTab from "@/components/admin/marketing/ContactsTab";
import ResponsesTab from "@/components/admin/marketing/ResponsesTab";
import HistoryTab from "@/components/admin/marketing/HistoryTab";

const CARD =
  "relative overflow-hidden rounded-[13px] border border-border bg-white/30 backdrop-blur-2xl [box-shadow:4px_4px_0px_0px_var(--border)] dark:bg-white/[0.03]";
const PRIMARY_TINT = "bg-[color-mix(in_srgb,var(--primary)_12%,transparent)]";
const ACCENT_RAIL =
  "absolute inset-y-4 left-4 w-[1.5px] bg-[linear-gradient(to_bottom,transparent,color-mix(in_srgb,var(--primary)_50%,transparent),transparent)]";

const TABS = [
  { key: "compose", label: "Compose", icon: "edit_note" },
  { key: "responses", label: "Responses", icon: "forum" },
  { key: "contacts", label: "Contacts", icon: "contacts" },
  { key: "history", label: "History", icon: "history" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function StatTile({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className={`${CARD} p-6`}>
      <div className={ACCENT_RAIL} />
      <div className={`mb-4 inline-flex rounded-xl p-2 text-primary ${PRIMARY_TINT}`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-xl font-black tracking-tight text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}

export default function AdminMarketingPage() {
  const [tab, setTab] = useState<TabKey>("compose");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContactStatus | "">("");

  const refresh = useCallback(async () => {
    try {
      const [contactsRes, campaignsRes] = await Promise.all([
        fetchContacts("", "", 200, 0),
        fetchCampaigns(50, 0),
      ]);
      setContacts(contactsRes.items);
      setCampaigns(campaignsRes.items);
    } catch {
      // Leave the last good state.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const filteredContacts = contacts.filter((contact) => {
    if (statusFilter && contact.status !== statusFilter) return false;
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return (
      contact.email.toLowerCase().includes(term) ||
      (contact.company_name ?? "").toLowerCase().includes(term) ||
      (contact.contact_name ?? "").toLowerCase().includes(term)
    );
  });

  const respondedCount = contacts.filter((c) => c.status === "responded").length;
  const totalSent = campaigns.reduce((acc, c) => acc + c.sent_count, 0);

  return (
    <div className="mx-auto max-w-8xl space-y-8 p-6 md:p-8">
      <section className="app-hero-card relative overflow-hidden rounded-[13px] border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-primary p-8 text-white shadow-xl dark:border-slate-800">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-12 left-0 h-32 w-32 rounded-full bg-white/5 blur-3xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur">
            <span className="material-symbols-outlined text-sm">campaign</span>
            Marketing
          </div>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-white md:text-4xl">
            Outreach &amp; Client Replies
          </h1>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatTile label="Contacts" value={contacts.length} icon="contacts" />
        <StatTile label="Emails Sent" value={totalSent} icon="send" />
        <StatTile label="Awaiting Your Reply" value={respondedCount} icon="forum" />
      </section>

      <section className={CARD}>
        <div className={ACCENT_RAIL} />
        <div className="relative flex gap-1 overflow-x-auto border-b border-slate-200/70 px-5 py-3 dark:border-white/10 sm:px-6">
          {TABS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className={`inline-flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition ${
                tab === item.key
                  ? "bg-primary/10 text-primary"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
              {item.label}
              {item.key === "responses" && respondedCount > 0 ? (
                <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {respondedCount}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        <div className="relative p-5 sm:p-6">
          {tab === "compose" ? (
            <ComposeTab contacts={contacts} onSent={() => void refresh()} />
          ) : tab === "contacts" ? (
            <ContactsTab
              contacts={filteredContacts}
              loading={loading}
              search={search}
              onSearchChange={setSearch}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              onRefresh={() => void refresh()}
            />
          ) : tab === "responses" ? (
            <ResponsesTab contacts={contacts} loading={loading} onRefresh={() => void refresh()} />
          ) : (
            <HistoryTab campaigns={campaigns} loading={loading} />
          )}
        </div>
      </section>
    </div>
  );
}
