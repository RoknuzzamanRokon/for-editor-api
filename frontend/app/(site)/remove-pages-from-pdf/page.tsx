import Link from 'next/link'
import PdfPageRemover from '@/components/PdfPageRemover'

export default function RemovePagesFromPdfPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.12),transparent_30%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-4 py-8 dark:bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.16),transparent_28%),linear-gradient(180deg,#020617_0%,#0f172a_100%)]">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <Link href="/" className="text-primary hover:underline text-sm">
            ← Back to home
          </Link>
        </div>

        <div className="mb-8 rounded-[24px] border border-white/70 bg-white/80 px-6 py-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-primary">
            PDF Utility
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Remove Pages from PDF
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-600 dark:text-slate-300 sm:text-base">
            Preview your PDF first, select the pages you want to remove, and download the updated file directly from the same screen.
          </p>
        </div>

        <PdfPageRemover />
      </div>
    </div>
  )
}
