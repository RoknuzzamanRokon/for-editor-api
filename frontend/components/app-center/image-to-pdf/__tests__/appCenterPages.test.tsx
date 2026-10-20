import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ComponentProps } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminAppCenterEditPage from "@/app/admin/app-center/edit/[slug]/page";
import UserAppCenterEditPage from "@/app/user/app-center/edit/[slug]/page";
import { authFetch } from "@/lib/authFetch";
import type ImageToPdfBuilder from "../ImageToPdfBuilder";
import { DEFAULT_EDITS, type ImageItem } from "../types";
import { makeImageFile } from "./testUtils";

vi.mock("next/navigation", () => ({
  usePathname: () => "/user/app-center/edit/image-to-pdf",
}));
vi.mock("@/lib/apiBase", () => ({ API_BASE: "http://api.test" }));
vi.mock("@/lib/authFetch", () => ({ authFetch: vi.fn() }));
// The pages import every tool's UI; none of the others matter here.
vi.mock("@/components/app-center/EditableDocxPreview", () => ({ default: () => null }));
vi.mock("@/components/app-center/ExcelWorkbookPreview", () => ({ default: () => null }));
vi.mock("@/components/app-center/RemoveBackgroundStudio", () => ({ default: () => null }));
vi.mock("@/components/PdfPageRemover", () => ({ default: () => null }));
vi.mock("@/components/PdfPageOrganizer", () => ({ default: () => null }));

const edited = makeImageFile("receipt.jpg", "image/jpeg", "edited-bytes");
const ITEMS: ImageItem[] = [
  {
    id: "a",
    original: makeImageFile("receipt.png", "image/png"),
    edits: { ...DEFAULT_EDITS, rotation: 90 },
    output: edited,
  },
  (() => {
    const file = makeImageFile("page2.jpg");
    return { id: "b", original: file, edits: DEFAULT_EDITS, output: file };
  })(),
];

// Stand-in for the shared builder: proves the page renders it and lets the
// test drive the page's own state and convert handler through its props.
vi.mock("@/components/app-center/image-to-pdf/ImageToPdfBuilder", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../ImageToPdfBuilder")>();
  return {
    ...actual,
    default: ({ items, onItemsChange, onConvert }: ComponentProps<typeof ImageToPdfBuilder>) => (
      <div data-testid="shared-image-to-pdf-builder">
        <span>{items.length} items</span>
        <button type="button" onClick={() => onItemsChange(ITEMS)}>
          load items
        </button>
        <button type="button" onClick={onConvert}>
          convert
        </button>
      </div>
    ),
  };
});

const mockedAuthFetch = vi.mocked(authFetch);

describe.each([
  ["user", UserAppCenterEditPage],
  ["admin", AdminAppCenterEditPage],
])("%s App Center image-to-pdf page", (_role, Page) => {
  beforeEach(() => {
    mockedAuthFetch.mockReset();
    mockedAuthFetch.mockResolvedValue(new Response("Upstream said no", { status: 500 }));
  });

  it("renders the shared builder and posts each item's output as `files`, in order", async () => {
    render(<Page params={{ slug: "image-to-pdf" }} />);

    expect(screen.getByTestId("shared-image-to-pdf-builder")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "load items" }));
    expect(screen.getByText("2 items")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "convert" }));

    await waitFor(() => expect(mockedAuthFetch).toHaveBeenCalledTimes(1));
    const [url, init] = mockedAuthFetch.mock.calls[0];
    expect(url).toBe("http://api.test/api/v3/conversions/image-to-pdf");
    expect(init?.method).toBe("POST");

    const body = init?.body as FormData;
    expect(Array.from(body.keys())).toEqual(["files", "files"]);
    const files = body.getAll("files") as File[];
    // The edited render is uploaded, not the untouched original.
    expect(files[0]).toBe(edited);
    expect(files[1]).toBe(ITEMS[1].original);

    expect(await screen.findByText("Upstream said no")).toBeTruthy();
  });

  it("refuses to convert with no images", async () => {
    render(<Page params={{ slug: "image-to-pdf" }} />);

    fireEvent.click(screen.getByRole("button", { name: "convert" }));

    expect(await screen.findByText("Please choose at least one image")).toBeTruthy();
    expect(mockedAuthFetch).not.toHaveBeenCalled();
  });
});
