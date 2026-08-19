"use client";

// Mirrors backend/services/email_templates.py's build_marketing_email_html —
// keep the two in sync if either changes. The header color and signature
// block are intentionally fixed, not theme-driven: an outbound email has no
// access to the recipient's (or sender's) live in-app theme.
const BRAND_COLOR = "#f97316";

export default function EmailPreview({
  subject,
  bodyHtml,
}: {
  subject: string;
  bodyHtml: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-950 p-4 sm:p-6">
      <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Preview — exactly what the recipient will see
      </p>
      <div className="mx-auto max-w-[560px] overflow-hidden rounded-xl bg-white shadow-lg">
        <div style={{ backgroundColor: BRAND_COLOR }} className="px-8 py-6">
          <span className="text-lg font-extrabold tracking-tight text-white">ConvaterPro</span>
        </div>
        <div className="px-8 py-8">
          <p className="mb-4 text-sm font-bold text-slate-800">
            {subject || <span className="italic text-slate-400">(no subject yet)</span>}
          </p>
          {bodyHtml ? (
            <div
              className="rte-content text-sm text-slate-700"
              dangerouslySetInnerHTML={{ __html: bodyHtml }}
            />
          ) : (
            <p className="text-sm italic text-slate-400">Your message will appear here...</p>
          )}
          <div className="mt-7 border-t border-slate-200 pt-5 text-sm">
            <p className="mb-1 text-slate-600">Best regards,</p>
            <p className="font-bold text-slate-900">Md Rokunuzzaman Rokon</p>
            <p className="mb-1 text-slate-600">Developer, ConvaterPro</p>
            <a
              href="https://convaterpro.innsightmap.com/"
              className="pointer-events-none"
              style={{ color: BRAND_COLOR }}
            >
              https://convaterpro.innsightmap.com/
            </a>
          </div>
        </div>
        <div className="border-t border-slate-200 bg-slate-50 px-8 py-3.5">
          <p className="text-[10px] text-slate-300 underline">Unsubscribe</p>
        </div>
      </div>
    </div>
  );
}
