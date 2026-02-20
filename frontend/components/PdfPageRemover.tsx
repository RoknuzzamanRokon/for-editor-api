'use client'

import { useEffect, useMemo, useState } from 'react'
import Script from 'next/script'

interface FileInfo {
  filename: string
  conversion_date: string
  file_size: number
}

interface PagePreview {
  pageNumber: number
  dataUrl: string
}

declare global {
  interface Window {
    pdfjsLib?: any
  }
}

export default function PdfPageRemover() {
  const [file, setFile] = useState<File | null>(null)
  const [removeBlank, setRemoveBlank] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [files, setFiles] = useState<FileInfo[]>([])
  const [pdfReady, setPdfReady] = useState(false)
  const [pagePreviews, setPagePreviews] = useState<PagePreview[]>([])
  const [selectedPages, setSelectedPages] = useState<number[]>([])
  const [pageCount, setPageCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)

  const apiEndpoint = '/api/v1/conversions/remove-pages-from-pdf'
  const filesEndpoint = '/api/v1/conversions/remove-pages-from-pdf/files'

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

  useEffect(() => {
    if (!file || !pdfReady) {
      setPagePreviews([])
      setSelectedPages([])
      setPageCount(0)
      setCurrentPage(1)
      return
    }

    const renderPages = async () => {
      try {
        if (!window.pdfjsLib) {
          setMessage({ type: 'error', text: 'PDF renderer not loaded' })
          return
        }

        const arrayBuffer = await file.arrayBuffer()
        const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer })
        const pdf = await loadingTask.promise
        const previews: PagePreview[] = []
        const total = pdf.numPages
        setPageCount(total)
        setCurrentPage(1)

        for (let i = 1; i <= total; i++) {
          const page = await pdf.getPage(i)
          const viewport = page.getViewport({ scale: 1.5 })
          const canvas = document.createElement('canvas')
          const context = canvas.getContext('2d')
          if (!context) {
            continue
          }
          canvas.width = viewport.width
          canvas.height = viewport.height
          await page.render({ canvasContext: context, viewport }).promise
          const dataUrl = canvas.toDataURL('image/png', 1.0)
          previews.push({ pageNumber: i, dataUrl })
        }

        setPagePreviews(previews)
      } catch (error) {
        console.error('Error rendering PDF:', error)
        setMessage({ type: 'error', text: 'Failed to render PDF pages' })
      }
    }

    setMessage(null)
    renderPages()
  }, [file, pdfReady])

  const togglePage = (pageNumber: number) => {
    setSelectedPages((prev) => {
      if (prev.includes(pageNumber)) {
        return prev.filter((p) => p !== pageNumber)
      }
      return [...prev, pageNumber].sort((a, b) => a - b)
    })
  }

  const buildPagesSpec = (pages: number[]) => {
    if (pages.length === 0) return ''
    const sorted = [...pages].sort((a, b) => a - b)
    const ranges: string[] = []
    let start = sorted[0]
    let end = sorted[0]

    for (let i = 1; i < sorted.length; i++) {
      const current = sorted[i]
      if (current === end + 1) {
        end = current
      } else {
        ranges.push(start === end ? `${start}` : `${start}-${end}`)
        start = current
        end = current
      }
    }
    ranges.push(start === end ? `${start}` : `${start}-${end}`)
    return ranges.join(',')
  }

  const pagesSpec = useMemo(() => buildPagesSpec(selectedPages), [selectedPages])

  const handleUpload = async () => {
    if (!file) {
      setMessage({ type: 'error', text: 'Please select a PDF file' })
      return
    }

    if (!pagesSpec && !removeBlank) {
      setMessage({ type: 'error', text: 'Select pages to remove or enable blank page removal' })
      return
    }

    if (file.size > 50 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File size exceeds 50MB limit' })
      return
    }

    if (pageCount > 0 && selectedPages.length >= pageCount && !removeBlank) {
      setMessage({ type: 'error', text: 'Cannot remove all pages from the PDF' })
      return
    }

    setLoading(true)
    setMessage(null)

    const formData = new FormData()
    formData.append('file', file)
    if (pagesSpec) {
      formData.append('pages', pagesSpec)
    }
    formData.append('remove_blank', removeBlank ? 'true' : 'false')

    try {
      const res = await fetch(apiEndpoint, {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setMessage({ type: 'success', text: data.message })
        setFile(null)
        setSelectedPages([])
        await loadFiles()
      } else {
        setMessage({ type: 'error', text: data.detail || data.message || 'Page removal failed' })
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
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
        strategy="afterInteractive"
        onLoad={() => {
          if (window.pdfjsLib) {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc =
              'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
            setPdfReady(true)
          }
        }}
      />

      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Upload PDF</h2>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="flex-1 text-sm p-3 bg-background border border-border rounded-lg text-foreground cursor-pointer file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:bg-primary file:text-white file:cursor-pointer hover:file:bg-primary/90 transition-colors"
            />
            <button
              onClick={handleUpload}
              disabled={loading || !file}
              className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
            >
              {loading ? 'Processing...' : 'Save PDF'}
            </button>
          </div>

          <div className="rounded-lg border border-border bg-background p-4 flex items-center gap-3">
            <input
              id="remove-blank"
              type="checkbox"
              checked={removeBlank}
              onChange={(e) => setRemoveBlank(e.target.checked)}
              className="h-4 w-4"
            />
            <label htmlFor="remove-blank" className="text-sm text-foreground">
              Remove blank (extra) pages
            </label>
          </div>

          <div className="rounded-lg border border-border bg-background p-4">
            <p className="text-sm text-foreground">
              Selected pages to remove: <span className="font-mono">{pagesSpec || 'None'}</span>
            </p>
          </div>

          {pagePreviews.length > 0 && (
            <div className="rounded-lg border border-border bg-background p-4 space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-sm text-foreground">
                  Page {currentPage} of {pageCount}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    className="px-3 py-2 rounded-lg border border-border text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(pageCount, p + 1))}
                    disabled={currentPage >= pageCount}
                    className="px-3 py-2 rounded-lg border border-border text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>

              {pagePreviews.find((p) => p.pageNumber === currentPage) && (
                <div className="relative rounded-lg border overflow-hidden bg-card flex justify-center">
                  <img
                    src={pagePreviews.find((p) => p.pageNumber === currentPage)!.dataUrl}
                    alt={`Page ${currentPage}`}
                    className="max-w-full h-auto"
                    style={{ imageRendering: 'crisp-edges' }}
                  />
                  <div className="absolute top-3 left-3 rounded-full bg-black/70 text-white text-xs px-2 py-1">
                    Page {currentPage}
                  </div>
                  <button
                    type="button"
                    onClick={() => togglePage(currentPage)}
                    aria-label={selectedPages.includes(currentPage) ? 'Undo remove page' : 'Remove page'}
                    className={`absolute top-3 right-3 h-10 w-10 rounded-full flex items-center justify-center text-xl font-bold transition-all shadow-lg hover:scale-110 ${
                      selectedPages.includes(currentPage) 
                        ? 'bg-red-600 hover:bg-red-700 text-white border-2 border-white' 
                        : 'bg-white hover:bg-gray-100 text-gray-800 border-2 border-gray-300'
                    }`}
                  >
                    {selectedPages.includes(currentPage) ? '↺' : '×'}
                  </button>
                </div>
              )}
            </div>
          )}

          {loading && (
            <div className="rounded-lg border border-border p-6 text-center bg-card">
              <div className="inline-block w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin mb-3" />
              <p className="text-sm text-foreground/70">Processing your PDF...</p>
            </div>
          )}

          {message && (
            <div
              className={`rounded-lg border p-4 ${
                message.type === 'success'
                  ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
              }`}
            >
              <p className="text-sm text-foreground">
                {message.type === 'success' ? '✓ ' : '✕ '}
                {message.text}
              </p>
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">Processed Files</h2>

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
