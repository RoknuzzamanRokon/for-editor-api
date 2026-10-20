"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import ImageEditorModal from "./ImageEditorModal";
import { createImageItem, isDefaultEdits, type ImageItem } from "./types";

const IMAGE_UPLOAD_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp"];

/** How far (px) a pointer may wander before a press on a tile counts as a drag, not a tap. */
const TAP_SLOP = 6;

export const isAcceptedImageFile = (file: File) =>
  file.type.startsWith("image/") ||
  IMAGE_UPLOAD_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext));

/** Moves one item to a new index, returning a new array (or the same reference
 *  when the move is a no-op, so React can skip the re-render). */
export function moveItem<T>(list: T[], from: number, to: number): T[] {
  if (
    from === to ||
    from < 0 ||
    to < 0 ||
    from >= list.length ||
    to >= list.length
  ) {
    return list;
  }
  const next = list.slice();
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

/** Adds one `files` part per image, in page order — the image-to-pdf API contract. */
export function appendImagesToFormData(formData: FormData, items: ImageItem[]) {
  items.forEach((item) => formData.append("files", item.output));
}

type ImageToPdfBuilderProps = {
  items: ImageItem[];
  onItemsChange: Dispatch<SetStateAction<ImageItem[]>>;
  onConvert: () => void;
  submitting: boolean;
};

export default function ImageToPdfBuilder({
  items,
  onItemsChange,
  onConvert,
  submitting,
}: ImageToPdfBuilderProps) {
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const previewCache = useRef<Map<File, string>>(new Map());
  // Index of the tile currently being dragged, or null when idle.
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const tileRefs = useRef<Array<HTMLDivElement | null>>([]);
  // Set after a keyboard move so focus follows the tile to its new position.
  const pendingTileFocus = useRef<number | null>(null);
  // Where the current press started, and whether it has moved far enough to be a drag.
  const pressRef = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  // The editor works on a snapshot of the list taken when it opens.
  const [editorSession, setEditorSession] = useState<{
    items: ImageItem[];
    index: number;
  } | null>(null);

  // Tile to focus once the editor closes.
  const returnFocusTo = useRef<string | null>(null);

  const openEditor = (index: number) => {
    if (submitting || items.length === 0) return;
    setEditorSession({ items, index });
  };

  const closeEditor = () => {
    if (editorSession) returnFocusTo.current = editorSession.items[editorSession.index]?.id ?? null;
    setEditorSession(null);
  };

  const saveEditorSession = (edited: ImageItem[]) => {
    const byId = new Map(edited.map((item) => [item.id, item]));
    onItemsChange((prev) => prev.map((item) => byId.get(item.id) ?? item));
    closeEditor();
  };

  // A tap doesn't focus the tile (pointerdown is default-prevented), so the
  // dialog can't hand focus back on its own — return it to the tile it opened from.
  useEffect(() => {
    if (editorSession || !returnFocusTo.current) return;
    const id = returnFocusTo.current;
    returnFocusTo.current = null;
    const active = document.activeElement;
    if (active && active !== document.body) return;
    const index = items.findIndex((item) => item.id === id);
    tileRefs.current[index]?.focus();
  }, [editorSession, items]);

  const thumbnailUrls = Object.fromEntries(
    items.map((item, i) => [item.id, previewUrls[i] ?? ""]),
  );

  const addFiles = (files: File[]) => {
    const accepted = files.filter(isAcceptedImageFile);
    if (accepted.length) {
      onItemsChange((prev) => [...prev, ...accepted.map(createImageItem)]);
    }
  };

  // Previews are keyed by the File itself, not by position. Reordering rewrites
  // the array on every tile crossed during a drag; regenerating object URLs each
  // time would make every thumbnail blink and leak the old blobs.
  useEffect(() => {
    const cache = previewCache.current;
    const outputs = items.map((item) => item.output);
    let changed = false;

    for (const output of outputs) {
      if (!cache.has(output)) {
        cache.set(output, URL.createObjectURL(output));
        changed = true;
      }
    }

    const stillSelected = new Set(outputs);
    // Array.from rather than iterating the Map directly — this tsconfig targets
    // below ES2015 downlevel iteration.
    Array.from(cache.entries()).forEach(([cachedFile, url]) => {
      if (!stillSelected.has(cachedFile)) {
        URL.revokeObjectURL(url);
        cache.delete(cachedFile);
        changed = true;
      }
    });

    if (changed) {
      setPreviewUrls(outputs.map((f) => cache.get(f) ?? ""));
    } else {
      setPreviewUrls((prev) => {
        const next = outputs.map((f) => cache.get(f) ?? "");
        return prev.length === next.length && prev.every((u, i) => u === next[i])
          ? prev
          : next;
      });
    }
  }, [items]);

  // Revoke everything once, on unmount — not per change, or a reorder would
  // pull the URLs out from under the tiles that are still showing them.
  useEffect(() => {
    const cache = previewCache.current;
    return () => {
      cache.forEach((url) => URL.revokeObjectURL(url));
      cache.clear();
    };
  }, []);

  // A keyboard move rebuilds the grid, so re-focus the tile at its new index —
  // otherwise focus falls back to <body> and the next arrow key does nothing.
  useEffect(() => {
    if (pendingTileFocus.current === null) return;
    tileRefs.current[pendingTileFocus.current]?.focus();
    pendingTileFocus.current = null;
  }, [items]);

  /** Which tile is under this point, if any. */
  const tileIndexAtPoint = (clientX: number, clientY: number) => {
    for (let i = 0; i < tileRefs.current.length; i += 1) {
      const el = tileRefs.current[i];
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom
      ) {
        return i;
      }
    }
    return null;
  };

  const moveImage = (from: number, to: number) => {
    onItemsChange((prev) => moveItem(prev, from, to));
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragActive(true);
        }}
        onDragLeave={() => setIsDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragActive(false);
          addFiles(Array.from(e.dataTransfer.files ?? []));
        }}
        className={`rounded-2xl border-2 border-dashed p-4 transition-colors ${
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-slate-200 dark:border-slate-700"
        }`}
      >
        {items.length === 0 ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-3 rounded-xl py-14 text-center transition hover:bg-slate-50 dark:hover:bg-slate-800/40"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <span aria-hidden="true" className="material-symbols-outlined text-3xl">
                add_photo_alternate
              </span>
            </span>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Click to select photos, or drag &amp; drop them here
            </span>
            <span className="text-xs text-slate-400">
              PNG, JPG, JPEG, or WEBP — up to 50MB each
            </span>
          </button>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                {items.length} photo
                {items.length === 1 ? "" : "s"} · tap to edit, drag to reorder
              </p>
              <button
                type="button"
                onClick={() => onItemsChange([])}
                className="text-xs font-semibold text-rose-500 hover:underline"
              >
                Clear all
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {items.map((item, index) => {
                const isDragging = dragIndex === index;
                const name = item.original.name;
                const isEdited = !isDefaultEdits(item.edits);
                return (
                  <div
                    key={item.id}
                    ref={(el) => {
                      tileRefs.current[index] = el;
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`${name}, page ${index + 1} of ${items.length}${isEdited ? ", edited" : ""}. Press Enter to edit. Drag, or use arrow keys, to reorder.`}
                    // Pointer events rather than HTML5 drag-and-drop: this grid
                    // lives inside the file dropzone, and a native drag would
                    // trigger its onDragOver/onDrop. Pointer events also work
                    // on touch, which HTML5 drag does not.
                    onPointerDown={(e) => {
                      // Let the remove and edit buttons keep their own clicks.
                      if ((e.target as HTMLElement).closest("button")) return;
                      e.preventDefault();
                      e.currentTarget.setPointerCapture(e.pointerId);
                      pressRef.current = { x: e.clientX, y: e.clientY, moved: false };
                      setDragIndex(index);
                    }}
                    onPointerMove={(e) => {
                      if (dragIndex === null) return;
                      const press = pressRef.current;
                      if (press && !press.moved) {
                        // Below the slop it's still a tap — don't reorder yet.
                        if (Math.hypot(e.clientX - press.x, e.clientY - press.y) < TAP_SLOP) return;
                        press.moved = true;
                      }
                      const over = tileIndexAtPoint(e.clientX, e.clientY);
                      if (over !== null && over !== dragIndex) {
                        moveImage(dragIndex, over);
                        setDragIndex(over);
                      }
                    }}
                    onPointerUp={(e) => {
                      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
                        e.currentTarget.releasePointerCapture(e.pointerId);
                      }
                      const wasTap =
                        dragIndex === index && pressRef.current !== null && !pressRef.current.moved;
                      pressRef.current = null;
                      setDragIndex(null);
                      if (wasTap) openEditor(index);
                    }}
                    onPointerCancel={() => {
                      pressRef.current = null;
                      setDragIndex(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.target !== e.currentTarget) return;
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openEditor(index);
                      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                        if (index === 0) return;
                        e.preventDefault();
                        pendingTileFocus.current = index - 1;
                        moveImage(index, index - 1);
                      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                        if (index === items.length - 1) return;
                        e.preventDefault();
                        pendingTileFocus.current = index + 1;
                        moveImage(index, index + 1);
                      }
                    }}
                    // touch-none stops the browser scrolling the page when a
                    // drag starts on a tile.
                    className={`group relative aspect-square touch-none overflow-hidden rounded-xl border bg-slate-50 transition-[transform,box-shadow,opacity] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:bg-slate-800/50 ${
                      isDragging
                        ? "z-10 scale-105 cursor-grabbing border-primary opacity-90 shadow-lg ring-2 ring-primary"
                        : "cursor-grab border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {previewUrls[index] ? (
                      <Image
                        src={previewUrls[index]}
                        alt={name}
                        fill
                        unoptimized
                        draggable={false}
                        className="pointer-events-none select-none object-cover"
                      />
                    ) : null}
                    <span className="absolute left-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-[11px] font-bold text-white">
                      {index + 1}
                    </span>
                    {isEdited ? (
                      <span className="absolute left-8 top-1.5 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow">
                        Edited
                      </span>
                    ) : null}
                    <button
                      type="button"
                      onClick={() =>
                        onItemsChange((prev) => prev.filter((_, i) => i !== index))
                      }
                      className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100 hover:bg-rose-500"
                      aria-label={`Remove ${name}`}
                    >
                      <span aria-hidden="true" className="material-symbols-outlined text-sm">
                        close
                      </span>
                    </button>
                    <span aria-hidden="true" className="material-symbols-outlined pointer-events-none absolute inset-0 m-auto h-fit w-fit text-3xl text-white opacity-0 drop-shadow transition group-hover:opacity-70">
                      drag_indicator
                    </span>
                    <p className="pointer-events-none absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/70 to-transparent py-1 pl-1.5 pr-9 text-[10px] text-white">
                      {name}
                    </p>
                    <button
                      type="button"
                      onClick={() => openEditor(index)}
                      disabled={submitting}
                      className="absolute bottom-1 right-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-40"
                      aria-label={`Edit ${name}`}
                    >
                      <span aria-hidden="true" className="material-symbols-outlined text-base">
                        tune
                      </span>
                    </button>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-300 text-slate-400 transition hover:border-primary hover:text-primary dark:border-slate-600"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-2xl">
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
          ref={inputRef}
          type="file"
          multiple
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => {
            addFiles(Array.from(e.target.files ?? []));
            e.target.value = "";
          }}
          className="hidden"
        />
      </div>

      {editorSession ? (
        <ImageEditorModal
          items={editorSession.items}
          initialIndex={editorSession.index}
          thumbnailUrls={thumbnailUrls}
          onCancel={closeEditor}
          onDone={saveEditorSession}
        />
      ) : null}

      <button
        onClick={onConvert}
        // Not while the editor is open: its edits aren't saved until Done finishes.
        disabled={items.length === 0 || submitting || editorSession !== null}
        type="button"
        className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200 sm:w-auto
        ${
          items.length > 0
            ? "bg-primary text-white hover:opacity-90"
            : "border border-slate-300 text-slate-500 bg-transparent hover:bg-slate-50"
        }
      `}
      >
        <span aria-hidden="true" className="material-symbols-outlined text-base">
          bolt
        </span>
        {submitting
          ? "Converting..."
          : items.length > 0
            ? `Convert ${items.length} Photo${items.length === 1 ? "" : "s"} to PDF`
            : "Convert to PDF"}
      </button>
    </div>
  );
}
