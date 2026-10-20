import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DEFAULT_EDITS, type ImageItem } from "../types";
import { BuilderHarness, layOutTilesInRow, makeImageFile, makeItems } from "./testUtils";

vi.mock("../imageProcessing", async (importOriginal) => {
  const { createImageProcessingMock } = await import("./imageProcessingMock");
  return createImageProcessingMock(await importOriginal());
});

const tiles = () => screen.getAllByRole("button", { name: /page \d+ of \d+/ });
const dialog = () => screen.queryByRole("dialog");
const editorHeading = () =>
  within(screen.getByRole("dialog")).getByRole("heading", { level: 2 }).textContent;

describe("ImageToPdfBuilder ↔ editor", () => {
  it("opens the editor on a tap, but not after a drag", () => {
    render(<BuilderHarness initial={makeItems("one.jpg", "two.jpg", "three.jpg")} />);
    layOutTilesInRow(tiles());

    // Drag tile 1 onto tile 3: reorders, no editor.
    fireEvent.pointerDown(tiles()[0], { pointerId: 1, clientX: 50, clientY: 50 });
    fireEvent.pointerMove(tiles()[0], { pointerId: 1, clientX: 250, clientY: 50 });
    fireEvent.pointerUp(tiles()[2], { pointerId: 1, clientX: 250, clientY: 50 });
    expect(dialog()).toBeNull();

    // A small wobble is still a tap.
    fireEvent.pointerDown(tiles()[1], { pointerId: 2, clientX: 150, clientY: 50 });
    fireEvent.pointerMove(tiles()[1], { pointerId: 2, clientX: 153, clientY: 52 });
    fireEvent.pointerUp(tiles()[1], { pointerId: 2, clientX: 153, clientY: 52 });
    expect(editorHeading()).toBe("Image 2 / 3");
    // After the drag the order is two, three, one — so tile 2 is three.jpg.
    expect(within(screen.getByRole("dialog")).getByTitle("three.jpg")).toBeTruthy();
  });

  it("opens from the edit button and from Enter on a focused tile", () => {
    render(<BuilderHarness initial={makeItems("one.jpg", "two.jpg")} />);

    fireEvent.click(screen.getByRole("button", { name: "Edit two.jpg" }));
    expect(editorHeading()).toBe("Image 2 / 2");
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Cancel" }));
    expect(dialog()).toBeNull();

    fireEvent.keyDown(tiles()[0], { key: "Enter" });
    expect(editorHeading()).toBe("Image 1 / 2");
  });

  it("disables Convert while the editor is open", () => {
    render(<BuilderHarness initial={makeItems("one.jpg")} />);
    const convert = screen.getByRole("button", { name: "Convert 1 Photo to PDF" });
    expect(convert).toHaveProperty("disabled", false);

    fireEvent.click(screen.getByRole("button", { name: "Edit one.jpg" }));
    expect(convert).toHaveProperty("disabled", true);
  });

  it("saves edits on Done: new thumbnail, Edited badge, edited file uploaded", async () => {
    let latest: ImageItem[] = [];
    render(
      <BuilderHarness
        initial={makeItems("one.png", "two.jpg")}
        onItems={(items) => (latest = items)}
      />,
    );
    const before = latest;
    const thumbnailBefore = screen.getByAltText("one.png").getAttribute("src");

    fireEvent.click(screen.getByRole("button", { name: "Edit one.png" }));
    fireEvent.click(screen.getByRole("button", { name: "Right" }));
    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    await waitFor(() => expect(dialog()).toBeNull());

    expect(latest[0].edits.rotation).toBe(90);
    expect(latest[0].original).toBe(before[0].original);
    expect(latest[0].output).not.toBe(before[0].original);
    expect(latest[0].output.name).toBe("one.jpg");
    expect(latest[1]).toBe(before[1]);

    expect(tiles()[0].getAttribute("aria-label")).toContain("page 1 of 2, edited");
    expect(within(tiles()[0]).getByText("Edited")).toBeTruthy();
    expect(within(tiles()[1]).queryByText("Edited")).toBeNull();
    await waitFor(() =>
      expect(screen.getByAltText("one.png").getAttribute("src")).not.toBe(thumbnailBefore),
    );
  });

  it("Cancel discards only this session's edits", () => {
    let latest: ImageItem[] = [];
    const savedOutput = makeImageFile("kept.jpg");
    const saved: ImageItem = {
      id: "saved",
      original: makeImageFile("kept.png", "image/png"),
      edits: { ...DEFAULT_EDITS, rotation: 180 },
      output: savedOutput,
    };
    render(<BuilderHarness initial={[saved]} onItems={(items) => (latest = items)} />);
    expect(within(tiles()[0]).getByText("Edited")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Edit kept.png" }));
    fireEvent.click(screen.getByRole("button", { name: "Reset this image" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    fireEvent.click(screen.getByRole("button", { name: "Discard changes" }));

    expect(dialog()).toBeNull();
    expect(latest[0]).toBe(saved);
    expect(latest[0].output).toBe(savedOutput);
    expect(within(tiles()[0]).getByText("Edited")).toBeTruthy();
  });
});
