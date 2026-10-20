import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { appendImagesToFormData, moveItem } from "../ImageToPdfBuilder";
import type { ImageItem } from "../types";
import { BuilderHarness, layOutTilesInRow, makeImageFile, makeItems } from "./testUtils";

function tiles() {
  return screen.getAllByRole("button", { name: /page \d+ of \d+/ });
}

function tileNames() {
  return tiles().map((tile) => tile.getAttribute("aria-label")?.split(",")[0]);
}

describe("ImageToPdfBuilder", () => {
  it("adds every supported image picked in the file dialog and skips other files", () => {
    let latest: ImageItem[] = [];
    const { container } = render(<BuilderHarness onItems={(items) => (latest = items)} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, {
      target: {
        files: [
          makeImageFile("a.jpg"),
          makeImageFile("b.png", "image/png"),
          makeImageFile("notes.txt", "text/plain"),
          makeImageFile("c.webp", "image/webp"),
        ],
      },
    });

    expect(tileNames()).toEqual(["a.jpg", "b.png", "c.webp"]);
    expect(latest.map((item) => item.output.name)).toEqual(["a.jpg", "b.png", "c.webp"]);
    // Fresh uploads are unedited: output is the original file itself.
    latest.forEach((item) => expect(item.output).toBe(item.original));
    expect(new Set(latest.map((item) => item.id)).size).toBe(3);
    expect(screen.getByRole("button", { name: "Convert 3 Photos to PDF" })).toBeTruthy();
  });

  it("accepts images dropped onto the dropzone", () => {
    render(<BuilderHarness />);
    const dropzone = screen.getByText(/drag & drop them here/).closest("div") as HTMLElement;

    fireEvent.drop(dropzone, {
      dataTransfer: { files: [makeImageFile("x.jpg"), makeImageFile("y.jpg")] },
    });

    expect(tileNames()).toEqual(["x.jpg", "y.jpg"]);
  });

  it("reorders with the arrow keys and submits files in the displayed order", () => {
    let latest: ImageItem[] = [];
    render(
      <BuilderHarness
        initial={makeItems("one.jpg", "two.jpg", "three.jpg")}
        onItems={(items) => (latest = items)}
      />,
    );

    fireEvent.keyDown(tiles()[0], { key: "ArrowRight" });
    expect(tileNames()).toEqual(["two.jpg", "one.jpg", "three.jpg"]);

    fireEvent.keyDown(tiles()[2], { key: "ArrowUp" });
    expect(tileNames()).toEqual(["two.jpg", "three.jpg", "one.jpg"]);

    const formData = new FormData();
    appendImagesToFormData(formData, latest);
    const sent = formData.getAll("files") as File[];
    expect(sent.map((f) => f.name)).toEqual(["two.jpg", "three.jpg", "one.jpg"]);
    expect(Array.from(formData.keys())).toEqual(["files", "files", "files"]);
  });

  it("reorders by dragging a tile over another one", () => {
    render(<BuilderHarness initial={makeItems("one.jpg", "two.jpg", "three.jpg")} />);
    layOutTilesInRow(tiles());

    const first = tiles()[0];
    fireEvent.pointerDown(first, { pointerId: 1, clientX: 50, clientY: 50 });
    fireEvent.pointerMove(first, { pointerId: 1, clientX: 250, clientY: 50 });
    fireEvent.pointerUp(first, { pointerId: 1, clientX: 250, clientY: 50 });

    expect(tileNames()).toEqual(["two.jpg", "three.jpg", "one.jpg"]);
  });

  it("removes one image, and clears all", () => {
    render(<BuilderHarness initial={makeItems("one.jpg", "two.jpg")} />);

    fireEvent.click(screen.getByRole("button", { name: "Remove one.jpg" }));
    expect(tileNames()).toEqual(["two.jpg"]);

    fireEvent.click(screen.getByRole("button", { name: "Clear all" }));
    expect(screen.queryAllByRole("button", { name: /page \d+ of \d+/ })).toHaveLength(0);
  });

  it("only enables Convert when there are images and no conversion is running", () => {
    const onConvert = vi.fn();
    const { rerender } = render(<BuilderHarness onConvert={onConvert} />);
    expect(screen.getByRole("button", { name: "Convert to PDF" })).toHaveProperty("disabled", true);

    const items = makeItems("a.jpg");
    rerender(<BuilderHarness key="with-items" initial={items} onConvert={onConvert} />);
    const convert = screen.getByRole("button", { name: "Convert 1 Photo to PDF" });
    fireEvent.click(convert);
    expect(onConvert).toHaveBeenCalledTimes(1);

    rerender(<BuilderHarness key="submitting" initial={items} onConvert={onConvert} submitting />);
    expect(screen.getByRole("button", { name: "Converting..." })).toHaveProperty("disabled", true);
  });
});

describe("moveItem", () => {
  it("moves an element and leaves no-op moves referentially equal", () => {
    const list = ["a", "b", "c"];
    expect(moveItem(list, 0, 2)).toEqual(["b", "c", "a"]);
    expect(moveItem(list, 1, 1)).toBe(list);
    expect(moveItem(list, -1, 1)).toBe(list);
    expect(moveItem(list, 0, 3)).toBe(list);
  });
});
