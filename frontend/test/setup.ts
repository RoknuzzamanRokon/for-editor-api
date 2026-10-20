import { cleanup } from "@testing-library/react";
import { createElement } from "react";
import type { ImgHTMLAttributes } from "react";
import { afterEach, vi } from "vitest";

// next/image needs Next's image config at runtime; a plain <img> is enough to
// assert on src/alt in component tests.
vi.mock("next/image", () => ({
  default: ({
    fill: _fill,
    unoptimized: _unoptimized,
    ...props
  }: ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; unoptimized?: boolean }) =>
    createElement("img", props),
}));

afterEach(() => {
  cleanup();
});
