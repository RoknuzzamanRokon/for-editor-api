"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import EditableDocxPreview from "@/components/app-center/EditableDocxPreview";
import ExcelWorkbookPreview from "@/components/app-center/ExcelWorkbookPreview";
import RemoveBackgroundStudio from "@/components/app-center/RemoveBackgroundStudio";
import PdfPageRemover from "@/components/PdfPageRemover";
import PdfPageOrganizer from "@/components/PdfPageOrganizer";
import { API_BASE } from "@/lib/apiBase";
import { authFetch } from "@/lib/authFetch";

const ACTION_TO_ROUTE: Record<string, string> = {
  pdf_to_docs: "/api/v3/conversions/pdf-to-word",
  pdf_to_excel: "/api/v3/conversions/pdf-to-excel",
  docx_to_pdf: "/api/v3/conversions/docx-to-pdf",
  excel_to_pdf: "/api/v3/conversions/excel-to-pdf",
  image_to_pdf: "/api/v3/conversions/image-to-pdf",
  remove_background: "/api/v3/conversions/remove-background",
  pdf_page_remove: "/api/v3/conversions/remove-pages-from-pdf",
  merge_pdf: "/api/v3/conversions/merge-pdf",
  split_pdf: "/api/v3/conversions/split-pdf",
  rotate_pdf: "/api/v3/conversions/rotate-pdf",
  protect_pdf: "/api/v3/conversions/protect-pdf",
  unlock_pdf: "/api/v3/conversions/unlock-pdf",
  watermark_pdf: "/api/v3/conversions/watermark-pdf",
  pdf_page_numbers: "/api/v3/conversions/pdf-page-numbers",
  pdf_to_text: "/api/v3/conversions/pdf-to-text",
  text_to_pdf: "/api/v3/conversions/text-to-pdf",
  pptx_to_pdf: "/api/v3/conversions/pptx-to-pdf",
  pdf_to_image: "/api/v3/conversions/pdf-to-image",
  image_format_convert: "/api/v3/conversions/image-format-convert",
  compress_pdf: "/api/v3/conversions/compress-pdf",
  pdf_organize: "/api/v3/conversions/pdf-organize",
  pdf_to_pptx: "/api/v3/conversions/pdf-to-pptx",
  zip_files: "/api/v3/conversions/zip-files",
  unzip_file: "/api/v3/conversions/unzip-file",
  csv_to_excel: "/api/v3/conversions/csv-to-excel",
  excel_to_csv: "/api/v3/conversions/excel-to-csv",
  html_to_pdf: "/api/v3/conversions/html-to-pdf",
  pdf_to_html: "/api/v3/conversions/pdf-to-html",
};

const ACTION_TO_HISTORY_ROUTE: Record<string, string> = {
  pdf_to_docs: "/api/v3/conversions/pdf-to-word/files/history",
  pdf_to_excel: "/api/v3/conversions/pdf-to-excel/files/history",
  docx_to_pdf: "/api/v3/conversions/docx-to-pdf/files/history",
  excel_to_pdf: "/api/v3/conversions/excel-to-pdf/files/history",
  image_to_pdf: "/api/v3/conversions/image-to-pdf/files/history",
  remove_background: "/api/v3/conversions/remove-background/files/history",
  pdf_page_remove: "/api/v3/conversions/remove-pages-from-pdf/files/history",
  merge_pdf: "/api/v3/conversions/merge-pdf/files/history",
  split_pdf: "/api/v3/conversions/split-pdf/files/history",
  rotate_pdf: "/api/v3/conversions/rotate-pdf/files/history",
  protect_pdf: "/api/v3/conversions/protect-pdf/files/history",
  unlock_pdf: "/api/v3/conversions/unlock-pdf/files/history",
  watermark_pdf: "/api/v3/conversions/watermark-pdf/files/history",
  pdf_page_numbers: "/api/v3/conversions/pdf-page-numbers/files/history",
  pdf_to_text: "/api/v3/conversions/pdf-to-text/files/history",
  text_to_pdf: "/api/v3/conversions/text-to-pdf/files/history",
  pptx_to_pdf: "/api/v3/conversions/pptx-to-pdf/files/history",
  pdf_to_image: "/api/v3/conversions/pdf-to-image/files/history",
  image_format_convert: "/api/v3/conversions/image-format-convert/files/history",
  compress_pdf: "/api/v3/conversions/compress-pdf/files/history",
  pdf_organize: "/api/v3/conversions/pdf-organize/files/history",
  pdf_to_pptx: "/api/v3/conversions/pdf-to-pptx/files/history",
  zip_files: "/api/v3/conversions/zip-files/files/history",
  unzip_file: "/api/v3/conversions/unzip-file/files/history",
  csv_to_excel: "/api/v3/conversions/csv-to-excel/files/history",
  excel_to_csv: "/api/v3/conversions/excel-to-csv/files/history",
  html_to_pdf: "/api/v3/conversions/html-to-pdf/files/history",
  pdf_to_html: "/api/v3/conversions/pdf-to-html/files/history",
};

type ExtraFieldConfig = {
  name: string;
  label: string;
  type: "text" | "password" | "select";
  placeholder?: string;
  required?: boolean;
  helperText?: string;
  options?: { value: string; label: string }[];
};

const ACTION_EXTRA_FIELD: Record<string, ExtraFieldConfig | undefined> = {
  protect_pdf: {
    name: "password",
    label: "Set a Password",
    type: "password",
    placeholder: "Enter a password to lock this PDF",
    required: true,
  },
  unlock_pdf: {
    name: "password",
    label: "Current Password",
    type: "password",
    placeholder: "Enter the PDF's current password",
    helperText: "Leave blank if the PDF isn't password protected.",
  },
  watermark_pdf: {
    name: "watermark_text",
    label: "Watermark Text",
    type: "text",
    placeholder: "e.g. CONFIDENTIAL",
    required: true,
  },
  image_format_convert: {
    name: "target_format",
    label: "Convert To",
    type: "select",
    required: true,
    options: [
      { value: "png", label: "PNG" },
      { value: "jpg", label: "JPG" },
      { value: "webp", label: "WEBP" },
      { value: "bmp", label: "BMP" },
      { value: "tiff", label: "TIFF" },
      { value: "gif", label: "GIF" },
      { value: "ico", label: "ICO" },
    ],
  },
};

const IMAGE_CONVERT_PREVIEWABLE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp"];
const canPreviewImageInBrowser = (filename: string) =>
  IMAGE_CONVERT_PREVIEWABLE_EXTENSIONS.some((ext) => filename.toLowerCase().endsWith(ext));

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

const DOCX_MIME_TYPES = [
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
];

const SPREADSHEET_MIME_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
];

const extractFilenameFromContentDisposition = (value: string | null) => {
  if (!value) return null;

  const utfMatch = value.match(/filename\*\s*=\s*UTF-8''([^;]+)/i);
  if (utfMatch?.[1]) {
    try {
      return decodeURIComponent(utfMatch[1].trim().replace(/^"(.*)"$/, "$1"));
    } catch {
      return utfMatch[1].trim().replace(/^"(.*)"$/, "$1");
    }
  }

  const plainMatch = value.match(/filename\s*=\s*("?)([^";]+)\1/i);
  return plainMatch?.[2]?.trim() || null;
};

const isDocxFile = (mimeType: string, filename: string) =>
  DOCX_MIME_TYPES.some((type) => mimeType.includes(type)) ||
  filename.toLowerCase().endsWith(".docx");

const isSpreadsheetFile = (mimeType: string, filename: string) =>
  SPREADSHEET_MIME_TYPES.some((type) => mimeType.includes(type)) ||
  filename.toLowerCase().endsWith(".xlsx") ||
  filename.toLowerCase().endsWith(".xls");

const IMAGE_UPLOAD_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp"];

const isAcceptedImageFile = (file: File) =>
  file.type.startsWith("image/") ||
  IMAGE_UPLOAD_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext));

const CONVERTIBLE_IMAGE_EXTENSIONS = [
  ".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tiff", ".tif", ".gif", ".heic", ".heif",
];

const isConvertibleImageFile = (file: File) =>
  CONVERTIBLE_IMAGE_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext));

const PDF_PREVIEW_FRAME_CLASS =
  "h-[88vh] min-h-[546px] w-full rounded-2xl border border-slate-200 bg-white dark:border-slate-800 sm:h-[1120px]";
const IMAGE_PREVIEW_CLASS = "max-h-[936px] w-full rounded-xl object-contain";

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
    <div className="rounded-[13px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/60">
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
  );
}

export default function DashboardAppCenterEditPage({ params }: EditPageProps) {
  const [file, setFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [isImageDragActive, setIsImageDragActive] = useState(false);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const [mergeFiles, setMergeFiles] = useState<File[]>([]);
  const mergeInputRef = useRef<HTMLInputElement | null>(null);
  const [zipFiles, setZipFiles] = useState<File[]>([]);
  const zipInputRef = useRef<HTMLInputElement | null>(null);
  const [extraFieldValue, setExtraFieldValue] = useState("");
  const [formatConvertPreviewUrl, setFormatConvertPreviewUrl] = useState<string | null>(null);
  const [isFormatConvertDragActive, setIsFormatConvertDragActive] = useState(false);
  const formatConvertInputRef = useRef<HTMLInputElement | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ConversionCreateResponse | null>(null);
  const [history, setHistory] = useState<ConversionHistoryItem[]>([]);
  const [preview, setPreview] = useState<PreviewFile | null>(null);
  const [docxPreviewBlob, setDocxPreviewBlob] = useState<Blob | null>(null);
  const [spreadsheetPreviewBlob, setSpreadsheetPreviewBlob] = useState<Blob | null>(null);
  const [docxHtml, setDocxHtml] = useState<string | null>(null);
  const [pdfPage, setPdfPage] = useState(1);
  const [pdfTotalPages, setPdfTotalPages] = useState(1);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [conversionStage, setConversionStage] =
    useState<ConversionProgressStage>("idle");
  const [showPreviewViewer, setShowPreviewViewer] = useState(false);

  const title = formatTitleFromSlug(params.slug);
  const action = params.slug.replace(/-/g, "_");
  const isPdfPageRemove = action === "pdf_page_remove";
  const isRemoveBackground = action === "remove_background";
  const isImageToPdf = action === "image_to_pdf";
  const isMergePdf = action === "merge_pdf";
  const isPdfOrganize = action === "pdf_organize";
  const isImageFormatConvert = action === "image_format_convert";
  const isZipFiles = action === "zip_files";
  const convertRoute = useMemo(() => ACTION_TO_ROUTE[action] || "", [action]);
  const historyRoute = useMemo(
    () => ACTION_TO_HISTORY_ROUTE[action] || "/api/v3/conversions/history",
    [action],
  );
  const extraField = ACTION_EXTRA_FIELD[action];

  useEffect(() => {
    setExtraFieldValue(extraField?.type === "select" ? extraField.options?.[0]?.value ?? "" : "");
    // extraField is derived from action, so depending on action alone is correct
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action]);

  useEffect(() => {
    return () => {
      if (preview?.url) URL.revokeObjectURL(preview.url);
    };
  }, [preview]);

  useEffect(() => {
    const urls = imageFiles.map((imageFile) => URL.createObjectURL(imageFile));
    setImagePreviewUrls(urls);
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imageFiles]);

  useEffect(() => {
    if (!isImageFormatConvert || !file || !canPreviewImageInBrowser(file.name)) {
      setFormatConvertPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setFormatConvertPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file, isImageFormatConvert]);

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
    setDocxPreviewBlob(null);
    setSpreadsheetPreviewBlob(null);
    setDocxHtml(null);
    setPdfPage(1);
    setPdfTotalPages(1);
  };

  const fetchPreviewFile = async (
    downloadUrl: string,
    fallbackFilename: string,
  ) => {
    const res = await authFetch(`${API_BASE}${downloadUrl}`, {
      method: "GET",
    });

    if (!res.ok) {
      const bodyText = await res.text();
      throw new Error(bodyText || "Preview loading failed");
    }

    const blob = await res.blob();
    const resolvedFilename =
      extractFilenameFromContentDisposition(
        res.headers.get("Content-Disposition"),
      ) || fallbackFilename;
    const objectUrl = URL.createObjectURL(blob);

    const nextPreview = {
      url: objectUrl,
      mimeType: blob.type || "application/octet-stream",
      filename: resolvedFilename,
    };

    replacePreview(nextPreview);

    if (isDocxFile(nextPreview.mimeType, nextPreview.filename)) {
      setDocxPreviewBlob(blob);
      try {
        const mammothBrowser = await import("mammoth/mammoth.browser");
        const arrayBuffer = await blob.arrayBuffer();
        const html = await mammothBrowser.convertToHtml({ arrayBuffer });
        setDocxHtml(html.value || "");
      } catch {
        setDocxHtml(null);
      }
    } else if (isSpreadsheetFile(nextPreview.mimeType, nextPreview.filename)) {
      setSpreadsheetPreviewBlob(blob);
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
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      const res = await authFetch(`${API_BASE}/api/v3/conversions/${conversionId}`, {
        method: "GET",
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

    if (
      isImageToPdf
        ? imageFiles.length === 0
        : isMergePdf
          ? mergeFiles.length < 2
          : isZipFiles
            ? zipFiles.length === 0
            : !file
    ) {
      setError(
        isImageToPdf
          ? "Please choose at least one image"
          : isMergePdf
            ? "Please choose at least two PDF files to merge"
            : isZipFiles
              ? "Please choose at least one file to zip"
              : "Please choose a file first",
      );
      setConversionStage("error");
      return;
    }

    if (extraField?.required && !extraFieldValue.trim()) {
      setError(`${extraField.label} is required`);
      setConversionStage("error");
      return;
    }

    try {
      setSubmitting(true);
      setConversionStage("uploading");
      setConversionProgress(12);
      const formData = new FormData();
      if (isImageToPdf) {
        imageFiles.forEach((imageFile) => formData.append("files", imageFile));
      } else if (isMergePdf) {
        mergeFiles.forEach((mergeFile) => formData.append("files", mergeFile));
      } else if (isZipFiles) {
        zipFiles.forEach((zipFile) => formData.append("files", zipFile));
      } else if (file) {
        formData.append("file", file);
      }
      if (extraField && (extraFieldValue || extraField.required)) {
        formData.append(extraField.name, extraFieldValue);
      }

      const res = await authFetch(`${API_BASE}${convertRoute}`, {
        method: "POST",
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
              input_filename: isImageToPdf
                ? `${imageFiles.length} image${imageFiles.length === 1 ? "" : "s"}`
                : isMergePdf
                  ? `${mergeFiles.length} PDFs merged`
                  : isZipFiles
                    ? `${zipFiles.length} file${zipFiles.length === 1 ? "" : "s"} zipped`
                    : file?.name || "upload",
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
      const res = await authFetch(`${API_BASE}${historyRoute}`, {
        method: "GET",
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
      const res = await authFetch(`${API_BASE}${item.download_url}`, {
        method: "GET",
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
      const res = await authFetch(`${API_BASE}/api/v3/conversions/${item.id}`, {
        method: "DELETE",
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
    <div className="w-full max-w-none space-y-8 p-6 md:p-8">
      <div className="flex flex-col gap-4">
        <Link
          href="/user/app-center"
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <span className="material-symbols-outlined text-base">
            arrow_back
          </span>
          Back to App Center
        </Link>

        <div className="app-hero-card relative overflow-hidden rounded-[13px] border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-primary p-6 text-white shadow-xl dark:border-slate-800">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-12 left-0 h-32 w-32 rounded-full bg-primary-foreground/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-white backdrop-blur">
                <span className="material-symbols-outlined text-sm text-white">
                  auto_awesome
                </span>
                Dashboard App Center
              </div>

              <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-white/65">
                App Center / Edit / {params.slug}
              </p>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-white md:text-4xl">
                {title}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80">
                Upload a file, submit a conversion request, preview the result,
                and review history for this tool from one focused workspace.
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
        isPdfPageRemove ? (
          <PdfPageRemover
            apiBase={API_BASE}
            apiEndpoint="/api/v3/conversions/remove-pages-from-pdf"
            includeAuth
            showRecentFiles={false}
          />
        ) : isRemoveBackground ? (
          <RemoveBackgroundStudio
            apiBase={API_BASE}
            apiEndpoint="/api/v3/conversions/remove-background"
            historyEndpoint="/api/v3/conversions/remove-background/files/history"
            includeAuth
          />
        ) : isPdfOrganize ? (
          <PdfPageOrganizer
            apiBase={API_BASE}
            apiEndpoint="/api/v3/conversions/pdf-organize"
            includeAuth
          />
        ) : (
          <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
            <div className="space-y-8 xl:col-span-12">
              <SectionCard
                title="Request Builder"
                description={
                  isImageToPdf
                    ? "Add one or more photos — they'll be combined into a single PDF in the order shown."
                    : isMergePdf
                      ? "Add two or more PDFs — they'll be combined into one file in the order shown."
                      : isZipFiles
                        ? "Add one or more files of any type — they'll be combined into a single .zip archive."
                        : isImageFormatConvert
                          ? "Convert a photo between PNG, JPG, WEBP, BMP, TIFF, GIF, and ICO — HEIC/HEIF supported as a source."
                          : "Choose a file and send it to the selected conversion endpoint."
                }
              >
                {isImageToPdf ? (
                  <div className="space-y-4">
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsImageDragActive(true);
                      }}
                      onDragLeave={() => setIsImageDragActive(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsImageDragActive(false);
                        const dropped = Array.from(
                          e.dataTransfer.files ?? [],
                        ).filter(isAcceptedImageFile);
                        if (dropped.length) {
                          setImageFiles((prev) => [...prev, ...dropped]);
                        }
                      }}
                      className={`rounded-2xl border-2 border-dashed p-4 transition-colors ${
                        isImageDragActive
                          ? "border-primary bg-primary/5"
                          : "border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      {imageFiles.length === 0 ? (
                        <button
                          type="button"
                          onClick={() => imageInputRef.current?.click()}
                          className="flex w-full flex-col items-center justify-center gap-3 rounded-xl py-14 text-center transition hover:bg-slate-50 dark:hover:bg-slate-800/40"
                        >
                          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <span className="material-symbols-outlined text-3xl">
                              add_photo_alternate
                            </span>
                          </span>
                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                            Click to select photos, or drag &amp; drop them
                            here
                          </span>
                          <span className="text-xs text-slate-400">
                            PNG, JPG, JPEG, or WEBP — up to 50MB each
                          </span>
                        </button>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                              {imageFiles.length} photo
                              {imageFiles.length === 1 ? "" : "s"} selected ·
                              pages follow this order
                            </p>
                            <button
                              type="button"
                              onClick={() => setImageFiles([])}
                              className="text-xs font-semibold text-rose-500 hover:underline"
                            >
                              Clear all
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                            {imageFiles.map((imageFile, index) => (
                              <div
                                key={`${imageFile.name}-${imageFile.lastModified}-${index}`}
                                className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50"
                              >
                                {imagePreviewUrls[index] ? (
                                  <Image
                                    src={imagePreviewUrls[index]}
                                    alt={imageFile.name}
                                    fill
                                    unoptimized
                                    className="object-cover"
                                  />
                                ) : null}
                                <span className="absolute left-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-[11px] font-bold text-white">
                                  {index + 1}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setImageFiles((prev) =>
                                      prev.filter((_, i) => i !== index),
                                    )
                                  }
                                  className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100 hover:bg-rose-500"
                                  aria-label={`Remove ${imageFile.name}`}
                                >
                                  <span className="material-symbols-outlined text-sm">
                                    close
                                  </span>
                                </button>
                                <p className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/70 to-transparent px-1.5 py-1 text-[10px] text-white">
                                  {imageFile.name}
                                </p>
                              </div>
                            ))}

                            <button
                              type="button"
                              onClick={() => imageInputRef.current?.click()}
                              className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-300 text-slate-400 transition hover:border-primary hover:text-primary dark:border-slate-600"
                            >
                              <span className="material-symbols-outlined text-2xl">
                                add
                              </span>
                              <span className="text-xs font-semibold">
                                Add more
                              </span>
                            </button>
                          </div>
                        </div>
                      )}

                      <input
                        ref={imageInputRef}
                        type="file"
                        multiple
                        accept="image/png,image/jpeg,image/webp"
                        onChange={(e) => {
                          const picked = Array.from(
                            e.target.files ?? [],
                          ).filter(isAcceptedImageFile);
                          setImageFiles((prev) => [...prev, ...picked]);
                          e.target.value = "";
                        }}
                        className="hidden"
                      />
                    </div>

                    <button
                      onClick={handleConvert}
                      disabled={imageFiles.length === 0 || submitting}
                      type="button"
                      className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200 sm:w-auto
                      ${
                        imageFiles.length > 0
                          ? "bg-primary text-white hover:opacity-90"
                          : "border border-slate-300 text-slate-500 bg-transparent hover:bg-slate-50"
                      }
                    `}
                    >
                      <span className="material-symbols-outlined text-base">
                        bolt
                      </span>
                      {submitting
                        ? "Converting..."
                        : imageFiles.length > 0
                          ? `Convert ${imageFiles.length} Photo${imageFiles.length === 1 ? "" : "s"} to PDF`
                          : "Convert to PDF"}
                    </button>
                  </div>
                ) : isMergePdf ? (
                  <div className="space-y-4">
                    {mergeFiles.length === 0 ? (
                      <button
                        type="button"
                        onClick={() => mergeInputRef.current?.click()}
                        className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 py-14 text-center transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/40"
                      >
                        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <span className="material-symbols-outlined text-3xl">
                            picture_as_pdf
                          </span>
                        </span>
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                          Click to select two or more PDFs
                        </span>
                        <span className="text-xs text-slate-400">
                          They&apos;ll be combined in the order you add them below
                        </span>
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                            {mergeFiles.length} PDF{mergeFiles.length === 1 ? "" : "s"} selected · merges in this order
                          </p>
                          <button
                            type="button"
                            onClick={() => setMergeFiles([])}
                            className="text-xs font-semibold text-rose-500 hover:underline"
                          >
                            Clear all
                          </button>
                        </div>

                        <ul className="space-y-2">
                          {mergeFiles.map((mergeFile, index) => (
                            <li
                              key={`${mergeFile.name}-${mergeFile.lastModified}-${index}`}
                              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800/60"
                            >
                              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                {index + 1}
                              </span>
                              <span className="material-symbols-outlined text-base text-slate-400">
                                picture_as_pdf
                              </span>
                              <span
                                className="min-w-0 flex-1 truncate text-slate-700 dark:text-slate-200"
                                title={mergeFile.name}
                              >
                                {mergeFile.name}
                              </span>
                              <button
                                type="button"
                                disabled={index === 0}
                                onClick={() =>
                                  setMergeFiles((prev) => {
                                    const next = [...prev];
                                    [next[index - 1], next[index]] = [next[index], next[index - 1]];
                                    return next;
                                  })
                                }
                                className="material-symbols-outlined text-base text-slate-400 transition hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
                                aria-label={`Move ${mergeFile.name} up`}
                              >
                                arrow_upward
                              </button>
                              <button
                                type="button"
                                disabled={index === mergeFiles.length - 1}
                                onClick={() =>
                                  setMergeFiles((prev) => {
                                    const next = [...prev];
                                    [next[index], next[index + 1]] = [next[index + 1], next[index]];
                                    return next;
                                  })
                                }
                                className="material-symbols-outlined text-base text-slate-400 transition hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
                                aria-label={`Move ${mergeFile.name} down`}
                              >
                                arrow_downward
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setMergeFiles((prev) => prev.filter((_, i) => i !== index))
                                }
                                className="material-symbols-outlined text-base text-slate-400 transition hover:text-rose-500"
                                aria-label={`Remove ${mergeFile.name}`}
                              >
                                close
                              </button>
                            </li>
                          ))}
                        </ul>

                        <button
                          type="button"
                          onClick={() => mergeInputRef.current?.click()}
                          className="inline-flex items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 px-4 py-2 text-sm font-semibold text-slate-500 transition hover:border-primary hover:text-primary dark:border-slate-600"
                        >
                          <span className="material-symbols-outlined text-base">add</span>
                          Add more PDFs
                        </button>
                      </div>
                    )}

                    <input
                      ref={mergeInputRef}
                      type="file"
                      multiple
                      accept="application/pdf,.pdf"
                      onChange={(e) => {
                        const picked = Array.from(e.target.files ?? []).filter(
                          (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"),
                        );
                        setMergeFiles((prev) => [...prev, ...picked]);
                        e.target.value = "";
                      }}
                      className="hidden"
                    />

                    <button
                      onClick={handleConvert}
                      disabled={mergeFiles.length < 2 || submitting}
                      type="button"
                      className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200 sm:w-auto
                      ${
                        mergeFiles.length >= 2
                          ? "bg-primary text-white hover:opacity-90"
                          : "border border-slate-300 text-slate-500 bg-transparent hover:bg-slate-50"
                      }
                    `}
                    >
                      <span className="material-symbols-outlined text-base">bolt</span>
                      {submitting
                        ? "Merging..."
                        : mergeFiles.length >= 2
                          ? `Merge ${mergeFiles.length} PDFs`
                          : "Merge PDFs"}
                    </button>
                  </div>
                ) : isZipFiles ? (
                  <div className="space-y-4">
                    {zipFiles.length === 0 ? (
                      <button
                        type="button"
                        onClick={() => zipInputRef.current?.click()}
                        className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 py-14 text-center transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/40"
                      >
                        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <span className="material-symbols-outlined text-3xl">
                            folder_zip
                          </span>
                        </span>
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                          Click to select one or more files
                        </span>
                        <span className="text-xs text-slate-400">
                          They&apos;ll be combined into a single .zip archive
                        </span>
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                            {zipFiles.length} file{zipFiles.length === 1 ? "" : "s"} selected
                          </p>
                          <button
                            type="button"
                            onClick={() => setZipFiles([])}
                            className="text-xs font-semibold text-rose-500 hover:underline"
                          >
                            Clear all
                          </button>
                        </div>

                        <ul className="space-y-2">
                          {zipFiles.map((zipFile, index) => (
                            <li
                              key={`${zipFile.name}-${zipFile.lastModified}-${index}`}
                              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800/60"
                            >
                              <span className="material-symbols-outlined text-base text-slate-400">
                                draft
                              </span>
                              <span
                                className="min-w-0 flex-1 truncate text-slate-700 dark:text-slate-200"
                                title={zipFile.name}
                              >
                                {zipFile.name}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setZipFiles((prev) => prev.filter((_, i) => i !== index))
                                }
                                className="material-symbols-outlined text-base text-slate-400 transition hover:text-rose-500"
                                aria-label={`Remove ${zipFile.name}`}
                              >
                                close
                              </button>
                            </li>
                          ))}
                        </ul>

                        <button
                          type="button"
                          onClick={() => zipInputRef.current?.click()}
                          className="inline-flex items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 px-4 py-2 text-sm font-semibold text-slate-500 transition hover:border-primary hover:text-primary dark:border-slate-600"
                        >
                          <span className="material-symbols-outlined text-base">add</span>
                          Add more files
                        </button>
                      </div>
                    )}

                    <input
                      ref={zipInputRef}
                      type="file"
                      multiple
                      onChange={(e) => {
                        const picked = Array.from(e.target.files ?? []);
                        setZipFiles((prev) => [...prev, ...picked]);
                        e.target.value = "";
                      }}
                      className="hidden"
                    />

                    <button
                      onClick={handleConvert}
                      disabled={zipFiles.length === 0 || submitting}
                      type="button"
                      className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200 sm:w-auto
                      ${
                        zipFiles.length > 0
                          ? "bg-primary text-white hover:opacity-90"
                          : "border border-slate-300 text-slate-500 bg-transparent hover:bg-slate-50"
                      }
                    `}
                    >
                      <span className="material-symbols-outlined text-base">bolt</span>
                      {submitting
                        ? "Zipping..."
                        : zipFiles.length > 0
                          ? `Zip ${zipFiles.length} File${zipFiles.length === 1 ? "" : "s"}`
                          : "Zip Files"}
                    </button>
                  </div>
                ) : isImageFormatConvert ? (
                  <div className="space-y-5">
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsFormatConvertDragActive(true);
                      }}
                      onDragLeave={() => setIsFormatConvertDragActive(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsFormatConvertDragActive(false);
                        const dropped = Array.from(e.dataTransfer.files ?? []).find(
                          isConvertibleImageFile,
                        );
                        if (dropped) setFile(dropped);
                      }}
                      className={`rounded-2xl border-2 border-dashed p-4 transition-colors ${
                        isFormatConvertDragActive
                          ? "border-primary bg-primary/5"
                          : "border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      {!file ? (
                        <button
                          type="button"
                          onClick={() => formatConvertInputRef.current?.click()}
                          className="flex w-full flex-col items-center justify-center gap-3 rounded-xl py-14 text-center transition hover:bg-slate-50 dark:hover:bg-slate-800/40"
                        >
                          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <span className="material-symbols-outlined text-3xl">
                              sync_alt
                            </span>
                          </span>
                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                            Click to select an image, or drag &amp; drop it here
                          </span>
                          <span className="text-xs text-slate-400">
                            PNG, JPG, WEBP, BMP, TIFF, GIF, HEIC, or HEIF — up to 50MB
                          </span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-4">
                          <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
                            {formatConvertPreviewUrl ? (
                              <Image
                                src={formatConvertPreviewUrl}
                                alt={file.name}
                                fill
                                unoptimized
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <span className="material-symbols-outlined text-3xl text-slate-400">
                                  image
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p
                              className="truncate text-sm font-semibold text-slate-700 dark:text-slate-200"
                              title={file.name}
                            >
                              {file.name}
                            </p>
                            <p className="text-xs text-slate-400">
                              {(file.size / 1024).toFixed(0)} KB
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => formatConvertInputRef.current?.click()}
                            className="text-xs font-semibold text-primary hover:underline"
                          >
                            Change
                          </button>
                          <button
                            type="button"
                            onClick={() => setFile(null)}
                            className="material-symbols-outlined text-slate-400 transition hover:text-rose-500"
                            aria-label="Remove image"
                          >
                            close
                          </button>
                        </div>
                      )}

                      <input
                        ref={formatConvertInputRef}
                        type="file"
                        accept=".png,.jpg,.jpeg,.webp,.bmp,.tiff,.tif,.gif,.heic,.heif"
                        onChange={(e) => {
                          const picked = e.target.files?.[0];
                          if (picked && isConvertibleImageFile(picked)) setFile(picked);
                          e.target.value = "";
                        }}
                        className="hidden"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                        Convert To
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {extraField?.options?.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setExtraFieldValue(opt.value)}
                            className={`rounded-xl border px-4 py-2 text-sm font-bold transition ${
                              extraFieldValue === opt.value
                                ? "border-primary bg-primary text-white"
                                : "border-slate-200 bg-white text-slate-600 hover:border-primary/40 hover:text-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleConvert}
                      disabled={!file || !extraFieldValue || submitting}
                      type="button"
                      className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200 sm:w-auto
                      ${
                        file
                          ? "bg-primary text-white hover:opacity-90"
                          : "border border-slate-300 text-slate-500 bg-transparent hover:bg-slate-50"
                      }
                    `}
                    >
                      <span className="material-symbols-outlined text-base">bolt</span>
                      {submitting
                        ? "Converting..."
                        : `Convert to ${extraFieldValue.toUpperCase()}`}
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap items-end gap-3">
                      <div className="min-w-0 flex-1 sm:min-w-[250px]">
                        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
                          Upload file
                        </label>
                        <input
                          type="file"
                          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                          className="block w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:font-semibold file:text-primary dark:border-slate-700 dark:bg-slate-900"
                        />
                      </div>

                      {extraField ? (
                        <div className="min-w-0 flex-1 sm:min-w-[220px]">
                          <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
                            {extraField.label}
                          </label>
                          {extraField.type === "select" ? (
                            <select
                              value={extraFieldValue}
                              onChange={(e) => setExtraFieldValue(e.target.value)}
                              className="block w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-900"
                            >
                              {extraField.options?.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type={extraField.type}
                              value={extraFieldValue}
                              onChange={(e) => setExtraFieldValue(e.target.value)}
                              placeholder={extraField.placeholder}
                              className="block w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-900"
                            />
                          )}
                          {extraField.helperText ? (
                            <p className="mt-1 text-xs text-slate-500">
                              {extraField.helperText}
                            </p>
                          ) : null}
                        </div>
                      ) : null}

                      <button
                        onClick={handleConvert}
                        disabled={
                          !file ||
                          submitting ||
                          !!(extraField?.required && !extraFieldValue.trim())
                        }
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

                    <p className="mt-2 text-xs text-slate-500">
                      {file ? `Selected: ${file.name}` : "No file selected yet"}
                    </p>
                  </>
                )}
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
                      filename={
                        isImageToPdf
                          ? imageFiles.length
                            ? `${imageFiles.length} image${imageFiles.length === 1 ? "" : "s"}`
                            : undefined
                          : isMergePdf
                            ? mergeFiles.length
                              ? `${mergeFiles.length} PDF${mergeFiles.length === 1 ? "" : "s"}`
                              : undefined
                            : isZipFiles
                              ? zipFiles.length
                                ? `${zipFiles.length} file${zipFiles.length === 1 ? "" : "s"}`
                                : undefined
                              : file?.name
                      }
                    />
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                  <div className="flex flex-wrap items-center gap-3">
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
        )
      ) : null}

      {showPreviewViewer && preview && !isRemoveBackground ? (
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
                className={PDF_PREVIEW_FRAME_CLASS}
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
              <Image
                src={preview.url}
                alt={preview.filename}
                width={1440}
                height={900}
                unoptimized
                className={IMAGE_PREVIEW_CLASS}
              />
            </div>
          ) : isDocxFile(preview.mimeType, preview.filename) ? (
            <EditableDocxPreview
              sourceBlob={docxPreviewBlob}
              html={docxHtml}
            />
          ) : isSpreadsheetFile(preview.mimeType, preview.filename) ? (
            <ExcelWorkbookPreview
              sourceBlob={spreadsheetPreviewBlob}
              filename={preview.filename}
              downloadUrl={preview.url}
            />
          ) : preview.mimeType.includes("html") || preview.filename.toLowerCase().endsWith(".html") ? (
            <iframe
              src={preview.url}
              sandbox=""
              className={PDF_PREVIEW_FRAME_CLASS}
              title="HTML Preview"
            />
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
  );
}
