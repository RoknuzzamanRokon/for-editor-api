'use client'

import Image from 'next/image'
import { useEffect, useMemo, useState, type ReactNode } from 'react'

type PdfJsModule = typeof import('pdfjs-dist/legacy/build/pdf.mjs')

interface FileInfo {
  filename: string
  conversion_date: string
  file_size: number
}

interface ConversionResponse {
  success?: boolean
  message?: string
  filename?: string | null
  download_url?: string | null
  detail?: string
  status?: string | null
}

type PdfPageRemoverProps = {
  apiBase?: string
  apiEndpoint?: string
  filesEndpoint?: string
  includeAuth?: boolean
  showRecentFiles?: boolean
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
    <section className="overflow-hidden rounded-[13px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
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
    </section>
  )
}

const PDF_PREVIEW_FRAME_CLASS =
  'flex min-h-[546px] w-full items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 p-4 dark:border-slate-800 dark:bg-slate-950/60 sm:min-h-[820px]'

let pdfJsModulePromise: Promise<PdfJsModule> | null = null

async function loadPdfJsModule() {
  if (!pdfJsModulePromise) {
    pdfJsModulePromise = import('pdfjs-dist/legacy/build/pdf.mjs').then(
      (module) => {
        module.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'
        return module
      },
    )
  }

  return pdfJsModulePromise
}

function getAuthHeaders(includeAuth: boolean): Record<string, string> {
  if (!includeAuth) return {}
  const token = window.localStorage.getItem('access_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export default function PdfPageRemover({
  apiBase = '',
  apiEndpoint = '/api/v1/conversions/remove-pages-from-pdf',
  filesEndpoint = '/api/v1/conversions/remove-pages-from-pdf/files',
  includeAuth = false,
  showRecentFiles = true,
}: PdfPageRemoverProps = {}) {
  const [file, setFile] = useState<File | null>(null)
  const [removeBlank, setRemoveBlank] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [files, setFiles] = useState<FileInfo[]>([])
  const [pdfReady, setPdfReady] = useState(false)
  const [selectedPages, setSelectedPages] = useState<number[]>([])
  const [sourcePageCount, setSourcePageCount] = useState(0)
  const [sourcePage, setSourcePage] = useState(1)
  const [sourcePageImage, setSourcePageImage] = useState<string | null>(null)
  const [sourcePreviewLoading, setSourcePreviewLoading] = useState(false)
  const [resultPageCount, setResultPageCount] = useState(0)
  const [resultPage, setResultPage] = useState(1)
  const [resultPageImage, setResultPageImage] = useState<string | null>(null)
  const [resultPreviewLoading, setResultPreviewLoading] = useState(false)
  const [resultPreviewUrl, setResultPreviewUrl] = useState<string | null>(null)
  const [resultFilename, setResultFilename] = useState<string | null>(null)

  const buildUrl = (path: string) =>
    path.startsWith('http://') || path.startsWith('https://')
      ? path
      : `${apiBase}${path}`

  useEffect(() => {
    return () => {
      if (resultPreviewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(resultPreviewUrl)
      }
    }
  }, [resultPreviewUrl])

  useEffect(() => {
    let cancelled = false

    const preparePdfRenderer = async () => {
      try {
        await loadPdfJsModule()
        if (!cancelled) {
          setPdfReady(true)
        }
      } catch (error) {
        if (!cancelled) {
          setPdfReady(false)
          setMessage({ type: 'error', text: 'Failed to load the PDF preview engine.' })
        }
      }
    }

    void preparePdfRenderer()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!showRecentFiles) return

    let cancelled = false

    const fetchFiles = async () => {
      try {
        const requestUrl =
          filesEndpoint.startsWith('http://') || filesEndpoint.startsWith('https://')
            ? filesEndpoint
            : `${apiBase}${filesEndpoint}`

        const res = await fetch(requestUrl, {
          headers: getAuthHeaders(includeAuth),
        })
        const data = await res.json()
        if (!cancelled && data.files) {
          setFiles(data.files)
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Error loading files:', error)
        }
      }
    }

    void fetchFiles()

    return () => {
      cancelled = true
    }
  }, [apiBase, filesEndpoint, includeAuth, showRecentFiles])

  useEffect(() => {
    setSelectedPages([])
    setSourcePageCount(0)
    setSourcePage(1)
    setSourcePageImage(null)
    setResultPageCount(0)
    setResultPage(1)
    setResultPageImage(null)
    setResultFilename(null)
    setResultPreviewUrl((current) => {
      if (current?.startsWith('blob:')) {
        URL.revokeObjectURL(current)
      }
      return null
    })
    setMessage(null)
  }, [file])

  useEffect(() => {
    if (!file || !pdfReady) {
      setSourcePageCount(0)
      setSourcePage(1)
      setSourcePageImage(null)
      return
    }

    let cancelled = false

    const loadPdfMeta = async () => {
      try {
        const total = await getPdfPageCount(file)
        if (cancelled) return
        setSourcePageCount(total)
        setSourcePage(1)
      } catch (error) {
        if (!cancelled) {
          setMessage({ type: 'error', text: 'Failed to read PDF pages.' })
          setSourcePageCount(0)
          setSourcePage(1)
        }
      }
    }

    void loadPdfMeta()

    return () => {
      cancelled = true
    }
  }, [file, pdfReady])

  useEffect(() => {
    if (!file || !pdfReady || sourcePage < 1) {
      setSourcePageImage(null)
      return
    }

    let cancelled = false
    setSourcePreviewLoading(true)

    const loadPreview = async () => {
      try {
        const image = await renderPdfPageImage(file, sourcePage)
        if (cancelled) return
        setSourcePageImage(image)
      } catch (error) {
        if (!cancelled) {
          setSourcePageImage(null)
          setMessage({ type: 'error', text: 'Failed to render PDF preview.' })
        }
      } finally {
        if (!cancelled) {
          setSourcePreviewLoading(false)
        }
      }
    }

    void loadPreview()

    return () => {
      cancelled = true
    }
  }, [file, pdfReady, sourcePage])

  useEffect(() => {
    if (!resultPreviewUrl || !pdfReady) {
      setResultPageCount(0)
      setResultPage(1)
      setResultPageImage(null)
      return
    }

    let cancelled = false

    const loadPdfMeta = async () => {
      try {
        const response = await fetch(resultPreviewUrl)
        const blob = await response.blob()
        const total = await getPdfPageCount(blob)
        if (cancelled) return
        setResultPageCount(total)
        setResultPage(1)
      } catch (error) {
        if (!cancelled) {
          setResultPageCount(0)
          setResultPage(1)
        }
      }
    }

    void loadPdfMeta()

    return () => {
      cancelled = true
    }
  }, [pdfReady, resultPreviewUrl])

  useEffect(() => {
    if (!resultPreviewUrl || !pdfReady || resultPage < 1) {
      setResultPageImage(null)
      return
    }

    let cancelled = false
    setResultPreviewLoading(true)

    const loadPreview = async () => {
      try {
        const response = await fetch(resultPreviewUrl)
        const blob = await response.blob()
        const image = await renderPdfPageImage(blob, resultPage)
        if (cancelled) return
        setResultPageImage(image)
      } catch (error) {
        if (!cancelled) {
          setResultPageImage(null)
        }
      } finally {
        if (!cancelled) {
          setResultPreviewLoading(false)
        }
      }
    }

    void loadPreview()

    return () => {
      cancelled = true
    }
  }, [pdfReady, resultPreviewUrl, resultPage])

  const loadFiles = async () => {
    if (!showRecentFiles) return

    try {
      const res = await fetch(buildUrl(filesEndpoint), {
        headers: getAuthHeaders(includeAuth),
      })
      const data = await res.json()
      if (data.files) {
        setFiles(data.files)
      }
    } catch (error) {
      console.error('Error loading files:', error)
    }
  }

  const getPdfPageCount = async (input: Blob | File) => {
    const pdfjs = await loadPdfJsModule()
    const arrayBuffer = await input.arrayBuffer()
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer })
    const pdf = await loadingTask.promise
    return pdf.numPages as number
  }

  const renderPdfPageImage = async (input: Blob | File, pageNumber: number) => {
    const pdfjs = await loadPdfJsModule()
    const arrayBuffer = await input.arrayBuffer()
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer })
    const pdf = await loadingTask.promise
    const page = await pdf.getPage(pageNumber)
    const viewport = page.getViewport({ scale: 1.55 })
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    if (!context) {
      throw new Error('Canvas renderer unavailable')
    }

    canvas.width = viewport.width
    canvas.height = viewport.height
    await page.render({ canvasContext: context, canvas, viewport }).promise
    return canvas.toDataURL('image/png', 1)
  }

  const togglePage = (pageNumber: number) => {
    setSelectedPages((prev) => {
      if (prev.includes(pageNumber)) {
        return prev.filter((page) => page !== pageNumber)
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
  const canProcess = !!file && (!!pagesSpec || removeBlank) && !loading
  const pageJumpList = useMemo(
    () => Array.from({ length: sourcePageCount }, (_, index) => index + 1),
    [sourcePageCount],
  )
  const isPreviewReady = !!file && !!sourcePageImage && sourcePageCount > 0
  const isPreviewInitializing =
    !!file && !isPreviewReady && (!pdfReady || sourcePreviewLoading || sourcePageCount === 0)

  const handleUpload = async () => {
    if (!file) {
      setMessage({ type: 'error', text: 'Please select a PDF file.' })
      return
    }

    if (!pagesSpec && !removeBlank) {
      setMessage({ type: 'error', text: 'Choose pages to remove or enable blank page removal.' })
      return
    }

    if (file.size > 50 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File size exceeds the 50MB limit.' })
      return
    }

    if (sourcePageCount > 0 && selectedPages.length >= sourcePageCount && !removeBlank) {
      setMessage({ type: 'error', text: 'You cannot remove every page from the PDF.' })
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
      const res = await fetch(buildUrl(apiEndpoint), {
        method: 'POST',
        headers: getAuthHeaders(includeAuth),
        body: formData,
      })

      const data = (await res.json()) as ConversionResponse

      if (
        !res.ok ||
        (!data.success && !data.download_url && !data.status) ||
        !data.download_url
      ) {
        setMessage({
          type: 'error',
          text: data.detail || data.message || 'Page removal failed.',
        })
        return
      }

      const downloadRes = await fetch(buildUrl(data.download_url), {
        headers: getAuthHeaders(includeAuth),
      })
      if (!downloadRes.ok) {
        throw new Error('Unable to load processed PDF preview.')
      }

      const processedBlob = await downloadRes.blob()
      const processedObjectUrl = URL.createObjectURL(processedBlob)

      if (resultPreviewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(resultPreviewUrl)
      }

      setResultPreviewUrl(processedObjectUrl)
      setResultFilename(data.filename ?? 'updated.pdf')
      setMessage({
        type: 'success',
        text: data.message || 'PDF updated successfully.',
      })
      setResultPage(1)
      triggerBrowserDownload(processedObjectUrl, data.filename ?? 'updated.pdf')
      if (showRecentFiles) {
        await loadFiles()
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error occurred while updating the PDF.' })
    } finally {
      setLoading(false)
    }
  }

  const formatSize = (bytes: number) => {
    const k = 1024
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + ['Bytes', 'KB', 'MB', 'GB'][i]
  }

  const triggerBrowserDownload = (url: string, filename: string) => {
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
  }

  return (
    <div className="space-y-6">
      <SectionCard
        title="Upload and Configure"
        description="Choose a PDF, preview it here in this same section, mark pages to remove, then download the updated file."
      >
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.9fr)]">
          <div className="space-y-4">
            <label className="flex cursor-pointer flex-col gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 transition hover:border-primary/40 hover:bg-white dark:border-slate-700 dark:bg-slate-950/40 dark:hover:border-primary/40 dark:hover:bg-slate-900">
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                Select PDF file
              </span>
              <span className="text-sm text-slate-500">
                Upload one PDF up to 50MB.
              </span>
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={(event) => setFile(event.target.files?.[0] || null)}
                className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-primary file:px-4 file:py-2.5 file:font-semibold file:text-white hover:file:opacity-90 dark:text-slate-300"
              />
            </label>

            <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4 dark:border-primary/20 dark:bg-primary/10">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Preview comes first
              </p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                After you choose a PDF, the preview and remove-page tools will appear right here. Mark the pages you want to remove, then convert.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
              <label className="flex items-start gap-3">
                <input
                  id="remove-blank"
                  type="checkbox"
                  checked={removeBlank}
                  onChange={(event) => setRemoveBlank(event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary dark:border-slate-700"
                />
                <span>
                  <span className="block text-sm font-semibold text-slate-900 dark:text-white">
                    Remove blank pages too
                  </span>
                  <span className="mt-1 block text-sm text-slate-500">
                    Use this if the PDF contains extra empty pages in addition to the pages you mark manually.
                  </span>
                </span>
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                Current Selection
              </p>
              <p className="mt-3 text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                {selectedPages.length} page{selectedPages.length === 1 ? '' : 's'}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Remove pages: <span className="font-mono text-slate-700 dark:text-slate-200">{pagesSpec || 'None selected'}</span>
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                Quick Actions
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => togglePage(sourcePage)}
                  disabled={!sourcePageCount}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    selectedPages.includes(sourcePage)
                      ? 'bg-rose-600 text-white hover:bg-rose-700'
                      : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">
                    {selectedPages.includes(sourcePage) ? 'undo' : 'remove_circle'}
                  </span>
                  {selectedPages.includes(sourcePage)
                    ? `Undo page ${sourcePage}`
                    : `Remove page ${sourcePage}`}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPages([])}
                  disabled={selectedPages.length === 0}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                >
                  <span className="material-symbols-outlined text-base">layers_clear</span>
                  Clear selection
                </button>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center dark:border-slate-800 dark:bg-slate-950/40">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-primary dark:border-slate-700 dark:border-t-primary" />
            <p className="text-sm text-slate-500">Updating your PDF and preparing the preview...</p>
          </div>
        ) : null}

        {message ? (
          <div
            className={`mt-6 rounded-2xl border px-4 py-3 text-sm ${
              message.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200'
                : 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200'
            }`}
          >
            {message.text}
          </div>
        ) : null}
        <div className="mt-6 rounded-[18px] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/50">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                Preview and Remove Pages
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Review the PDF here, use Next for more pages, and click the cross icon to remove the current page.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                {file
                  ? sourcePageCount
                    ? `${sourcePageCount} pages`
                    : pdfReady
                      ? 'Loading pages'
                      : 'Preparing preview'
                  : 'Choose a PDF first'}
              </div>
              {isPreviewInitializing ? (
                <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                  <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                  Opening preview...
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={!canProcess}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-base">auto_fix_high</span>
                  {loading ? 'Converting...' : 'Convert & Download'}
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className={PDF_PREVIEW_FRAME_CLASS}>
              {file && sourcePageImage ? (
                <div className="relative">
                  <Image
                    src={sourcePageImage}
                    alt={`PDF page ${sourcePage}`}
                    width={1100}
                    height={1500}
                    unoptimized
                    className="max-h-[760px] w-auto max-w-full rounded-xl bg-white shadow-[0_24px_60px_rgba(15,23,42,0.18)]"
                  />
                  <div className="absolute left-3 top-3 rounded-full bg-slate-950/75 px-3 py-1 text-xs font-semibold text-white">
                    Page {sourcePage}
                  </div>
                  <button
                    type="button"
                    onClick={() => togglePage(sourcePage)}
                    aria-label={selectedPages.includes(sourcePage) ? 'Undo remove page' : 'Remove page'}
                    className={`absolute right-3 top-3 inline-flex h-11 w-11 items-center justify-center rounded-full text-xl font-bold shadow-lg transition ${
                      selectedPages.includes(sourcePage)
                        ? 'bg-rose-600 text-white hover:bg-rose-700'
                        : 'bg-white text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    {selectedPages.includes(sourcePage) ? '↺' : '×'}
                  </button>
                </div>
              ) : isPreviewInitializing ? (
                <div className="w-full max-w-2xl rounded-[28px] border border-slate-200 bg-white/90 px-6 py-10 text-center shadow-[0_18px_50px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900/90">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <span className="material-symbols-outlined animate-spin text-2xl">progress_activity</span>
                  </div>
                  <p className="text-base font-bold text-slate-900 dark:text-white">
                    Opening your PDF preview
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Loading the file, preparing pages, and getting the remove-page section ready.
                  </p>
                </div>
              ) : file ? (
                <p className="text-sm text-slate-500">Preparing your PDF preview...</p>
              ) : (
                <p className="text-sm text-slate-500">Choose a PDF file above to show the preview here.</p>
              )}
            </div>

            {isPreviewReady ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-slate-500">
                    Page <span className="font-semibold">{sourcePage}</span> of{' '}
                    <span className="font-semibold">{sourcePageCount || '-'}</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={sourcePage <= 1}
                      onClick={() => setSourcePage((prev) => Math.max(1, prev - 1))}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      disabled={sourcePageCount === 0 || sourcePage >= sourcePageCount}
                      onClick={() =>
                        setSourcePage((prev) => Math.min(sourcePageCount, prev + 1))
                      }
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                    >
                      Next
                    </button>
                  </div>
                </div>

                {pageJumpList.length > 0 ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      Remove Page Section
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Jump to a page or mark it for removal.
                    </p>
                    <div className="mt-4 flex max-h-56 flex-wrap gap-2 overflow-auto">
                      {pageJumpList.map((pageNumber) => {
                        const isCurrent = sourcePage === pageNumber
                        const isSelected = selectedPages.includes(pageNumber)

                        return (
                          <button
                            key={pageNumber}
                            type="button"
                            onClick={() => setSourcePage(pageNumber)}
                            className={`relative inline-flex min-w-[3.25rem] items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold transition ${
                              isCurrent
                                ? 'border border-primary/30 bg-primary/10 text-primary'
                                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            {pageNumber}
                            {isSelected ? (
                              <span className="absolute -right-1.5 -top-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white shadow-sm">
                                ×
                              </span>
                            ) : null}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ) : null}
              </>
            ) : null}
          </div>
        </div>
      </SectionCard>

      {resultPreviewUrl ? (
        <SectionCard
          title="Updated PDF Preview"
          description="The updated file is ready and has already started downloading. You can still preview it here and download it again if needed."
          action={
            <a
              href={resultPreviewUrl}
              download={resultFilename || 'updated.pdf'}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white transition hover:opacity-90"
            >
              <span className="material-symbols-outlined text-base">download</span>
              Download PDF
            </a>
          }
        >
          <div className="space-y-4">
            <div className={PDF_PREVIEW_FRAME_CLASS}>
              {resultPageImage ? (
                <div className="relative">
                  <Image
                    src={resultPageImage}
                    alt={`Updated PDF page ${resultPage}`}
                    width={1100}
                    height={1500}
                    unoptimized
                    className="max-h-[760px] w-auto max-w-full rounded-xl bg-white shadow-[0_24px_60px_rgba(15,23,42,0.18)]"
                  />
                  <div className="absolute left-3 top-3 rounded-full bg-slate-950/75 px-3 py-1 text-xs font-semibold text-white">
                    Page {resultPage}
                  </div>
                </div>
              ) : resultPreviewLoading ? (
                <div className="text-center">
                  <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-primary dark:border-slate-700 dark:border-t-primary" />
                  <p className="text-sm text-slate-500">Rendering updated PDF preview...</p>
                </div>
              ) : (
                <p className="text-sm text-slate-500">Updated preview is not available yet.</p>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-500">
                Page <span className="font-semibold">{resultPage}</span> of{' '}
                <span className="font-semibold">{resultPageCount || '-'}</span>
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={resultPage <= 1}
                  onClick={() => setResultPage((prev) => Math.max(1, prev - 1))}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={resultPageCount === 0 || resultPage >= resultPageCount}
                  onClick={() =>
                    setResultPage((prev) => Math.min(resultPageCount, prev + 1))
                  }
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </SectionCard>
      ) : null}

      {showRecentFiles ? (
        <SectionCard
          title="Recent Processed PDFs"
          description="Previously generated files are still available here for download."
        >
          {files.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center dark:border-slate-700 dark:bg-slate-950/40">
              <p className="text-sm text-slate-500">No processed PDF files available yet.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-950/40">
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      <th className="p-3 text-left font-semibold text-slate-700 dark:text-slate-200">
                        Filename
                      </th>
                      <th className="p-3 text-left font-semibold text-slate-700 dark:text-slate-200">
                        Date
                      </th>
                      <th className="p-3 text-left font-semibold text-slate-700 dark:text-slate-200">
                        Size
                      </th>
                      <th className="p-3 text-left font-semibold text-slate-700 dark:text-slate-200">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {files.map((item, index) => (
                      <tr
                        key={`${item.filename}-${index}`}
                        className="border-b border-slate-200 last:border-0 dark:border-slate-800"
                      >
                        <td className="p-3 font-mono text-xs text-slate-600 dark:text-slate-300">
                          {item.filename}
                        </td>
                        <td className="p-3 text-slate-500">
                          {new Date(item.conversion_date).toLocaleString()}
                        </td>
                        <td className="p-3 text-slate-500">{formatSize(item.file_size)}</td>
                        <td className="p-3">
                          <a
                            href={buildUrl(`${filesEndpoint}/${item.filename}`)}
                            download
                            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                          >
                            <span className="material-symbols-outlined text-base">download</span>
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
        </SectionCard>
      ) : null}
    </div>
  )
}
