import { useState } from "react";
import { vi } from "vitest";
import ImageToPdfBuilder from "../ImageToPdfBuilder";
import { createImageItem, type ImageItem } from "../types";

export function makeImageFile(name: string, type = "image/jpeg", body = name): File {
  return new File([body], name, { type, lastModified: 1_700_000_000_000 });
}

export function makeItems(...names: string[]): ImageItem[] {
  return names.map((name) => createImageItem(makeImageFile(name)));
}

/** Owns the item list the way the App Center page does, and reports every render. */
export function BuilderHarness({
  initial = [],
  onConvert = vi.fn(),
  submitting = false,
  onItems,
}: {
  initial?: ImageItem[];
  onConvert?: () => void;
  submitting?: boolean;
  onItems?: (items: ImageItem[]) => void;
}) {
  const [items, setItems] = useState<ImageItem[]>(initial);
  onItems?.(items);
  return (
    <ImageToPdfBuilder
      items={items}
      onItemsChange={setItems}
      onConvert={onConvert}
      submitting={submitting}
    />
  );
}

/** happy-dom has no layout: give each tile a fixed box in a single row. */
export function layOutTilesInRow(tiles: HTMLElement[], size = 100) {
  tiles.forEach((tile, i) => {
    vi.spyOn(tile, "getBoundingClientRect").mockReturnValue({
      left: i * size,
      right: i * size + size - 1,
      top: 0,
      bottom: size - 1,
      width: size - 1,
      height: size - 1,
      x: i * size,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect);
  });
}
