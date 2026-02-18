import Link from 'next/link'
import ConverterCard from '@/components/ConverterCard'

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      <div className="hero-glow absolute inset-0 -z-10" />
      <div className="container mx-auto px-4 py-12 md:py-20">
        <section className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold tracking-wide text-primary">
            Professional PDF Converter
          </span>
          <h1 className="mt-5 text-4xl font-bold leading-tight text-foreground md:text-5xl">
            Clean, fast PDF conversion for everyday work
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-foreground/70 md:text-lg">
            Convert PDF files to Word or Excel in a few clicks with reliable formatting and a simple workflow.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/pdf-to-docx"
              className="rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
            >
              Convert to DOCX
            </Link>
            <Link
              href="/pdf-to-excel"
              className="rounded-lg border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              Convert to Excel
            </Link>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {['Fast processing', 'Accurate output', 'Secure handling'].map((item) => (
              <div key={item} className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground/80">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-14 max-w-5xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">Choose Conversion Type</h2>
            <p className="mt-1 text-sm text-foreground/70">Select one option to start uploading your file.</p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <ConverterCard
              title="PDF to DOCX"
              description="Turn PDFs into editable Word documents for reports, letters, and drafts."
              href="/pdf-to-docx"
              icon={
                <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
            />

            <ConverterCard
              title="PDF to Excel"
              description="Extract tables and structured data into clean Excel spreadsheets."
              href="/pdf-to-excel"
              icon={
                <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              }
            />

            <ConverterCard
              title="DOCX to PDF"
              description="Convert Word documents into professional PDF files for sharing."
              href="/docx-to-pdf"
              icon={
                <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 3h6l4 4v12a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 3v5h5M8 13h8M8 17h6" />
                </svg>
              }
            />
          </div>
        </section>
      </div>
    </div>
  )
}
