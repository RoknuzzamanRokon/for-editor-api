"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import ReactCrop, { type PercentCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import {
  OUTPUT_MAX_SIDE,
  applyScanFilter,
  applyToneAdjustments,
  aspectForPreset,
  canvasToFile,
  centeredCropForAspect,
  clonePixels,
  loadImage,
  normalizeCrop,
  normalizeRotation,
  paintPixels,
  releaseCanvas,
  renderEdited,
  renderPreviewBase,
  rotateCropRect,
  rotatedSize,
  type LoadedImage,
  type PixelBuffer,
  type Size,
} from "./imageProcessing";
import {
  ADJUSTMENT_MAX,
  ADJUSTMENT_MIN,
  DEFAULT_EDITS,
  clampAdjustment,
  editsEqual,
  hasToneEdits,
  isDefaultEdits,
  type CropPreset,
  type ImageEdits,
  type ImageFilter,
  type ImageItem,
} from "./types";

type ImageEditorModalProps = {
  /** The images as saved when the editor opened, in page order. */
  items: ImageItem[];
  initialIndex: number;
  /** Thumbnail object URLs by item id (owned by the caller). */
  thumbnailUrls: Record<string, string>;
  /** Close without saving anything from this session. */
  onCancel: () => void;
  /** Every item, with the ones edited this session carrying new edits and output. */
  onDone: (items: ImageItem[]) => void;
};

const CROP_PRESETS: { value: CropPreset; label: string }[] = [
  { value: "free", label: "Free" },
  { value: "a4", label: "A4" },
  { value: "square", label: "1:1" },
  { value: "original", label: "Original" },
];

const FILTERS: { value: ImageFilter; label: string; icon: string }[] = [
  { value: "none", label: "Original", icon: "image" },
  { value: "scan", label: "Scan", icon: "document_scanner" },
  { value: "grayscale", label: "Grayscale", icon: "filter_b_and_w" },
  { value: "bw", label: "Black & White", icon: "contrast" },
];
const FILTER_LABELS = Object.fromEntries(FILTERS.map((f) => [f.value, f.label])) as Record<
  ImageFilter,
  string
>;

const signed = (value: number) => (value > 0 ? `+${value}` : String(value));

const sameTone = (a: ImageEdits, b: ImageEdits) =>
  a.filter === b.filter && a.brightness === b.brightness && a.contrast === b.contrast;

/** Debounce for preview re-renders while a slider is being dragged. */
const PREVIEW_DEBOUNCE_MS = 60;
const STAGE_PADDING = 24;

const FULL_FRAME_CROP: PercentCrop = { unit: "%", x: 0, y: 0, width: 100, height: 100 };

const isTypingTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) ||
    // The crop box uses arrow keys to nudge itself.
    Boolean(target.closest(".ReactCrop")));

const errorMessage = (error: unknown, fallback: string) =>
  error instanceof Error && error.message ? error.message : fallback;

const yieldToBrowser = () => new Promise<void>((resolve) => window.setTimeout(resolve, 0));

const TOOL_BUTTON =
  "inline-flex items-center justify-center gap-1.5 rounded-xl border border-border px-3 py-2 text-sm font-semibold text-foreground transition hover:bg-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-40";
const TOOL_BUTTON_ACTIVE = "border-primary bg-primary/10 text-primary";

function Icon({ name, className = "text-base" }: { name: string; className?: string }) {
  return (
    <span aria-hidden="true" className={`material-symbols-outlined ${className}`}>
      {name}
    </span>
  );
}

function ToolSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{title}</h3>
      {children}
    </section>
  );
}

export default function ImageEditorModal({
  items,
  initialIndex,
  thumbnailUrls,
  onCancel,
  onDone,
}: ImageEditorModalProps) {
  const [index, setIndex] = useState(() =>
    Math.max(0, Math.min(items.length - 1, initialIndex)),
  );
  // Session edits. Saved edits are only replaced when Done finishes.
  const [drafts, setDrafts] = useState<Record<string, ImageEdits>>(() =>
    Object.fromEntries(items.map((item) => [item.id, item.edits])),
  );
  const [preset, setPreset] = useState<CropPreset>("free");
  const [source, setSource] = useState<{ id: string; loaded: LoadedImage } | null>(null);
  const [loadError, setLoadError] = useState<{ id: string; message: string } | null>(null);
  const [preview, setPreview] = useState<{ key: string; size: Size } | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [stageSize, setStageSize] = useState<Size>({ width: 0, height: 0 });
  const [applying, setApplying] = useState<{ current: number; total: number } | null>(null);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [confirmApplyAll, setConfirmApplyAll] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const dialogRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sourcesRef = useRef<Map<string, Promise<LoadedImage>>>(new Map());
  const baseCacheRef = useRef<{ key: string; pixels: PixelBuffer } | null>(null);
  const filteredCacheRef = useRef<{ key: string; pixels: PixelBuffer } | null>(null);
  const applyingRef = useRef(false);
  const mountedRef = useRef(true);

  const current = items[index];
  const draft = drafts[current.id] ?? DEFAULT_EDITS;
  const busy = applying !== null;
  const loaded = source?.id === current.id ? source.loaded : null;
  const rotated = loaded ? rotatedSize(loaded.width, loaded.height, draft.rotation) : null;
  const previewKey = `${current.id}:${draft.rotation}`;
  const previewReady = preview?.key === previewKey && !previewError;
  const currentLoadError = loadError?.id === current.id ? loadError.message : null;

  const changedIds = useMemo(
    () =>
      new Set(
        items
          .filter((item) => !editsEqual(drafts[item.id] ?? item.edits, item.edits))
          .map((item) => item.id),
      ),
    [drafts, items],
  );
  const dirty = changedIds.size > 0;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Modal behaviour: lock page scroll, move focus in, and give it back on close.
  useEffect(() => {
    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, []);

  // Closing the tab or reloading would silently drop unsaved edits.
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => {
      setStageSize({
        width: Math.floor(entry.contentRect.width),
        height: Math.floor(entry.contentRect.height),
      });
    });
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  const getSource = useCallback((item: ImageItem) => {
    const cache = sourcesRef.current;
    let pending = cache.get(item.id);
    if (!pending) {
      pending = loadImage(item.original);
      cache.set(item.id, pending);
    }
    return pending;
  }, []);

  // Decode the current image, prefetch its neighbours, and drop the rest so
  // only about three decoded photos are ever held at once.
  useEffect(() => {
    let cancelled = false;
    const id = current.id;
    setPreviewError(null);
    getSource(current).then(
      (result) => {
        if (!cancelled) setSource({ id, loaded: result });
      },
      (error: unknown) => {
        if (!cancelled) {
          setLoadError({ id, message: errorMessage(error, "Couldn't open this image.") });
        }
      },
    );

    const keep = new Set([id]);
    [items[index - 1], items[index + 1]].forEach((neighbour) => {
      if (!neighbour) return;
      keep.add(neighbour.id);
      getSource(neighbour).catch(() => {
        // Reported when (if) the user navigates to it.
      });
    });
    Array.from(sourcesRef.current.keys()).forEach((key) => {
      if (!keep.has(key)) sourcesRef.current.delete(key);
    });

    return () => {
      cancelled = true;
    };
  }, [current, getSource, index, items]);

  // Live preview, in three cached layers so a slider drag only redoes the
  // cheap last step: the rotated image at preview size (per rotation) → the
  // filter (per filter) → brightness/contrast (every change, debounced).
  // Never full resolution: the final render happens once, on Done.
  useEffect(() => {
    if (!loaded) return;
    const handle = window.setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      try {
        const baseKey = previewKey;
        if (baseCacheRef.current?.key !== baseKey) {
          baseCacheRef.current = { key: baseKey, pixels: renderPreviewBase(loaded, draft.rotation) };
          filteredCacheRef.current = null;
        }
        const filteredKey = `${baseKey}:${draft.filter}`;
        if (filteredCacheRef.current?.key !== filteredKey) {
          filteredCacheRef.current = {
            key: filteredKey,
            pixels:
              draft.filter === "none"
                ? baseCacheRef.current.pixels
                : applyScanFilter(clonePixels(baseCacheRef.current.pixels), draft.filter),
          };
        }
        const filtered = filteredCacheRef.current.pixels;
        const pixels =
          draft.brightness === 0 && draft.contrast === 0
            ? filtered
            : applyToneAdjustments(clonePixels(filtered), draft.brightness, draft.contrast);
        paintPixels(canvas, pixels);
        setPreview({ key: baseKey, size: { width: pixels.width, height: pixels.height } });
        setPreviewError(null);
      } catch (error) {
        setPreviewError(errorMessage(error, "Couldn't draw the preview."));
      }
    }, PREVIEW_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [loaded, previewKey, draft.rotation, draft.filter, draft.brightness, draft.contrast]);

  const updateDraft = useCallback(
    (update: (edits: ImageEdits) => ImageEdits) => {
      setDrafts((prev) => ({ ...prev, [current.id]: update(prev[current.id] ?? DEFAULT_EDITS) }));
    },
    [current.id],
  );

  const goTo = useCallback(
    (next: number) => {
      if (busy || next < 0 || next >= items.length || next === index) return;
      setIndex(next);
      setPreset("free");
      setConfirmDiscard(false);
      setConfirmApplyAll(false);
      setNotice(null);
    },
    [busy, index, items.length],
  );

  const rotate = (direction: "cw" | "ccw") => {
    updateDraft((edits) => ({
      ...edits,
      rotation: normalizeRotation(edits.rotation + (direction === "cw" ? 90 : -90)),
      crop: normalizeCrop(rotateCropRect(edits.crop, direction)),
    }));
  };

  const choosePreset = (next: CropPreset) => {
    setPreset(next);
    if (!rotated) return;
    const aspect = aspectForPreset(next, rotated.width, rotated.height);
    if (aspect === undefined) return;
    updateDraft((edits) => ({
      ...edits,
      crop: normalizeCrop(centeredCropForAspect(aspect, rotated.width, rotated.height)),
    }));
  };

  const reset = () => {
    setPreset("free");
    setNotice(null);
    updateDraft(() => DEFAULT_EDITS);
  };

  const setTone = (patch: Partial<Pick<ImageEdits, "filter" | "brightness" | "contrast">>) => {
    setConfirmApplyAll(false);
    setNotice(null);
    updateDraft((edits) => ({ ...edits, ...patch }));
  };

  // "Apply to all" copies the filter, brightness and contrast — never crop or
  // rotation, which are specific to each photo.
  const applyAllTargets = items.filter(
    (item) => item.id !== current.id && !sameTone(drafts[item.id] ?? item.edits, draft),
  );
  const applyAllConflicts = applyAllTargets.filter((item) =>
    hasToneEdits(drafts[item.id] ?? item.edits),
  );
  const toneSummary = `${FILTER_LABELS[draft.filter]} · Brightness ${signed(draft.brightness)} · Contrast ${signed(draft.contrast)}`;

  const applyToneToAll = () => {
    const { filter, brightness, contrast } = draft;
    const targets = applyAllTargets.map((item) => item.id);
    setDrafts((prev) => {
      const next = { ...prev };
      targets.forEach((id) => {
        next[id] = { ...(prev[id] ?? DEFAULT_EDITS), filter, brightness, contrast };
      });
      return next;
    });
    setConfirmApplyAll(false);
    setNotice(
      `Applied ${toneSummary} to ${targets.length} more image${targets.length === 1 ? "" : "s"}. Crop and rotation unchanged.`,
    );
  };

  const requestApplyToAll = () => {
    if (applyAllConflicts.length > 0) {
      setConfirmApplyAll(true);
    } else {
      applyToneToAll();
    }
  };

  const requestCancel = useCallback(() => {
    if (applyingRef.current) return;
    if (dirty) {
      setConfirmDiscard(true);
    } else {
      onCancel();
    }
  }, [dirty, onCancel]);

  const handleDone = async () => {
    if (applyingRef.current) return;
    const changed = items.filter((item) => changedIds.has(item.id));
    if (changed.length === 0) {
      onCancel();
      return;
    }

    applyingRef.current = true;
    setApplyError(null);
    setConfirmDiscard(false);
    const outputs = new Map<string, File>();

    for (let i = 0; i < changed.length; i += 1) {
      const item = changed[i];
      const edits = drafts[item.id];
      setApplying({ current: i + 1, total: changed.length });
      // Let the progress text paint before the (blocking) render.
      await yieldToBrowser();
      if (!mountedRef.current) return;

      try {
        if (isDefaultEdits(edits)) {
          // Back to untouched: upload the original bytes, not a re-encode.
          outputs.set(item.id, item.original);
        } else {
          const canvas = await renderEdited(item.original, edits, { maxSide: OUTPUT_MAX_SIDE });
          try {
            outputs.set(item.id, await canvasToFile(canvas, item.original.name));
          } finally {
            releaseCanvas(canvas);
          }
        }
      } catch (error) {
        if (!mountedRef.current) return;
        applyingRef.current = false;
        setApplying(null);
        setApplyError(
          `Couldn't apply edits to image ${items.indexOf(item) + 1} (${item.original.name}): ${errorMessage(
            error,
            "rendering failed",
          )}. Nothing was saved — your edits are still here, so you can adjust or reset that image and try again.`,
        );
        return;
      }
    }

    if (!mountedRef.current) return;
    applyingRef.current = false;
    setApplying(null);
    onDone(
      items.map((item) => {
        const output = outputs.get(item.id);
        return output ? { ...item, edits: drafts[item.id], output } : item;
      }),
    );
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (applyingRef.current) {
        if (event.key === "Escape" || event.key === "Tab") event.preventDefault();
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        if (confirmDiscard) {
          setConfirmDiscard(false);
        } else {
          requestCancel();
        }
        return;
      }
      if (event.key === "Tab") {
        // Keep focus inside the dialog.
        const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (!focusables || focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;
        if (event.shiftKey && (active === first || active === dialogRef.current)) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && active === last) {
          event.preventDefault();
          first.focus();
        }
        return;
      }
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      if (event.altKey || event.ctrlKey || event.metaKey || isTypingTarget(event.target)) return;
      event.preventDefault();
      goTo(index + (event.key === "ArrowRight" ? 1 : -1));
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [confirmDiscard, goTo, index, requestCancel]);

  const displaySize = useMemo<Size | null>(() => {
    if (!preview || stageSize.width <= 0 || stageSize.height <= 0) return null;
    const availableWidth = Math.max(1, stageSize.width - STAGE_PADDING * 2);
    const availableHeight = Math.max(1, stageSize.height - STAGE_PADDING * 2);
    const scale = Math.min(
      availableWidth / preview.size.width,
      availableHeight / preview.size.height,
    );
    return {
      width: Math.max(1, Math.floor(preview.size.width * scale)),
      height: Math.max(1, Math.floor(preview.size.height * scale)),
    };
  }, [preview, stageSize]);

  const cropValue: PercentCrop = draft.crop
    ? {
        unit: "%",
        x: draft.crop.x * 100,
        y: draft.crop.y * 100,
        width: draft.crop.w * 100,
        height: draft.crop.h * 100,
      }
    : FULL_FRAME_CROP;
  const cropAspect = rotated ? aspectForPreset(preset, rotated.width, rotated.height) : undefined;

  const dialog = (
    <div className="fixed inset-0 z-[100] flex bg-black/60 backdrop-blur-sm">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="image-editor-title"
        tabIndex={-1}
        className="flex h-[100dvh] w-full flex-col bg-card text-foreground focus:outline-none"
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-3 py-2 sm:px-5 sm:py-3">
          <button type="button" onClick={requestCancel} disabled={busy} className={TOOL_BUTTON}>
            Cancel
          </button>
          <div className="min-w-0 text-center">
            <h2 id="image-editor-title" className="text-sm font-bold sm:text-base">
              Image {index + 1} / {items.length}
            </h2>
            <p className="truncate text-xs text-slate-500" title={current.original.name}>
              {current.original.name}
            </p>
          </div>
          <button
            type="button"
            onClick={handleDone}
            disabled={busy}
            aria-busy={busy}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-80"
          >
            {applying ? (
              <>
                <Icon name="progress_activity" className="animate-spin text-base" />
                Applying edits… {applying.current}/{applying.total}
              </>
            ) : (
              <>
                <Icon name="check" />
                Done
              </>
            )}
          </button>
        </header>

        {applyError ? (
          <div
            role="alert"
            className="flex shrink-0 items-start justify-between gap-3 border-b border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300"
          >
            <p>{applyError}</p>
            <button
              type="button"
              onClick={() => setApplyError(null)}
              aria-label="Dismiss error"
              className="shrink-0 rounded-lg p-0.5 hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 dark:hover:bg-rose-900/40"
            >
              <Icon name="close" />
            </button>
          </div>
        ) : null}

        {confirmDiscard ? (
          <div
            role="alertdialog"
            aria-label="Discard changes?"
            className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200"
          >
            <p>
              Discard your changes to {changedIds.size} image{changedIds.size === 1 ? "" : "s"}?
              Edits saved earlier are kept.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmDiscard(false)}
                className={TOOL_BUTTON}
                autoFocus
              >
                Keep editing
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="rounded-xl bg-rose-600 px-3 py-2 text-sm font-bold text-white transition hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
              >
                Discard changes
              </button>
            </div>
          </div>
        ) : null}

        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <div className="relative flex min-h-0 flex-1 bg-slate-900">
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              disabled={busy || index === 0}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-30"
            >
              <Icon name="chevron_left" className="text-2xl" />
            </button>

            <div
              ref={stageRef}
              className="flex min-h-[220px] flex-1 items-center justify-center overflow-hidden"
            >
              {currentLoadError ? (
                <div role="alert" className="max-w-sm px-6 text-center text-sm text-slate-200">
                  <Icon name="broken_image" className="text-4xl text-slate-400" />
                  <p className="mt-2 font-semibold">{currentLoadError}</p>
                  <p className="mt-1 text-slate-400">
                    Skip it with Next, or remove it from the list after closing the editor.
                  </p>
                </div>
              ) : (
                <>
                  <div className={previewReady && displaySize ? "" : "invisible absolute"}>
                    <ReactCrop
                      crop={cropValue}
                      aspect={cropAspect}
                      keepSelection
                      ruleOfThirds
                      minWidth={24}
                      minHeight={24}
                      disabled={busy || !previewReady}
                      onChange={(_pixelCrop, percentCrop) =>
                        updateDraft((edits) => ({
                          ...edits,
                          crop: normalizeCrop({
                            x: percentCrop.x / 100,
                            y: percentCrop.y / 100,
                            w: percentCrop.width / 100,
                            h: percentCrop.height / 100,
                          }),
                        }))
                      }
                      ariaLabels={{
                        cropArea: "Crop area. Drag to move it, or use the arrow keys.",
                        nwDragHandle: "Resize crop from the top-left corner",
                        nDragHandle: "Resize crop from the top edge",
                        neDragHandle: "Resize crop from the top-right corner",
                        eDragHandle: "Resize crop from the right edge",
                        seDragHandle: "Resize crop from the bottom-right corner",
                        sDragHandle: "Resize crop from the bottom edge",
                        swDragHandle: "Resize crop from the bottom-left corner",
                        wDragHandle: "Resize crop from the left edge",
                      }}
                    >
                      <canvas
                        ref={canvasRef}
                        aria-label={`Preview of ${current.original.name}`}
                        role="img"
                        className="block"
                        style={displaySize ?? undefined}
                      />
                    </ReactCrop>
                  </div>
                  {!previewReady ? (
                    <div className="flex flex-col items-center gap-2 text-sm text-slate-300">
                      {previewError ? (
                        <p role="alert">{previewError}</p>
                      ) : (
                        <>
                          <Icon name="progress_activity" className="animate-spin text-3xl" />
                          <span>Loading image…</span>
                        </>
                      )}
                    </div>
                  ) : null}
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => goTo(index + 1)}
              disabled={busy || index === items.length - 1}
              aria-label="Next image"
              className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-30"
            >
              <Icon name="chevron_right" className="text-2xl" />
            </button>
          </div>

          <fieldset
            disabled={busy}
            className="max-h-[42dvh] shrink-0 space-y-5 overflow-y-auto border-t border-border p-4 lg:max-h-none lg:w-80 lg:border-l lg:border-t-0"
          >
            <legend className="sr-only">Edit tools</legend>
            <ToolSection title="Crop">
              <div className="grid grid-cols-4 gap-2" role="group" aria-label="Crop shape">
                {CROP_PRESETS.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => choosePreset(value)}
                    disabled={!previewReady}
                    aria-label={`${label} crop`}
                    aria-pressed={preset === value}
                    className={`${TOOL_BUTTON} px-2 ${preset === value ? TOOL_BUTTON_ACTIVE : ""}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </ToolSection>

            <ToolSection title="Rotate">
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => rotate("ccw")} className={TOOL_BUTTON}>
                  <Icon name="rotate_left" />
                  Left
                </button>
                <button type="button" onClick={() => rotate("cw")} className={TOOL_BUTTON}>
                  <Icon name="rotate_right" />
                  Right
                </button>
              </div>
            </ToolSection>

            <ToolSection title="Filter">
              <div className="grid grid-cols-2 gap-2" role="group" aria-label="Filter">
                {FILTERS.map(({ value, label, icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setTone({ filter: value })}
                    aria-label={`${label} filter`}
                    aria-pressed={draft.filter === value}
                    className={`${TOOL_BUTTON} px-2 ${draft.filter === value ? TOOL_BUTTON_ACTIVE : ""}`}
                  >
                    <Icon name={icon} />
                    {label}
                  </button>
                ))}
              </div>
              {draft.filter === "scan" ? (
                <p className="text-xs text-slate-500">
                  Evens out shadows and makes the paper white. Best for documents.
                </p>
              ) : null}
            </ToolSection>

            <ToolSection title="Adjust">
              {(
                [
                  ["brightness", "Brightness"],
                  ["contrast", "Contrast"],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <label htmlFor={`image-editor-${key}`} className="font-semibold">
                      {label}
                    </label>
                    <span className="tabular-nums text-slate-500">{signed(draft[key])}</span>
                  </div>
                  <input
                    id={`image-editor-${key}`}
                    type="range"
                    min={ADJUSTMENT_MIN}
                    max={ADJUSTMENT_MAX}
                    step={1}
                    value={draft[key]}
                    onChange={(e) => setTone({ [key]: clampAdjustment(Number(e.target.value)) })}
                    onDoubleClick={() => setTone({ [key]: 0 })}
                    className="w-full accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
              ))}
            </ToolSection>

            {items.length > 1 ? (
              <ToolSection title="All images">
                {confirmApplyAll ? (
                  <div
                    role="alertdialog"
                    aria-label="Replace other images' filter settings?"
                    className="space-y-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
                  >
                    <p>
                      {applyAllConflicts.length} other image
                      {applyAllConflicts.length === 1 ? " has its" : "s have their"} own filter
                      settings. Replace {applyAllConflicts.length === 1 ? "it" : "them"} with{" "}
                      <strong>{toneSummary}</strong>?
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setConfirmApplyAll(false)}
                        className={`${TOOL_BUTTON} flex-1`}
                        autoFocus
                      >
                        Keep theirs
                      </button>
                      <button
                        type="button"
                        onClick={applyToneToAll}
                        className="flex-1 rounded-xl bg-primary px-3 py-2 text-sm font-bold text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                      >
                        Replace
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={requestApplyToAll}
                      disabled={applyAllTargets.length === 0}
                      aria-describedby="image-editor-apply-all-hint"
                      className={`${TOOL_BUTTON} w-full`}
                    >
                      <Icon name="done_all" />
                      Apply filter to all images
                    </button>
                    <p id="image-editor-apply-all-hint" className="text-xs text-slate-500">
                      {applyAllTargets.length === 0
                        ? "All images already use these filter settings."
                        : `Copies ${toneSummary} to ${applyAllTargets.length} other image${
                            applyAllTargets.length === 1 ? "" : "s"
                          }. Crop and rotation stay as they are.`}
                    </p>
                  </>
                )}
                {notice ? (
                  <p role="status" className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    {notice}
                  </p>
                ) : null}
              </ToolSection>
            ) : null}

            <button
              type="button"
              onClick={reset}
              disabled={isDefaultEdits(draft)}
              className={`${TOOL_BUTTON} w-full`}
            >
              <Icon name="restart_alt" />
              Reset this image
            </button>
          </fieldset>
        </div>

        <nav
          aria-label="Images"
          className="shrink-0 overflow-x-auto border-t border-border px-3 py-2"
        >
          <ol className="flex gap-2">
            {items.map((item, i) => (
              <li key={item.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => goTo(i)}
                  disabled={busy}
                  aria-current={i === index ? "true" : undefined}
                  aria-label={`Image ${i + 1}: ${item.original.name}${
                    changedIds.has(item.id) ? " (unsaved changes)" : ""
                  }`}
                  className={`relative block h-14 w-14 overflow-hidden rounded-lg border-2 bg-slate-100 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:bg-slate-800 ${
                    i === index ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  {thumbnailUrls[item.id] ? (
                    // eslint-disable-next-line @next/next/no-img-element -- blob: thumbnail
                    <img
                      src={thumbnailUrls[item.id]}
                      alt=""
                      className="h-full w-full object-cover"
                      draggable={false}
                    />
                  ) : null}
                  <span className="absolute bottom-0 left-0 rounded-tr bg-black/60 px-1 text-[10px] font-bold text-white">
                    {i + 1}
                  </span>
                  {changedIds.has(item.id) ? (
                    <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-amber-400 ring-1 ring-white" />
                  ) : null}
                </button>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </div>
  );

  return typeof document === "undefined" ? null : createPortal(dialog, document.body);
}
