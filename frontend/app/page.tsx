import Link from 'next/link'
import ConverterCard from '@/components/ConverterCard'

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      <div className="hero-glow absolute inset-0 -z-10" />
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <section>
            <span className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold tracking-wide text-primary">
              Secure PDF Conversion Suite
            </span>
            <h1 className="mt-4 text-4xl font-bold leading-tight text-foreground md:text-5xl">
              Convert PDFs into editable files with professional accuracy
            </h1>
            <p className="mt-4 max-w-2xl text-base text-foreground/70 md:text-lg">
              Upload your document once, choose the format you need, and download results ready for business use.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/pdf-to-docx"
                className="rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
              >
                Start PDF to DOCX
              </Link>
              <Link
                href="/pdf-to-excel"
                className="rounded-lg border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                Start PDF to Excel
              </Link>
            </div>
          </section>

          <aside className="rounded-2xl border border-border bg-card p-6 shadow-xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Why teams use this tool</p>
            <div className="mt-6 space-y-4">
              {[
                { title: 'Fast output', detail: 'Process files in seconds with a simple workflow.' },
                { title: 'Clean formatting', detail: 'Preserve text structure for easier editing.' },
                { title: 'Privacy first', detail: 'Built for secure document handling and file cleanup.' },
              ].map((item) => (
                <div key={item.title} className="rounded-xl border border-border p-4">
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-1 text-sm text-foreground/70">{item.detail}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>

        <section className="mx-auto mt-14 max-w-6xl">
          <div className="mb-6 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-foreground md:text-3xl">Choose Your Conversion</h2>
              <p className="mt-1 text-sm text-foreground/70">Select the format that fits your workflow.</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <ConverterCard
              title="PDF to DOCX"
              description="Convert PDF files to editable Word documents with preserved structure."
              href="/pdf-to-docx"
              icon={
                <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
            />

            <ConverterCard
              title="PDF to Excel"
              description="Extract table data from PDFs into organized Excel spreadsheets."
              href="/pdf-to-excel"
              icon={
                <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              }
            />
          </div>
        </section>
      </div>
    </div>
  )
}
