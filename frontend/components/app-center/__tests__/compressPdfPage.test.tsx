import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminAppCenterEditPage from "@/app/admin/app-center/edit/[slug]/page";
import UserAppCenterEditPage from "@/app/user/app-center/edit/[slug]/page";
import { authFetch } from "@/lib/authFetch";

vi.mock("next/navigation", () => ({
  usePathname: () => "/user/app-center/edit/compress-pdf",
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
const KB = 1024;

/** Answers the upload, then the download of a compressed PDF of `resultBytes`. */
function respondWithPdf(resultBytes: number) {
  mockedAuthFetch.mockImplementation(async (url) => {
    if (String(url).endsWith("/compress-pdf")) {
      return new Response(
        JSON.stringify({
          conversion_id: 9,
          status: "success",
          download_url: "/api/v3/conversions/9/download",
          points_charged: 3,
          remaining_balance: 97,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }
    return new Response(new Blob([new Uint8Array(resultBytes)], { type: "application/pdf" }), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="scan.pdf"',
      },
    });
  });
}

function chooseFile(container: HTMLElement, bytes = 300 * KB) {
  const input = container.querySelector('input[type="file"]') as HTMLInputElement;
  const file = new File([new Uint8Array(bytes)], "scan.pdf", { type: "application/pdf" });
  fireEvent.change(input, { target: { files: [file] } });
  return { input, file };
}

const trigger = () => screen.getByRole("button", { name: /^Target size:/ });
const openFlyout = () => {
  fireEvent.click(trigger());
  return screen.getByRole("dialog", { name: "Target size" });
};
const sentForm = () => mockedAuthFetch.mock.calls[0][1]?.body as FormData;

describe.each([
  ["user", UserAppCenterEditPage],
  ["admin", AdminAppCenterEditPage],
])("%s App Center Compress PDF target size", (_role, Page) => {
  beforeEach(() => {
    mockedAuthFetch.mockReset();
  });

  it("starts on Recommended, only takes PDFs, and sends no target", async () => {
    respondWithPdf(200 * KB);
    const { container } = render(<Page params={{ slug: "compress-pdf" }} />);

    expect(trigger().textContent).toContain("Recommended");
    expect((container.querySelector('input[type="file"]') as HTMLInputElement).accept).toBe(
      ".pdf,application/pdf",
    );

    chooseFile(container);
    fireEvent.click(screen.getByRole("button", { name: /Convert File/ }));

    await waitFor(() => expect(mockedAuthFetch).toHaveBeenCalledTimes(2));
    expect(mockedAuthFetch.mock.calls[0][0]).toBe("http://api.test/api/v3/conversions/compress-pdf");
    expect(sentForm().has("target_kb")).toBe(false);
    expect(await screen.findByText("File size")).toBeTruthy();
    expect(screen.queryByText(/target\.$/)).toBeNull();
  });

  it("picks a preset from the flyout, sends it, and confirms the target was met", async () => {
    respondWithPdf(150 * KB);
    const { container } = render(<Page params={{ slug: "compress-pdf" }} />);
    chooseFile(container, 300 * KB);

    const flyout = openFlyout();
    expect(within(flyout).getByText("Your file: 300 KB")).toBeTruthy();
    // Sizes the file already fits under can't be picked.
    expect((within(flyout).getByRole("button", { name: "Under 300 KB" }) as HTMLButtonElement).disabled).toBe(true);
    expect((within(flyout).getByRole("button", { name: "Under 1 MB" }) as HTMLButtonElement).disabled).toBe(true);

    fireEvent.click(within(flyout).getByRole("button", { name: "Under 200 KB" }));

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(trigger().textContent).toContain("Under 200 KB");

    fireEvent.click(screen.getByRole("button", { name: /Convert File/ }));

    await waitFor(() => expect(mockedAuthFetch).toHaveBeenCalledTimes(2));
    expect(sentForm().get("target_kb")).toBe("200");
    expect(await screen.findByText("Under your 200 KB target.")).toBeTruthy();
    expect(screen.getByText("300.0 KB → 150.0 KB", { exact: false })).toBeTruthy();
    expect(screen.getByText("(50% smaller)")).toBeTruthy();
  });

  it("takes a custom size in MB and rejects one that is too small", async () => {
    respondWithPdf(900 * KB);
    const { container } = render(<Page params={{ slug: "compress-pdf" }} />);
    chooseFile(container, 3 * KB * KB);

    let flyout = openFlyout();
    const amount = within(flyout).getByLabelText(/Custom size/);
    fireEvent.change(amount, { target: { value: "5" } });
    fireEvent.click(within(flyout).getByRole("button", { name: "Set" }));
    expect(within(flyout).getByRole("alert").textContent).toContain("from 10 KB to 50 MB");

    fireEvent.change(amount, { target: { value: "1.5" } });
    fireEvent.change(within(flyout).getByLabelText("Unit"), { target: { value: "MB" } });
    fireEvent.click(within(flyout).getByRole("button", { name: "Set" }));
    expect(trigger().textContent).toContain("Under 1.5 MB");

    flyout = openFlyout();
    expect(within(flyout).getByText("Custom size (now 1.5 MB)")).toBeTruthy();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /Convert File/ }));
    await waitFor(() => expect(mockedAuthFetch).toHaveBeenCalledTimes(2));
    expect(sentForm().get("target_kb")).toBe("1536");
    expect(await screen.findByText("Under your 1.5 MB target.")).toBeTruthy();
  });

  it("says so when the target couldn't be reached", async () => {
    respondWithPdf(120 * KB);
    const { container } = render(<Page params={{ slug: "compress-pdf" }} />);
    chooseFile(container, 300 * KB);

    fireEvent.click(within(openFlyout()).getByRole("button", { name: "Under 50 KB" }));
    fireEvent.click(screen.getByRole("button", { name: /Convert File/ }));

    expect(
      await screen.findByText(
        "Couldn't get under 50 KB. This is the smallest it can go while the pages stay readable.",
      ),
    ).toBeTruthy();
  });

  it("closes the flyout on an outside click", () => {
    render(<Page params={{ slug: "compress-pdf" }} />);

    openFlyout();
    fireEvent.pointerDown(document.body);

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(trigger().getAttribute("aria-expanded")).toBe("false");
  });
});
