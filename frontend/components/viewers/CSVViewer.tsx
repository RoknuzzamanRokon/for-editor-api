"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import Papa from "papaparse";

const PAGE_SIZE = 50;

export default function CSVViewer() {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const tableScrollRef = useRef<HTMLDivElement>(null);
  const bottomScrollRef = useRef<HTMLDivElement>(null);
  const [scrollWidth, setScrollWidth] = useState(0);

  const onFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && (selectedFile.type === "text/csv" || selectedFile.name.endsWith(".csv"))) {
      setFile(selectedFile);
      setError("");
      setLoading(true);

      Papa.parse(selectedFile, {
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            const parsedData = results.data as string[][];
            setHeaders(parsedData[0]);
            setData(parsedData.slice(1));
            setSearchQuery("");
            setCurrentPage(1);
          }
          setLoading(false);
        },
        error: (err) => {
          setError("Failed to parse CSV file");
          setLoading(false);
        },
      });
    } else {
      setError("Please select a valid CSV file");
    }
  }, []);

  const handleClose = () => {
    setFile(null);
    setData([]);
    setHeaders([]);
    setError("");
    setSearchQuery("");
    setCurrentPage(1);
    setIsFullscreen(false);
  };

  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return data;
    return data.filter((row) =>
      row.some((cell) => String(cell ?? "").toLowerCase().includes(query))
    );
  }, [data, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));

  // Reset to page 1 whenever the search term changes.
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Keep the current page in range if the row count shrinks (e.g. after a search).
  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const pageRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [filteredRows, currentPage]);

  const rangeStart = filteredRows.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, filteredRows.length);

  // Keep the bottom scrollbar's inner spacer in sync with the table's actual width.
  useEffect(() => {
    const el = tableScrollRef.current;
    if (!el) return;

    const updateWidth = () => setScrollWidth(el.scrollWidth);
    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(el);
    return () => observer.disconnect();
  }, [pageRows, headers]);

  const syncingRef = useRef<"table" | "bottom" | null>(null);

  const handleTableScroll = () => {
    if (syncingRef.current === "bottom") {
      syncingRef.current = null;
      return;
    }
    if (bottomScrollRef.current && tableScrollRef.current) {
      syncingRef.current = "table";
      bottomScrollRef.current.scrollLeft = tableScrollRef.current.scrollLeft;
    }
  };

  const handleBottomScroll = () => {
    if (syncingRef.current === "table") {
      syncingRef.current = null;
      return;
    }
    if (tableScrollRef.current && bottomScrollRef.current) {
      syncingRef.current = "bottom";
      tableScrollRef.current.scrollLeft = bottomScrollRef.current.scrollLeft;
    }
  };

  // Let Escape exit full-screen mode.
  useEffect(() => {
    if (!isFullscreen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsFullscreen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isFullscreen]);

  return (
    <div
      className={
        isFullscreen
          ? "fixed inset-0 z-50 flex flex-col bg-white dark:bg-slate-950"
          : "flex h-full flex-col"
      }
    >
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
              Upload CSV File
            </h3>
            <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
              Select a CSV file to view
            </p>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-all hover:bg-primary/90">
              <span className="material-symbols-outlined">folder_open</span>
              Choose File
              <input
                type="file"
                accept=".csv,text/csv"
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

      {/* CSV Viewer */}
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
            <button
              onClick={() => setIsFullscreen((v) => !v)}
              className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              title={isFullscreen ? "Exit full screen" : "Full screen"}
            >
              <span className="material-symbols-outlined text-lg">
                {isFullscreen ? "fullscreen_exit" : "fullscreen"}
              </span>
              {isFullscreen ? "Exit Full Screen" : "Full Screen"}
            </button>
          </div>

          {/* Toolbar: search + pagination */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
            <div className="relative w-full max-w-xs">
              <span className="material-symbols-outlined pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-lg text-slate-400">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search this file..."
                className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-8 text-sm text-slate-800 placeholder:text-slate-400 focus:border-primary focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  title="Clear search"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {filteredRows.length === 0
                  ? "0 rows"
                  : `${rangeStart}-${rangeEnd} of ${filteredRows.length} rows`}
                {searchQuery && data.length !== filteredRows.length && (
                  <span className="text-slate-400"> (filtered from {data.length})</span>
                )}
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  <span className="material-symbols-outlined text-lg">chevron_left</span>
                  Prev
                </button>
                <span className="px-2 text-sm text-slate-600 dark:text-slate-400">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  Next
                  <span className="material-symbols-outlined text-lg">chevron_right</span>
                </button>
              </div>
            </div>
          </div>

          {/* CSV Display */}
          <div className="flex-1 overflow-hidden bg-slate-100 p-4 dark:bg-slate-950">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Loading CSV...</p>
                </div>
              </div>
            ) : pageRows.length > 0 ? (
              <div
                ref={tableScrollRef}
                onScroll={handleTableScroll}
                className="h-full overflow-auto rounded-lg bg-white shadow-lg"
              >
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="sticky top-0 bg-slate-50">
                    <tr>
                      {headers.map((header, index) => (
                        <th
                          key={index}
                          className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {pageRows.map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-slate-50">
                        {row.map((cell, cellIndex) => (
                          <td
                            key={cellIndex}
                            className="whitespace-nowrap px-6 py-4 text-sm text-slate-900"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : data.length > 0 ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  No rows match &quot;{searchQuery}&quot;
                </p>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-slate-600 dark:text-slate-400">No data in this file</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
