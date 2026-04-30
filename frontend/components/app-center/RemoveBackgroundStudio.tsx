"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { authFetch } from "@/lib/authFetch";

type RemoveBackgroundStudioProps = {
  apiBase?: string;
  apiEndpoint: string;
  historyEndpoint: string;
  includeAuth?: boolean;
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

type ResultPreview = {
  url: string;
  filename: string;
  downloadUrl: string | null;
  conversionId: number | null;
  status: string;
  pointsCharged: number;
  remainingBalance: number | null;
  fromHistory: boolean;
};

type EditorToolMode = "erase" | "restore";

type BrushPoint = {
  x: number;
  y: number;
};

type BrushStroke = {
  mode: EditorToolMode;
  size: number;
  points: BrushPoint[];
};

type ConversionProgressStage =
  | "idle"
  | "uploading"
  | "processing"
  | "preview"
  | "completed"
  | "error";

const ACCEPTED_IMAGE_TYPES = [".png", ".jpg", ".jpeg", ".webp"];
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;
const MAX_EDITOR_HISTORY = 40;
const TRANSPARENT_GRID_STYLE = {
  backgroundColor: "#f8fafc",
  backgroundImage:
    "linear-gradient(45deg, rgba(148, 163, 184, 0.22) 25%, transparent 25%), linear-gradient(-45deg, rgba(148, 163, 184, 0.22) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(148, 163, 184, 0.22) 75%), linear-gradient(-45deg, transparent 75%, rgba(148, 163, 184, 0.22) 75%)",
  backgroundSize: "24px 24px",
  backgroundPosition: "0 0, 0 12px, 12px -12px, -12px 0px",
} as const;

function SectionCard({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
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
  if (stage === "uploading") return "Uploading image";
  if (stage === "processing") return "Removing background";
  if (stage === "preview") return "Preparing PNG preview";
  if (stage === "completed") return "Completed";
  if (stage === "error") return "Processing failed";
  return "Ready to start";
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
            Remove Background Progress
          </p>
          <h3 className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
            {getProgressLabel(stage)}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {filename ? `Working on ${filename}` : "Preparing your transparent PNG."}
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
        <span>Progress updates appear automatically.</span>
        <span className={accent.text}>{getProgressLabel(stage)}</span>
      </div>
    </div>
  );
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

function buildPngFilename(filename: string) {
  const base = filename.replace(/\.[^.]+$/, "") || "image";
  return `${base}.png`;
}

function buildRefinedPngFilename(filename: string) {
  const base = filename.replace(/\.[^.]+$/, "") || "image";
  return `${base}-refined.png`;
}

function extractFilenameFromContentDisposition(value: string | null) {
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
}

function triggerBrowserDownload(url: string, filename: string) {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

function getFileValidationError(file: File) {
  const filename = file.name.toLowerCase();
  const extensionOk = ACCEPTED_IMAGE_TYPES.some((extension) =>
    filename.endsWith(extension),
  );

  if (!extensionOk) {
    return "Only PNG, JPG, JPEG, and WEBP files are accepted.";
  }

  if (file.size <= 0) {
    return "The selected image is empty.";
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return "File size exceeds the 50MB limit.";
  }

  return null;
}

function ensureCanvasSize(canvas: HTMLCanvasElement, width: number, height: number) {
  if (canvas.width !== width) canvas.width = width;
  if (canvas.height !== height) canvas.height = height;
}

function drawBrushPath(
  context: CanvasRenderingContext2D,
  points: BrushPoint[],
  size: number,
) {
  context.lineCap = "round";
  context.lineJoin = "round";
  context.lineWidth = size;

  if (points.length <= 1) {
    const point = points[0];
    if (!point) return;
    context.beginPath();
    context.arc(point.x, point.y, size / 2, 0, Math.PI * 2);
    context.fill();
    return;
  }

  context.beginPath();
  context.moveTo(points[0].x, points[0].y);
  for (let index = 1; index < points.length; index += 1) {
    context.lineTo(points[index].x, points[index].y);
  }
  context.stroke();
}

function applyStrokeToContext({
  targetContext,
  sourceCanvas,
  scratchCanvas,
  stroke,
}: {
  targetContext: CanvasRenderingContext2D;
  sourceCanvas: HTMLCanvasElement;
  scratchCanvas: HTMLCanvasElement;
  stroke: BrushStroke;
}) {
  if (stroke.points.length === 0) return;

  if (stroke.mode === "erase") {
    targetContext.save();
    targetContext.globalCompositeOperation = "destination-out";
    targetContext.fillStyle = "#000";
    targetContext.strokeStyle = "#000";
    drawBrushPath(targetContext, stroke.points, stroke.size);
    targetContext.restore();
    return;
  }

  ensureCanvasSize(scratchCanvas, sourceCanvas.width, sourceCanvas.height);
  const scratchContext = scratchCanvas.getContext("2d");
  if (!scratchContext) return;

  scratchContext.clearRect(0, 0, scratchCanvas.width, scratchCanvas.height);
  scratchContext.save();
  scratchContext.fillStyle = "#fff";
  scratchContext.strokeStyle = "#fff";
  drawBrushPath(scratchContext, stroke.points, stroke.size);
  scratchContext.globalCompositeOperation = "source-in";
  scratchContext.drawImage(sourceCanvas, 0, 0);
  scratchContext.restore();

  targetContext.drawImage(scratchCanvas, 0, 0);
}

function getCanvasPoint(
  canvas: HTMLCanvasElement,
  clientX: number,
  clientY: number,
): BrushPoint {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  return {
    x: Math.max(0, Math.min(canvas.width, (clientX - rect.left) * scaleX)),
    y: Math.max(0, Math.min(canvas.height, (clientY - rect.top) * scaleY)),
  };
}

function canvasToPngBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }
      reject(new Error("Failed to export PNG."));
    }, "image/png");
  });
}

export default function RemoveBackgroundStudio({
  apiBase = "",
  apiEndpoint,
  historyEndpoint,
  includeAuth = false,
}: RemoveBackgroundStudioProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const sourcePreviewRef = useRef<string | null>(null);
  const resultPreviewRef = useRef<string | null>(null);
  const editorCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const editorSourceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const editorScratchCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const editorDownloadUrlRef = useRef<string | null>(null);
  const activeStrokeRef = useRef<BrushStroke | null>(null);
  const activePointerIdRef = useRef<number | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [sourcePreviewUrl, setSourcePreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [historyError, setHistoryError] = useState("");
  const [history, setHistory] = useState<ConversionHistoryItem[]>([]);
  const [resultPreview, setResultPreview] = useState<ResultPreview | null>(null);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [conversionStage, setConversionStage] =
    useState<ConversionProgressStage>("idle");
  const [editorMode, setEditorMode] = useState<EditorToolMode>("erase");
  const [brushSize, setBrushSize] = useState(28);
  const [strokeHistory, setStrokeHistory] = useState<BrushStroke[]>([]);
  const [editorLoading, setEditorLoading] = useState(false);
  const [editorDimensions, setEditorDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const buildUrl = useCallback(
    (path: string) =>
      path.startsWith("http://") || path.startsWith("https://")
        ? path
        : `${apiBase}${path}`,
    [apiBase],
  );

  const authorizedFetch = useCallback(
    (input: RequestInfo | URL, init: RequestInit = {}) =>
      authFetch(input, init, {
        requireAuth: includeAuth,
        apiBase,
      }),
    [apiBase, includeAuth],
  );

  const resetEditorDownloadUrl = useCallback(() => {
    if (editorDownloadUrlRef.current?.startsWith("blob:")) {
      URL.revokeObjectURL(editorDownloadUrlRef.current);
    }
    editorDownloadUrlRef.current = null;
  }, []);

  const replaceSourcePreview = (nextUrl: string | null) => {
    if (sourcePreviewRef.current?.startsWith("blob:")) {
      URL.revokeObjectURL(sourcePreviewRef.current);
    }
    sourcePreviewRef.current = nextUrl;
    setSourcePreviewUrl(nextUrl);
  };

  const replaceResultPreview = (nextPreview: ResultPreview | null) => {
    if (resultPreviewRef.current?.startsWith("blob:")) {
      URL.revokeObjectURL(resultPreviewRef.current);
    }
    resultPreviewRef.current = nextPreview?.url ?? null;
    setResultPreview(nextPreview);
  };

  const renderEditorCanvas = useCallback(
    (strokes: BrushStroke[]) => {
      const sourceCanvas = editorSourceCanvasRef.current;
      const editorCanvas = editorCanvasRef.current;
      if (!sourceCanvas || !editorCanvas) return;

      if (!editorScratchCanvasRef.current) {
        editorScratchCanvasRef.current = document.createElement("canvas");
      }

      ensureCanvasSize(editorCanvas, sourceCanvas.width, sourceCanvas.height);
      const editorContext = editorCanvas.getContext("2d");
      if (!editorContext) return;

      editorContext.clearRect(0, 0, editorCanvas.width, editorCanvas.height);
      editorContext.drawImage(sourceCanvas, 0, 0);

      for (const stroke of strokes) {
        applyStrokeToContext({
          targetContext: editorContext,
          sourceCanvas,
          scratchCanvas: editorScratchCanvasRef.current,
          stroke,
        });
      }
    },
    [],
  );

  const resetEditorState = useCallback(
    (options?: { preserveTool?: boolean }) => {
      activeStrokeRef.current = null;
      activePointerIdRef.current = null;
      setStrokeHistory([]);
      setEditorLoading(false);
      setEditorDimensions(null);
      resetEditorDownloadUrl();
      if (!options?.preserveTool) {
        setEditorMode("erase");
      }
    },
    [resetEditorDownloadUrl],
  );

  const resetStudio = () => {
    setFile(null);
    replaceSourcePreview(null);
    replaceResultPreview(null);
    setMessage(null);
    setHistoryError("");
    setConversionStage("idle");
    setConversionProgress(0);
    setDragActive(false);
    resetEditorState();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const applySelectedFile = (nextFile: File | null) => {
    if (!nextFile) return;

    const validationError = getFileValidationError(nextFile);
    if (validationError) {
      setMessage({ type: "error", text: validationError });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setFile(nextFile);
    replaceSourcePreview(URL.createObjectURL(nextFile));
    replaceResultPreview(null);
    setMessage(null);
    setHistoryError("");
    setConversionStage("idle");
    setConversionProgress(0);
    resetEditorState({ preserveTool: true });
  };

  useEffect(() => {
    return () => {
      if (sourcePreviewRef.current?.startsWith("blob:")) {
        URL.revokeObjectURL(sourcePreviewRef.current);
      }
      if (resultPreviewRef.current?.startsWith("blob:")) {
        URL.revokeObjectURL(resultPreviewRef.current);
      }
      resetEditorDownloadUrl();
    };
  }, [resetEditorDownloadUrl]);

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

  const loadHistory = useCallback(
    async (showFailure = true) => {
      try {
        setLoadingHistory(true);
        if (showFailure) {
          setHistoryError("");
        }

        const res = await authorizedFetch(buildUrl(historyEndpoint), {
          method: "GET",
        });

        const bodyText = await res.text();
        if (!res.ok) {
          throw new Error(bodyText || "Failed to load processed images.");
        }

        const data = JSON.parse(bodyText) as ConversionHistoryResponse;
        setHistory(Array.isArray(data.items) ? data.items : []);
      } catch (err: unknown) {
        const nextError =
          err instanceof Error ? err.message : "Failed to load processed images.";
        if (showFailure) {
          setHistoryError(nextError);
        }
      } finally {
        setLoadingHistory(false);
      }
    },
    [authorizedFetch, buildUrl, historyEndpoint],
  );

  useEffect(() => {
    void loadHistory(false);
  }, [loadHistory]);

  useEffect(() => {
    resetEditorState();

    if (!resultPreview?.url) {
      return;
    }

    let cancelled = false;
    setEditorLoading(true);

    const image = new window.Image();
    image.onload = () => {
      if (cancelled) return;

      if (!editorSourceCanvasRef.current) {
        editorSourceCanvasRef.current = document.createElement("canvas");
      }

      const sourceCanvas = editorSourceCanvasRef.current;
      ensureCanvasSize(sourceCanvas, image.naturalWidth, image.naturalHeight);
      const sourceContext = sourceCanvas.getContext("2d");
      if (!sourceContext) {
        setEditorLoading(false);
        setMessage({
          type: "error",
          text: "Unable to prepare the refine editor.",
        });
        return;
      }

      sourceContext.clearRect(0, 0, sourceCanvas.width, sourceCanvas.height);
      sourceContext.drawImage(image, 0, 0);
      setEditorDimensions({
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
      renderEditorCanvas([]);
      setEditorLoading(false);
    };

    image.onerror = () => {
      if (cancelled) return;
      setEditorLoading(false);
      setMessage({
        type: "error",
        text: "Unable to load the result for brush refinement.",
      });
    };

    image.src = resultPreview.url;

    return () => {
      cancelled = true;
      image.onload = null;
      image.onerror = null;
    };
  }, [renderEditorCanvas, resetEditorState, resultPreview?.url]);

  useEffect(() => {
    if (!resultPreview?.url || editorLoading) return;
    renderEditorCanvas(strokeHistory);
  }, [editorLoading, renderEditorCanvas, resultPreview?.url, strokeHistory]);

  const fetchResultFile = async (
    downloadUrl: string,
    fallbackFilename: string,
  ) => {
    const res = await authorizedFetch(buildUrl(downloadUrl), {
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

    return {
      blob,
      objectUrl: URL.createObjectURL(blob),
      filename: resolvedFilename,
    };
  };

  const pollConversionStatus = async (
    conversionId: number,
    attempts = 30,
  ) => {
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      const res = await authorizedFetch(
        buildUrl(`/api/v3/conversions/${conversionId}`),
        {
        method: "GET",
        },
      );

      const bodyText = await res.text();
      if (!res.ok) {
        throw new Error(bodyText || "Failed to check conversion status");
      }

      const parsed = JSON.parse(bodyText) as ConversionStatusResponse;

      if (["completed", "success"].includes(parsed.status.toLowerCase())) {
        return parsed;
      }

      if (["failed", "error", "rejected"].includes(parsed.status.toLowerCase())) {
        throw new Error(parsed.error_message || "Background removal failed");
      }

      await new Promise((resolve) => window.setTimeout(resolve, 1500));
    }

    throw new Error("Conversion is still processing. Please try again in a moment.");
  };

  const handleConvert = async () => {
    if (!file) {
      setMessage({ type: "error", text: "Please choose an image first." });
      setConversionStage("error");
      return;
    }

    const validationError = getFileValidationError(file);
    if (validationError) {
      setMessage({ type: "error", text: validationError });
      setConversionStage("error");
      return;
    }

    try {
      setSubmitting(true);
      setMessage(null);
      setHistoryError("");
      setConversionStage("uploading");
      setConversionProgress(12);

      const formData = new FormData();
      formData.append("file", file);

      const res = await authorizedFetch(buildUrl(apiEndpoint), {
        method: "POST",
        body: formData,
      });

      const bodyText = await res.text();
      if (!res.ok) {
        throw new Error(bodyText || "Background removal failed");
      }

      setConversionStage("processing");
      setConversionProgress((current) => Math.max(current, 68));
      const parsed = JSON.parse(bodyText) as ConversionCreateResponse;

      const readyResult =
        parsed.download_url &&
        ["success", "completed", "done"].includes(parsed.status.toLowerCase())
          ? {
              conversion_id: parsed.conversion_id,
              action: "remove_background",
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
        throw new Error("Processed PNG is not ready yet.");
      }

      setConversionStage("preview");
      setConversionProgress((current) => Math.max(current, 86));
      const processedFile = await fetchResultFile(
        readyResult.download_url,
        buildPngFilename(file.name),
      );

      replaceResultPreview({
        url: processedFile.objectUrl,
        filename: processedFile.filename,
        downloadUrl: readyResult.download_url,
        conversionId: readyResult.conversion_id,
        status: "completed",
        pointsCharged: readyResult.points_charged,
        remainingBalance: readyResult.remaining_balance,
        fromHistory: false,
      });

      setMessage({
        type: "success",
        text: "Background removed successfully. Your transparent PNG is ready.",
      });
      setConversionStage("completed");
      setConversionProgress(100);
      await loadHistory(false);
    } catch (err: unknown) {
      setConversionStage("error");
      setConversionProgress(100);
      setMessage({
        type: "error",
        text:
          err instanceof Error
            ? err.message
            : "Background removal failed. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePreviewHistoryItem = async (item: ConversionHistoryItem) => {
    if (!item.download_url) return;

    try {
      setMessage(null);
      setHistoryError("");
      const processedFile = await fetchResultFile(
        item.download_url,
        buildPngFilename(item.input_filename || `conversion-${item.id}`),
      );

      setFile(null);
      replaceSourcePreview(null);
      resetEditorState();
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      replaceResultPreview({
        url: processedFile.objectUrl,
        filename: processedFile.filename,
        downloadUrl: item.download_url,
        conversionId: item.id,
        status: item.status,
        pointsCharged: item.points_charged,
        remainingBalance: null,
        fromHistory: true,
      });
    } catch (err: unknown) {
      setMessage({
        type: "error",
        text:
          err instanceof Error
            ? err.message
            : "Preview loading failed. Please try again.",
      });
    }
  };

  const downloadEditorCanvas = useCallback(async () => {
    if (!resultPreview) return;

    const editorCanvas = editorCanvasRef.current;
    if (!editorCanvas) {
      triggerBrowserDownload(resultPreview.url, resultPreview.filename);
      return;
    }

    const blob = await canvasToPngBlob(editorCanvas);
    resetEditorDownloadUrl();

    const objectUrl = URL.createObjectURL(blob);
    editorDownloadUrlRef.current = objectUrl;
    triggerBrowserDownload(
      objectUrl,
      strokeHistory.length > 0
        ? buildRefinedPngFilename(resultPreview.filename)
        : resultPreview.filename,
    );

    window.setTimeout(() => {
      if (editorDownloadUrlRef.current === objectUrl) {
        URL.revokeObjectURL(objectUrl);
        editorDownloadUrlRef.current = null;
      }
    }, 0);
  }, [resetEditorDownloadUrl, resultPreview, strokeHistory.length]);

  const handleDownloadCurrent = async () => {
    if (!resultPreview) return;

    try {
      await downloadEditorCanvas();
    } catch (err: unknown) {
      setMessage({
        type: "error",
        text:
          err instanceof Error
            ? err.message
            : "Download failed. Please try again.",
      });
    }
  };

  const handleDownloadHistoryItem = async (item: ConversionHistoryItem) => {
    if (!item.download_url) return;

    try {
      setMessage(null);
      const processedFile = await fetchResultFile(
        item.download_url,
        buildPngFilename(item.input_filename || `conversion-${item.id}`),
      );
      triggerBrowserDownload(processedFile.objectUrl, processedFile.filename);
      if (processedFile.objectUrl.startsWith("blob:")) {
        window.setTimeout(() => URL.revokeObjectURL(processedFile.objectUrl), 0);
      }
    } catch (err: unknown) {
      setMessage({
        type: "error",
        text:
          err instanceof Error ? err.message : "Download failed. Please try again.",
      });
    }
  };

  const handleDeleteHistoryItem = async (item: ConversionHistoryItem) => {
    try {
      setMessage(null);
      const res = await authorizedFetch(buildUrl(`/api/v3/conversions/${item.id}`), {
        method: "DELETE",
      });

      if (!res.ok) {
        const bodyText = await res.text();
        throw new Error(bodyText || "Delete failed");
      }

      setHistory((prev) => prev.filter((entry) => entry.id !== item.id));

      if (resultPreview?.fromHistory && resultPreview.conversionId === item.id) {
        replaceResultPreview(null);
      }
    } catch (err: unknown) {
      setMessage({
        type: "error",
        text:
          err instanceof Error ? err.message : "Delete failed. Please try again.",
      });
    }
  };

  const currentFileSummary = useMemo(() => {
    if (!file) return "No image selected yet";
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(2);
    return `${file.name} • ${sizeInMb} MB`;
  }, [file]);

  const hasOriginalPreview = !!sourcePreviewUrl;
  const hasResultPreview = !!resultPreview;
  const hasRefineEdits = strokeHistory.length > 0;

  const drawStrokeSegment = useCallback((stroke: BrushStroke) => {
    const editorCanvas = editorCanvasRef.current;
    const sourceCanvas = editorSourceCanvasRef.current;
    if (!editorCanvas || !sourceCanvas) return;

    if (!editorScratchCanvasRef.current) {
      editorScratchCanvasRef.current = document.createElement("canvas");
    }

    const editorContext = editorCanvas.getContext("2d");
    if (!editorContext) return;

    applyStrokeToContext({
      targetContext: editorContext,
      sourceCanvas,
      scratchCanvas: editorScratchCanvasRef.current,
      stroke,
    });
  }, []);

  const handleUndoStroke = () => {
    setStrokeHistory((prev) => prev.slice(0, -1));
  };

  const handleResetEdits = () => {
    setStrokeHistory([]);
    activeStrokeRef.current = null;
    activePointerIdRef.current = null;
  };

  const handleEditorPointerDown = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      if (!hasResultPreview || editorLoading) return;
      if (event.pointerType === "mouse" && event.button !== 0) return;

      const canvas = editorCanvasRef.current;
      if (!canvas) return;

      event.preventDefault();
      activePointerIdRef.current = event.pointerId;
      canvas.setPointerCapture(event.pointerId);

      const point = getCanvasPoint(canvas, event.clientX, event.clientY);
      const nextStroke: BrushStroke = {
        mode: editorMode,
        size: brushSize,
        points: [point],
      };

      activeStrokeRef.current = nextStroke;
      drawStrokeSegment(nextStroke);
    },
    [brushSize, drawStrokeSegment, editorLoading, editorMode, hasResultPreview],
  );

  const handleEditorPointerMove = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      if (activePointerIdRef.current !== event.pointerId) return;
      if (!activeStrokeRef.current) return;

      const canvas = editorCanvasRef.current;
      if (!canvas) return;

      event.preventDefault();
      const nextPoint = getCanvasPoint(canvas, event.clientX, event.clientY);
      const currentStroke = activeStrokeRef.current;
      const lastPoint = currentStroke.points[currentStroke.points.length - 1];

      if (
        Math.abs(nextPoint.x - lastPoint.x) < 0.5 &&
        Math.abs(nextPoint.y - lastPoint.y) < 0.5
      ) {
        return;
      }

      currentStroke.points.push(nextPoint);
      drawStrokeSegment({
        mode: currentStroke.mode,
        size: currentStroke.size,
        points: [lastPoint, nextPoint],
      });
    },
    [drawStrokeSegment],
  );

  const finishActiveStroke = useCallback(() => {
    if (!activeStrokeRef.current) return;

    const completedStroke = {
      ...activeStrokeRef.current,
      points: [...activeStrokeRef.current.points],
    };

    activeStrokeRef.current = null;
    activePointerIdRef.current = null;
    setStrokeHistory((prev) =>
      [...prev, completedStroke].slice(-MAX_EDITOR_HISTORY),
    );
  }, []);

  const handleEditorPointerUp = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      if (activePointerIdRef.current !== event.pointerId) return;

      event.preventDefault();
      const canvas = editorCanvasRef.current;
      canvas?.releasePointerCapture(event.pointerId);
      finishActiveStroke();
    },
    [finishActiveStroke],
  );

  const handleEditorPointerCancel = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      if (activePointerIdRef.current !== event.pointerId) return;

      const canvas = editorCanvasRef.current;
      canvas?.releasePointerCapture(event.pointerId);
      finishActiveStroke();
    },
    [finishActiveStroke],
  );

  return (
    <div className="space-y-8">
      <SectionCard
        title="Remove Background Studio"
        description="Drop an image, preview the original instantly, and export a transparent PNG from the same workspace."
        action={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={openFilePicker}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              <span className="material-symbols-outlined text-base">upload</span>
              {file ? "Replace Image" : "Choose Image"}
            </button>
            <button
              type="button"
              onClick={resetStudio}
              disabled={!file && !resultPreview}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              <span className="material-symbols-outlined text-base">restart_alt</span>
              Start Over
            </button>
          </div>
        }
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(",")}
          className="hidden"
          onChange={(event) => applySelectedFile(event.target.files?.[0] ?? null)}
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.9fr)]">
          <div
            role="button"
            tabIndex={0}
            onClick={openFilePicker}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openFilePicker();
              }
            }}
            onDragEnter={(event) => {
              event.preventDefault();
              setDragActive(true);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              if (event.currentTarget === event.target) {
                setDragActive(false);
              }
            }}
            onDrop={(event) => {
              event.preventDefault();
              setDragActive(false);
              applySelectedFile(event.dataTransfer.files?.[0] ?? null);
            }}
            className={`rounded-3xl border border-dashed p-6 transition ${
              dragActive
                ? "border-primary bg-primary/5 shadow-[0_0_0_4px_rgba(59,130,246,0.08)]"
                : "border-slate-300 bg-slate-50 hover:border-primary/40 hover:bg-white dark:border-slate-700 dark:bg-slate-950/40 dark:hover:border-primary/40 dark:hover:bg-slate-900"
            }`}
          >
            <div className="flex flex-col gap-5">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                  <span className="material-symbols-outlined text-2xl">
                    image_arrow_up
                  </span>
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    Drag & drop your image
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    PNG, JPG, JPEG, or WEBP up to 50MB. Output is always a transparent PNG.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/60 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                  Current Image
                </p>
                <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
                  {currentFileSummary}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      openFilePicker();
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    <span className="material-symbols-outlined text-base">
                      {file ? "sync" : "add_photo_alternate"}
                    </span>
                    {file ? "Replace Image" : "Choose Image"}
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setFile(null);
                      replaceSourcePreview(null);
                      replaceResultPreview(null);
                      setMessage(null);
                      setConversionStage("idle");
                      setConversionProgress(0);
                      resetEditorState({ preserveTool: true });
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                    disabled={!file}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                  >
                    <span className="material-symbols-outlined text-base">close</span>
                    Remove Image
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 p-5 text-white dark:border-slate-800">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/60">
                Studio Notes
              </p>
              <ul className="mt-4 space-y-3 text-sm text-white/80">
                <li>Preview the original image before you submit.</li>
                <li>See transparency on a checkerboard result stage.</li>
                <li>History preview can show only the processed PNG because the current API does not store original uploads.</li>
              </ul>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/50">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                Export
              </p>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                Download the finished image as a PNG with transparency preserved.
              </p>
              <button
                type="button"
                onClick={handleConvert}
                disabled={!file || submitting}
                className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition ${
                  file && !submitting
                    ? "bg-primary text-white hover:opacity-90"
                    : "border border-slate-300 bg-transparent text-slate-500"
                }`}
              >
                <span className="material-symbols-outlined text-base">auto_fix_high</span>
                {submitting ? "Removing Background..." : "Remove Background"}
              </button>
            </div>
          </div>
        </div>

        {message ? (
          <div
            className={`mt-6 rounded-2xl px-4 py-3 text-sm ${
              message.type === "error"
                ? "border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300"
                : "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300"
            }`}
          >
            {message.text}
          </div>
        ) : null}

        {submitting ? (
          <div className="mt-6">
            <ConversionProgressPanel
              progress={conversionProgress}
              stage={conversionStage}
              filename={file?.name}
            />
          </div>
        ) : null}
      </SectionCard>

      <SectionCard
        title="Before & After Studio"
        description="Compare the source image with the transparent PNG result in one place."
        action={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={openFilePicker}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              <span className="material-symbols-outlined text-base">photo_library</span>
              Replace Image
            </button>
            <button
              type="button"
              onClick={handleDownloadCurrent}
              disabled={!hasResultPreview}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base">download</span>
              {hasRefineEdits ? "Download Refined PNG" : "Download PNG"}
            </button>
            <button
              type="button"
              onClick={resetStudio}
              disabled={!file && !resultPreview}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              <span className="material-symbols-outlined text-base">restart_alt</span>
              Start Over
            </button>
          </div>
        }
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                  Original
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {hasOriginalPreview
                    ? "Local preview from the current upload."
                    : hasResultPreview && resultPreview?.fromHistory
                      ? "Original preview unavailable for history items."
                      : "Choose an image to see the source preview."}
                </p>
              </div>
              {file ? (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {file.name}
                </span>
              ) : null}
            </div>

            <div className="flex min-h-[360px] items-center justify-center overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
              {hasOriginalPreview ? (
                <Image
                  src={sourcePreviewUrl}
                  alt={file?.name || "Original preview"}
                  width={1440}
                  height={1080}
                  unoptimized
                  className="max-h-[520px] w-full rounded-2xl object-contain"
                />
              ) : hasResultPreview && resultPreview?.fromHistory ? (
                <div className="max-w-sm rounded-2xl border border-dashed border-slate-300 bg-white/90 p-6 text-center dark:border-slate-700 dark:bg-slate-900/80">
                  <span className="material-symbols-outlined text-4xl text-slate-400">
                    photo_camera_back
                  </span>
                  <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
                    Original preview unavailable
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    This history item can show only the processed PNG because the current API does not store original uploaded images.
                  </p>
                </div>
              ) : (
                <div className="max-w-sm text-center">
                  <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600">
                    image
                  </span>
                  <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
                    Source preview will appear here
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Upload an image to inspect the original before you remove the background.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                  Result
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Refine the processed PNG directly here. Checkerboard background reveals transparency in the export.
                </p>
              </div>
              {hasResultPreview ? (
                <StatusBadge status={resultPreview.status} />
              ) : null}
            </div>

            {hasResultPreview ? (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/50">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditorMode("erase")}
                        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                          editorMode === "erase"
                            ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                            : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                        }`}
                      >
                        <span className="material-symbols-outlined text-base">ink_eraser</span>
                        Erase
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditorMode("restore")}
                        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                          editorMode === "restore"
                            ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                            : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                        }`}
                      >
                        <span className="material-symbols-outlined text-base">brush</span>
                        Restore
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handleUndoStroke}
                        disabled={!hasRefineEdits}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        <span className="material-symbols-outlined text-base">undo</span>
                        Undo
                      </button>
                      <button
                        type="button"
                        onClick={handleResetEdits}
                        disabled={!hasRefineEdits}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        <span className="material-symbols-outlined text-base">restart_alt</span>
                        Reset Edits
                      </button>
                      <button
                        type="button"
                        onClick={handleDownloadCurrent}
                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                      >
                        <span className="material-symbols-outlined text-base">download</span>
                        Download Refined PNG
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                    <label className="space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                          Brush Size
                        </span>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600 shadow-sm dark:bg-slate-900 dark:text-slate-300">
                          {brushSize}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min={8}
                        max={120}
                        step={1}
                        value={brushSize}
                        onChange={(event) =>
                          setBrushSize(Number(event.target.value) || 28)
                        }
                        className="w-full accent-primary"
                      />
                    </label>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 md:justify-end">
                      {editorDimensions ? (
                        <span className="rounded-full bg-white px-3 py-1 font-semibold text-slate-600 shadow-sm dark:bg-slate-900 dark:text-slate-300">
                          {editorDimensions.width} × {editorDimensions.height}
                        </span>
                      ) : null}
                      <span className="rounded-full bg-white px-3 py-1 font-semibold text-slate-600 shadow-sm dark:bg-slate-900 dark:text-slate-300">
                        {hasRefineEdits ? `${strokeHistory.length} edit${strokeHistory.length === 1 ? "" : "s"}` : "No local edits yet"}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
                    Brush edits stay on this page only. Download the refined PNG when it looks right.
                  </div>
                </div>
              </div>
            ) : null}

            <div
              style={TRANSPARENT_GRID_STYLE}
              className="flex min-h-[360px] items-center justify-center overflow-hidden rounded-3xl border border-slate-200 p-4 dark:border-slate-800"
            >
              {hasResultPreview ? (
                <div className="flex w-full flex-col items-center gap-4">
                  <canvas
                    ref={editorCanvasRef}
                    onPointerDown={handleEditorPointerDown}
                    onPointerMove={handleEditorPointerMove}
                    onPointerUp={handleEditorPointerUp}
                    onPointerCancel={handleEditorPointerCancel}
                    onPointerLeave={handleEditorPointerCancel}
                    className={`max-h-[520px] w-full rounded-2xl object-contain shadow-[0_16px_40px_rgba(15,23,42,0.12)] ${
                      editorLoading
                        ? "pointer-events-none opacity-0"
                        : "cursor-crosshair"
                    }`}
                    style={{
                      touchAction: "none",
                      aspectRatio: editorDimensions
                        ? `${editorDimensions.width} / ${editorDimensions.height}`
                        : "16 / 10",
                    }}
                  />

                  {editorLoading ? (
                    <div className="max-w-sm rounded-2xl bg-white/90 px-6 py-5 text-center shadow-sm dark:bg-slate-900/85">
                      <span className="material-symbols-outlined text-4xl text-slate-400">
                        hourglass_top
                      </span>
                      <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
                        Preparing the refine canvas
                      </p>
                      <p className="mt-2 text-sm text-slate-500">
                        Your processed PNG is loading into the editor now.
                      </p>
                    </div>
                  ) : null}

                  {resultPreview.fromHistory ? (
                    <div className="max-w-xl rounded-2xl bg-white/85 px-4 py-3 text-center text-sm text-slate-600 shadow-sm dark:bg-slate-900/85 dark:text-slate-300">
                      Original preview is unavailable for history items, but you can still refine and download this processed PNG locally.
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="max-w-sm rounded-2xl bg-white/85 p-6 text-center shadow-sm dark:bg-slate-900/85">
                  <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600">
                    layers
                  </span>
                  <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
                    Transparent PNG preview will appear here
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    After processing, you can review the cleaned result and download it instantly.
                  </p>
                </div>
              )}
            </div>

            {hasResultPreview ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Conversion ID
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                    {resultPreview.conversionId ?? "-"}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Status
                  </p>
                  <div className="mt-2">
                    <StatusBadge status={resultPreview.status} />
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Points Charged
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                    {resultPreview.pointsCharged}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Remaining Balance
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                    {resultPreview.remainingBalance ?? "-"}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Processed Images"
        description="Preview, download, or delete previous transparent PNG results for this tool."
        action={
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => void loadHistory(true)}
              disabled={loadingHistory}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              <span className="material-symbols-outlined text-base">history</span>
              {loadingHistory ? "Refreshing..." : "Refresh History"}
            </button>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {history.length} items
            </span>
          </div>
        }
      >
        {historyError ? (
          <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
            {historyError}
          </div>
        ) : null}

        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="max-h-[440px] overflow-y-auto overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-800/50">
                <tr>
                  <th className="px-4 py-4 font-semibold">ID</th>
                  <th className="px-4 py-4 font-semibold">Source Image</th>
                  <th className="px-4 py-4 font-semibold">Status</th>
                  <th className="px-4 py-4 font-semibold">Updated</th>
                  <th className="px-4 py-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {history.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-10 text-center text-sm text-slate-500"
                    >
                      No processed images yet.
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
                      <td className="max-w-[260px] px-4 py-4">
                        <div className="truncate" title={item.input_filename}>
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
                            onClick={() => void handlePreviewHistoryItem(item)}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                          >
                            Refine
                          </button>
                          <button
                            type="button"
                            disabled={!item.download_url}
                            onClick={() => void handleDownloadHistoryItem(item)}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                          >
                            Download
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDeleteHistoryItem(item)}
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
  );
}
