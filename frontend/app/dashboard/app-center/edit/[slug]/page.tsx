"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import * as mammothBrowser from "mammoth/mammoth.browser";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000";

const ACTION_TO_ROUTE: Record<string, string> = {
  pdf_to_docs: "/api/v3/conversions/pdf-to-word",
  pdf_to_excel: "/api/v3/conversions/pdf-to-excel",
  docx_to_pdf: "/api/v3/conversions/docx-to-pdf",
  excel_to_pdf: "/api/v3/conversions/excel-to-pdf",
  image_to_pdf: "/api/v3/conversions/image-to-pdf",
  remove_background: "/api/v3/conversions/remove-background",
  pdf_page_remove: "/api/v3/conversions/remove-pages-from-pdf",
};

const ACTION_TO_HISTORY_ROUTE: Record<string, string> = {
  pdf_to_docs: "/api/v3/conversions/pdf-to-word/files/history",
  pdf_to_excel: "/api/v3/conversions/pdf-to-excel/files/history",
  docx_to_pdf: "/api/v3/conversions/docx-to-pdf/files/history",
  excel_to_pdf: "/api/v3/conversions/excel-to-pdf/files/history",
  image_to_pdf: "/api/v3/conversions/image-to-pdf/files/history",
  remove_background: "/api/v3/conversions/remove-background/files/history",
  pdf_page_remove: "/api/v3/conversions/remove-pages-from-pdf/files/history",
};

type EditPageProps = {
  params: {
    slug: string;
  };
};

type ConversionCreateResponse = {
  conversion_id: number;
  status: string;
  download_url: string | null;
  points_charged: number;
  remaining_balance: number | null;
};

type ConversionHistoryItem = {
  id: number;
  owner_user_id: number;
  action: string;
  input_filename: string;
  status: string;
  points_charged: number;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  download_url: string | null;
};

type ConversionHistoryResponse = {
  items: ConversionHistoryItem[];
  limit: number;
};

type PreviewFile = {
  url: string;
  mimeType: string;
  filename: string;
};

const isDocxFile = (mimeType: string, filename: string) =>
  mimeType.includes("word") ||
  mimeType.includes("officedocument") ||
  filename.toLowerCase().endsWith(".docx");

function formatTitleFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function DashboardAppCenterEditPage({ params }: EditPageProps) {
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ConversionCreateResponse | null>(null);
  const [history, setHistory] = useState<ConversionHistoryItem[]>([]);
  const [preview, setPreview] = useState<PreviewFile | null>(null);
  const [docxHtml, setDocxHtml] = useState<string | null>(null);
  const [pdfPage, setPdfPage] = useState(1);
  const [pdfTotalPages, setPdfTotalPages] = useState(1);

  const title = formatTitleFromSlug(params.slug);
  const action = params.slug.replaceAll("-", "_");
  const convertRoute = useMemo(() => ACTION_TO_ROUTE[action] || "", [action]);
  const historyRoute = useMemo(() => ACTION_TO_HISTORY_ROUTE[action] || "/api/v3/conversions/history", [action]);

  const getAccessToken = () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      throw new Error("No access token found");
    }
    return token;
  };

  useEffect(() => {
    return () => {
      if (preview?.url) {
        URL.revokeObjectURL(preview.url);
      }
    };
  }, [preview]);

  const replacePreview = (nextPreview: PreviewFile | null) => {
    setPreview((prev) => {
      if (prev?.url) {
        URL.revokeObjectURL(prev.url);
      }
      return nextPreview;
    });
    setDocxHtml(null);
    setPdfPage(1);
    setPdfTotalPages(1);
  };

  const fetchPreviewFile = async (downloadUrl: string, fallbackFilename: string) => {
    const token = getAccessToken();
    const res = await fetch(`${API_BASE}${downloadUrl}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      const bodyText = await res.text();
      throw new Error(bodyText || "Preview loading failed");
    }

    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const nextPreview = {
      url: objectUrl,
      mimeType: blob.type || "application/octet-stream",
      filename: fallbackFilename,
    };
    replacePreview(nextPreview);

    if (isDocxFile(nextPreview.mimeType, nextPreview.filename)) {
      try {
        const arrayBuffer = await blob.arrayBuffer();
        const html = await mammothBrowser.convertToHtml({ arrayBuffer });
        setDocxHtml(html.value || "");
      } catch {
        setDocxHtml(null);
      }
    } else if (nextPreview.mimeType.includes("pdf")) {
      try {
        const { PDFDocument } = await import("pdf-lib");
        const arrayBuffer = await blob.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        setPdfTotalPages(pdfDoc.getPageCount() || 1);
      } catch {
        setPdfTotalPages(1);
      }
    }
  };

  const handleConvert = async () => {
    setError("");
    setResult(null);
    if (!convertRoute) {
      setError("Unsupported endpoint slug");
      return;
    }
    if (!file) {
      setError("Please choose a file first");
      return;
    }

    try {
      setSubmitting(true);
      const token = getAccessToken();
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_BASE}${convertRoute}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const bodyText = await res.text();
      if (!res.ok) {
        throw new Error(bodyText || "Conversion failed");
      }
      const parsed = JSON.parse(bodyText) as ConversionCreateResponse;
      setResult(parsed);

      if (parsed.status === "success" && parsed.download_url) {
        await fetchPreviewFile(parsed.download_url, `conversion-${parsed.conversion_id}`);
      } else {
        replacePreview(null);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Conversion failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLoadHistory = async () => {
    setError("");
    try {
      setLoadingHistory(true);
      const token = getAccessToken();
      const res = await fetch(`${API_BASE}${historyRoute}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const bodyText = await res.text();
      if (!res.ok) {
        throw new Error(bodyText || "Failed to load history");
      }
      const data = JSON.parse(bodyText) as ConversionHistoryResponse;
      setHistory(Array.isArray(data.items) ? data.items : []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load history");
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleDownload = async (item: ConversionHistoryItem) => {
    if (!item.download_url) return;
    setError("");
    try {
      const token = getAccessToken();
      const res = await fetch(`${API_BASE}${item.download_url}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const bodyText = await res.text();
        throw new Error(bodyText || "Download failed");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = item.input_filename || `conversion-${item.id}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Download failed");
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-8">
      <div>
        <Link
          href="/dashboard/app-center"
          className="inline-flex items-center gap-1 rounded-lg border border-primary/10 bg-primary/5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-primary/10 dark:text-slate-200"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to App Center
        </Link>
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
          App Center / Edit / {params.slug}
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">{title}</h1>
        <p className="mt-1 text-slate-500">
          Endpoint: <span className="font-semibold">{convertRoute || "unsupported"}</span>
        </p>
      </div>

      <section className="rounded-2xl border border-primary/10 bg-primary/5 p-6 shadow-sm">
        <h2 className="text-lg font-bold">Request Builder</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-primary/10 bg-primary/5 p-4 text-sm">
            Method: <span className="font-semibold">POST</span>
          </div>
          <div className="rounded-lg border border-primary/10 bg-primary/5 p-4 text-sm">
            Route: <span className="font-semibold">{convertRoute || "N/A"}</span>
          </div>
          <div className="rounded-lg border border-primary/10 bg-primary/5 p-4 text-sm md:col-span-2">
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
              File
            </label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full rounded-lg border border-primary/10 bg-white p-2 text-sm dark:bg-slate-900"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={handleConvert}
            disabled={submitting}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
            type="button"
          >
            {submitting ? "Converting..." : "Convert File"}
          </button>
          <button
            onClick={handleLoadHistory}
            disabled={loadingHistory}
            className="rounded-lg border border-primary/20 bg-white px-4 py-2 text-sm font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-900 dark:text-slate-100"
            type="button"
          >
            {loadingHistory ? "Loading History..." : "Load History"}
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-primary/10 bg-primary/5 p-6 shadow-sm">
        <h2 className="text-lg font-bold">Response Preview</h2>
        {error ? (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}
        <div className="mt-4 rounded-lg border border-primary/10 bg-primary/5 p-4 text-sm text-slate-700 dark:text-slate-200">
          <pre className="overflow-auto whitespace-pre-wrap break-all">
            {result ? JSON.stringify(result, null, 2) : "No conversion response yet"}
          </pre>
        </div>
        <div className="mt-4 rounded-lg border border-primary/10 bg-primary/5 p-4">
          {!preview ? (
            <p className="text-sm text-slate-500">No file preview loaded yet.</p>
          ) : preview.mimeType.includes("pdf") ? (
            <div className="space-y-3">
              <iframe
                src={`${preview.url}#page=${pdfPage}&zoom=page-fit`}
                className="h-[920px] w-full rounded-lg border border-primary/10 bg-white"
                title="PDF Preview"
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  Page {pdfPage} of {pdfTotalPages}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={pdfPage <= 1}
                    onClick={() => setPdfPage((prev) => Math.max(1, prev - 1))}
                    className="rounded-lg border border-primary/20 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={pdfPage >= pdfTotalPages}
                    onClick={() => setPdfPage((prev) => Math.min(pdfTotalPages, prev + 1))}
                    className="rounded-lg border border-primary/20 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          ) : preview.mimeType.startsWith("image/") ? (
            <img
              src={preview.url}
              alt={preview.filename}
              className="max-h-[720px] w-full rounded-lg border border-primary/10 object-contain bg-white"
            />
          ) : isDocxFile(preview.mimeType, preview.filename) ? (
            docxHtml ? (
              <div className="max-h-[720px] overflow-auto rounded-lg border border-primary/10 bg-white p-6">
                <article
                  className="text-sm leading-6 text-slate-900"
                  dangerouslySetInnerHTML={{ __html: docxHtml }}
                />
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                Loading DOCX preview...
              </p>
            )
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-slate-500">
                This file type cannot be rendered inline in the browser.
              </p>
              <a
                href={preview.url}
                download={preview.filename}
                className="inline-flex rounded-lg border border-primary/20 bg-white px-3 py-1.5 text-xs font-bold text-slate-700"
              >
                Download Preview File
              </a>
            </div>
          )}
        </div>
        {preview ? (
          <div className="mt-4">
            <a
              href={preview.url}
              download={preview.filename || `conversion-${result?.conversion_id ?? "file"}`}
              className="inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:opacity-90"
            >
              Download
            </a>
          </div>
        ) : null}
      </section>

      <section className="rounded-2xl border border-primary/10 bg-primary/5 p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Conversion History</h2>
          <span className="text-xs text-slate-500">Items: {history.length}</span>
        </div>
        <div className="overflow-x-auto rounded-lg border border-primary/10 bg-primary/5">
          <table className="w-full text-left text-sm">
            <thead className="bg-primary/10 text-xs uppercase tracking-wider text-slate-600">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">File</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3">Download</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id} className="border-t border-primary/10">
                  <td className="px-4 py-3">{item.id}</td>
                  <td className="px-4 py-3">{item.action}</td>
                  <td className="px-4 py-3">{item.input_filename}</td>
                  <td className="px-4 py-3">{item.status}</td>
                  <td className="px-4 py-3">{new Date(item.updated_at).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      disabled={!item.download_url}
                      onClick={() => handleDownload(item)}
                      className="rounded-lg border border-primary/20 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-900 dark:text-slate-100"
                    >
                      Download
                    </button>
                    <button
                      type="button"
                      disabled={!item.download_url}
                      onClick={async () => {
                        if (!item.download_url) return;
                        try {
                          setError("");
                          await fetchPreviewFile(item.download_url, item.input_filename);
                        } catch (err: unknown) {
                          setError(err instanceof Error ? err.message : "Preview loading failed");
                        }
                      }}
                      className="ml-2 rounded-lg border border-primary/20 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-900 dark:text-slate-100"
                    >
                      Preview
                    </button>
                  </td>
                </tr>
              ))}
              {history.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-sm text-slate-500" colSpan={6}>
                    No history loaded yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
