import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ImageEditorModal from "../ImageEditorModal";
import * as imageProcessing from "../imageProcessing";
import { DEFAULT_EDITS, type ImageEdits, type ImageItem } from "../types";
import { makeImageFile, makeItems } from "./testUtils";

vi.mock("../imageProcessing", async (importOriginal) => {
  const { createImageProcessingMock } = await import("./imageProcessingMock");
  return createImageProcessingMock(await importOriginal());
});

const renderEdited = vi.mocked(imageProcessing.renderEdited);
const canvasToFile = vi.mocked(imageProcessing.canvasToFile);

function renderEditor(items: ImageItem[], initialIndex = 0) {
  const onCancel = vi.fn();
  const onDone = vi.fn<(items: ImageItem[]) => void>();
  const view = render(
    <ImageEditorModal
      items={items}
      initialIndex={initialIndex}
      thumbnailUrls={{}}
      onCancel={onCancel}
      onDone={onDone}
    />,
  );
  return { ...view, onCancel, onDone };
}

const heading = () => screen.getByRole("heading", { level: 2 }).textContent;
const button = (name: string | RegExp) => screen.getByRole("button", { name });
const savedEdits = (onDone: ReturnType<typeof renderEditor>["onDone"], index: number): ImageEdits =>
  onDone.mock.calls[0][0][index].edits;

/** Preset buttons unlock once the preview has rendered. */
async function waitForPreview() {
  await waitFor(() => expect(button("1:1")).toHaveProperty("disabled", false));
}

beforeEach(() => {
  renderEdited.mockClear();
  canvasToFile.mockClear();
});

describe("ImageEditorModal — navigation", () => {
  it("opens on the chosen image and moves with buttons, arrow keys and thumbnails", async () => {
    renderEditor(makeItems("a.jpg", "b.jpg", "c.jpg"), 1);
    expect(heading()).toBe("Image 2 / 3");
    expect(screen.getByRole("dialog")).toBeTruthy();

    fireEvent.click(button("Next image"));
    expect(heading()).toBe("Image 3 / 3");
    expect(button("Next image")).toHaveProperty("disabled", true);

    fireEvent.keyDown(window, { key: "ArrowLeft" });
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(heading()).toBe("Image 1 / 3");
    expect(button("Previous image")).toHaveProperty("disabled", true);

    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(heading()).toBe("Image 2 / 3");

    fireEvent.click(button(/^Image 3: c\.jpg/));
    expect(heading()).toBe("Image 3 / 3");
  });

  it("keeps each image's draft edits while moving between images", async () => {
    const items = makeItems("a.jpg", "b.jpg");
    const { onDone } = renderEditor(items);

    fireEvent.click(button("Right"));
    fireEvent.click(button("Next image"));
    fireEvent.click(button("Left"));
    fireEvent.click(button("Left"));
    fireEvent.click(button("Previous image"));

    expect(button(/^Image 1: a\.jpg \(unsaved changes\)/)).toBeTruthy();
    expect(button(/^Image 2: b\.jpg \(unsaved changes\)/)).toBeTruthy();

    fireEvent.click(button("Done"));
    await waitFor(() => expect(onDone).toHaveBeenCalledTimes(1));
    expect(savedEdits(onDone, 0).rotation).toBe(90);
    expect(savedEdits(onDone, 1).rotation).toBe(180);
  });

  it("shows an error for an image that can't be decoded, and still navigates", async () => {
    renderEditor([...makeItems("broken.jpg"), ...makeItems("ok.jpg")]);

    expect((await screen.findByRole("alert")).textContent).toContain(`Couldn't read "broken.jpg"`);
    fireEvent.click(button("Next image"));
    expect(heading()).toBe("Image 2 / 2");
    await waitForPreview();
  });
});

describe("ImageEditorModal — crop, rotate and reset", () => {
  it("rotates in quarter turns both ways", async () => {
    const { onDone } = renderEditor(makeItems("a.jpg"));

    fireEvent.click(button("Left"));
    fireEvent.click(button("Done"));

    await waitFor(() => expect(onDone).toHaveBeenCalled());
    expect(savedEdits(onDone, 0).rotation).toBe(270);
  });

  it("applies crop presets against the rotated image", async () => {
    const { onDone } = renderEditor(makeItems("a.jpg"));
    await waitForPreview();
    // Mock image is 400×200.

    fireEvent.click(button("1:1"));
    expect(button("1:1").getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(button("Right"));
    fireEvent.click(button("Done"));

    await waitFor(() => expect(onDone).toHaveBeenCalled());
    const edits = savedEdits(onDone, 0);
    expect(edits.rotation).toBe(90);
    // Square in pixels on the rotated 200×400 image: 200 × 200.
    expect(edits.crop).toEqual({ x: 0, y: 0.25, w: 1, h: 0.5 });
  });

  it("A4 and Original presets size the crop to their aspect", async () => {
    const { onDone } = renderEditor(makeItems("a.jpg", "b.jpg"));
    await waitForPreview();

    fireEvent.click(button("A4"));
    fireEvent.click(button("Next image"));
    await waitForPreview();
    fireEvent.click(button("Free"));
    fireEvent.click(button("Original"));
    fireEvent.click(button("Done"));

    await waitFor(() => expect(onDone).toHaveBeenCalled());
    const a4 = savedEdits(onDone, 0).crop!;
    // Landscape photo → landscape A4: 297 / 210 in pixels, full height.
    expect((a4.w * 400) / (a4.h * 200)).toBeCloseTo(297 / 210, 5);
    expect(a4.h).toBe(1);
    expect(a4.x).toBeCloseTo((1 - a4.w) / 2, 10);
    // "Original" on an uncropped image is the full frame, i.e. no crop.
    expect(savedEdits(onDone, 1)).toEqual(DEFAULT_EDITS);
  });

  it("Reset restores the original image and skips re-encoding it", async () => {
    const original = makeImageFile("saved.png", "image/png");
    const item: ImageItem = {
      id: "saved",
      original,
      edits: { ...DEFAULT_EDITS, rotation: 90, crop: { x: 0.1, y: 0.1, w: 0.5, h: 0.5 } },
      output: makeImageFile("saved.jpg"),
    };
    const { onDone } = renderEditor([item]);

    expect(button("Reset this image")).toHaveProperty("disabled", false);
    fireEvent.click(button("Reset this image"));
    expect(button("Reset this image")).toHaveProperty("disabled", true);
    fireEvent.click(button("Done"));

    await waitFor(() => expect(onDone).toHaveBeenCalled());
    const [saved] = onDone.mock.calls[0][0];
    expect(saved.edits).toEqual(DEFAULT_EDITS);
    expect(saved.output).toBe(original);
    expect(renderEdited).not.toHaveBeenCalled();
  });
});

describe("ImageEditorModal — Done and Cancel", () => {
  it("renders only changed images, one at a time, then saves them", async () => {
    const items = makeItems("a.png", "b.jpg", "c.jpg");
    let resolveFirst!: (canvas: HTMLCanvasElement) => void;
    renderEdited.mockImplementationOnce(
      () => new Promise<HTMLCanvasElement>((resolve) => (resolveFirst = resolve)),
    );
    const { onDone } = renderEditor(items);

    fireEvent.click(button("Right"));
    fireEvent.click(button("Image 3: c.jpg"));
    fireEvent.click(button("Right"));
    fireEvent.click(button("Done"));

    expect(await screen.findByText(/Applying edits… 1\/2/)).toBeTruthy();
    // Convert-blocking state: every tool is disabled while rendering.
    expect(button("Previous image")).toHaveProperty("disabled", true);
    expect(renderEdited).toHaveBeenCalledTimes(1);
    // A second click while busy does nothing.
    fireEvent.click(screen.getByRole("button", { name: /Applying edits/ }));
    expect(renderEdited).toHaveBeenCalledTimes(1);

    await act(async () => resolveFirst({ width: 1, height: 1 } as HTMLCanvasElement));
    await waitFor(() => expect(onDone).toHaveBeenCalledTimes(1));

    expect(renderEdited).toHaveBeenCalledTimes(2);
    expect(renderEdited.mock.calls[0][0]).toBe(items[0].original);
    expect(renderEdited.mock.calls[0][2]).toEqual({ maxSide: 3500 });
    const saved = onDone.mock.calls[0][0];
    expect(saved.map((item) => item.id)).toEqual(items.map((item) => item.id));
    expect(saved[0].output.name).toBe("a.jpg");
    expect(saved[0].original).toBe(items[0].original);
    expect(saved[1]).toBe(items[1]);
    expect(saved[2].edits.rotation).toBe(90);
  });

  it("keeps every draft and saves nothing when rendering fails", async () => {
    renderEdited
      .mockResolvedValueOnce({ width: 1, height: 1 } as HTMLCanvasElement)
      .mockRejectedValueOnce(new Error("canvas exploded"));
    const items = makeItems("a.jpg", "b.jpg");
    const { onDone } = renderEditor(items);

    fireEvent.click(button("Right"));
    fireEvent.click(button("Next image"));
    fireEvent.click(button("Right"));
    fireEvent.click(button("Done"));

    const alert = await screen.findByText(/Couldn't apply edits to image 2 \(b\.jpg\): canvas exploded/);
    expect(alert.textContent).toContain("Nothing was saved");
    expect(onDone).not.toHaveBeenCalled();
    expect(button(/^Image 1: a\.jpg \(unsaved changes\)/)).toBeTruthy();
    expect(button(/^Image 2: b\.jpg \(unsaved changes\)/)).toBeTruthy();

    // Retry succeeds with the same drafts.
    fireEvent.click(button("Done"));
    await waitFor(() => expect(onDone).toHaveBeenCalledTimes(1));
    expect(savedEdits(onDone, 0).rotation).toBe(90);
    expect(savedEdits(onDone, 1).rotation).toBe(90);
  });

  it("does not report back if it is closed while rendering", async () => {
    let resolveRender!: (canvas: HTMLCanvasElement) => void;
    renderEdited.mockImplementationOnce(
      () => new Promise<HTMLCanvasElement>((resolve) => (resolveRender = resolve)),
    );
    const { onDone, unmount } = renderEditor(makeItems("a.jpg"));

    fireEvent.click(button("Right"));
    fireEvent.click(button("Done"));
    await screen.findByText(/Applying edits/);
    unmount();
    await act(async () => resolveRender({ width: 1, height: 1 } as HTMLCanvasElement));

    expect(onDone).not.toHaveBeenCalled();
  });

  it("closes straight away when nothing changed", () => {
    const { onCancel, onDone } = renderEditor(makeItems("a.jpg"));

    fireEvent.click(button("Cancel"));
    expect(onCancel).toHaveBeenCalledTimes(1);

    fireEvent.click(button("Done"));
    expect(onCancel).toHaveBeenCalledTimes(2);
    expect(onDone).not.toHaveBeenCalled();
  });

  it("asks before discarding this session's changes, from Cancel or Escape", () => {
    const { onCancel, onDone } = renderEditor(makeItems("a.jpg"));
    fireEvent.click(button("Right"));

    fireEvent.click(button("Cancel"));
    const prompt = screen.getByRole("alertdialog", { name: "Discard changes?" });
    expect(prompt.textContent).toContain("Discard your changes to 1 image?");
    fireEvent.click(within(prompt).getByRole("button", { name: "Keep editing" }));
    expect(screen.queryByRole("alertdialog")).toBeNull();
    expect(onCancel).not.toHaveBeenCalled();

    fireEvent.keyDown(window, { key: "Escape" });
    fireEvent.click(
      within(screen.getByRole("alertdialog")).getByRole("button", { name: "Discard changes" }),
    );
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onDone).not.toHaveBeenCalled();
  });

  it("locks page scrolling while open", () => {
    const { unmount } = renderEditor(makeItems("a.jpg"));
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).toBe("");
  });
});
