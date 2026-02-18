import ConverterCard from '@/components/ConverterCard'

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">App list</h1>
          <p className="text-foreground/70">Choose a conversion type to get started</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <ConverterCard
            title="PDF to DOCX"
            description="Convert PDF files to Word documents"
            href="/pdf-to-docx"
            icon={
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          />

          <ConverterCard
            title="PDF to Excel"
            description="Convert PDF files to Excel spreadsheets"
            href="/pdf-to-excel"
            icon={
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            }
          />
        </div>
      </div>
    </div>
  )
}
