import { vi } from "vitest";
import type * as ImageProcessing from "../imageProcessing";

/** Size every mocked image decodes to (landscape 2:1). */
export const MOCK_IMAGE_SIZE = { width: 400, height: 200 };

/**
 * happy-dom has no 2D canvas, so the browser-only parts of imageProcessing are
 * replaced; the pure geometry/filter functions stay real.
 */
export function createImageProcessingMock(actual: typeof ImageProcessing) {
  return {
    ...actual,
    loadImage: vi.fn(async (file: Blob & { name?: string }) => {
      if (file.name?.startsWith("broken")) {
        throw new Error(`Couldn't read "${file.name}". The file may be damaged.`);
      }
      return { image: {} as CanvasImageSource, ...MOCK_IMAGE_SIZE };
    }),
    renderPreviewBase: vi.fn((loaded: ImageProcessing.LoadedImage, rotation: 0 | 90 | 180 | 270) => {
      const size = actual.rotatedSize(loaded.width, loaded.height, rotation);
      return {
        data: new Uint8ClampedArray(size.width * size.height * 4).fill(128),
        ...size,
      };
    }),
    paintPixels: vi.fn(),
    renderEdited: vi.fn(async () => ({ width: 10, height: 10 }) as HTMLCanvasElement),
    canvasToFile: vi.fn(
      async (_canvas: HTMLCanvasElement, name: string) =>
        new File([`edited:${name}`], name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" }),
    ),
    releaseCanvas: vi.fn(),
  };
}
