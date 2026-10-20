// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  applyPixelEdits,
  applyScanFilter,
  applyToneAdjustments,
  clonePixels,
  type PixelBuffer,
} from "../imageProcessing";
import { DEFAULT_EDITS, type ImageFilter } from "../types";

function solid(width: number, height: number, rgb: [number, number, number]): PixelBuffer {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = rgb[0];
    data[i + 1] = rgb[1];
    data[i + 2] = rgb[2];
    data[i + 3] = 255;
  }
  return { data, width, height };
}

/**
 * A page photographed in bad light: paper brightness falls from 200 on the
 * right to 50 on the left, with dark "ink" stripes every 12 px, a slight warm
 * cast and deterministic noise.
 */
function unevenlyLitPage(width = 240, height = 160) {
  const pixels = solid(width, height, [0, 0, 0]);
  const ink = new Uint8Array(width * height);
  let seed = 1;
  const noise = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return (seed % 9) - 4;
  };
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const light = 50 + (150 * x) / (width - 1);
      const isInk = y % 12 < 3 && x % 40 > 4;
      const reflectance = isInk ? 0.2 : 1;
      const i = (y * width + x) * 4;
      pixels.data[i] = light * reflectance + noise();
      pixels.data[i + 1] = light * reflectance * 0.95 + noise();
      pixels.data[i + 2] = light * reflectance * 0.82 + noise();
      ink[y * width + x] = isInk ? 1 : 0;
    }
  }
  return { pixels, ink };
}

const lumaAt = (p: PixelBuffer, x: number, y: number) => {
  const i = (y * p.width + x) * 4;
  return 0.299 * p.data[i] + 0.587 * p.data[i + 1] + 0.114 * p.data[i + 2];
};

/** Mean luma of paper (or ink) pixels within a column band. */
function bandMean(p: PixelBuffer, ink: Uint8Array, wantInk: boolean, x0: number, x1: number) {
  let sum = 0;
  let n = 0;
  for (let y = 0; y < p.height; y += 1) {
    for (let x = x0; x < x1; x += 1) {
      if (ink[y * p.width + x] === (wantInk ? 1 : 0)) {
        sum += lumaAt(p, x, y);
        n += 1;
      }
    }
  }
  return sum / n;
}

const FILTERS: ImageFilter[] = ["none", "scan", "grayscale", "bw"];

describe("applyScanFilter", () => {
  it("'none' leaves pixels untouched", () => {
    const { pixels } = unevenlyLitPage();
    const before = clonePixels(pixels);
    applyScanFilter(pixels, "none");
    expect(pixels.data).toEqual(before.data);
  });

  it("grayscale makes every pixel neutral and keeps brightness", () => {
    const pixels = solid(4, 4, [200, 100, 50]);
    applyScanFilter(pixels, "grayscale");
    for (let i = 0; i < pixels.data.length; i += 4) {
      expect(pixels.data[i]).toBe(pixels.data[i + 1]);
      expect(pixels.data[i + 1]).toBe(pixels.data[i + 2]);
      expect(pixels.data[i + 3]).toBe(255);
    }
    expect(pixels.data[0]).toBeCloseTo(0.299 * 200 + 0.587 * 100 + 0.114 * 50, -0.5);
  });

  it("black & white yields only pure black and white, ink black and paper white, even in shadow", () => {
    const { pixels, ink } = unevenlyLitPage();
    applyScanFilter(pixels, "bw");

    let inkBlack = 0;
    let inkTotal = 0;
    let paperWhite = 0;
    let paperTotal = 0;
    for (let p = 0; p < ink.length; p += 1) {
      const v = pixels.data[p * 4];
      expect(v === 0 || v === 255).toBe(true);
      expect(pixels.data[p * 4 + 1]).toBe(v);
      expect(pixels.data[p * 4 + 2]).toBe(v);
      if (ink[p]) {
        inkTotal += 1;
        if (v === 0) inkBlack += 1;
      } else {
        paperTotal += 1;
        if (v === 255) paperWhite += 1;
      }
    }
    // A global threshold can't do this: dark-side paper (≈50) is darker than
    // bright-side ink (≈40–80 range overlaps), yet both sides come out right.
    expect(inkBlack / inkTotal).toBeGreaterThan(0.9);
    expect(paperWhite / paperTotal).toBeGreaterThan(0.97);
  });

  it("scan evens out the lighting and keeps text dark", () => {
    const { pixels, ink } = unevenlyLitPage();
    const width = pixels.width;
    const darkPaperBefore = bandMean(pixels, ink, false, 0, 40);
    const brightPaperBefore = bandMean(pixels, ink, false, width - 40, width);

    applyScanFilter(pixels, "scan");

    const darkPaper = bandMean(pixels, ink, false, 0, 40);
    const brightPaper = bandMean(pixels, ink, false, width - 40, width);
    const darkInk = bandMean(pixels, ink, true, 0, 40);
    const brightInk = bandMean(pixels, ink, true, width - 40, width);

    expect(brightPaperBefore - darkPaperBefore).toBeGreaterThan(100);
    // Paper is near-white on both sides.
    expect(darkPaper).toBeGreaterThan(225);
    expect(brightPaper).toBeGreaterThan(225);
    expect(Math.abs(brightPaper - darkPaper)).toBeLessThan(25);
    // Ink stays clearly dark everywhere.
    expect(darkInk).toBeLessThan(110);
    expect(brightInk).toBeLessThan(110);
    // The warm cast on the paper is neutralised.
    const i = (80 * width + width - 10) * 4;
    expect(Math.abs(pixels.data[i] - pixels.data[i + 2])).toBeLessThan(20);
  });

  it("is deterministic", () => {
    for (const mode of FILTERS) {
      const a = unevenlyLitPage().pixels;
      const b = unevenlyLitPage().pixels;
      expect(applyScanFilter(a, mode).data).toEqual(applyScanFilter(b, mode).data);
    }
  });

  it("handles black, white, flat-grey, tiny and odd-sized images", () => {
    const cases: Array<[string, PixelBuffer]> = [
      ["black", solid(32, 24, [0, 0, 0])],
      ["white", solid(32, 24, [255, 255, 255])],
      ["grey", solid(32, 24, [128, 128, 128])],
      ["1x1", solid(1, 1, [90, 60, 30])],
      ["3x200", solid(3, 200, [40, 40, 40])],
      ["200x3", solid(200, 3, [220, 210, 200])],
    ];
    for (const [name, base] of cases) {
      for (const mode of FILTERS) {
        const pixels = clonePixels(base);
        expect(() => applyScanFilter(pixels, mode), `${name}/${mode}`).not.toThrow();
        for (let i = 0; i < pixels.data.length; i += 4) {
          expect(Number.isInteger(pixels.data[i]), `${name}/${mode}`).toBe(true);
          expect(pixels.data[i + 3]).toBe(255);
        }
      }
    }
    // Pure black stays black under scan (no noise blown up into grey or white).
    const black = applyScanFilter(solid(32, 24, [0, 0, 0]), "scan");
    expect(Math.max(...Array.from(black.data).filter((_, i) => i % 4 !== 3))).toBe(0);
    // Pure white stays white.
    const white = applyScanFilter(solid(32, 24, [255, 255, 255]), "bw");
    expect(Math.min(...Array.from(white.data))).toBe(255);
  });

  it("lifts a very dark page without crashing or clipping everything", () => {
    const { pixels, ink } = unevenlyLitPage();
    for (let i = 0; i < pixels.data.length; i += 4) {
      pixels.data[i] = pixels.data[i] / 6;
      pixels.data[i + 1] = pixels.data[i + 1] / 6;
      pixels.data[i + 2] = pixels.data[i + 2] / 6;
    }
    applyScanFilter(pixels, "scan");
    const paper = bandMean(pixels, ink, false, pixels.width - 60, pixels.width);
    const text = bandMean(pixels, ink, true, pixels.width - 60, pixels.width);
    expect(paper).toBeGreaterThan(150);
    expect(paper - text).toBeGreaterThan(60);
  });
});

describe("applyToneAdjustments", () => {
  const ramp = () => {
    const p = solid(256, 1, [0, 0, 0]);
    for (let v = 0; v < 256; v += 1) {
      p.data[v * 4] = v;
      p.data[v * 4 + 1] = v;
      p.data[v * 4 + 2] = v;
    }
    return p;
  };
  const values = (p: PixelBuffer) => Array.from({ length: 256 }, (_, v) => p.data[v * 4]);

  it("is a no-op at zero", () => {
    expect(values(applyToneAdjustments(ramp(), 0, 0))).toEqual(values(ramp()));
  });

  it("brightness shifts levels up to ±128 and clamps", () => {
    expect(values(applyToneAdjustments(ramp(), 100, 0)).slice(0, 3)).toEqual([128, 129, 130]);
    expect(values(applyToneAdjustments(ramp(), 100, 0))[200]).toBe(255);
    expect(values(applyToneAdjustments(ramp(), -100, 0))[100]).toBe(0);
    expect(values(applyToneAdjustments(ramp(), -100, 0))[255]).toBe(127);
  });

  it("contrast -100 flattens to mid-grey, +100 triples around it", () => {
    expect(new Set(values(applyToneAdjustments(ramp(), 0, -100)))).toEqual(new Set([128]));
    const high = values(applyToneAdjustments(ramp(), 0, 100));
    expect(high[128]).toBe(128);
    expect(high[138]).toBe(158);
    expect(high[0]).toBe(0);
    expect(high[255]).toBe(255);
  });

  it("clamps out-of-range and non-finite inputs to the -100..100 scale", () => {
    expect(values(applyToneAdjustments(ramp(), 500, 0))).toEqual(values(applyToneAdjustments(ramp(), 100, 0)));
    expect(values(applyToneAdjustments(ramp(), 0, -999))).toEqual(values(applyToneAdjustments(ramp(), 0, -100)));
    expect(values(applyToneAdjustments(ramp(), Number.NaN, 0))).toEqual(values(ramp()));
  });

  it("leaves alpha alone", () => {
    const p = solid(2, 2, [10, 20, 30]);
    p.data[3] = 7;
    applyToneAdjustments(p, 50, 50);
    expect(p.data[3]).toBe(7);
  });
});

describe("applyPixelEdits", () => {
  it("runs the filter, then brightness/contrast", () => {
    const viaEdits = applyPixelEdits(solid(4, 4, [200, 100, 50]), {
      ...DEFAULT_EDITS,
      filter: "grayscale",
      brightness: 10,
      contrast: 20,
    });
    const manual = applyToneAdjustments(applyScanFilter(solid(4, 4, [200, 100, 50]), "grayscale"), 10, 20);
    expect(viaEdits.data).toEqual(manual.data);
  });
});
