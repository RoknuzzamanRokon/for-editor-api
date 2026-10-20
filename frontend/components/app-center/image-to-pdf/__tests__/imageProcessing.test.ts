// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  aspectForPreset,
  centeredCropForAspect,
  cropToPixels,
  fitWithin,
  normalizeCrop,
  normalizeRotation,
  rotateCropRect,
  rotatedSize,
  sourceRectForCrop,
} from "../imageProcessing";
import type { CropRect, Rotation } from "../types";

const ROTATIONS: Rotation[] = [0, 90, 180, 270];

/** Rotates a W×H grid of labels clockwise by `rotation`, the way a viewer would. */
function rotateGrid(grid: number[], width: number, height: number, rotation: Rotation) {
  const out = rotatedSize(width, height, rotation);
  const result = new Array<number>(out.width * out.height);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let u: number;
      let v: number;
      if (rotation === 90) [u, v] = [height - 1 - y, x];
      else if (rotation === 180) [u, v] = [width - 1 - x, height - 1 - y];
      else if (rotation === 270) [u, v] = [y, width - 1 - x];
      else [u, v] = [x, y];
      result[v * out.width + u] = grid[y * width + x];
    }
  }
  return { grid: result, ...out };
}

function subGrid(grid: number[], width: number, rect: { x: number; y: number; width: number; height: number }) {
  const result: number[] = [];
  for (let y = rect.y; y < rect.y + rect.height; y += 1) {
    for (let x = rect.x; x < rect.x + rect.width; x += 1) result.push(grid[y * width + x]);
  }
  return result;
}

describe("rotation helpers", () => {
  it("normalizes any multiple of 90° into 0/90/180/270", () => {
    expect(normalizeRotation(0)).toBe(0);
    expect(normalizeRotation(-90)).toBe(270);
    expect(normalizeRotation(360)).toBe(0);
    expect(normalizeRotation(450)).toBe(90);
    expect(normalizeRotation(-540)).toBe(180);
  });

  it("swaps width and height for quarter turns", () => {
    expect(rotatedSize(400, 200, 0)).toEqual({ width: 400, height: 200 });
    expect(rotatedSize(400, 200, 90)).toEqual({ width: 200, height: 400 });
    expect(rotatedSize(400, 200, 180)).toEqual({ width: 400, height: 200 });
    expect(rotatedSize(400, 200, 270)).toEqual({ width: 200, height: 400 });
  });
});

describe("fitWithin", () => {
  it("caps the longest side and keeps the aspect ratio", () => {
    expect(fitWithin(4000, 3000, 1600)).toEqual({ width: 1600, height: 1200 });
    expect(fitWithin(3000, 4000, 3500)).toEqual({ width: 2625, height: 3500 });
  });

  it("never upscales and never returns a zero side", () => {
    expect(fitWithin(800, 600, 1600)).toEqual({ width: 800, height: 600 });
    expect(fitWithin(10000, 1, 100)).toEqual({ width: 100, height: 1 });
  });
});

describe("crop helpers", () => {
  it("treats a full-frame or empty crop as no crop, and clamps the rest", () => {
    expect(normalizeCrop(null)).toBeNull();
    expect(normalizeCrop({ x: 0, y: 0, w: 1, h: 1 })).toBeNull();
    expect(normalizeCrop({ x: 0.0004, y: 0, w: 0.9999, h: 1 })).toBeNull();
    expect(normalizeCrop({ x: 0.5, y: 0.5, w: 0, h: 0.2 })).toBeNull();
    expect(normalizeCrop({ x: -0.2, y: 0.5, w: 0.5, h: 0.9 })).toEqual({ x: 0, y: 0.5, w: 0.5, h: 0.5 });
    expect(normalizeCrop({ x: Number.NaN, y: 0.1, w: 0.5, h: 0.5 })).toEqual({ x: 0, y: 0.1, w: 0.5, h: 0.5 });
  });

  it("keeps the same region selected when the image turns", () => {
    const crop: CropRect = { x: 0.1, y: 0.2, w: 0.3, h: 0.4 };
    const expectClose = (actual: CropRect | null, expected: CropRect) =>
      (["x", "y", "w", "h"] as const).forEach((key) =>
        expect(actual![key]).toBeCloseTo(expected[key], 12),
      );
    expectClose(rotateCropRect(crop, "cw"), { x: 0.4, y: 0.1, w: 0.4, h: 0.3 });
    expectClose(rotateCropRect(crop, "ccw"), { x: 0.2, y: 0.6, w: 0.4, h: 0.3 });

    const back = rotateCropRect(rotateCropRect(crop, "cw"), "ccw")!;
    (["x", "y", "w", "h"] as const).forEach((key) => expect(back[key]).toBeCloseTo(crop[key], 12));

    let turned: CropRect | null = crop;
    for (let i = 0; i < 4; i += 1) turned = rotateCropRect(turned, "cw");
    (["x", "y", "w", "h"] as const).forEach((key) => expect(turned![key]).toBeCloseTo(crop[key], 12));

    expect(rotateCropRect(null, "cw")).toBeNull();
  });

  it("converts to whole pixels, at least 1×1, inside the image", () => {
    expect(cropToPixels(null, 400, 200)).toEqual({ x: 0, y: 0, width: 400, height: 200 });
    expect(cropToPixels({ x: 0.25, y: 0.5, w: 0.5, h: 0.25 }, 400, 200)).toEqual({
      x: 100,
      y: 100,
      width: 200,
      height: 50,
    });
    expect(cropToPixels({ x: 0.999, y: 0.999, w: 0.0001, h: 0.0001 }, 10, 10)).toEqual({
      x: 9,
      y: 9,
      width: 1,
      height: 1,
    });
  });

  it("maps a crop on the rotated image back to the right source pixels", () => {
    const width = 7;
    const height = 5;
    const source = Array.from({ length: width * height }, (_, i) => i);
    const crops: Array<CropRect | null> = [
      null,
      { x: 0.2, y: 0.1, w: 0.5, h: 0.6 },
      { x: 0, y: 0.4, w: 0.3, h: 0.6 },
      { x: 0.6, y: 0, w: 0.4, h: 0.2 },
    ];

    for (const rotation of ROTATIONS) {
      const rotated = rotateGrid(source, width, height, rotation);
      for (const crop of crops) {
        const expectedRect = cropToPixels(crop, rotated.width, rotated.height);
        const expected = subGrid(rotated.grid, rotated.width, expectedRect);

        const { source: rect, size } = sourceRectForCrop(crop, rotation, width, height);
        expect(rect.x).toBeGreaterThanOrEqual(0);
        expect(rect.y).toBeGreaterThanOrEqual(0);
        expect(rect.x + rect.width).toBeLessThanOrEqual(width);
        expect(rect.y + rect.height).toBeLessThanOrEqual(height);
        expect(size).toEqual({ width: expectedRect.width, height: expectedRect.height });

        // Rotating the source region must give exactly the cropped rotated pixels.
        const actual = rotateGrid(subGrid(source, width, rect), rect.width, rect.height, rotation);
        expect(actual.grid).toEqual(expected);
      }
    }
  });
});

describe("crop presets", () => {
  it("returns the aspect each preset locks to", () => {
    expect(aspectForPreset("free", 400, 200)).toBeUndefined();
    expect(aspectForPreset("square", 400, 200)).toBe(1);
    expect(aspectForPreset("original", 400, 200)).toBe(2);
    expect(aspectForPreset("a4", 400, 200)).toBeCloseTo(297 / 210, 10);
    expect(aspectForPreset("a4", 200, 400)).toBeCloseTo(210 / 297, 10);
  });

  it("builds the largest centred crop with that aspect", () => {
    expect(centeredCropForAspect(1, 400, 200)).toEqual({ x: 0.25, y: 0, w: 0.5, h: 1 });
    expect(centeredCropForAspect(1, 200, 400)).toEqual({ x: 0, y: 0.25, w: 1, h: 0.5 });
    expect(centeredCropForAspect(2, 400, 200)).toEqual({ x: 0, y: 0, w: 1, h: 1 });

    const a4 = centeredCropForAspect(210 / 297, 3000, 4000);
    expect((a4.w * 3000) / (a4.h * 4000)).toBeCloseTo(210 / 297, 10);
    expect(Math.max(a4.w, a4.h)).toBe(1);

    expect(centeredCropForAspect(Number.NaN, 400, 200)).toEqual({ x: 0, y: 0, w: 1, h: 1 });
  });
});
