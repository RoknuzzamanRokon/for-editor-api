'use client'

import { useState, useEffect } from 'react'

interface FileInfo {
  filename: string
  conversion_date: string
  file_size: number
}

interface FileConverterProps {
  apiEndpoint: string
  filesEndpoint: string
  acceptedFileTypes?: string
  convertButtonLabel?: string
  processingLabel?: string
}

export default function FileConverter({
  apiEndpoint,
  filesEndpoint,
  acceptedFileTypes = '.pdf',
  convertButtonLabel = 'Convert',
  processingLabel = 'Processing your file...',
}: FileConverterProps) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [files, setFiles] = useState<FileInfo[]>([])

  useEffect(() => {
    loadFiles()
  }, [])

  const loadFiles = async () => {
    try {
      const res = await fetch(filesEndpoint)
      const data = await res.json()
      if (data.files) {
        setFiles(data.files)
      }
    } catch (error) {
      console.error('Error loading files:', error)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setMessage({ type: 'error', text: 'Please select a file' })
      return
    }

    if (file.size > 50 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File size exceeds 50MB limit' })
      return
    }

    setLoading(true)
    setMessage(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch(apiEndpoint, {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setMessage({ type: 'success', text: data.message })
        setFile(null)
        await loadFiles()
      } else {
        setMessage({
          type: 'error',
          text: data.detail || data.message || 'Conversion failed',
        })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error occurred' })
    } finally {
      setLoading(false)
    }
  }

  const formatSize = (bytes: number) => {
    const k = 1024
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + ['Bytes', 'KB', 'MB', 'GB'][i]
  }

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Upload File</h2>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="file"
              accept={acceptedFileTypes}
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="flex-1 text-sm p-3 bg-background border border-border rounded-lg text-foreground cursor-pointer file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:bg-primary file:text-white file:cursor-pointer hover:file:bg-primary/90 transition-colors"
            />
            <button
              onClick={handleUpload}
              disabled={loading || !file}
              className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
            >
              {loading ? 'Converting...' : convertButtonLabel}
            </button>
          </div>

          {loading && (
            <div className="rounded-lg border border-border p-6 text-center bg-card">
              <div className="inline-block w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin mb-3" />
              <p className="text-sm text-foreground/70">{processingLabel}</p>
            </div>
          )}

          {message && (
            <div className={`rounded-lg border p-4 ${
              message.type === 'success' 
                ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' 
                : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
            }`}>
              <p className="text-sm text-foreground">
                {message.type === 'success' ? '✓ ' : '✕ '}
                {message.text}
              </p>
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">Converted Files</h2>

        {files.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-12 text-center bg-card">
            <p className="text-sm text-foreground/70">No files available</p>
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-card-hover border-b border-border">
                    <th className="p-3 text-left font-medium text-foreground">Filename</th>
                    <th className="p-3 text-left font-medium text-foreground">Date</th>
                    <th className="p-3 text-left font-medium text-foreground">Size</th>
                    <th className="p-3 text-left font-medium text-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((f, idx) => (
                    <tr key={idx} className="border-b border-border last:border-0 hover:bg-card-hover transition-colors">
                      <td className="p-3 text-foreground font-mono text-xs">{f.filename}</td>
                      <td className="p-3 text-foreground/70">{new Date(f.conversion_date).toLocaleString()}</td>
                      <td className="p-3 text-foreground/70">{formatSize(f.file_size)}</td>
                      <td className="p-3">
                        <a
                          href={`${filesEndpoint}/${f.filename}`}
                          download
                          className="inline-block px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                        >
                          Download
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
