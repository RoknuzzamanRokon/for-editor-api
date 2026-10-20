/** A crop rectangle normalized to 0–1, relative to the *rotated* image. */
export type CropRect = { x: number; y: number; w: number; h: number };

export type Rotation = 0 | 90 | 180 | 270;

export type ImageFilter = "none" | "scan" | "grayscale" | "bw";

export type ImageEdits = {
  crop: CropRect | null;
  rotation: Rotation;
  filter: ImageFilter;
  /** -100..100 */
  brightness: number;
  /** -100..100 */
  contrast: number;
};

export type ImageItem = {
  id: string;
  /** The file the user picked. Never modified — every render starts from it. */
  original: File;
  edits: ImageEdits;
  /** What gets uploaded: `original` when there are no edits, else the rendered JPEG. */
  output: File;
};

export type CropPreset = "free" | "a4" | "square" | "original";

export const DEFAULT_EDITS: ImageEdits = Object.freeze({
  crop: null,
  rotation: 0,
  filter: "none",
  brightness: 0,
  contrast: 0,
}) as ImageEdits;

export const ADJUSTMENT_MIN = -100;
export const ADJUSTMENT_MAX = 100;

let nextImageItemId = 0;

export function createImageItem(file: File): ImageItem {
  nextImageItemId += 1;
  return {
    // Not crypto.randomUUID(): it only exists in secure contexts, and the app
    // is also served over plain http on a LAN address.
    id: `img-${Date.now().toString(36)}-${nextImageItemId}`,
    original: file,
    edits: DEFAULT_EDITS,
    output: file,
  };
}

function sameCrop(a: CropRect | null, b: CropRect | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.x === b.x && a.y === b.y && a.w === b.w && a.h === b.h;
}

export function editsEqual(a: ImageEdits, b: ImageEdits): boolean {
  return (
    a === b ||
    (sameCrop(a.crop, b.crop) &&
      a.rotation === b.rotation &&
      a.filter === b.filter &&
      a.brightness === b.brightness &&
      a.contrast === b.contrast)
  );
}

export function isDefaultEdits(edits: ImageEdits): boolean {
  return editsEqual(edits, DEFAULT_EDITS);
}

/** True when the filter/tone settings (not crop or rotation) differ from the defaults. */
export function hasToneEdits(edits: ImageEdits): boolean {
  return edits.filter !== "none" || edits.brightness !== 0 || edits.contrast !== 0;
}

export function clampAdjustment(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(ADJUSTMENT_MIN, Math.min(ADJUSTMENT_MAX, Math.round(value)));
}
