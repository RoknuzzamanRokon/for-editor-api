import Link from 'next/link'
import PdfPageRemover from '@/components/PdfPageRemover'

export default function RemovePagesFromPdfPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="text-primary hover:underline text-sm">
            ← Back to home
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-foreground mb-2">Remove Pages from PDF</h1>
        <p className="text-foreground/70 mb-8">Remove specific pages or blank pages from your PDF file</p>

        <PdfPageRemover />
      </div>
    </div>
  )
}
