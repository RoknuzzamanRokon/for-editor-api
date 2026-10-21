"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/** Same bounds as the backend's MIN_TARGET_KB / MAX_TARGET_KB. */
export const MIN_TARGET_KB = 10;
export const MAX_TARGET_KB = 50 * 1024;

/** Sizes offered in one click; upload portals usually ask for one of these. */
export const TARGET_SIZE_PRESETS_KB = [50, 100, 200, 300, 500, 1024, 2048];

/** Space (px) kept between the flyout and the trigger, and from the window edges. */
const GAP = 8;
const MIN_PANEL_WIDTH = 288;

export function formatTargetSize(kb: number) {
  return kb >= 1024 ? `${Number((kb / 1024).toFixed(2))} MB` : `${kb} KB`;
}

type TargetSizeFlyoutProps = {
  /** Target in KB as a string, or "" for the recommended compression. */
  value: string;
  onChange: (value: string) => void;
  /** Size of the chosen file in bytes; presets it already fits under are disabled. */
  fileSize?: number;
};

const optionClass = (selected: boolean) =>
  `flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${
    selected
      ? "bg-primary/10 font-bold text-primary"
      : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
  }`;

/**
 * A "Target size" button that opens a flyout of preset sizes plus a custom
 * size. The flyout is portalled to <body> because the App Center cards clip
 * their overflow.
 */
export default function TargetSizeFlyout({ value, onChange, fileSize }: TargetSizeFlyoutProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [customUnit, setCustomUnit] = useState<"KB" | "MB">("KB");
  const [customError, setCustomError] = useState("");
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const panelId = useId();

  const selectedKb = value ? Number(value) : null;
  const isCustom = selectedKb !== null && !TARGET_SIZE_PRESETS_KB.includes(selectedKb);

  const close = (returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  };

  // Pin the flyout under the trigger (or above it when there's no room below).
  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      const width = Math.min(Math.max(rect.width, MIN_PANEL_WIDTH), window.innerWidth - 2 * GAP);
      const height = panelRef.current?.offsetHeight ?? 0;
      const below = rect.bottom + GAP;
      const above = rect.top - GAP - height;
      const top = below + height > window.innerHeight - GAP && above >= GAP ? above : below;
      const left = Math.min(Math.max(rect.left, GAP), window.innerWidth - width - GAP);
      setPosition({ top, left, width });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
      setPosition(null);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    panelRef.current
      ?.querySelector<HTMLButtonElement>('[aria-pressed="true"]')
      ?.focus({ preventScroll: true });

    const closeOnOutsidePress = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!triggerRef.current?.contains(target) && !panelRef.current?.contains(target)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", closeOnOutsidePress);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePress);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const choose = (next: string) => {
    onChange(next);
    setCustomError("");
    close(true);
  };

  const applyCustom = () => {
    const amount = Number(customAmount);
    const kb = Math.round(customUnit === "MB" ? amount * 1024 : amount);
    if (!customAmount.trim() || !Number.isFinite(amount) || kb < MIN_TARGET_KB || kb > MAX_TARGET_KB) {
      setCustomError(`Enter a size from ${MIN_TARGET_KB} KB to ${formatTargetSize(MAX_TARGET_KB)}.`);
      return;
    }
    choose(String(kb));
  };

  const panel = (
    <div
      ref={panelRef}
      id={panelId}
      role="dialog"
      aria-label="Target size"
      // Until measured, park it at the top-left; it's placed before the first paint.
      style={position ?? { top: 0, left: 0, width: MIN_PANEL_WIDTH }}
      onBlur={(event) => {
        // Tabbing out of the flyout closes it, like clicking outside does.
        const next = event.relatedTarget as Node | null;
        if (next && !panelRef.current?.contains(next) && !triggerRef.current?.contains(next)) close(false);
      }}
      className="fixed z-50 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900"
    >
      <div className="flex items-baseline justify-between px-3 pb-2 pt-1">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Target size</p>
        {fileSize ? (
          <p className="text-xs text-slate-500">Your file: {formatTargetSize(Math.ceil(fileSize / 1024))}</p>
        ) : null}
      </div>

      <button
        type="button"
        aria-pressed={selectedKb === null}
        onClick={() => choose("")}
        className={optionClass(selectedKb === null)}
      >
        <span>Recommended</span>
        <span className="text-xs font-normal text-slate-500">good quality</span>
      </button>

      <div className="my-1 grid grid-cols-2 gap-1">
        {TARGET_SIZE_PRESETS_KB.map((kb) => {
          const alreadyFits = fileSize !== undefined && fileSize <= kb * 1024;
          return (
            <button
              key={kb}
              type="button"
              aria-pressed={selectedKb === kb}
              disabled={alreadyFits}
              title={alreadyFits ? "Your file is already smaller than this" : undefined}
              onClick={() => choose(String(kb))}
              className={optionClass(selectedKb === kb)}
            >
              Under {formatTargetSize(kb)}
            </button>
          );
        })}
      </div>

      <div className="border-t border-slate-100 px-3 pb-1 pt-3 dark:border-slate-800">
        <label
          htmlFor={`${panelId}-custom`}
          className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500"
        >
          Custom size{isCustom && selectedKb ? ` (now ${formatTargetSize(selectedKb)})` : ""}
        </label>
        <div className="flex gap-2">
          <input
            id={`${panelId}-custom`}
            type="number"
            inputMode="decimal"
            min={0}
            step="any"
            value={customAmount}
            onChange={(e) => {
              setCustomAmount(e.target.value);
              setCustomError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") applyCustom();
            }}
            placeholder="e.g. 150"
            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none dark:border-slate-700 dark:bg-slate-900"
          />
          <select
            aria-label="Unit"
            value={customUnit}
            onChange={(e) => setCustomUnit(e.target.value as "KB" | "MB")}
            className="rounded-xl border border-slate-200 bg-white px-2 py-2 text-sm outline-none dark:border-slate-700 dark:bg-slate-900"
          >
            <option value="KB">KB</option>
            <option value="MB">MB</option>
          </select>
          <button
            type="button"
            onClick={applyCustom}
            className="rounded-xl bg-primary px-3 py-2 text-sm font-bold text-white hover:opacity-90"
          >
            Set
          </button>
        </div>
        {customError ? (
          <p role="alert" className="mt-1 text-xs text-rose-600 dark:text-rose-400">
            {customError}
          </p>
        ) : null}
      </div>
    </div>
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`Target size: ${selectedKb ? `under ${formatTargetSize(selectedKb)}` : "recommended"}`}
        aria-controls={open ? panelId : undefined}
        onClick={() => (open ? close(false) : setOpen(true))}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3 text-left text-sm outline-none transition hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/40 dark:border-slate-700 dark:bg-slate-900"
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className="material-symbols-outlined text-base text-primary" aria-hidden="true">
            compress
          </span>
          <span className="truncate font-semibold text-slate-800 dark:text-slate-100">
            {selectedKb ? `Under ${formatTargetSize(selectedKb)}` : "Recommended"}
          </span>
        </span>
        <span className="material-symbols-outlined text-base text-slate-400" aria-hidden="true">
          {open ? "expand_less" : "expand_more"}
        </span>
      </button>
      {open ? createPortal(panel, document.body) : null}
    </>
  );
}
