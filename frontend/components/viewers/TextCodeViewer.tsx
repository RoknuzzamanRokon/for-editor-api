"use client";

import { useState, useCallback, useMemo } from "react";

const ACCEPTED_EXTENSIONS = [
  ".txt", ".log", ".py", ".js", ".jsx", ".ts", ".tsx", ".java", ".c", ".cpp",
  ".h", ".hpp", ".cs", ".go", ".rb", ".php", ".sh", ".sql", ".css", ".ini",
  ".conf", ".env",
];

const isAcceptedTextFile = (file: File) =>
  ACCEPTED_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext));

export default function TextCodeViewer() {
  const [file, setFile] = useState<File | null>(null);
  const [content, setContent] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const onFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && isAcceptedTextFile(selectedFile)) {
      setFile(selectedFile);
      setError("");
      setLoading(true);

      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setContent(text);
        setLoading(false);
      };

      reader.onerror = () => {
        setError("Failed to read file");
        setLoading(false);
      };

      reader.readAsText(selectedFile);
    } else {
      setError("Please select a valid text or code file");
    }
  }, []);

  const handleClose = () => {
    setFile(null);
    setContent("");
    setError("");
  };

  const lines = useMemo(() => content.split("\n"), [content]);

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
              Upload Text or Code File
            </h3>
            <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
              Select a .txt, .log, or source code file to view
            </p>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-all hover:bg-primary/90">
              <span className="material-symbols-outlined">folder_open</span>
              Choose File
              <input
                type="file"
                accept={ACCEPTED_EXTENSIONS.join(",")}
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

      {/* Text/Code Viewer */}
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
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {lines.length} line{lines.length === 1 ? "" : "s"}
            </span>
          </div>

          {/* Text Display */}
          <div className="flex-1 overflow-auto bg-slate-100 p-4 dark:bg-slate-950">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Loading file...</p>
                </div>
              </div>
            ) : (
              <div className="mx-auto max-w-5xl overflow-hidden rounded-lg bg-white shadow-lg">
                <div className="flex overflow-x-auto font-mono text-sm">
                  <div className="select-none border-r border-slate-200 bg-slate-50 px-3 py-4 text-right text-slate-400">
                    {lines.map((_, index) => (
                      <div key={index} className="leading-6">
                        {index + 1}
                      </div>
                    ))}
                  </div>
                  <pre className="flex-1 whitespace-pre px-4 py-4 leading-6 text-black">
                    {content}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
