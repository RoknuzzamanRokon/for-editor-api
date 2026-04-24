"use client";

import { useEffect, useRef, useState } from "react";

type EditableDocxPreviewProps = {
  sourceBlob: Blob | null;
  html: string | null;
};

const DOCX_PREVIEW_FRAME_CLASS =
  "relative h-[78vh] min-h-[312px] overflow-auto rounded-2xl border border-slate-200 bg-slate-100 p-4 dark:border-slate-800 dark:bg-slate-950/70 sm:h-[936px]";
const DOCX_FALLBACK_FRAME_CLASS =
  "h-[78vh] min-h-[312px] overflow-auto rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 sm:h-[936px]";

function EditableDocxPreview({
  sourceBlob,
  html,
}: EditableDocxPreviewProps) {
  const [layoutLoading, setLayoutLoading] = useState(false);
  const [layoutError, setLayoutError] = useState("");
  const previewContainerRef = useRef<HTMLDivElement | null>(null);
  const previewStyleRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const previewContainer = previewContainerRef.current;
    const styleContainer = previewStyleRef.current;

    if (!sourceBlob || !previewContainer) {
      if (previewContainer) previewContainer.innerHTML = "";
      if (styleContainer) styleContainer.innerHTML = "";
      setLayoutLoading(false);
      return;
    }

    let cancelled = false;
    previewContainer.innerHTML = "";
    if (styleContainer) styleContainer.innerHTML = "";
    setLayoutLoading(true);
    setLayoutError("");

    const renderPreview = async () => {
      try {
        const { renderAsync } = await import("docx-preview");
        if (cancelled || !previewContainerRef.current) return;

        await renderAsync(
          sourceBlob,
          previewContainerRef.current,
          previewStyleRef.current ?? previewContainerRef.current,
          {
            className: "docx-preview",
            inWrapper: true,
            breakPages: true,
            ignoreWidth: false,
            ignoreHeight: false,
            ignoreFonts: false,
            renderHeaders: true,
            renderFooters: true,
            renderFootnotes: true,
            renderEndnotes: true,
            renderComments: false,
            renderChanges: false,
            renderAltChunks: true,
            ignoreLastRenderedPageBreak: false,
            experimental: true,
            useBase64URL: true,
          },
        );
      } catch (err: unknown) {
        if (!cancelled) {
          setLayoutError(
            err instanceof Error
              ? err.message
              : "Unable to render DOCX preview.",
          );
        }
      } finally {
        if (!cancelled) {
          setLayoutLoading(false);
        }
      }
    };

    void renderPreview();

    return () => {
      cancelled = true;
      previewContainer.innerHTML = "";
      if (styleContainer) styleContainer.innerHTML = "";
    };
  }, [sourceBlob]);

  if (layoutError) {
    if (html) {
      return (
        <div className="space-y-3">
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
            Layout preview could not load. Showing simplified content.
          </div>
          <div className={DOCX_FALLBACK_FRAME_CLASS}>
            <article
              className="docx-preview prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="flex h-[78vh] min-h-[312px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center dark:border-slate-700 dark:bg-slate-800/30 sm:h-[936px]">
        <p className="text-sm text-slate-500">{layoutError}</p>
      </div>
    );
  }

  return (
    <div className={DOCX_PREVIEW_FRAME_CLASS}>
      <div ref={previewStyleRef} className="hidden" aria-hidden="true" />
      <div ref={previewContainerRef} className="min-h-full" />

      {layoutLoading ? (
        <div className="pointer-events-none absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur dark:bg-slate-900/90 dark:text-slate-200">
          Rendering pages...
        </div>
      ) : null}
    </div>
  );
}

export default EditableDocxPreview;
