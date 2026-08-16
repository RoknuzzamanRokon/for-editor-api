'use client'

import Image from 'next/image'
import { useEffect, useState, type ReactNode } from 'react'
import { authFetch } from '@/lib/authFetch'

type PdfJsModule = typeof import('pdfjs-dist')

type PdfPageOrganizerProps = {
  apiBase?: string
  apiEndpoint?: string
  includeAuth?: boolean
}

type PageThumbnail = {
  pageNumber: number
  imageUrl: string
}

interface ConversionResponse {
  success?: boolean
  message?: string
  filename?: string | null
  download_url?: string | null
  detail?: string
  status?: string | null
}

function SectionCard({
  title,
  description,
  action,
  children,
}: {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="relative overflow-hidden rounded-[13px] border border-border bg-white/30 p-4 backdrop-blur-2xl [box-shadow:4px_4px_0px_0px_var(--border)] dark:bg-white/[0.03]">
      <div className="absolute inset-y-4 left-4 w-px bg-gradient-to-b from-transparent via-[color-mix(in_srgb,var(--primary)_50%,transparent)] to-transparent" />
      <div className="overflow-hidden rounded-[18px]">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-sm text-slate-500">{description}</p>
            ) : null}
          </div>
          {action ? <div>{action}</div> : null}
        </div>
        <div className="p-6">{children}</div>
      </div>
    </section>
  )
}

let pdfJsModulePromise: Promise<PdfJsModule> | null = null

async function loadPdfJsModule() {
  if (!pdfJsModulePromise) {
    pdfJsModulePromise = import('pdfjs-dist').then((module) => {
      module.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`
      return module
    })
  }
  return pdfJsModulePromise
}

async function renderAllThumbnails(file: File): Promise<PageThumbnail[]> {
  const pdfjs = await loadPdfJsModule()
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise
  const thumbnails: PageThumbnail[] = []

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber)
    const viewport = page.getViewport({ scale: 0.4 })
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Canvas renderer unavailable')
    canvas.width = viewport.width
    canvas.height = viewport.height
    await page.render({ canvasContext: context, viewport }).promise
    thumbnails.push({ pageNumber, imageUrl: canvas.toDataURL('image/png', 0.92) })
  }

  return thumbnails
}

export default function PdfPageOrganizer({
  apiBase = '',
  apiEndpoint = '/api/v3/conversions/pdf-organize',
  includeAuth = false,
}: PdfPageOrganizerProps = {}) {
  const [file, setFile] = useState<File | null>(null)
  const [thumbnails, setThumbnails] = useState<PageThumbnail[]>([])
  const [pageOrder, setPageOrder] = useState<number[]>([])
  const [loadingThumbnails, setLoadingThumbnails] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [resultFilename, setResultFilename] = useState<string | null>(null)

  const buildUrl = (path: string) =>
    path.startsWith('http://') || path.startsWith('https://') ? path : `${apiBase}${path}`

  useEffect(() => {
    return () => {
      if (resultUrl?.startsWith('blob:')) URL.revokeObjectURL(resultUrl)
    }
  }, [resultUrl])

  useEffect(() => {
    setThumbnails([])
    setPageOrder([])
    setMessage(null)
    setResultUrl((current) => {
      if (current?.startsWith('blob:')) URL.revokeObjectURL(current)
      return null
    })

    if (!file) return

    let cancelled = false
    setLoadingThumbnails(true)

    renderAllThumbnails(file)
      .then((rendered) => {
        if (cancelled) return
        setThumbnails(rendered)
        setPageOrder(rendered.map((t) => t.pageNumber))
      })
      .catch(() => {
        if (!cancelled) {
          setMessage({ type: 'error', text: 'Failed to render PDF pages for preview.' })
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingThumbnails(false)
      })

    return () => {
      cancelled = true
    }
  }, [file])

  const thumbnailByPage = new Map(thumbnails.map((t) => [t.pageNumber, t]))

  const moveTo = (from: number, to: number) => {
    setPageOrder((prev) => {
      if (to < 0 || to >= prev.length) return prev
      const next = [...prev]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })
  }

  const removePage = (pageNumber: number) => {
    setPageOrder((prev) => prev.filter((p) => p !== pageNumber))
  }

  const handleSubmit = async () => {
    if (!file) {
      setMessage({ type: 'error', text: 'Please select a PDF file.' })
      return
    }
    if (pageOrder.length === 0) {
      setMessage({ type: 'error', text: 'Keep at least one page.' })
      return
    }

    setSubmitting(true)
    setMessage(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('page_order', pageOrder.join(','))

    try {
      const res = await authFetch(buildUrl(apiEndpoint), { method: 'POST', body: formData }, {
        requireAuth: includeAuth,
        apiBase,
      })
      const data = (await res.json()) as ConversionResponse

      if (!res.ok || !data.download_url) {
        setMessage({ type: 'error', text: data.detail || data.message || 'Reorganizing failed.' })
        return
      }

      const downloadRes = await authFetch(buildUrl(data.download_url), {}, {
        requireAuth: includeAuth,
        apiBase,
      })
      if (!downloadRes.ok) throw new Error('Unable to load the reorganized PDF.')

      const blob = await downloadRes.blob()
      const objectUrl = URL.createObjectURL(blob)
      setResultUrl((current) => {
        if (current?.startsWith('blob:')) URL.revokeObjectURL(current)
        return objectUrl
      })
      setResultFilename(data.filename ?? 'reorganized.pdf')
      setMessage({ type: 'success', text: data.message || 'PDF reorganized successfully.' })

      const anchor = document.createElement('a')
      anchor.href = objectUrl
      anchor.download = data.filename ?? 'reorganized.pdf'
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error occurred while reorganizing the PDF.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <SectionCard
        title="Upload a PDF"
        description="Drag thumbnails to reorder pages, or click the × to drop one. Then convert to download the rebuilt PDF."
      >
        <label className="flex cursor-pointer flex-col gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 transition hover:border-primary/40 hover:bg-white dark:border-slate-700 dark:bg-slate-950/40 dark:hover:border-primary/40 dark:hover:bg-slate-900">
          <span className="text-sm font-semibold text-slate-900 dark:text-white">
            Select PDF file
          </span>
          <span className="text-sm text-slate-500">Upload one PDF up to 50MB.</span>
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
            className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-primary file:px-4 file:py-2.5 file:font-semibold file:text-white hover:file:opacity-90 dark:text-slate-300"
          />
        </label>

        {message ? (
          <div
            className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
              message.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200'
                : 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200'
            }`}
          >
            {message.text}
          </div>
        ) : null}

        {loadingThumbnails ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center dark:border-slate-800 dark:bg-slate-950/40">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-primary dark:border-slate-700 dark:border-t-primary" />
            <p className="text-sm text-slate-500">Rendering page thumbnails...</p>
          </div>
        ) : pageOrder.length > 0 ? (
          <div className="mt-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-500">
                {pageOrder.length} of {thumbnails.length} pages kept — drag a thumbnail, or use its position dropdown, to reorder
              </p>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || pageOrder.length === 0}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-base">auto_fix_high</span>
                {submitting ? 'Converting...' : 'Convert & Download'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {pageOrder.map((pageNumber, index) => {
                const thumbnail = thumbnailByPage.get(pageNumber)
                return (
                  <div key={pageNumber} className="group flex flex-col gap-1.5">
                    <div
                      draggable
                      onDragStart={() => setDragIndex(index)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault()
                        if (dragIndex !== null && dragIndex !== index) {
                          moveTo(dragIndex, index)
                        }
                        setDragIndex(null)
                      }}
                      onDragEnd={() => setDragIndex(null)}
                      className={`relative aspect-[3/4] cursor-grab overflow-hidden rounded-xl border bg-slate-50 transition dark:bg-slate-800/50 ${
                        dragIndex === index
                          ? 'border-primary opacity-80 ring-2 ring-primary'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {thumbnail ? (
                        <Image
                          src={thumbnail.imageUrl}
                          alt={`Page ${pageNumber}`}
                          width={220}
                          height={300}
                          unoptimized
                          draggable={false}
                          className="h-full w-full select-none object-contain"
                        />
                      ) : null}
                      <span className="absolute left-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-[11px] font-bold text-white">
                        {index + 1}
                      </span>
                      <span className="absolute left-1.5 bottom-1.5 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                        original p.{pageNumber}
                      </span>
                      <button
                        type="button"
                        onClick={() => removePage(pageNumber)}
                        className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100 hover:bg-rose-500"
                        aria-label={`Drop page ${pageNumber}`}
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>

                    <select
                      value={index}
                      onChange={(e) => moveTo(index, Number(e.target.value))}
                      aria-label={`Move page ${pageNumber} to a different position`}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-primary/40 focus:border-primary focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                    >
                      {pageOrder.map((_, position) => (
                        <option key={position} value={position}>
                          Position {position + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                )
              })}
            </div>
          </div>
        ) : file ? (
          <p className="mt-6 text-sm text-slate-500">No pages left. Reload the PDF to start over.</p>
        ) : null}
      </SectionCard>

      {resultUrl ? (
        <SectionCard
          title="Reorganized PDF"
          description="Already downloaded — you can grab it again below."
          action={
            <a
              href={resultUrl}
              download={resultFilename || 'reorganized.pdf'}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white transition hover:opacity-90"
            >
              <span className="material-symbols-outlined text-base">download</span>
              Download PDF
            </a>
          }
        >
          <p className="text-sm text-slate-500">
            {resultFilename} is ready. Use the button above to download it again.
          </p>
        </SectionCard>
      ) : null}
    </div>
  )
}
