import FileConverter from '@/components/FileConverter'
import Link from 'next/link'

export default function RemoveBackgroundPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="text-primary hover:underline text-sm">
            ← Back to home
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-foreground mb-2">Remove Image Background</h1>
        <p className="text-foreground/70 mb-8">
          Upload a PNG, JPG, JPEG, or WEBP image and download a PNG with a transparent background.
        </p>

        <FileConverter
          apiEndpoint="/api/v1/conversions/remove-background"
          filesEndpoint="/api/v1/conversions/remove-background/files"
          acceptedFileTypes=".png,.jpg,.jpeg,.webp"
          convertButtonLabel="Remove Background"
          processingLabel="Removing background..."
          previewMode="image"
        />
      </div>
    </div>
  )
}
