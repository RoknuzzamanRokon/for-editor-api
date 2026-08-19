"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import { sendCampaign, type Contact } from "@/lib/marketing";
import RecipientPicker, { type PickedRecipient } from "./RecipientPicker";
import EmailPreview from "./EmailPreview";

const RichTextEditor = dynamic(() => import("./RichTextEditor"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[220px] animate-pulse rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/40" />
  ),
});

export default function ComposeTab({
  contacts,
  onSent,
}: {
  contacts: Contact[];
  onSent: () => void;
}) {
  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [picked, setPicked] = useState<PickedRecipient[]>([]);
  const [confirming, setConfirming] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const canSend = subject.trim().length > 0 && bodyHtml.trim().length > 0 && picked.length > 0;

  const reset = () => {
    setSubject("");
    setBodyHtml("");
    setPicked([]);
  };

  const handleSend = async () => {
    setError("");
    setSuccess("");
    setSending(true);
    try {
      const contact_ids = picked
        .filter((r): r is { kind: "contact"; contact: Contact } => r.kind === "contact")
        .map((r) => r.contact.id);
      const new_emails = picked
        .filter((r): r is { kind: "email"; email: string } => r.kind === "email")
        .map((r) => r.email);

      const result = await sendCampaign({ subject: subject.trim(), body_html: bodyHtml, contact_ids, new_emails });
      setSuccess(
        `Sending to ${result.recipient_count} ${result.recipient_count === 1 ? "recipient" : "recipients"} now.`,
      );
      reset();
      onSent();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send campaign");
    } finally {
      setSending(false);
      setConfirming(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="space-y-5">
        {error ? (
          <div className="flex items-start gap-2 rounded-2xl border border-rose-200/70 bg-rose-50/80 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300">
            <span className="material-symbols-outlined text-base">error</span>
            <span>{error}</span>
          </div>
        ) : null}
        {success ? (
          <div className="flex items-start gap-2 rounded-2xl border border-emerald-200/70 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300">
            <span className="material-symbols-outlined text-base">check_circle</span>
            <span>{success}</span>
          </div>
        ) : null}

        <div>
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Recipients
          </label>
          <RecipientPicker contacts={contacts} picked={picked} onChange={setPicked} />
        </div>

        <div>
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Subject
          </label>
          <input
            type="text"
            value={subject}
            maxLength={200}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Would you be interested in a short 5-minute demo?"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Message
          </label>
          <RichTextEditor
            value={bodyHtml}
            onChange={setBodyHtml}
            placeholder="Hello Globe Survey Team, I noticed..."
          />
          <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
            The &quot;Best regards&quot; signature and unsubscribe link are added automatically —
            just write the message itself.
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 pt-1">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {picked.length === 0
              ? "Select at least one recipient."
              : `Will send to ${picked.length} ${picked.length === 1 ? "recipient" : "recipients"}.`}
          </p>
          <button
            type="button"
            disabled={!canSend || sending}
            onClick={() => setConfirming(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-base">send</span>
            Send
          </button>
        </div>
      </div>

      <div className="lg:sticky lg:top-4 lg:self-start">
        <EmailPreview subject={subject} bodyHtml={bodyHtml} />
      </div>

      {confirming
        ? createPortal(
            // Portaled to <body> — the tab card ancestor's backdrop-blur
            // establishes a new containing block for `position: fixed`,
            // which would otherwise size/position this against the card
            // instead of the real viewport (see ContactThread.tsx).
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
              <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Send this message?
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  This will send &quot;{subject}&quot; to{" "}
                  <span className="font-semibold">
                    {picked.length} {picked.length === 1 ? "recipient" : "recipients"}
                  </span>
                  . This can&apos;t be undone.
                </p>
                <div className="mt-5 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirming(false)}
                    className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={sending}
                    onClick={handleSend}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60"
                  >
                    {sending ? (
                      <>
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        Sending...
                      </>
                    ) : (
                      "Yes, send it"
                    )}
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
