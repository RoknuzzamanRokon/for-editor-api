"use client";

import { API_BASE } from "@/lib/apiBase";

export type ContactStatus =
  | "new"
  | "contacted"
  | "responded"
  | "won"
  | "lost"
  | "unsubscribed";

export type Contact = {
  id: number;
  email: string;
  company_name: string | null;
  contact_name: string | null;
  status: ContactStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  last_activity_at: string | null;
};

export type ContactList = {
  total: number;
  limit: number;
  offset: number;
  items: Contact[];
};

export type ResponseEntry = {
  id: number;
  contact_id: number;
  campaign_id: number | null;
  direction: "outbound" | "inbound";
  subject: string | null;
  body: string;
  status: "queued" | "sent" | "failed" | null;
  error_message: string | null;
  sender_label: string | null;
  created_at: string;
};

export type ContactThread = {
  contact: Contact;
  items: ResponseEntry[];
};

export type Campaign = {
  id: number;
  subject: string;
  body_html: string;
  category: string;
  recipient_count: number;
  sent_count: number;
  failed_count: number;
  created_at: string;
};

export type CampaignList = {
  total: number;
  limit: number;
  offset: number;
  items: Campaign[];
};

export const STATUS_STYLES: Record<ContactStatus, { label: string; chip: string }> = {
  new: { label: "New", chip: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  contacted: { label: "Contacted", chip: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  responded: { label: "Responded", chip: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
  won: { label: "Won", chip: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  lost: { label: "Lost", chip: "bg-slate-500/10 text-slate-500 dark:text-slate-400" },
  unsubscribed: { label: "Unsubscribed", chip: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
};

function authHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = window.localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function readError(res: Response, fallback: string): Promise<string> {
  const body = await res.text();
  try {
    return (JSON.parse(body) as { detail?: string }).detail ?? fallback;
  } catch {
    return body || fallback;
  }
}

export async function fetchContacts(
  search = "",
  status = "",
  limit = 50,
  offset = 0,
): Promise<ContactList> {
  const params = new URLSearchParams({ search, limit: String(limit), offset: String(offset) });
  if (status) params.set("status", status);
  const res = await fetch(`${API_BASE}/api/v3/marketing/contacts?${params}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await readError(res, "Failed to load contacts"));
  return (await res.json()) as ContactList;
}

export async function createContact(payload: {
  email: string;
  company_name?: string;
  contact_name?: string;
  notes?: string;
}): Promise<Contact> {
  const res = await fetch(`${API_BASE}/api/v3/marketing/contacts`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await readError(res, "Failed to create contact"));
  return (await res.json()) as Contact;
}

export async function updateContact(
  id: number,
  payload: Partial<{
    status: ContactStatus;
    company_name: string;
    contact_name: string;
    notes: string;
  }>,
): Promise<Contact> {
  const res = await fetch(`${API_BASE}/api/v3/marketing/contacts/${id}`, {
    method: "PATCH",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await readError(res, "Failed to update contact"));
  return (await res.json()) as Contact;
}

export async function fetchContactThread(contactId: number): Promise<ContactThread> {
  const res = await fetch(`${API_BASE}/api/v3/marketing/contacts/${contactId}/thread`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await readError(res, "Failed to load thread"));
  return (await res.json()) as ContactThread;
}

export async function logReply(
  contactId: number,
  payload: { subject?: string; body: string },
): Promise<ResponseEntry> {
  const res = await fetch(`${API_BASE}/api/v3/marketing/contacts/${contactId}/responses`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await readError(res, "Failed to log reply"));
  return (await res.json()) as ResponseEntry;
}

export async function sendCampaign(payload: {
  subject: string;
  body_html: string;
  contact_ids: number[];
  new_emails: string[];
}): Promise<{ id: number; subject: string; recipient_count: number; created_at: string }> {
  const res = await fetch(`${API_BASE}/api/v3/marketing/campaigns`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await readError(res, "Failed to send campaign"));
  return await res.json();
}

export async function fetchCampaigns(limit = 50, offset = 0): Promise<CampaignList> {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  const res = await fetch(`${API_BASE}/api/v3/marketing/campaigns?${params}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await readError(res, "Failed to load campaigns"));
  return (await res.json()) as CampaignList;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}
