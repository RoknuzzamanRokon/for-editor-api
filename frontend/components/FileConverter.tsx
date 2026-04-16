'use client'

import Image from 'next/image'
import { useState, useEffect, useCallback } from 'react'

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
  previewMode?: 'none' | 'image'
}

export default function FileConverter({
  apiEndpoint,
  filesEndpoint,
  acceptedFileTypes = '.pdf',
  convertButtonLabel = 'Convert',
  processingLabel = 'Processing your file...',
  previewMode = 'none',
}: FileConverterProps) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [files, setFiles] = useState<FileInfo[]>([])
  const [inputPreviewUrl, setInputPreviewUrl] = useState<string | null>(null)
  const [outputPreviewUrl, setOutputPreviewUrl] = useState<string | null>(null)
  const [outputFilename, setOutputFilename] = useState<string | null>(null)

  const loadFiles = useCallback(async () => {
    try {
      const res = await fetch(filesEndpoint)
      const data = await res.json()
      if (data.files) {
        setFiles(data.files)
      }
    } catch (error) {
      console.error('Error loading files:', error)
    }
  }, [filesEndpoint])

  useEffect(() => {
    void loadFiles()
  }, [loadFiles])

  useEffect(() => {
    return () => {
      if (inputPreviewUrl) {
        URL.revokeObjectURL(inputPreviewUrl)
      }
    }
  }, [inputPreviewUrl])

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
    setOutputPreviewUrl(null)
    setOutputFilename(null)

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
        if (previewMode === 'image' && data.download_url) {
          const downloadUrl = data.download_url.startsWith('/v1/')
            ? `/api${data.download_url}`
            : data.download_url.startsWith('/api/')
              ? data.download_url
              : data.download_url
          setOutputPreviewUrl(downloadUrl)
          setOutputFilename(data.filename || null)
        }
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
              onChange={(e) => {
                const selected = e.target.files?.[0] || null
                setFile(selected)
                setMessage(null)
                if (previewMode === 'image' && selected) {
                  if (inputPreviewUrl) {
                    URL.revokeObjectURL(inputPreviewUrl)
                  }
                  setInputPreviewUrl(URL.createObjectURL(selected))
                } else {
                  if (inputPreviewUrl) {
                    URL.revokeObjectURL(inputPreviewUrl)
                  }
                  setInputPreviewUrl(null)
                }
              }}
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

          {previewMode === 'image' && inputPreviewUrl && (
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-foreground/60 mb-3">Selected Image</p>
              <div className="relative overflow-hidden rounded-lg border border-border bg-card">
                <Image
                  src={inputPreviewUrl}
                  alt="Selected preview"
                  width={1200}
                  height={800}
                  unoptimized
                  className="h-64 w-full object-contain bg-white"
                />
              </div>
            </div>
          )}

          {message && (
            <div className={`rounded-lg border p-4 ${
              message.type === 'success' 
                ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' 
                : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
            }`}>
              <p className="text-sm text-black">
                {message.type === 'success' ? '✓ ' : '✕ '}
                {message.text}
              </p>
            </div>
          )}

          {previewMode === 'image' && outputPreviewUrl && (
            <div className="rounded-lg border border-border bg-background p-4 space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-foreground/60 mb-3">Result Preview</p>
                <div className="relative overflow-hidden rounded-lg border border-border bg-card">
                  <Image
                    src={outputPreviewUrl}
                    alt="Output preview"
                    width={1200}
                    height={800}
                    unoptimized
                    className="h-64 w-full object-contain bg-white"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={outputPreviewUrl}
                  download
                  className="inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Download PNG
                </a>
                {outputFilename && (
                  <span className="text-xs text-foreground/70 font-mono">{outputFilename}</span>
                )}
              </div>
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
