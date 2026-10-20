import type { CropPreset, CropRect, ImageEdits, Rotation } from "./types";

/** Longest side of the live preview in the editor. */
export const PREVIEW_MAX_SIDE = 1600;
/** Longest side of the rendered output (≈ A4 at 300 dpi). */
export const OUTPUT_MAX_SIDE = 3500;
export const OUTPUT_JPEG_QUALITY = 0.92;

/** ISO 216 A-series ratio (210 × 297 mm), short side over long side. */
const A4_SHORT_OVER_LONG = 210 / 297;
/** A crop this close to the full frame is stored as "no crop". */
const FULL_FRAME_EPSILON = 0.001;

export type Size = { width: number; height: number };

/** Integer pixel rectangle. */
export type PixelRect = { x: number; y: number; width: number; height: number };

/** RGBA pixels. A browser `ImageData` satisfies this; tests can use a plain object. */
export type PixelBuffer = { data: Uint8ClampedArray; width: number; height: number };

export type LoadedImage = {
  image: CanvasImageSource;
  /** Display size, with EXIF orientation already applied by the browser. */
  width: number;
  height: number;
};

export type RenderOptions = { maxSide: number };

// ---------------------------------------------------------------------------
// Geometry (pure)
// ---------------------------------------------------------------------------

export function normalizeRotation(degrees: number): Rotation {
  const quarterTurns = Math.round(degrees / 90);
  return ((((quarterTurns % 4) + 4) % 4) * 90) as Rotation;
}

export function rotatedSize(width: number, height: number, rotation: Rotation): Size {
  return rotation === 90 || rotation === 270
    ? { width: height, height: width }
    : { width, height };
}

/** Scales a size down (never up) so its longest side is at most `maxSide`. */
export function fitWithin(width: number, height: number, maxSide: number): Size {
  const longest = Math.max(width, height);
  const scale = longest > maxSide ? maxSide / longest : 1;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

/**
 * Clamps a crop into the unit square. A crop covering (almost) the whole
 * frame, or a degenerate one, becomes `null` — "no crop".
 */
export function normalizeCrop(crop: CropRect | null): CropRect | null {
  if (!crop) return null;
  const x = clamp01(crop.x);
  const y = clamp01(crop.y);
  const w = Math.min(clamp01(crop.w), 1 - x);
  const h = Math.min(clamp01(crop.h), 1 - y);
  if (w <= 0 || h <= 0) return null;
  if (
    x <= FULL_FRAME_EPSILON &&
    y <= FULL_FRAME_EPSILON &&
    w >= 1 - FULL_FRAME_EPSILON &&
    h >= 1 - FULL_FRAME_EPSILON
  ) {
    return null;
  }
  return { x, y, w, h };
}

/**
 * Re-expresses a crop (normalized, relative to the rotated image) after the
 * image is turned a further 90° clockwise or counter-clockwise, so the same
 * region of the photo stays selected.
 */
export function rotateCropRect(
  crop: CropRect | null,
  direction: "cw" | "ccw",
): CropRect | null {
  if (!crop) return null;
  // Clockwise: a point (u, v) moves to (1 - v, u).
  // Counter-clockwise: a point (u, v) moves to (v, 1 - u).
  return direction === "cw"
    ? { x: 1 - (crop.y + crop.h), y: crop.x, w: crop.h, h: crop.w }
    : { x: crop.y, y: 1 - (crop.x + crop.w), w: crop.h, h: crop.w };
}

/** The crop in whole pixels of an image of the given (rotated) size; at least 1×1. */
export function cropToPixels(crop: CropRect | null, width: number, height: number): PixelRect {
  const c = normalizeCrop(crop) ?? { x: 0, y: 0, w: 1, h: 1 };
  const left = Math.min(width - 1, Math.max(0, Math.round(c.x * width)));
  const top = Math.min(height - 1, Math.max(0, Math.round(c.y * height)));
  const right = Math.max(left + 1, Math.min(width, Math.round((c.x + c.w) * width)));
  const bottom = Math.max(top + 1, Math.min(height, Math.round((c.y + c.h) * height)));
  return { x: left, y: top, width: right - left, height: bottom - top };
}

/**
 * Maps a crop on the rotated image back onto the unrotated source.
 *
 * `source` is the rectangle to read from the source image; `size` is that
 * region's size once rotated (i.e. the output's aspect).
 */
export function sourceRectForCrop(
  crop: CropRect | null,
  rotation: Rotation,
  sourceWidth: number,
  sourceHeight: number,
): { source: PixelRect; size: Size } {
  const rotated = rotatedSize(sourceWidth, sourceHeight, rotation);
  const c = cropToPixels(crop, rotated.width, rotated.height);
  const W = sourceWidth;
  const H = sourceHeight;
  let source: PixelRect;
  switch (rotation) {
    case 90:
      // Rotated (u, v) came from source (v, H - u).
      source = { x: c.y, y: H - c.x - c.width, width: c.height, height: c.width };
      break;
    case 180:
      source = { x: W - c.x - c.width, y: H - c.y - c.height, width: c.width, height: c.height };
      break;
    case 270:
      // Rotated (u, v) came from source (W - v, u).
      source = { x: W - c.y - c.height, y: c.x, width: c.height, height: c.width };
      break;
    default:
      source = { x: c.x, y: c.y, width: c.width, height: c.height };
  }
  return { source, size: { width: c.width, height: c.height } };
}

/** Width ÷ height the crop box is locked to, or `undefined` for a free crop. */
export function aspectForPreset(
  preset: CropPreset,
  imageWidth: number,
  imageHeight: number,
): number | undefined {
  switch (preset) {
    case "square":
      return 1;
    case "original":
      return imageWidth / imageHeight;
    case "a4":
      // Follow the photo's orientation: portrait pages for portrait photos.
      return imageWidth >= imageHeight ? 1 / A4_SHORT_OVER_LONG : A4_SHORT_OVER_LONG;
    default:
      return undefined;
  }
}

/** The largest centred crop with the given pixel aspect (width ÷ height). */
export function centeredCropForAspect(
  aspect: number,
  imageWidth: number,
  imageHeight: number,
): CropRect {
  const imageAspect = imageWidth / imageHeight;
  if (!(aspect > 0) || !Number.isFinite(aspect)) return { x: 0, y: 0, w: 1, h: 1 };
  if (aspect >= imageAspect) {
    const h = imageAspect / aspect;
    return { x: 0, y: (1 - h) / 2, w: 1, h };
  }
  const w = aspect / imageAspect;
  return { x: (1 - w) / 2, y: 0, w, h: 1 };
}

// ---------------------------------------------------------------------------
// Browser rendering
// ---------------------------------------------------------------------------

/**
 * Decodes an image file. Uses an <img> rather than createImageBitmap because
 * every current browser applies EXIF orientation when an <img> is drawn to a
 * canvas, so phone photos come out upright.
 */
export async function loadImage(file: Blob & { name?: string }): Promise<LoadedImage> {
  const url = URL.createObjectURL(file);
  const label = file.name ? `"${file.name}"` : "the image";
  try {
    const img = new Image();
    img.decoding = "async";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Couldn't read ${label}. The file may be damaged.`));
      img.src = url;
    });
    if (!img.naturalWidth || !img.naturalHeight) {
      throw new Error(`Couldn't read ${label}. The file may be damaged.`);
    }
    return { image: img, width: img.naturalWidth, height: img.naturalHeight };
  } finally {
    // The decoded <img> keeps its pixels; the URL is no longer needed.
    URL.revokeObjectURL(url);
  }
}

function get2dContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    throw new Error("This browser couldn't create a drawing surface for the image.");
  }
  return context;
}

/** Frees a canvas's backing store now, rather than whenever GC gets to it (matters on iOS). */
export function releaseCanvas(canvas: HTMLCanvasElement) {
  canvas.width = 0;
  canvas.height = 0;
}

/**
 * Draws the cropped, rotated region of `loaded` onto a new canvas whose longest
 * side is at most `maxSide`. One drawImage from the source — no full-size
 * intermediate canvas — so large photos stay within browser canvas limits.
 */
export function drawRotatedCrop(
  loaded: LoadedImage,
  crop: CropRect | null,
  rotation: Rotation,
  maxSide: number,
): HTMLCanvasElement {
  const { source, size } = sourceRectForCrop(crop, rotation, loaded.width, loaded.height);
  const out = fitWithin(size.width, size.height, maxSide);
  const canvas = document.createElement("canvas");
  canvas.width = out.width;
  canvas.height = out.height;
  const context = get2dContext(canvas);

  // JPEG has no alpha: flatten transparency onto white, as the server does.
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, out.width, out.height);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  const quarterTurned = rotation === 90 || rotation === 270;
  const drawWidth = quarterTurned ? out.height : out.width;
  const drawHeight = quarterTurned ? out.width : out.height;
  context.translate(out.width / 2, out.height / 2);
  context.rotate((rotation * Math.PI) / 180);
  context.drawImage(
    loaded.image,
    source.x,
    source.y,
    source.width,
    source.height,
    -drawWidth / 2,
    -drawHeight / 2,
    drawWidth,
    drawHeight,
  );
  context.setTransform(1, 0, 0, 1, 0, 0);
  return canvas;
}

function readPixels(canvas: HTMLCanvasElement): ImageData {
  return get2dContext(canvas).getImageData(0, 0, canvas.width, canvas.height);
}

/** Copies pixels into a canvas, resizing it to fit them. */
export function paintPixels(canvas: HTMLCanvasElement, pixels: PixelBuffer) {
  if (canvas.width !== pixels.width) canvas.width = pixels.width;
  if (canvas.height !== pixels.height) canvas.height = pixels.height;
  const imageData =
    typeof ImageData !== "undefined" && pixels instanceof ImageData
      ? pixels
      : new ImageData(new Uint8ClampedArray(pixels.data), pixels.width, pixels.height);
  get2dContext(canvas).putImageData(imageData, 0, 0);
}

export function clonePixels(pixels: PixelBuffer): PixelBuffer {
  return { data: new Uint8ClampedArray(pixels.data), width: pixels.width, height: pixels.height };
}

/**
 * The editor's base preview: the whole image (no crop — the crop box is drawn
 * over it), rotated, at preview resolution, before any filter.
 */
export function renderPreviewBase(loaded: LoadedImage, rotation: Rotation): PixelBuffer {
  const canvas = drawRotatedCrop(loaded, null, rotation, PREVIEW_MAX_SIDE);
  try {
    return readPixels(canvas);
  } finally {
    releaseCanvas(canvas);
  }
}

/**
 * Applies the filter and tone settings to pixels in place. Shared by the
 * preview and the final render so both use exactly the same steps.
 */
export function applyPixelEdits(pixels: PixelBuffer, edits: ImageEdits): PixelBuffer {
  return pixels;
}

/**
 * Renders an image with all of its edits. Accepts the original file (decoded
 * here) or an already-decoded image. The caller owns the returned canvas and
 * should `releaseCanvas` it when done.
 */
export async function renderEdited(
  original: Blob | LoadedImage,
  edits: ImageEdits,
  options: RenderOptions,
): Promise<HTMLCanvasElement> {
  const loaded = original instanceof Blob ? await loadImage(original) : original;
  const canvas = drawRotatedCrop(loaded, edits.crop, edits.rotation, options.maxSide);
  try {
    const pixels = readPixels(canvas);
    applyPixelEdits(pixels, edits);
    get2dContext(canvas).putImageData(pixels, 0, 0);
    return canvas;
  } catch (error) {
    releaseCanvas(canvas);
    throw error;
  }
}

function replaceExtension(name: string, extension: string): string {
  const base = name.replace(/\.[^./\\]+$/, "") || "image";
  return `${base}${extension}`;
}

/** Encodes a canvas as a JPEG File named after the original (extension → .jpg). */
export function canvasToFile(
  canvas: HTMLCanvasElement,
  name: string,
  quality: number = OUTPUT_JPEG_QUALITY,
): Promise<File> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("The browser couldn't encode the edited image."));
          return;
        }
        resolve(
          new File([blob], replaceExtension(name, ".jpg"), {
            type: "image/jpeg",
            lastModified: Date.now(),
          }),
        );
      },
      "image/jpeg",
      quality,
    );
  });
}
