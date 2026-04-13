"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://127.0.0.1:8000";

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

type ConversionStatusResponse = {
  conversion_id: number;
  action: string;
  input_filename: string;
  status: string;
  error_message: string | null;
  points_charged: number;
  remaining_balance: number | null;
  download_url: string | null;
  created_at: string;
  updated_at: string;
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

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

function getStatusBadgeClass(status?: string) {
  const value = (status || "").toLowerCase();

  if (["success", "completed", "done"].includes(value)) {
    return "bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/20";
  }

  if (["pending", "processing", "queued"].includes(value)) {
    return "bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/20";
  }

  if (["failed", "error", "rejected"].includes(value)) {
    return "bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/20";
  }

  return "bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600";
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${getStatusBadgeClass(
        status,
      )}`}
    >
      {status}
    </span>
  );
}

type ConversionProgressStage =
  | "idle"
  | "uploading"
  | "processing"
  | "preview"
  | "completed"
  | "error";

function getProgressAccent(stage: ConversionProgressStage) {
  if (stage === "completed") {
    return {
      bar: "from-emerald-500 via-green-500 to-teal-500",
      text: "text-emerald-600 dark:text-emerald-300",
      glow: "bg-emerald-500/15 dark:bg-emerald-500/10",
      track: "bg-emerald-100 dark:bg-emerald-950/40",
    };
  }

  if (stage === "error") {
    return {
      bar: "from-rose-500 via-red-500 to-orange-500",
      text: "text-rose-600 dark:text-rose-300",
      glow: "bg-rose-500/15 dark:bg-rose-500/10",
      track: "bg-rose-100 dark:bg-rose-950/40",
    };
  }

  return {
    bar: "bg-primary",
    text: "text-primary",
    glow: "bg-primary/10",
    track: "bg-primary/15",
  };
}

function getProgressLabel(stage: ConversionProgressStage) {
  if (stage === "uploading") return "Uploading file";
  if (stage === "processing") return "Converting document";
  if (stage === "preview") return "Preparing preview";
  if (stage === "completed") return "Completed";
  if (stage === "error") return "Conversion failed";
  return "Waiting to start";
}

function ConversionProgressPanel({
  progress,
  stage,
  filename,
}: {
  progress: number;
  stage: ConversionProgressStage;
  filename?: string;
}) {
  const accent = getProgressAccent(stage);
  const clampedProgress = Math.max(0, Math.min(100, Math.round(progress)));

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/60">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Conversion Progress
          </p>
          <h3 className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
            {getProgressLabel(stage)}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {filename ? `Working on ${filename}` : "Preparing your converted file."}
          </p>
        </div>
        <div
          className={`rounded-2xl px-3 py-2 text-sm font-bold ${accent.text} ${accent.glow}`}
        >
          {clampedProgress}%
        </div>
      </div>

      <div className={`mt-5 h-3 overflow-hidden rounded-full ${accent.track}`}>
        <div
          className={`h-full rounded-full ${accent.bar} transition-[width] duration-500 ease-out`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 text-xs text-slate-500">
        <span>Status updates will appear automatically.</span>
        <span className={accent.text}>{getProgressLabel(stage)}</span>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
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
  );
}

export default function AdminAppCenterEditPage({ params }: EditPageProps) {
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
  const [conversionProgress, setConversionProgress] = useState(0);
  const [conversionStage, setConversionStage] =
    useState<ConversionProgressStage>("idle");
  const [showPreviewViewer, setShowPreviewViewer] = useState(false);

  const title = formatTitleFromSlug(params.slug);
  const action = params.slug.replace(/-/g, "_");
  const convertRoute = useMemo(() => ACTION_TO_ROUTE[action] || "", [action]);
  const historyRoute = useMemo(
    () => ACTION_TO_HISTORY_ROUTE[action] || "/api/v3/conversions/history",
    [action],
  );

  const getAccessToken = () => {
    const token = localStorage.getItem("access_token");
    if (!token) throw new Error("No access token found");
    return token;
  };

  useEffect(() => {
    return () => {
      if (preview?.url) URL.revokeObjectURL(preview.url);
    };
  }, [preview]);

  useEffect(() => {
    if (!submitting) return;

    const ceilingByStage: Record<ConversionProgressStage, number> = {
      idle: 0,
      uploading: 38,
      processing: 74,
      preview: 94,
      completed: 100,
      error: 100,
    };

    const interval = window.setInterval(() => {
      setConversionProgress((current) => {
        const ceiling = ceilingByStage[conversionStage];
        if (current >= ceiling) return current;
        return Math.min(
          ceiling,
          current + Math.max(1, Math.ceil((ceiling - current) / 5)),
        );
      });
    }, 280);

    return () => window.clearInterval(interval);
  }, [conversionStage, submitting]);

  useEffect(() => {
    if (!showPreviewViewer || !preview) return;

    window.requestAnimationFrame(() => {
      document
        .getElementById("preview-viewer")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [preview, showPreviewViewer]);

  const replacePreview = (nextPreview: PreviewFile | null) => {
    setPreview((prev) => {
      if (prev?.url) URL.revokeObjectURL(prev.url);
      return nextPreview;
    });
    setDocxHtml(null);
    setPdfPage(1);
    setPdfTotalPages(1);
  };

  const fetchPreviewFile = async (
    downloadUrl: string,
    fallbackFilename: string,
  ) => {
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
        const mammothBrowser = await import("mammoth/mammoth.browser");
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

  const pollConversionStatus = async (
    conversionId: number,
    attempts = 30,
  ) => {
    const token = getAccessToken();

    for (let attempt = 0; attempt < attempts; attempt += 1) {
      const res = await fetch(`${API_BASE}/api/v3/conversions/${conversionId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const bodyText = await res.text();
      if (!res.ok) {
        throw new Error(bodyText || "Failed to check conversion status");
      }

      const parsed = JSON.parse(bodyText) as ConversionStatusResponse;
      setResult({
        conversion_id: parsed.conversion_id,
        status: parsed.status,
        download_url: parsed.download_url,
        points_charged: parsed.points_charged,
        remaining_balance: parsed.remaining_balance,
      });

      if (["completed", "success"].includes(parsed.status.toLowerCase())) {
        return parsed;
      }

      if (["failed", "error", "rejected"].includes(parsed.status.toLowerCase())) {
        throw new Error(parsed.error_message || "Conversion failed");
      }

      await new Promise((resolve) => window.setTimeout(resolve, 1500));
    }

    throw new Error("Conversion is still processing. Please try again in a moment.");
  };

  const handleConvert = async () => {
    setError("");
    setResult(null);
    replacePreview(null);
    setShowPreviewViewer(false);
    setConversionStage("idle");
    setConversionProgress(0);

    if (!convertRoute) {
      setError("Unsupported endpoint slug");
      setConversionStage("error");
      return;
    }

    if (!file) {
      setError("Please choose a file first");
      setConversionStage("error");
      return;
    }

    try {
      setSubmitting(true);
      setConversionStage("uploading");
      setConversionProgress(12);
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
      if (!res.ok) throw new Error(bodyText || "Conversion failed");

      setConversionStage("processing");
      setConversionProgress((current) => Math.max(current, 68));
      const parsed = JSON.parse(bodyText) as ConversionCreateResponse;
      setResult(parsed);

      const readyResult =
        parsed.download_url &&
        ["success", "completed", "done"].includes(parsed.status.toLowerCase())
          ? {
              conversion_id: parsed.conversion_id,
              action,
              input_filename: file.name,
              status: "completed",
              error_message: null,
              points_charged: parsed.points_charged,
              remaining_balance: parsed.remaining_balance,
              download_url: parsed.download_url,
              created_at: "",
              updated_at: "",
            }
          : await pollConversionStatus(parsed.conversion_id);

      if (!readyResult.download_url) {
        throw new Error("Converted file is not ready yet");
      }

      setConversionStage("preview");
      setConversionProgress((current) => Math.max(current, 86));
      await fetchPreviewFile(
        readyResult.download_url,
        `conversion-${readyResult.conversion_id}`,
      );
      setResult({
        conversion_id: readyResult.conversion_id,
        status: "completed",
        download_url: readyResult.download_url,
        points_charged: readyResult.points_charged,
        remaining_balance: readyResult.remaining_balance,
      });
      setShowPreviewViewer(true);
      setConversionStage("completed");
      setConversionProgress(100);
    } catch (err: unknown) {
      setConversionStage("error");
      setConversionProgress(100);
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
      if (!res.ok) throw new Error(bodyText || "Failed to load history");

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

  const handleDelete = async (item: ConversionHistoryItem) => {
    setError("");
    try {
      const token = getAccessToken();
      const res = await fetch(`${API_BASE}/api/v3/conversions/${item.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const bodyText = await res.text();
        throw new Error(bodyText || "Delete failed");
      }

      setHistory((prev) => prev.filter((entry) => entry.id !== item.id));

      if (result?.conversion_id === item.id) {
        setResult(null);
        replacePreview(null);
        setShowPreviewViewer(false);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const unsupported = !convertRoute;

  return (
    <AdminShell>
      <div className="mx-auto max-w-8xl space-y-8 p-6 md:p-8">
        <div className="flex flex-col gap-4">
          <Link
            href="/admin/app-center"
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <span className="material-symbols-outlined text-base">
              arrow_back
            </span>
            Back to App Center
          </Link>

          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-primary/5 p-6 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
            <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-primary/15 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-24 w-24 -translate-x-6 translate-y-6 rounded-full bg-sky-500/10 blur-3xl" />

            <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-600 backdrop-blur dark:border-primary/20 dark:bg-slate-900/70 dark:text-slate-300">
                  <span className="material-symbols-outlined text-sm text-primary">
                    admin_panel_settings
                  </span>
                  Admin App Center
                </div>

                <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                  App Center / Edit / {params.slug}
                </p>
                <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white md:text-4xl">
                  {title}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                  Upload a file, submit a conversion request, preview the
                  result, and review history for this tool from one focused
                  workspace.
                </p>
              </div>


            </div>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
            {error}
          </div>
        ) : null}

        {unsupported ? (
          <SectionCard
            title="Unsupported Tool"
            description="This slug is not mapped to any conversion endpoint yet."
          >
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
              <span className="material-symbols-outlined text-4xl text-slate-400">
                block
              </span>
              <p className="mt-3 text-sm text-slate-500">
                Add this action inside your route map before using this page.
              </p>
            </div>
          </SectionCard>
        ) : null}

        {!unsupported ? (
          <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
            <div className="space-y-8 xl:col-span-12">
              <SectionCard
                title="Request Builder"
                description="Choose a file and send it to the selected conversion endpoint."
              >
                <div className="flex flex-wrap items-end gap-3">
                  {/* File Upload */}
                  <div className="flex-1 min-w-[250px]">
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
                      Upload file
                    </label>
                    <input
                      type="file"
                      onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                      className="block w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:font-semibold file:text-primary dark:border-slate-700 dark:bg-slate-900"
                    />
                  </div>

                  {/* Convert Button */}
                  <button
                    onClick={handleConvert}
                    disabled={!file || submitting}
                    type="button"
                    className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200
                    ${
                      file
                        ? "bg-primary text-white hover:opacity-90"
                        : "border border-slate-300 text-slate-500 bg-transparent hover:bg-slate-50"
                    }
                  `}
                  >
                    <span className="material-symbols-outlined text-base">
                      bolt
                    </span>
                    {submitting ? "Converting..." : "Convert File"}
                  </button>
                </div>

                {/* Optional: file name below */}
                <p className="mt-2 text-xs text-slate-500">
                  {file ? `Selected: ${file.name}` : "No file selected yet"}
                </p>
              </SectionCard>
              {submitting || result ? (
                <SectionCard
                  title="Response Summary"
                  description="Most recent conversion response from the backend."
                >
                  {submitting ? (
                    <ConversionProgressPanel
                      progress={conversionProgress}
                      stage={conversionStage}
                      filename={file?.name}
                    />
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
                          <p className="text-xs uppercase tracking-wider text-slate-500">
                            Conversion ID
                          </p>
                          <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                            {result?.conversion_id}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
                          <p className="text-xs uppercase tracking-wider text-slate-500">
                            Status
                          </p>
                          <div className="mt-2">
                            <StatusBadge status={result?.status || "processing"} />
                          </div>
                        </div>

                        <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
                          <p className="text-xs uppercase tracking-wider text-slate-500">
                            Points Charged
                          </p>
                          <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                            {result?.points_charged ?? "-"}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
                          <p className="text-xs uppercase tracking-wider text-slate-500">
                            Remaining Balance
                          </p>
                          <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                            {result?.remaining_balance ?? "-"}
                          </p>
                        </div>
                      </div>

                      {preview ? (
                        <button
                          type="button"
                          onClick={() => setShowPreviewViewer(true)}
                          className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300"
                        >
                          <span className="material-symbols-outlined text-base">
                            visibility
                          </span>
                          Open Preview
                        </button>
                      ) : null}
                    </div>
                  )}
                </SectionCard>
              ) : null}
            </div>

            <div className="space-y-8 xl:col-span-12">
              <SectionCard
                title="Conversion History"
                description="Browse previous converted files for this tool."
                action={
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleLoadHistory}
                      disabled={loadingHistory}
                      type="button"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                    >
                      <span className="material-symbols-outlined text-base">
                        history
                      </span>
                      {loadingHistory ? "Loading..." : "Load History"}
                    </button>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {history.length} items
                    </span>
                  </div>
                }
              >
                <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div className="max-h-[440px] overflow-y-auto overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-800/50">
                        <tr>
                          <th className="px-4 py-4 font-semibold">ID</th>
                          <th className="px-4 py-4 font-semibold">Action</th>
                          <th className="px-4 py-4 font-semibold">File</th>
                          <th className="px-4 py-4 font-semibold">Status</th>
                          <th className="px-4 py-4 font-semibold">Updated</th>
                          <th className="px-4 py-4 font-semibold">Actions</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {history.length === 0 ? (
                          <tr>
                            <td
                              colSpan={6}
                              className="px-4 py-10 text-center text-sm text-slate-500"
                            >
                              No history loaded yet.
                            </td>
                          </tr>
                        ) : (
                          history.map((item) => (
                            <tr
                              key={item.id}
                              className="transition hover:bg-slate-50 dark:hover:bg-slate-800/40"
                            >
                              <td className="px-4 py-4 font-medium text-slate-900 dark:text-white">
                                {item.id}
                              </td>
                              <td className="px-4 py-4">{item.action}</td>
                              <td className="max-w-[220px] px-4 py-4">
                                <div
                                  className="truncate"
                                  title={item.input_filename}
                                >
                                  {item.input_filename}
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <StatusBadge status={item.status} />
                              </td>
                              <td className="px-4 py-4 text-slate-500">
                                {formatDate(item.updated_at)}
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    disabled={!item.download_url}
                                    onClick={() => handleDownload(item)}
                                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
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
                                        await fetchPreviewFile(
                                          item.download_url,
                                          item.input_filename,
                                        );
                                        setShowPreviewViewer(true);
                                      } catch (err: unknown) {
                                        setError(
                                          err instanceof Error
                                            ? err.message
                                            : "Preview loading failed",
                                        );
                                      }
                                    }}
                                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                                  >
                                    Preview
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleDelete(item)}
                                    className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/20"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </SectionCard>
            </div>
          </div>
        ) : null}
        {showPreviewViewer && preview ? (
          <SectionCard
            title="Preview Viewer"
            description="Inspect the converted file before downloading."
            action={
              <a
                href={preview.url}
                download={
                  preview.filename ||
                  `conversion-${result?.conversion_id ?? "file"}`
                }
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white transition hover:opacity-90"
              >
                <span className="material-symbols-outlined text-base">
                  download
                </span>
                Download
              </a>
            }
          >
            <div id="preview-viewer" />
            {preview.mimeType.includes("pdf") ? (
              <div className="space-y-4">
                <iframe
                  src={`${preview.url}#page=${pdfPage}&zoom=page-fit`}
                  className="h-[860px] w-full rounded-2xl border border-slate-200 bg-white dark:border-slate-800"
                  title="PDF Preview"
                />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-slate-500">
                    Page <span className="font-semibold">{pdfPage}</span> of{" "}
                    <span className="font-semibold">{pdfTotalPages}</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={pdfPage <= 1}
                      onClick={() => setPdfPage((prev) => Math.max(1, prev - 1))}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      disabled={pdfPage >= pdfTotalPages}
                      onClick={() =>
                        setPdfPage((prev) => Math.min(pdfTotalPages, prev + 1))
                      }
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            ) : preview.mimeType.startsWith("image/") ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/30">
                <img
                  src={preview.url}
                  alt={preview.filename}
                  className="max-h-[720px] w-full rounded-xl object-contain"
                />
              </div>
            ) : isDocxFile(preview.mimeType, preview.filename) ? (
              docxHtml ? (
                <div className="max-h-[720px] overflow-auto rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800">
                  <article
                    className="docx-preview prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: docxHtml }}
                  />
                </div>
              ) : (
                <div className="flex min-h-[240px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/30">
                  <p className="text-sm text-slate-500">Loading DOCX preview...</p>
                </div>
              )
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 p-8 dark:border-slate-700">
                <p className="text-sm text-slate-500">
                  This file type cannot be rendered inline in the browser.
                </p>
                <a
                  href={preview.url}
                  download={preview.filename}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                >
                  <span className="material-symbols-outlined text-base">
                    download
                  </span>
                  Download Preview File
                </a>
              </div>
            )}
          </SectionCard>
        ) : null}
      </div>
    </AdminShell>
  );
}
