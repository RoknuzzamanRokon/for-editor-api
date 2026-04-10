import FileConverter from '@/components/FileConverter'
import Link from 'next/link'

export default function DocxToPdfPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="text-primary hover:underline text-sm">
            ← Back to home
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-foreground mb-2">DOCX to PDF Converter</h1>
        <p className="text-foreground/70 mb-8">Convert your Word documents to PDF files</p>

        <FileConverter
          apiEndpoint="/api/v1/conversions/docx-to-pdf"
          filesEndpoint="/api/v1/conversions/docx-to-pdf/files"
          acceptedFileTypes=".docx"
          convertButtonLabel="Convert to PDF"
          processingLabel="Converting DOCX to PDF..."
        />
      </div>
    </div>
  )
}
