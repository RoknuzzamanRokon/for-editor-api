import { clampAdjustment } from "./types";
import type { CropPreset, CropRect, ImageEdits, ImageFilter, Rotation } from "./types";

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
// Filters and adjustments (pure; operate on RGBA pixels in place)
// ---------------------------------------------------------------------------

/** Columns in the lighting map; rows follow the image's aspect ratio. */
const LIGHT_MAP_COLUMNS = 48;
/** Within each map cell, pixels at or above this luminance percentile are taken as "paper". */
const PAPER_PERCENTILE = 0.8;
/** Floor for a lighting estimate, so near-black areas never divide by ~0. */
const MIN_LIGHT = 24;
/**
 * Below this local paper brightness, brightening tapers off (to none at
 * black). Areas that dark are usually background, not paper, and boosting
 * them would mostly multiply sensor noise. Max gain is 255 / 48 ≈ 5.3×.
 */
const DARK_KNEE = 48;
/** Limit on per-channel colour correction, so near-black colourful areas don't swing wildly. */
const MAX_WHITE_BALANCE = 2;
const STRETCH_LOW_PERCENTILE = 0.02;
const STRETCH_HIGH_PERCENTILE = 0.98;
/** Most the level stretch may scale, so a nearly flat image isn't turned into noise. */
const MAX_STRETCH = 4;
/** How strongly the scan S-curve is blended in (0 = linear, 1 = full smoothstep). */
const SCAN_CONTRAST = 0.5;
const SHARPEN_AMOUNT = 0.45;
/** Detail smaller than this (in levels) is treated as noise and not sharpened. */
const SHARPEN_NOISE_FLOOR = 4;
const SHARPEN_MAX_DELTA = 40;
/** In B&W, a pixel darker than this fraction of its local paper brightness becomes black… */
const BW_THRESHOLD = 0.75;
/** …unless its 3×3 neighbourhood is this bright, i.e. it's an isolated noise speck. */
const BW_SPECK_THRESHOLD = 0.86;

/** How much to brighten a pixel whose local paper brightness is `light`. */
function lightGain(light: number): number {
  if (light >= DARK_KNEE) return 255 / light;
  return 1 + (255 / DARK_KNEE - 1) * (Math.max(0, light) / DARK_KNEE);
}

const clampByte = (value: number) => (value <= 0 ? 0 : value >= 255 ? 255 : Math.round(value));

/** Rec. 601 luma in integer math; 0–255. */
const luma = (r: number, g: number, b: number) => (r * 77 + g * 150 + b * 29) >> 8;

function lumaPlane(pixels: PixelBuffer): Uint8Array {
  const { data, width, height } = pixels;
  const plane = new Uint8Array(width * height);
  for (let p = 0, i = 0; p < plane.length; p += 1, i += 4) {
    plane[p] = luma(data[i], data[i + 1], data[i + 2]);
  }
  return plane;
}

/** 3×3 box blur of a single-channel plane (separable, edges clamped). */
function boxBlur3(plane: Uint8Array, width: number, height: number): Uint8Array {
  const horizontal = new Uint16Array(plane.length);
  for (let y = 0; y < height; y += 1) {
    const row = y * width;
    for (let x = 0; x < width; x += 1) {
      const left = plane[row + (x > 0 ? x - 1 : x)];
      const right = plane[row + (x < width - 1 ? x + 1 : x)];
      horizontal[row + x] = left + plane[row + x] + right;
    }
  }
  const out = new Uint8Array(plane.length);
  for (let y = 0; y < height; y += 1) {
    const above = (y > 0 ? y - 1 : y) * width;
    const row = y * width;
    const below = (y < height - 1 ? y + 1 : y) * width;
    for (let x = 0; x < width; x += 1) {
      out[row + x] = Math.round((horizontal[above + x] + horizontal[row + x] + horizontal[below + x]) / 9);
    }
  }
  return out;
}

/** Value at percentile `q` (0–1) of a 256-bin histogram holding `total` samples. */
function histogramPercentile(histogram: Uint32Array, total: number, q: number, offset = 0): number {
  const target = Math.max(1, Math.ceil(total * q));
  let seen = 0;
  for (let v = 0; v < 256; v += 1) {
    seen += histogram[offset + v];
    if (seen >= target) return v;
  }
  return 255;
}

/**
 * A coarse map of the local "paper" colour: the image is split into a grid
 * about 48 cells wide, and each cell records the mean colour of its brightest
 * parts. Text and other dark marks are ignored, so dividing by this map
 * cancels shadows and uneven light while keeping the ink dark.
 */
type LightingMap = {
  columns: number;
  rows: number;
  red: Float32Array;
  green: Float32Array;
  blue: Float32Array;
  luma: Float32Array;
};

/**
 * Small blocks (≈1/400 of the long side) are averaged before measuring. Picking
 * "the brightest pixels" from raw noisy pixels would overshoot the paper level
 * by over a standard deviation of the noise; averaging shrinks that by the
 * block size, and keeps preview and full-size renders measuring alike.
 */
const LIGHT_BLOCKS_PER_LONG_SIDE = 400;

function buildLightingMap(pixels: PixelBuffer): LightingMap {
  const { data, width, height } = pixels;
  const block = Math.max(1, Math.round(Math.max(width, height) / LIGHT_BLOCKS_PER_LONG_SIDE));
  const blocksX = Math.ceil(width / block);
  const blocksY = Math.ceil(height / block);
  const blockCount = blocksX * blocksY;

  // Block means of R, G, B.
  const blockSums = new Float32Array(blockCount * 3);
  const blockPixels = new Uint32Array(blockCount);
  for (let y = 0, i = 0; y < height; y += 1) {
    const blockRow = Math.floor(y / block) * blocksX;
    for (let x = 0; x < width; x += 1, i += 4) {
      const b = blockRow + Math.floor(x / block);
      blockSums[b * 3] += data[i];
      blockSums[b * 3 + 1] += data[i + 1];
      blockSums[b * 3 + 2] += data[i + 2];
      blockPixels[b] += 1;
    }
  }
  const blockLuma = new Uint8Array(blockCount);
  for (let b = 0; b < blockCount; b += 1) {
    const n = blockPixels[b];
    blockSums[b * 3] /= n;
    blockSums[b * 3 + 1] /= n;
    blockSums[b * 3 + 2] /= n;
    blockLuma[b] = luma(blockSums[b * 3], blockSums[b * 3 + 1], blockSums[b * 3 + 2]);
  }

  const columns = Math.max(1, Math.min(LIGHT_MAP_COLUMNS, blocksX));
  const rows = Math.max(1, Math.min(blocksY, Math.round((blocksY * columns) / blocksX)));
  const cells = columns * rows;
  const cellOfBlock = new Int32Array(blockCount);
  for (let by = 0; by < blocksY; by += 1) {
    const cellRow = Math.min(rows - 1, Math.floor((by * rows) / blocksY)) * columns;
    for (let bx = 0; bx < blocksX; bx += 1) {
      cellOfBlock[by * blocksX + bx] = cellRow + Math.min(columns - 1, Math.floor((bx * columns) / blocksX));
    }
  }

  // Pass 1: luminance histogram per cell → each cell's paper threshold.
  const histograms = new Uint32Array(cells * 256);
  const counts = new Uint32Array(cells);
  for (let b = 0; b < blockCount; b += 1) {
    histograms[cellOfBlock[b] * 256 + blockLuma[b]] += 1;
    counts[cellOfBlock[b]] += 1;
  }
  const thresholds = new Uint8Array(cells);
  for (let cell = 0; cell < cells; cell += 1) {
    thresholds[cell] = histogramPercentile(histograms, counts[cell], PAPER_PERCENTILE, cell * 256);
  }

  // Pass 2: mean colour of the paper blocks in each cell.
  const sums = new Float64Array(cells * 4);
  const paperCounts = new Uint32Array(cells);
  for (let b = 0; b < blockCount; b += 1) {
    const cell = cellOfBlock[b];
    if (blockLuma[b] < thresholds[cell]) continue;
    sums[cell * 4] += blockSums[b * 3];
    sums[cell * 4 + 1] += blockSums[b * 3 + 1];
    sums[cell * 4 + 2] += blockSums[b * 3 + 2];
    sums[cell * 4 + 3] += blockLuma[b];
    paperCounts[cell] += 1;
  }
  const raw = new Float32Array(cells * 4);
  for (let cell = 0; cell < cells; cell += 1) {
    // Every cell has at least one block at its own threshold, so n ≥ 1.
    const n = Math.max(1, paperCounts[cell]);
    for (let c = 0; c < 4; c += 1) raw[cell * 4 + c] = sums[cell * 4 + c] / n;
  }

  // Dilate: each cell takes its brightest neighbour, so a dark block bigger
  // than a cell (a logo, a photo) is still measured against nearby paper.
  const dilated = new Float32Array(cells * 4);
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < columns; c += 1) {
      let best = r * columns + c;
      for (let dr = -1; dr <= 1; dr += 1) {
        const rr = r + dr;
        if (rr < 0 || rr >= rows) continue;
        for (let dc = -1; dc <= 1; dc += 1) {
          const cc = c + dc;
          if (cc < 0 || cc >= columns) continue;
          const candidate = rr * columns + cc;
          if (raw[candidate * 4 + 3] > raw[best * 4 + 3]) best = candidate;
        }
      }
      dilated.set(raw.subarray(best * 4, best * 4 + 4), (r * columns + c) * 4);
    }
  }

  // Smooth twice with a 3×3 box so the lighting varies gradually.
  let smooth = dilated;
  for (let pass = 0; pass < 2; pass += 1) {
    const next = new Float32Array(cells * 4);
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < columns; c += 1) {
        const total = [0, 0, 0, 0];
        let n = 0;
        for (let dr = -1; dr <= 1; dr += 1) {
          const rr = Math.min(rows - 1, Math.max(0, r + dr));
          for (let dc = -1; dc <= 1; dc += 1) {
            const cc = Math.min(columns - 1, Math.max(0, c + dc));
            const at = (rr * columns + cc) * 4;
            for (let k = 0; k < 4; k += 1) total[k] += smooth[at + k];
            n += 1;
          }
        }
        for (let k = 0; k < 4; k += 1) next[(r * columns + c) * 4 + k] = total[k] / n;
      }
    }
    smooth = next;
  }

  const red = new Float32Array(cells);
  const green = new Float32Array(cells);
  const blue = new Float32Array(cells);
  const lumaMap = new Float32Array(cells);
  for (let cell = 0; cell < cells; cell += 1) {
    red[cell] = smooth[cell * 4];
    green[cell] = smooth[cell * 4 + 1];
    blue[cell] = smooth[cell * 4 + 2];
    lumaMap[cell] = smooth[cell * 4 + 3];
  }
  return { columns, rows, red, green, blue, luma: lumaMap };
}

/** Bilinear lookup positions from pixel coordinates to map-cell centres along one axis. */
function cellLerp(length: number, cells: number) {
  const lower = new Int32Array(length);
  const upper = new Int32Array(length);
  const weight = new Float32Array(length);
  for (let i = 0; i < length; i += 1) {
    const f = Math.min(cells - 1, Math.max(0, ((i + 0.5) * cells) / length - 0.5));
    lower[i] = Math.floor(f);
    upper[i] = Math.min(cells - 1, lower[i] + 1);
    weight[i] = f - lower[i];
  }
  return { lower, upper, weight };
}

/**
 * Walks every pixel with the lighting map interpolated at that pixel.
 * `visit(i, red, green, blue, luma)` gets the pixel's data offset and the
 * local paper colour.
 */
function forEachWithLighting(
  pixels: PixelBuffer,
  map: LightingMap,
  visit: (i: number, red: number, green: number, blue: number, luma: number) => void,
) {
  const { width, height } = pixels;
  const xs = cellLerp(width, map.columns);
  const ys = cellLerp(height, map.rows);
  const planes = [map.red, map.green, map.blue, map.luma];
  const row = planes.map(() => new Float32Array(map.columns));
  for (let y = 0; y < height; y += 1) {
    const top = ys.lower[y] * map.columns;
    const bottom = ys.upper[y] * map.columns;
    const t = ys.weight[y];
    for (let k = 0; k < 4; k += 1) {
      const plane = planes[k];
      const out = row[k];
      for (let c = 0; c < map.columns; c += 1) {
        out[c] = plane[top + c] + (plane[bottom + c] - plane[top + c]) * t;
      }
    }
    for (let x = 0, i = y * width * 4; x < width; x += 1, i += 4) {
      const c0 = xs.lower[x];
      const c1 = xs.upper[x];
      const s = xs.weight[x];
      visit(
        i,
        row[0][c0] + (row[0][c1] - row[0][c0]) * s,
        row[1][c0] + (row[1][c1] - row[1][c0]) * s,
        row[2][c0] + (row[2][c1] - row[2][c0]) * s,
        row[3][c0] + (row[3][c1] - row[3][c0]) * s,
      );
    }
  }
}

function toGrayscale(pixels: PixelBuffer) {
  const { data } = pixels;
  for (let i = 0; i < data.length; i += 4) {
    const l = luma(data[i], data[i + 1], data[i + 2]);
    data[i] = l;
    data[i + 1] = l;
    data[i + 2] = l;
  }
}

/** Document scan: even out the lighting, stretch the levels, add contrast, sharpen. */
function scanDocument(pixels: PixelBuffer) {
  const { data, width, height } = pixels;
  const map = buildLightingMap(pixels);

  // 1–2. Divide each channel by the local paper colour: paper → white,
  //      shadows lifted, a colour cast on the paper neutralised.
  const histogram = new Uint32Array(256);
  forEachWithLighting(pixels, map, (i, red, green, blue, light) => {
    // Brightness and colour are corrected separately: the paper's luminance
    // sets how much to brighten (tapered in the dark), and each channel is
    // scaled toward that luminance so a tinted paper comes out neutral.
    const gain = lightGain(light);
    const balance = (paper: number) =>
      Math.min(MAX_WHITE_BALANCE, Math.max(1 / MAX_WHITE_BALANCE, light / Math.max(1, paper)));
    const r = clampByte(data[i] * gain * balance(red));
    const g = clampByte(data[i + 1] * gain * balance(green));
    const b = clampByte(data[i + 2] * gain * balance(blue));
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
    histogram[luma(r, g, b)] += 1;
  });

  // 3. Stretch levels between robust low/high percentiles, and 4. apply a
  //    moderate S-curve — both folded into one lookup table.
  const total = width * height;
  const low = histogramPercentile(histogram, total, STRETCH_LOW_PERCENTILE);
  const high = histogramPercentile(histogram, total, STRETCH_HIGH_PERCENTILE);
  const range = Math.max(1, high - low);
  const scale = Math.min(MAX_STRETCH, 255 / range);
  // A capped stretch can't reach both ends; keep a low-contrast image centred
  // instead of pushing it all to black or white.
  const anchor = range * scale >= 255 ? low : (low + high) / 2;
  const anchorTo = range * scale >= 255 ? 0 : (low + high) / 2;
  const table = new Uint8Array(256);
  for (let v = 0; v < 256; v += 1) {
    const stretched = Math.min(1, Math.max(0, ((v - anchor) * scale + anchorTo) / 255));
    const curved = stretched * stretched * (3 - 2 * stretched);
    table[v] = clampByte((stretched + (curved - stretched) * SCAN_CONTRAST) * 255);
  }
  for (let i = 0; i < data.length; i += 4) {
    data[i] = table[data[i]];
    data[i + 1] = table[data[i + 1]];
    data[i + 2] = table[data[i + 2]];
  }

  // 4. Restrained unsharp mask on luminance only (no colour fringes); small
  //    differences are left alone so sensor noise isn't amplified.
  const plane = lumaPlane(pixels);
  const blurred = boxBlur3(plane, width, height);
  for (let p = 0, i = 0; p < plane.length; p += 1, i += 4) {
    const detail = plane[p] - blurred[p];
    if (detail > -SHARPEN_NOISE_FLOOR && detail < SHARPEN_NOISE_FLOOR) continue;
    const delta = Math.max(-SHARPEN_MAX_DELTA, Math.min(SHARPEN_MAX_DELTA, detail * SHARPEN_AMOUNT));
    data[i] = clampByte(data[i] + delta);
    data[i + 1] = clampByte(data[i + 1] + delta);
    data[i + 2] = clampByte(data[i + 2] + delta);
  }
}

/** Black & white: threshold each pixel against its local paper brightness. */
function blackAndWhite(pixels: PixelBuffer) {
  const { data, width, height } = pixels;
  const map = buildLightingMap(pixels);
  const plane = lumaPlane(pixels);
  // Thresholding the blurred plane alone would thicken every stroke by a
  // pixel; it's only used to drop lone dark specks of sensor noise.
  const neighbourhood = boxBlur3(plane, width, height);
  forEachWithLighting(pixels, map, (i, _red, _green, _blue, light) => {
    const paper = Math.max(MIN_LIGHT, light);
    const p = i >> 2;
    const isInk = plane[p] / paper < BW_THRESHOLD && neighbourhood[p] / paper < BW_SPECK_THRESHOLD;
    const value = isInk ? 0 : 255;
    data[i] = value;
    data[i + 1] = value;
    data[i + 2] = value;
  });
}

/**
 * Applies a filter to RGBA pixels in place and returns them. Deterministic;
 * alpha is left untouched. "none" is a no-op.
 */
export function applyScanFilter<T extends PixelBuffer>(imageData: T, mode: ImageFilter): T {
  if (imageData.width <= 0 || imageData.height <= 0) return imageData;
  switch (mode) {
    case "scan":
      scanDocument(imageData);
      break;
    case "grayscale":
      toGrayscale(imageData);
      break;
    case "bw":
      blackAndWhite(imageData);
      break;
    default:
      break;
  }
  return imageData;
}

/**
 * Brightness and contrast, each -100..100 (values outside are clamped).
 * Brightness shifts levels by up to ±128; contrast scales around mid-grey from
 * flat (-100) through unchanged (0) to 3× (100).
 */
export function applyToneAdjustments<T extends PixelBuffer>(
  pixels: T,
  brightness: number,
  contrast: number,
): T {
  const b = clampAdjustment(brightness);
  const c = clampAdjustment(contrast);
  if (b === 0 && c === 0) return pixels;
  const factor = c >= 0 ? 1 + (2 * c) / 100 : 1 + c / 100;
  const offset = (b / 100) * 128;
  const table = new Uint8Array(256);
  for (let v = 0; v < 256; v += 1) table[v] = clampByte((v - 128) * factor + 128 + offset);
  const { data } = pixels;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = table[data[i]];
    data[i + 1] = table[data[i + 1]];
    data[i + 2] = table[data[i + 2]];
  }
  return pixels;
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
export function applyPixelEdits<T extends PixelBuffer>(pixels: T, edits: ImageEdits): T {
  applyScanFilter(pixels, edits.filter);
  return applyToneAdjustments(pixels, edits.brightness, edits.contrast);
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
