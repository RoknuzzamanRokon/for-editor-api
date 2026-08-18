"use client";

import { useState, useCallback, useRef } from "react";
import JSZip from "jszip";

type Slide = {
  paragraphs: string[];
  imageUrls: string[];
};

/** Numeric sort so slide10.xml sorts after slide2.xml, not before. */
function slideNumber(path: string): number {
  const match = path.match(/slide(\d+)\.xml$/);
  return match ? parseInt(match[1], 10) : 0;
}

/** Resolves a relationship Target (often "../media/image1.png") against the
 *  slide's own directory, since rels targets are relative to ppt/slides/. */
function resolveRelativePath(base: string, target: string): string {
  if (target.startsWith("/")) return target.slice(1);
  const baseParts = base.split("/").slice(0, -1);
  const targetParts = target.split("/");
  for (const part of targetParts) {
    if (part === "..") baseParts.pop();
    else if (part !== ".") baseParts.push(part);
  }
  return baseParts.join("/");
}

async function extractSlides(zip: JSZip): Promise<Slide[]> {
  const slidePaths = Object.keys(zip.files)
    .filter((path) => /^ppt\/slides\/slide\d+\.xml$/.test(path))
    .sort((a, b) => slideNumber(a) - slideNumber(b));

  const parser = new DOMParser();
  const slides: Slide[] = [];

  for (const slidePath of slidePaths) {
    const xmlText = await zip.file(slidePath)?.async("text");
    if (!xmlText) {
      slides.push({ paragraphs: [], imageUrls: [] });
      continue;
    }

    const doc = parser.parseFromString(xmlText, "application/xml");
    const paragraphs: string[] = [];
    for (const p of Array.from(doc.getElementsByTagName("a:p"))) {
      const text = Array.from(p.getElementsByTagName("a:t"))
        .map((node) => node.textContent ?? "")
        .join("");
      if (text.trim()) paragraphs.push(text);
    }

    const relsPath = slidePath.replace(
      /^ppt\/slides\/(slide\d+\.xml)$/,
      "ppt/slides/_rels/$1.rels",
    );
    const imageUrls: string[] = [];
    const relsText = await zip.file(relsPath)?.async("text");
    if (relsText) {
      const relsDoc = parser.parseFromString(relsText, "application/xml");
      for (const rel of Array.from(relsDoc.getElementsByTagName("Relationship"))) {
        const type = rel.getAttribute("Type") ?? "";
        const target = rel.getAttribute("Target") ?? "";
        if (!type.endsWith("/image") || !target) continue;

        const mediaPath = resolveRelativePath(slidePath, target);
        const mediaEntry = zip.file(mediaPath);
        if (!mediaEntry) continue;

        const blob = await mediaEntry.async("blob");
        imageUrls.push(URL.createObjectURL(blob));
      }
    }

    slides.push({ paragraphs, imageUrls });
  }

  return slides;
}

export default function PPTXViewer() {
  const [file, setFile] = useState<File | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [slideIndex, setSlideIndex] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const createdUrls = useRef<string[]>([]);

  const revokeCreatedUrls = () => {
    createdUrls.current.forEach((url) => URL.revokeObjectURL(url));
    createdUrls.current = [];
  };

  const onFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile || !selectedFile.name.toLowerCase().endsWith(".pptx")) {
      setError("Please select a valid PowerPoint file (.pptx)");
      return;
    }

    setFile(selectedFile);
    setError("");
    setLoading(true);
    setSlideIndex(0);

    selectedFile
      .arrayBuffer()
      .then((buffer) => JSZip.loadAsync(buffer))
      .then(extractSlides)
      .then((extractedSlides) => {
        createdUrls.current = extractedSlides.flatMap((slide) => slide.imageUrls);
        setSlides(extractedSlides);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to read PowerPoint file — it may be corrupted or unsupported");
        setLoading(false);
      });
  }, []);

  const handleClose = () => {
    revokeCreatedUrls();
    setFile(null);
    setSlides([]);
    setSlideIndex(0);
    setError("");
  };

  const goToPrevSlide = () => setSlideIndex((prev) => Math.max(0, prev - 1));
  const goToNextSlide = () => setSlideIndex((prev) => Math.min(slides.length - 1, prev + 1));

  const currentSlide = slides[slideIndex];

  return (
    <div className="flex h-full flex-col">
      {/* Upload Section */}
      {!file && (
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-800/50">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <span className="material-symbols-outlined text-5xl text-primary">
                upload_file
              </span>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-slate-800 dark:text-slate-200">
              Upload PowerPoint File
            </h3>
            <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
              Select a .pptx file to view
            </p>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-all hover:bg-primary/90">
              <span className="material-symbols-outlined">folder_open</span>
              Choose File
              <input
                type="file"
                accept=".pptx"
                onChange={onFileChange}
                className="hidden"
              />
            </label>
            {error && (
              <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
          </div>
        </div>
      )}

      {/* PPTX Viewer */}
      {file && (
        <>
          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <button
                onClick={handleClose}
                className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <span className="material-symbols-outlined text-lg">close</span>
                Close
              </button>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {file.name}
              </span>
            </div>

            {slides.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={goToPrevSlide}
                  disabled={slideIndex <= 0}
                  className="rounded-lg border border-slate-300 bg-white p-2 text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Slide {slideIndex + 1} of {slides.length}
                </span>
                <button
                  onClick={goToNextSlide}
                  disabled={slideIndex >= slides.length - 1}
                  className="rounded-lg border border-slate-300 bg-white p-2 text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            )}
          </div>

          {/* Slide Display */}
          <div className="flex-1 overflow-auto bg-slate-100 p-4 dark:bg-slate-950">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Loading slides...</p>
                </div>
              </div>
            ) : slides.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-slate-500">No slides found in this file.</p>
              </div>
            ) : (
              <div className="mx-auto aspect-video w-full max-w-4xl rounded-lg bg-white p-10 shadow-lg">
                {currentSlide.imageUrls.length > 0 && (
                  <div className="mb-6 flex flex-wrap justify-center gap-4">
                    {currentSlide.imageUrls.map((url, index) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={index}
                        src={url}
                        alt={`Slide ${slideIndex + 1} image ${index + 1}`}
                        className="max-h-64 max-w-full object-contain"
                      />
                    ))}
                  </div>
                )}
                {currentSlide.paragraphs.length > 0 ? (
                  <ul className="space-y-3">
                    {currentSlide.paragraphs.map((paragraph, index) => (
                      <li key={index} className="text-base text-black">
                        {paragraph}
                      </li>
                    ))}
                  </ul>
                ) : currentSlide.imageUrls.length === 0 ? (
                  <p className="text-sm text-slate-400">This slide has no readable text or images.</p>
                ) : null}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
