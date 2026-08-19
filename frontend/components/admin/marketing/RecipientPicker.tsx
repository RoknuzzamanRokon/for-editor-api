"use client";

import { useMemo, useState } from "react";
import { isValidEmail, type Contact } from "@/lib/marketing";

export type PickedRecipient =
  | { kind: "contact"; contact: Contact }
  | { kind: "email"; email: string };

export default function RecipientPicker({
  contacts,
  picked,
  onChange,
}: {
  contacts: Contact[];
  picked: PickedRecipient[];
  onChange: (next: PickedRecipient[]) => void;
}) {
  const [search, setSearch] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [emailError, setEmailError] = useState("");

  const pickedContactIds = useMemo(
    () =>
      new Set(picked.filter((r) => r.kind === "contact").map((r) => (r as { contact: Contact }).contact.id)),
    [picked],
  );
  const pickedEmails = useMemo(
    () =>
      new Set(
        picked
          .filter((r) => r.kind === "email")
          .map((r) => (r as { email: string }).email.toLowerCase()),
      ),
    [picked],
  );

  const results = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return [];
    return contacts
      .filter((c) => !pickedContactIds.has(c.id) && c.status !== "unsubscribed")
      .filter(
        (c) =>
          c.email.toLowerCase().includes(term) ||
          (c.company_name ?? "").toLowerCase().includes(term) ||
          (c.contact_name ?? "").toLowerCase().includes(term),
      )
      .slice(0, 8);
  }, [contacts, search, pickedContactIds]);

  const addContact = (contact: Contact) => {
    onChange([...picked, { kind: "contact", contact }]);
    setSearch("");
  };

  const addEmail = () => {
    const value = emailInput.trim().toLowerCase();
    if (!value) return;
    if (!isValidEmail(value)) {
      setEmailError("Enter a valid email address");
      return;
    }
    const alreadyAContact = contacts.find((c) => c.email.toLowerCase() === value);
    if (alreadyAContact && !pickedContactIds.has(alreadyAContact.id)) {
      addContact(alreadyAContact);
    } else if (!pickedEmails.has(value) && !alreadyAContact) {
      onChange([...picked, { kind: "email", email: value }]);
    }
    setEmailInput("");
    setEmailError("");
  };

  const remove = (index: number) => {
    onChange(picked.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="relative">
          <span className="material-symbols-outlined pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-lg text-slate-400">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search saved contacts..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
          {results.length > 0 ? (
            <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
              {results.map((contact) => (
                <button
                  key={contact.id}
                  type="button"
                  onClick={() => addContact(contact)}
                  className="flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <span className="font-medium text-slate-900 dark:text-white">
                    {contact.contact_name || contact.company_name || contact.email}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{contact.email}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div>
          <div className="flex gap-2">
            <input
              type="email"
              value={emailInput}
              onChange={(e) => {
                setEmailInput(e.target.value);
                setEmailError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addEmail();
                }
              }}
              placeholder="Type a new email address..."
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
            <button
              type="button"
              onClick={addEmail}
              className="shrink-0 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Add
            </button>
          </div>
          {emailError ? <p className="mt-1 text-xs text-rose-600">{emailError}</p> : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {picked.length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-slate-500">No recipients selected yet.</p>
        ) : (
          picked.map((recipient, index) => {
            const label =
              recipient.kind === "contact"
                ? recipient.contact.contact_name || recipient.contact.company_name || recipient.contact.email
                : recipient.email;
            const sublabel = recipient.kind === "contact" ? recipient.contact.email : null;
            return (
              <span
                key={`${recipient.kind}-${index}`}
                className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-sm text-slate-800 dark:text-slate-100"
              >
                <span className="font-medium">{label}</span>
                {sublabel && sublabel !== label ? (
                  <span className="text-xs text-slate-500 dark:text-slate-400">{sublabel}</span>
                ) : null}
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-slate-400 hover:text-rose-600"
                  title="Remove"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </span>
            );
          })
        )}
      </div>
    </div>
  );
}
