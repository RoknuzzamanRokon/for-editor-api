"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import {
  fetchContactThread,
  logReply,
  sendCampaign,
  updateContact,
  STATUS_STYLES,
  type ContactStatus,
  type ContactThread as ContactThreadData,
} from "@/lib/marketing";
import { formatRelativeTime } from "@/lib/time";

const RichTextEditor = dynamic(() => import("./RichTextEditor"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[140px] animate-pulse rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/40" />
  ),
});

const STATUS_OPTIONS: ContactStatus[] = [
  "new",
  "contacted",
  "responded",
  "won",
  "lost",
  "unsubscribed",
];

export default function ContactThread({
  contactId,
  onClose,
  onChanged,
}: {
  contactId: number;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [data, setData] = useState<ContactThreadData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"log" | "reply" | null>(null);
  const [logSubject, setLogSubject] = useState("");
  const [logBody, setLogBody] = useState("");
  const [replySubject, setReplySubject] = useState("");
  const [replyBody, setReplyBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      const thread = await fetchContactThread(contactId);
      setData(thread);
      setReplySubject((prev) => prev || `Re: ${thread.contact.contact_name || thread.contact.email}`);
    } catch {
      setError("Failed to load this contact's thread.");
    } finally {
      setLoading(false);
    }
  }, [contactId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleStatusChange = async (status: ContactStatus) => {
    if (!data) return;
    try {
      const updated = await updateContact(data.contact.id, { status });
      setData({ ...data, contact: updated });
      onChanged();
    } catch {
      setError("Failed to update status.");
    }
  };

  const handleLogReply = async () => {
    if (!logBody.trim()) return;
    setBusy(true);
    setError("");
    try {
      await logReply(contactId, { subject: logSubject.trim() || undefined, body: logBody.trim() });
      setLogSubject("");
      setLogBody("");
      setMode(null);
      await refresh();
      onChanged();
    } catch {
      setError("Failed to log the reply.");
    } finally {
      setBusy(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyBody.trim() || !replySubject.trim()) return;
    setBusy(true);
    setError("");
    try {
      await sendCampaign({
        subject: replySubject.trim(),
        body_html: replyBody,
        contact_ids: [contactId],
        new_emails: [],
      });
      setReplyBody("");
      setMode(null);
      await refresh();
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reply.");
    } finally {
      setBusy(false);
    }
  };

  // Portaled straight to <body> — an ancestor tab card uses backdrop-blur,
  // which (like `transform`/`filter`) establishes a new containing block for
  // `position: fixed` descendants, so this panel would otherwise size and
  // position itself against that card instead of the real viewport.
  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40">
      <div className="flex h-full w-full max-w-lg flex-col bg-white shadow-2xl dark:bg-slate-900">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
              {data?.contact.contact_name || data?.contact.company_name || data?.contact.email || "..."}
            </p>
            {data ? (
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">{data.contact.email}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {data ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-slate-200 px-5 py-3 dark:border-slate-800">
            {STATUS_OPTIONS.map((option) => {
              const active = data.contact.status === option;
              const style = STATUS_STYLES[option];
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => void handleStatusChange(option)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    active ? style.chip : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {style.label}
                </button>
              );
            })}
          </div>
        ) : null}

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800/70" />
              ))}
            </div>
          ) : data && data.items.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400 dark:text-slate-500">
              No messages with this contact yet.
            </p>
          ) : (
            <div className="space-y-3">
              {data?.items.map((item) => {
                const isInbound = item.direction === "inbound";
                return (
                  <div
                    key={item.id}
                    className={`rounded-xl border p-3 text-sm ${
                      isInbound
                        ? "border-violet-200 bg-violet-50/60 dark:border-violet-900/40 dark:bg-violet-950/20"
                        : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/40"
                    }`}
                  >
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {isInbound ? "Reply received" : "Sent"}
                        {item.sender_label ? ` · ${item.sender_label}` : ""}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-slate-400">
                        {!isInbound && item.status === "failed" ? (
                          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:bg-rose-950/40">
                            Failed
                          </span>
                        ) : null}
                        {formatRelativeTime(item.created_at)}
                      </span>
                    </div>
                    {item.subject ? (
                      <p className="mb-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {item.subject}
                      </p>
                    ) : null}
                    {isInbound ? (
                      <p className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">
                        {item.body}
                      </p>
                    ) : (
                      <div
                        className="rte-content text-sm text-slate-700 dark:text-slate-300"
                        dangerouslySetInnerHTML={{ __html: item.body }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
        </div>

        <div className="max-h-[70vh] shrink-0 overflow-y-auto border-t border-slate-200 p-4 dark:border-slate-800">
          {mode === null ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMode("log")}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Log a reply
              </button>
              <button
                type="button"
                onClick={() => setMode("reply")}
                className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
              >
                Send reply
              </button>
            </div>
          ) : mode === "log" ? (
            <div className="space-y-2">
              <input
                type="text"
                value={logSubject}
                onChange={(e) => setLogSubject(e.target.value)}
                placeholder="Subject (optional)"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
              <textarea
                value={logBody}
                onChange={(e) => setLogBody(e.target.value)}
                rows={3}
                placeholder="Paste what they replied..."
                className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setMode(null)}
                  className="rounded-lg px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={busy || !logBody.trim()}
                  onClick={handleLogReply}
                  className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
                >
                  Log it
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                value={replySubject}
                onChange={(e) => setReplySubject(e.target.value)}
                placeholder="Subject"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
              <RichTextEditor value={replyBody} onChange={setReplyBody} placeholder="Write your reply..." />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setMode(null)}
                  className="rounded-lg px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={busy || !replyBody.trim() || !replySubject.trim()}
                  onClick={handleSendReply}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {busy ? (
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  ) : (
                    <span className="material-symbols-outlined text-base">send</span>
                  )}
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
