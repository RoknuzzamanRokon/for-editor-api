import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminAppCenterEditPage from "@/app/admin/app-center/edit/[slug]/page";
import UserAppCenterEditPage from "@/app/user/app-center/edit/[slug]/page";
import { authFetch } from "@/lib/authFetch";

vi.mock("next/navigation", () => ({
  usePathname: () => "/user/app-center/edit/compress-json",
}));
vi.mock("@/lib/apiBase", () => ({ API_BASE: "http://api.test" }));
vi.mock("@/lib/authFetch", () => ({ authFetch: vi.fn() }));
// The pages import every tool's UI; none of the others matter here.
vi.mock("@/components/app-center/EditableDocxPreview", () => ({ default: () => null }));
vi.mock("@/components/app-center/ExcelWorkbookPreview", () => ({ default: () => null }));
vi.mock("@/components/app-center/RemoveBackgroundStudio", () => ({ default: () => null }));
vi.mock("@/components/PdfPageRemover", () => ({ default: () => null }));
vi.mock("@/components/PdfPageOrganizer", () => ({ default: () => null }));

const mockedAuthFetch = vi.mocked(authFetch);

const PRETTY = JSON.stringify({ name: "Rokon", items: [1, 2, 3], nested: { ok: true } }, null, 4);
const MINIFIED = JSON.stringify(JSON.parse(PRETTY));

/** Answers the upload, then the download of the result. */
function respondWith(download: { body: BlobPart; type: string; filename: string }) {
  mockedAuthFetch.mockImplementation(async (url) => {
    if (String(url).endsWith("/compress-json")) {
      return new Response(
        JSON.stringify({
          conversion_id: 7,
          status: "success",
          download_url: "/api/v3/conversions/7/download",
          points_charged: 3,
          remaining_balance: 97,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }
    return new Response(new Blob([download.body], { type: download.type }), {
      status: 200,
      headers: {
        "Content-Type": download.type,
        "Content-Disposition": `attachment; filename="${download.filename}"`,
      },
    });
  });
}

function chooseFile(container: HTMLElement) {
  const input = container.querySelector('input[type="file"]') as HTMLInputElement;
  const file = new File([PRETTY], "data.json", { type: "application/json" });
  fireEvent.change(input, { target: { files: [file] } });
  return { input, file };
}

describe.each([
  ["user", UserAppCenterEditPage],
  ["admin", AdminAppCenterEditPage],
])("%s App Center Compress JSON page", (_role, Page) => {
  beforeEach(() => {
    mockedAuthFetch.mockReset();
  });

  it("offers the three modes and only .json files", () => {
    const { container } = render(<Page params={{ slug: "compress-json" }} />);

    expect(screen.getByRole("heading", { name: "Compress Json" })).toBeTruthy();
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(Array.from(select.options).map((o) => o.value)).toEqual(["minify", "clean", "gzip"]);
    expect(select.value).toBe("minify");
    expect((container.querySelector('input[type="file"]') as HTMLInputElement).accept).toBe(
      ".json,application/json",
    );
    expect(screen.getByText(/rounds decimals to 4 places, so the data changes/)).toBeTruthy();
  });

  it("uploads the file with the chosen mode, then shows before → after size and the result", async () => {
    respondWith({ body: MINIFIED, type: "application/json", filename: "data.min.json" });
    const { container } = render(<Page params={{ slug: "compress-json" }} />);

    const { file } = chooseFile(container);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "clean" } });
    fireEvent.click(screen.getByRole("button", { name: /Convert File/ }));

    await waitFor(() => expect(mockedAuthFetch).toHaveBeenCalledTimes(2));
    const [url, init] = mockedAuthFetch.mock.calls[0];
    expect(url).toBe("http://api.test/api/v3/conversions/compress-json");
    expect(init?.method).toBe("POST");
    const body = init?.body as FormData;
    expect(body.get("file")).toBe(file);
    expect(body.get("mode")).toBe("clean");
    expect(mockedAuthFetch.mock.calls[1][0]).toBe("http://api.test/api/v3/conversions/7/download");

    const before = new Blob([PRETTY]).size;
    const after = new Blob([MINIFIED]).size;
    const percent = Math.round(((before - after) / before) * 100);
    expect(await screen.findByText("File size")).toBeTruthy();
    expect(screen.getByText(`${before} B → ${after} B`, { exact: false })).toBeTruthy();
    expect(screen.getByText(`(${percent}% smaller)`)).toBeTruthy();

    // The minified result is shown as text in the preview.
    expect((await screen.findByText(MINIFIED)).tagName).toBe("PRE");
  });

  it("gzip result: size report, and a download instead of an inline preview", async () => {
    const gz = new Uint8Array([0x1f, 0x8b, 8, 0, 0, 0, 0, 0, 2, 255, 1, 2, 3]);
    respondWith({ body: gz, type: "application/gzip", filename: "data.json.gz" });
    const { container } = render(<Page params={{ slug: "compress-json" }} />);

    chooseFile(container);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "gzip" } });
    fireEvent.click(screen.getByRole("button", { name: /Convert File/ }));

    expect(await screen.findByText(/13 B/)).toBeTruthy();
    expect(screen.getByText("This file type cannot be rendered inline in the browser.")).toBeTruthy();
    expect(screen.queryByText(MINIFIED)).toBeNull();
    expect((mockedAuthFetch.mock.calls[0][1]?.body as FormData).get("mode")).toBe("gzip");
  });
});
