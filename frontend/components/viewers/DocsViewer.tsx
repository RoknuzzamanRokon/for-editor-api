"use client";

import { useState, useCallback } from "react";
import mammoth from "mammoth";

export default function DocsViewer() {
  const [file, setFile] = useState<File | null>(null);
  const [htmlContent, setHtmlContent] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const onFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && (selectedFile.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || selectedFile.name.endsWith(".docx"))) {
      setFile(selectedFile);
      setError("");
      setLoading(true);
      
      try {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        setHtmlContent(result.value);
        setLoading(false);
      } catch (err) {
        setError("Failed to load document");
        setLoading(false);
      }
    } else {
      setError("Please select a valid .docx file");
    }
  }, []);

  const handleClose = () => {
    setFile(null);
    setHtmlContent("");
    setError("");
  };

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
              Upload Word Document
            </h3>
            <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
              Select a .docx file to view
            </p>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-slate-900 transition-all hover:bg-primary/90">
              <span className="material-symbols-outlined">folder_open</span>
              Choose File
              <input
                type="file"
                accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
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

      {/* Document Viewer */}
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
          </div>

          {/* Document Display */}
          <div className="flex-1 overflow-auto bg-slate-100 p-4 dark:bg-slate-950">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Loading document...</p>
                </div>
              </div>
            ) : (
              <div className="mx-auto max-w-4xl rounded-lg bg-white p-8 shadow-lg">
                <div 
                  className="prose prose-slate max-w-none text-black"
                  dangerouslySetInnerHTML={{ __html: htmlContent }}
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
